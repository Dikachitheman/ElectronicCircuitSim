import { useEffect, useRef, useState } from 'react';
import { CapacitorIcon } from '../assets/svgIcon';

export default function Sine({pvr}) { // RECALL: use this instead pvr2
  const [isActive, setIsActive] = useState(false);
  const [current, setCurrent] = useState(null);
  const [pvr2, setPVR] = useState(null)

  useEffect(() => {
    // Assuming your array is stored in a variable called 'data'
    const data = [
      {
        comp: 1,
        imax: -0.04785513731757324,
        impedance: "4ohms",
        type: "Resistor",
        vmax: -0.19142054927029295
      },
      {
        comp: 2,
        imax: -0.04785513731757324,
        impedance: "-j0.0019904458598726115uf",
        type: "Capacitor",
        vmax: -0.00009525305994739896
      },
      {
        comp: 3,
        imax: -0.04785513731757324,
        impedance: "-5VDC",
        type: "DCVoltageSource",
        vmax: NaN
      },
      {
        comp: 4,
        imax: -0.04785513731757324,
        impedance: "j100.48H",
        type: "Inductor",
        vmax: -4.808484197669759
      }
    ];

    setPVR(data)
}, [])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className='flex'>
        <button
          onClick={() => setIsActive((prev) => !prev)}
          className="px-4 py-2 bg-[#b0ff06] text-[#05250e] font-semibold rounded-[24px] mr-2 shadow"
        >
          {isActive ? "Stop Oscilloscope" : "Start Oscilloscope"}
        </button>
        <div className='flex text-white space-x-1'>
          {pvr2 && pvr2.map((item) => (
            <div onClick={()=>setCurrent(item)} className='rounded-[12px] text-black border border-[#d5d5d5] px-[14px] flex items-center bg-white/50 backdrop-blur-[12px]'>
              <div className='mr-[8px]'>
                {item.comp}
              </div>
              <div className='mr-[12px]'>
                {item.type}
              </div>
              <div>
                <CapacitorIcon />
              </div>
            </div>
          ))}
        </div>
      </div>
      {isActive && <SineWave current={current}/>}
    </div>
  );
}

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


function SineWave({current}) {
  const canvasRef = useRef(null);
  const [state, setState] = useState(null);
  // const [isAmplitude, setIsAmplitude] = useState(false);
  const animationRef = useRef(null);
  const stateRef = useRef(null)

  let isAmplitude = false
  let phaseOffset = 0
  let wasAmplitude = false
  let x = 0;
  let y = current?.vmax || null; // RECALL: fix this using scaling function
  let yb = y
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const charge = (x) => {
      let coef = 60; // RECALL: use vmax where theres 60
      let rc = 14 * 30;
      let exp = (-1 * x ) / rc;
      
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
      
      // Draw reference line at center
      ctx.beginPath();
      ctx.strokeStyle = "#555555";
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = "#555555";
      ctx.moveTo(0, 60);
      ctx.lineTo(canvas.width, 60);
      ctx.stroke();
      
      // Draw waveform
      ctx.fillStyle = "#a7ff0f";
      ctx.lineWidth = 2;
      ctx.fillRect(x, y, 2, 2)

      ctx.fillStyle = "#a7ff0f";
      ctx.lineWidth = 2;
      ctx.fillRect(x, yb, 2, 2)
      
      x = x + 2.5;

      if (state === 'start') {
        if (isAmplitude) {

          if (!wasAmplitude) {
            const currentPhase = Math.asin((y - canvas.height / 2) / 60) / 0.04;
            phaseOffset = x - currentPhase;
            wasAmplitude = true;
          }
          
          y = canvas.height / 2 - 60 * Math.sin(0.04 * x - phaseOffset);

          yb = canvas.height / 2 - 60 * Math.sin(0.04 * x - phaseOffset + 90);

        } else {
          y = charge(x); // Offset by initial x
          
          // let diff = 60 - Math.abs(y - canvas.height / 2);
          let diff = Math.abs(60 - y)
          diff *= diff
          if (diff < 0.5) {
            isAmplitude = true
          }
        }
      } else if (state === 'end') {

        // Get the initial y value when discharge starts
        const initialY = y;
        
        // Change to discharge function
        y = discharge(x, initialY); // Reset x counter for discharge
        
        // Stop animation when discharge is complete
        if (Math.abs(y - canvas.height / 2) < 0.5) {
          cancelAnimationFrame(animationRef.current);
          return;
        }
      }
      
      stateRef.current = [x, y]
      animationRef.current = requestAnimationFrame(animate);
    };

    const animateDischarge = () => { // pipe previous value states to proceed.
      // Draw reference line at center
      ctx.beginPath();
      ctx.strokeStyle = "#555555";
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = "#555555";
      ctx.moveTo(0, 60);
      ctx.lineTo(canvas.width, 60);
      ctx.stroke();

      // Draw waveform
      ctx.strokeStyle = "#00AAFF";
      ctx.lineWidth = 2;
      ctx.fillRect(x, y, 2, 2)

      x = x + 0.5;

      // Get the initial y value when discharge starts
      const initialY = y;
      
      // Change to discharge function
      y = discharge(x, initialY); // Reset x counter for discharge
      console.log(x, y)

      animationRef.current = requestAnimationFrame(animateDischarge);
    }

    if (state === 'start') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Clear any existing animation frame before starting a new one
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Start the animation
      animationRef.current = requestAnimationFrame(animate);
    }

    if (state === 'end') {
      x = stateRef.current[0]
      y = stateRef.current[1]
      console.log("end")
      // Start the animation
      animationRef.current = requestAnimationFrame(animateDischarge);
    }
    
    // Cleanup function to cancel animation when component unmounts
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state]);

  const handleClick = (state) => {
    setState(state)
    // stateRef.current = state
  }

  return (
    <div className="flex justify-center p-[6px] bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg shadow-lg">

      <div className=' flex space-x-[16px] bg-[#0c0c0c] rounded-lg w-[40%] text-[#152110]'>
        <button 
          className="px-4 py-2 bg-[#b3b785]  w-[90px] h-fit rounded-md hover:bg-blue-600" 
          onClick={() => handleClick('start')}
        >
          Start
        </button>
        <button 
          className="px-4 py-2 bg-[#a1845f] w-[90px] h-fit rounded-md hover:bg-red-600" 
          onClick={() => handleClick('end')}
        >
          End
        </button>
        <p>{state === 'start' ? "Charging/Oscillating" : state === 'end' ? "Discharging" : "Ready"}</p>
      </div>
      <div className="ml-[2px] flex w-fit justify-center items-center bg-black/35 backdrop-blur-lg rounded-lg overflow-hidden">
        <div className="absolute bg-gradient-to-br from-slate-300/20 via-slate-100/10 to-gray-500/30 mix-blend-overlay"></div>
        <canvas ref={canvasRef} width={700} height={200} />
      </div>
    </div>
  );
}
