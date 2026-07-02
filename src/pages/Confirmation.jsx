import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

/**
 * Confirmation — full-page view after successful ticket submission.
 * Shows ticket ID with copy-to-clipboard and a link to track/process.
 */
export default function Confirmation() {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticketId') || 'N/A';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ticketId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6">
      <div className="text-center max-w-lg w-full animate-fade-in-up">

        {/* Success pulse ring */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full bg-accent-emerald/10 animate-ping-slow" />
          <div className="relative w-24 h-24 rounded-full bg-accent-emerald/10 border-2 border-accent-emerald/30 flex items-center justify-center">
            <svg className="w-12 h-12 text-accent-emerald animate-checkmark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Ticket Created
        </h1>
        <p className="text-text-secondary text-sm mb-10">
          Your request has been submitted to LoopDesk. Save your ticket ID below.
        </p>

        {/* Ticket ID card */}
        <div className="glass-card p-6 mb-10 text-left">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-widest mb-1.5 font-medium">Ticket ID</p>
              <p className="font-mono text-xl font-bold text-accent-violet select-all">{ticketId}</p>
            </div>
            <button
              onClick={handleCopy}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-glass-border text-text-secondary hover:text-white hover:scale-105 active:scale-95 flex-shrink-0 ml-4"
              title="Copy ticket ID"
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
          {copied && (
            <p className="text-xs text-accent-emerald mt-2 animate-fade-in font-medium">Copied to clipboard!</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            to={`/processing?ticketId=${encodeURIComponent(ticketId)}`}
            className="btn-primary w-full block py-3.5 text-base"
          >
            <svg className="w-5 h-5 inline mr-2 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Track This Ticket
          </Link>

          <Link
            to="/submit"
            className="btn-secondary w-full block py-3"
          >
            Submit Another Ticket
          </Link>
        </div>
      </div>
    </div>
  );
}
