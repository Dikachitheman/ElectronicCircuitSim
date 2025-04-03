import React, { useEffect, useRef, useState } from 'react';

export const Canvas = () => {
    const canvasRef = useRef(null);
    const [isPainting, setIsPainting] = useState(false);
    const [lineWidth, setLineWidth] = useState(5);
    const [strokeColor, setStrokeColor] = useState('#FF0DF4');
    const [dsBuffer, setDsBuffer] = useState(null)
    const [preview, setPreview] = useState(false)
    const contextRef = useRef(null);
    const [isActive, setIsActive] = useState(false)


    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Set canvas size
        canvas.width = window.innerWidth - 60; // Subtract some offset
        canvas.height = window.innerHeight - 200; // Subtract some offset for toolbar
        
        // Setup context
        const context = canvas.getContext('2d');
        context.lineCap = 'round';
        context.lineWidth = lineWidth;
        context.strokeStyle = strokeColor;
        contextRef.current = context;
        
        // Handle window resize
        const handleResize = () => {
            canvas.width = window.innerWidth - 100;
            canvas.height = window.innerHeight - 200;
            context.lineCap = 'round';
            context.lineWidth = lineWidth;
            context.strokeStyle = strokeColor;
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [lineWidth, strokeColor]);

    // Update context when drawing settings change
    useEffect(() => {
        if (contextRef.current) {
            console.log("ctx", contextRef)
            console.log("current", contextRef.current)
            contextRef.current.lineWidth = lineWidth;
            contextRef.current.strokeStyle = strokeColor;
        }
    }, [lineWidth, strokeColor]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        contextRef.current.beginPath();
        contextRef.current.moveTo(x, y);

        setIsPainting(true);
    };

    const downScale = (x, y) => {
        let div = 10

        // const scaledX = Math.ceil(x / div);
        // const scaledY = Math.ceil(y / div);

        const scaledX = x
        const scaledY = y

        // console.log("x", x, "y", y)

        setDsBuffer(prevBuffer => {
            const newBuffer = {...prevBuffer};
            newBuffer[scaledX] = scaledY;
            return newBuffer;
        });

        return dsBuffer
    }

    const draw = (e) => {
        if (!isPainting) return;
        
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        contextRef.current.lineTo(x, y);
        // console.log(x,y)
        let dcb = downScale(x,y)
        contextRef.current.stroke();
    };

    const previewDS = () => {
        setPreview(!preview);
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!preview) {
            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw downscaled points
            const div = 1; // Same scaling factor as in downScale
            context.beginPath();
            
            // Convert object keys to array and sort them
            const keys = Object.keys(dsBuffer).map(Number).sort((a, b) => a - b);
            
            if (keys.length > 0) {
                // Move to first point
                context.moveTo(keys[0] * div, dsBuffer[keys[0]] * div);
                
                // Draw lines to subsequent points
                for (let i = 1; i < keys.length; i++) {
                    context.lineTo(keys[i] * div, dsBuffer[keys[i]] * div);
                }
                
                context.stroke();
            }
        } else {
            // Restore original drawing (you might want to save the original state)
            // For now, just clear
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const stopDrawing = () => {
        contextRef.current.closePath();
        setIsPainting(false);
        console.log(dsBuffer)
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <div className="">

            {
                isActive && (
                    <div className=" border">
                        <canvas
                            id="drawing-board"
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            style={{ border: '11px solid #111'  }}
                        />
                    </div>
                )
            }

            <div className=" bg-white/10 backdrop-blur-lg
             border-white/30 rounded-lg shadow-lg overflow-hidden border w-[300px]
             absolute top-[0px] right-[86px] text-white">
                
                <div className="">
                    <label htmlFor="stroke">Stroke Color:</label>
                    <input 
                        id="stroke" 
                        name="stroke" 
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                    />
                </div>
                
                <div className="">
                    <label htmlFor="lineWidth">Line Width:</label>
                    <input 
                        id="lineWidth" 
                        name="lineWidth" 
                        type="number" 
                        value={lineWidth}
                        min="1"
                        max="50"
                        onChange={(e) => setLineWidth(parseInt(e.target.value))}
                        className='text-black'
                    />
                </div>

                <button onClick={previewDS}>Downscale</button>
                <button onClick={clearCanvas}>Clear</button>

                <button onClick={() => setIsActive(!isActive)}>Eye</button>
            </div>

        </div>
    );
};