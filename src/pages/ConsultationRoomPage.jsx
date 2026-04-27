import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ConsultationRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data } = await consultationAPI.getTicket(id);
        setTicket(data);
        if (data.status === 'booked' && user.role === 'expert') {
           await consultationAPI.startSession(id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id, user.role]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([...messages, { sender: user.username, text: newMessage }]);
    setNewMessage('');
  };

  const handleCompletePlan = async () => {
    try {
      await consultationAPI.completeSession(id, summary);
      alert("Consultation room closed successfully.");
      navigate(user.role === 'expert' ? '/staff/consultation' : '/consultation');
    } catch (err) {
      alert("Failed to close consultation room.");
    }
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (!ticket) return <div>Ticket not found or unauthorized.</div>;

  return (
    <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(300px, 1fr)', gap: '2rem', height: 'calc(100vh - 160px)' }}>
      {/* Main Chat Area */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>Consultation with {user.role === 'expert' ? (ticket.farmer_name || 'Farmer') : 'Dr. ' + (ticket.expert_name || 'Consultant')}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket #{id}</span>
            <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Slot time indicates expected contact window, but this room stays open until farmer or expert closes it.
            </p>
          </div>
          <div style={{ padding: '8px 14px', background: '#eff6ff', borderRadius: '8px', color: '#1d4ed8', fontWeight: 600 }}>
            {ticket.slot?.start_time} - {ticket.slot?.end_time}
          </div>
        </div>

        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No messages yet. Start the conversation when ready.</div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ 
              alignSelf: m.sender === user.username ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              padding: '10px 14px',
              borderRadius: '12px',
              background: m.sender === user.username ? 'var(--primary-color)' : 'rgba(0,0,0,0.05)',
              color: m.sender === user.username ? 'white' : 'inherit'
            }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: '2px' }}>{m.sender}</div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} style={{ padding: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '1rem' }}>
          <input 
            className="input" 
            placeholder="Type your message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            style={{ flex: 1 }} 
          />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>

      {/* Right Sidebar: Practitioner Notes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0' }}>Patient Context</h4>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <strong>Farmer Notes:</strong>
            <p style={{ marginTop: '0.5rem' }}>{ticket.notes || "No initial notes provided."}</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', flex: 1 }}>
          <h4 style={{ margin: '0 0 1rem 0' }}>{user.role === 'expert' ? 'Prescription & Summary' : 'Practitioner Advice'}</h4>
          <textarea 
            className="input" 
            placeholder={user.role === 'expert' ? "Type consultation summary and next steps..." : "Summary can be entered by the expert and reviewed here."}
            value={summary}
            onChange={e => setSummary(e.target.value)}
            readOnly={user.role !== 'expert'}
            style={{ width: '100%', height: 'calc(100% - 140px)', resize: 'none', background: 'rgba(0,0,0,0.02)' }}
          />
          <div style={{ marginTop: '1rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={handleCompletePlan}
            >
              Close Room
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
              Farmer or expert can close this room when the issue is resolved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
