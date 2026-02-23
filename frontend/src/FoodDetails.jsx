import React from 'react';
import './FoodDetails.css';

export default function FoodDetails({ food, onBack, onScanAnother }) {
  return (
    <div className="food-details-page">
      <div className="food-details-card">
        <header className="food-details-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <h1>Food Details</h1>
        </header>

        <div className="food-details-content">
          <div className="food-info">
            <div className="food-icon">🍽️</div>
            <h2 className="food-name">{food.name}</h2>
            {food.brand && <p className="food-brand">{food.brand}</p>}
            <p className="food-quantity">Quantity: {food.quantity}g</p>
          </div>

          <div className="nutrition-section">
            <h3>Nutrition Information</h3>
            <div className="nutrition-grid">
              <div className="nutrition-card calories">
                <div className="nutrition-icon">🔥</div>
                <span className="nutrition-value">{food.calories}</span>
                <span className="nutrition-label">Calories</span>
              </div>
              <div className="nutrition-card protein">
                <div className="nutrition-icon">💪</div>
                <span className="nutrition-value">{food.protein}g</span>
                <span className="nutrition-label">Protein</span>
              </div>
              <div className="nutrition-card carbs">
                <div className="nutrition-icon">🌾</div>
                <span className="nutrition-value">{food.carbs}g</span>
                <span className="nutrition-label">Carbs</span>
              </div>
              <div className="nutrition-card fat">
                <div className="nutrition-icon">🥑</div>
                <span className="nutrition-value">{food.fat}g</span>
                <span className="nutrition-label">Fat</span>
              </div>
            </div>
          </div>

          <p className="saved-message">✓ Added to history!</p>

          <div className="action-buttons">
            <button className="primary-btn" onClick={onScanAnother}>
              Scan Another
            </button>
            <button className="secondary-btn" onClick={onBack}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
