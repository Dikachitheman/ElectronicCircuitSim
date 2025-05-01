import { useEffect, useRef, useState } from 'react';
import { CapacitorIcon } from '../assets/svgIcon';
import CanvasSLider, { OscilloscopeKnob, StepSlider } from './slider';

export default function Sine({pvr}) { // RECALL: use this instead pvr2
  const [isActive, setIsActive] = useState(true);
  const [current, setCurrent] = useState(null);
  const [pvr2, setPVR] = useState(null)
  const [all, setAll] = useState(true)

  useEffect(() => {
    // Assuming your array is stored in a variable called 'data'
    const data = [
      {
        comp: 1,
        imax: -0.04785513731757324,
        impedance: "4ohms",
        type: "Resistor",
        vmax: 120
      },
      {
        comp: 2,
        imax: -0.04785513731757324,
        impedance: "-j0.0019904458598726115uf",
        type: "Capacitor",
        vmax: 100
      },
      // {
      //   comp: 3,
      //   imax: -0.04785513731757324,
      //   impedance: "-5VDC",
      //   type: "DCVoltageSource",
      //   vmax: NaN
      // },
      {
        comp: 4,
        imax: -0.04785513731757324,
        impedance: "j100.48H",
        type: "Inductor",
        vmax: 70
      }
    ];

    setPVR(data)
}, [])

const handleClick = (item) => {
  setCurrent(item)
  setAll(false)
}

const handleAll = () => {
  setAll(true)
  setCurrent(null)
}

useEffect(() => {
  if (all) {
    // setCurrent(null)
  }
}, [all])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className='flex'>
        <button
          onClick={() => setIsActive((prev) => !prev)}
          className="px-4 py-2 bg-[#b0ff06] font-semibold text-[#05250e] rounded-[24px] mr-2 shadow"
        >
          {isActive ? "Stop Oscilloscope" : "Start Oscilloscope"}
        </button>
        <div className='flex text-white space-x-1'>
          <div onClick={() => handleAll()} className={`rounded-[12px] text-black border border-[#d5d5d5] px-[14px] flex items-center ${all ? "bg-white/80" : "bg-white/50"} backdrop-blur-[12px]`}>All</div>
          {pvr2 && pvr2.map((item, index) => (
            <div key={index} onClick={() => handleClick(item)} className={`rounded-[12px] text-black border border-[#d5d5d5] px-[14px] flex items-center ${current === item ? "bg-white/80" : "bg-white/50"} backdrop-blur-[12px]`}>
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
      <div className=''>
        {isActive && <SineWave current={current} all={all} scopeList={pvr2}/>}
      </div>
    </div>
  );
}

function SineWave({current, all, scopeList}) {
  const canvasRef = useRef(null);
  const [state, setState] = useState(null);
  const [sliderVal, setSliderVal] = useState(100)
  const [stepSliderVal, setStepSliderVal] = useState(8)
  const [liveOrDead, setLiveOrDead] = useState("live")
  const [vmax, setVmax] = useState(() => current?.vmax || null);
  const [vmaxInit, setVmaxInit] = useState(() => current?.vmax || null);
  const [allVmaxInit, setAllVmaxInit] = useState(null)
  const [allVmax, setAllVmax] = useState(null)
  const [origin, setOrigin] = useState(50)
  const animationRef = useRef(null);
  const stateRef = useRef(null)

  let isAmplitude = false
  let phaseOffset = 0
  let x = 0;
  let y = 0 || null; // RECALL: fix this using scaling function
  let yb = y

  const handleClick = (state) => {
    setState(state)
    // stateRef.current = state
  }

  const charge = (x, currentPhase, canvas, vMax, origin) => {
    let coef = vMax; // RECALL: use vmax where theres 60
    let rc = 17;
    let exp = (-1 * (x + currentPhase) ) / rc;
    
    let yOrigin =  origin - 50
    yOrigin *= 2

    let chargeVal = coef * (1 - Math.exp(exp));
    return canvas.height / 2 - (yOrigin) - chargeVal
  };

  const drawGrid = (ctx, canvas) => {
    for (let i = 0; i < 6; i++) {
      const x = i * 120;
      
      ctx.beginPath();
      ctx.strokeStyle = '#444441';
      ctx.lineWidth = 1;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let i = 0; i < 4; i++) {
      const y = i * 70;
      
      ctx.beginPath();
      ctx.strokeStyle = '#444441';
      ctx.lineWidth = 1;
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let wasAmplitude = false
    let endX = 680;
    let currentPhase = -680;
    let endXPhase = 0;
    let endXSine = endX;
    let sinePhase = null;
    let phaseShift = 0.1;

    drawGrid(ctx, canvas)
    
    const animate = () => {
      // Clear the entire canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      drawGrid(ctx, canvas)
      let yOrigin = (canvas.height * origin) / 100

      ctx.beginPath();
      ctx.strokeStyle = "#a7ff0f";
      ctx.lineWidth = 2;

      for (let x = 0; x <= endX; x += 1) {
        
        y = charge(x, currentPhase, canvas, vmax, origin)
        if (y < yOrigin) {
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        let diff = Math.abs(yOrigin - vmax - y)

        if (diff < 2) {
          isAmplitude = true
        }

        ctx.stroke();
      }

      if (isAmplitude) {

        endXPhase = endXPhase + phaseShift
        endX -= 0.1

        let w = 0.06

        if (!wasAmplitude) {
          sinePhase = Math.asin((y - yOrigin) / vmax) / w;
          wasAmplitude = true
        }

        for (let x = endX; x <= endXSine; x += 1  ) {

          y = yOrigin - vmax * Math.sin((w * x) + (currentPhase * w) + (sinePhase));
          if (x === endX) {  // EXPERIMENT LATER: use y < canvas height / 2 for different effect
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      
      currentPhase += phaseShift;
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (state === 'start') {
      handleLiveOrDead()
      animationRef.current = requestAnimationFrame(animate);
    }
    
    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state]);

  const orchestrate = ({currentPhase, strokeColor, vMax, ctx, canvas, endX, endXPhase, endXSine, sinePhase, phaseShift, origin}) => {
    let result = renderGraph({currentPhase, strokeColor, vMax, ctx, canvas, endX, endXPhase, endXSine, sinePhase, phaseShift, origin})

    if (result) {
      testRender({currentPhase: result.currentPhase, strokeColor, vMax, ctx, canvas, endX: result.endX, endXPhase: result.endXPhase, endXSine: result.endXSine, sinePhase: result.sinePhase, phaseShift, origin})
    }
  }

  const renderGraph = ({currentPhase, strokeColor, vMax, ctx, canvas, endX, endXPhase, endXSine, sinePhase, phaseShift, origin}) => {
    
    let wasAmplitude = false
    let nextXPhase = null

    drawGrid(ctx, canvas)

    // let yOrigin = (canvas.height * origin) / 100
    let yOrigin = origin - 50

    yOrigin *= 2

    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 8;

    for (let x = 0; x <= endX; x += 1) {

      y = charge(x, currentPhase, canvas, vMax, origin)

      if (y < canvas.height/2 - yOrigin) {
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      let diff = Math.abs(canvas.height/2 - yOrigin - vMax - y)

      if (diff < 1) {
        isAmplitude = true
        endXPhase = x
        break
      }

      ctx.stroke();
    }

    if (isAmplitude) {

      ctx.beginPath()

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 8;

      let w = 0.06

      if (!wasAmplitude) {
        sinePhase = (Math.asin(((((-1 * y) + (canvas.height/2)) - yOrigin) + (currentPhase * w))/ vMax) / w) + (endXPhase + currentPhase);
        wasAmplitude = true
        console.log("sinephase", sinePhase)
      }

      for (let x = endXPhase; x <= endXSine; x += 1  ) {

        // Apply phase shift to the sine calculation
        y = canvas.height/2 - yOrigin - vMax * Math.sin((w * (x - (endXPhase + currentPhase))) + (currentPhase * w) - (sinePhase * w));
        if (x === endX) { 
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        if (x > endXPhase + 240 ) {
          nextXPhase = x
          break
        }

      }
      ctx.stroke();
    }
    
    // Increase phase to move the wave to the left
    currentPhase += phaseShift;

    return {
      endX,
      endXPhase: nextXPhase,
      endXSine,
      currentPhase,
      sinePhase
    }
  }

  const testRender = ({currentPhase, strokeColor, vMax, ctx, canvas, endX, endXPhase, endXSine, sinePhase, phaseShift, origin}) => {
    
    // console.log("currentPhase", currentPhase, "endX", endX, "endXPhase", endXPhase, "endXSine", endXSine, 'sinePhase', sinePhase)
    drawGrid(ctx, canvas)

    // let yOrigin = (canvas.height * origin) / 100
    let yOrigin = origin - 50

    yOrigin *= 2

    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    
    ctx.beginPath()

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 12;

    let w = 0.06

    console.log(endXPhase + currentPhase, endXPhase, currentPhase)

    if (endXPhase) {
      for (let x = endXPhase; x <= endX; x += 1  ) {

        // Apply phase shift to the sine calculation
        y = canvas.height/2 - yOrigin - vMax * Math.sin((w * x) + (currentPhase * w) + (sinePhase * w));
        if (x === endX) { 
          ctx.moveTo(x, y);
        } else if(y<canvas.height/2 - yOrigin) {
          ctx.lineTo(x, y);
        }
      }
      
    }
    ctx.stroke();
  }

  const handleLiveOrDead = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (liveOrDead === 'live') {
      return
    } else {
      setLiveOrDead('live')
      setSliderVal(100)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawGrid(ctx, canvas)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let endX = 680;
    let endXPhase = 0;
    let endXSine = endX;
    let sinePhase = null;
    let chargePhase = 0.3;
    let phaseShift = 0.1;

    let currentPhase = (((100 - sliderVal) * endX) / 100) * -1

    if ( sliderVal < 100) {

      setLiveOrDead("dead")

      if (all) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        orchestrate({currentPhase, vMax: allVmax[0], origin: origin, strokeColor: "#a7ff0f", ctx, canvas, endX, endXPhase, endXSine, sinePhase, chargePhase, phaseShift})
        orchestrate({currentPhase, vMax: allVmax[1], origin: origin - 50, strokeColor: "#ff592b", ctx, canvas, endX, endXPhase, endXSine, sinePhase, chargePhase, phaseShift})
        orchestrate({currentPhase, vMax: allVmax[2], origin: origin + 50, strokeColor: "#BaBAFF", ctx, canvas, endX, endXPhase, endXSine, sinePhase, chargePhase, phaseShift})
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        orchestrate({currentPhase, vMax: vmax, strokeColor: "#a7ff0f", ctx, canvas, endX, endXPhase, endXSine, sinePhase, chargePhase, phaseShift, origin})
      }

    } else {
      setLiveOrDead("live")
    }

  }, [sliderVal, vmax, allVmax, origin])

  useEffect(() => {

    if (current) {
      setVmax(current?.vmax)
      setVmaxInit(current?.vmax)
    } 
    if (scopeList) {
      setAllVmaxInit(scopeList.map(v => v.vmax))
      setAllVmax(scopeList.map(v => v.vmax))
    }
  }, [current, scopeList])
  
  return (
    <div className="flex bg-black pl-[8px] py-[8px] border border-[#636363] rounded-[36px] shadow-lg">

      <div className='bg-[#353535] rounded-[34px] w-[300px] h-[268px] text-[#152110] p-[11px]'>
        
        <div className='bg-black rounded-[30px] pt-[9px] px-[18px]'>

          <div className='flex justify-between text-white'>
            <button className='bg-[#FF761A] rounded-[44px] px-[8px]'>Vertical</button>
            <button>Horizontal</button>
            <button>Trigger</button>
          </div>

          <div className='flex items-end text-[#F4F4F4] px-[8px] mt-[18px]'>
            <div className='flex w-full items-center space-x-[4px]'>
              <p>48s</p>
              <p className='text-[#559AFF] text-[14px]'>{state === 'start' ? "Charging/Oscillating" : state === 'end' ? "Discharging" : "Ready"}</p>
            </div>
            <div className='text-[12px] leading-3'>
              <p className='text-[16px] text-[#FF541F]'>0c14</p>
              <p>Resistor</p>
            </div>
          </div>
          <div className='mt-[8px] pb-[8px]'>
            <StepSlider state={stepSliderVal} vmaxInit={vmaxInit} allVmaxInit={allVmaxInit} setAllVmax={setAllVmax} setVmax={setVmax}  />
          </div>
        </div>
        <div className='flex h-[50%] w-full pl-[12px]'>
          <div className='flex flex-col w-[50%] mt-[12px]'>
            <button onClick={() => handleLiveOrDead()} className={`${liveOrDead === "live" ? ("bg-[#00E258] text-[#003824]") : liveOrDead === "dead" && ("bg-[#ff592b] text-[#300404]")} w-[64px] rounded-[6px]`}>
              {liveOrDead === "live" ? ("Live") : liveOrDead === "dead" && ("Dead")}
            </button>
            <div className='w-full flex mt-[8px] space-x-2  text-white'>
              <button 
                className="" 
                onClick={() => handleClick('start')}
              >
                Start
              </button>
              <button 
                className="" 
                onClick={() => handleClick('end')}
              >
                End
              </button>

              <p>{vmax}</p>
            </div>
            <p className='text-white'>All {all ? "true" : "false"}</p>

          </div>
          <div className='w-[74%] h-[100%] '>
            <OscilloscopeKnob origin={origin} setOrigin={setOrigin} />
          </div>
        </div>
      </div>

      <div className="ml-[2px] flex w-fulljustify-center items-center bg-black backdrop-blur-lg rounded-lg mr-[12px] overflow-hidden">
        <div className="absolute bg-gradient-to-br from-slate-300/20 via-slate-100/10 to-gray-500/30 mix-blend-overlay"></div>
        <canvas ref={canvasRef} width={700} height={260} />
        <div className='absolute bottom-[0px] w-full'>
          <CanvasSLider state={sliderVal} setSliderVal={setSliderVal}/>
        </div>
      </div>
    </div>
  );
}
