/**
 * StatusBadge — colored status indicator for ticket tracking.
 *
 * Maps internal statuses to customer-friendly labels:
 *   new, triaged → "New" (gray)
 *   in_progress, pending_approval, escalated → "In Progress" (blue)
 *   resolved → "Resolved" (green)
 */
export default function StatusBadge({ status }) {
  const config = getStatusConfig(status);

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
      style={{
        background: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: config.dot }}
      />
      {config.label}
    </span>
  );
}

function getStatusConfig(status) {
  switch (status?.toLowerCase()) {
    case 'resolved':
      return {
        label: 'Resolved',
        bg: 'rgba(16, 185, 129, 0.12)',
        text: '#34d399',
        border: 'rgba(16, 185, 129, 0.2)',
        dot: '#10b981',
      };
    case 'in_progress':
    case 'pending_approval':
    case 'escalated':
      return {
        label: 'In Progress',
        bg: 'rgba(99, 102, 241, 0.12)',
        text: '#818cf8',
        border: 'rgba(99, 102, 241, 0.2)',
        dot: '#6366f1',
      };
    case 'new':
    case 'triaged':
    default:
      return {
        label: 'New',
        bg: 'rgba(148, 163, 184, 0.12)',
        text: '#94a3b8',
        border: 'rgba(148, 163, 184, 0.2)',
        dot: '#94a3b8',
      };
  }
}
