import React from "react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const dotStyles = {
    base: "inline-block w-3 h-3 rounded-full mr-2 border-2 border-white shadow",
    online: "bg-green-500",
    offline: "bg-gray-400",
};

const OnlineStatusIndicator: React.FC = () => {
    const isOnline = useOnlineStatus();
    return (
        <div
            className="flex items-center text-xs font-medium select-none"
            title={isOnline ? "You are online" : "You are offline"}
            aria-label={isOnline ? "Online" : "Offline"}
        >
            <span
                className={
                    dotStyles.base + " " + (isOnline ? dotStyles.online : dotStyles.offline)
                }
            />
            <span className={isOnline ? "text-green-600" : "text-gray-500"}>
                {isOnline ? "Online" : "Offline"}
            </span>
        </div>
    );
};

export default OnlineStatusIndicator; 