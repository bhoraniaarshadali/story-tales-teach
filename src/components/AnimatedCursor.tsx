import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const AnimatedCursor: React.FC = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(true);
    const isMobile = useIsMobile();

    useEffect(() => {
        if (isMobile) return;

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseenter', handleMouseEnter);
        window.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseenter', handleMouseEnter);
            window.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [isMobile]);

    if (!isVisible || isMobile) return null;

    return (
        <div
            className="fixed pointer-events-none z-50 transition-transform duration-75 ease-out"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-50%, -50%)',
            }}
        >
            <div className="relative">
                <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping" />
                <div className="w-4 h-4 bg-primary rounded-full" />
            </div>
        </div>
    );
};

export default AnimatedCursor; 