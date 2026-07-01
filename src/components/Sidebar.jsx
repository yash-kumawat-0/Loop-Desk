import { NavLink } from 'react-router-dom';

/**
 * Sidebar navigation component with LoopDesk branding.
 */
export default function Sidebar() {
  return (
    <aside className="sidebar fixed left-0 top-0 bottom-0 h-full">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-accent-violet flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <span className="text-xl font-bold text-text-primary tracking-tight">
          LoopDesk
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <NavLink
          to="/submit"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Submit Ticket
        </NavLink>
        
        <NavLink
          to="/track"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'active' : ''}`
          }
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Track Tickets
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="mt-auto px-2 pt-4">
        <p className="text-xs text-text-muted">
          Powered by LoopDesk AI
        </p>
      </div>
    </aside>
  );
}
