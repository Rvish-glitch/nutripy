
import React, { useState } from 'react';
import AddFood from './AddFood';
import BMICalculator from './BMICalculator';
import History from './History';
import ScanNew from './ScanNew';
import FoodDetails from './FoodDetails';
import './App.css';

function App() {
  const [showAddFood, setShowAddFood] = useState(false);
  const [showBMICalc, setShowBMICalc] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showScanNew, setShowScanNew] = useState(false);
  const [showFoodDetails, setShowFoodDetails] = useState(false);
  const [scannedFood, setScannedFood] = useState(null);
  const [history, setHistory] = useState([]);

  function handleAddFood(item) {
    setHistory(prev => [{ ...item, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...prev]);
  }

  function handleScanComplete(item) {
    handleAddFood(item);
    setScannedFood(item);
    setShowScanNew(false);
    setShowFoodDetails(true);
  }

  function handleScanAnother() {
    setShowFoodDetails(false);
    setScannedFood(null);
    setShowScanNew(true);
  }

  if (showFoodDetails && scannedFood) {
    return (
      <FoodDetails
        food={scannedFood}
        onBack={() => { setShowFoodDetails(false); setScannedFood(null); }}
        onScanAnother={handleScanAnother}
      />
    );
  }
  if (showScanNew) {
    return <ScanNew onBack={() => setShowScanNew(false)} onAdd={handleScanComplete} />;
  }
  if (showBMICalc) {
    return <BMICalculator onBack={() => setShowBMICalc(false)} />;
  }
  if (showHistory) {
    return <History onBack={() => setShowHistory(false)} history={history} />;
  }
  return (
    <div className="container">
      {/* Header */}
      <div className="header-card">
        <div className="header-text">
          <div className="greeting">Hello 👋</div>
          <div className="title">Welcome to NutriDev</div>
        </div>
        <button className="avatar-btn" aria-label="Profile">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </button>
      </div>

      {/* Insights Label */}
      <div className="section-label">Your Insights</div>

      {/* Grid */}
      <div className="grid">
        {/* Scan New */}
        <div className="action-card" onClick={() => setShowScanNew(true)} style={{ cursor: 'pointer' }}>
          <div className="icon-wrap scan">
            <svg viewBox="0 0 24 24" fill="none" stroke="#4a7aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
              <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
              <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
              <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
              <rect x="7" y="7" width="10" height="10" rx="1"/>
            </svg>
          </div>
          <span className="card-label">Scan New</span>
        </div>

        {/* Add Food */}
        <div className="action-card" onClick={() => setShowAddFood(true)} style={{ cursor: 'pointer' }}>
          <div className="icon-wrap food">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a2133" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l19-9-9 19-2-8-8-2z"/>
            </svg>
          </div>
          <span className="card-label">Add Food</span>
        </div>

        {/* History */}
        <div className="action-card" onClick={() => setShowHistory(true)} style={{ cursor: 'pointer' }}>
          <div className="icon-wrap history">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#ff6b8a"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="#4a7aff"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="#4a7aff"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="#ff6b8a"/>
            </svg>
          </div>
          <span className="card-label">History</span>
        </div>

        {/* BMI Calculator */}
        <div className="action-card" onClick={() => setShowBMICalc(true)} style={{ cursor: 'pointer' }}>
          <div className="icon-wrap bmi">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a2133" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M12 8v4l3 3"/>
              <circle cx="12" cy="12" r="1" fill="#1a2133"/>
            </svg>
          </div>
          <span className="card-label">BMI Calculator</span>
        </div>
      </div>

      {showAddFood && <AddFood onClose={() => setShowAddFood(false)} onAdd={handleAddFood} />}
    </div>
  );
}

export default App
