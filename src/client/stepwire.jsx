import React, { useState, useEffect, useRef } from 'react';

const StepWire = () => {
  const [points, setPoints] = useState({
    start: { x: 400, y: 100 },
    middleStart: { x: 500, y: 100 },
    middleEnd: { x: 500, y: 200 },
    end: { x: 700, y: 200 }
  });
  
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef(null);
  const svgRef = useRef(null);
  
  // Calculate the path between points using horizontal and vertical lines
  const calculatePath = () => {
    const { start, middleStart, middleEnd, end } = points;
    return `M ${start.x} ${start.y}
            H ${middleStart.x}
            V ${middleEnd.y}
            H ${end.x}
            // V ${end.y}`;
  };

  // Update path length when path changes
  useEffect(() => {
    if (pathRef.current) {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
      // Update the stroke-dasharray and stroke-dashoffset dynamically
    //   pathRef.current.style.strokeDasharray = `${length}`;
    //   pathRef.current.style.strokeDashoffset = `${length}`;
    }
  }, [points]);

  // Convert screen coordinates to SVG coordinates
  const screenToSVGCoords = (screenX, screenY) => {
    const svgElement = svgRef.current;
    if (!svgElement) return { x: 0, y: 0 };

    const CTM = svgElement.getScreenCTM();
    const point = svgElement.createSVGPoint();
    point.x = screenX;
    point.y = screenY;
    const svgPoint = point.matrixTransform(CTM.inverse());
    
    return {
      x: Math.max(50, Math.min(750, svgPoint.x)),
      y: Math.max(50, Math.min(350, svgPoint.y))
    };
  };

  // Handle dragging of points
  const handleDragStart = (pointKey) => (startEvent) => {
    startEvent.preventDefault();
    
    const handleMouseMove = (moveEvent) => {
        // console.log("here")
      const coords = screenToSVGCoords(moveEvent.clientX, moveEvent.clientY);
      setPoints(prev => ({
        ...prev,
        [pointKey]: coords
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-8">
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full max-w-3xl"
      >
        {/* Base wire */}
        <path
          d={calculatePath()}
          className="stroke-blue-500 opacity-20"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Animated current line */}
        <path
          ref={pathRef}
          d={calculatePath()}
          className="stroke-blue-400"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: '20 40',
            animation: 'dash 2s linear infinite'
          }}
        />
        
        {/* Draggable points */}
        {Object.entries(points).map(([key, point]) => (
          <g key={key}>
            {/* Larger invisible circle for easier dragging */}
            <circle
              cx={point.x}
              cy={point.y}
              r="20"
              className="fill-transparent cursor-move"
              onMouseDown={handleDragStart(key)}
            />
            {/* Visible point */}
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              className="fill-blue-400"
            />
          </g>
        ))}
      </svg>
      
      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -200;
            }
          }
        `}
      </style>
    </div>
  );
};

export default StepWire;