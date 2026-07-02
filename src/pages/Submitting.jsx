import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFunctionRun } from "lemma-sdk/react";
import client from "../api/client";

/**
 * Submitting — animated loading page shown while the ticket is being sent.
 * Receives form data via route state, calls the API, then redirects to confirmation.
 */
export default function Submitting() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.form;

  const [error, setError] = useState('');
  const [dots, setDots] = useState('');

  const { start: submitTicket } = useFunctionRun({ client, functionName: "customer_panel_submit_ticket" });

  // Animated dots
  useEffect(() => {
    const iv = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(iv);
  }, []);

  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!formData) {
      navigate('/submit');
      return;
    }

    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    let cancelled = false;

    (async () => {
      try {
        const response = await submitTicket({
          source: 'form',
          customer_name: formData.name,
          customer_contact: formData.email,
          category: formData.category,
          subject: formData.subject,
          body: formData.message,
        });

        if (cancelled) return;

        console.log('Submit response:', response);

        const ticketData = response?.output_data || {};
        const ticketId =
          ticketData.ticket_id ||
          ticketData.ticket?.id ||
          ticketData.id ||
          ticketData.record_id ||
          'unknown';

        navigate(`/confirmation?ticketId=${encodeURIComponent(ticketId)}`, { replace: true });
      } catch (err) {
        if (cancelled) return;
        console.error('Submit failed:', err);
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Something went wrong. Please try again.'
        );
      }
    })();

    return () => { cancelled = true; };
  }, [formData, navigate]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-accent-rose/10 border border-accent-rose/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-accent-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Submission Failed</h2>
          <p className="text-text-secondary text-sm mb-6">{error}</p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            ← Go Back & Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        {/* Orbital loader */}
        <div className="submitting-loader mx-auto mb-10">
          <div className="orbit orbit-1"><div className="orbit-dot" /></div>
          <div className="orbit orbit-2"><div className="orbit-dot" /></div>
          <div className="orbit orbit-3"><div className="orbit-dot" /></div>
          <div className="core-icon">
            <svg className="w-7 h-7 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-text-primary mb-3 animate-fade-in">
          Sending your ticket{dots}
        </h2>
        <p className="text-text-secondary text-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Hang tight — we're routing it to our AI support agent.
        </p>
      </div>
    </div>
  );
}
