import { Fragment, useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiModelAPI, cropAPI } from '../services/api';

const ALLOWED_ROLES = new Set(['general_manager', 'service_team_lead']);

const initialForm = {
  crop_type: '',
  display_name: '',
  model_name: '',
  version: 'v1',
  notes: '',
  is_active: true,
  model_file: null,
  indices_file: null,
};

function fileNameFromPath(path) {
  if (!path) return '-';
  const parts = String(path).split('/');
  return parts[parts.length - 1] || path;
}

function normalizeListResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function DiseaseRow({ model, onEdit, onActivate, onOffline, onDelete, busyId }) {
  const busy = busyId === model.id;

  return (
    <div className="glass-card" style={{ padding: '0.95rem', background: model.is_active ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.82)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.85rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 320px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
            <strong style={{ fontSize: '1rem' }}>{model.display_name || 'Unnamed model'}</strong>
            <span style={{ fontSize: '0.74rem', padding: '3px 8px', borderRadius: 999, background: model.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)', color: model.is_active ? '#047857' : '#475569' }}>
              {model.is_active ? 'Active' : 'Offline'}
            </span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#334155' }}>
            Crop: <strong>{model.crop_name_english || model.crop_type}</strong>
            {model.crop_name_bengali ? <span style={{ color: '#64748b' }}> ({model.crop_name_bengali})</span> : null}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Model file: {model.model_file_name || fileNameFromPath(model.model_path || model.model_file)}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Indices file: {model.indices_file_name || fileNameFromPath(model.indices_path || model.indices_file)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>
            Model path: {model.model_path || '-'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>
            Indices path: {model.indices_path || '-'}
          </div>
          {model.notes ? <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: 6 }}>{model.notes}</div> : null}
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          <button className="btn btn-sm btn-secondary" type="button" onClick={() => onEdit(model)}>
            Details
          </button>
          {!model.is_active ? (
            <button className="btn btn-sm btn-primary" type="button" onClick={() => onActivate(model.id)} disabled={busy}>
              {busy ? 'Working...' : 'Activate'}
            </button>
          ) : (
            <button className="btn btn-sm btn-ghost" type="button" onClick={() => onOffline(model.id)} disabled={busy}>
              {busy ? 'Working...' : 'Set offline'}
            </button>
          )}
          <button className="btn btn-sm btn-danger" type="button" onClick={() => onDelete(model.id, model.display_name)} disabled={busy}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Gemini Configuration Panel ────────────────────────────── */
const MODEL_EXAMPLES = [
  'gemini-2.5-pro-preview-05-06',
  'gemini-2.5-flash-preview-04-17',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-pro',
  'gemini-1.5-flash',
];

const MODEL_ROLES = [
  {
    field: 'gemini_model',
    label: 'Primary Model',
    description: 'Used for main chat, complex reasoning and detailed responses.',
    icon: '🥇',
    color: '#1d4ed8',
    bg: 'rgba(59,130,246,0.07)',
    border: 'rgba(59,130,246,0.2)',
    example: 'gemini-2.5-pro-preview-05-06',
  },
  {
    field: 'gemini_secondary_model',
    label: 'Secondary Model',
    description: 'Fallback when primary is unavailable or for lighter tasks.',
    icon: '🥈',
    color: '#0369a1',
    bg: 'rgba(14,165,233,0.07)',
    border: 'rgba(14,165,233,0.2)',
    example: 'gemini-2.5-flash-preview-04-17',
  },
  {
    field: 'gemini_tertiary_model',
    label: 'Tertiary Model',
    description: 'Final fallback — fastest and most cost-efficient option.',
    icon: '🥉',
    color: '#047857',
    bg: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.2)',
    example: 'gemini-2.0-flash-lite',
  },
];

function GeminiConfigPanel() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [models, setModels] = useState({ gemini_model: '', gemini_secondary_model: '', gemini_tertiary_model: '' });
  const [modelsSaving, setModelsSaving] = useState(false);
  const [modelsMessage, setModelsMessage] = useState('');
  const [modelsError, setModelsError] = useState('');

  const flash = (setter, msg) => { setter(msg); setTimeout(() => setter(''), 4000); };

  const loadConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await aiModelAPI.getGeminiConfig();
      setConfig(data);
      setModels({
        gemini_model: data.gemini_model || '',
        gemini_secondary_model: data.gemini_secondary_model || '',
        gemini_tertiary_model: data.gemini_tertiary_model || '',
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load Gemini configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConfig(); }, []);

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) { flash(setError, 'Please enter an API key.'); return; }
    setSaving(true);
    setError('');
    try {
      const { data } = await aiModelAPI.updateGeminiConfig({ gemini_api_key: apiKey.trim() });
      setConfig(data);
      setApiKey('');
      setShowKey(false);
      flash(setMessage, '✅ API key saved successfully.');
    } catch (err) {
      flash(setError, err.response?.data?.detail || err.response?.data?.gemini_api_key || 'Failed to save API key.');
    } finally { setSaving(false); }
  };

  const handleClearApiKey = async () => {
    if (!window.confirm('Clear the API key? Gemini features will stop working until a new key is set.')) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await aiModelAPI.updateGeminiConfig({ gemini_api_key: '' });
      setConfig(data);
      flash(setMessage, 'API key cleared.');
    } catch (err) {
      flash(setError, err.response?.data?.detail || 'Failed to clear API key.');
    } finally { setSaving(false); }
  };

  const handleSaveModels = async () => {
    setModelsSaving(true);
    setModelsError('');
    try {
      const { data } = await aiModelAPI.updateGeminiConfig(models);
      setConfig(data);
      flash(setModelsMessage, '✅ Model names saved.');
    } catch (err) {
      flash(setModelsError, err.response?.data?.detail || 'Failed to save model names.');
    } finally { setModelsSaving(false); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2.5rem' }}>
        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  const keyPresent = config?.gemini_api_key_present;
  const keyPreview = config?.gemini_api_key_preview;
  const updatedAt = config?.updated_at ? new Date(config.updated_at).toLocaleString() : null;

  return (
    <div style={{ display: 'grid', gap: '1.2rem' }}>
      {/* Header card */}
      <section className="card" style={{ padding: '1.1rem 1.3rem', background: 'rgba(255,255,255,0.93)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>✨</span>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 4px', color: '#0f172a' }}>Gemini AI Configuration</h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
              Manage the Google Gemini API key and model hierarchy used by the AI assistant, voice commands, and automated analysis.
            </p>
          </div>
          {updatedAt && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>
              Last saved: {updatedAt}
            </span>
          )}
        </div>
      </section>

      {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.25)', fontSize: '0.88rem' }}>{error}</div>}
      {message && <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#047857', border: '1px solid rgba(16,185,129,0.25)', fontSize: '0.88rem' }}>{message}</div>}

      {/* ── API Key card ── */}
      <section className="card" style={{ padding: '1.1rem 1.3rem', background: 'rgba(255,255,255,0.93)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: '1.1rem' }}>🔑</span>
          <h5 style={{ margin: 0, color: '#0f172a', fontSize: '1rem' }}>API Key</h5>
          <span style={{
            marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5,
            fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 99,
            background: keyPresent ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
            color: keyPresent ? '#047857' : '#b91c1c',
            border: `1px solid ${keyPresent ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: keyPresent ? '#10b981' : '#ef4444', display: 'inline-block' }} />
            {keyPresent ? 'Key is set' : 'No key configured'}
          </span>
        </div>

        {keyPresent && keyPreview && (
          <div style={{
            marginBottom: 14, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(248,250,252,0.98)', border: '1px solid rgba(148,163,184,0.2)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', flexShrink: 0 }}>Current key:</span>
            <code style={{ flex: 1, fontSize: '0.9rem', color: '#334155', fontFamily: 'monospace', letterSpacing: '0.06em' }}>
              {keyPreview}
            </code>
            <button type="button" className="btn btn-sm btn-danger" onClick={handleClearApiKey} disabled={saving}>
              Clear
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gap: 8 }}>
          <label className="input-label" htmlFor="gemini-api-key" style={{ fontSize: '0.82rem', color: '#64748b' }}>
            {keyPresent ? 'Replace with a new key' : 'Enter your Google Gemini API key'}
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                id="gemini-api-key"
                className="input-field"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveApiKey(); }}
                placeholder="AIza..."
                autoComplete="off"
                style={{ width: '100%', fontFamily: 'monospace', paddingRight: 44, fontSize: '0.9rem' }}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem', padding: 2 }}
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? '🙈' : '👁️'}
              </button>
            </div>
            <button type="button" className="btn btn-primary" onClick={handleSaveApiKey} disabled={saving || !apiKey.trim()} style={{ flexShrink: 0, minWidth: 90 }}>
              {saving ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : 'Save Key'}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.76rem', color: '#94a3b8' }}>
            Get your key at{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>
              Google AI Studio ↗
            </a>
          </p>
        </div>
      </section>

      {/* ── Model names card ── */}
      <section className="card" style={{ padding: '1.1rem 1.3rem', background: 'rgba(255,255,255,0.93)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: '1.1rem' }}>🤖</span>
          <h5 style={{ margin: 0, color: '#0f172a', fontSize: '1rem' }}>Model Names</h5>
        </div>
        <p style={{ margin: '0 0 12px', fontSize: '0.82rem', color: '#64748b' }}>
          Exact model identifiers sent to the Gemini API. The system tries Primary first, then Secondary, then Tertiary.
        </p>

        {/* Example chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18, alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Examples:</span>
          {MODEL_EXAMPLES.map((ex) => (
            <code key={ex} style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: 6, background: 'rgba(248,250,252,0.98)', border: '1px solid rgba(148,163,184,0.22)', color: '#475569' }}>
              {ex}
            </code>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {MODEL_ROLES.map(({ field, label, description, icon, color, bg, border, example }) => (
            <div key={field} style={{ padding: '12px 14px', borderRadius: 12, background: bg, border: `1px solid ${border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color, fontSize: '0.88rem' }}>{label}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{description}</div>
                </div>
              </div>
              <input
                className="input-field"
                type="text"
                value={models[field]}
                onChange={(e) => setModels((prev) => ({ ...prev, [field]: e.target.value }))}
                placeholder={example}
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.88rem' }}
              />
            </div>
          ))}
        </div>

        {modelsError && <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#b91c1c', fontSize: '0.85rem' }}>{modelsError}</div>}
        {modelsMessage && <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#047857', fontSize: '0.85rem' }}>{modelsMessage}</div>}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={loadConfig} disabled={modelsSaving}>Reset</button>
          <button type="button" className="btn btn-primary" onClick={handleSaveModels} disabled={modelsSaving} style={{ minWidth: 120 }}>
            {modelsSaving ? <span className="loading-spinner" style={{ width: 16, height: 16 }} /> : 'Save Models'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default function StaffModelHubPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [refreshingId, setRefreshingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [inventory, setInventory] = useState({ disease: { registry: [] }, soil: { registry: [] } });
  const [form, setForm] = useState(initialForm);
  const [editingModel, setEditingModel] = useState(null);
  const [activeTab, setActiveTab] = useState('disease-detection');
  const [hubMode, setHubMode] = useState('list');
  const [selectedIds, setSelectedIds] = useState([]);
  const [soilSelectedIds, setSoilSelectedIds] = useState([]);
  const [crops, setCrops] = useState([]);
  const [cropQuery, setCropQuery] = useState('');
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [newCrop, setNewCrop] = useState({ english_name: '', bengali_name: '' });
  const [editingCropId, setEditingCropId] = useState(null);
  const [cropEditForm, setCropEditForm] = useState({ english_name: '', bengali_name: '' });
  const [showMarkButtons, setShowMarkButtons] = useState(false);
  const [soilShowMarkButtons, setSoilShowMarkButtons] = useState(false);
  const [expandedModelId, setExpandedModelId] = useState(null);
  const [expandedSoilModelId, setExpandedSoilModelId] = useState(null);

  const diseaseList = inventory.disease?.registry || [];
  const soilList = inventory.soil?.registry || [];
  const cropList = normalizeListResponse(crops);
  const filteredCrops = cropList.filter((crop) => {
    const needle = cropQuery.trim().toLowerCase();
    if (!needle) return true;
    return String(crop.english_name || '').toLowerCase().includes(needle) || String(crop.bengali_name || '').toLowerCase().includes(needle);
  });
  const selectedCrop = cropList.find((crop) => crop.english_name === form.crop_type) || null;
  const selectedCount = selectedIds.length;
  const soilSelectedCount = soilSelectedIds.length;

  const isSelected = (id) => selectedIds.includes(id);
  const isSoilSelected = (id) => soilSelectedIds.includes(id);

  const toggleSelected = (id) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
  };

  const toggleSoilSelected = (id) => {
    setSoilSelectedIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
  };

  const clearSelection = () => setSelectedIds([]);
  const clearSoilSelection = () => setSoilSelectedIds([]);

  const cropById = (id) => cropList.find((crop) => crop.id === id) || null;

  const loadInventory = async () => {
    const res = await aiModelAPI.getModelInventory();
    setInventory(res.data || {});
  };

  const loadCrops = async () => {
    try {
      const res = await cropAPI.getCrops();
      setCrops(normalizeListResponse(res.data));
    } catch (err) {
      // ignore for now
    }
  };

  const handleCropEdit = (crop) => {
    setEditingCropId(crop.id);
    setCropEditForm({
      english_name: crop.english_name || '',
      bengali_name: crop.bengali_name || '',
    });
  };

  const cancelCropEdit = () => {
    setEditingCropId(null);
    setCropEditForm({ english_name: '', bengali_name: '' });
  };

  const handleCropSave = async () => {
    if (!editingCropId) return;
    const english_name = cropEditForm.english_name.trim();
    if (!english_name) {
      setError('Crop English name is required.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await cropAPI.updateCrop(editingCropId, {
        english_name,
        bengali_name: cropEditForm.bengali_name.trim(),
      });
      setMessage('Crop updated.');
      cancelCropEdit();
      await loadCrops();
      await refreshInventory();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to update crop.');
    } finally {
      setSaving(false);
    }
  };

  const handleCropDelete = async (crop) => {
    if (!window.confirm(`Delete crop ${crop.english_name}? This will mark linked models offline.`)) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await cropAPI.deleteCrop(crop.id);
      setMessage('Crop deleted and linked models marked offline.');
      if (form.crop_type === crop.english_name) {
        setForm((current) => ({ ...current, crop_type: '' }));
      }
      if (editingCropId === crop.id) {
        cancelCropEdit();
      }
      await loadCrops();
      await refreshInventory();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to delete crop.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        setError('');
        await loadInventory();
      } catch (err) {
        setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to load AI model hub data.');
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCrops();
  }, []);

  if (user && !ALLOWED_ROLES.has(user.role)) {
    return <Navigate to="/staff" replace />;
  }

  const refreshInventory = async () => {
    setError('');
    try {
      await loadInventory();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to refresh models.');
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingModel(null);
    setExpandedModelId(null);
    setHubMode('list');
    setShowAddCrop(false);
    const modelInput = document.getElementById('model-file');
    const indicesInput = document.getElementById('indices-file');
    if (modelInput) modelInput.value = '';
    if (indicesInput) indicesInput.value = '';
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setExpandedModelId(model.id);
    setHubMode('edit');
    setForm({
      crop_type: model.crop_type || '',
      model_name: model.model_name || model.display_name || '',
      version: model.version || 'v1',
      display_name: model.display_name || '',
      notes: model.notes || '',
      is_active: !!model.is_active,
      model_file: null,
      indices_file: null,
    });
    const modelInput = document.getElementById('model-file');
    const indicesInput = document.getElementById('indices-file');
    if (modelInput) modelInput.value = '';
    if (indicesInput) indicesInput.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (event, operation = 'disease_detection') => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (operation === 'disease_detection' && !form.crop_type.trim()) {
        throw new Error('Please choose an existing crop from the crop section first.');
      }
      if (!form.display_name.trim()) {
        throw new Error('Model name is required.');
      }

      const isEditing = !!editingModel?.id;
      const needsModelFile = !isEditing || (!editingModel?.model_file_name && !editingModel?.model_path);
      const needsIndicesFile = !isEditing || (!editingModel?.indices_file_name && !editingModel?.indices_path);

      if (needsModelFile && !form.model_file) {
        throw new Error('Please choose a model file.');
      }
      // Disease requires indices, soil doesn't
      if (operation === 'disease_detection' && needsIndicesFile && !form.indices_file) {
        throw new Error('Please choose an indices file.');
      }

      const payload = new FormData();
      payload.append('operation', operation);
      if (operation === 'disease_detection') {
        payload.append('crop_type', form.crop_type.trim());
      }
      payload.append('display_name', form.display_name.trim());
      payload.append('model_name', form.display_name.trim());
      if (form.version) payload.append('version', form.version.trim());
      payload.append('notes', form.notes || '');
      payload.append('is_active', form.is_active ? 'true' : 'false');

      if (form.model_file) {
        payload.append('model_file', form.model_file);
      }
      if (form.indices_file) {
        payload.append('indices_file', form.indices_file);
      }

      if (isEditing) {
        await aiModelAPI.updateModel(editingModel.id, payload);
        setMessage(`${operation === 'disease_detection' ? 'Disease' : 'Soil'} model updated.`);
      } else {
        await aiModelAPI.createModel(payload);
        setMessage(`${operation === 'disease_detection' ? 'Disease' : 'Soil'} model added.`);
      }

      resetForm();
      await refreshInventory();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to save model.');
    } finally {
      setSaving(false);
    }
  };

  const openAddScreen = () => {
    setEditingModel(null);
    setExpandedModelId(null);
    setHubMode('add');
    setForm({ ...initialForm, model_name: '', version: 'v1' });
    setShowAddCrop(false);
    const modelInput = document.getElementById('model-file');
    const indicesInput = document.getElementById('indices-file');
    if (modelInput) modelInput.value = '';
    if (indicesInput) indicesInput.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showList = () => {
    resetForm();
    clearSelection();
  };

  const handleBulkOffline = async (operation = 'disease_detection') => {
    const selectedSet = operation === 'disease_detection' ? selectedIds : soilSelectedIds;
    if (!selectedSet.length) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      for (const id of selectedSet) {
        await aiModelAPI.updateModel(id, { is_active: false });
      }
      setMessage('Selected models marked offline.');
      if (operation === 'disease_detection') clearSelection();
      else clearSoilSelection();
      await refreshInventory();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to mark selected models offline.');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async (operation = 'disease_detection') => {
    const selectedSet = operation === 'disease_detection' ? selectedIds : soilSelectedIds;
    if (!selectedSet.length) return;
    if (!window.confirm(`Delete ${selectedSet.length} selected model(s)?`)) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      for (const id of selectedSet) {
        await aiModelAPI.deleteModel(id);
      }
      setMessage('Selected models deleted.');
      if (operation === 'disease_detection') clearSelection();
      else clearSoilSelection();
      await refreshInventory();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to delete selected models.');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id) => {
    setRefreshingId(id);
    setError('');
    setMessage('');
    try {
      await aiModelAPI.activateModel(id);
      setMessage('Model activated.');
      await refreshInventory();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to activate model.');
    } finally {
      setRefreshingId(null);
    }
  };

  const handleOffline = async (id) => {
    setRefreshingId(id);
    setError('');
    setMessage('');
    try {
      await aiModelAPI.updateModel(id, { is_active: false });
      setMessage('Model set offline.');
      await refreshInventory();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to set model offline.');
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;

    setRefreshingId(id);
    setError('');
    setMessage('');
    try {
      await aiModelAPI.deleteModel(id);
      setMessage('Model deleted.');
      await refreshInventory();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to delete model.');
    } finally {
      setRefreshingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ display: 'grid', gap: '1.2rem' }}>
      <div>
        <h3 style={{ margin: 0, color: '#334155' }}>AI Model Hub</h3>
        <p style={{ color: '#64748b', marginBottom: 0 }}>
          Manage disease detection, soil classification, and Gemini setup. Disease model addition is active now.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('disease-detection')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'disease-detection' ? 'linear-gradient(135deg, var(--primary-500), var(--primary-600))' : 'rgba(255,255,255,0.82)',
            color: activeTab === 'disease-detection' ? '#fff' : '#334155',
            border: '1px solid rgba(148,163,184,0.24)',
          }}
        >
          Disease Detection
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('soil-classification')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'soil-classification' ? 'linear-gradient(135deg, var(--primary-500), var(--primary-600))' : 'rgba(255,255,255,0.82)',
            color: activeTab === 'soil-classification' ? '#fff' : '#334155',
            border: '1px solid rgba(148,163,184,0.24)',
          }}
        >
          Soil Classification
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gemini')}
          className="btn btn-sm"
          style={{
            background: activeTab === 'gemini' ? 'linear-gradient(135deg, var(--primary-500), var(--primary-600))' : 'rgba(255,255,255,0.82)',
            color: activeTab === 'gemini' ? '#fff' : '#334155',
            border: '1px solid rgba(148,163,184,0.24)',
          }}
        >
          Gemini
        </button>
      </div>

      {error ? <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.25)' }}>{error}</div> : null}
      {message ? <div style={{ padding: '12px 14px', borderRadius: 12, background: 'rgba(16,185,129,0.12)', color: '#047857', border: '1px solid rgba(16,185,129,0.25)' }}>{message}</div> : null}

      {activeTab === 'disease-detection' && (
        <>
          <section className="card" style={{ padding: '1.1rem', background: 'rgba(255,255,255,0.93)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: 0 }}>Existing Crops</h4>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>
                  Search and select a crop first. Bengali name is auto-linked from the English crop name.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  className="input-field"
                  style={{ minWidth: 240 }}
                  value={cropQuery}
                  onChange={(e) => setCropQuery(e.target.value)}
                  placeholder="Search crop by English or Bangla name"
                />
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowAddCrop((s) => !s)}>
                  {showAddCrop ? 'Close add crop' : 'Add crop'}
                </button>
              </div>
            </div>

            {showAddCrop ? (
              <div style={{ marginTop: '0.9rem', padding: '0.9rem', borderRadius: 14, background: 'rgba(248,250,252,0.96)', border: '1px solid rgba(148,163,184,0.22)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="crop-english-new">Crop name (english)</label>
                    <input
                      id="crop-english-new"
                      className="input-field"
                      value={newCrop.english_name}
                      onChange={(e) => setNewCrop((s) => ({ ...s, english_name: e.target.value }))}
                      placeholder="e.g. wheat"
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="crop-bangla-new">Crop name (bangla)</label>
                    <input
                      id="crop-bangla-new"
                      className="input-field"
                      value={newCrop.bengali_name}
                      onChange={(e) => setNewCrop((s) => ({ ...s, bengali_name: e.target.value }))}
                      placeholder="e.g. গম"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={async () => {
                      const english_name = newCrop.english_name.trim();
                      const bengali_name = newCrop.bengali_name.trim();
                      if (!english_name) return;
                      try {
                        const res = await cropAPI.createCrop({ english_name, bengali_name });
                        const created = res.data;
                        setCrops((cur) => [...cur, created].sort((a, b) => String(a.english_name).localeCompare(String(b.english_name))));
                        setForm((cur) => ({ ...cur, crop_type: created.english_name }));
                        setNewCrop({ english_name: '', bengali_name: '' });
                        setShowAddCrop(false);
                        setMessage('Crop added and selected.');
                      } catch (err) {
                        setError(err.response?.data?.detail || err.response?.data?.error || 'Failed to add crop.');
                      }
                    }}
                  >
                    Save crop
                  </button>
                </div>
              </div>
            ) : null}

            {editingCropId ? (
              <div style={{ marginTop: '0.9rem', padding: '0.9rem', borderRadius: 14, background: 'rgba(239,246,255,0.96)', border: '1px solid rgba(59,130,246,0.22)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="crop-english-edit">Crop name (english)</label>
                    <input
                      id="crop-english-edit"
                      className="input-field"
                      value={cropEditForm.english_name}
                      onChange={(e) => setCropEditForm((s) => ({ ...s, english_name: e.target.value }))}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label" htmlFor="crop-bangla-edit">Crop name (bangla)</label>
                    <input
                      id="crop-bangla-edit"
                      className="input-field"
                      value={cropEditForm.bengali_name}
                      onChange={(e) => setCropEditForm((s) => ({ ...s, bengali_name: e.target.value }))}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={cancelCropEdit} disabled={saving}>Cancel</button>
                  <button type="button" className="btn btn-sm btn-primary" onClick={handleCropSave} disabled={saving}>Save crop</button>
                </div>
              </div>
            ) : null}

            <div style={{ display: 'grid', gap: 10, marginTop: '0.9rem', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))' }}>
              {filteredCrops.length === 0 ? (
                <div style={{ color: '#64748b' }}>No crops found.</div>
              ) : (
                filteredCrops.map((crop) => {
                  const isSelected = form.crop_type === crop.english_name;
                  return (
                    <div
                      key={crop.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setForm((cur) => ({ ...cur, crop_type: crop.english_name }))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setForm((cur) => ({ ...cur, crop_type: crop.english_name }));
                        }
                      }}
                      style={{
                        textAlign: 'left',
                        border: isSelected ? '1px solid rgba(59,130,246,0.55)' : '1px solid rgba(148,163,184,0.18)',
                        borderRadius: 14,
                        padding: '0.9rem',
                        background: isSelected ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.92)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{crop.english_name}</div>
                          <div style={{ color: '#64748b', marginTop: 4 }}>{crop.bengali_name || '—'}</div>
                        </div>
                        <span style={{ fontSize: '0.74rem', padding: '3px 8px', borderRadius: 999, background: isSelected ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.15)', color: isSelected ? '#1d4ed8' : '#475569' }}>
                          {isSelected ? 'Selected' : 'Choose'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 10 }}>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={(event) => { event.stopPropagation(); handleCropEdit(crop); }}>Edit</button>
                        <button type="button" className="btn btn-sm btn-danger" onClick={(event) => { event.stopPropagation(); handleCropDelete(crop); }}>Delete</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {hubMode === 'list' && (
            <section className="card" style={{ padding: '1.1rem', background: 'rgba(255,255,255,0.93)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ margin: 0 }}>Disease Detection</h4>
                  <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>
                    Review the uploaded disease models and manage activation, updates, or removal.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={refreshInventory}>
                    Refresh
                  </button>
                  <button className="btn btn-primary btn-sm" type="button" onClick={openAddScreen}>
                    Add model
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: '0.9rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                  {showMarkButtons ? 'Select models (mark boxes visible)' : 'Select models with the mark boxes, then mark them offline or delete them together.'}
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setShowMarkButtons((s) => !s)}>
                    {showMarkButtons ? 'Hide mark' : 'Mark'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-sm btn-secondary" type="button" onClick={handleBulkOffline} disabled={!selectedCount || saving}>
                    Mark offline ({selectedCount})
                  </button>
                  <button className="btn btn-sm btn-danger" type="button" onClick={handleBulkDelete} disabled={!selectedCount || saving}>
                    Delete selected ({selectedCount})
                  </button>
                  {selectedCount ? (
                    <button className="btn btn-sm btn-ghost" type="button" onClick={clearSelection} disabled={saving}>
                      Clear mark
                    </button>
                  ) : null}
                </div>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '0.9rem' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>
                      <th style={{ padding: '0.85rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.18)' }}>Name</th>
                      <th style={{ padding: '0.85rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.18)' }}>Crop</th>
                      <th style={{ padding: '0.85rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.18)' }}>Version</th>
                      <th style={{ padding: '0.85rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.18)' }}>Total Size</th>
                      <th style={{ padding: '0.85rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.18)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diseaseList.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '1rem 0.75rem', color: '#64748b' }}>
                          No disease detection models have been added yet.
                        </td>
                      </tr>
                    ) : diseaseList.map((model) => {
                      const isExpanded = expandedModelId === model.id;
                      return (
                        <Fragment key={model.id}>
                          <tr style={{ background: isExpanded ? 'rgba(59,130,246,0.05)' : 'transparent' }}>
                            <td style={{ padding: '0.9rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {showMarkButtons ? (
                                  <input type="checkbox" checked={isSelected(model.id)} onChange={() => toggleSelected(model.id)} />
                                ) : null}
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{model.display_name || 'Unnamed model'}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{model.is_active ? 'Active' : 'Offline'}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.9rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                              <strong>{model.crop_name_english || model.crop_type}</strong>
                              {model.crop_name_bengali ? <span style={{ color: '#64748b' }}> ({model.crop_name_bengali})</span> : null}
                            </td>
                            <td style={{ padding: '0.9rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                              {model.version || '-'}
                            </td>
                            <td style={{ padding: '0.9rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                              {formatBytes(model.total_size_bytes)}
                            </td>
                            <td style={{ padding: '0.9rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button className="btn btn-sm btn-secondary" type="button" onClick={() => setExpandedModelId(isExpanded ? null : model.id)}>
                                  {isExpanded ? 'Close' : 'Details'}
                                </button>
                                {!model.is_active ? (
                                  <button className="btn btn-sm btn-primary" type="button" onClick={() => handleActivate(model.id)} disabled={refreshingId === model.id}>
                                    {refreshingId === model.id ? 'Working...' : 'Activate'}
                                  </button>
                                ) : (
                                  <button className="btn btn-sm btn-ghost" type="button" onClick={() => handleOffline(model.id)} disabled={refreshingId === model.id}>
                                    {refreshingId === model.id ? 'Working...' : 'Set offline'}
                                  </button>
                                )}
                                <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(model.id, model.display_name)} disabled={refreshingId === model.id}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded ? (
                            <tr key={`${model.id}-details`}>
                              <td colSpan={5} style={{ padding: '0 0.75rem 0.9rem' }}>
                                <div style={{ border: '1px solid rgba(148,163,184,0.18)', borderRadius: 14, padding: '0.95rem', background: 'rgba(248,250,252,0.96)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'grid', gap: 6, fontSize: '0.9rem', color: '#334155' }}>
                                      <div><strong>Display name:</strong> {model.display_name || '-'}</div>
                                      <div><strong>Crop:</strong> {model.crop_name_english || model.crop_type}{model.crop_name_bengali ? ` (${model.crop_name_bengali})` : ''}</div>
                                      <div><strong>Version:</strong> {model.version || '-'}</div>
                                      <div><strong>Model file:</strong> {model.model_file_name || fileNameFromPath(model.model_path || model.model_file)}</div>
                                      <div><strong>Indices file:</strong> {model.indices_file_name || fileNameFromPath(model.indices_path || model.indices_file)}</div>
                                      <div><strong>Model size:</strong> {formatBytes(model.model_file_size)}</div>
                                      <div><strong>Indices size:</strong> {formatBytes(model.indices_file_size)}</div>
                                      <div><strong>Total size:</strong> {formatBytes(model.total_size_bytes)}</div>
                                      <div><strong>Model path:</strong> {model.model_path || '-'}</div>
                                      <div><strong>Indices path:</strong> {model.indices_path || '-'}</div>
                                      <div><strong>Notes:</strong> {model.notes || '-'}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                      <button className="btn btn-sm btn-primary" type="button" onClick={() => handleEdit(model)}>
                                        Edit
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {(hubMode === 'add' || hubMode === 'edit') && (
            <section className="card" style={{ padding: '1.1rem', background: 'rgba(255,255,255,0.93)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{hubMode === 'edit' ? 'Update Disease Model Details' : 'Add Disease Model'}</h4>
                  <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>
                    {hubMode === 'edit'
                      ? 'You are editing an existing model. Save to update its details or replace files.'
                      : 'You are adding a new model. Upload the model and indices files here.'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={showList}>
                    Back to list
                  </button>
                  {hubMode === 'edit' ? (
                    <button className="btn btn-secondary btn-sm" type="button" onClick={resetForm}>
                      Cancel edit
                    </button>
                  ) : null}
                </div>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.85rem', marginTop: '0.9rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">Selected crop</label>
                    <div className="input-field" style={{ minHeight: 44, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(248,250,252,0.95)' }}>
                      {selectedCrop ? (
                        <>
                          <strong>{selectedCrop.english_name}</strong>
                          <span style={{ color: '#64748b' }}>{selectedCrop.bengali_name || '—'}</span>
                        </>
                      ) : (
                        <span style={{ color: '#94a3b8' }}>Choose a crop above to continue</span>
                      )}
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="display-name">Model name</label>
                    <input
                      id="display-name"
                      className="input-field"
                      value={form.display_name}
                      onChange={(e) => setForm((cur) => ({ ...cur, display_name: e.target.value }))}
                      placeholder="e.g. Corn disease classifier"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="version">Version</label>
                    <input
                      id="version"
                      className="input-field"
                      value={form.version || 'v1'}
                      onChange={(e) => setForm((cur) => ({ ...cur, version: e.target.value }))}
                      placeholder="e.g. v1"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="model-file">Model file</label>
                    <input
                      id="model-file"
                      className="input-field"
                      type="file"
                      accept=".h5,.keras"
                      onChange={(e) => setForm((cur) => ({ ...cur, model_file: e.target.files?.[0] || null }))}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="indices-file">Indices file</label>
                  <input
                    id="indices-file"
                    className="input-field"
                    type="file"
                    accept=".txt,.json"
                    onChange={(e) => setForm((cur) => ({ ...cur, indices_file: e.target.files?.[0] || null }))}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    className="input-field"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((cur) => ({ ...cur, notes: e.target.value }))}
                    placeholder="Optional notes"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((cur) => ({ ...cur, is_active: e.target.checked }))}
                    />
                    Set active after save
                  </label>

                  <button className="btn btn-primary" type="submit" disabled={saving || !selectedCrop}>
                    {saving ? 'Saving...' : hubMode === 'edit' ? 'Update disease model' : 'Add disease model'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </>
      )}

      {activeTab === 'soil-classification' && (
        <>
          {hubMode === 'list' && (
            <section className="card" style={{ padding: '1.1rem', background: 'rgba(255,255,255,0.93)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ margin: 0 }}>Soil Classification</h4>
                  <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>
                    Review the uploaded soil models and manage activation, updates, or removal.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={refreshInventory}>
                    Refresh
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    onClick={() => {
                      setEditingModel(null);
                      setExpandedSoilModelId(null);
                      setHubMode('add');
                      setForm({ ...initialForm, crop_type: '', model_name: '', display_name: '', version: 'v1' });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Add model
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: '0.9rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.9rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                  {soilShowMarkButtons ? 'Select models (mark boxes visible)' : 'Select models with the mark boxes, then mark them offline or delete them together.'}
                  <button type="button" className="btn btn-sm btn-ghost" onClick={() => setSoilShowMarkButtons((s) => !s)}>
                    {soilShowMarkButtons ? 'Hide mark' : 'Mark'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-sm btn-secondary" type="button" onClick={() => handleBulkOffline('soil_classification')} disabled={!soilSelectedCount || saving}>
                    Mark offline ({soilSelectedCount})
                  </button>
                  <button className="btn btn-sm btn-danger" type="button" onClick={() => handleBulkDelete('soil_classification')} disabled={!soilSelectedCount || saving}>
                    Delete selected ({soilSelectedCount})
                  </button>
                  {soilSelectedCount ? (
                    <button className="btn btn-sm btn-ghost" type="button" onClick={clearSoilSelection} disabled={saving}>
                      Clear mark
                    </button>
                  ) : null}
                </div>
              </div>

              <div style={{ overflowX: 'auto', marginTop: '0.9rem' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>
                      <th style={{ padding: '0.85rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.18)' }}>Name</th>
                      <th style={{ padding: '0.85rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.18)' }}>Version</th>
                      <th style={{ padding: '0.85rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.18)' }}>Total Size</th>
                      <th style={{ padding: '0.85rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.18)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soilList.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '1rem 0.75rem', color: '#64748b' }}>
                          No soil classification models have been added yet.
                        </td>
                      </tr>
                    ) : soilList.map((model) => {
                      const isExpanded = expandedSoilModelId === model.id;
                      return (
                        <Fragment key={model.id}>
                          <tr style={{ background: isExpanded ? 'rgba(59,130,246,0.05)' : 'transparent' }}>
                            <td style={{ padding: '0.9rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {soilShowMarkButtons ? (
                                  <input type="checkbox" checked={isSoilSelected(model.id)} onChange={() => toggleSoilSelected(model.id)} />
                                ) : null}
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{model.display_name || 'Unnamed model'}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{model.is_active ? 'Active' : 'Offline'}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.9rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                              {model.version || '-'}
                            </td>
                            <td style={{ padding: '0.9rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                              {formatBytes(model.total_size_bytes)}
                            </td>
                            <td style={{ padding: '0.9rem 0.75rem', borderBottom: '1px solid rgba(148,163,184,0.12)' }}>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button className="btn btn-sm btn-secondary" type="button" onClick={() => setExpandedSoilModelId(isExpanded ? null : model.id)}>
                                  {isExpanded ? 'Close' : 'Details'}
                                </button>
                                {!model.is_active ? (
                                  <button className="btn btn-sm btn-primary" type="button" onClick={() => handleActivate(model.id)} disabled={refreshingId === model.id}>
                                    {refreshingId === model.id ? 'Working...' : 'Activate'}
                                  </button>
                                ) : (
                                  <button className="btn btn-sm btn-ghost" type="button" onClick={() => handleOffline(model.id)} disabled={refreshingId === model.id}>
                                    {refreshingId === model.id ? 'Working...' : 'Set offline'}
                                  </button>
                                )}
                                <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDelete(model.id, model.display_name)} disabled={refreshingId === model.id}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded ? (
                            <tr key={`${model.id}-details`}>
                              <td colSpan={4} style={{ padding: '0 0.75rem 0.9rem' }}>
                                <div style={{ border: '1px solid rgba(148,163,184,0.18)', borderRadius: 14, padding: '0.95rem', background: 'rgba(248,250,252,0.96)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'grid', gap: 6, fontSize: '0.9rem', color: '#334155' }}>
                                      <div><strong>Display name:</strong> {model.display_name || '-'}</div>
                                      <div><strong>Version:</strong> {model.version || '-'}</div>
                                      <div><strong>Model file:</strong> {model.model_file_name || fileNameFromPath(model.model_path || model.model_file)}</div>
                                      <div><strong>Indices file:</strong> {model.indices_file_name || fileNameFromPath(model.indices_path || model.indices_file)}</div>
                                      <div><strong>Model size:</strong> {formatBytes(model.model_file_size)}</div>
                                      <div><strong>Indices size:</strong> {formatBytes(model.indices_file_size)}</div>
                                      <div><strong>Total size:</strong> {formatBytes(model.total_size_bytes)}</div>
                                      <div><strong>Model path:</strong> {model.model_path || '-'}</div>
                                      <div><strong>Indices path:</strong> {model.indices_path || '-'}</div>
                                      <div><strong>Notes:</strong> {model.notes || '-'}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                      <button
                                        className="btn btn-sm btn-primary"
                                        type="button"
                                        onClick={() => {
                                          setEditingModel(model);
                                          setHubMode('edit');
                                          setForm({
                                            crop_type: '',
                                            model_name: model.model_name || model.display_name || '',
                                            version: model.version || 'v1',
                                            display_name: model.display_name || '',
                                            notes: model.notes || '',
                                            is_active: !!model.is_active,
                                            model_file: null,
                                            indices_file: null,
                                          });
                                          const modelInput = document.getElementById('soil-model-file');
                                          const indicesInput = document.getElementById('soil-indices-file');
                                          if (modelInput) modelInput.value = '';
                                          if (indicesInput) indicesInput.value = '';
                                          window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {(hubMode === 'add' || hubMode === 'edit') && (
            <section className="card" style={{ padding: '1.1rem', background: 'rgba(255,255,255,0.93)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{hubMode === 'edit' ? 'Update Soil Model Details' : 'Add Soil Model'}</h4>
                  <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>
                    {hubMode === 'edit'
                      ? 'You are editing an existing model. Save to update its details or replace files.'
                      : 'You are adding a new model. Upload the model and indices files here.'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary btn-sm" type="button" onClick={() => { resetForm(); setHubMode('list'); }}>
                    Back to list
                  </button>
                  {hubMode === 'edit' ? (
                    <button className="btn btn-secondary btn-sm" type="button" onClick={resetForm}>
                      Cancel edit
                    </button>
                  ) : null}
                </div>
              </div>

              <form onSubmit={(e) => handleSubmit(e, 'soil_classification')} style={{ display: 'grid', gap: '0.85rem', marginTop: '0.9rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="soil-display-name">Model name</label>
                    <input
                      id="soil-display-name"
                      className="input-field"
                      value={form.display_name}
                      onChange={(e) => setForm((cur) => ({ ...cur, display_name: e.target.value }))}
                      placeholder="e.g. Soil classifier"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="soil-version">Version</label>
                    <input
                      id="soil-version"
                      className="input-field"
                      value={form.version || 'v1'}
                      onChange={(e) => setForm((cur) => ({ ...cur, version: e.target.value }))}
                      placeholder="e.g. v1"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="soil-model-file">Model file</label>
                    <input
                      id="soil-model-file"
                      className="input-field"
                      type="file"
                      accept=".h5,.keras"
                      onChange={(e) => setForm((cur) => ({ ...cur, model_file: e.target.files?.[0] || null }))}
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="soil-indices-file">Indices file</label>
                    <input
                      id="soil-indices-file"
                      className="input-field"
                      type="file"
                      accept=".txt,.json"
                      onChange={(e) => setForm((cur) => ({ ...cur, indices_file: e.target.files?.[0] || null }))}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="soil-notes">Notes</label>
                  <textarea
                    id="soil-notes"
                    className="input-field"
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm((cur) => ({ ...cur, notes: e.target.value }))}
                    placeholder="Optional notes"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm((cur) => ({ ...cur, is_active: e.target.checked }))}
                    />
                    Set active after save
                  </label>

                  <button className="btn btn-primary" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : hubMode === 'edit' ? 'Update soil model' : 'Add soil model'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </>
      )}

      {activeTab === 'gemini' && <GeminiConfigPanel />}

    </div>
  );
}