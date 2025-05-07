import React, { useState, useRef, useEffect } from 'react';
import StepWireA from './client/wire';
import { Resistor } from './client/resistor';
import findCircuitCycles from './engine/loops';
import { Capacitor } from './client/capacitor';
import { Inductor } from './client/inductor';
import { DCVoltageSource } from './client/dc_voltage_source';
import { CapacitorIcon } from './assets/svgIcon';
import { Canvas } from './client/canvas';
import Sine from './client/sine';
import { analyzeCircuit } from './engine/nodalv2';
import { Discrete } from './engine/formatMatrix';
import { gaussian } from './engine/gaussian';
import { HistoryClass, HistoryManager } from './client/utils/history';
import { Pipeline } from './neural/pipeline';
import { ComponentSlider, Draggable, PanSlider } from './client/slider';
import { IrisAI } from './client/toggle';
import { ArrowDown, ArrowDown10, ArrowDownAZ, ArrowDownSquare, ArrowDownToLine, BookOpen, Hand, Home, Play, Redo, Redo2, Save, SaveAll, Undo2, ZoomIn } from 'lucide-react';

export const Render = () => {

  const svgRef = useRef(null);
  const svgPanRef = useRef(null);
  const [file, setFile] = useState("Operational Amplifier")
  const [folder, setFolder] = useState("RLC")
  const [editingFolder, setEditingFolder] = useState(false);
  const [editingFile, setEditingFile] = useState(false);
  const [tempFolder, setTempFolder] = useState("");
  const [tempFile, setTempFile] = useState("");
  const [fileListOpen, setFileListOpen] = useState(false)
  const [fileList, setFileList] = useState([])
  const [secondClick, setSecondClick] = useState(false)
  const [activeClick, setActiveClick] = useState(null)
  const [existingPoint, setExistingPoint] = useState(null)
  const [selection, setSelection] = useState([])
  const selectionRef = useRef(selection);
  const [recentlyUsedTools, setRecentlyUsedTools] = useState([])
  const [selectionInstance, setSelectionInstance] = useState({})
  const [thisSelected, setThisSelected] = useState(null)
  const [isVertical, setIsVertical] = useState('none')
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
  const [sumDy, setSumDy] = useState(0)
  const [history, setHistory] = useState([])
  const [liveOrDead, setLiveOrDead] = useState("live")
  const [branch, setBranch] = useState(0)
  const branchRef = useRef(null)
  const [prevHistoryId, setPrevHistoryId] = useState(null)
  const [filteredSelection, setFilteredSelection] = useState([])
  const [canvasClick, setCanvasClick] = useState(null)
  const [zoomVal, setZoomVal] = useState(96)  
  const [rectPosition, setRectPosition] = useState({ x: 150, y: 120 });
  const [panisDragging, setpanIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [viewBox, setViewBox] = useState({
    x: 0,
    y: 0,
    width: 580,
    height: 540
  });

  const [store, setStore] = useState(null)

  const manager = HistoryManager.getInstance(selection);

  useEffect(() => {

    const findJunctionsPromise = new Promise((resolve) => {
      const junctions = findJunctions(filteredSelection);
      // console.log("junctions", junctions)
      resolve(junctions);
    });
  
    findJunctionsPromise
      .then(junctions => {
        const loops = findCircuitCycles(junctions);
        return { junctions, loops };
      })
      .then(({ junctions, loops }) => {
        const {matrix, cmap} = analyzeCircuit(junctions, loops);
        return {matrix, cmap}
      })
      .then(({matrix, cmap}) => {
        let alpha = 90 // angle for peak current, voltage.
        let discreteGaussianMatrix = Discrete(matrix, alpha)
        return {discreteGaussianMatrix, cmap}
      })
      .then(({discreteGaussianMatrix, cmap}) => {
        let currents = gaussian(discreteGaussianMatrix)
        return ({currents, cmap})
      })
      .then (({currents, cmap}) => {

        let currentValue = 0
        let peakVoltageRegister = []

        for (let c in cmap) {
          if (cmap[c].loopIndex.length < 2) {
            let thisCurrent = cmap[c].loopIndex[0]
            currentValue = currents[thisCurrent]
          } else {
            let firstCurrent = cmap[c].loopIndex[0]
            let secondCurrent = cmap[c].loopIndex[1]
            currentValue = currents[firstCurrent] - currents[secondCurrent]
          }

          let peakVoltage = cmap[c].details.info && (currentValue * getIntVal(cmap[c].details.info))

          peakVoltageRegister.push({vmax: peakVoltage, imax: currentValue, impedance: cmap[c].value, comp: cmap[c].details.comp, type: cmap[c].details.type})
        }

        console.log("pvroo", peakVoltageRegister)
        setPVR(peakVoltageRegister)

        //update selection

        let updatedSelection = [...selection];

        peakVoltageRegister.forEach((p) => {
          const index = updatedSelection.findIndex(item => item.id === p.comp);
          if (index !== -1) {
            updatedSelection[index] = {
              ...updatedSelection[index],
              current: p.imax,
              voltage: p.vmax
            };
          }
        });

        console.log("updatedSelection", updatedSelection);

        setSelection(updatedSelection);
      })

  }, [change]);

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
    console.log("selction", selection)

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
      x: Math.max(-500, Math.min(1750, svgPoint.x)),
      y: Math.max(-500, Math.min(1350, svgPoint.y))
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
    console.log("here")
    if (component === "StepWire" && selectionInstance.component !== "StepWire") {
      const init = {id: selection.length + 1, component: "StepWire", value: "2A", orientation: isVertical, coords: {}, current: null, voltage: null, power: null, frequency: null}
      setSelectionInstance(init)
      setActiveClick(component)
    } else if (component === "Resistor" && selectionInstance.component !== "Resistor") {
      const init = {id: selection.length + 1, component: "Resistor", value: "4ohms", orientation: isVertical, coords: {}, current: null, voltage: null, power: null, frequency: null}
      setSelectionInstance(init)
      setActiveClick(component)
    } else if (component === "Capacitor" && selectionInstance.component !== "Capacitor") {
      const init = {id: selection.length + 1, component: "Capacitor", value: "10uf", orientation: isVertical, coords: {}, current: null, voltage: null, power: null, frequency: null}
      setSelectionInstance(init)
      setActiveClick(component)
    } else if (component === "DCVoltageSource" && selectionInstance.component !== "DCVoltageSource") {
      const init = {id: selection.length + 1, component: "DCVoltageSource", value: "5VDC", orientation: isVertical, coords: {}, current: null, voltage: null, power: null, frequency: null}
      setSelectionInstance(init)
      setActiveClick(component)
    } else if (component === "Inductor" && selectionInstance.component !== "Inductor") {
      const init = {id: selection.length + 1, component: "Inductor", value: "2H", orientation: isVertical, coords: {}, current: null, voltage: null, power: null, frequency: null}
      setSelectionInstance(init)
      setActiveClick(component)
    } else {
      setActiveClick(null)
      setSelectionInstance({})
    }
  }
 
  const handleCanvasClick = (e) => {    

    const coords = screenToSVGCoords(e.clientX, e.clientY);
    // const coords = {x: e.clientX, y: e.clientY}

    if (activeClick && !existingPoint) {

      if (secondClick) {
        setCanvasClick(null)
        selectionInstance.coords.xB = isVertical === 'v' ? selectionInstance.coords.xA : coords.x
        selectionInstance.coords.yB = isVertical === 'h' ? selectionInstance.coords.yA : coords.y
        selection.pop()
        setSelection([...selection, selectionInstance])
        
        setRecentlyUsedTools(prevTools => {
          const updatedTools = { ...prevTools };
          
          const currentCompData = prevTools[selectionInstance.component] || { type: selectionInstance.component, icon: <CapacitorIcon />, number: 0 };
          
          // Update the number
          updatedTools[selectionInstance.component] = {
            ...currentCompData,
            number: currentCompData.number + 1
          };
          
          return updatedTools;
        });

        manager.setSelections([...selection, selectionInstance]);
        let historyObject = new HistoryClass( "ADD", "comp", selectionInstance.id, branch + 1, "live")


        if (prevHistoryId !== null && !Number.isNaN(prevHistoryId)) {
          setHistory([...history.slice(0, prevHistoryId + 1), historyObject.toHistoryEntry()])
        } else {
          setHistory([...history, historyObject.toHistoryEntry()])
        }
        setBranch(branch + 1)
        setPrevHistoryId(null)
        setSelectionInstance({})
        setSecondClick(false)
        setActiveClick(null)
      } else {
        setCanvasClick({x: coords.x, y: coords.y})
        selectionInstance.coords.xA = coords.x 
        selectionInstance.coords.yA = coords.y
        setSelection([...selection, selectionInstance])
        setSecondClick(true)
      }
    }

    if (activeClick && existingPoint) {
        
      if (secondClick) {
        setCanvasClick(null)
        selectionInstance.coords.xB = isVertical === 'v' ? selectionInstance.coords.xA : existingPoint.x
        selectionInstance.coords.yB = isVertical === 'h' ? selectionInstance.coords.yA : existingPoint.y
        selection.pop()
        setSelection([...selection, selectionInstance])
        
        setRecentlyUsedTools(prevTools => {
          const updatedTools = { ...prevTools };
          
          const currentCompData = prevTools[selectionInstance.component] || { type: selectionInstance.component, icon: <CapacitorIcon />, number: 0 };
          
          // Update the number
          updatedTools[selectionInstance.component] = {
            ...currentCompData,
            number: currentCompData.number + 1
          };
          
          return updatedTools;
        });

        manager.setSelections([...selection, selectionInstance]);
        let historyObject = new HistoryClass( "ADD", "comp", selectionInstance.id, branch + 1, "live")

        if (prevHistoryId !== null && !Number.isNaN(prevHistoryId)) {
          setHistory([...history.slice(0, prevHistoryId + 1), historyObject.toHistoryEntry()])
        } else {
          setHistory([...history, historyObject.toHistoryEntry()])
        }
        setBranch(branch + 1)

        // clean up
        setPrevHistoryId(null)
        setSelectionInstance({})
        setSecondClick(false)
        setActiveClick(null)
        setExistingPoint(null)

      } else {
        setCanvasClick({x: coords.x, y: coords.y})
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
    
    const vert = selection[id - 1]['orientation']
    const componentMap = {
      StepWire: <StepWireA id={id} val={val} xA={xA} xB={xB && vert === 'v' ? xA : xB} yA={yA} yB={yB && vert === 'h' ? yA : yB } thisSelected={thisSelected} setThisSelected={setThisSelected} svgRef={svgRef} setExistingPoint={setExistingPoint} setSecondClick={setSecondClick} />,
      Capacitor: <Capacitor id={id} val={val} xA={xA} xB={xB && vert === 'v' ? xA : xB} yA={yA} yB={yB && vert === 'h' ? yA : yB } thisSelected={thisSelected} setThisSelected={setThisSelected} svgRef={svgRef} setExistingPoint={setExistingPoint} setSecondClick={setSecondClick}/>,
      Inductor: <Inductor id={id} val={val} xA={xA} xB={xB && vert === 'v' ? xA : xB} yA={yA} yB={yB && vert === 'h' ? yA : yB } thisSelected={thisSelected} setThisSelected={setThisSelected} svgRef={svgRef} setExistingPoint={setExistingPoint} setSecondClick={setSecondClick}/>,
      Resistor: <Resistor id={id} val={val} xA={xA} xB={xB && vert === 'v' ? xA : xB} yA={yA} yB={yB && vert === 'h' ? yA : yB } thisSelected={thisSelected} setThisSelected={setThisSelected} svgRef={svgRef} setExistingPoint={setExistingPoint} setSecondClick={setSecondClick}/>,
      DCVoltageSource: <DCVoltageSource id={id} val={val} xA={xA} xB={xB && vert === 'v' ? xA : xB} yA={yA} yB={yB && vert === 'h' ? yA : yB } thisSelected={thisSelected} setThisSelected={setThisSelected} svgRef={svgRef} setExistingPoint={setExistingPoint} setSecondClick={setSecondClick}/>,
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

  const renderTool = async ({comp, value, xf, yf, xl, yl, orientation}, ctx=null, id=null) => {

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

    let compId 

    if (ctx !== null) {
      compId = ctx.get("id") || 1
      ctx.set("id", parseFloat(compId) + 1)
    } else {
      compId = selection.length + 1
    }

    const init = {id: compId, component: comp, value: value, orientation: orientation, coords: {}, current: null, voltage: null, power: null, frequency: null}
    let offsetx = 0
    let offsety = 156

    let e = 
    {
      clientX: xf + offsetx, 
      clientY: yf + offsety, 
      clientXB: xl + offsetx, 
      clientYB: yl + offsety
    }

    const coordsA = screenToSVGCoords(e.clientX, e.clientY);
    const coordsB = screenToSVGCoords(e.clientXB, e.clientYB);

    if (selection.length > 0) {

      let result = 60; // distance of 50px or less. For now.
      let resultB = 60

      for (let i = 0; i < selection.length; i++) {
        let xA = selection[i].coords.xA
        let xB = selection[i].coords.xB
        let yA = selection[i].coords.yA
        let yB = selection[i].coords.yB

        let d = coordDistance(xA, yA, coordsA.x, coordsA.y)
        if (d < result) { 
          result = d; 
          coordsA.x = xA 
          coordsA.y = yA
        }

        d = coordDistance(xB, yB, coordsA.x, coordsA.y)
        if (d < result) { 
          result = d; 
          coordsA.x = xB 
          coordsA.y = yB;

        }

        let db = coordDistance(xA, yA, coordsB.x, coordsB.y)
        if (db < resultB) { 
          resultB = db; 
          coordsB.x = xA 
          coordsB.y = yA;

        }

        db = coordDistance(xB, yB, coordsB.x, coordsB.y)
        if (db < resultB) { 
          resultB = db; 
          coordsB.x = xB 
          coordsB.y = yB
        }
      }
    }

    init.coords.xA = coordsA.x
    init.coords.yA  = coordsA.y
    init.coords.xB = orientation === 'v' ? init.coords.xA : coordsB.x
    init.coords.yB = orientation === 'h' ? init.coords.yA : coordsB.y

    setRecentlyUsedTools(prevTools => {
      const updatedTools = { ...prevTools };
      
      const currentCompData = prevTools[init.component] || { type: init.component, icon: <CapacitorIcon />, number: 0 };
      
      // Update the number
      updatedTools[init.component] = {
        ...currentCompData,
        number: currentCompData.number + 1
      };
      
      return updatedTools;
    });

    setSelection(prev => {
      const ar = [...prev, init]
      selectionRef.current = ar; 
      return ar
    })

    let selectionList = [...selection]

    if (ctx !== null) {
      selectionList = ctx.get("selection") || []
      let updatedSelection =  [...selectionList, init]
      ctx.set("selection", updatedSelection)

      console.log("selectionlist", selectionList)
      console.log("init", init)

      manager.setSelections([...updatedSelection]);
    }

    manager.setSelections([...selectionList, init]);

    let branchCount = ctx ? parseFloat(ctx.get("branch")) + 1 : branch + 1

    if (Number.isNaN(branchCount)) {
      branchCount = 1
    }

    let historyObject = new HistoryClass( "ADD", "comp", init.id, branchCount, "live")

    setHistory(prev => {
      if (prevHistoryId !== null && !Number.isNaN(prevHistoryId)) {
        return [...prev.slice(0, prevHistoryId + 1), historyObject.toHistoryEntry()]
      } else {
        return [...prev, historyObject.toHistoryEntry()]
      }
    })
    
    if (ctx) {
      const newval = ctx.get("branch") || 0
      ctx.set("branch", parseFloat(newval) + 1)
    }

    setBranch(prev => {
      let newval = prev + 1
      branchRef.current = newval
      return newval
    })
    setPrevHistoryId(() => null)
    setSelectionInstance(() => ({}))
    setActivateTool(() => false)
  }

  useEffect(() => {

    if (activateTool === true && drawCoords) {
      let comp = "Capacitor";
      let value = "10uf";
      let xf = drawCoords[0][0] * 6
      let yf = drawCoords[0][1] * 6
      let xl = drawCoords[1][0] * 6
      let yl = drawCoords[1][1] * 6
      let orientation = isVertical

      const init = renderTool({comp, value, xf, yf, xl, yl, orientation});

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

      let zv = ( newHeight / 580 ) * 100

      setZoomVal(zv)

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
      let sdy = sumDy + dy
      console.log("sum dx", sumDx)

      if (sdx > 200 || sdx < -200) return
      if (sdy > 200 || sdy < -200) return

      setSumDx(sdx)
      setSumDy(sdy)

      setRectPosition(prev => ({ x: prev.x - dx, y: prev.y - dy }));

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
    
    let s = [...scopeList]; 

    if (s.length >= 3) {
      s = s.slice(1);
    }
    
    s = [...s, filteredPVR[0]];
    
    setScopeList(s);
  }

  // history

  useEffect(() => {
    const filtered = selection.filter(item => {
      const itemHistory = history.filter(historyItem => historyItem.id === item.id);
      
      if (itemHistory.length === 0) return false;
      
      const action = itemHistory[itemHistory.length - 1].action;
      
      return action === "ADD";
    });
    
    console.log("filtered", filteredSelection)
    setFilteredSelection(filtered);
  }, [selection, history]);

  const handleLiveOrDead = () => {

    if (liveOrDead === 'live') {
      return
    } else {
      setLiveOrDead('live')
    }
  }

  const reconcile = (actions) => {
    let init = []

    for (let i = 0; i < selection.length; i++) {
      let id = selection[i].id
    }
    setFilteredSelection(init)
    init = []
  } // UNUSED

  const save = async (file) => {

    /**
     * for updates selection list can be cleaned up after save. 
     * things like delete action can be clened out too.
     */

    let branchIdx = 1
    let saved = []

    while (branchIdx !== null) {
      const branch = history.filter(s => s.branch === branchIdx)

      if (branch.length === 0) {
        branchIdx = null
        break;
      }

      const lastBranchItem = branch[branch.length - 1] 
      saved.push(lastBranchItem)

      branchIdx = branchIdx + 1
    }

    setStore([{file:JSON.stringify(history)}, {"components": JSON.stringify(selection)}])

    localStorage.setItem(file, JSON.stringify(history)) // RECALL: saving the entire history for now
    localStorage.setItem(`${file}+components`, JSON.stringify(selection))
    localStorage.setItem(`${file}+prevHistoryId`, prevHistoryId)
  }

  const loadSaved = async (file) => {
    try {
      const history = localStorage.getItem(file);
      const components = localStorage.getItem(`${file}+components`)
      const pHId = localStorage.getItem(`${file}+prevHistoryId`)
  
      if (history) {
        const parsedData = JSON.parse(history);
        
        setHistory([...parsedData]);
        setSelection([...JSON.parse(components)])
        setPrevHistoryId(parseFloat(pHId))
      } else {
        console.log("file doesn't exist")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getLocalStorageFiles = () => {
    const fileList = [];
    
    // Loop through all localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      // Get the key at index i
      const filename = localStorage.key(i);
      !filename.includes("+components") && !filename.includes("+prevHistoryId") && fileList.push(filename);
    }
    
    return fileList;
  };

  const handleFileList = () => {
    setFileListOpen(!fileListOpen)

    setFileList(getLocalStorageFiles())
  }

  const handleHistorySelect = (id, source) => {

    const dispatch = (filteredSelection, history, liveOrDead, index) => {

      const deleteComp = () => {
        
        const updatedHistory = history.map((item, i) => {
          if (i === index) {
            return {
              ...item,
              action: "DELETE",
              live: liveOrDead,
            };
          }
          return item;
        });

        for (let s=0; s<filteredSelection.length; s++) {
          if (filteredSelection[s].id === updatedHistory[index].id) {
            // add set timeout here for half a second
            if (updatedHistory[index].action === "DELETE") {
              filteredSelection = filteredSelection.filter((_, idx) => idx !== s);
            } 
          }
        }

        return {
          f: filteredSelection,
          h: updatedHistory
        }
      };

      const addComp = () => {

        const updatedHistory = history.map((item, i) => {
          if (i === index) {
            return {
              ...item,
              action: "ADD",
              live: liveOrDead,
            };
          }
          return item;
        });  

        if (updatedHistory[index].action === "ADD") {
          filteredSelection = [...filteredSelection, selection.find(s => s.id === updatedHistory[index].id)]
        } 
        
        return {
          f: filteredSelection,
          h: updatedHistory
        }
      };
  
      // Fixed: Create function references instead of executing them immediately
      const funcMap = {
        "ADD": () => deleteComp(),
        "DELETE": () => addComp(),
      };
      
      // Fixed: Actually call the appropriate function based on the current action
      const currentAction = history[index].action;
      return funcMap[currentAction]();
    }

    let dest = prevHistoryId

    if (source === "undo") {
      if ((id + 1) === (history.length - 1)) {
        console.log("debug", id, history.length - 1)
        return
      } 

      dest = id + 1
    }

    if (source === "redo") {
      dest = id - 1
    }

    if (id < dest || dest === null) {

      let init = dest === null ? history.length - 1 : dest
      let f = [...filteredSelection];
      let h = [...history];
      let liveOrDead = "dead"
      
      for (let i = init; i > id; i--) {
        const result = dispatch(f, h, liveOrDead, i);
        f = result.f;
        h = result.h;
      }
      
      setFilteredSelection(f);
      setHistory(h);

      // reconcile(history) UNUSED

    } else if (id >= dest) {

      let f = [...filteredSelection];
      let h = [...history];
      let liveOrDead = "live"

      for (let i = dest + 1; i <= id; i++) {

        const result = dispatch(f, h, liveOrDead, i);
        f = result.f;
        h = result.h;

      }

      setFilteredSelection(f);
      setHistory(h);
    }

    setPrevHistoryId(id)
  }
  
  const handleDelete = (itemId, id) => {

    let branch = null

    // get branch
    for (let i = 0; i < history.length; i++) {
      if (itemId === history[i].id) {
        branch = history[i].branch
      }
    }

    let historyObject = new HistoryClass( "DELETE", "comp", itemId, branch, "live")
    setHistory([...history, historyObject.toHistoryEntry()])

    setFilteredSelection(filteredSelection.filter((_, idx) => idx !== id));
    setPrevHistoryId(null)
  }

  const handleFolderClick = () => {
    setTempFolder(folder);
    setEditingFolder(true);
  };

  const handleFileClick = () => {
    setTempFile(file);
    setEditingFile(true);
  };

  const saveFolderChange = () => {
    setFolder(tempFolder);
    setEditingFolder(false);
  };

  const saveFileChange = () => {
    setFile(tempFile);
    setEditingFile(false);
  };

  const handleKeyDown = (e, saveFunction) => {
    if (e.key === "Enter") {
      saveFunction();
    } else if (e.key === "Escape") {
      setEditingFolder(false);
      setEditingFile(false);
    }
  };

  // pipeline

  const funcMap = {
    // prod
    "saveFile": async () => {
      await save(file)
      alert(`saved ${file}`)
    },

    "saveFileByName": async ({input}) => {
      await save(input)
    },

    "loadFile": async ({input}) => {
      await loadSaved(input[0])
    },

    "RenderTool": async ({ctx, input, id}) => {

      let comp = String(input[0]);
      let value = String(input[1]);
      let xf = parseFloat(input[2])
      let yf = parseFloat(input[3])
      let xl = parseFloat(input[4])
      let yl = parseFloat(input[5])
      let orientation = String(input[6])

      await renderTool({comp, value, xf, yf, xl, yl, orientation}, ctx, id);

    },
  };

  const pipeline = new Pipeline(funcMap);

  // 'saveFile', 'loadFile $Operational Amplifier',

  const handlePipeline = () => {

    let head = [
      {id: 23050, input: 'RenderTool $Capacitor $10uf $800 $200 $400 $300 $none'}, 
      {id: 245509, input: 'RenderTool $Resistor $10ohms $400 $400 $600 $300 $none'}, 
      {id: 4782002, input: 'RenderTool $Inductor $10H $200 $200 $800 $300 $none'},
      {id: 493002, input: 'RenderTool $Capacitor $10uf $1400 $300 $600 $300 $none'}, 
      {id: 789911, input: 'RenderTool $Resistor $10ohms $100 $400 $1000 $300 $none'}, 
      {id: 111930, input: 'RenderTool $Inductor $10H $900 $300 $100 $300 $none'},
    ]

    let chain = [
      {id: 2004490, input: 'saveFileByName $promptV1'},
      {id: 333902, input: 'saveFileByName $magnetic flux'},
      {id: 125392, input: 'saveFileByName $Complex Sim'},
    ]

    pipeline.compose(head)
    // pipeline.compose(chain)

    pipeline.run()

  }
  
  // Handle start of dragging inside the RECT
  const handleRectMouseDown = (e) => {
    e.stopPropagation(); // Important: prevent svg click from firing
    const svgElement = svgRef.current;
    if (!svgElement) return;
  
    const svgRect = svgElement.getBoundingClientRect();
    const offsetX = e.clientX - svgRect.left - rectPosition.x;
    const offsetY = e.clientY - svgRect.top - rectPosition.y;
  
    setDragOffset({ x: offsetX, y: offsetY });
    setpanIsDragging(true);
  };
  
  // Handle mouse move (dragging)
  const handleMouseMove = (e) => {
    if (!panisDragging) return;
  
    const svgElement = svgRef.current;
    if (!svgElement) return;
  
    const svgRect = svgElement.getBoundingClientRect();
    const newX = e.clientX - svgRect.left - dragOffset.x;
    const newY = e.clientY - svgRect.top - dragOffset.y;
  
    setRectPosition({ x: newX, y: newY });
    setViewBox(prevViewBox => ({...prevViewBox, x: newX, y: newY}))
  };
  
  // Handle mouse up (stop dragging)
  const handleMouseUp = () => {
    setpanIsDragging(false);
  };
  
  // Handle click on SVG (to jump the rect there)
  const handleSvgClick = (e) => {
    const svgElement = svgPanRef.current;
    if (!svgElement) return;
  
    const svgRect = svgElement.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
  
    setRectPosition({ x: x, y: y });
    setViewBox(prevViewBox => ({...prevViewBox, x: x, y: y}))
  };

  useEffect(() => {
    if (panisDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
  
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [panisDragging]);
  
  useEffect(() => {
    console.log(rectPosition)
  }, [rectPosition])


  // style={{ transform: 'scale(0.75)', transformOrigin: 'top left' }}
  return (
    <div className="w-full h-screen relative cursor-default">

      <div className='absolute top-[150px] w-screen'>
        <Canvas setViewBox={setViewBox} isDragging={isDragging} setDrawCoords={setDrawCoords} setActivateTool={setActivateTool}/>
      </div>

      <div className='absolute w-[100%]'>
        <Draggable initialPosition={{ x: 440, y: 620 }} scale={1}>
          <Sine pvr={scopeList}/>
        </Draggable>
      </div>

      <div className='absolute' style={{ transform: 'scale(1)', transformOrigin: 'top left' }} >
        <Draggable initialPosition={{ x: 840, y: 140 }} scale={1}>
          <IrisAI enter={() => handlePipeline()}/>
        </Draggable>
      </div>

      {/* transform -translate-x-1/2 */}
      <div className='top-nav-wrapper absolute z-50 flex pb-[14px] flex-col items-center w-[100%] shadow-[600px]
        backdrop-blur-[44px] border-b-[1px] border-gray-800 bg-gradient-to-r from-gray-300/5 via-blue-400/10 to-slate-500/15'>

        <div className='workspace flex justify-between w-[96%] px-[12px] pt-[11px] pb-[14px]'>

          <div className='flex items-end '>
            <p className='text-[#7a7a7a] text-[24px]'>Workspace</p>
            <div className="flex text-white">
              <div className="flex items-center">
                {editingFolder ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={tempFolder}
                      onChange={(e) => setTempFolder(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, saveFolderChange)}
                      autoFocus
                      className="ml-2 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-[#9cff19] outline-none"
                    />
                    <button
                      onClick={saveFolderChange}
                      className="ml-2 px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-xs"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <p 
                    className="ml-2 pb-1 mr-1 text-[#9cff19] cursor-pointer"
                    onClick={handleFolderClick}
                  >
                    {folder}/
                  </p>
                )}
              </div>

              <div className="flex items-center">
                {editingFile ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={tempFile}
                      onChange={(e) => setTempFile(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, saveFileChange)}
                      autoFocus
                      className="ml-2 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-[#FF541F] outline-none"
                    />
                    <button
                      onClick={saveFileChange}
                      className="ml-2 px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 text-xs"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <p 
                    className="pb-1 text-[#FF541F] cursor-pointer"
                    onClick={handleFileClick}
                  >
                    {file}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='text-[#D331CF] font-[700] flex items-end'>
            Flamin<p className='italic'>go</p>
          </div>

        </div>

        <div className=' top-nav flex top-[40px] z-50 left-1/2 w-[96%] 
           text-white border rounded-[44px] py-[4px] px-[6px] bg-white/4 
            backdrop-blur-md border-white/10 shadow-lg items-center'>

          <div className='relative space-x-[14px] flex items-center w-[24%] pl-[18px]'>
            <div className='hover:bg-[#3a3850] rounded-[24px] py-[4px] px-[12px] flex'>
              <div><Home fill='white'/></div><p className=''>Home</p>
            </div>
            <div className='hover:bg-[#3a3850] rounded-[24px] py-[4px] px-[12px] flex text-white/60'>
              <div><ArrowDownToLine /></div><p className=''>Options</p>
            </div>
            <div className='hover:bg-[#3a3850] rounded-[24px] py-[4px] px-[12px] flex text-white/60'>
              <div><Save/></div><p className='' onClick={() => save(file)}>Save</p>
            </div>
            <div className='hover:bg-[#3a3850] rounded-[24px] py-[4px] px-[12px] flex text-white/60'>
              <div><BookOpen/></div><p className='' onClick={() => handleFileList()}>Load</p>
            </div>

          {
            fileListOpen && fileList && (
              <div className="absolute left-[336px] space-y-[8px] top-[49px] w-48 bg-white border border-gray-300 shadow-lg rounded-lg p-2 text-black">
                {fileList.map((filename, index) => (
                  <div 
                    key={index} 
                    onClick={() => loadSaved(filename)}
                    className="file-item pl-[8px] rounded-[24px] hover:text-white hover:bg-black"
                  >
                    {filename}
                  </div>
                ))}
              </div>
            )
          }
          </div>

          <div className="relative ml-[64px]">
            {/* Dropdown Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-[24px] py-[4px] bg-[#08143e] text-white border border-slate-500 rounded-[44px]"
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
          
          <div className='relative overflow-hidden flex grow py-[4px] pl-[6px] rounded-[44px] ml-[8px] mr-[44px] border-white/40  border-[2px]  bbg-gradient-to-r ffrom-[#0000FF] vvia-[#ff00a2] tto-[#00bfff]'>
            <div className="absolute inset-0 border-white/10 border-[10px] blur-[6px] bg-[#1e253a] rounded-[44px] mix-blend-overlay"></div>
            <div className={`${activeClick ? "bg-[#00E258]" : "bg-[#FF541F]"} border-[2px] border-white/80 text-[#FFF] rounded-[44px] w-[94px] flex justify-center`}>
              {
                activeClick ? (
                  <p>{selectionInstance.component}</p>
                ) : (
                  <p>Not Active</p>
                )
              }
            </div>
            <div className='flex space-x-[24px] pl-[24px] z-50'>
              {Object.values(recentlyUsedTools)
                .sort((a, b) => b.number - a.number) // Sort by number in descending order
                .map((tool, index) => (
                  <div
                    key={index}
                    onClick={() => handleToolClick(tool.type)}
                    className="flex flex-col items-center group cursor-pointer"
                  >
                    <div>{tool.icon}</div>
                    <p className="hidden group-hover:block absolute -bottom-4 whitespace-nowrap bg-white/70 backdrop-blur-lg text-black px-2 py-1 rounded-md text-sm">
                      {tool.type} -- {tool.number}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          <div className={`flex space-x-[12px] rounded-full p-[6px] text-[#3d0c05] ${isDragging ? "bg-[#00E258]" : "bg-[#FF541F]"}`} onClick={() => setIsDragging(!isDragging)}>
            <Hand fill={'#FFF'}/>
          </div>

          <div className='flex space-x-[14px] mx-[44px]'>
            <div className='hover:bg-[#0b68cb]' onClick={()=>handleHistorySelect(prevHistoryId, "undo")}>
              <Undo2 />
            </div>
            <div className='hover:bg-[#0b68cb]' onClick={()=>handleHistorySelect(prevHistoryId, "undo")}>
              <Redo2 />
            </div>
            <button onClick={() => handleLiveOrDead()} className={`${liveOrDead === "live" ? ("bg-[#00E258] text-[#003824]") : liveOrDead === "dead" && ("bg-[#ff592b] text-[#300404]")} w-[64px] rounded-[6px]`}>
              {liveOrDead === "live" ? ("Live") : liveOrDead === "dead" && ("Dead")}
            </button>
          </div>

          <div className=" flex items-center ml-[8px] text-[#ccc]"> 
            <p className='mr-[12px]'>Orientation</p>
            <button
              onClick={() => changeOrientation()}
              className={`py-[2px] mr-[34px] w-[104px] rounded-[44px] bg-[#141414] border-white/60 border-[2px] ${
                isVertical === 'v' ? 'text-[#ff5d2c]' : isVertical === 'h' ? 'text-[#0ad2ff] ' : isVertical === 'none' && 'text-orange-200 '
              }`}
            >
              {isVertical === 'v' ? "Vertical" : isVertical === 'h' ? "Horizontal" : isVertical === 'none' && 'none'}
            </button>

            {/** FLAG: debug */}
            <p className='mr-[12px]'>Run</p>
            <button className='bg-[#15FFAB] font-[600] text-[#04343a] w-[34px] h-[34px] flex items-center justify-center rounded-[100%]' 
              onClick={() => setChange(!change)}>
              <Play fill='#013207'/>
            </button>
          </div>
        </div>
      </div>

      <div className=' components-list bg-gradient-to-b from-gray-100/5 via-blue-200/10 to-slate-200/15 backdrop-blur-[64px] border-white/10 rounded-[24px] shadow-lg overflow-hidden border w-[300px] absolute top-[140px] left-[40px]'>

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

        <div className='no-scrollbar h-[700px] pb-[24px] w-full flex pt-[14px]'>
            <div className='no-scrollbar w-full overflow-scroll'>
              {
                isExisting ? (
                  <div className='w-full relative space-y-[16px] pt-[24px] px-[14px]'>
                    {
                      tabActive === "comp" && filteredSelection ? filteredSelection.map((item, index) => 
                        open === item.id ? (
                          <div key={index} className={` bg-[#121314]/100 backdrop-blur-lg border border-white/10 hover:border-white/30 rounded-[30px] shadow-lg text-[#c1c1c1] pt-[4px] ${ thisSelected === item.id ? ("text-[#ffe121]") : ("text-[#e9e9e9]")}`}>
                            {/* {item.id} {item.value} {item.component} x-{item.coords.xA} y-{item.coords.yA} x2-{item.coords.xB} y2-{item.coords.yB} */}

                            <div className='w-full flex justify-end mt-[2px] pr-[18px]' >
                              <div onClick={()=>setOpen(null)} className='bg-[#FF6F0D] px-[14px] rounded-[24px]'>
                                Close
                              </div>
                            </div>

                            <CompValue value = {item.value} setSelection={setSelection} selection={selection} id={item.id}/>

                            <div className=' mb-[30px] pl-[8px]'>
                              <div className='flex space-x-[8px] items-center'>
                                <p className='text-[22px]' onClick={()=>handleComponentClick(item.id)}>{item.component}</p>
                                <p><CapacitorIcon /></p>
                              </div>
                              <p className='text-[#FF541F] leading-[12px]'>0xc{item.id}</p>
                            </div>
                            
                            <div className='flex space-x-[6px] ml-[8px]'>
                              <div className=' bg-[#15FFAB] text-[#173228] text-[18px] px-[12px] rounded-[24px]' onClick={()=>handleAddScope(item.id)}>Scope</div>
                              <p className='text-[18px] bg-[#BaBAFF] text-[#26263f] px-[12px] rounded-[24px]'>Edit</p>
                            </div>
                            
                            <div className='mt-[8px] text-[14px] w-fit px-[8px] ml-[8px] bg-[#727272] rounded-[16px]' onClick={()=>handleDelete(item.id, index)}>Delete</div>

                            <div className='w-full mt-[12px]'>
                              <ComponentSlider selection={selection} setSelection={setSelection} state = {item.value} id={item.id} />
                            </div>

                            <div className='flex justify-between px-[14px] mt-[24px] mx-[8px] bg-[#353535] py-[8px] mb-[8px] rounded-[22px]'>
                              <div>
                                <p className='text-[14px]'>{Math.round(item.current * 1000) / 1000}</p>
                                <p className='text-[12px] text-[#ff19ab]'>Amps</p>
                              </div>
                              <div>
                                <p className='text-[14px]'>{Math.round(item.voltage * 1000) / 1000}</p>
                                <p className='text-[12px] text-[#19ffe4]'>Volts</p>
                              </div>
                              <div>
                                <p className='text-[14px]'>12.348</p>
                                <p className='text-[12px] text-[#a7ff19]'>Hz</p>
                              </div>
                              <div>
                                <p className='text-[14px]'>12.348</p>
                                <p className='text-[12px] text-[#ffba19]'>W</p>
                              </div>
                            </div>

                          </div>
                        ) : (
                          <div onClick={()=>setOpen(item.id)} className={`flex items-center px-[24px] h-[50px] bg-white/10 backdrop-blur-lg border border-white/10 hover:border-white/30 rounded-lg shadow-lg ${ thisSelected === item.id ? ("text-[#ffe121]") : ("text-[#e9e9e9]")}`}>
                            <p className='mr-[12px]'>{item.value}</p>
                            <p>{item.id}</p>
                            <div className='grow flex justify-end'>
                              <CapacitorIcon />
                            </div>
                          </div>
                        )
                      ) : tabActive === "history" && history && history.map((item, index) => (
                        <div key={index} className={`text-white hover:bg-[#767676] hover:text-black ${prevHistoryId === index && ("bg-[#fa7070]")}`} onClick={()=>handleHistorySelect(index, "none")}>
                          action {item.action} --- comp {item.comp} --- branch {item.branch} --- id {item.id} --- {item.live}
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <CapacitorIcon />
                  </div>
                )
              }
            </div>
        </div>
        
      </div>

      <svg 
        ref={svgRef}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full bg-black" // h-full
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
          canvasClick && (
            <circle
              cx={canvasClick.x}
              cy={canvasClick.y}
              r={1.6}
              fill="#a7ff0f"
            />
          )
        }

        {
          {filteredSelection} &&
          filteredSelection.map((item, key) => (
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

      <div className=' absolute top-[520px] right-[40px] border-[#848484] border bg-[#232323] pt-[12px] px-[14px] rounded-[28px]'>
        <svg 
          ref={svgPanRef}
          onClick={handleSvgClick}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox={`0 0 580 540`}
          preserveAspectRatio="xMidYMid slice"
          className="w-[300px] h-[210px] bg-black rounded-[24px] relative" // h-full
        >

          {
            canvasClick && (
              <circle
                cx={canvasClick.x}
                cy={canvasClick.y}
                r={1.6}
                fill="#a7ff0f"
              />
            )
          }

          {
            {filteredSelection} &&
            filteredSelection.map((item, key) => (
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
                svgRef={svgPanRef}
              />
            ))
          }

          <rect
            x={rectPosition.x}
            y={rectPosition.y}
            width={300}
            height={210}
            stroke="#DD6400"
            strokeWidth={2}
            rx={20}
            ry={20}
            fill="#FFF"
            fillOpacity={0}
            style={{ cursor: panisDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleRectMouseDown}
          />
        
        </svg>

        <div className='w-full flex justify-between'>
          <div>
            min
          </div>
          <div className='w-[70%] h-[60px] '>
            <PanSlider state={zoomVal} setViewBox={setViewBox}/>
          </div>
          <div>
            plus
          </div>
        </div>
      </div>
      
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

          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }

        `}
        </style>
    </div>
    
  );
};


const CompValue = ({ value, setSelection, selection, id }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const updateSelection = () => {
    const index = selection.findIndex(item => item.id === id);
    
    if (index !== -1) {
      const updatedSelection = [...selection];
      updatedSelection[index] = {
        ...updatedSelection[index],
        value: val
      };
      
      setSelection(updatedSelection);
    }
  };

  const handleFinishEdit = () => {
    setEditing(false);
    updateSelection();
  };

  useEffect(() => {
    const index = selection.findIndex(item => item.id === id);
  
    if (index !== -1) {
      const selectedItem = selection[index];
      setVal(selectedItem.value);
    }
  }, [selection, id]);  

  
  return (
    <div onClick={() => !editing && setEditing(true)} className="cursor-pointer">
      {editing ? (
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleFinishEdit}
          onKeyDown={(e) => e.key === 'Enter' && handleFinishEdit()}
          autoFocus
          className="text-3xl mb-4 ml-2 w-20 bg-transparent border border-gray-400 rounded px-2"
        />
      ) : (
        <p className="text-4xl leading-tight mb-4 pl-2">
          {val}
        </p>
      )}
    </div>
  );
};