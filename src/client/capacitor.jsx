import React, { useState } from 'react';

export const Capacitor = ({id=null, val, thisSelected, setThisSelected, type="Capacitor", xA=null, xB=null, yA=null, yB=null, svgRef, setExistingPoint, setSecondClick}) => {
  const [pointA, setPointA] = useState({ x: xA, y: yA });
  const [pointB, setPointB] = useState({ x: xB, y: yB });

  
  const returnCoords = (e) => {
    console.log("e", e)
      if (e === 'start') {
        console.log("points start", pointA)
        setExistingPoint(pointA)
        // setSecondClick(true)
      } else if (e === 'end') {
        console.log("points end", pointB)
        setExistingPoint(pointB)
        // setSecondClick(true)
      }
    }

  const handleDrag = (event, setPoint) => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * svg.viewBox.baseVal.width;
    const y = ((event.clientY - rect.top) / rect.height) * svg.viewBox.baseVal.height;
    
    setPoint({ x, y });
  };

  let scale = 4

  const generateCapacitorPath = (p1, p2) => {
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const midPoint = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };

    // Create capacitor plates
    const plate1Points = [
      { x: -10 / scale, y: -20 /scale }, // Top of left plate
      { x: -10 / scale, y: 20 /scale }   // Bottom of left plate
    ];

    const plate2Points = [
      { x: 10 / scale, y: -20 /scale },  // Top of right plate
      { x: 10 /scale, y: 20 /scale }    // Bottom of right plate
    ];

    const plate3Points = [
        { x: -2.5, y: -0 }, 
      ];

    const plate4Points = [
        { x: 2.5, y: -0 }, 
      ];

    // Transform points based on angle
    const transformPoint = (point) => {
      const rotatedX = point.x * Math.cos(angle) - point.y * Math.sin(angle);
      const rotatedY = point.x * Math.sin(angle) + point.y * Math.cos(angle);
      return {
        x: midPoint.x + rotatedX,
        y: midPoint.y + rotatedY
      };
    };

    const transformedPlate1 = plate1Points.map(transformPoint);
    const transformedPlate2 = plate2Points.map(transformPoint);
    const transformedPlate3 = plate3Points.map(transformPoint);
    const transformedPlate4 = plate4Points.map(transformPoint);

    return `
      M ${p1.x} ${p1.y}
      L ${transformedPlate3[0].x} ${transformedPlate3[0].y}
      M ${transformedPlate1[0].x} ${transformedPlate1[0].y}
      L ${transformedPlate1[1].x} ${transformedPlate1[1].y}
      M ${transformedPlate2[0].x} ${transformedPlate2[0].y}
      L ${transformedPlate2[1].x} ${transformedPlate2[1].y}
      M ${transformedPlate4[0].x} ${transformedPlate4[0].y}
      L ${p2.x} ${p2.y}
    `;
  };

  const generateInductorPath = (p1, p2) => {
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const midPoint = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };

    // Create inductor coils
    const coilPoints = [];
    const numCoils = 4;
    const coilSpacing = 15;
    const coilRadius = 10;

    for (let i = 0; i <= numCoils * 8; i++) {
      const x = (i / 8) * coilSpacing - (numCoils * coilSpacing) / 2;
      const y = Math.sin(i * Math.PI / 4) * coilRadius;
      coilPoints.push({ x, y });
    }

    // Transform points based on angle
    const transformedCoils = coilPoints.map(point => {
      const rotatedX = point.x * Math.cos(angle) - point.y * Math.sin(angle);
      const rotatedY = point.x * Math.sin(angle) + point.y * Math.cos(angle);
      return {
        x: midPoint.x + rotatedX,
        y: midPoint.y + rotatedY
      };
    });

    return `
      M ${p1.x} ${p1.y}
      L ${transformedCoils[0].x} ${transformedCoils[0].y}
      ${transformedCoils.map(p => `L ${p.x} ${p.y}`).join(' ')}
      L ${p2.x} ${p2.y}
    `;
  };

  const generateVoltageSourcePath = (p1, p2) => {
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const midPoint = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2
    };

    // Create circle and plus/minus symbols
    const radius = 20;
    const symbolOffset = 12;

    // Transform a point based on angle
    const transformPoint = (x, y) => {
      const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
      const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
      return {
        x: midPoint.x + rotatedX,
        y: midPoint.y + rotatedY
      };
    };

    const plusPoint = transformPoint(0, -symbolOffset);
    const minusPoint = transformPoint(0, symbolOffset);

    return {
      mainPath: `
        M ${p1.x} ${p1.y}
        L ${midPoint.x - radius * Math.cos(angle)} ${midPoint.y - radius * Math.sin(angle)}
        M ${midPoint.x + radius * Math.cos(angle)} ${midPoint.y + radius * Math.sin(angle)}
        L ${p2.x} ${p2.y}
      `,
      circle: {
        cx: midPoint.x,
        cy: midPoint.y,
        r: radius
      },
      plus: {
        x: plusPoint.x,
        y: plusPoint.y
      },
      minus: {
        x: minusPoint.x,
        y: minusPoint.y
      }
    };
  };

  const getComponentPath = () => {
    switch (type) {
      case 'Capacitor':
        return generateCapacitorPath(pointA, pointB);
      case 'Inductor':
        return generateInductorPath(pointA, pointB);
      case 'VoltageSource':
        return generateVoltageSourcePath(pointA, pointB);
      default:
        // console.log("default", type)
        return '';
    }
  };


  const path = getComponentPath();

  return (
    <>
        <defs>
          <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4299e1" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#63b3ed" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4299e1" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {(xA !== null && yA !== null && xB !== null && yB !== null) && (
          <path
            d={path}
            fill="none"
            // stroke="url(#wireGradient)"
            // onClick={()=>setThisSelected(id)} STOPPED WORKING
            className={` ${ thisSelected === id ? ("stroke-yellow-400/0") : ("stroke-white/0")}`}
            strokeWidth="6"
            onMouseDown={() => setThisSelected(id)}
          />
        )}

        {(xA !== null && yA !== null && xB !== null && yB !== null) && (
          <path
            d={path}
            fill="none"
            // stroke="url(#wireGradient)"
            // onClick={()=>setThisSelected(id)} STOPPED WORKING
            className={` ${ thisSelected === id ? ("stroke-orange-400") : ("stroke-blue-500")}`}
            strokeWidth="1"
            onMouseDown={() => setThisSelected(id)}
          />
        )}

        <text x={(xA + xB + 40) / 2} y={(yA + yB + 40) / 2} className="text">id {id} val {val}</text>


        {/* Connection points */}
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
        
    </>
  );
};