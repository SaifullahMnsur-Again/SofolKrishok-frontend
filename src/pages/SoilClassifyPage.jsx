import { useState, useRef, useEffect } from 'react';
import { soilAPI, farmingAPI } from '../services/api';

export default function SoilClassifyPage() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    farmingAPI.getLands().then(({ data }) => {
      setLands(data.results || data);
    }).catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (selectedLand) formData.append('land_id', selectedLand);
      const { data } = await soilAPI.classify(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Classification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">🌱 Soil Type Analysis</h1>
      <p className="page-subtitle">Upload a soil image to classify its type using AI</p>

      <div className="grid grid-2">
        <div className="glass-card" style={{ padding: 24 }}>
          {lands.length > 0 && (
            <div className="input-group" style={{ marginBottom: 20 }}>
              <label className="input-label">Link to Land Parcel (optional)</label>
              <select
                className="input-field"
                value={selectedLand}
                onChange={(e) => setSelectedLand(e.target.value)}
              >
                <option value="">Select a land parcel...</option>
                {lands.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                The soil type will be auto-saved to this land parcel
              </span>
            </div>
          )}

          <div
            className="upload-zone"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f?.type.startsWith('image/')) {
                setImageFile(f);
                setImagePreview(URL.createObjectURL(f));
                setResult(null);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Soil" style={{ maxHeight: 280, borderRadius: 'var(--radius-md)' }} />
            ) : (
              <>
                <div className="upload-zone-icon">🌱</div>
                <div className="upload-zone-text">Click or drag & drop a soil image here</div>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmit}
            disabled={!imageFile || loading}
            style={{ width: '100%', marginTop: 16 }}
          >
            {loading ? <span className="loading-spinner" /> : '🌱 Classify Soil'}
          </button>

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

        <div className="glass-card result-card">
          <div className="result-title">📊 Classification Results</div>
          {!result ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '80%', color: 'var(--text-muted)',
              textAlign: 'center', gap: 12,
            }}>
              <span style={{ fontSize: '3rem' }}>🌱</span>
              <div style={{ fontSize: '0.9rem' }}>Upload a soil image to see classification results</div>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <div style={{
                padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: 20,
                background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34,197,94,0.3)',
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>
                  🌱 {result.predicted_type}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Confidence: {result.confidence}%
                </div>
                {result.land_updated && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: 6 }}>
                    ✅ Land parcel soil type updated!
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 8, fontWeight: 600 }}>All Predictions</div>
              {Object.entries(result.all_predictions).slice(0, 5).map(([name, pct]) => (
                <div key={name} className="result-bar-container">
                  <div className="result-bar-label">
                    <span>{name}</span>
                    <span style={{ fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div className="result-bar">
                    <div className="result-bar-fill" style={{ width: `${pct}%` }} />
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
