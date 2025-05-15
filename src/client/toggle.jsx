import { GripHorizontal, SparklesIcon, Telescope, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { SparkleSVG } from "../assets/svgIcon";

export const ToggleButton = ({ initialOn = false, onChange }) => {
    const [isOn, setIsOn] = useState(initialOn);
  
    const toggle = () => {
      const newState = !isOn;
      setIsOn(newState);
      onChange(newState);
    };
  
    return (    
        <div className="border rounded-[28px] p-[4px]">
          <button
            onClick={toggle}
            className={`${isOn ? "bg-white" : "bg-[#87909E]"} w-[54px] h-[24px] rounded-full flex items-center transition-colors duration-300 ease-out`}
          >
          <div
            className={`w-[27px] h-[16px] ml-[1px] rounded-full shadow-md transform transition-transform duration-150 ease-out
            ${isOn ? 'translate-x-[22px] bg-[#00E568]' : 'translate-x-[2px] bg-white'}`}
          />
          </button>
        </div>
    );
  };

export default function AnimatedGradientBorder({text}) {
  return (
    <div className="">
      <div className="relative group ">
        {/* Animated gradient border container */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#0000FF] via-[#ff00a2] to-[#00ffae] rounded-[22px] transition duration-75 animate-gradient-x"></div>
        
        {/* Inner content */}
        <div className="relative border border-transparent hover:border-yellow-300 ring-1 ring-gray-700 py-[4px] flex space-x-[8px] text-[38px] text-[#D7D7FF] items-center bg-[#3A3460] rounded-[18px] px-[28px]">
          <div className="w-[24px] h-[24px]">
            <SparkleSVG />
          </div>
          <p className="leading-none">{text}</p>
        </div>
      </div>
      
      {/* Add the necessary animation class */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 1.6s ease infinite;
        }
      `}</style>
    </div>
  );
}

export function IrisAI({ enter, trigger, setLeft, setTop }) {
  const [active, setActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inf, setInf] = useState(false)
  const [reason, setReason] = useState(false)
  const inputRef = useRef(null);

  useEffect(() => {
    console.log("here")
  }, [active])

  const handleInputFocus = () => {
    setLeft(700)
    setTop(250)
    setActive(true);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      enter(inputValue);
      setInputValue('');
      // setActive(false);
      inputRef.current.blur();
    }
  };

  const handleCancel = () => {
    setActive(false)
    setLeft(null)
    setTop(null)
  }

  const handleClick = () => {
    // if (inputValue.trim()) {
    //   enter(inputValue);
    //   setInputValue('');
    //   setActive(false);
    //   inputRef.current.blur();
    // } else {
    //   inputRef.current.focus();
    //   setActive(true);
    // }

    // setActive(false)
    // setLeft(null)
    // setTop(null)

    if (active) {
      enter()
      setInf(true)
  
      setTimeout(() => {
        setInf(false)
      }, 2000);
    }
  };

  const handleReason = () => {
    setReason(true)

    setTimeout(() => {
      setReason(false)
    }, 1000);
  }

  return (
    <div className="w-full max-w-[32rem]">
      <div className="relative group">
        {/* Animated gradient border container */}
        <div className={`absolute -inset-1 border-[#bcb9bc] border-[2px] ${inf && "bg-gradient-to-r from-[#0000FF] via-[#ff00a2] to-[#00ffae] border-none"} rounded-[34px] transition duration-75 animate-gradient-x`}></div>
        
        {/* Inner content */}
        <div className="relative ring-1 ring-gray-700 bg-black rounded-[30px] px-3">
          <div className={` py-1 flex space-x-2 text-lg text-[#D7D7FF] ${active ? "items-start pt-[12px] h-[84px]" : "items-center"}`}>
            <div onClick={handleClick} className="cursor-pointer">
              <div className="w-[24px] h-[24px]">
                <SparkleSVG />
              </div>
            </div>
            <input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={handleKeyDown}
              className={`bg-black placeholder-[#6c6c76] font-semibold outline-none transition-all duration-200 ${
                active ? "w-96" : "w-36"
              } pl-3`}
              placeholder="Ask Iris.ai"
            />

            <div className="flex space-x-[12px] cursor-pointer text-[#636363]">
              {
                active && (
                  <div onClick={() => handleCancel()} className="pt-[4px]">
                    <X />
                  </div>
                )
              }
              <button className='opacity-45 hover:opacity-100 ease-out' onMouseDown={trigger}>
                <GripHorizontal size={34} />
              </button>
            </div>
          </div>
          {
            active && (
              <div className="text-[14px] pb-[10px] px-[4px] space-x-[14px] flex">
                <p className="rounded-[22px] text-[#bfbdd0] py-[6px] border border-[#bfbdd0] hover:border-[#fff] px-[14px] backdrop-blur-[12px] ">Capacitors in Series</p>
                <p className="rounded-[22px] text-[#bfbdd0] py-[6px] border border-[#bfbdd0] hover:border-[#fff] px-[14px] backdrop-blur-[12px] ">Op-Amp Amplification</p>

                <div onClick={() => handleReason()}
                 className={`text-[#fff] grow hover:border-yellow-300 border border-[#2d364c] rounded-[32px] text-[18px] px-[18px] py-[2px] flex space-x-[6px] bg-gradient-to-r from-[#0000FF] via-[#ff00a2] to-[#00bfff] ease-out ${reason && ("animate-gradient-x")}`}>
                  <div className="w-[24px] h-[24px]">
                    <Telescope />
                  </div>
                  <div>
                    <button className='' onClick={() => handleActivateTool()}>Reason</button>
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </div>
      
      {/* Add the necessary animation styles */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 2.6s;
        }
      `}</style>
      
    </div>
  );
}