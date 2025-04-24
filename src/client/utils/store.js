// store.js
import { create } from 'zustand';

export const useStoretest = create((set) => ({
  isVerticalz: "v",
  changeOrientation: () =>
    set((state) => ({
      isVerticalz: state.isVerticalz === "v" ? "h" : "v",
    })),
}));

export const useStore = create((set) => ({
  // File and folder management
  file: "Operational Amplifier",
  folder: "RLC/",
  editingFolder: false,
  editingFile: false,
  tempFolder: "",
  tempFile: "",
  fileListOpen: false,
  fileList: [],
  
  // Selection and point management
  secondClick: false,
  activeClick: null,
  existingPoint: null,
  selection: [],
  filteredSelection: [],
  
  // Tools and UI states
  recentlyUsedTools: [],
  selectionInstance: {},
  thisSelected: null,
  isVertical: 'none',
  change: false,
  isOpen: false,
  isExisting: true,
  open: null,
  scopeList: [],
  PVR: null,
  tabActive: "comp",
  
  // Dragging and drawing states
  isDragging: false,
  dragStart: { x: null, y: null },
  drawCoords: null,
  activateTool: false,
  sumDx: 0,
  sumDy: 0,
  canvasClick: null,
  
  // History management
  history: [],
  branch: 0,
  prevHistoryId: null,
  
  // ViewBox for canvas
  viewBox: {
    x: 0,
    y: 0,
    width: 580,
    height: 540
  },
  
  // Actions - grouped by functionality
  // File and folder actions
  setFile: (newFile) => set({ file: newFile }),
  setFolder: (newFolder) => set({ folder: newFolder }),
  toggleEditingFolder: () => set((state) => ({ editingFolder: !state.editingFolder })),
  toggleEditingFile: () => set((state) => ({ editingFile: !state.editingFile })),
  setTempFolder: (folder) => set({ tempFolder: folder }),
  setTempFile: (file) => set({ tempFile: file }),
  toggleFileList: () => set((state) => ({ fileListOpen: !state.fileListOpen })),
  setFileList: (files) => set({ fileList: files }),
  
  // Selection actions
  toggleSecondClick: () => set((state) => ({ secondClick: !state.secondClick })),
  setActiveClick: (click) => set({ activeClick: click }),
  setExistingPoint: (point) => set({ existingPoint: point }),
  setSelection: (items) => set({ selection: items }),
  addToSelection: (item) => set((state) => ({ selection: [...state.selection, item] })),
  removeFromSelection: (itemId) => set((state) => ({ 
    selection: state.selection.filter(item => item.id !== itemId) 
  })),
  clearSelection: () => set({ selection: [] }),
  setFilteredSelection: (items) => set({ filteredSelection: items }),
  
  // Tools and UI actions
  addRecentlyUsedTool: (tool) => set((state) => {
    const filteredTools = state.recentlyUsedTools.filter(t => t !== tool);
    return { recentlyUsedTools: [tool, ...filteredTools].slice(0, 5) };
  }),
  setSelectionInstance: (instance) => set({ selectionInstance: instance }),
  setThisSelected: (selected) => set({ thisSelected: selected }),
  setIsVertical: (value) => set({ isVertical: value }),
  toggleChange: () => set((state) => ({ change: !state.change })),
  toggleIsOpen: () => set((state) => ({ isOpen: !state.isOpen })),
  setIsOpen: (value) => set({ isOpen: value }),
  setIsExisting: (value) => set({ isExisting: value }),
  setOpen: (value) => set({ open: value }),
  setScopeList: (list) => set({ scopeList: list }),
  setPVR: (value) => set({ PVR: value }),
  setTabActive: (tab) => set({ tabActive: tab }),
  
  // Dragging and drawing actions
  startDragging: (x, y) => set({ 
    isDragging: true, 
    dragStart: { x, y } 
  }),
  stopDragging: () => set({ 
    isDragging: false, 
    dragStart: { x: null, y: null } 
  }),
  setDrawCoords: (coords) => set({ drawCoords: coords }),
  toggleActivateTool: () => set((state) => ({ activateTool: !state.activateTool })),
  setSumDx: (value) => set({ sumDx: value }),
  setSumDy: (value) => set({ sumDy: value }),
  setCanvasClick: (coords) => set({ canvasClick: coords }),
  
  // History actions
  addToHistory: (state) => set((s) => ({ 
    history: [...s.history, state],
    prevHistoryId: s.history.length > 0 ? s.history.length - 1 : null
  })),
  setBranch: (branchNumber) => set({ branch: branchNumber }),
  setPrevHistoryId: (id) => set({ prevHistoryId: id }),
  
  // ViewBox actions
  updateViewBox: (newViewBox) => set({ viewBox: newViewBox }),
  zoomIn: () => set((state) => ({ 
    viewBox: {
      ...state.viewBox,
      width: state.viewBox.width * 0.9,
      height: state.viewBox.height * 0.9
    }
  })),
  zoomOut: () => set((state) => ({ 
    viewBox: {
      ...state.viewBox,
      width: state.viewBox.width * 1.1,
      height: state.viewBox.height * 1.1
    }
  })),
  pan: (dx, dy) => set((state) => ({
    viewBox: {
      ...state.viewBox,
      x: state.viewBox.x - dx,
      y: state.viewBox.y - dy
    }
  })),
  setViewBox: () => set(() => ({
    //
  })),
  setActiveTool: () => set(() => ({
    //
  }))
}));

export default useStore;