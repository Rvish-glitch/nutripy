from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import httpx
import logging
import sqlite3
import csv
import os

logger = logging.getLogger(__name__)

# ── Local Indian food SQLite (in-memory) ─────────────────────────────────────
_local_conn: sqlite3.Connection | None = None

CSV_PATH = os.path.join(os.path.dirname(__file__), "indian_foods.csv")


def _load_local_db() -> sqlite3.Connection:
    """Load indian_foods.csv into an in-memory SQLite database."""
    conn = sqlite3.connect(":memory:", check_same_thread=False)
    conn.execute("""
        CREATE TABLE foods (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            name     TEXT,
            name_lc  TEXT,
            kcal     REAL,
            carbs    REAL,
            protein  REAL,
            fat      REAL,
            fibre    REAL,
            sodium   REAL
        )
    """)
    conn.execute("CREATE INDEX idx_name ON foods(name_lc)")
    rows = []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = (row.get("Dish Name") or "").strip()
            if not name:
                continue
            rows.append((
                name,
                name.lower(),
                float(row.get("Calories (kcal)") or 0),
                float(row.get("Carbohydrates (g)") or 0),
                float(row.get("Protein (g)") or 0),
                float(row.get("Fats (g)") or 0),
                float(row.get("Fibre (g)") or 0),
                float(row.get("Sodium (mg)") or 0),
            ))
    conn.executemany(
        "INSERT INTO foods(name,name_lc,kcal,carbs,protein,fat,fibre,sodium) VALUES(?,?,?,?,?,?,?,?)",
        rows,
    )
    conn.commit()
    logger.info("Loaded %d Indian food items into local DB", len(rows))
    return conn


def _search_local(q: str, limit: int = 8) -> list[dict]:
    """Full-text LIKE search on the local SQLite DB."""
    if _local_conn is None:
        return []
    tokens = q.lower().split()
    # All tokens must appear somewhere in the name
    where = " AND ".join(["name_lc LIKE ?"] * len(tokens))
    params = [f"%{t}%" for t in tokens]
    params.append(limit)
    rows = _local_conn.execute(
        f"SELECT id, name, kcal, carbs, protein, fat FROM foods WHERE {where} ORDER BY kcal LIMIT ?",
        params,
    ).fetchall()
    return [
        {
            "id": f"local-{r[0]}",
            "name": r[1],
            "brand": "",
            "kcal_100g": round(r[2], 1),
            "protein_100g": round(r[4], 1),
            "carbs_100g": round(r[3], 1),
            "fat_100g": round(r[5], 1),
            "source": "local",
        }
        for r in rows
    ]


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _local_conn
    if os.path.exists(CSV_PATH):
        _local_conn = _load_local_db()
    else:
        logger.warning("indian_foods.csv not found — local search disabled")
    yield
    if _local_conn:
        _local_conn.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory history store
history_store = []


class FoodRequest(BaseModel):
    name: str
    quantity: float


@app.post("/api/nutrition")
async def get_nutrition(food: FoodRequest):
    if food.quantity <= 0:
        raise HTTPException(status_code=422, detail="quantity must be greater than 0")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://world.openfoodfacts.org/cgi/search.pl",
                params={
                    "search_terms": food.name,
                    "search_simple": 1,
                    "action": "process",
                    "json": 1,
                    "page_size": 5,
                    "fields": "product_name,nutriments",
                },
            )
    except httpx.TimeoutException:
        logger.warning("Timeout fetching nutrition for %s", food.name)
        raise HTTPException(status_code=504, detail="Upstream API timed out. Try again later.")
    except httpx.ConnectError as e:
        logger.warning("Network error fetching nutrition for %s: %s", food.name, e)
        raise HTTPException(status_code=503, detail="Cannot reach nutrition API. Check network connectivity.")
    except httpx.RequestError as e:
        logger.error("Unexpected request error: %s", e)
        raise HTTPException(status_code=502, detail="Error contacting upstream API.")
    data = resp.json()
    products = data.get("products", [])
    # Pick the first product with kcal data
    product = next(
        (p for p in products if p.get("nutriments", {}).get("energy-kcal_100g")),
        products[0] if products else None,
    )
    if not product:
        raise HTTPException(status_code=404, detail="Food not found")

    nutriments = product.get("nutriments", {})
    factor = food.quantity / 100

    item = {
        "name": product.get("product_name", food.name) or food.name,
        "quantity": food.quantity,
        "calories": round((nutriments.get("energy-kcal_100g") or 0) * factor, 1),
        "protein": round((nutriments.get("proteins_100g") or 0) * factor, 1),
        "carbs": round((nutriments.get("carbohydrates_100g") or 0) * factor, 1),
        "fat": round((nutriments.get("fat_100g") or 0) * factor, 1),
        "source": "Manual",
    }
    history_store.append(item)
    return item


@app.get("/api/scan/{barcode}")
async def scan_barcode(barcode: str, quantity: float = 100):
    if quantity <= 0:
        raise HTTPException(status_code=422, detail="quantity must be greater than 0")
    if not barcode.isdigit():
        raise HTTPException(status_code=422, detail="barcode must be numeric")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
            )
    except httpx.TimeoutException:
        logger.warning("Timeout scanning barcode %s", barcode)
        raise HTTPException(status_code=504, detail="Upstream API timed out. Try again later.")
    except httpx.ConnectError as e:
        logger.warning("Network error scanning barcode %s: %s", barcode, e)
        raise HTTPException(status_code=503, detail="Cannot reach nutrition API. Check network connectivity.")
    except httpx.RequestError as e:
        logger.error("Unexpected request error: %s", e)
        raise HTTPException(status_code=502, detail="Error contacting upstream API.")
    data = resp.json()
    if data.get("status") != 1:
        raise HTTPException(
            status_code=404,
            detail=f"No product found for barcode {barcode}. It may not be in the Open Food Facts database."
        )

    product = data.get("product", {})
    name = (product.get("product_name") or "").strip()
    if not name:
        name = (product.get("product_name_en") or "").strip() or "Unknown product"
    nutriments = product.get("nutriments", {})
    factor = quantity / 100

    item = {
        "name": name,
        "brand": (product.get("brands") or "").split(",")[0].strip(),
        "quantity": quantity,
        "calories": round((nutriments.get("energy-kcal_100g") or 0) * factor, 1),
        "protein": round((nutriments.get("proteins_100g") or 0) * factor, 1),
        "carbs": round((nutriments.get("carbohydrates_100g") or 0) * factor, 1),
        "fat": round((nutriments.get("fat_100g") or 0) * factor, 1),
        "source": "Barcode",
    }
    history_store.append(item)
    return item


@app.get("/api/search")
async def search_foods(q: str, category: str = ""):
    """Search local Indian food DB only. Open Food Facts is used for barcode scanning only."""
    q = q.strip()
    if not q:
        return []
    return _search_local(q, limit=8)


class AddRequest(BaseModel):
    product_id: str
    name: str
    quantity: float
    kcal_100g: float
    protein_100g: float
    carbs_100g: float
    fat_100g: float


@app.post("/api/add")
def add_food(req: AddRequest):
    factor = req.quantity / 100
    item = {
        "name": req.name,
        "quantity": req.quantity,
        "calories": round(req.kcal_100g * factor, 1),
        "protein": round(req.protein_100g * factor, 1),
        "carbs": round(req.carbs_100g * factor, 1),
        "fat": round(req.fat_100g * factor, 1),
        "source": "Manual",
    }
    history_store.append(item)
    return item


@app.get("/api/history")
def get_history():
    return history_store


@app.delete("/api/history")
def clear_history():
    history_store.clear()
    return {"message": "History cleared"}
