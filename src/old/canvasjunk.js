const previewImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Debug: Check if canvas has content
    console.log("Canvas dimensions:", canvas.width, canvas.height);
    
    let dsArray = dsBuffertoArray(dsBuffer);
    
    const findVerticesPromise = new Promise((resolve) => {
        let vertices = findVertices(dsArray);
        console.log("Found vertices:", vertices);
        resolve(vertices.points);
    });
    
    findVerticesPromise
        .then(vertices => {
            // Make sure vertices are valid
            if (!vertices || vertices.length < 2) {
                console.error("Invalid vertices data:", vertices);
                return null;
            }
            
            let sx = Math.round(vertices[0][0]);
            let sy = Math.round(vertices[0][1]);
            
            // I suspect sw and sh might actually be coordinates, not dimensions
            // If they're coordinates, we need to calculate dimensions
            let sw = Math.round(vertices[1][0] - sx); // Convert to dimension if needed
            let sh = Math.round(vertices[1][1] - sy); // Convert to dimension if needed
            
            // Ensure positive dimensions
            if (sw <= 0 || sh <= 0) {
                console.error("Invalid dimensions:", sw, sh);
                return null;
            }
            
            console.log("Capturing region:", sx, sy, sw, sh);
            
            // Check if coordinates are within canvas bounds
            if (sx < 0 || sy < 0 || sx + sw > canvas.width || sy + sh > canvas.height) {
                console.warn("Coordinates outside canvas bounds, adjusting...");
                sx = Math.max(0, sx);
                sy = Math.max(0, sy);
                sw = Math.min(sw, canvas.width - sx);
                sh = Math.min(sh, canvas.height - sy);
            }
            
            // Get image data with validated dimensions
            try {
                const imageData = context.getImageData(sx, sy, sw, sh);
                console.log("Captured imageData:", imageData.width, imageData.height);
                
                // Debug: Check if image data has non-transparent pixels
                let hasContent = false;
                for (let i = 3; i < imageData.data.length; i += 4) {
                    if (imageData.data[i] > 0) { // Check alpha channel
                        hasContent = true;
                        break;
                    }
                }
                console.log("Image data has visible content:", hasContent);
                
                return {imageData, sx, sy, sw, sh, context};
            } catch (error) {
                console.error("Error capturing image data:", error);
                return null;
            }
        })
        .then((data) => {
            if (data) {
                tempcanvas(data);
            } else {
                console.error("Failed to process image data");
            }
        });
}

const tempcanvas = (data) => {
    if (!data || !data.imageData) {
        console.error("No valid image data provided");
        return;
    }
    
    const {imageData, context} = data;
    
    // Create a temporary canvas with the exact dimensions of the image data
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    const tempContext = tempCanvas.getContext('2d');
    
    // Draw the image data to the temporary canvas
    tempContext.putImageData(imageData, 0, 0);
    
    // Debug: Check if temp canvas has content
    console.log("Temp canvas dimensions:", tempCanvas.width, tempCanvas.height);
    
    // Make the temp canvas visible for debugging
    tempCanvas.style.border = "3px solid red";
    tempCanvas.style.margin = "10px";
    document.body.appendChild(tempCanvas);
    
    // Draw to the main canvas as well (optional)
    if (context) {
        context.drawImage(tempCanvas, 100, 180);
    }
    
    // Convert to data URL for download
    const imageDataURL = tempCanvas.toDataURL('image/png');
    console.log("Generated image URL length:", imageDataURL.length);
    
    // Download the image
    downloadImage(imageDataURL);
}