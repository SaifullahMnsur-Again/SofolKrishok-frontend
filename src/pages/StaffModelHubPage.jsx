import React from 'react';

export default function StaffModelHubPage() {
  const models = [
    { name: 'Disease Detection (Mobile Edge)', version: '2.4.1', type: 'TensorFlow.js', status: 'Active', latency: '45ms' },
    { name: 'Soil Classification', version: '1.2.0', type: 'PyTorch/ONNX', status: 'Active', latency: '120ms' },
    { name: 'Gemini LLM Intent Mapper', version: '3.1 Flash', type: 'External API', status: 'Healthy', latency: '650ms' },
    { name: 'Speech-to-Text Parser', version: '0.9.0', type: 'Whisper Lite', status: 'Maintenance', latency: '1.2s' },
  ];

  return (
    <div className="animate-fade-in-up">
      <h3 style={{ marginTop: 0, color: '#334155' }}>AI Model Registry & Lifecycle</h3>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Manage deployed ML weights and monitor inference health across the edge and cloud nodes.
      </p>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {models.map((m, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{m.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
                Architecture: <strong>{m.type}</strong> • Version: <code>v{m.version}</code>
              </div>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.status === 'Healthy' || m.status === 'Active' ? '#10b981' : '#f59e0b' }}></span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{m.status}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>Avg Latency: {m.latency}</div>
            </div>

            <div style={{ marginLeft: '2rem' }}>
               <button className="btn btn-sm btn-secondary">Update Weights</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2.5rem', padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center' }}>
         <h4 style={{ margin: '0 0 0.5rem 0' }}>Deploy New Model Architecture</h4>
         <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Drag and drop your exported .onnx, .h5, or .tflite weights here to push to the CDN nodes.</p>
         <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Upload Weights</button>
      </div>
    </div>
  );
}
