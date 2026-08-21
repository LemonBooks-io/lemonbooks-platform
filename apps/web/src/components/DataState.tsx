import { ReactNode } from "react";
import { Refresh2 } from "iconsax-react";

export function TableLoading({ rows = 5, label = "Loading data" }: { rows?: number; label?: string }) {
  return <div className="table-skeleton" role="status" aria-label={label}>{Array.from({ length: rows }, (_, index) => <span key={index}/>)}</div>;
}

export function LoadError({ title = "This information couldn’t be loaded", message, onRetry }: { title?: string; message?: string; onRetry: () => void }) {
  return <div className="inline-state inline-state--error" role="alert"><strong>{title}</strong><p>{message || "Check your connection and try again."}</p><button onClick={onRetry}><Refresh2 size={16}/>Try again</button></div>;
}

export function SearchEmpty({ query, children }: { query: string; children?: ReactNode }) {
  return <div className="inline-state"><strong>No results for “{query}”</strong><p>{children || "Try another name, reference, or filter."}</p></div>;
}

export function LiveNotice({ children, tone = "success", onDismiss }: { children: ReactNode; tone?: "success" | "error"; onDismiss?: () => void }) {
  return <div className={`page-alert page-alert--${tone}`} role={tone === "error" ? "alert" : "status"} aria-live="polite"><span>{children}</span>{onDismiss && <button onClick={onDismiss}>Dismiss</button>}</div>;
}
