import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  id?: string;
  /** When true, the sheet becomes a side drawer (used by Navbar hamburger). */
  variant?: 'sheet' | 'drawer';
}

export const MobileSheet: React.FC<MobileSheetProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  id,
  variant = 'sheet'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const isDrawer = variant === 'drawer';

  return (
    <div
      className="fixed inset-0 z-50 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title && id ? `${id}-title` : undefined}
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        id={id}
        className={
          isDrawer
            ? 'absolute top-0 right-0 h-full w-[88%] max-w-sm bg-white shadow-2xl flex flex-col animate-slideInRight'
            : 'absolute bottom-0 left-0 right-0 max-h-[92vh] bg-white rounded-t-3xl shadow-2xl flex flex-col animate-slideInUp pb-[env(safe-area-inset-bottom)]'
        }
      >
        {isDrawer ? (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
             <div id={id ? `${id}-title` : undefined} className="font-extrabold text-slate-900 text-base">{title}</div>
            <button
              onClick={onClose}
              className="touch-target inline-flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="w-12 h-1.5 rounded-full bg-slate-200 mx-auto" aria-hidden="true" />
            <button
              onClick={onClose}
              className="absolute right-4 top-4 touch-target inline-flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {isDrawer ? null : title ? (
          <div className="px-5 pt-1 pb-3 border-b border-slate-100">
            <div className="font-extrabold text-slate-900 text-base">{title}</div>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto overscroll-contain p-5">{children}</div>

        {footer ? (
          <div className="border-t border-slate-200 p-4 bg-slate-50">{footer}</div>
        ) : null}
      </div>
    </div>
  );
};
