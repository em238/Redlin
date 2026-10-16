"use client";

/**
 * Premium section-to-section gradient transition ribbon.
 * A 1px gradient line with slow drift, optionally with a centered brand dot.
 * Drop between two sections to replace harsh color cuts with a smooth visual bridge.
 */
export function SectionDivider({
  className = "",
  showDot = true,
}: {
  className?: string;
  showDot?: boolean;
}) {
  return (
    <div className={`relative w-full h-px ${className}`} aria-hidden>
      <div className="section-ribbon ribbon-drift w-full h-px" />
      {showDot && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gradient-to-br from-primary to-amber-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
      )}
    </div>
  );
}
