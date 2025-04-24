import React, { useEffect, useRef, useState } from 'react';

export const Canvas = ({setViewBox, isDragging, setDrawCoords, setActivateTool}) => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isPainting, setIsPainting] = useState(false);
    const [lineWidth, setLineWidth] = useState(5);
    const [strokeColor, setStrokeColor] = useState('#FF0DF4');
    const [dsBuffer, setDsBuffer] = useState(null)
    const [preview, setPreview] = useState(false)
    const [isActive, setIsActive] = useState(true)

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

    // useEffect(() => {
    //     contextRef.current.beginPath()
    //     contextRef.current.rect(800, 200, 20, 20)
    //     contextRef.current.fillStyle = "pink"
    //     contextRef.current.fill()
    // }, [])


    // Update context when drawing settings change
    useEffect(() => {

        if (contextRef.current) {
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
        let div = 6

        const scaledX = Math.ceil(x / div);
        const scaledY = Math.ceil(y / div);

        // const scaledX = x
        // const scaledY = y

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
        let dcb = downScale(x,y)
        contextRef.current.stroke();
    };

    function dsBuffertoArray(dict) {
        if (dict) {
            return Object.entries(dict).map(([key, value]) => {
                return [parseFloat(key), value];
            });
        }
    }

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

    const findVertices = (a) => {
        let result = 0;
        let farthestPoints = [null, null];
        
        if (a?.length > 0) {
            for (let i = 0; i < a.length; i++) {
                for (let j = i + 1; j < a.length; j++) {
                    let d = coordDistance(a[i][0], a[i][1], a[j][0], a[j][1]);
                    
                    if (d > result) {
                        result = d;
                        farthestPoints = [a[i], a[j]];
                    }
                }
            }
        }
        
        return {
            maxDistance: result,
            points: farthestPoints
        };
    }

    const downloadImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        // Get the image data as a data URL (PNG format by default)
        const imageDataURL = canvas.toDataURL('image/png');
        const uuid = crypto.randomUUID();
        // Create a temporary link element
        const downloadLink = document.createElement('a');
        downloadLink.href = imageDataURL;
        downloadLink.download = `${uuid}.png`; // Set the filename
    
        // Programmatically click the link to trigger the download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink); // Clean up the temporary link

        clearCanvas()
    }

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
                // Set fill style for points
                context.fillStyle = strokeColor; // Use the current stroke color or set another color
                
                // Draw individual points
                for (let i = 0; i < keys.length; i++) {
                    const x = keys[i] * div + 500;
                    const y = dsBuffer[keys[i]] * div + 300;
                    
                    // Draw a circle at each point
                    context.beginPath();
                    context.arc(x, y, lineWidth / 2, 0, Math.PI * 2); // Use lineWidth as radius or adjust as needed
                    context.fill();
                }
            }
        } else {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const stopDrawing = () => {
        contextRef.current.closePath();
        setIsPainting(false);
        let dsArray = dsBuffertoArray(dsBuffer)

        const findVerticesPromise = new Promise((resolve) => {
            let vertices = findVertices(dsArray)
            resolve(vertices)
        })

        findVerticesPromise
            .then(vertices => {
                setDrawCoords(vertices.points)
            })
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        setDsBuffer(null)
        setDrawCoords(null)
    };

    const handleActivateTool = () => {

        Promise.resolve()
            .then(() => {
                setActivateTool(true)
            })
                .then(() => {
                    clearCanvas()
                })
    }

    const useKeyPress = (key, callback) => {
        useEffect(() => {
            const handleKeyDown = (event) => {
            if (event.key.toLowerCase() === key.toLowerCase()) {
                callback();
            }
            };
        
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }, [key, callback]);
    };

    useKeyPress("d", downloadImage)

    useKeyPress("k", downloadImage)

    return (
        <div className="">

            {
                isActive && (
                    <div className="border ">
                        <canvas
                            id="drawing-board"
                            ref={canvasRef}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            // style={{ border: '11px solid #111'  }}
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
                
                <button className='ml-[14px] mt-[22px]' onClick={downloadImage}>Download</button>
                <button className='ml-[14px] mt-[22px]' onClick={previewDS}>Downscale</button>
                <button className='ml-[14px] mt-[22px]' onClick={clearCanvas}>Clear</button>
                <button className='ml-[14px] mt-[22px]' onClick={() => setIsActive(!isActive)}>Eye</button>
                <button className='ml-[14px] mt-[22px]' onClick={() => handleActivateTool()}>Activate</button>
            </div>

        </div>
    );
};