import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

interface ChatBubbleProps {
    content: React.ReactNode;
    isUser?: boolean;
    avatar?: string;
    avatarFallback?: string;
    className?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
    content,
    isUser = false,
    avatar,
    avatarFallback = "👤",
    className,
}) => {
    return (
        <div
            className={cn(
                "flex gap-2 max-w-[85%] mb-4",
                isUser ? "ml-auto flex-row-reverse" : "mr-auto",
                className
            )}
        >
            <Avatar className="h-8 w-8 flex-shrink-0">
                {avatar && <AvatarImage src={avatar} />}
                <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
            <div
                className={cn(
                    "rounded-2xl p-4",
                    isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                )}
            >
                {content}
            </div>
        </div>
    );
};

interface ChatLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
    children,
    className,
}) => {
    return (
        <div
            className={cn(
                "flex flex-col w-full max-w-3xl mx-auto space-y-4 p-4",
                className
            )}
        >
            {children}
        </div>
    );
}; 