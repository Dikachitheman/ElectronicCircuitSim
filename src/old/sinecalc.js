// useEffect(() => {
  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext('2d');
    
  //   // Fixed position where the end of the wave should be
  //   const endX = 320;
    
  //   // Starting x position for the wave
  //   let startPosition = 0;
    
  //   // Track how much we've panned
  //   let panOffset = 0;
    
  //   const animate = () => {
  //     // Clear the entire canvas
  //     ctx.clearRect(0, 0, canvas.width, canvas.height);
      
  //     // Save the current canvas state
  //     ctx.save();
      
  //     // Apply panning transformation (moving everything left)
  //     ctx.translate(-panOffset, 0);
      
  //     // Draw reference lines (these will also pan)
  //     ctx.beginPath();
  //     ctx.strokeStyle = "#555555";
  //     ctx.moveTo(0, canvas.height / 2);
  //     ctx.lineTo(canvas.width + panOffset, canvas.height / 2);
  //     ctx.stroke();
      
  //     ctx.beginPath();
  //     ctx.strokeStyle = "#555555";
  //     ctx.moveTo(240, 0);
  //     ctx.lineTo(240, canvas.height);
  //     ctx.stroke();
      
  //     // Draw sine wave
  //     ctx.beginPath();
  //     ctx.strokeStyle = "#a7ff0f";
  //     ctx.lineWidth = 2;
      
  //     // Calculate total length of wave we need to draw
  //     // (ensure we draw enough to fill screen after panning)
  //     const totalLength = endX + panOffset;
      
  //     // Starting point of the wave
  //     startPosition = panOffset;
      
  //     for (let x = startPosition; x <= totalLength; x += 2) {
  //       const y = canvas.height / 2 - 60 * Math.sin(0.04 * x - phaseOffset);
        
  //       if (x === startPosition) {
  //         ctx.moveTo(x, y);
  //       } else {
  //         ctx.lineTo(x, y);
  //       }
        
  //       // Draw the end point marker when we reach endX
  //       if (x >= endX && x < endX + 2) {
  //         ctx.fillStyle = "#a7ff0f";
  //         ctx.fillRect(x, y, 2, 2);
  //       }
  //     }
  //     ctx.stroke();
      
  //     // Restore canvas state (removes the translation for the next frame)
  //     ctx.restore();
      
  //     // Increase pan offset for next frame
  //     panOffset += 2.5;
      
  //     // Print the current position for debugging
  //     console.log("Pan offset:", panOffset, "End position:", endX);
      
  //     // Continue animation
  //     animationRef.current = requestAnimationFrame(animate);
  //   };
    
  //   if (state === 'start') {
  //     animationRef.current = requestAnimationFrame(animate);
  //   }
    
  //   // Cleanup function
  //   return () => {
  //     if (animationRef.current) {
  //       cancelAnimationFrame(animationRef.current);
  //     }
  //   };
  // }, [state, phaseOffset]);


  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   const ctx = canvas.getContext('2d');
    
  //   const charge = (x) => {
  //     let coef = 60; // RECALL: use vmax where theres 60
  //     let rc = 14 * 30;
  //     let exp = (-1 * x ) / rc;
      
  //     let chargeVal = coef * (1 - Math.exp(exp));
  //     // console.log("cv", chargeVal)
  //     return canvas.height / 2 - chargeVal
  //   };
    
  //   const discharge = (x, initialY) => {
  //     let coef = initialY - canvas.height / 2;
  //     let rc = 10 * 30;
  //     let exp = (-1 * x) / rc;
      
  //     let dischargeVal = coef * Math.exp(exp);
  //     return canvas.height / 2 - dischargeVal;
  //   };

  //   const animate = () => {
      
  //     // Draw reference line at center
  //     ctx.beginPath();
  //     ctx.strokeStyle = "#555555";
  //     ctx.moveTo(0, canvas.height / 2);
  //     ctx.lineTo(canvas.width, canvas.height / 2);
  //     ctx.stroke();

  //     ctx.beginPath();
  //     ctx.strokeStyle = "#555555";
  //     ctx.moveTo(0, 60);
  //     ctx.lineTo(canvas.width, 60);
  //     ctx.stroke();
      
  //     // Draw waveform
  //     ctx.fillStyle = "#a7ff0f";
  //     ctx.lineWidth = 2;
  //     ctx.fillRect(x, y, 2, 2)

  //     ctx.fillStyle = "#a7ff0f";
  //     ctx.lineWidth = 2;
  //     ctx.fillRect(x, yb, 2, 2)
      
  //     x = x + 2.5;

  //     if (state === 'start') {
  //       if (isAmplitude) {

  //         if (!wasAmplitude) {
  //           const currentPhase = Math.asin((y - canvas.height / 2) / 60) / 0.04;
  //           phaseOffset = x - currentPhase;
  //           wasAmplitude = true;
  //         }
          
  //         y = canvas.height / 2 - 60 * Math.sin(0.04 * x - phaseOffset);

  //         yb = canvas.height / 2 - 60 * Math.sin(0.04 * x - phaseOffset + 90);

  //       } else {
  //         y = charge(x); // Offset by initial x
          
  //         // let diff = 60 - Math.abs(y - canvas.height / 2);
  //         let diff = Math.abs(60 - y)
  //         diff *= diff
  //         if (diff < 0.5) {
  //           isAmplitude = true
  //         }
  //       }
  //     } else if (state === 'end') {

  //       // Get the initial y value when discharge starts
  //       const initialY = y;
        
  //       // Change to discharge function
  //       y = discharge(x, initialY); // Reset x counter for discharge
        
  //       // Stop animation when discharge is complete
  //       if (Math.abs(y - canvas.height / 2) < 0.5) {
  //         cancelAnimationFrame(animationRef.current);
  //         return;
  //       }
  //     }
      
  //     stateRef.current = [x, y]
  //     animationRef.current = requestAnimationFrame(animate);
  //   };

  //   const animateDischarge = () => { // pipe previous value states to proceed.
  //     // Draw reference line at center
  //     ctx.beginPath();
  //     ctx.strokeStyle = "#555555";
  //     ctx.moveTo(0, canvas.height / 2);
  //     ctx.lineTo(canvas.width, canvas.height / 2);
  //     ctx.stroke();

  //     ctx.beginPath();
  //     ctx.strokeStyle = "#555555";
  //     ctx.moveTo(0, 60);
  //     ctx.lineTo(canvas.width, 60);
  //     ctx.stroke();

  //     // Draw waveform
  //     ctx.strokeStyle = "#00AAFF";
  //     ctx.lineWidth = 2;
  //     ctx.fillRect(x, y, 2, 2)

  //     x = x + 0.5;

  //     // Get the initial y value when discharge starts
  //     const initialY = y;
      
  //     // Change to discharge function
  //     y = discharge(x, initialY); // Reset x counter for discharge

  //     animationRef.current = requestAnimationFrame(animateDischarge);
  //   }

  //   if (state === 'start') {
  //     ctx.clearRect(0, 0, canvas.width, canvas.height);

  //     // Clear any existing animation frame before starting a new one
  //     if (animationRef.current) {
  //       cancelAnimationFrame(animationRef.current);
  //     }
  //     // Start the animation
  //     animationRef.current = requestAnimationFrame(animate);
  //   }

  //   if (state === 'end') {
  //     x = stateRef.current[0]
  //     y = stateRef.current[1]
  //     console.log("end")
  //     // Start the animation
  //     animationRef.current = requestAnimationFrame(animateDischarge);
  //   }
    
  //   // Cleanup function to cancel animation when component unmounts
  //   return () => {
  //     if (animationRef.current) {
  //       cancelAnimationFrame(animationRef.current);
  //     }
  //   };
  // }, [state]);



  // const SineWave = () => {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
    
//     // Wave properties
//     const amplitude = 60;
//     const frequency = 0.04;
//     let phase = 0;
//     let animationFrameId;
    
//     const drawWave = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       ctx.beginPath();
//       ctx.strokeStyle = '#20F2CA';
//       ctx.lineWidth = 2;
      
//       for (let x = 0; x < canvas.width; x++) {
//         const y = amplitude * Math.sin(frequency * x + phase) + canvas.height / 2;
//         x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
//       }
      
//       ctx.stroke();
//       phase += 0.05;
//       animationFrameId = requestAnimationFrame(drawWave);
//     };

//     drawWave();

//     return () => cancelAnimationFrame(animationFrameId);
//   }, []);

//   return (
//     <div className="flex justify-center">
//       <div className="flex w-fit justify-center items-center bg-white/10 backdrop-blur-lg border border-white/30 rounded-lg shadow-lg overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-slate-300/20 via-slate-100/10 to-gray-500/30 mix-blend-overlay"></div>
//         <canvas ref={canvasRef} width={900} height={200} />
//       </div>
//     </div>
//   );
// };
