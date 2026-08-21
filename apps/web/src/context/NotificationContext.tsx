import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CloseCircle, Danger, InfoCircle, TickCircle, Warning2 } from "iconsax-react";

type Tone = "success" | "error" | "warning" | "info";
type Notification = { id: number; tone: Tone; title: string; message?: string; duration: number };
type NotifyInput = { tone?: Tone; title: string; message?: string; duration?: number };
type NotificationApi = { notify: (input: NotifyInput) => number; dismiss: (id: number) => void };

const NotificationContext = createContext<NotificationApi | null>(null);
const icons = { success: TickCircle, error: Danger, warning: Warning2, info: InfoCircle };

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items,setItems] = useState<Notification[]>([]); const nextId = useRef(1); const timers = useRef(new Map<number,ReturnType<typeof setTimeout>>());
  const dismiss = useCallback((id:number) => { const timer=timers.current.get(id); if(timer) clearTimeout(timer); timers.current.delete(id); setItems(current=>current.filter(item=>item.id!==id)); },[]);
  const startTimer = useCallback((item:Notification) => { if(item.duration<=0)return; const existing=timers.current.get(item.id); if(existing)clearTimeout(existing); timers.current.set(item.id,setTimeout(()=>dismiss(item.id),item.duration)); },[dismiss]);
  const notify = useCallback((input:NotifyInput) => { const item:Notification={id:nextId.current++,tone:input.tone??"info",title:input.title,message:input.message,duration:input.duration??(input.tone==="error"?8000:5000)}; setItems(current=>[...current.slice(-3),item]); startTimer(item); return item.id; },[startTimer]);
  useEffect(()=>()=>{timers.current.forEach(clearTimeout);timers.current.clear();},[]);
  return <NotificationContext.Provider value={{notify,dismiss}}>{children}<div className="notification-region" aria-label="Notifications">{items.map(item=>{const Icon=icons[item.tone];return <article key={item.id} className={`notification notification--${item.tone}`} role={item.tone==="error"?"alert":"status"} aria-live={item.tone==="error"?"assertive":"polite"} onMouseEnter={()=>{const timer=timers.current.get(item.id);if(timer)clearTimeout(timer);}} onMouseLeave={()=>startTimer(item)}><span className="notification__icon"><Icon size={20}/></span><div><strong>{item.title}</strong>{item.message&&<p>{item.message}</p>}</div><button onClick={()=>dismiss(item.id)} aria-label="Dismiss notification"><CloseCircle size={19}/></button><span className="notification__timer" style={{animationDuration:`${item.duration}ms`}}/></article>})}</div></NotificationContext.Provider>;
}

export function useNotifications() { const context=useContext(NotificationContext); if(!context)throw new Error("useNotifications must be used inside NotificationProvider"); return context; }
