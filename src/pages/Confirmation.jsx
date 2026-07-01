import { useSearchParams, Link } from 'react-router-dom';

/**
 * Confirmation — shown after successful ticket submission.
 * Displays the ticket ID and a link to track it.
 */
export default function Confirmation() {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('ticketId') || 'N/A';

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center animate-fade-in-up">
        <div className="glass-card p-10">
          {/* Success icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center mb-6 animate-checkmark">
            <svg
              className="w-10 h-10 text-accent-emerald"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Ticket Submitted!
          </h1>
          <p className="text-text-secondary text-sm mb-6">
            Your support request has been received. Our AI is analyzing and routing it to the right team.
          </p>

          {/* Ticket ID */}
          <div className="glass-card p-4 mb-6">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
              Your Ticket ID
            </p>
            <p className="text-xl font-mono font-bold text-accent-violet" id="ticket-id-display">
              {ticketId}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to={`/track?id=${encodeURIComponent(ticketId)}`}
              className="btn-primary w-full block"
              id="track-ticket-link"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Track This Ticket
            </Link>

            <Link
              to="/"
              className="btn-secondary w-full block"
            >
              Submit Another Ticket
            </Link>
          </div>
        </div>

        <p className="text-xs text-text-muted mt-6">
          Save your ticket ID — you'll need it to check your ticket's status.
        </p>
      </div>
    </div>
  );
}
