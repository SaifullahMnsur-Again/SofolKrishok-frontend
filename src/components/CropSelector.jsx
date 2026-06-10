import React, { useState, useEffect, useRef } from 'react';
import { cropAPI } from '../services/api';

export default function CropSelector({ value, onChange, placeholder = 'Search or suggest crop...' }) {
  const [query, setQuery] = useState('');
  const [crops, setCrops] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    // Sync external value to query if matching
    if (value && crops.length > 0) {
      const match = crops.find(c => c.id === value);
      if (match) {
        setQuery(match.name_en);
      }
    } else if (!value) {
      setQuery('');
    }
  }, [value, crops]);

  const loadCrops = async () => {
    try {
      const res = await cropAPI.getCrops();
      const list = Array.isArray(res.data?.results) ? res.data.results : (res.data || []);
      setCrops(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
        // Reset query to matched crop or clear if no match
        if (value) {
          const match = crops.find(c => c.id === value);
          setQuery(match ? match.name_en : '');
        } else {
          setQuery('');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, crops]);

  const filteredCrops = crops.filter(c => {
    const q = query.toLowerCase();
    return c.name_en.toLowerCase().includes(q) || (c.name_bn || '').toLowerCase().includes(q);
  });

  const exactMatch = crops.find(c => c.name_en.toLowerCase() === query.trim().toLowerCase());

  const handleSuggest = async () => {
    const term = query.trim();
    if (!term) return;
    setLoading(true);
    try {
      const res = await cropAPI.createCrop({ name_en: term });
      await loadCrops();
      onChange(res.data.id);
      setIsOpen(false);
    } catch (err) {
      alert(err.response?.data?.name_en?.[0] || 'Failed to suggest crop.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        className="input-field"
        style={{ width: '100%', outline: 'none' }}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
          onChange(null); // unset value while typing
        }}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'white', border: '1px solid #e2e8f0', borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 50,
          maxHeight: '200px', overflowY: 'auto', marginTop: '0.25rem'
        }}>
          {filteredCrops.map(crop => (
            <div
              key={crop.id}
              onClick={() => {
                onChange(crop.id);
                setQuery(crop.name_en);
                setIsOpen(false);
              }}
              style={{
                padding: '0.5rem 1rem', cursor: 'pointer',
                background: value === crop.id ? '#f1f5f9' : 'transparent',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
              onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
              onMouseLeave={(e) => e.target.style.background = value === crop.id ? '#f1f5f9' : 'transparent'}
            >
              <div>
                <strong>{crop.name_en}</strong>
                {crop.name_bn && <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>{crop.name_bn}</span>}
              </div>
              {!crop.is_approved && crop.is_public && (
                <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#d97706', padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>
                  Pending
                </span>
              )}
              {!crop.is_public && (
                <span style={{ fontSize: '0.7rem', background: '#e2e8f0', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>
                  Internal
                </span>
              )}
            </div>
          ))}
          {query.trim() && !exactMatch && (
            <div
              onClick={handleSuggest}
              style={{
                padding: '0.5rem 1rem', cursor: 'pointer', color: '#2563eb',
                borderTop: '1px solid #e2e8f0', textAlign: 'center', background: '#f8fafc'
              }}
            >
              {loading ? 'Adding...' : `+ Suggest "${query.trim()}" as new crop`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
