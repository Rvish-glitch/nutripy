import React, { useState, useEffect, useRef } from 'react';
import './AddFood.css';

const API = 'http://localhost:8000';

export default function AddFood({ onClose, onAdd }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState('100');
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  // Debounced search — fires 400 ms after user stops typing
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setError('');
      try {
        const res = await fetch(`${API}/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || 'Server error');
        }
        setResults(await res.json());
      } catch (e) {
        setError(e.message || 'Could not reach server.');
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function handleConfirm() {
    if (!selected) return;
    setAdding(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selected.id,
          name: selected.name,
          quantity: parseFloat(quantity) || 100,
          kcal_100g: selected.kcal_100g,
          protein_100g: selected.protein_100g,
          carbs_100g: selected.carbs_100g,
          fat_100g: selected.fat_100g,
        }),
      });
      if (!res.ok) throw new Error('Failed to add food.');
      onAdd(await res.json());
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  }

  const qty = parseFloat(quantity) || 0;
  const factor = qty / 100;

  return (
    <div className="add-food-modal-bg">
      <div className="add-food-modal">
        <div className="add-food-header">
          <span className="add-food-icon">+</span>
          <span className="add-food-title">Add Food</span>
          <button className="add-food-close" onClick={onClose}>&times;</button>
        </div>
        <div className="add-food-form">

          {/* ── Step 1: Search ── */}
          {!selected && (
            <>
              <label className="add-food-label">Search Food</label>

              <div className="add-food-search-wrap">
                <span className="add-food-search-icon">🔍</span>
                <input
                  className="add-food-search"
                  placeholder="e.g. roti, paneer, dal..."
                  value={query}
                  autoFocus
                  onChange={e => { setQuery(e.target.value); setError(''); }}
                />
                {searching && <span className="add-food-spinner">⏳</span>}
              </div>

              {/* Results list */}
              {results.length > 0 && (
                <div className="add-food-results">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className="add-food-result-item"
                      onClick={() => { setSelected(r); setError(''); }}
                    >
                      <div className="add-food-result-name">
                        {r.name}
                        {r.brand && <span className="add-food-result-brand"> · {r.brand}</span>}
                      </div>
                      <div className="add-food-result-meta">
                        {r.kcal_100g} kcal / 100g
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!searching && query.trim() && results.length === 0 && (
                <p className="add-food-no-results">No results found. Try a different name.</p>
              )}
            </>
          )}

          {/* ── Step 2: Confirm selection + set quantity ── */}
          {selected && (
            <>
              {/* Selected product card */}
              <div className="add-food-selected-card">
                <div className="add-food-selected-top">
                  <span className="add-food-selected-name">{selected.name}</span>
                  <button
                    className="add-food-change-btn"
                    onClick={() => { setSelected(null); setResults([]); }}
                  >
                    Change
                  </button>
                </div>
                {selected.brand && <div className="add-food-selected-brand">{selected.brand}</div>}
                <div className="add-food-selected-per100">Per 100g: {selected.kcal_100g} kcal · P {selected.protein_100g}g · C {selected.carbs_100g}g · F {selected.fat_100g}g</div>
              </div>

              {/* Quantity */}
              <label className="add-food-label">Quantity (g)</label>
              <div className="add-food-qty-wrap">
                <input
                  className="add-food-qty"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  autoFocus
                />
                <span className="add-food-qty-unit">g</span>
              </div>

              {/* Live nutrition preview */}
              <div className="add-food-preview">
                <div className="add-food-preview-item kcal">
                  <span>{(selected.kcal_100g * factor).toFixed(1)}</span>
                  <span>kcal</span>
                </div>
                <div className="add-food-preview-item prot">
                  <span>{(selected.protein_100g * factor).toFixed(1)}g</span>
                  <span>Protein</span>
                </div>
                <div className="add-food-preview-item carb">
                  <span>{(selected.carbs_100g * factor).toFixed(1)}g</span>
                  <span>Carbs</span>
                </div>
                <div className="add-food-preview-item fat">
                  <span>{(selected.fat_100g * factor).toFixed(1)}g</span>
                  <span>Fat</span>
                </div>
              </div>
            </>
          )}

          {error && <p className="add-food-error">{error}</p>}

          <div className="add-food-actions">
            <button className="add-food-cancel" onClick={onClose} disabled={adding}>Cancel</button>
            <button
              className="add-food-submit"
              disabled={!selected || adding}
              onClick={handleConfirm}
            >
              {adding ? 'Adding…' : 'Add to History'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
