import React from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const OnlineStatusIndicator: React.FC = () => {
    const isOnline = useOnlineStatus();

    return (
        <div className="flex items-center gap-1.5 text-sm">
            <div className={`h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_6px_1px_rgba(34,197,94,0.4)]' : 'bg-gray-400'
                }`} />
            <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'
                }`}>
                {isOnline ? 'Online' : 'Offline'}
            </span>
        </div>
    );
};

export default OnlineStatusIndicator;