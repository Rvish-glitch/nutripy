import { useState } from "react";
import "./BMICalculator.css";

const activityMultipliers = {
  Sedentary: 1.2,
  Light: 1.375,
  Moderate: 1.55,
  Active: 1.725,
  "Very Active": 1.9,
};

export default function NutritionCalculator({ onBack }) {
  const [weight, setWeight] = useState(60);
  const [height, setHeight] = useState(174);
  const [age, setAge] = useState(22);
  const [gender, setGender] = useState("Male");
  const [activity, setActivity] = useState("Moderate");
  const [results, setResults] = useState(null);

  // ─── Maths ────────────────────────────────────────────────────────────────
  function calculate() {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);

    // BMI = weight(kg) / height(m)²
    const bmi = w / Math.pow(h / 100, 2);

    // Harris-Benedict BMR
    let bmr;
    if (gender === "Male") {
      bmr = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
    } else {
      bmr = 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;
    }

    // TDEE = BMR × activity multiplier
    const tdee = bmr * activityMultipliers[activity];

    // Macros (standard split: 40% carbs, 30% protein, 30% fat)
    const protein = Math.round((tdee * 0.16) / 4);   // 16% kcal / 4 kcal per g
    const carbs   = Math.round((tdee * 0.59) / 4);   // 59% kcal / 4 kcal per g
    const fat     = Math.round((tdee * 0.25) / 9);   // 25% kcal / 9 kcal per g

    let bmiCategory;
    if (bmi < 18.5)       bmiCategory = "Underweight";
    else if (bmi < 25)    bmiCategory = "Normal Weight";
    else if (bmi < 30)    bmiCategory = "Overweight";
    else                  bmiCategory = "Obese";

    setResults({
      bmi: bmi.toFixed(1),
      bmiCategory,
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      protein,
      carbs,
      fat,
    });
  }
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', background: '#f0f2f5', padding: '40px 20px' }}>
      <div className="nc-dialog" style={{ width: '100%', maxWidth: '720px' }}>
        {/* Header */}
        <div className="nc-header-left">
            <span className="nc-logo-icon">⊞</span>
            <h2 className="nc-title">BMI Calculator</h2>
          </div>
        <div className="nc-header">
          <button className="nc-back-btn" onClick={onBack} title="Back">&#8592; Back</button>
        </div>

        {/* Saved data badge */}
        <div className="nc-badge">
          <span className="nc-badge-dot">✔</span> Using saved data
        </div>

        {/* Inputs */}
        <div className="nc-grid-2">
          <div className="nc-field">
            <label>Weight (kg)</label>
            <div className="nc-input-wrap">
              <span className="nc-input-icon">⊟</span>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min="20" max="300"
              />
            </div>
          </div>
          <div className="nc-field">
            <label>Height (cm)</label>
            <div className="nc-input-wrap">
              <span className="nc-input-icon">↕</span>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min="50" max="250"
              />
            </div>
          </div>
        </div>

        <div className="nc-grid-2">
          <div className="nc-field">
            <label>Age</label>
            <div className="nc-input-wrap focused">
              <span className="nc-input-icon">👤</span>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1" max="120"
              />
            </div>
          </div>
          <div className="nc-field">
            <label>Gender</label>
            <div className="nc-input-wrap">
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
          </div>
        </div>

        <div className="nc-field">
          <label>Activity Level</label>
          <div className="nc-input-wrap">
            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              {Object.keys(activityMultipliers).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        {/* CTA */}
        <button className="nc-cta" onClick={calculate}>
          Calculate Nutrition
        </button>

        {/* Results */}
        {results && (
          <div className="nc-results">
            <h3 className="nc-results-title">Your Nutrition Recommendations</h3>

            <div className="nc-grid-2 nc-gap-sm">
              <div className="nc-card green">
                <div className="nc-card-header green-text">
                  <span>⊟</span> BMI
                </div>
                <div className="nc-card-value green-text">{results.bmi}</div>
                <div className="nc-card-sub">{results.bmiCategory}</div>
              </div>

              <div className="nc-card orange">
                <div className="nc-card-header orange-text">
                  <span>🔥</span> BMR
                </div>
                <div className="nc-card-value orange-text">{results.bmr} kcal</div>
                <div className="nc-card-sub">Basal Metabolic Rate</div>
              </div>
            </div>

            <div className="nc-card green nc-full">
              <div className="nc-card-header green-text">
                <span>✂</span> Daily Calories
              </div>
              <div className="nc-card-value green-text">{results.tdee} kcal</div>
              <div className="nc-card-sub">Total Daily Energy Expenditure</div>
            </div>

            <h3 className="nc-macro-title">Daily Macronutrients</h3>

            <div className="nc-macro-row">
              <div className="nc-macro pink">
                <div className="nc-macro-label pink-text">Protein</div>
                <div className="nc-macro-value pink-text">{results.protein}g</div>
              </div>
              <div className="nc-macro blue">
                <div className="nc-macro-label blue-text">Carbs</div>
                <div className="nc-macro-value blue-text">{results.carbs}g</div>
              </div>
              <div className="nc-macro yellow">
                <div className="nc-macro-label yellow-text">Fat</div>
                <div className="nc-macro-value yellow-text">{results.fat}g</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
