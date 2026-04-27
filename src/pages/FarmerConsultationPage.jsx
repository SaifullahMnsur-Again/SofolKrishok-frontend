import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { consultationAPI } from '../services/api';

const SHIFT_OPTIONS = [
  { value: 'morning', label: 'Morning (06:00 - 14:00)' },
  { value: 'afternoon', label: 'Afternoon (15:00 - 23:00)' },
];

export default function FarmerConsultationPage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState('morning');
  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [searchRan, setSearchRan] = useState(false);
  const [slotsForSelection, setSlotsForSelection] = useState([]);
  const [expertSlots, setExpertSlots] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const expertCards = useMemo(() => {
    const uniqueExperts = new Map();
    for (const slot of slotsForSelection) {
      if (!uniqueExperts.has(slot.expert)) {
        uniqueExperts.set(slot.expert, {
          id: String(slot.expert),
          name: slot.expert_name || `Expert #${slot.expert}`,
          availableCount: 0,
          bookedCount: 0,
        });
      }

      const entry = uniqueExperts.get(slot.expert);
      if (slot.is_available) entry.availableCount += 1;
      else entry.bookedCount += 1;
    }
    return Array.from(uniqueExperts.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [slotsForSelection]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const ticketsRes = await consultationAPI.getTickets();
      const ticketsData = ticketsRes.data.results !== undefined ? ticketsRes.data.results : ticketsRes.data;
      setTickets(ticketsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSearchExperts = async () => {
    if (!selectedDate || !selectedShift) {
      alert('Please select both date and shift before searching.');
      return;
    }

    try {
      setLoadingSearch(true);
      setSearchRan(true);
      setSelectedExpertId('');
      setExpertSlots([]);
      const slotsRes = await consultationAPI.getSlots({ date: selectedDate, shift: selectedShift });
      const slotsData = slotsRes.data.results !== undefined ? slotsRes.data.results : slotsRes.data;
      setSlotsForSelection(slotsData);
    } catch (err) {
      console.error(err);
      setSlotsForSelection([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (!selectedExpertId) {
      setExpertSlots([]);
      return;
    }

    const selected = slotsForSelection
      .filter((slot) => String(slot.expert) === String(selectedExpertId))
      .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));
    setExpertSlots(selected);
  }, [slotsForSelection, selectedExpertId]);

  const handleBook = async (slotId) => {
    try {
      const notes = window.prompt("Briefly describe what you'd like to ask the expert:");
      if (notes === null) return;
      const { data } = await consultationAPI.bookTicket({ slot_id: slotId, notes });
      alert('Successfully booked consultation slot!');
      await fetchTickets();
      if (searchRan) {
        const slotsRes = await consultationAPI.getSlots({ date: selectedDate, shift: selectedShift });
        const slotsData = slotsRes.data.results !== undefined ? slotsRes.data.results : slotsRes.data;
        setSlotsForSelection(slotsData);
      }
      if (data?.id) {
        navigate(`/consultation/room/${data.id}`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to book slot');
    }
  };

  const openRoom = (ticketId) => {
    navigate(`/consultation/room/${ticketId}`);
  };

  return (
    <div>
      <h2 style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>Expert Consultations</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Book a 20-minute live session with an agricultural expert. Slots start at :00, :20, and :40.
      </p>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <section className="card glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>My Booked Tickets</h3>
          {loadingTickets ? <p>Loading tickets...</p> : tickets.length === 0 ? <p>You have no bookings.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '10px 0' }}>Ticket ID</th>
                  <th style={{ padding: '10px 0' }}>Expert</th>
                  <th style={{ padding: '10px 0' }}>Details</th>
                  <th style={{ padding: '10px 0' }}>Status</th>
                  <th style={{ padding: '10px 0' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '10px 0' }}>#{t.id}</td>
                    <td style={{ padding: '10px 0' }}>{t.slot?.expert_name}</td>
                    <td style={{ padding: '10px 0', fontSize: '0.9rem' }}>
                      {t.slot?.date} at {t.slot?.start_time}
                    </td>
                    <td style={{ padding: '10px 0', textTransform: 'capitalize', color: 'var(--primary-color)' }}>
                      {t.status.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '10px 0' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openRoom(t.id)}>
                        Open Room
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'end', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ marginBottom: '0.35rem' }}>Take New Ticket</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Select date and shift to see available experts, then choose one expert to view bookable slots.</p>
            </div>
            <div style={{ minWidth: 220, flex: '1 1 220px' }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose date</label>
              <input
                type="date"
                className="input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ minWidth: 220, flex: '1 1 220px' }}>
              <label style={{ display: 'block', marginBottom: '0.35rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose shift</label>
              <select
                className="input"
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                style={{ width: '100%' }}
              >
                {SHIFT_OPTIONS.map((shift) => (
                  <option key={shift.value} value={shift.value}>{shift.label}</option>
                ))}
              </select>
            </div>
            <div style={{ minWidth: 240, flex: '1 1 240px' }}>
              <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={handleSearchExperts}>
                Search
              </button>
            </div>
          </div>

          {loadingSearch ? (
            <p>Loading available experts...</p>
          ) : !searchRan ? (
            <p>Select date and shift, then click Search to view available experts.</p>
          ) : expertCards.length === 0 ? (
            <p>No experts found for this date and shift.</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '1rem' }}>
              {expertCards.map((expert) => {
                const isSelected = String(selectedExpertId) === String(expert.id);
                return (
                  <button
                    key={expert.id}
                    type="button"
                    onClick={() => setSelectedExpertId(expert.id)}
                    style={{
                      textAlign: 'left',
                      border: isSelected ? '2px solid #2563eb' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      padding: '0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-color)', marginBottom: '0.25rem' }}>{expert.name}</div>
                    <div style={{ fontSize: '0.85rem', color: '#16a34a' }}>Available: {expert.availableCount}</div>
                    <div style={{ fontSize: '0.85rem', color: '#dc2626' }}>Booked: {expert.bookedCount}</div>
                  </button>
                );
              })}
            </div>
          )}

          {searchRan && expertCards.length > 0 && !selectedExpertId ? (
            <p>Choose an expert card to view 20-minute slots.</p>
          ) : null}

          {searchRan && selectedExpertId && expertSlots.length === 0 ? (
            <p>No slots found for the selected expert.</p>
          ) : null}

          {selectedExpertId && expertSlots.length > 0 && (
            <div style={{ display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {expertSlots.map((slot) => (
                <div
                  key={slot.id}
                  style={{
                    border: slot.is_available ? '1px solid #16a34a' : '1px solid #dc2626',
                    borderRadius: '10px',
                    padding: '1rem',
                    background: slot.is_available ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)',
                  }}
                >
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>{slot.expert_name || 'Dr. Expert'}</h4>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                    📅 {slot.date}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                    ⏰ {slot.start_time} - {slot.end_time}
                  </div>
                  <div style={{ fontSize: '0.85rem', marginBottom: '0.8rem', fontWeight: 600, color: slot.is_available ? '#16a34a' : '#dc2626' }}>
                    {slot.is_available ? 'Available' : 'Booked'}
                  </div>
                  <button
                    onClick={() => handleBook(slot.id)}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={!slot.is_available}
                  >
                    {slot.is_available ? 'Book & Open Room' : 'Already Booked'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
