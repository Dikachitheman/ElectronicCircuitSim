export default function Sine() {
    const [isActive, setIsActive] = useState(true);
  
    return (
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setIsActive((prev) => !prev)}
          className="px-4 py-2 bg-blue-500 text-white rounded shadow"
        >
          {isActive ? "Stop Wave" : "Start Wave"}
        </button>
        {isActive && <SineWave />}
      </div>
    );
  }
  
  import { useEffect, useRef, useState } from 'react';
  
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
  
  
  function SineWave() {
    const canvasRef = useRef(null);
    const [state, setState] = useState(null);
    const [isAmplitude, setIsAmplitude] = useState(false);
    const animationRef = useRef(null);
  
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      let x = 0;
      let xb = 0 + 10; // Increased the point distance for better visibility
      let y = canvas.height / 2;
      let yb = canvas.height / 2;
      
      const charge = (x) => {
        let coef = 60;
        let rc = 14 * 30;
        let exp = (-1 * x * 20) / rc;
        
        let chargeVal = coef * (1 - Math.exp(exp));
        // console.log("cv", chargeVal)
        return canvas.height / 2 - chargeVal
      };
      
      const discharge = (x, initialY) => {
        let coef = initialY - canvas.height / 2;
        let rc = 10 * 30;
        let exp = (-1 * x) / rc;
        
        let dischargeVal = coef * Math.exp(exp);
        return canvas.height / 2 - dischargeVal;
      };
  
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw reference line at center
        ctx.beginPath();
        ctx.strokeStyle = "#555555";
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        
        // Draw waveform
        ctx.beginPath();
        ctx.strokeStyle = "#00AAFF";
        ctx.lineWidth = 2;
        ctx.moveTo(x, y);
        ctx.lineTo(xb, yb);
        ctx.stroke();
        
        x = x + 0.5;
        xb = x + 10;
        console.log(x, xb)
        if (state === 'start') {
  
          if (isAmplitude) {
            console.log("yeah")
            y = 60 * Math.sin(0.04 * x) + canvas.height / 2;
            yb = 60 * Math.sin(0.04 * xb) + canvas.height / 2;
          } else {
            console.log("nah")
            y = charge(x); // Offset by initial x
            yb = charge(xb); // Offset by initial x
            
            // let diff = 60 - Math.abs(y - canvas.height / 2);
            let diff = Math.abs(60 - y)
            if ((diff * diff) < 4) {
              setIsAmplitude(true);
            }
          }
        } else if (state === 'end') {
          // Get the initial y value when discharge starts
          const initialY = y;
          
          // Change to discharge function
          y = discharge(x - x, initialY); // Reset x counter for discharge
          yb = discharge(xb - x, initialY);
          
          // Stop animation when discharge is complete
          if (Math.abs(y - canvas.height / 2) < 2) {
            cancelAnimationFrame(animationRef.current);
            return;
          }
        }
        
        animationRef.current = requestAnimationFrame(animate);
      };
  
      if (state === 'start' || state === 'end') {
        // Clear any existing animation frame before starting a new one
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        
        // Start the animation
        animationRef.current = requestAnimationFrame(animate);
      }
      
      // Cleanup function to cancel animation when component unmounts
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [state, isAmplitude]);
  
    return (
      <div className="flex justify-center">
        <div className='text-white flex flex-col space-y-2'>
          <button 
            className="px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600" 
            onClick={() => {
              setIsAmplitude(false);
              setState('start');
            }}
          >
            Start
          </button>
          <button 
            className="px-4 py-2 bg-red-500 rounded-md hover:bg-red-600" 
            onClick={() => setState('end')}
          >
            End
          </button>
          <p>{state === 'start' ? "Charging/Oscillating" : state === 'end' ? "Discharging" : "Ready"}</p>
        </div>
        <div className="ml-4 flex w-fit justify-center items-center bg-white/10 backdrop-blur-lg border border-white/30 rounded-lg shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-300/20 via-slate-100/10 to-gray-500/30 mix-blend-overlay"></div>
          <canvas ref={canvasRef} width={900} height={200} />
        </div>
      </div>
    );
  }
  