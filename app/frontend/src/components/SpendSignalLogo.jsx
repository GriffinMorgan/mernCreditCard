import React from 'react';

export default function SpendSignalLogo({
  size = 'md',
  portalBadge = null,
  uppercase = false,
}) {
  const dims = {
    sm: { h1: 11, h2: 16, h3: 21, w: 3.5, text: 'text-base' },
    md: { h1: 13, h2: 19, h3: 25, w: 4, text: 'text-lg' },
    lg: { h1: 16, h2: 23, h3: 30, w: 5, text: 'text-xl' },
  }[size];

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div className="inline-flex items-end gap-[3px]">
        <span
          style={{ height: `${dims.h1}px`, width: `${dims.w}px` }}
          className="bg-[#F85C70] rounded-[1px] inline-block"
        />
        <span
          style={{ height: `${dims.h2}px`, width: `${dims.w}px` }}
          className="bg-[#7E8EF7] rounded-[1px] inline-block"
        />
        <span
          style={{ height: `${dims.h3}px`, width: `${dims.w}px` }}
          className="bg-[#F85C70] rounded-[1px] inline-block"
        />
      </div>

      <span
        className={`font-bold text-white ${dims.text} ${
          uppercase ? ' tracking-[0.12em] uppercase text-sm' : 'tracking-tight'
        }`}
      >
        SpendSignal
      </span>

      {portalBadge && (
        <>
          <span className="h-4 w-px bg-[#243252] mx-1" />
          <span className="text-xs font-medium text-slate-400">{portalBadge}</span>
        </>
      )}
    </div>
  );
}
