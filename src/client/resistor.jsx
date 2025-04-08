import React, { useRef, useState } from "react";


export const Resistor = ({id=null, val, thisSelected, setThisSelected, xA=null, xB=null, yA=null, yB=null, svgRef, setExistingPoint}) => {
  const [pointA, setPointA] = useState({ x: xA, y: yA });
  const [pointB, setPointB] = useState({ x: xB, y: yB });

  const [d, setD] = useState(0)

  const handleDrag = (event, setPoint) => {
    if (!svgRef.current) return;
    let distance = Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2))
    if ( distance < 200 ) {
      console.log(distance)
    }
    setD(distance)

    
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * svg.viewBox.baseVal.width;
    const y = ((event.clientY - rect.top) / rect.height) * svg.viewBox.baseVal.height;
    
    setPoint({ x, y });
  };

  const generateResistorPath = (p1, p2) => {
    // Calculate angle between points
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    const midPoint = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };

    let scale = 4
    // Create zigzag pattern relative to the line
    const zigzagPoints = [
      { x: -20 / scale, y: 0 / scale},    // Start of resistor
      { x: -10 / scale, y: -20 / scale},  // First zigzag up
      { x: 10 / scale, y: 20 / scale},    // Down
      { x: 30 / scale, y: -20 / scale},   // Up
      { x: 50 / scale, y: 20 / scale},    // Down
      { x: 70 / scale, y: -20 / scale},   // Up
      { x: 80 / scale, y: 0 / scale},    // Down
      { x: 100 / scale, y: 0 / scale}      // End of resistor
    ];

    // Transform zigzag points based on angle
    const transformedZigzag = zigzagPoints.map(point => {
      const rotatedX = point.x * Math.cos(angle) - point.y * Math.sin(angle);
      const rotatedY = point.x * Math.sin(angle) + point.y * Math.cos(angle);
      return {
        x: midPoint.x + rotatedX,
        y: midPoint.y + rotatedY
      };
    });

    // Generate path
    return `
      M ${p1.x} ${p1.y}
      L ${transformedZigzag[0].x} ${transformedZigzag[0].y}
      L ${transformedZigzag[1].x} ${transformedZigzag[1].y}
      L ${transformedZigzag[2].x} ${transformedZigzag[2].y}
      L ${transformedZigzag[3].x} ${transformedZigzag[3].y}
      L ${transformedZigzag[4].x} ${transformedZigzag[4].y}
      L ${transformedZigzag[5].x} ${transformedZigzag[5].y}
      L ${transformedZigzag[6].x} ${transformedZigzag[6].y}
      L ${p2.x} ${p2.y}
    `;
  };

  const pathD = generateResistorPath(pointA, pointB);

  const returnCoords = (e) => {
      if (e === 'start') {
        // console.log("points start", points.start)
        setExistingPoint(pointA)
      } else if (e === 'end') {
        // console.log("points end", points.end)
        setExistingPoint(pointB)
      }
    }
    
  return (
    <>

        <defs>
          <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4299e1" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#63b3ed" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4299e1" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {
          (xA !== null && yA !== null && xB !== null && yB !== null) && (
            <>
            <path
              d={pathD}
              fill="none"
              onClick={()=>setThisSelected(id)}
              // stroke="url(#wireGradient)"
              className={` ${ thisSelected === id ? ("stroke-yellow-400") : ("stroke-blue-500")}`}
              strokeWidth="1"
            />

            <text x={(xA + xB + 40) / 2} y={(yA + yB + 40) / 2} className="text">id {id}, val {val}</text>

            </>
          )
        }

        
        {
          (xA !== null && yA !== null) && (
            <circle
            cx={pointA.x}
            cy={pointA.y}
            r="2"
            className="fill-blue-400 cursor-pointer"
            onMouseDown={(event) => {
              event.preventDefault();
              const onMouseMove = (e) => handleDrag(e, setPointA);
              const onMouseUp = () => {
                window.removeEventListener("mousemove", onMouseMove);
                window.removeEventListener("mouseup", onMouseUp);
              };
              window.addEventListener("mousemove", onMouseMove);
              window.addEventListener("mouseup", onMouseUp);
              document.addEventListener('mousedown', returnCoords('start'))
            }}
          />
          )
        }

        {
          (xB !== null && yB !== null) && (
            <circle
              cx={pointB.x}
              cy={pointB.y}
              r="2"
              className="fill-blue-400 cursor-pointer"
              onMouseDown={(event) => {
                event.preventDefault();
                const onMouseMove = (e) => handleDrag(e, setPointB);
                const onMouseUp = () => {
                  window.removeEventListener("mousemove", onMouseMove);
                  window.removeEventListener("mouseup", onMouseUp);
                };
                window.addEventListener("mousemove", onMouseMove);
                window.addEventListener("mouseup", onMouseUp);
                document.addEventListener('mousedown', returnCoords('end'))
              }}
            />
          )
        }

      <div className="text-black">{d}</div>
     </>
  );
};
