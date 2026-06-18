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
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative p-1.5 rounded-md text-(--Text-primary-off) hover:text-(--Primary) hover:bg-(--Button-background) transition-all duration-200 cursor-pointer"
                aria-label="Notifications"
            >
                <Bell size={18} className="cursor-pointer text-(--Primary-off) hover:text-(--Primary-selected)" />
                
                {notifications.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-(--Primary) ring-2 ring-(--Page-background)" />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 bg-(--Page-background) border border-(--Border) rounded-sm shadow-lg z-50 overflow-hidden animate-[slideIn_0.15s_ease-out]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-(--Text-primary-off)">
                            No new notifications
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => { notification.action(); setIsOpen(false); }}
                                className="px-4 py-3 border-b border-(--Border) cursor-pointer hover:bg-(--Select-background) transition-colors"
                            >
                                <div className="text-sm text-(--Text-gray)">{notification.message}</div>
                                <div className="text-xs text-(--Text-primary-off)">{notification.time}</div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}