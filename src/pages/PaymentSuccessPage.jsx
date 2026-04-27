import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { financeAPI } from '../services/api';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing transaction through SSLCommerz...');

  useEffect(() => {
    const confirmPayment = async () => {
      const ref = searchParams.get('reference');
      const callbackStatus = (searchParams.get('status') || 'success').toLowerCase();
      const redirectPath = searchParams.get('redirect') || '/billing';
      if (!ref) {
        setStatus("Invalid Callback URL.");
        return;
      }

      try {
        // Trigger the IPN via frontend hit to simulate SSLCommerz Webhook Backend hit
        await financeAPI.triggerIPN({ reference_id: ref, status: callbackStatus });
        if (callbackStatus === 'success') {
          setStatus('✅ Payment Confirmed! Records and balances have been updated.');
        } else if (callbackStatus === 'failed' || callbackStatus === 'fail') {
          setStatus('❌ Payment failed at gateway. You can retry from your order or billing page.');
        } else {
          setStatus('⚠️ Payment cancelled. No debit has been completed.');
        }
        
        setTimeout(() => {
          navigate(redirectPath);
        }, 3000);

      } catch (err) {
        setStatus("❌ Verification Failed. Please contact Support.");
      }
    };
    
    // Add small delay to simulate network banking latency
    setTimeout(() => {
       confirmPayment();
    }, 1500);
  }, [searchParams, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
       <div className="card glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
          <h2>Gateway Handshake</h2>
          <div className="loading-spinner" style={{ margin: '2rem auto', width: '50px', height: '50px', display: status.includes('Processing') ? 'block' : 'none' }}></div>
          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{status}</p>
       </div>
    </div>
  );
}
