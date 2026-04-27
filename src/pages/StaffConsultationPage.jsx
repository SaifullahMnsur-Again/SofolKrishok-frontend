import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { consultationAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const SHIFTS = ['morning', 'afternoon'];

export default function StaffConsultationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canAssignShift = [
    'service',
    'service_team_member',
    'service_team_lead',
    'branch_manager',
    'general_manager',
    'site_engineer',
    'expert',
  ].includes(user?.role);
  const [slots, setSlots] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [experts, setExperts] = useState([]);
  const [coverage, setCoverage] = useState([]);
  const [coverageDays, setCoverageDays] = useState(14);
  const [coverageZone, setCoverageZone] = useState('');
  const [coverageExpertId, setCoverageExpertId] = useState('');
  const [coverageExpertTag, setCoverageExpertTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('assignment');
  const [editingAssignment, setEditingAssignment] = useState(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'morning',
    expert: ''
  });

  const loadCoverage = async () => {
    if (!canAssignShift) {
      setCoverage([]);
      return;
    }

    try {
      const params = {
        days: coverageDays,
      };
      if (coverageZone) params.zone = coverageZone;
      if (coverageExpertId) params.expert_id = coverageExpertId;
      if (coverageExpertTag) params.expert_tag = coverageExpertTag;
      const coverageRes = await consultationAPI.getCoverage(params);
      setCoverage(coverageRes.data?.coverage || []);
    } catch (err) {
      console.error(err);
      setCoverage([]);
    }
  };

  const assignmentGroups = useMemo(() => {
    const grouped = new Map();

    for (const slot of slots) {
      const groupKey = `${slot.date}|${slot.shift}|${slot.expert}`;
      const existing = grouped.get(groupKey);
      if (existing) {
        existing.totalSlots += 1;
        if (slot.is_available) {
          existing.availableSlots += 1;
        } else {
          existing.bookedSlots += 1;
        }
        continue;
      }

      grouped.set(groupKey, {
        key: groupKey,
        date: slot.date,
        shift: slot.shift,
        expertId: slot.expert,
        expertName: slot.expert_name || `Expert #${slot.expert}`,
        totalSlots: 1,
        availableSlots: slot.is_available ? 1 : 0,
        bookedSlots: slot.is_available ? 0 : 1,
      });
    }

    return Array.from(grouped.values()).sort((a, b) => {
      const dateCompare = String(a.date).localeCompare(String(b.date));
      if (dateCompare !== 0) return dateCompare;
      const shiftOrder = { morning: 0, afternoon: 1 };
      const shiftCompare = (shiftOrder[a.shift] ?? 99) - (shiftOrder[b.shift] ?? 99);
      if (shiftCompare !== 0) return shiftCompare;
      return String(a.expertName).localeCompare(String(b.expertName));
    });
  }, [slots]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, ticketsRes] = await Promise.all([
        consultationAPI.getSlots(), // No params = all slots for this expert
        consultationAPI.getTickets()
      ]);
      const slotsData = slotsRes.data.results !== undefined ? slotsRes.data.results : slotsRes.data;
      const ticketsData = ticketsRes.data.results !== undefined ? ticketsRes.data.results : ticketsRes.data;
      setSlots(slotsData);
      setTickets(ticketsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [canAssignShift]);

  useEffect(() => {
    loadCoverage();
  }, [canAssignShift, coverageDays, coverageZone, coverageExpertId, coverageExpertTag]);

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const { data } = await authAPI.getUsers();
        const list = data.results || data;
        setExperts(list.filter((u) => u.role === 'expert'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchExperts();
  }, []);

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!canAssignShift) {
      alert('Only consultation staff can assign shifts.');
      return;
    }

    if (!formData.expert) {
      alert('Please select an expert for this shift.');
      return;
    }

    try {
      if (editingAssignment?.key) {
        const oldGroupSlots = slots.filter(
          (slot) => String(slot.date) === String(editingAssignment.date)
            && String(slot.shift) === String(editingAssignment.shift)
            && String(slot.expert) === String(editingAssignment.expertId)
        );
        await Promise.all(oldGroupSlots.map((slot) => consultationAPI.deleteSlot(slot.id)));
      }

      await consultationAPI.createSlot({
        date: formData.date,
        shift: formData.shift,
        expert: formData.expert,
      });
      setShowForm(false);
      setEditingAssignment(null);
      await Promise.all([fetchData(), loadCoverage()]);
    } catch (err) {
      const data = err?.response?.data || {};
      let fallback = 'Failed to create slot';
      if (typeof data === 'string') {
        fallback = data;
      } else if (typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstVal = firstKey ? data[firstKey] : null;
        if (Array.isArray(firstVal) && firstVal.length) fallback = String(firstVal[0]);
        else if (typeof firstVal === 'string') fallback = firstVal;
      }
      const message =
        data.expert?.[0] ||
        data.shift?.[0] ||
        data.non_field_errors?.[0] ||
        data.detail ||
        fallback;
      alert(message);
    }
  };

  const startEditingAssignment = (assignment) => {
    setActiveTab('assignment');
    setShowForm(true);
    setEditingAssignment(assignment);
    setFormData({
      date: assignment.date,
      shift: assignment.shift,
      expert: String(assignment.expertId),
    });
  };

  const handleDeleteAssignment = async (assignment) => {
    if (!canAssignShift) return;
    const confirmed = window.confirm(`Delete assignment for ${assignment.date} ${shiftShortLabel(assignment.shift)} (${assignment.expertName})?`);
    if (!confirmed) return;

    try {
      const slotsToDelete = slots.filter(
        (slot) => String(slot.date) === String(assignment.date)
          && String(slot.shift) === String(assignment.shift)
          && String(slot.expert) === String(assignment.expertId)
      );
      await Promise.all(slotsToDelete.map((slot) => consultationAPI.deleteSlot(slot.id)));
      if (editingAssignment?.key === assignment.key) {
        setEditingAssignment(null);
        setShowForm(false);
      }
      await fetchData();
      await loadCoverage();
    } catch (err) {
      alert(parseApiError(err, 'Failed to delete assignment.'));
    }
  };

  const parseApiError = (err, fallback = 'Request failed') => {
    const data = err?.response?.data || {};
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      if (data.detail) return data.detail;
      const firstKey = Object.keys(data)[0];
      const firstVal = firstKey ? data[firstKey] : null;
      if (Array.isArray(firstVal) && firstVal.length) return String(firstVal[0]);
      if (typeof firstVal === 'string') return firstVal;
    }
    return fallback;
  };

  const shiftShortLabel = (shift) => (shift === 'morning' ? 'Morning' : 'Afternoon');

  const shiftLabel = (shift) => {
    if (shift === 'morning') return 'Morning (06:00 - 14:00)';
    if (shift === 'afternoon') return 'Afternoon (15:00 - 23:00)';
    return shift;
  };

  const coverageColor = (total, loadPercent) => {
    if (!total) return '#e2e8f0';
    if (loadPercent >= 80) return '#16a34a';
    if (loadPercent >= 40) return '#f59e0b';
    return '#0ea5e9';
  };

  const downloadFile = (filename, content, contentType) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!coverage.length) {
      alert('No coverage data to export.');
      return;
    }

    const header = [
      'Date',
      'Shift',
      'Total Slots',
      'Booked Slots',
      'Available Slots',
      'Experts Assigned',
      'Load %',
    ];

    const rows = coverage.map((item) => [
      item.date,
      item.shift,
      item.total_slots,
      item.booked_slots,
      item.available_slots,
      item.expert_count,
      item.load_percent,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const stamp = new Date().toISOString().slice(0, 10);
    downloadFile(`shift-coverage-${stamp}.csv`, csv, 'text/csv;charset=utf-8;');
  };

  const handleExportPDF = () => {
    if (!coverage.length) {
      alert('No coverage data to export.');
      return;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    const filterSummary = `Days: ${coverageDays} | Zone: ${coverageZone || 'All'} | Expert: ${coverageExpertId || 'All'} | Tag: ${coverageExpertTag || 'All'}`;
    const rows = coverage
      .map(
        (item) =>
          `<tr>
            <td>${item.date}</td>
            <td>${item.shift}</td>
            <td>${item.total_slots}</td>
            <td>${item.booked_slots}</td>
            <td>${item.available_slots}</td>
            <td>${item.expert_count}</td>
            <td>${item.load_percent}%</td>
          </tr>`
      )
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Popup blocked. Please allow popups to export PDF.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Shift Coverage Report ${stamp}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111827; }
            h1 { margin-bottom: 6px; }
            p { margin-top: 0; color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>Shift Coverage Report</h1>
          <p>${filterSummary}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Total Slots</th>
                <th>Booked Slots</th>
                <th>Available Slots</th>
                <th>Experts Assigned</th>
                <th>Load %</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const availableZones = Array.from(new Set(experts.map((e) => e.zone).filter(Boolean)));
  const availableExpertTags = Array.from(
    new Set(
      experts
        .flatMap((e) => String(e.expert_tags || '').split(','))
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: 0, color: '#334155' }}>Expert Schedule Manager & Tickets ({slots.length} slots)</h3>
        </div>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary" type="button" onClick={() => setActiveTab('assignment')} style={{ background: activeTab === 'assignment' ? 'var(--primary-100)' : undefined }}>
          Assignment
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => setActiveTab('heatmap')} style={{ background: activeTab === 'heatmap' ? 'var(--primary-100)' : undefined }}>
          Heat Map
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => setActiveTab('bookings')} style={{ background: activeTab === 'bookings' ? 'var(--primary-100)' : undefined }}>
          Bookings
        </button>
      </div>

      {activeTab === 'heatmap' && !canAssignShift && (
        <div style={{ marginTop: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', padding: '1.5rem', color: '#334155' }}>
          Heat map insights are restricted to assignment roles. You can still review your bookings and open consultation rooms from the other tabs.
        </div>
      )}

      {activeTab === 'heatmap' && canAssignShift && (
        <div style={{ marginTop: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#475569' }}>Shift Coverage Heatmap (Next {coverageDays} Days)</h4>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportCSV}>Export CSV</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportPDF}>Export PDF</button>
          </div>
          <div style={{ padding: '0.9rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
            <select className="input" value={coverageDays} onChange={(e) => setCoverageDays(Number(e.target.value))}>
              <option value={7}>Next 7 days</option>
              <option value={14}>Next 14 days</option>
              <option value={30}>Next 30 days</option>
            </select>
            <select className="input" value={coverageZone} onChange={(e) => setCoverageZone(e.target.value)}>
              <option value="">All zones</option>
              {availableZones.map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
            <select className="input" value={coverageExpertId} onChange={(e) => setCoverageExpertId(e.target.value)}>
              <option value="">All experts</option>
              {experts.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.username}{ex.expert_tags ? ` (${ex.expert_tags})` : ''}
                </option>
              ))}
            </select>
            <select className="input" value={coverageExpertTag} onChange={(e) => setCoverageExpertTag(e.target.value)}>
              <option value="">All expert tags</option>
              {availableExpertTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: '0.8rem', color: '#334155' }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#e2e8f0', marginRight: 6 }} />No slots</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#0ea5e9', marginRight: 6 }} />Low load (&lt;40%)</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#f59e0b', marginRight: 6 }} />Medium load (40-79%)</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: '#16a34a', marginRight: 6 }} />High load (80%+)</span>
          </div>
          <div style={{ padding: '1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
            {coverage.map((item) => (
              <div
                key={`${item.date}-${item.shift}`}
                style={{
                  border: `1px solid ${coverageColor(item.total_slots, item.load_percent)}`,
                  borderRadius: '8px',
                  padding: '10px',
                  background: 'rgba(248, 250, 252, 0.9)',
                }}
              >
                <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.date}</div>
                <div style={{ fontSize: '0.85rem', color: '#475569', textTransform: 'capitalize' }}>{item.shift}</div>
                <div style={{ fontSize: '0.8rem', marginTop: 6, color: '#334155' }}>
                  Slots: {item.total_slots} | Booked: {item.booked_slots}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                  Experts: {item.expert_count} | Load: {item.load_percent}%
                </div>
              </div>
            ))}
            {coverage.length === 0 && (
              <div style={{ color: '#64748b' }}>No shift coverage data yet.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'assignment' && (
        <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1.25rem' }}>
          {showForm && (
            <form onSubmit={handleCreateSlot} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <h4 style={{ margin: 0 }}>{editingAssignment ? 'Update Assignment' : 'Create Assignment'}</h4>
                {editingAssignment && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingAssignment(null); setShowForm(false); }}>
                    Cancel Edit
                  </button>
                )}
              </div>
              {!canAssignShift && (
                <div style={{ padding: '8px 10px', borderRadius: '8px', background: '#fee2e2', color: '#991b1b' }}>
                  This assignment form is available to consultation staff roles.
                </div>
              )}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input type="date" className="input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required style={{ flex: 1, minWidth: 180 }} />
                <select className="input" value={formData.shift} onChange={(e) => setFormData({ ...formData, shift: e.target.value })} style={{ flex: 1, minWidth: 180 }}>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                </select>
                <select className="input" value={formData.expert} onChange={(e) => setFormData({ ...formData, expert: e.target.value })} required style={{ flex: 1, minWidth: 220 }}>
                  <option value="">Assign to expert</option>
                  {experts.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.username}{ex.expert_tags ? ` (${ex.expert_tags})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#334155' }}>
                The system creates the full 20-minute slot set for the chosen shift. No start time selection is needed.
              </div>
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={!canAssignShift}>
                {editingAssignment ? 'Update Assignment' : 'Save Assignment'}
              </button>
            </form>
          )}

          <div className="card" style={{ padding: '1.25rem', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ margin: 0 }}>Shift Assignment Overview</h4>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  Choose a date, shift, and expert. The table shows who is assigned in each shift.
                </p>
              </div>
              <button type="button" className="btn btn-primary" onClick={() => { setEditingAssignment(null); setShowForm(true); }}>
                New Assignment
              </button>
            </div>

            {assignmentGroups.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 8px', color: '#64748b' }}>Date</th>
                      <th style={{ padding: '12px 8px', color: '#64748b' }}>Shift</th>
                      <th style={{ padding: '12px 8px', color: '#64748b' }}>Expert</th>
                      <th style={{ padding: '12px 8px', color: '#64748b' }}>Slots</th>
                      <th style={{ padding: '12px 8px', color: '#64748b' }}>Availability</th>
                      <th style={{ padding: '12px 8px', color: '#64748b' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentGroups.map((assignment) => (
                      <tr key={assignment.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{assignment.date}</td>
                        <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>{assignment.shift}</td>
                        <td style={{ padding: '12px 8px' }}>{assignment.expertName}</td>
                        <td style={{ padding: '12px 8px' }}>{assignment.totalSlots}</td>
                        <td style={{ padding: '12px 8px' }}>
                          Available {assignment.availableSlots} / Booked {assignment.bookedSlots}
                        </td>
                        <td style={{ padding: '12px 8px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEditingAssignment(assignment)}>
                            Edit
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDeleteAssignment(assignment)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ color: '#64748b' }}>No assignments created yet.</div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
      <div style={{ marginTop: '1.5rem', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#475569' }}>Active Farmer Tickets</h4>
        </div>
        <div style={{ padding: '1rem' }}>
          {loading ? <p>Loading tickets...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Ticket ID</th>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Farmer</th>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Time</th>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Status</th>
                  <th style={{ padding: '12px 8px', color: '#64748b' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>#{t.id}</td>
                    <td style={{ padding: '12px 8px' }}>User ID: {t.farmer}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {t.slot?.date} {shiftLabel(t.slot?.shift)}
                    </td>
                    <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', background: t.status === 'open' ? '#dcfce7' : '#f1f5f9', color: t.status === 'open' ? '#166534' : '#475569' }}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate(`/staff/consultation/room/${t.id}`)}>
                        Open Room
                      </button>
                    </td>
                  </tr>
                ))}
                {tickets.length === 0 && <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>No active tickets.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
