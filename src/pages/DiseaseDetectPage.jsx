import { useEffect, useMemo, useRef, useState } from 'react';
import { diseaseAPI } from '../services/api';

/* ── Emoji map ───────────────────────────────────────────────── */
const CROP_STICKERS = {
  corn: '🌽', maize: '🌽',
  potato: '🥔',
  rice: '🌾', wheat: '🌾',
  cotton: '🧵',
  sugarcane: '🎋',
  tomato: '🍅',
  chili: '🌶️', chilli: '🌶️', pepper: '🌶️',
  eggplant: '🍆', brinjal: '🍆',
  onion: '🧅',
  garlic: '🧄',
  mango: '🥭',
  banana: '🍌',
  lemon: '🍋',
  orange: '🍊',
  grape: '🍇',
  apple: '🍎',
  strawberry: '🍓',
  soybean: '🌱', soya: '🌱', lentil: '🌱',
  sunflower: '🌻',
  groundnut: '🥜', peanut: '🥜',
  mustard: '🌼',
  jute: '🌿',
  cauliflower: '🥦', cabbage: '🥦',
  spinach: '🍃',
  cucumber: '🥒', bitter: '🥒', gourd: '🥒',
  pumpkin: '🎃',
  watermelon: '🍉',
};

function getCropSticker(cropName) {
  return CROP_STICKERS[String(cropName || '').toLowerCase()] || '🌿';
}

/* ── Language detection ──────────────────────────────────────── */
// Returns 'bn' if the string contains any Bengali Unicode characters,
// 'en' if it contains Latin letters, null if empty.
function detectLang(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return null;
  return /[\u0980-\u09FF]/.test(trimmed) ? 'bn' : 'en';
}

/* ── Crop Carousel ───────────────────────────────────────────── */
function CropCarousel({ items, selected, onSelect, displayLang }) {
  const trackRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const STEP = 220;

  const slide = (dir) => {
    trackRef.current?.scrollBy({ left: dir * STEP, behavior: 'smooth' });
  };

  const onMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeft.current = trackRef.current.scrollLeft;
    trackRef.current.style.cursor = 'grabbing';
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    trackRef.current.scrollLeft = scrollLeft.current - (x - startX.current);
  };
  const stopDrag = () => {
    isDragging.current = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };

  if (items.length === 0) {
    return (
      <div style={{
        padding: '14px 4px',
        color: 'var(--text-muted)',
        fontSize: '0.88rem',
        textAlign: 'center',
      }}>
        No crops match your search.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      {/* Left arrow */}
      <button
        type="button"
        onClick={() => slide(-1)}
        aria-label="Scroll left"
        style={arrowStyle('left')}
      >‹</button>

      {/* Track */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          cursor: 'grab',
          padding: '4px 4px 6px',
        }}
      >
        {items.map((item) => {
          const isSelected = selected === item.crop_type;
          // Choose label based on detected language of search query
          const label = displayLang === 'en'
            ? item.crop_name_english
            : displayLang === 'bn'
              ? (item.crop_name_bengali || item.crop_name_english)
              : (item.crop_name_bengali || item.crop_name_english);

          return (
            <button
              key={item.crop_type}
              type="button"
              onClick={() => onSelect(item.crop_type)}
              title={`${item.crop_name_english}${item.crop_name_bengali ? ' · ' + item.crop_name_bengali : ''}`}
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
                width: 84,
                height: 78,
                borderRadius: 14,
                border: isSelected
                  ? '2px solid rgba(59,130,246,0.75)'
                  : '1.5px solid rgba(148,163,184,0.22)',
                background: isSelected
                  ? 'linear-gradient(145deg, rgba(59,130,246,0.12), rgba(99,102,241,0.08))'
                  : 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                padding: '6px 4px',
                transition: 'all 0.15s ease',
                boxShadow: isSelected
                  ? '0 0 0 3px rgba(59,130,246,0.14), 0 2px 8px rgba(59,130,246,0.12)'
                  : '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              <span style={{ fontSize: '1.7rem', lineHeight: 1 }}>{item.emoji}</span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: isSelected ? 700 : 500,
                color: isSelected ? '#1d4ed8' : '#374151',
                textAlign: 'center',
                lineHeight: 1.25,
                maxWidth: 74,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right arrow */}
      <button
        type="button"
        onClick={() => slide(1)}
        aria-label="Scroll right"
        style={arrowStyle('right')}
      >›</button>
    </div>
  );
}

function arrowStyle(side) {
  return {
    position: 'absolute',
    [side]: -14,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '1px solid rgba(148,163,184,0.3)',
    background: 'rgba(255,255,255,0.95)',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#475569',
    lineHeight: 1,
  };
}

  /* ── Main Page ─── */
export default function DiseaseDetectPage() {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [cropQuery, setCropQuery] = useState('');
  const [diseaseRegistry, setDiseaseRegistry] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const searchRef = useRef(null);
  // preferredLang only changes when user actively types — not when query is cleared
  const preferredLangRef = useRef(null);
  const [preferredLang, setPreferredLang] = useState(null); // 'en' | 'bn' | null

  useEffect(() => {
    diseaseAPI.getActiveCrops()
      .then(({ data }) => {
        const registry = Array.isArray(data?.disease?.registry)
          ? data.disease.registry
          : Array.isArray(data?.registry) ? data.registry : [];
        setDiseaseRegistry(registry);
      })
      .catch(() => setDiseaseRegistry([]));
  }, []);

  /* All unique crops from active models */
  const cropOptions = useMemo(() => {
    const grouped = new Map();
    diseaseRegistry
      .filter((m) => m?.is_active)
      .forEach((m) => {
        const key = String(m.crop_name_english || m.crop_type || '').toLowerCase();
        if (!key) return;
        if (!grouped.has(key)) {
          grouped.set(key, {
            crop_type: m.crop_name_english || m.crop_type,
            crop_name_english: m.crop_name_english || m.crop_type,
            crop_name_bengali: m.crop_name_bengali || '',
            emoji: getCropSticker(m.crop_name_english || m.crop_type),
          });
        }
      });
    return Array.from(grouped.values()).sort((a, b) =>
      (a.crop_name_bengali || a.crop_name_english)
        .localeCompare(b.crop_name_bengali || b.crop_name_english)
    );
  }, [diseaseRegistry]);

  /* queryLang: only used for the hint pill and filtering — transient */
  const queryLang = useMemo(() => detectLang(cropQuery), [cropQuery]);

  /* When user types, lock in preferredLang */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setCropQuery(val);
    const lang = detectLang(val);
    if (lang) {
      preferredLangRef.current = lang;
      setPreferredLang(lang);
    }
    // If cleared by the user (backspace to empty), reset preference too
    if (!val.trim()) {
      preferredLangRef.current = null;
      setPreferredLang(null);
    }
  };

  /* Filter crops based on query language */
  const filteredCrops = useMemo(() => {
    const q = cropQuery.trim().toLowerCase();
    if (!q) return cropOptions;
    return cropOptions.filter((c) => {
      if (queryLang === 'bn') {
        return (c.crop_name_bengali || '').toLowerCase().includes(q);
      }
      return c.crop_name_english.toLowerCase().includes(q);
    });
  }, [cropOptions, cropQuery, queryLang]);

  const selectedLabel = cropOptions.find((c) => c.crop_type === selectedCrop);

  /* Select a crop: clear the search query but DO NOT reset preferredLang */
  const handleCropSelect = (ct) => {
    setSelectedCrop(ct);
    setCropQuery('');  // clear the input text only — preferredLang stays unchanged
  };

  /* ── handlers ── */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); setResult(null); setError(''); }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); setResult(null); setError(''); }
  };
  const handleSubmit = async () => {
    if (!imageFile || !selectedCrop) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      fd.append('crop_type', selectedCrop);
      const { data } = await diseaseAPI.detect(fd);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Detection failed. Please try again.');
    } finally { setLoading(false); }
  };
  const handleReset = () => {
    setImageFile(null); setImagePreview(null); setResult(null);
    setSelectedCrop(''); setCropQuery(''); setError('');
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="page-title">🔬 Crop Disease Detection</h1>
      <p className="page-subtitle">Upload a photo of your crop to identify diseases using AI</p>

      <div className="grid grid-2">
        {/* ── Left: Controls ── */}
        <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Step 1 */}
          <div>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <h3 style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>1. Select Crop</h3>
              {selectedLabel && (
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: '0.8rem', fontWeight: 600, color: '#1d4ed8',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  borderRadius: 99, padding: '3px 10px', flexShrink: 0,
                }}>
                  {selectedLabel.emoji}&nbsp;
                  {/* badge uses stable preferredLang, not transient queryLang */}
                  {preferredLang === 'en'
                    ? selectedLabel.crop_name_english
                    : (selectedLabel.crop_name_bengali || selectedLabel.crop_name_english)}
                </span>
              )}
            </div>

            {/* Search bar */}
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <span style={{
                position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                fontSize: '0.9rem', pointerEvents: 'none', opacity: 0.45,
              }}>🔍</span>
              <input
                ref={searchRef}
                type="text"
                className="input-field"
                value={cropQuery}
                onChange={handleSearchChange}
                placeholder="Search crops… / ফসল খুঁজুন…"
                style={{ width: '100%', paddingLeft: 32, paddingRight: cropQuery ? 32 : 12, fontSize: '0.88rem' }}
              />
              {cropQuery && (
                <button
                  type="button"
                  onClick={() => { setCropQuery(''); searchRef.current?.focus(); }}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94a3b8', fontSize: '1rem', lineHeight: 1, padding: 2,
                  }}
                  aria-label="Clear search"
                >×</button>
              )}
            </div>

            {/* Language hint pill — only shown while typing */}
            {queryLang && (
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: '0.72rem', color: queryLang === 'bn' ? '#7c3aed' : '#0369a1',
                  background: queryLang === 'bn' ? 'rgba(124,58,237,0.08)' : 'rgba(3,105,161,0.08)',
                  border: `1px solid ${queryLang === 'bn' ? 'rgba(124,58,237,0.2)' : 'rgba(3,105,161,0.2)'}`,
                  borderRadius: 99, padding: '2px 8px',
                }}>
                  {queryLang === 'bn' ? '🇧🇩 বাংলায় খুঁজছেন' : '🇬🇧 Searching in English'}
                  {filteredCrops.length > 0 && ` · ${filteredCrops.length} found`}
                </span>
              </div>
            )}

            {/* Carousel */}
            <CropCarousel
              items={filteredCrops}
              selected={selectedCrop}
              onSelect={handleCropSelect}
              displayLang={preferredLang}
            />
          </div>

          {/* Step 2: Image Upload */}
          <div>
            <h3 style={{ fontWeight: 700, margin: '0 0 10px', fontSize: '0.95rem' }}>2. Upload Image</h3>
            <div
              className="upload-zone"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Crop preview"
                  style={{ maxHeight: 200, borderRadius: 'var(--radius-md)', objectFit: 'contain' }}
                />
              ) : (
                <>
                  <div className="upload-zone-icon">📷</div>
                  <div className="upload-zone-text">Click or drag &amp; drop a crop photo</div>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
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
              padding: '10px 14px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--error)', fontSize: '0.85rem',
            }}>{error}</div>
          )}
        </div>

        {/* ── Right: Results ── */}
        <div className="glass-card result-card">
          <div className="result-title">📊 Detection Results</div>
          {!result ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '80%',
              color: 'var(--text-muted)', textAlign: 'center', gap: 12,
            }}>
              <span style={{ fontSize: '3rem' }}>🔬</span>
              <div style={{ fontSize: '0.9rem' }}>Select a crop, upload an image, and click Analyze to see results</div>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <div style={{
                padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: 20,
                background: result.is_healthy ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${result.is_healthy ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>
                  {result.is_healthy ? '✅ Healthy!' : '⚠️ Disease Detected'}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{result.display_name}</div>
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
