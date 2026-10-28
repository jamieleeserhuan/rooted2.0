/**
 * ui.tsx
 * ------
 * Small shared pieces so every screen matches the Rooted website:
 * forest green, cream, Fraunces headlines, Inter body, mono labels.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowLeft, X } from 'lucide-react';

/** Fills {name} placeholders in a translated phrase. */
export const fill = (s: string, vars: Record<string, string>) =>
  s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

/** Gold: the single main action on a screen (same as the website's "Try Rooted"). */
export const btnGold =
  'inline-flex items-center justify-center gap-2 min-h-[52px] px-7 rounded-[10px] bg-gold text-forest font-semibold text-base ' +
  'hover:bg-gold-dark transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

/** Forest: secondary actions on cream screens. */
export const btnForest =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-[10px] bg-forest text-cream font-semibold text-[0.9375rem] ' +
  'hover:bg-forest-deep transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

/** Quiet: outlined, for "start over" and similar. */
export const btnQuiet =
  'inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-[10px] border border-line text-forest font-semibold text-[0.9375rem] ' +
  'hover:bg-cream transition-colors cursor-pointer';

/** Text link with the website's sage underline. */
export const linkUnderline =
  'underline underline-offset-[5px] decoration-sage hover:decoration-2 cursor-pointer';

export const fieldBase =
  'w-full bg-paper border-[1.5px] border-line rounded-xl px-4 text-[1rem] text-forest-deep ' +
  'focus:border-forest focus:outline-none transition-colors';

/** Small uppercase mono label, like "ESTIMATED TIME" on the website demo. */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[0.75rem] tracking-[0.14em] rtl:tracking-normal uppercase text-sage-dark ${className}`}>
      {children}
    </span>
  );
}

/** Back arrow + serif page title used at the top of every inner screen. */
export function ScreenHeader({
  title,
  onBack,
  backLabel,
  children,
}: {
  title: ReactNode;
  onBack: () => void;
  backLabel: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        title={backLabel}
        className="shrink-0 -ms-2 mt-0.5 w-12 h-12 flex items-center justify-center rounded-full text-forest hover:bg-cream transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 rtl:-scale-x-100" />
      </button>
      <div className="min-w-0 flex-1">
        <h1 dir="auto" className="m-0 text-[clamp(1.75rem,1rem+2vw,2.5rem)] leading-[1.08] tracking-[-0.015em] font-semibold text-forest text-balance">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}

/**
 * Modal: cream card over a dimmed page. Closes on Escape or the X button,
 * and moves keyboard focus into the dialog when it opens.
 */
export function Modal({
  title,
  onClose,
  closeLabel = 'Close',
  icon,
  children,
  footer,
}: {
  title: ReactNode;
  onClose: () => void;
  closeLabel?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-forest-deep/60 p-0 sm:p-6 rooted-fade" onClick={onClose}>
      <div
        ref={box}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rooted-modal-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-xl max-h-[92svh] overflow-y-auto bg-cream-light text-forest-deep rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 shadow-[0_30px_70px_rgba(10,22,15,0.45)] outline-none rooted-in"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-3">
            {icon}
            <h2 id="rooted-modal-title" className="m-0 text-[1.625rem] leading-[1.15] font-semibold text-forest">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="shrink-0 -me-2 -mt-2 w-12 h-12 flex items-center justify-center rounded-full text-forest hover:bg-cream transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
        {footer && <div className="mt-7 flex flex-col sm:flex-row gap-3">{footer}</div>}
      </div>
    </div>
  );
}
