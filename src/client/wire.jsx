import React, { useState, useEffect, useRef } from 'react';

const StepWireA = ({id=null, val, thisSelected, setThisSelected, xA=null, xB=null, yA=null, yB=null, svgRef, setExistingPoint}) => {
  const [points, setPoints] = useState({
    start: { x: null, y: null },
    middle: { x: null },
    end: { x: null, y: null }
  });

  const pathRef = useRef(null);

  // Update points when props change
  useEffect(() => {
    if (xA !== null && yA !== null) {
      setPoints(prev => ({
        ...prev,
        start: { x: xA, y: yA },
        middle: { x: xB !== null ? xA - ((xA - xB) / 2) : xA }
      }));
    }
  }, [xA, yA]);

  useEffect(() => {
    if (xB !== null && yB !== null) {
      setPoints(prev => ({
        ...prev,
        end: { x: xB, y: yB },
        middle: { x: xA !== null ? xA - ((xA - xB) / 2) : xB }
      }));
    }
  }, [xB, yB]);

  // Calculate the path between points using horizontal and vertical lines
  const calculatePath = () => {
    const { start, middle, end } = points;
    
    // Only return path if we have all required coordinates
    if (start.x === null || start.y === null || middle.x === null || 
      end.x === null || end.y === null) {
      return '';
    }

    // return `M ${start.x} ${start.y} H ${middle.x} V ${end.y} H ${end.x}`;

    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  };

  // Rest of your component code remains the same
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

  const handleDragStart = (pointKey) => (startEvent) => {
    startEvent.preventDefault();
    
    const handleMouseMove = (moveEvent) => {
      const coords = screenToSVGCoords(moveEvent.clientX, moveEvent.clientY);
      if (pointKey === 'middle') {
        setPoints(prev => ({
          ...prev,
          middle: { x: coords.x }
        }));
      } else {
        setPoints(prev => ({
          ...prev,
          [pointKey]: coords
        }));
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', returnCoords(pointKey))
  };

  const returnCoords = (e) => {
    // console.log("e", e)
      if (e === 'start') {
        // console.log("points start", points.start)
        setExistingPoint(points.start)
      } else if ( e === 'middle') {        
        // console.log("points middle", points.middle)
        setExistingPoint(points.middle)
      } else if (e === 'end') {
        // console.log("points end", points.end)
        setExistingPoint(points.end)
      }
    }

  return (
    <>
      {/* Base wire */}
      {(xA !== null && yA !== null && xB !== null && yB !== null) && (
        <>
          <path
            d={calculatePath()}
            onClick={()=>setThisSelected(id)}
            className={`opacity-0 stroke-white`}
            fill="none"
            strokeWidth="24"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d={calculatePath()}
            onClick={()=>setThisSelected(id)}
            className={` ${ thisSelected === id ? ("stroke-red-500") : ("stroke-blue-500")} opacity-20`}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <path
            ref={pathRef}
            onClick={()=>setThisSelected(id)}
            d={calculatePath()}
            className={` ${ thisSelected === id ? ("stroke-yellow-400") : ("stroke-blue-400")}`}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: '20 40',
              animation: 'dash 2s linear infinite'
            }}
          />

          <text x={(xA + xB + 40) / 2} y={(yA + yB + 40) / 2} className="text"> id {id} val {val}</text>
        </>
      )}
      
      {/* Start point - only show if xA and yA exist */}
      {(xA !== null && yA !== null) && (
        <g>
          <circle
            cx={points.start.x}
            cy={points.start.y}
            r="20"
            className="fill-transparent cursor-move"
            onMouseDown={handleDragStart('start')}
          />
          <circle
            cx={points.start.x}
            cy={points.start.y}
            r="8"
            className="fill-green-400"
            onMouseDown={handleDragStart('start')}
            // onClick={()=>returnCoords('start')}
          />
        </g>
      )}

      {/* Middle points - only show if all coordinates exist */}
      {(xA !== null && yA !== null && xB !== null && yB !== null && xA==="yeah") && (
        <>
          <g>
            <circle
              cx={points.middle.x}
              cy={points.start.y}
              r="20"
              className="fill-transparent cursor-move"
              onMouseDown={handleDragStart('middle')}
            />
            <circle
              cx={points.middle.x}
              cy={points.start.y}
              r="8"
              className="fill-yellow-400"
              onMouseDown={handleDragStart('middle')}
              // onClick={()=>returnCoords('middle')}
            />
          </g>
          <g>
            <circle
              cx={points.middle.x}
              cy={points.end.y}
              r="20"
              className="fill-transparent cursor-move"
              onMouseDown={handleDragStart('middle')}
            />
            <circle
              cx={points.middle.x}
              cy={points.end.y}
              r="8"
              className="fill-yellow-400"
              onMouseDown={handleDragStart('middle')}
              // onClick={()=>returnCoords('middle')}
            />
          </g>
        </>
      )}

      {/* End point - only show if xB and yB exist */}
      {(xB !== null && yB !== null) && (
        <g>
          <circle
            cx={points.end.x}
            cy={points.end.y}
            r="20"
            className="fill-transparent cursor-move"
            onMouseDown={handleDragStart('end')}
          />
          <circle
            cx={points.end.x}
            cy={points.end.y}
            r="8"
            className="fill-red-400"
            onMouseDown={handleDragStart('end')}
            // onClick={()=>returnCoords('end')}
          />
        </g>
      )}
    </>
  );
};

export default StepWireA;