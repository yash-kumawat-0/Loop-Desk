import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TicketIdModal({ ticketId, onClose }) {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    onClose();
    navigate(`/processing?ticketId=${encodeURIComponent(ticketId)}`);
  };

  return (
    <div className="modal-backdrop">
      <div className="glass-card p-8 max-w-md w-full animate-fade-in-up shadow-2xl border border-white/10">
        
        <div className="mx-auto w-16 h-16 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center mb-6 animate-checkmark">
          <svg className="w-8 h-8 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-center text-text-primary mb-2">Ticket Submitted</h2>
        <p className="text-center text-text-secondary text-sm mb-8">
          Your support request is in our system. Please save your ticket ID.
        </p>

        <div className="bg-surface-800/50 rounded-xl border border-glass-border p-4 mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Ticket ID</p>
            <p className="font-mono text-lg font-bold text-accent-violet">{ticketId}</p>
          </div>
          <button 
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-glass-border text-text-secondary hover:text-white"
            title="Copy ID"
          >
            {copied ? (
              <svg className="w-5 h-5 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>
        </div>

        <button 
          onClick={handleContinue}
          className="btn-primary w-full"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
