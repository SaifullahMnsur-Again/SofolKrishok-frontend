import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { soilAPI, farmingAPI } from '../services/api';

export default function SoilClassifyPage() {
  const navigate = useNavigate();
  
  const aiContextStr = localStorage.getItem('aiContext');
  const aiContext = aiContextStr ? JSON.parse(aiContextStr) : null;
  const initialLandId = aiContext?.landId || '';

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(initialLandId);
  const [imageTakenAt, setImageTakenAt] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialLandId) {
      setSelectedLand(initialLandId);
    }
  }, [initialLandId]);

  useEffect(() => {
    farmingAPI.getLands().then(({ data }) => {
      setLands(data.results || data);
      if (initialLandId) setSelectedLand(initialLandId);
    }).catch(() => {});
  }, [initialLandId]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
      setFeedback(null);
    }
  };

  const handleSubmit = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError('');
    setResult(null);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      if (selectedLand) formData.append('land_id', selectedLand);
      if (imageTakenAt) {
        formData.append('image_taken_at', new Date(imageTakenAt).toISOString());
      }
      const { data } = await soilAPI.classify(formData);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Classification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (value) => {
    if (!result?.log_id) return;
    setFeedbackLoading(true);
    try {
      await soilAPI.submitFeedback(result.log_id, value);
      setFeedback(value);
      if (aiContext?.returnUrl) {
        setTimeout(() => {
          localStorage.removeItem('aiContext');
          navigate(aiContext.returnUrl);
        }, 1500);
      }
    } catch (err) {
      console.error('Feedback failed', err);
    } finally {
      setFeedbackLoading(false);
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
                key={`select-${selectedLand}-${lands.length}`}
                className="input-field"
                value={selectedLand}
                onChange={(e) => setSelectedLand(e.target.value)}
              >
                <option value="">Select a land parcel...</option>
                {lands.map((l) => (
                  <option key={l.id} value={String(l.id)}>{l.name}</option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                The soil type will be auto-saved to this land parcel
              </span>
            </div>
          )}

          <div className="input-group" style={{ marginBottom: 20 }}>
            <label className="input-label">Image Taken At</label>
            <input
              type="datetime-local"
              className="input-field"
              value={imageTakenAt}
              onChange={(e) => setImageTakenAt(e.target.value)}
            />
          </div>

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

              {/* Feedback Section */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>
                  Did the model classify the soil correctly?
                </div>
                {feedback ? (
                  <div style={{ padding: '12px', background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--radius-md)', color: 'var(--blue-600)', fontWeight: 600, textAlign: 'center' }}>
                    Thank you for your feedback!
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleFeedback('correct')} disabled={feedbackLoading}>
                      👍 Yes
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleFeedback('incorrect')} disabled={feedbackLoading}>
                      👎 No
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleFeedback('not_sure')} disabled={feedbackLoading}>
                      🤷 Not Sure
                    </button>
                  </div>
                )}
                {aiContext?.returnUrl && (
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: 12 }}
                    onClick={() => {
                      localStorage.removeItem('aiContext');
                      navigate(aiContext.returnUrl);
                    }}
                  >
                    Return to Land
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
