import { FormEvent, ReactNode, useEffect, useId, useRef } from "react";
import { CloseCircle } from "iconsax-react";

export function Modal({ open, title, description, children, submitLabel, busy, onClose, onSubmit, wide = false }: { open: boolean; title: string; description?: string; children: ReactNode; submitLabel: string; busy?: boolean; onClose: () => void; onSubmit: (event: FormEvent) => void; wide?: boolean }) {
  const titleId = useId(); const descriptionId = useId(); const formRef = useRef<HTMLFormElement>(null);
  const closeRef = useRef(onClose); const busyRef = useRef(busy); closeRef.current = onClose; busyRef.current = busy;
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null; const originalOverflow = document.body.style.overflow; document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[autofocus], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])")?.focus());
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busyRef.current) closeRef.current();
      if (event.key !== "Tab" || !formRef.current) return;
      const controls = [...formRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')];
      if (!controls.length) return; const first = controls[0]!; const last = controls[controls.length - 1]!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", keydown);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", keydown); document.body.style.overflow = originalOverflow; previous?.focus(); };
  }, [open]);
  if (!open) return null;
  return <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}><button className="modal-backdrop" onClick={onClose} aria-label="Close dialog" disabled={busy}/><form ref={formRef} className={`modal ${wide ? "modal--wide" : ""}`} onSubmit={onSubmit} aria-busy={busy}><header><div><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId}>{description}</p>}</div><button type="button" onClick={onClose} aria-label="Close dialog" disabled={busy}><CloseCircle size={24}/></button></header><div className="modal-body">{children}</div><footer><button type="button" className="secondary-button" onClick={onClose} disabled={busy}>Cancel</button><button className="primary-button primary-button--compact" disabled={busy}>{busy ? "Saving…" : submitLabel}</button></footer></form></div>;
}
