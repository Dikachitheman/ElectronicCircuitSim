import { useState, createContext } from "react";

const Context = createContext()

const ContextProvider = ({ children }) => {
    const svgRef = useRef(null);

    const [file, setFile] = useState("Operational Amplifier")
    const [folder, setFolder] = useState("RLC/")
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
    const [branch, setBranch] = useState(0)
    const [prevHistoryId, setPrevHistoryId] = useState(null)
    const [filteredSelection, setFilteredSelection] = useState([])
    const [canvasCLick, setCanvasClick] = useState(null)
    const [viewBox, setViewBox] = useState({
      x: 0,
      y: 0,
      width: 580,
      height: 540
    });
  
    const manager = HistoryManager.getInstance(selection);


    return (
        <Context.Provider value={{ 
            svgRef,

            file, setFile,
            folder, setFolder,
            editingFolder, setEditingFolder,
            editingFile, setEditingFile,
            tempFolder, setTempFolder,
            tempFile, setTempFile,
            fileListOpen, setFileListOpen,
            fileList, setFileList,
            secondClick, setSecondClick,
            activeClick, setActiveClick,
            existingPoint, setExistingPoint,
            selection, setSelection,
            recentlyUsedTools, setRecentlyUsedTools,
            selectionInstance, setSelectionInstance,
            thisSelected, setThisSelected,
            isVertical, setIsVertical,
            change, setChange,
            isOpen, setIsOpen,
            isExisting, setIsExisting,
            open, setOpen,
            scopeList, setScopeList,
            PVR, setPVR,
            tabActive, settabActive,
            isDragging, setIsDragging,
            dragStart, setDragStart,
            drawCoords, setDrawCoords,
            activateTool, setActivateTool,
            sumDx, setSumDx,
            sumDy, setSumDy,
            history, setHistory,
            branch, setBranch,
            prevHistoryId, setPrevHistoryId,
            filteredSelection, setFilteredSelection,
            canvasCLick, setCanvasClick,
            viewBox, setViewBox,
            manager

        }}>
        {children}
        </Context.Provider>
    );
};

export default ContextProvider