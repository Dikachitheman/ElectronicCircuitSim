import React, { useState, useRef, useEffect } from 'react';
import StepWireA from './client/wire';
import { Resistor } from './client/resistor';
import findCircuitCycles from './engine/loops';
import { CircuitAnalyzer } from './engine/analyze';
import { Capacitor } from './client/capacitor';
import { Inductor } from './client/inductor';
import { DCVoltageSource } from './client/dc_voltage_source';

export const Render = () => {
    const svgRef = useRef(null);
    const [activeShapes, setActiveShapes] = useState(new Set());
    const [selectedTool, setSelectedTool] = useState(null);
    const [secondClick, setSecondClick] = useState(false)
    const [activeClick, setActiveClick] = useState(null)
    const [existingPoint, setExistingPoint] = useState(null)
    const [selection, setSelection] = useState([])
    const [selectionInstance, setSelectionInstance] = useState({})
    const [thisSelected, setThisSelected] = useState(null)
    const [isVertical, setIsVertical] = useState('h')
    const [change, setChange] = useState(false)
    // const [junctionState, setJunctionState] = useState([])
    const [points, setPoints] = useState({
      start: { x: 100, y: 100 },
      middle: { x: 400, y: 200 },
      end: { x: 700, y: 300 }
    });

    const [xA, sxA] = useState(null)
    const [xB, sxB] = useState(null)
    const [yA, syA] = useState(null)
    const [yB, syB] = useState(null)

    useEffect(() => {
      const junctions = findJunctions(selection);
      console.log("junctions", junctions);
      console.log("list", selection)

      findCircuitCycles(junctions)

    }, [change])


    const toggleShape = (shapeName) => {
      setActiveShapes(prev => {
        const newShapes = new Set(prev);
        if (newShapes.has(shapeName)) {
          newShapes.delete(shapeName);
        } else {
          newShapes.add(shapeName);
        }
        return newShapes;
      });

      setSelectedTool(shapeName)
    };

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

          // console.log("keya", junctions[junctionKeyA])

        } else {
          junctions[junctionKeyA] = {
            id: `J${Object.keys(junctions).length + 1}`, // Generate unique junction ID
            coords: { x: xA, y: yA },
            components: [component.id],
            value: [component.value],
            type: [component.component]
          };
        }
    
        // Check for junctions at xB, yB
        const junctionKeyB = `${xB},${yB}`;
        if (junctions[junctionKeyB]) {
          junctions[junctionKeyB].components.push(component.id);
          junctions[junctionKeyB].type.push(component.component);
          junctions[junctionKeyB].value.push(component.value);

          // console.log("keyb", junctions[junctionKeyB])
        } else {
          junctions[junctionKeyB] = {
            id: `J${Object.keys(junctions).length + 1}`, // Generate unique junction ID
            coords: { x: xB, y: yB },
            components: [component.id],
            value: [component.value],
            type: [component.component]
          };
        }
      });
      // Convert the map to an array of junctions
      return Object.values(junctions);
    };

    const handleToolClick = (component) => {
      // e.preventDefault()

      if (component === "StepWire" && selectionInstance.component !== "StepWire") {
        // console.log("click")
        // {component: "StepWire", coords: {xA, xB, yA, yB}}
        const init = {id: selection.length + 1, component: "StepWire", value: "2A", orientation: isVertical === 'v' ? "v" : isVertical === 'h' ? "h" : isVertical === 'none' && 'none', coords: {}}
        setSelectionInstance(init)
        setActiveClick(component)
      } else if (component === "Resistor" && selectionInstance.component !== "Resistor") {
        // console.log("click")
        const init = {id: selection.length + 1, component: "Resistor", value: "4ohms", orientation: isVertical === 'v' ? "v" : isVertical === 'h' ? "h" : isVertical === 'none' && 'none', coords: {}}
        setSelectionInstance(init)
        setActiveClick(component)
      } else if (component === "Capacitor" && selectionInstance.component !== "Capacitor") {
        // console.log("click")
        const init = {id: selection.length + 1, component: "Capacitor", value: "10uf", orientation: isVertical === 'v' ? "v" : isVertical === 'h' ? "h" : isVertical === 'none' && 'none', coords: {}}
        setSelectionInstance(init)
        setActiveClick(component)
      } else if (component === "DCVoltageSource" && selectionInstance.component !== "DCVoltageSource") {
        // console.log("click")
        const init = {id: selection.length + 1, component: "DCVoltageSource", value: "5V", orientation: isVertical === 'v' ? "v" : isVertical === 'h' ? "h" : isVertical === 'none' && 'none', coords: {}}
        setSelectionInstance(init)
        setActiveClick(component)
      } else if (component === "Inductor" && selectionInstance.component !== "Inductor") {
        // console.log("click")
        const init = {id: selection.length + 1, component: "Inductor", value: "2H", orientation: isVertical === 'v' ? "v" : isVertical === 'h' ? "h" : isVertical === 'none' && 'none', coords: {}}
        setSelectionInstance(init)
        setActiveClick(component)
      } else {
        setActiveClick(null)
        setSelectionInstance({})
      }
    }

    const handleCanvasClick = (e) => {    
        const coords = screenToSVGCoords(e.clientX, e.clientY);
        // console.log(coords)
        // console.log(selectedTool)

        if (activeClick && !existingPoint) {

          // console.log("ex po not active")

          if (secondClick) {
            // console.log("second click no ex po")
            selectionInstance.coords.xB = isVertical === 'v' ? selectionInstance.coords.xA : coords.x
            selectionInstance.coords.yB = isVertical === 'h' ? selectionInstance.coords.yA : coords.y
            // console.log("instance", selectionInstance)
            selection.pop()
            setSelection([...selection, selectionInstance])
            setSelectionInstance({})
            setSecondClick(false)
            setActiveClick(null)

          } else {
            // console.log("first click no ex po")
            selectionInstance.coords.xA = coords.x 
            selectionInstance.coords.yA = coords.y
            // console.log("instance", selectionInstance)
            setSelection([...selection, selectionInstance])
            setSecondClick(true)
          }
        }

        if (activeClick && existingPoint) {

          // console.log("ex po active")
            
          if (secondClick) {
            // console.log("second click ex po")
            selectionInstance.coords.xB = isVertical === 'v' ? selectionInstance.coords.xA : existingPoint.x
            selectionInstance.coords.yB = isVertical === 'h' ? selectionInstance.coords.yA : existingPoint.y
            // console.log("instance", selectionInstance)
            selection.pop()
            setSelection([...selection, selectionInstance])
            setSelectionInstance({})
            setSecondClick(false)
            setActiveClick(null)
            setExistingPoint(null)

          } else {

            selectionInstance.coords.xA = existingPoint.x
            selectionInstance.coords.yA = existingPoint.y
            // console.log("first click ex po")
            // console.log("instance", selectionInstance)
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
      
        // console.log("change or", {
        //   ...selectionInstance,
        //   orientation: newOrientation ? 'v' : 'h',
        // });
      };

      const ElectricalComponent = ({ id, val, type, xA, xB, yA, thisSelected, setThisSelected, yB,  svgRef }) => {
        // console.log("orientation", selection[id - 1]['orientation'])
        const vert = selection[id - 1]['orientation'] === 'v' ? 'v' : selection[id - 1]['orientation'] === 'h' ? 'h' : selection[id - 1]['orientation'] === 'none' && 'none'
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

    return (
        <>
        <div className="flex gap-4 justify-center">
            {
                activeClick ? (
                    <p>{selectionInstance.component} Active</p>
                ) : (
                    <p>Not Active</p>
                )
            }
            <button
              onClick={() => handleToolClick('Resistor')}
              className={`px-4 py-2 rounded ${
                activeClick === "Resistor" ? 'bg-orange-500' : 'bg-orange-200'
              }`}
            >
              Resistor
            </button>
            <button
              onClick={() => handleToolClick('Capacitor')}
              className={`px-4 py-2 rounded ${
                activeClick === "Capacitor" ? 'bg-green-500' : 'bg-green-200'
              }`}
            >
              Capacitor
            </button>
            <button
              onClick={() => handleToolClick("StepWire")}
              className={`px-4 py-2 rounded ${
                activeClick === "StepWire" ? 'bg-yellow-500' : 'bg-yellow-200'
              }`}
            >
              Wire
            </button>
            <button
              onClick={() => handleToolClick("Inductor")}
              className={`px-4 py-2 rounded ${
                activeClick === "Inductor" ? 'bg-purple-500' : 'bg-purple-200'
              }`}
            >
              Inductor
            </button>
            <button
              onClick={() => handleToolClick("DCVoltageSource")}
              className={`px-4 py-2 rounded ${
                activeClick === "DCVoltageSource" ? 'bg-purple-500' : 'bg-purple-200'
              }`}
            >
              DC Voltage
            </button>
            <button
              onClick={() => changeOrientation()}
              className={`px-4 py-2 rounded ${
                isVertical === 'v' ? 'bg-red-500' : isVertical === 'h' ? 'bg-red-200' : isVertical === 'none' && 'bg-orange-200'
              }`}
            >
              {isVertical === 'v' ? "Vertival" : isVertical === 'h' ? "Horizontal" : isVertical === 'none' && 'none'}
            </button>

            {/** FLAG: debug */}
            <button onClick={() => setChange(!change)}>Change</button>
          </div>

          {
                existingPoint ? (
                  <p>{existingPoint.x} {existingPoint.y} Active</p>
                ) : (
                  <p>existing point Not Active</p>
                )
            }

            <p onClick={()=>setThisSelected(null)}>Clear</p>
          <div>
            {
              selection && selection.map((item, index) => (
                <div key={index} onClick={()=>setThisSelected(item.id)} className={` ${ thisSelected === item.id ? ("text-red-500") : ("text-blue-500")}`}>{item.id} {item.component} x-{item.coords.xA} y-{item.coords.yA} x2-{item.coords.xB} y2-{item.coords.yB}</div>
              ))
            }
          </div>

        <div className="canvas flex items-center justify-center min-h-screen bg-gray-900 p-8">
            <svg         
                ref={svgRef}
                viewBox="0 0 800 400"
                className="w-full max-w-3xl border border-white rounded-[24px]"
                onClick={handleCanvasClick}
            >
              {/* {
                selection && selection.map((item, key) => {
                  console.log("debug", item.component)
                  item.component === "StepWire" ? (
                    <StepWireA key={key} xA={item.coords.xA} xB={item.coords.xB} yA={item.coords.yA} yB={item.coords.yB} svgRef={svgRef}/>
                  ) : item.component === "Capacitor" && (
                    <Capacitor key={key} xA={item.coords.xA} xB={item.coords.xB} yA={item.coords.yA} yB={item.coords.yB} svgRef={svgRef}/>
                  )
                })
              } */}
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
        </div>
        <style>
        {`
          @keyframes dash {
            to {
              stroke-dashoffset: -200;
            }
          }

          .text {
            font: italic 20px serif;
            fill: white;
          }
        `}
        </style>
        </>
    )
}


