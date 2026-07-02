// ─── Bazario Global Loader ────────────────────────────────────────────────
// Usage:
//   <Loader />                  → full-page overlay (default)
//   <Loader variant="inline" /> → small inline spinner
//   <Loader variant="section"/> → centred inside a section/card
//   <Loader text="Loading products..." /> → custom label

export default function Loader({ variant = 'page', text = '' }) {

  // ── Inline spinner ────────────────────────────────────────────────────
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin block" />
        {text && <span className="text-sm text-gray-500">{text}</span>}
      </span>
    );
  }

  // ── Section loader (fills parent container) ───────────────────────────
  if (variant === 'section') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <BazarioSpinner />
        {text && <p className="text-gray-400 text-sm animate-pulse">{text}</p>}
      </div>
    );
  }

  // ── Full-page overlay (default) ───────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
      <BazarioSpinner large />
      <p className="mt-6 text-gray-500 text-sm font-medium animate-pulse tracking-wide">
        {text || 'Loading…'}
      </p>
    </div>
  );
}

// ─── The animated Bazario spinner ─────────────────────────────────────────
function BazarioSpinner({ large = false }) {
  const size = large ? 'w-20 h-20' : 'w-12 h-12';
  const ring1 = large ? 'w-20 h-20 border-4' : 'w-12 h-12 border-[3px]';
  const ring2 = large ? 'w-14 h-14 border-4' : 'w-8 h-8 border-[3px]';
  const ring3 = large ? 'w-8 h-8 border-4' : 'w-4 h-4 border-2';

  return (
    <div className={`relative ${size} flex items-center justify-center`}>
      {/* Outer ring */}
      <span
        className={`absolute ${ring1} border-primary-100 border-t-primary-600 rounded-full animate-spin`}
        style={{ animationDuration: '1s' }}
      />
      {/* Middle ring — opposite direction */}
      <span
        className={`absolute ${ring2} border-orange-100 border-t-orange-500 rounded-full animate-spin`}
        style={{ animationDuration: '0.75s', animationDirection: 'reverse' }}
      />
      {/* Inner dot */}
      <span
        className={`absolute ${ring3} border-primary-200 border-t-primary-500 rounded-full animate-spin`}
        style={{ animationDuration: '0.5s' }}
      />
      {/* Centre dot */}
      <span className="w-1.5 h-1.5 bg-primary-600 rounded-full" />
    </div>
  );
}
