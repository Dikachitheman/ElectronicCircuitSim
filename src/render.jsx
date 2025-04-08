import React, { useState, useRef, useEffect } from 'react';
import StepWireA from './client/wire';
import { Resistor } from './client/resistor';
import findCircuitCycles from './engine/loops';
import { Capacitor } from './client/capacitor';
import { Inductor } from './client/inductor';
import { DCVoltageSource } from './client/dc_voltage_source';
import { CapacitorIcon } from './assets/svgIcon';
import { Canvas } from './canvas';
import Sine from './client/sine';
import { analyzeCircuit } from './engine/nodalv2';
import { Discrete } from './engine/formatMatrix';
import { gaussian } from './engine/gaussian';

export const Render = () => {

  const svgRef = useRef(null);

  const [secondClick, setSecondClick] = useState(false)
  const [activeClick, setActiveClick] = useState(null)
  const [existingPoint, setExistingPoint] = useState(null)
  const [selection, setSelection] = useState([])
  const [recentlyUsedTools, setRecentlyUsedTools] = useState([])
  const [selectionInstance, setSelectionInstance] = useState({})
  const [thisSelected, setThisSelected] = useState(null)
  const [isVertical, setIsVertical] = useState('h')
  const [change, setChange] = useState(false)
  const [isOpen, setIsOpen] = useState(false);
  const [isExisting, setIsExisting] = useState(true)
  const [open, setOpen] = useState(null)
  const [scopeList, setScopeList] = useState([])
  const [PVR, setPVR] = useState(null)
  const [tabActive, settabActive] = useState("comp")
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: null, y: null });
  const [drawCoords, setDrawCoords] = useState(null)
  const [activateTool, setActivateTool] = useState(false)
  const [sumDx, setSumDx] = useState(0)
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: 580,
    height: 560
  });

  // useEffect(() => {

  //   const findJunctionsPromise = new Promise((resolve) => {
  //     const junctions = findJunctions(selection);
  //     console.log("junctions", junctions)
  //     resolve(junctions);
  //   });
  
  //   findJunctionsPromise
  //     .then(junctions => {
  //       const loops = findCircuitCycles(junctions);
  //       return { junctions, loops };
  //     })
  //     .then(({ junctions, loops }) => {
  //       const {matrix, cmap} = analyzeCircuit(junctions, loops);
  //       return {matrix, cmap}
  //     })
  //     .then(({matrix, cmap}) => {
  //       let alpha = 90 // peak current, voltage.
  //       let discreteGaussianMatrix = Discrete(matrix, alpha)
  //       return {discreteGaussianMatrix, cmap}
  //     })
  //     .then(({discreteGaussianMatrix, cmap}) => {
  //       let currents = gaussian(discreteGaussianMatrix)
  //       return ({currents, cmap})
  //     })
  //     .then (({currents, cmap}) => {

  //       let currentValue = 0
  //       let peakVoltageRegister = []

  //       for (let c in cmap) {
  //         if (cmap[c].loopIndex.length < 2) {
  //           let thisCurrent = cmap[c].loopIndex[0]
  //           currentValue = currents[thisCurrent]
  //         } else {
  //           let firstCurrent = cmap[c].loopIndex[0]
  //           let secondCurrent = cmap[c].loopIndex[1]
  //           currentValue = currents[firstCurrent] - currents[secondCurrent]
  //         }

  //         let peakVoltage = cmap[c].details.info && (currentValue * getIntVal(cmap[c].details.info))

  //         peakVoltageRegister.push({vmax: peakVoltage, imax: currentValue, impedance: cmap[c].value, comp: cmap[c].details.comp, type: cmap[c].details.type})
  //       }

  //       console.log("pvroo", peakVoltageRegister)
  //       setPVR(peakVoltageRegister)
  //     })

  // }, [change]);

  const parseVoltage = (val) => {
    const numericValue = parseFloat(val);
    return isNaN(numericValue) ? 0 : numericValue;
};

  const getIntVal = (val) => {
    if (val && val.includes('ohms')) {
      // For ohms values
      return parseFloat(val);
    } else if (val && val.includes('uf') || val.includes('H')) {

      if (val.startsWith('j') && val.length > 4) {
          const numericPart = val.slice(1, -1);
          return parseFloat(numericPart);
      } else if (val.startsWith('-j') && val.length > 4) {
          const numericPart = val.slice(2, -2);
          return parseFloat(numericPart);
      } else {
          // For values without j prefix or non-standard format
          return parseVoltage(val);
      }
    }

  }

  useEffect(() => {

    if (selection.length > 0) {
      setIsExisting(true)
    } else {
      setIsExisting(false)
    }

  }, [selection, selectionInstance, activeClick])

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

  const findJunctions = (selection) => {
    // Create a map to store junctions and their associated component IDs
    const junctions = {};
  
    // Iterate through each component in the selection
    selection.forEach((component, index) => {
      // Extract coordinates
      const { xA, yA, xB, yB } = component.coords;
  
      // Check for junctions at xA, yA
      const junctionKeyA = `${xA},${yA}`;
      if (junctions[junctionKeyA]) {
        junctions[junctionKeyA].components.push(component.id);
        junctions[junctionKeyA].type.push(component.component);
        junctions[junctionKeyA].value.push(component.value);
        
        // Only set polar if not already set and component is DCVoltageSource
        if ((junctions[junctionKeyA].polar === "none" || !junctions[junctionKeyA].polar) && 
            (component.component === "DCVoltageSource" || junctions[junctionKeyA].type.includes("DCVoltageSource"))) {
          junctions[junctionKeyA].polar = "positive";
        }

      } else {
        junctions[junctionKeyA] = {
          id: `J${Object.keys(junctions).length + 1}`, // Generate unique junction ID
          coords: { x: xA, y: yA },
          components: [component.id],
          value: [component.value],
          type: [component.component],
          polar: component.component === "DCVoltageSource" ? "positive" : "none"
        };
      }
  
      // Check for junctions at xB, yB
      const junctionKeyB = `${xB},${yB}`;
      if (junctions[junctionKeyB]) {
        junctions[junctionKeyB].components.push(component.id);
        junctions[junctionKeyB].type.push(component.component);
        junctions[junctionKeyB].value.push(component.value);
        
        // Only set polar if not already set and component is DCVoltageSource
        if ((junctions[junctionKeyB].polar === "none" || !junctions[junctionKeyB].polar) && 
            (component.component === "DCVoltageSource" || junctions[junctionKeyB].type.includes("DCVoltageSource"))) {
          junctions[junctionKeyB].polar = "negative";
        }

      } else {
        junctions[junctionKeyB] = {
          id: `J${Object.keys(junctions).length + 1}`, // Generate unique junction ID
          coords: { x: xB, y: yB },
          components: [component.id],
          value: [component.value],
          type: [component.component],
          polar: component.component === "DCVoltageSource" ? "negative" : "none"
        };
  
      }
    });
    // Convert the map to an array of junctions
    return Object.values(junctions);
  };

  const handleToolClick = (component) => {
    // e.preventDefault()

    if (component === "StepWire" && selectionInstance.component !== "StepWire") {
      const init = {id: selection.length + 1, component: "StepWire", value: "2A", orientation: isVertical, coords: {}}
      setSelectionInstance(init)
      setActiveClick(component)
    } else if (component === "Resistor" && selectionInstance.component !== "Resistor") {
      const init = {id: selection.length + 1, component: "Resistor", value: "4ohms", orientation: isVertical, coords: {}}
      setSelectionInstance(init)
      setActiveClick(component)
    } else if (component === "Capacitor" && selectionInstance.component !== "Capacitor") {
      const init = {id: selection.length + 1, component: "Capacitor", value: "10uf", orientation: isVertical, coords: {}}
      setSelectionInstance(init)
      setActiveClick(component)
    } else if (component === "DCVoltageSource" && selectionInstance.component !== "DCVoltageSource") {
      const init = {id: selection.length + 1, component: "DCVoltageSource", value: "5VDC", orientation: isVertical, coords: {}}
      setSelectionInstance(init)
      setActiveClick(component)
    } else if (component === "Inductor" && selectionInstance.component !== "Inductor") {
      const init = {id: selection.length + 1, component: "Inductor", value: "2H", orientation: isVertical, coords: {}}
      setSelectionInstance(init)
      setActiveClick(component)
    } else {
      setActiveClick(null)
      setSelectionInstance({})
    }
  }

  const handleCanvasClick = (e) => {    

      const coords = screenToSVGCoords(e.clientX, e.clientY);

      if (activeClick && !existingPoint) {
        if (secondClick) {
          selectionInstance.coords.xB = isVertical === 'v' ? selectionInstance.coords.xA : coords.x
          selectionInstance.coords.yB = isVertical === 'h' ? selectionInstance.coords.yA : coords.y
          selection.pop()
          setSelection([...selection, selectionInstance])
          setRecentlyUsedTools([...recentlyUsedTools, {type: selectionInstance.component, icon: <CapacitorIcon />}])
          setSelectionInstance({})
          setSecondClick(false)
          setActiveClick(null)
        } else {
          selectionInstance.coords.xA = coords.x 
          selectionInstance.coords.yA = coords.y
          setSelection([...selection, selectionInstance])
          setSecondClick(true)
        }
      }

      if (activeClick && existingPoint) {
          
        if (secondClick) {
          selectionInstance.coords.xB = isVertical === 'v' ? selectionInstance.coords.xA : existingPoint.x
          selectionInstance.coords.yB = isVertical === 'h' ? selectionInstance.coords.yA : existingPoint.y
          selection.pop()
          setSelection([...selection, selectionInstance])
          setRecentlyUsedTools([...recentlyUsedTools, {type: selectionInstance.component, icon: <CapacitorIcon />}])
          setSelectionInstance({})
          setSecondClick(false)
          setActiveClick(null)
          setExistingPoint(null)

        } else {

          selectionInstance.coords.xA = existingPoint.x
          selectionInstance.coords.yA = existingPoint.y

          setSelection([...selection, selectionInstance])
          setSecondClick(true)
          setExistingPoint(null)
        }
      } 
  }

  const changeOrientation = () => {
    const newOrientation =
    selectionInstance.orientation === 'v'
      ? 'h'
      : selectionInstance.orientation === 'h'
      ? "none"
      : 'v';        
      
    setIsVertical(newOrientation);
  
    setSelectionInstance((prevInstance) => ({
      ...prevInstance, 
      orientation: newOrientation === 'v' ? 'v' : newOrientation === 'h' ? 'h' : newOrientation === 'none' && 'none', 
    }));
  
  };

  const ElectricalComponent = ({ id, val, type, xA, xB, yA, thisSelected, setThisSelected, yB,  svgRef }) => {
    
    console.log("selection ec", selection[id-1])
    const vert = selection[id - 1]['orientation']
    const componentMap = {
      StepWire: <StepWireA id={id} val={val} xA={xA} xB={xB && vert === 'v' ? xA : xB} yA={yA} yB={yB && vert === 'h' ? yA : yB } thisSelected={thisSelected} setThisSelected={setThisSelected} svgRef={svgRef} setExistingPoint={setExistingPoint}/>,
      Capacitor: <Capacitor id={id} val={val} xA={xA} xB={xB && vert === 'v' ? xA : xB} yA={yA} yB={yB && vert === 'h' ? yA : yB } thisSelected={thisSelected} setThisSelected={setThisSelected} svgRef={svgRef} setExistingPoint={setExistingPoint}/>,
      Inductor: <Inductor id={id} val={val} xA={xA} xB={xB && vert === 'v' ? xA : xB} yA={yA} yB={yB && vert === 'h' ? yA : yB } thisSelected={thisSelected} setThisSelected={setThisSelected} svgRef={svgRef} setExistingPoint={setExistingPoint}/>,
      Resistor: <Resistor id={id} val={val} xA={xA} xB={xB && vert === 'v' ? xA : xB} yA={yA} yB={yB && vert === 'h' ? yA : yB } thisSelected={thisSelected} setThisSelected={setThisSelected} svgRef={svgRef} setExistingPoint={setExistingPoint}/>,
      DCVoltageSource: <DCVoltageSource id={id} val={val} xA={xA} xB={xB && vert === 'v' ? xA : xB} yA={yA} yB={yB && vert === 'h' ? yA : yB } thisSelected={thisSelected} setThisSelected={setThisSelected} svgRef={svgRef} setExistingPoint={setExistingPoint}/>,
      // Add more component types here
    };
  
    const ComponentToRender = componentMap[type];
    if (!ComponentToRender) {
      console.error(`Invalid component type: ${type}`);
      console.log(`Invalid component type: ${type}`);
      return null; // Or render a default component
    }
  
    return ComponentToRender;
  };

  const handleComponentClick = (id) => {
    setThisSelected(id)
  }

  // useEffect(() => {
  //   if (activateTool === true && drawCoords) {
  //     console.log("tool activate click");
  //     Promise.resolve()
  //       .then(() => {
  //         return handleToolClick("Capacitor");
  //       })
  //       .then(() => {
  //         return handleCanvasClick({clientX: drawCoords[0][0], clientY: drawCoords[0][1]});
  //       })
  //       .then(() => {
  //         return handleCanvasClick({clientX: drawCoords[1][0], clientY: drawCoords[1][1]});
  //       })
  //       .then(() => {
  //         setActivateTool(false);
  //         setDrawCoords(null);
  //         console.log("tool activation sequence completed");
  //       })
  //       .catch(error => {
  //         console.error("Error in tool activation sequence:", error);
  //         setActivateTool(false);
  //         setDrawCoords(null);
  //       });
  //   } else {
  //     console.log("Tool activation conditions not met");
  //   }
  // }, [activateTool, drawCoords, selectionInstance, activeClick]);

  useEffect(() => {

    const coordDistance = (xa, ya, xb, yb) => {
      // d=√((x2 – x1)² + (y2 – y1)²)

      let offset = 0.01

      let dx = xb - xa
      let dy = yb - ya
      let dx2 = dx * dx
      let dy2 = dy * dy

      let d = Math.sqrt(dx2 + dy2)

      return d
    }

    if (activateTool === true && drawCoords) {
      console.log("here")
      const init = {id: selection.length + 1, component: "Capacitor", value: "10uf", orientation: isVertical, coords: {}}

      let e = {clientX: drawCoords[0][0] * 6, clientY: drawCoords[0][1] * 6, clientXB: drawCoords[1][0] * 6, clientYB: drawCoords[1][1] * 6}
      const coordsA = screenToSVGCoords(e.clientX, e.clientY);
      const coordsB = screenToSVGCoords(e.clientXB, e.clientYB);

      if (selection.length > 0) {
        let result = 500; // distance of 50px or less. For now.

        for (let i = 0; i < selection.length; i++) {
          let xA = selection[i].coords.xA
          let xB = selection[i].coords.xB
          let yA = selection[i].coords.yA
          let yB = selection[i].coords.yB

          let d = coordDistance(xA, yA, drawCoords[0][0] * 6, drawCoords[0][1] * 6 )
          if (d < result) { result = d; coordsA.x = xA; coordsA.y = yA}
          d = coordDistance(xB, yB, drawCoords[0][0] * 6, drawCoords[0][1] * 6 )
          if (d < result) { result = d; coordsA.x = xB; coordsA.y = yA}
          d = coordDistance(xA, yA, drawCoords[1][0] * 6, drawCoords[1][1] * 6 )
          if (d < result) { result = d; coordsB.x = xA; coordsB.y = yB}
          d = coordDistance(xB, yB, drawCoords[1][0] * 6, drawCoords[1][1] * 6 )
          if (d < result) { result = d; coordsB.x = xA; coordsA.y = xB}
        }
      }

      init.coords.xA = coordsA.x 
      init.coords.yA = coordsA.y
      init.coords.xB = isVertical === 'v' ? init.coords.xA : coordsB.x
      init.coords.yB = isVertical === 'h' ? init.coords.yA : coordsB.y
      setRecentlyUsedTools([...recentlyUsedTools, {type: init.component, icon: <CapacitorIcon />}])
      setSelection([...selection, init])
      setSelectionInstance({})
      setActivateTool(false)

    }

  }, [activateTool])

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const scale = e.deltaY > 0 ? 1.1 : 0.9;

      // Calculate new dimensions
      const newWidth = viewBox.width * scale;
      const newHeight = viewBox.height * scale;

      if (newHeight < 40 || newHeight > 580) return;

      // Mouse position relative to SVG
      const rect = svg.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * viewBox.width + viewBox.x;
      const mouseY = ((e.clientY - rect.top) / rect.height) * viewBox.height + viewBox.y;

      // Calculate new viewBox position
      setViewBox(prev => ({
        x: mouseX - (mouseX - prev.x) * scale,
        y: mouseY - (mouseY - prev.y) * scale,
        width: newWidth,
        height: newHeight
      }));
    };  

    const handleMouseDown = (e) => {
      if (!isDragging) return;
      setDragStart({ x: e.clientX, y: e.clientY });
      console.log("mousedown", { x: e.clientX, y: e.clientY })
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      if (dragStart.x === null && dragStart.y === null) return;

      const dx = (e.clientX - dragStart.x) * (viewBox.width / svg.clientWidth);
      const dy = (e.clientY - dragStart.y) * (viewBox.height / svg.clientHeight);

      // if (sumDx > 200 || sumDx < -200) return
      // setSumDx(sumDx + dx)
      // console.log("sum dx", sumDx)

      let sdx = sumDx + dx
      console.log("sum dx", sumDx)

      if (sdx > 200 || sdx < -200) return

      setSumDx(sdx)

      setViewBox(prev => ({
        x: prev.x - dx,
        y: prev.y - dy,
        width: prev.width,
        height: prev.height
      }));

      // console.log("viewBox", viewBox.x, viewBox.y)
      // if (viewBox.x > 300 || viewBox.y > 300 || viewBox.x < -300 || viewBox.y < -300) {
      //   handleMouseUp()
      //   console.log("done")
      //   return
      // } RECALL: Look at this later.

      setDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      // setIsDragging(false);
      setDragStart({x: null, y: null})
    };

    const handleDoubleClick = () => {
      setIsDragging(true); // Enable dragging mode on double-click
    };

    svg.addEventListener('wheel', handleWheel, { passive: false });
    svg.addEventListener('mousedown', handleMouseDown);
    svg.addEventListener('mousemove', handleMouseMove);
    svg.addEventListener('mouseup', handleMouseUp);
    svg.addEventListener('mouseleave', handleMouseUp);

    return () => {
      svg.removeEventListener('wheel', handleWheel);
      svg.removeEventListener('mousedown', handleMouseDown);
      svg.removeEventListener('mousemove', handleMouseMove);
      svg.removeEventListener('mouseup', handleMouseUp);
      svg.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [viewBox, isDragging, dragStart]);

  const handleAddScope = (id) => {
    const filteredPVR = PVR.filter(p => p.comp === id);
    setScopeList([...scopeList, filteredPVR[0]])
  }

  return (
    <div className="w-full h-screen relative cursor-default">

      <div className='absolute top-[150px] w-screen'>
        <Canvas setViewBox={setViewBox} isDragging={isDragging} setDrawCoords={setDrawCoords} setActivateTool={setActivateTool}/>
      </div>

      <div className='absolute bottom-[40px] w-fit left-[28%]'>
        {/* <Sine pvr={scopeList}/> */}
      </div>

      {/* transform -translate-x-1/2 */}
      <div className=' top-nav-wrapper absolute z-50 flex pb-[14px] flex-col items-center w-[100%] shadow-[600px]
        backdrop-blur-[44px] border-b-[1px] border-gray-800 bg-gradient-to-r from-gray-300/5 via-blue-400/10 to-slate-500/15'>

        <div className='workspace flex justify-between w-[90%] px-[14px] pt-[11px] pb-[14px]'>

          <div className=' flex items-end '>
            <p className='text-[#7a7a7a] text-[24px]'>Workspace</p>
            <p className='ml-[8px] pb-[4px] mr-[2px] text-[#9cff19]'>RLC/</p> <p className='pb-[4px] text-[#ff12b4]'>Operational Amplifier</p>
          </div>

          <div className='text-[#D331CF] font-[700] flex items-end'>
            Flamin<p className='italic'>go</p>
          </div>

        </div>

        <div className=' top-nav flex top-[40px] z-50 left-1/2 w-[90%] 
           text-white border rounded-[44px] py-[4px] px-[16px] bg-white/4 
            backdrop-blur-md border-white/10 shadow-lg items-center'>

          <div className='space-x-[44px] flex items-center w-[24%] pl-[18px]'>
            <p className='text-[18px]'>Home</p>
            <p className='text-[18px]'>Options</p>
            <p className='text-[18px]'>Save</p>
          </div>

          <div className="relative">
            {/* Dropdown Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-[24px] py-[4px] bg-[#141414] text-white border border-slate-500 rounded-[44px]"
            >
              Select Tools
            </button>

            {isOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 shadow-lg rounded-lg p-2 text-black">
                <button
                  onClick={() => handleToolClick("Resistor")}
                  className={`block w-full text-left px-4 py-1 mt-1 rounded-[44px] ${
                    activeClick === "Resistor" && "bg-black text-white"
                  }`}
                >
                  Resistor
                </button>

                <button
                  onClick={() => handleToolClick("Capacitor")}
                  className={`block w-full text-left px-4 py-1 mt-1 rounded-[44px] ${
                    activeClick === "Capacitor" && "bg-black text-white"
                  }`}
                >
                  Capacitor
                </button>

                <button
                  onClick={() => handleToolClick("StepWire")}
                  className={`block w-full text-left px-4 py-1 mt-1 rounded-[44px] ${
                    activeClick === "StepWire" && "bg-black text-white"
                  }`}
                >
                  Wire
                </button>

                <button
                  onClick={() => handleToolClick("Inductor")}
                  className={`block w-full text-left px-4 py-1 mt-1 rounded-[44px] ${
                    activeClick === "Inductor" && "bg-black text-white"
                  }`}
                >
                  Inductor
                </button>

                <button
                  onClick={() => handleToolClick("DCVoltageSource")}
                  className={`block w-full text-left px-4 py-1 mt-1 rounded-[44px] ${
                    activeClick === "DCVoltageSource" && "bg-black text-white"
                  }`}
                >
                  DC Voltage
                </button>
              </div>
            )}
          </div>
          
          <div className='flex grow py-[4px] pl-[6px] rounded-[44px] ml-[8px] mr-[194px] 
            bg-gradient-to-r from-[#0000FF] via-[#ff00a2] to-[#00bfff]'>
            
            <div className='bg-black text-[#cccccc] rounded-[44px] w-[94px] flex justify-center'>
            {
              activeClick ? (
                  <p>{selectionInstance.component}</p>
              ) : (
                  <p>Not Active</p>
              )
            }
            </div>

            <div className='flex space-x-[24px] pl-[24px]'>
              {recentlyUsedTools.map((tool, index) => (
                <div
                  key={index}
                  onClick={() => handleToolClick(tool.type)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div>{tool.icon}</div>
                  <p className="hidden group-hover:block absolute -bottom-4 whitespace-nowrap bg-white/70 backdrop-blur-lg text-black px-2 py-1 rounded-md text-sm">
                    {tool.type}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className='flex space-x-[12px]' onClick={() => setIsDragging(!isDragging)}>
            <div>
              {isDragging ? "Active" : "Not Active"}
            </div>
            <div>
              <CapacitorIcon />
            </div>
          </div>

          <div className=" flex px-[24px] gap-x-[44px] text-white"> 
            <button
              onClick={() => changeOrientation()}
              className={`py-[2px] w-[104px] rounded-[44px] bg-[#141414] ${
                isVertical === 'v' ? 'text-purple-500 ' : isVertical === 'h' ? 'text-[#0ad2ff] ' : isVertical === 'none' && 'text-orange-200 '
              }`}
            >
              {isVertical === 'v' ? "Vertical" : isVertical === 'h' ? "Horizontal" : isVertical === 'none' && 'none'}
            </button>

            {/** FLAG: debug */}
            <button onClick={() => setChange(!change)}>Run</button>
          </div>
        </div>
      </div>

      <div className='components-list bg-gradient-to-b from-gray-300/5 via-blue-400/10 to-slate-500/15 backdrop-blur-[64px] border-white/10 rounded-lg shadow-lg overflow-hidden border w-[300px] absolute top-[140px] left-[100px]'>

        <div className='bg-black/60 pt-[24px] '>
          {/* <div>

            <div>
              {
                existingPoint ? (
                  <p className='text-white'>{existingPoint.x} {existingPoint.y} Active</p>
                ) : (
                  <p className='text-white'>existing point Not Active</p>
                )
              }
            </div>
          </div> */}

          <div className='flex justify-between w-[100%] px-[12px] mb-[12px]'>
            <div className='border border-[#494949] px-[6px] rounded-[24px] w-fit '>
              <svg width="60" viewBox="0 0 400 200">
                <circle cx="100" cy="100" r="30" fill={existingPoint ? "#3498db" : "#e74c3c"} />
                
                <line x1="140" y1="100" x2="260" y2="100" stroke="#494949" stroke-width="5" />
                
                <circle cx="300" cy="100" r="30" fill={existingPoint ? "#3498db" : "#e74c3c"} />
              </svg>
            </div>

            <p onClick={()=>setThisSelected(null)} className='text-[#7c7c7c] border border-[#494949] hover:text-[#202020] hover:bg-[#636363] px-[14px] rounded-[24px] flex items-center'>Clear</p>
          </div>

        <div className='component-or-history flex justify-center'>
          <div className='w-7 border border-b-gray-600 border-t-0 border-l-0 border-r-0'></div>
          
          <div className={`w-32 pl-1 ${
            tabActive === "comp"
              ? 'rounded-t-md border border-t-gray-600 border-b-0 text-gray-400 bg-white/10 backdrop-blur-lg border-white/30' 
              : 'border border-b-gray-600 border-t-0 border-l-0 border-r-0 text-gray-600'
          }`} onClick={()=>settabActive("comp")}>
            Components
          </div>
          
          <div className='w-7 border border-b-gray-600 border-t-0 border-l-0 border-r-0'></div>
          
          <div className={`w-32 pl-1 ${
            tabActive === "history" 
              ? 'rounded-t-md border border-t-gray-600 border-b-0 text-gray-400 bg-white/10 backdrop-blur-lg border-white/30' 
              : 'border border-b-gray-600 border-t-0 border-l-0 border-r-0 text-gray-600'
          }`} onClick={()=>settabActive("history")}>
            History
          </div>
          
          <div className='w-7 border border-b-gray-600 border-t-0 border-l-0 border-r-0'></div>
        </div>

        </div>

        <div className='min-h-[400px] pb-[44px] w-full flex'>
          {
            isExisting ? (
              <div className='w-full relative space-y-[16px] pt-[24px] px-[14px]'>
                {
                  selection && selection.map((item, index) => 
                    open === item.id ? (
                      <div key={index} className={`h-[160px] bg-white/10 backdrop-blur-lg border border-white/10 hover:border-white/30 rounded-lg shadow-lg text-[#c1c1c1] px-[14px] pt-[4px] ${ thisSelected === item.id ? ("text-[#ffe121]") : ("text-[#e9e9e9]")}`}>
                        {/* {item.id} {item.value} {item.component} x-{item.coords.xA} y-{item.coords.yA} x2-{item.coords.xB} y2-{item.coords.yB} */}

                        <div className='w-full flex justify-end' >
                          <div onClick={()=>setOpen(null)}>
                            Close
                          </div>
                        </div>
                        <div className='flex justify-between'>
                          <p className='text-[34px] leading-[18px]'>{item.value}</p>
                          <p><CapacitorIcon /></p>
                        </div>
  
                        <div className='flex space-x-[8px]'>
                          <p className='text-[14px] text-[#ff19ab]'>12Amps</p>
                          <p className='text-[14px] text-[#19ffe4]'>14Volts</p>
                          <p className='text-[14px] text-[#a7ff19]'>41.09hz</p>
                          <p className='text-[14px] text-[#ffba19]'>4W</p>
                        </div>

                        <div className='mt-[8px]' onClick={()=>handleAddScope(item.id)}>Scope</div>
  
                        <div className='flex h-[40px] items-end'>
                          <p className='pr-[8px]' onClick={()=>handleComponentClick(item.id)}>{item.component}</p>
                          <p className='grow'>{item.id}</p>
  
                          <p>Edit</p>
                        </div>
                      </div>
                    ) : (
                      <div onClick={()=>setOpen(item.id)} className='flex items-center px-[24px] h-[50px] bg-white/10 backdrop-blur-lg border border-white/10 hover:border-white/30 rounded-lg shadow-lg text-[#c1c1c1]'>
                        <p className='mr-[12px]'>{item.value}</p>
                        <p>{item.id}</p>
                        <div className='grow flex justify-end'>
                          <CapacitorIcon />
                        </div>
                      </div>
                    )
                  )
                }
              </div>
            ) : (
              <div className='w-full flex items-center justify-center'>
                <CapacitorIcon />
              </div>
            )
          }
        </div>
        
      </div>

      <svg 
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full bg-black"
        onClick={handleCanvasClick}
      >

        <defs>
          <pattern 
            id="dotPattern" 
            x="0" 
            y="0" 
            width="5" 
            height="5" 
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2.5" cy="2.5" r="0.2" fill="gray" />
          </pattern>
        </defs>

        
        <rect 
          x={viewBox.x} 
          y={viewBox.y} 
          width={viewBox.width} 
          height={viewBox.height}
          fill="url(#dotPattern)"
        />

        {
          {selection} &&
          selection.map((item, key) => (
            <ElectricalComponent
              key={key}
              id={item.id}
              val={item.value}
              type={item.component}
              xA={item.coords.xA}
              xB={item.coords.xB}
              yA={item.coords.yA}
              yB={item.coords.yB}
              thisSelected={thisSelected}
              setThisSelected={setThisSelected}
              svgRef={svgRef}
            />
          ))
        }
      </svg>
      
      <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -200;
            }
          }

          .text {
            font: italic 8px serif;
            fill: white;
          }
        `}
        </style>
    </div>
    
  );
};
