import { useState, useRef, useEffect } from 'react';

export default function OscilloscopeKnob() {
  const [value, setValue] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef(null);
  
  // Convert value (0-100) to angle (180-0 degrees, for half circle)
  const valueToAngle = (val) => {
    return 180 - (val * 180 / 100);
  };
  
  // Convert angle to value
  const angleToValue = (angle) => {
    // Constrain angle between 0 and 180 degrees
    const constrainedAngle = Math.max(0, Math.min(180, angle));
    return Math.round((180 - constrainedAngle) * 100 / 180);
  };

  // Handle mouse/touch movement
  const handleMove = (clientX, clientY) => {
    if (!isDragging || !knobRef.current) return;
    
    const knobRect = knobRef.current.getBoundingClientRect();
    const knobCenterX = knobRect.left + knobRect.width / 2;
    const knobCenterY = knobRect.top;
    
    // Calculate angle based on pointer position relative to knob center
    const deltaX = clientX - knobCenterX;
    const deltaY = knobCenterY - clientY; // Y is inverted in screen coordinates
    
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Adjust angle to get 0-180 range for half circle
    if (angle < 0) angle += 360;
    
    // Constrain to half circle (0-180 degrees)
    angle = Math.max(0, Math.min(180, angle));
    
    // Update value
    setValue(angleToValue(angle));
  };

  // Set up event handlers
  useEffect(() => {
    const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    
    const handleMouseUp = () => setIsDragging(false);
    const handleTouchEnd = () => setIsDragging(false);
    
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // Calculate indicator position on the arc
  const angle = valueToAngle(value);
  const indicatorAngle = angle * (Math.PI / 180);
  const radius = 80; // This should match the arc radius
  const indicatorX = Math.cos(indicatorAngle) * radius;
  const indicatorY = -Math.sin(indicatorAngle) * radius; // Negative because Y grows downward in SVG

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-lg">
      <div className="relative w-64 h-48" ref={knobRef}>
        {/* Arc background */}
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="-100 -100 200 120">
          {/* Background track */}
          <path 
            d="M -80 0 A 80 80 0 0 1 80 0" 
            fill="none" 
            stroke="#444" 
            strokeWidth="8" 
            strokeLinecap="round"
          />
          
          {/* Value track */}
          <path 
            d={`M -80 0 A 80 80 0 0 1 ${indicatorX} ${indicatorY}`} 
            fill="none" 
            stroke="#38bdf8" 
            strokeWidth="8" 
            strokeLinecap="round"
          />
          
          {/* Indicator dot */}
          <circle 
            cx={indicatorX} 
            cy={indicatorY} 
            r="6" 
            fill="#38bdf8" 
          />
          
          {/* Center point */}
          <circle cx="0" cy="0" r="20" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          
          {/* Tick marks */}
          {Array.from({ length: 11 }).map((_, i) => {
            const tickAngle = (180 - (i * 18)) * (Math.PI / 180);
            const innerRadius = (i % 5 === 0) ? 88 : 85;
            const outerRadius = 100;
            return (
              <line 
                key={i}
                x1={Math.cos(tickAngle) * innerRadius}
                y1={-Math.sin(tickAngle) * innerRadius}
                x2={Math.cos(tickAngle) * outerRadius}
                y2={-Math.sin(tickAngle) * outerRadius}
                stroke="#666"
                strokeWidth={i % 5 === 0 ? "2" : "1"}
              />
            );
          })}
          
          {/* Value text */}
          <text 
            x="0" 
            y="0" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fill="#38bdf8" 
            fontSize="12"
            fontWeight="bold"
          >
            {value}
          </text>
        </svg>
        
        {/* Clickable/draggable area */}
        <div 
          className="absolute inset-0 cursor-pointer mt-[24px]"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
            handleMove(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging(true);
            if (e.touches.length > 0) {
              handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
        />
      </div>
      
      <div className="mt-6 text-white text-center">
        <div className="text-lg font-semibold">Value: {value}</div>
        <div className="text-xs text-gray-400 mt-1">Drag to adjust</div>
      </div>
    </div>
  );
}