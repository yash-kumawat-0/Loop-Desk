import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFunctionRun } from "lemma-sdk/react";
import client from "../api/client";
import StatusBadge from '../components/StatusBadge';
import ResponseCard from '../components/ResponseCard';

/**
 * TrackTicket — customers look up their ticket(s) by email or ticket ID.
 * Only shows that customer's own data. Status labels are customer-friendly.
 */
export default function TrackTicket() {
  const [searchParams] = useSearchParams();
  const [lookupValue, setLookupValue] = useState(searchParams.get('id') || '');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  
  const { start: listTickets } = useFunctionRun({ client, functionName: "customer_panel_list_tickets" });

  useEffect(() => {
    const ticketIdFromUrl = searchParams.get('id');
    console.log('useEffect fired, ticketIdFromUrl:', ticketIdFromUrl);
    if (ticketIdFromUrl) {
      handleLookup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLookup(e) {
    if (e) e.preventDefault();
    if (!lookupValue.trim()) {
      setError('Please enter your email or ticket ID.');
      return;
    }

    setError('');
    setLoading(true);
    setSearched(true);

    try {
      const val = lookupValue.trim();
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
      
      const payload = isUUID
        ? { ticket_id: val }
        : { customer_contact: val };

      const response = await listTickets(payload);

      console.log('Full raw result:', JSON.stringify(response));
      console.log('output_data:', JSON.stringify(response?.output_data));
      console.log('tickets array:', response?.output_data?.tickets);
      console.log('ticket_id sent:', val);

      if (response?.output_data?.success === false) {
        setError(response.output_data.error_message || response.output_data.message || 'Lookup returned an error.');
        setTickets([]);
        return;
      }

      const ticketsArray = response?.output_data?.tickets || [];
      setTickets(ticketsArray);
    } catch (err) {
      console.error('Lookup failed:', err);
      if (err.response?.status === 404) {
        setTickets([]);
      } else {
        setError(
          err.response?.data?.message ||
          'Failed to look up your ticket. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-start justify-center px-4 py-12">
      <div className="w-full max-w-2xl animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 mb-4">
            <svg className="w-4 h-4 text-accent-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xs font-medium text-accent-indigo">Ticket Tracker</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Track Your Ticket
          </h1>
          <p className="text-text-secondary text-sm">
            Enter your email or ticket ID to check the status of your request.
          </p>
        </div>

        {/* Lookup form */}
        <form onSubmit={handleLookup} className="glass-card p-6 mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={lookupValue}
                onChange={(e) => setLookupValue(e.target.value)}
                placeholder="Enter email address or ticket ID"
                className="form-input pl-12"
                id="lookup-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary whitespace-nowrap"
              id="lookup-btn"
            >
              {loading ? <div className="spinner" /> : 'Look Up'}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* Results */}
        {searched && !loading && tickets.length === 0 && !error && (
          <div className="glass-card p-8 text-center animate-fade-in">
            <svg className="w-12 h-12 text-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-text-secondary text-sm">
              No tickets found. Double-check your email or ticket ID.
            </p>
          </div>
        )}

        {tickets.length > 0 && (
          <div className="space-y-4 stagger-children">
            {tickets.map((ticket) => (
              <div key={ticket.id || ticket.ticket_id} className="glass-card p-6">
                {/* Ticket header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-semibold text-text-primary truncate">
                        {ticket.subject}
                      </h3>
                      <StatusBadge status={ticket.status} />
                    </div>
                    <p className="text-xs text-text-muted font-mono">
                      ID: {ticket.id || ticket.ticket_id}
                    </p>
                  </div>
                </div>

                {/* Original message */}
                <div className="mb-4">
                  <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-medium">
                    Your Message
                  </p>
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-glass-border">
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {ticket.body || ticket.message || ticket.description || '—'}
                    </p>
                  </div>
                </div>

                {/* Support response (if resolved) */}
                {ticket.status?.toLowerCase() === 'resolved' && (
                  <ResponseCard response={ticket.draft_reply || ticket.response || ticket.reply} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-sm text-text-muted hover:text-accent-violet transition-colors"
          >
            ← Back to Support Center
          </a>
        </div>
      </div>
    </div>
  );
}
