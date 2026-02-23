import React from "react";
import "./History.css";

export default function History({ onBack, history = [] }) {
  const totalCalories = history.reduce((s, i) => s + (i.calories || 0), 0).toFixed(1);
  const totalProtein  = history.reduce((s, i) => s + (i.protein  || 0), 0).toFixed(1);
  const totalCarbs    = history.reduce((s, i) => s + (i.carbs    || 0), 0).toFixed(1);
  const totalFat      = history.reduce((s, i) => s + (i.fat      || 0), 0).toFixed(1);

  return (
    <div className="history-container">
      <div className="history-card">
        <div className="history-header">
          <span className="history-back-btn" onClick={onBack}>&#8592;</span>
          <span className="history-title">Nutrition Summary</span>
          <span className="history-products">{history.length} item{history.length !== 1 ? 's' : ''}</span>
        </div>

        {history.length === 0 ? (
          <div className="history-empty">
            <div className="history-empty-icon">🍽️</div>
            <p>No food added yet. Use "Add Food" to track your nutrition.</p>
          </div>
        ) : (
          <>
            <div className="history-summary">
              <div className="history-calories">
                <div className="history-calories-icon">🔥</div>
                <div>
                  <div className="history-calories-label">Total Calories</div>
                  <div className="history-calories-value">{totalCalories} kcal</div>
                </div>
              </div>
              <div className="history-macros-row">
                <div className="history-macro protein">
                  <div className="history-macro-label">Protein</div>
                  <div className="history-macro-value">{totalProtein}g</div>
                </div>
                <div className="history-macro carbs">
                  <div className="history-macro-label">Carbs</div>
                  <div className="history-macro-value">{totalCarbs}g</div>
                </div>
                <div className="history-macro fat">
                  <div className="history-macro-label">Fat</div>
                  <div className="history-macro-value">{totalFat}g</div>
                </div>
              </div>
            </div>

            <div className="history-list">
              {history.map((item, idx) => (
                <div className="history-list-item" key={idx}>
                  <div className="history-list-icon">🍽️</div>
                  <div className="history-list-details">
                    <div className="history-list-title">{item.name}</div>
                    <div className="history-list-qty">{item.quantity}g &nbsp;·&nbsp; {item.calories} kcal</div>
                    <div className="history-list-time">{item.time || 'Just now'}</div>
                  </div>
                  <div className="history-list-type">{item.source || 'Manual'}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
