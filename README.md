# 🥗 NutriDev — Nutrition Tracking App

> A smart nutrition tracker that lets you scan barcodes, search Indian foods, calculate BMI, and log your daily meals.

🔗 Deployment link:  https://nutridev-8ef2d.web.app

---

## ✨ Features

- **📷 Barcode Scanner** — Scan packaged food barcodes to instantly fetch nutrition data via Open Food Facts API
- **🍛 Add Food** — Search from an Indian food database and log meals with custom quantities
- **📊 Food Details** — View a dedicated breakdown page showing calories, protein, carbs, and fat after each scan
- **📅 History** — Track all foods added during your session
- **⚖️ BMI Calculator** — Quickly calculate your Body Mass Index

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, CSS Modules |
| Backend | Python, FastAPI, Uvicorn |
| Barcode Scanning | html5-qrcode |
| Nutrition API | Open Food Facts |
| Data | Indian Food Nutrition CSV |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+


## 📁 Project Structure

```
nutripy/
├── backend/
│   ├── api.py              # FastAPI server
│   ├── indian_foods.csv    # Indian food nutrition database
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main app with page routing
│   │   ├── ScanNew.jsx     # Barcode scanner page
│   │   ├── FoodDetails.jsx # Nutrition details after scan
│   │   ├── AddFood.jsx     # Manual food search & add
│   │   ├── History.jsx     # Meal history
│   │   └── BMICalculator.jsx
│   └── package.json
└── README.md
```

---

