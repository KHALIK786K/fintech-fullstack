// Lightweight inline SVG icons. Keeping them local avoids an extra dependency
// and keeps the bundle small. Each accepts className for sizing/color.
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const Icon = {
  Dashboard: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>),
  Wallet: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v0H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/><path d="M16 12h.01"/></svg>),
  Users: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5.8"/><path d="M18 19a5 5 0 0 0-3-4.6"/></svg>),
  Send: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M21 3 10.5 13.5"/><path d="M21 3l-6.5 18-4-8-8-4L21 3z"/></svg>),
  Clock: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>),
  List: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>),
  Plus: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 5v14M5 12h14"/></svg>),
  Logout: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M15 17l5-5-5-5"/><path d="M20 12H9"/><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/></svg>),
  Check: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M20 6 9 17l-5-5"/></svg>),
  X: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>),
  Arrow: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>),
  Trash: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>),
  Search: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>),
  Shield: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"/><path d="m9 12 2 2 4-4"/></svg>),
  Bolt: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/></svg>),
  TrendUp: (p) => (<svg viewBox="0 0 24 24" {...base} {...p}><path d="M3 17l6-6 4 4 7-7"/><path d="M17 7h4v4"/></svg>),
};
