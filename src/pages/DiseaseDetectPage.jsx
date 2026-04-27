import { useState, useRef } from 'react';
import { diseaseAPI } from '../services/api';

const CROP_INFO = {
  corn: { emoji: '🌽', name: 'Corn/Maize', color: '#fbbf24' },
  potato: { emoji: '🥔', name: 'Potato', color: '#a78bfa' },
  rice: { emoji: '🌾', name: 'Rice', color: '#4ade80' },
  wheat: { emoji: '🌾', name: 'Wheat', color: '#fb923c' },
};

export default function DiseaseDetectPage() {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!imageFile || !selectedCrop) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('crop_type', selectedCrop);
      const { data } = await diseaseAPI.detect(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Detection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setSelectedCrop('');
    setError('');
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">🔬 Crop Disease Detection</h1>
      <p className="page-subtitle">Upload a photo of your crop to identify diseases using AI</p>

      <div className="grid grid-2">
        {/* Upload Section */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>1. Select Crop Type</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
            {Object.entries(CROP_INFO).map(([key, info]) => (
              <button
                key={key}
                className={`btn ${selectedCrop === key ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedCrop(key)}
                style={{ flexDirection: 'column', padding: '14px 10px', gap: 6 }}
              >
                <span style={{ fontSize: '1.5rem' }}>{info.emoji}</span>
                <span style={{ fontSize: '0.75rem' }}>{info.name}</span>
              </button>
            ))}
          </div>

          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>2. Upload Image</h3>
          <div
            className={`upload-zone ${imagePreview ? '' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Crop preview"
                style={{ maxHeight: 250, borderRadius: 'var(--radius-md)' }}
              />
            ) : (
              <>
                <div className="upload-zone-icon">📷</div>
                <div className="upload-zone-text">
                  Click or drag & drop a crop image here
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={!imageFile || !selectedCrop || loading}
              style={{ flex: 1 }}
            >
              {loading ? <span className="loading-spinner" /> : '🔬 Analyze'}
            </button>
            {(imageFile || result) && (
              <button className="btn btn-secondary" onClick={handleReset}>Reset</button>
            )}
          </div>

          {error && (
            <div style={{
              marginTop: 12, padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)',
              color: 'var(--error)', fontSize: '0.85rem'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="glass-card result-card">
          <div className="result-title">📊 Detection Results</div>
          {!result ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '80%', color: 'var(--text-muted)',
              textAlign: 'center', gap: 12,
            }}>
              <span style={{ fontSize: '3rem' }}>🔬</span>
              <div style={{ fontSize: '0.9rem' }}>
                Select a crop, upload an image, and click Analyze to see results
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <div style={{
                padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: 20,
                background: result.is_healthy
                  ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${result.is_healthy ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>
                  {result.is_healthy ? '✅ Healthy!' : '⚠️ Disease Detected'}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                  {result.display_name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Confidence: {result.confidence}%
                </div>
              </div>

              <div style={{ marginBottom: 8, fontWeight: 600 }}>All Predictions</div>
              {Object.entries(result.all_predictions).map(([name, pct]) => (
                <div key={name} className="result-bar-container">
                  <div className="result-bar-label">
                    <span>{name.replace('___', ' — ').replace(/_/g, ' ')}</span>
                    <span style={{ fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div className="result-bar">
                    <div
                      className={`result-bar-fill ${pct > 70 && name.toLowerCase().includes('healthy') ? '' : pct > 50 ? 'danger' : ''}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
