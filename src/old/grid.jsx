import { useRef, useEffect, useState } from 'react';

export default function GridBoxPattern() {
  const canvasRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Grid configuration
  const [gridConfig, setGridConfig] = useState({
    cellSize: 40,
    lineWidth: 1,
    majorLineFrequency: 5,
    majorLineWidth: 2
  });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size to match container with device pixel ratio for sharpness
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      drawGrid();
    };
    
    // Draw the grid pattern
    const drawGrid = () => {
      const { cellSize, lineWidth, majorLineFrequency, majorLineWidth } = gridConfig;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Set grid colors based on theme
      const minorLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      const majorLineColor = isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)';
      const backgroundColor = isDarkMode ? '#121212' : '#f8f8f8';
      
      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      
      // Calculate grid lines
      const numXLines = Math.ceil(width / cellSize) + 1;
      const numYLines = Math.ceil(height / cellSize) + 1;
      
      // Draw vertical lines
      for (let i = 0; i < numXLines; i++) {
        const x = i * cellSize;
        const isMajor = i % majorLineFrequency === 0;
        
        ctx.beginPath();
        ctx.strokeStyle = isMajor ? majorLineColor : minorLineColor;
        ctx.lineWidth = isMajor ? majorLineWidth : lineWidth;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let i = 0; i < numYLines; i++) {
        const y = i * cellSize;
        const isMajor = i % majorLineFrequency === 0;
        
        ctx.beginPath();
        ctx.strokeStyle = isMajor ? majorLineColor : minorLineColor;
        ctx.lineWidth = isMajor ? majorLineWidth : lineWidth;
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };
    
    // Initial draw and resize handling
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gridConfig, isDarkMode]);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const updateGridConfig = (key, value) => {
    setGridConfig({
      ...gridConfig,
      [key]: parseInt(value)
    });
  };
  
  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-100 dark:bg-gray-800 p-4 flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Cell Size:
            <input
              type="range"
              min="10"
              max="100"
              value={gridConfig.cellSize}
              onChange={(e) => updateGridConfig('cellSize', e.target.value)}
              className="ml-2"
            />
            <span className="ml-2">{gridConfig.cellSize}px</span>
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Major Line Frequency:
            <input
              type="range"
              min="2"
              max="10"
              value={gridConfig.majorLineFrequency}
              onChange={(e) => updateGridConfig('majorLineFrequency', e.target.value)}
              className="ml-2"
            />
            <span className="ml-2">Every {gridConfig.majorLineFrequency} lines</span>
          </label>
        </div>
        
        <button
          onClick={toggleTheme}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      
      <div 
        className="flex-grow relative"
        style={{ 
          backgroundColor: isDarkMode ? '#121212' : '#f8f8f8',
        }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        <div className="relative p-8 max-w-md mx-auto mt-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg bg-opacity-80 dark:bg-opacity-80">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Grid Box Pattern Canvas</h2>
          <p className="text-gray-600 dark:text-gray-300">
            This component demonstrates a customizable grid pattern drawn on HTML Canvas.
            Adjust the controls above to modify the grid spacing and appearance.
            The canvas automatically resizes to fit its container and maintains the grid pattern.
          </p>
        </div>
      </div>
    </div>
  );
}