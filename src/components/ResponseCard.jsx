/**
 * ResponseCard — visually distinct card to display support's response
 * when a ticket is resolved.
 */
export default function ResponseCard({ response }) {
  if (!response) return null;

  return (
    <div className="mt-4 glass-card p-5 border-l-4 border-l-accent-emerald">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-5 h-5 text-accent-emerald"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h4 className="text-sm font-semibold text-accent-emerald tracking-wide uppercase">
          Support's Response
        </h4>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
        {response}
      </p>
    </div>
  );
}
