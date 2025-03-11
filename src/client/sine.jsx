
export default function Sine() {
  return (
    <div>
      <SineWave />
    </div>
  );
}


import { useEffect, useRef } from 'react';

const SineWave = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Wave properties
    const amplitude = 100;
    const frequency = 0.02;
    let phase = 0;
    let animationFrameId;
    
    const drawWave = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Begin path for the wave
      ctx.beginPath();
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      
      // Draw the wave point by point
      for (let x = 0; x < canvas.width; x++) {
        // Calculate y position using sine function
        const y = amplitude * Math.sin(frequency * x + phase) + canvas.height / 2;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      // Render the wave
      ctx.stroke();
      
      // Update phase for animation
      phase += 0.05;
      
      // Request next frame
      animationFrameId = requestAnimationFrame(drawWave);
    };
    
    // Start the animation
    drawWave();
    
    // Cleanup function to cancel animation when component unmounts
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="border border-gray-300 bg-black"
      />
    </div>
  );
};

export const AnimatedWire = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-8">
      <svg 
        viewBox="0 0 800 200" 
        className="w-full max-w-3xl"
      >
        {/* Base wire with glow effect */}
        <path
          d="M 50 100 Q 200 50, 400 100 T 750 100"
          className="stroke-blue-500 opacity-20"
          fill="none"
          strokeWidth="8"
        />

        {/* Animated current line */}
        <path
          d="M 50 100 Q 200 50, 400 100 T 750 100"
          className="stroke-blue-400 animate-[flowCurrent_1.5s_linear_infinite]"
          fill="none"
          strokeWidth="4"
          strokeDasharray="20 40"
        />

        {/* Connection points */}
        <circle cx="50" cy="100" r="8" className="fill-blue-400" />
        <circle cx="750" cy="100" r="8" className="fill-blue-400" />
      </svg>

      <style jsx>{`
        @keyframes flowCurrent {
          to {
            stroke-dashoffset: -60;
          }
        }
      `}</style>
    </div>
  );
};

export const AAnimatedWire = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-8">
      <svg 
        viewBox="0 0 800 200" 
        className="w-full max-w-3xl"
      >
        {/* Wire path with gradient */}
        <defs>
          <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor="#4299e1" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#63b3ed" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4299e1" stopOpacity="0.3" />
          </linearGradient>
          
          {/* Animated dash pattern */}
          <pattern 
            id="animatedDash" 
            width="60" 
            height="10" 
            patternUnits="userSpaceOnUse"
            className="animate-[moveLeft_1s_linear_infinite]"
          >
            <rect width="30" height="2" fill="white" />
          </pattern>
        </defs>

        {/* Base wire path */}
        <path
          d="M 50 100 Q 200 50, 400 100 T 750 100"
          fill="none"
          stroke="url(#wireGradient)"
          strokeWidth="6"
          className="rounded-full"
        />

        {/* Animated current */}
        <path
          d="M 50 100 Q 200 50, 400 100 T 750 100"
          fill="none"
          stroke="url(#animatedDash)"
          strokeWidth="2"
          className="rounded-full"
        />

        {/* Connection points */}
        <circle cx="50" cy="100" r="8" className="fill-blue-400" />
        <circle cx="750" cy="100" r="8" className="fill-blue-400" />
      </svg>

      <style jsx>{`
        @keyframes moveLeft {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-60px);
          }
        }
      `}</style>
    </div>
  );
};

import React, { useState } from 'react';

export const DraggableWire = () => {
  // State for control points positions
  const [controlPoints, setControlPoints] = useState([
    { x: 200, y: 50 },  // First control point
    { x: 600, y: 150 }  // Second control point
  ]);

  // Fixed start and end points
  const startPoint = { x: 50, y: 100 };
  const endPoint = { x: 750, y: 100 };

  // Generate the SVG path string
  const pathString = `M ${startPoint.x} ${startPoint.y} ` +
                    `C ${controlPoints[0].x} ${controlPoints[0].y}, ` +
                    `${controlPoints[1].x} ${controlPoints[1].y}, ` +
                    `${endPoint.x} ${endPoint.y}`;

  // Handle dragging of control points
  const handleDrag = (index, e) => {
    const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    
    // Update the position of the dragged control point
    const newPoints = [...controlPoints];
    newPoints[index] = { 
      x: Math.max(50, Math.min(750, x)), // Constrain x between 50 and 750
      y: Math.max(20, Math.min(180, y))  // Constrain y between 20 and 180
    };
    setControlPoints(newPoints);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-8">
      <svg 
        viewBox="0 0 800 200" 
        className="w-full max-w-3xl"
      >
        {/* Helper lines for control points */}
        <line 
          x1={startPoint.x} 
          y1={startPoint.y} 
          x2={controlPoints[0].x} 
          y2={controlPoints[0].y} 
          className="stroke-gray-600 stroke-1 opacity-50"
        />
        <line 
          x1={endPoint.x} 
          y1={endPoint.y} 
          x2={controlPoints[1].x} 
          y2={controlPoints[1].y} 
          className="stroke-gray-600 stroke-1 opacity-50"
        />

        {/* Base wire with glow effect */}
        <path
          d={pathString}
          className="stroke-blue-500 opacity-20"
          fill="none"
          strokeWidth="8"
        />

        {/* Animated current line */}
        <path
          d={pathString}
          className="stroke-blue-400 animate-[flowCurrent_1.5s_linear_infinite]"
          fill="none"
          strokeWidth="4"
          strokeDasharray="20 40"
        />

        {/* Fixed endpoints */}
        <circle 
          cx={startPoint.x} 
          cy={startPoint.y} 
          r="8" 
          className="fill-blue-400"
        />
        <circle 
          cx={endPoint.x} 
          cy={endPoint.y} 
          r="8" 
          className="fill-blue-400"
        />

        {/* Draggable control points */}
        {controlPoints.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="6"
            className="fill-red-400 cursor-move hover:fill-red-300 active:fill-red-500"
            onMouseDown={(e) => {
              const handleMouseMove = (moveEvent) => {
                handleDrag(index, moveEvent);
              };
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        ))}
      </svg>

      <style jsx>{`
        @keyframes flowCurrent {
          to {
            stroke-dashoffset: -60;
          }
        }
      `}</style>
    </div>
  );
};

