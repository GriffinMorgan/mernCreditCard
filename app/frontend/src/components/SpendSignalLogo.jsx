import React from 'react';

export default function SpendSignalLogo({
  size = 'md',
  portalBadge = null,
  uppercase = false,
}) {
  const barDimensions = {
    sm: { h1: 12, h2: 17, h3: 22, w: 4, gap: 'gap-1', text: 'text-lg' },
    md: { h1: 14, h2: 20, h3: 27, w: 5, gap: 'gap-1', text: 'text-xl' },
    lg: { h1: 18, h2: 26, h3: 34, w: 6, gap: 'gap-1.5', text: 'text-2xl' },
  }[size];

  return (
    <div className="inline-flex items-center gap-3 select-none">
      {/* Three rising signal bars matching the SpendSignal mockups */}
      <div className={`inline-flex items-end ${barDimensions.gap}`}>
        <span
          style={{ height: `${barDimensions.h1}px`, width: `${barDimensions.w}px` }}
          className="rounded-sm bg-signal-coral inline-block"
        />
        <span
          style={{ height: `${barDimensions.h2}px`, width: `${barDimensions.w}px` }}
          className="rounded-sm bg-signal-indigo inline-block"
        />
        <span
          style={{ height: `${barDimensions.h3}px`, width: `${barDimensions.w}px` }}
          className="rounded-sm bg-gradient-to-t from-signal-coral to-signal-indigo inline-block"
        />
      </div>

      <span
        className={`font-bold tracking-tight text-white ${barDimensions.text} ${
          uppercase ? 'uppercase tracking-widest' : ''
        }`}
      >
        {uppercase ? (
          <>
            SPEND<span className="text-signal-indigo">SIGNAL</span>
          </>
        ) : (
          <>
            Spend<span className="text-signal-indigo">Signal</span>
          </>
        )}
      </span>

      {portalBadge && (
        <>
          <span className="h-5 w-px bg-slate-700/80 mx-0.5" />
          <span className="px-2.5 py-1 rounded-md bg-navy-800 border border-slate-700/70 text-xs font-medium text-slate-300">
            {portalBadge}
          </span>
        </>
      )}
    </div>
  );
}

