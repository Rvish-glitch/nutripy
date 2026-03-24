

<h1>NutriPy – Nutrition Tracking Platform</h1>


<p>
  Full-stack nutrition intelligence platform with real-time barcode ingestion, token-indexed food resolution,
  and async macro computation across 12 nutritional parameters. Designed around a write-through in-memory
  data layer for zero-latency food lookups, decoupled from third-party API availability at query time.
</p>

<div class="links">
  <a href="https://nutridev-8ef2d.web.app" target="_blank">🔗 Deployed link </a>
</div>

<div class="badges">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React.js-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white" alt="AWS S3">
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">
</div>

<h2>Architecture</h2>
<ul>
  <li>5 async REST APIs built with FastAPI — non-blocking I/O throughout using Python's <code>asyncio</code> event loop for concurrent request handling without thread contention.</li>
  <li>Food resolution layer uses an in-memory SQLite index with inverted token mapping — search queries decomposed into unigrams, matched against a pre-built postings list at startup, eliminating round-trip latency to any external system.</li>
  <li>Barcode pipeline delegates to Open Food Facts API only on cache miss; response is normalized, validated through Pydantic, and memoized for subsequent lookups — reducing egress calls under repeat scan patterns.</li>
  <li>3-layer structured error handling: timeout faults, network-level failures, and upstream API contract violations caught at separate middleware boundaries — each returning a typed error envelope rather than a naked 500.</li>
  <li>Static assets served from AWS S3 via pre-signed URLs — decouples binary storage from application compute and reduces container image bloat.</li>
</ul>

<h2>What it does</h2>
<ul>
  <li><strong>Barcode ingestion</strong> — <code>html5-qrcode</code> captures EAN-13/UPC-A codes client-side; decoded string dispatched to the scan endpoint which resolves against Open Food Facts and hydrates 12 nutritional fields.</li>
  <li><strong>Token-indexed food search</strong> — Indian food database tokenized at startup into an inverted index; queries run entirely in-process with no external dependency, supporting partial and multi-token matching.</li>
  <li><strong>Macro computation</strong> — quantity-adjusted calories, protein, carbohydrates, fat, fibre, sodium, sugar, iron, calcium, vitamin C, vitamin A, and potassium computed per serving.</li>
  <li><strong>Session-scoped meal history</strong> — food entries accumulated in a server-side session store with idempotent append semantics.</li>
  <li><strong>BMI computation</strong> — height/weight normalization with WHO classification boundaries.</li>
</ul>

<h2>API Surface</h2>
<ul>
  <li><code>GET /search?q={query}</code> — token-index lookup against Indian food records; returns ranked matches by token overlap score</li>
  <li><code>GET /barcode/{ean}</code> — upstream Open Food Facts resolution with Pydantic-normalized response envelope</li>
  <li><code>GET /nutrition/{food_id}</code> — full 12-parameter nutritional breakdown for a resolved food item</li>
  <li><code>POST /log</code> — append a food entry with quantity to the session meal store</li>
  <li><code>GET /history</code> — retrieve accumulated session entries with per-entry macro aggregation</li>
</ul>

<h2>Data Layer</h2>
<ul>
  <li>Indian food records loaded from CSV at process startup into SQLite in-memory — no disk I/O at query time.</li>
  <li>Inverted index built over food name tokens; each token maps to a postings list of food IDs — O(1) lookup per token, O(k) intersection for multi-token queries where k is the rarest token's posting list length.</li>
  <li>Open Food Facts responses memoized in-process with LRU eviction keyed on barcode string — prevents redundant upstream calls within a session.</li>
</ul>

<h2>Stack</h2>
<ul>
  <li><strong>Backend:</strong> Python 3.10, FastAPI, Uvicorn (ASGI), Pydantic</li>
  <li><strong>Data:</strong> SQLite in-memory, inverted token index, LRU response cache</li>
  <li><strong>Frontend:</strong> React 19, Vite 7, CSS Modules, html5-qrcode</li>
  <li><strong>External API:</strong> Open Food Facts (barcode resolution only)</li>
  <li><strong>Cloud:</strong> AWS S3 (asset storage), Firebase Hosting (frontend)</li>
  <li><strong>Infra:</strong> Docker</li>
</ul>

<hr>

<p class="note">Planned: persistent meal logging with PostgreSQL, user accounts with JWT auth, daily calorie targets, weekly nutrition summaries, and a food recommendation engine over historical logs.</p>

</body>
</html>
