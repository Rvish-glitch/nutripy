import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './ScanNew.css';

const API = 'http://localhost:8000';

export default function ScanNew({ onBack, onAdd }) {
  const [scanning, setScanning] = useState(false);
  const [quantity, setQuantity] = useState('100');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quantityRef = useRef(quantity);
  const scannerRef = useRef(null);

  useEffect(() => {
    quantityRef.current = quantity;
  }, [quantity]);

  useEffect(() => {
    if (!scanning) return;

    let stopped = false;

    const startScanner = async () => {
      const scanner = new Html5Qrcode('scanner-container');
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 60, qrbox: { width: 500, height: 300 } },
          (code) => {
            if (stopped) return;
            stopped = true;
            scanner.stop().catch(() => {});
            setScanning(false);
            handleBarcode(code);
          },
          () => {} // ignore errors on each frame
        );
      } catch (err) {
        if (!stopped) {
          console.error('Scanner error:', err);
          setError('Camera access denied. Please allow camera permission.');
          setScanning(false);
        }
      }
    };

    startScanner();

    return () => {
      stopped = true;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [scanning]);

  async function handleBarcode(barcode) {
    setLoading(true);
    setError('');
    const qty = parseFloat(quantityRef.current) || 100;

    try {
      const res = await fetch(`${API}/api/scan/${encodeURIComponent(barcode)}?quantity=${qty}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 404) {
          throw new Error(data.detail || 'Product not found');
        } else if (res.status === 503 || res.status === 504) {
          throw new Error('Network error. Please check your connection.');
        } else {
          throw new Error(data.detail || `Error: ${res.status}`);
        }
      }
      const item = await res.json();
      onAdd(item);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function startScan() {
    setError('');
    setScanning(true);
  }

  function stopScan() {
    setScanning(false);
  }

  return (
    <div className="scanner-page">
      <div className="scanner-card">
        <header className="scanner-header">
          <button className="back-btn" onClick={onBack}>←</button>
          <h1>Scan Barcode</h1>
        </header>

        <div className="scanner-content">
          <div className="quantity-row">
            <label>Quantity</label>
            <div className="quantity-input">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
              <span>g</span>
            </div>
          </div>

          <div className="viewfinder">
            <div id="scanner-container" style={{ display: scanning ? 'block' : 'none' }} />
            {!scanning && (
              <div className="placeholder">
                <span className="camera-icon">📷</span>
                <p>Tap button to start camera</p>
              </div>
            )}
          </div>

          {loading && <p className="status loading">Looking up product...</p>}
          {error && <p className="status error">{error}</p>}

          <button
            className={`primary-btn ${scanning ? 'stop' : ''}`}
            onClick={scanning ? stopScan : startScan}
            disabled={loading}
          >
            {scanning ? 'Stop Camera' : 'Start Camera'}
          </button>
        </div>
      </div>
    </div>
  );
}
