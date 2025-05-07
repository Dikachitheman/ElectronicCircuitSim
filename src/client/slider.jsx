import { useState, useRef, useEffect } from 'react';

export default function CanvasSLider({state, setSliderVal}) {
  const [value, setValue] = useState(state);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    updateValue(e.clientX);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      updateValue(e.clientX);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e) => {
    updateValue(e.clientX);
  };

  const updateValue = (clientX) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const newValue = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    setValue(newValue);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    setSliderVal(value)
  }, [value])

  useEffect(() => {
    setValue(state)
  }, [state])

  return (
    <div className="w-[540px] ml-[14px]">
      <div 
        ref={sliderRef}
        className="relative h-[24px] rounded cursor-pointer flex items-center"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >

        <div 
          className=" h-[8px] bg-[#00DD10] rounded"
          style={{ width: `${value}%` }}
        />

        <div 
          className=" h-[8px] bg-white rounded"
          style={{ width: `${100 - value}%`}}
        />
                
        <div 
          className="absolute h-full aspect-square bg-[#87FF6E] rounded-[100%]"
          style={{ left: `${value - 4}%` }}
        />

      </div>
    </div>
  );
}

export function PanSlider({state, setViewBox}) {
  const [value, setValue] = useState(state);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    updateValue(e.clientX);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      updateValue(e.clientX);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e) => {
    updateValue(e.clientX);
  };

  const updateValue = (clientX) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const newValue = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    setViewBox(() => {
      let newVal = {x:0, y: 0, width: (newValue * 600) / 100, height: (newValue * 580) / 100}
      return newVal
    })
    setValue(newValue);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    setValue(state)
  }, [state])

  return (
    <div className="w-full h-full py-[8px]">
      
      <div 
        ref={sliderRef}
        className="h-full p-[2px] bg-[#999898] rounded-[12px] cursor-pointer"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >
        {/* Slider fill */}
        <div 
          className="h-full bg-[#FF541F] rounded-[10px]"
          style={{ width: `${value}%` }}
        />
        
      </div>
    </div>
  );
}

export const Draggable = ({ children, initialPosition, scale }) => {
  const [position, setPosition] = useState({x: initialPosition.x / scale, y: initialPosition.y / scale});
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

  // Handle mouse down to start dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = dragRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Handle mouse move to update position while dragging
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    setPosition({
      x: (e.clientX - dragOffset.x) / scale,
      y: (e.clientY - dragOffset.y) / scale
    });
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : 'auto',
        userSelect: 'none'
      }}
    >
      {children}
    </div>
  );
};

export function ComponentSlider({state, selection, setSelection, id}) {
  const [st, setSt] = useState(state)
  const [value, setValue] = useState(50);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);

  function extractUnit(str) {
    const match = str.match(/[a-zA-Z]+/g);
    return match ? match.join('') : '';
  }

  const updateSelection = () => {
    const index = selection.findIndex(item => item.id === id);
    let val = ((value * 2) / 100) * parseFloat(st)
    let unit = extractUnit(st) 

    if (index !== -1) {
      const updatedSelection = [...selection];
      updatedSelection[index] = {
        ...updatedSelection[index],
        value: Math.round(val * 100) / 100+ unit
      };
      
      setSelection(updatedSelection);
    }
  };

  useEffect(() => {
    updateSelection()
  }, [value])

  const handleMouseDown = (e) => {
    isDragging.current = true;
    updateValue(e.clientX);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      updateValue(e.clientX);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e) => {
    updateValue(e.clientX);
  };

  const updateValue = (clientX) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const newValue = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    setValue(newValue);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="w-[80%] ml-[14px]">
      <div 
        ref={sliderRef}
        className="relative h-[56px] rounded cursor-pointer flex items-center"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >

        <div 
          className=" h-[44px] bg-[#FF541F] rounded-l-[12px]"
          style={{ width: `${value}%` }}
        />

        <div 
          className=" h-[44px] bg-[#999898] rounded-r-[12px]"
          style={{ width: `${100 - value}%`}}
        />
                
        <div 
          className="absolute h-full w-[18px] bg-[#FF541F] rounded-[6px]"
          style={{ left: `${value - 4}%` }}
        />

      </div>
    </div>
  );
}

export function OtherSlider() {
  const [value, setValue] = useState(50);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    updateValue(e.clientX);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      updateValue(e.clientX);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e) => {
    updateValue(e.clientX);
  };

  const updateValue = (clientX) => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const newValue = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    setValue(newValue);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-2 flex justify-between text-sm text-gray-600">
        <span>0</span>
        <span>Current: {value}</span>
        <span>100</span>
      </div>
      
      <div 
        ref={sliderRef}
        className="relative h-12 bg-gray-200 rounded cursor-pointer"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
      >
        {/* Slider fill */}
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500 rounded"
          style={{ width: `${value}%` }}
        />
        
        {/* Slider handle */}
        <div 
          className="absolute top-0 h-full aspect-square bg-white border-2 border-blue-500 rounded shadow transform -translate-x-1/2"
          style={{ left: `${value}%` }}
        />
        
        {/* Value markers */}
        <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-2 pointer-events-none">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div 
              key={mark} 
              className="h-3/5 w-1 bg-gray-400 rounded opacity-40"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
// 559AFF
export function StepSlider({state, vmaxInit, allVmaxInit, setAllVmax, setVmax, w, setw, active}) {
  const [value, setValue] = useState(state);
  const totalSteps = 15;
  let temp = []

  const handleClick = (index) => {
    setValue(index);
  };

  useEffect(() => {
    if (active === "v") {
      let e = ((value) * vmaxInit * 2) / 14
      e = Math.floor(e)
      setVmax(e)
  
      if (allVmaxInit && active === "v") {
        for (let i=0; i<allVmaxInit.length; i++) {
          let e = (value * allVmaxInit[i] * 2) / 14
          e = Math.floor(e)
          temp.push(e)
        }
      }
  
      setAllVmax(temp)
    } else if (active === "h") {
      let e = ((value - 7) * 0.008) + 0.06
      console.log("e", e)
      setw(e)
    }

  }, [value])
  
  return (
    <div className="w-full h-[32px]">
      <div className="bottom-0 w-full flex justify-center h-full px-[19px]">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isMilestone = ((index + 1) % 6) - 2 === 0;
          const isActive = index <= value;
          
          return (
            <div
              key={index}
              className="h-full w-[8%] flex items-center justify-center cursor-pointer group"
              onClick={() => handleClick(index)}
            >
              <div
                className={`w-[4px] group-hover:w-[12px] border-[2px] border-transparent ${
                  isMilestone ? 'h-[100%] group-hover:h-[36px]' : 'h-[70%] group-hover:h-[80%]'
                } rounded-[24px] ${
                  isActive ? 'bg-[#FF541F]' : 'bg-gray-300'
                } transition-all duration-200 ease-out`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OscilloscopeKnob({origin, setOrigin}) {
  const [value, setValue] = useState(origin);
  const knobRef = useRef(null);

  useEffect(() => {
    setOrigin(value)
  }, [value])
  
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

  // Handle tap/click interaction
  const handleClick = (e) => {
    if (!knobRef.current) return;
    
    const svgRect = knobRef.current.getBoundingClientRect();
    const centerX = svgRect.width / 2;
    const centerY = svgRect.height / 2;
    
    // Calculate click position relative to SVG element
    const clickX = e.clientX - svgRect.left;
    const clickY = e.clientY - svgRect.top;
    
    // Calculate angle from center of knob to click point
    const deltaX = clickX - centerX;
    const deltaY = centerY - clickY; // Y is inverted in screen coordinates
    
    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Adjust angle to get 0-180 range for half circle
    if (angle < 0) angle += 360;
    
    // Constrain to half circle (0-180 degrees)
    angle = Math.max(0, Math.min(180, angle));
    
    // Update value
    setValue(angleToValue(angle));
  };

  // Calculate indicator position on the arc
  const angle = valueToAngle(value);
  const indicatorAngle = angle * (Math.PI / 180);
  const radius = 80; // This should match the arc radius
  const indicatorX = 100 + Math.cos(indicatorAngle) * radius;
  const indicatorY = 100 - Math.sin(indicatorAngle) * radius; // Negative because Y grows downward in SVG

  return (
    <div className="relative w-full h-full mt-[4px]">
      {/* Arc background */}
      <svg 
        ref={knobRef} 
        className="absolute top-0 left-0 w-full h-full" 
        viewBox="0 0 170 170"
        onClick={handleClick}
      >
        {/* Background track */}
        {
          origin && (
            <>
              <path 
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none" 
                stroke="#aaa" 
                strokeWidth="12" 
                strokeLinecap="round"
              />
              
              {/* Value track */}
              <path 
                d={`M 20 100 A 80 80 0 0 1 ${indicatorX} ${indicatorY}`} 
                fill="none" 
                stroke="#e72f02" 
                strokeWidth="8" 
                strokeLinecap="round"
              />
              
              {/* Indicator dot */}
              <circle 
                cx={indicatorX} 
                cy={indicatorY} 
                r="6" 
                fill="#e72f02" 
              />
              
              {/* Center point */}
              <circle cx="100" cy="100" r="70" fill="#020101" stroke="#FF977B" strokeWidth="2" />
              <circle cx="100" cy="100" r="40" fill="#4C4949"/>

              {/* Tick marks */}
              {Array.from({ length: 11 }).map((_, i) => {
                const tickAngle = (180 - (i * 18)) * (Math.PI / 180);
                const innerRadius = (i % 5 === 0) ? 88 : 85;
                const outerRadius = 96;
                return (
                  <line 
                    key={i}
                    x1={100 + Math.cos(tickAngle) * innerRadius}
                    y1={100 - Math.sin(tickAngle) * innerRadius}
                    x2={100 + Math.cos(tickAngle) * outerRadius}
                    y2={100 - Math.sin(tickAngle) * outerRadius}
                    stroke="#aaa"
                    strokeWidth={i % 5 === 0 ? "4" : "3"}
                  />
                );
              })}

              <line               
                x1={100 + Math.cos(260) * 20}
                y1={100 - Math.sin(260) * 20}
                x2={100 + Math.cos(260) * 40}
                y2={100 - Math.sin(260) * 40}
                stroke='#CE6E20'
                strokeWidth={8}
              />
              
              {/* Value text */}
              <text 
                x="100" 
                y="100" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fill="#00DD10" 
                fontSize="12"
                fontWeight="bold"
              >
                {/* {state} Causing Errors */} 
              </text>
            </>
          )
        }
      </svg>
    </div>
  );
}