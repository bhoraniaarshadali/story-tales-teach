import React, { useRef, useEffect } from 'react';
import '../styles/fluid.css';

const FluidBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // --- WebGL Fluid Simulation Logic ---
        // The following is a minimal setup; the full logic will be ported in the next step.
        // For now, just set up the canvas size and a black background.
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // TODO: Port the full WebGL fluid simulation logic here.
    }, []);

    return (
        <div id="fluid-container">
            <canvas ref={canvasRef} />
            <div className="a-title">Fluid Simulation Title</div>
            <div className="a-second-title">Second Overlay Title</div>
        </div>
    );
};

export default FluidBackground; 