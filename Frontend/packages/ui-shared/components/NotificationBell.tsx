import {
    Bell
}
    from "lucide-react";

import {useState, useRef, useEffect} from "react";


export interface NotificationProps {
    id: number;
    message: string;
    time: string;
    action: () => void;
}


interface NotificationBellProps {
    notifications?: NotificationProps[];
}



export function NotificationBell({ notifications = [] }: NotificationBellProps) {

    const [isOpen, setIsOpen] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (isOpen && bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={bellRef}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative p-2 rounded-md text-(--Text-primary-off) hover:text-(--Primary) hover:bg-(--Button-background) transition-all duration-200 cursor-pointer"
                aria-label="Notificações"
                aria-expanded={isOpen}
            >
                <Bell size={18} className="cursor-pointer text-(--Primary-off) hover:text-(--Primary-selected)" />
                
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-(--Primary) ring-2 ring-(--Page-background)" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 max-w-[85vw] bg-(--Widget-background) border border-(--Border) rounded-lg shadow-xl z-50 overflow-hidden animate-[fadeSlideUp_0.15s_ease-out]">
                    <div className="px-4 py-2.5 border-b border-(--Border)/60 flex items-center justify-between">
                        <span className="text-xs font-primary font-bold uppercase tracking-wider text-(--Primary-off)">
                            Notificações
                        </span>
                        {notifications.length > 0 && (
                            <span className="text-[11px] font-secondary text-(--Text-primary-off) tabular-nums">
                                {notifications.length}
                            </span>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-(--Text-primary-off)">
                            Nenhuma notificação no momento
                        </div>
                    ) : (
                        <div className="max-h-72 overflow-y-auto">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    type="button"
                                    onClick={() => { notification.action(); setIsOpen(false); }}
                                    className="w-full text-left px-4 py-3 border-b last:border-b-0 border-(--Border)/50 cursor-pointer hover:bg-(--Select-background) transition-colors"
                                >
                                    <div className="text-sm font-secondary text-(--Text-primary)">{notification.message}</div>
                                    <div className="text-xs font-secondary text-(--Text-primary-off) mt-0.5">{notification.time}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}