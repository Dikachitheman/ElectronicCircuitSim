import { SparklesIcon, X } from "lucide-react";
import { useRef } from "react";
import { useState } from "react";

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
      <div className="relative group">
        {/* Animated gradient border container */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#0000FF] via-[#ff00a2] to-[#00ffae] rounded-[22px] transition duration-75 animate-gradient-x"></div>
        
        {/* Inner content */}
        <div className="relative ring-1 ring-gray-700 py-[4px] flex space-x-[8px] text-[38px] text-[#D7D7FF] items-center bg-[#3A3460] rounded-[18px] px-[28px]">
            <div>
                <SparklesIcon />
            </div>
            <p className="leading-none">Capacitor</p>
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

export function IrisAI({ enter }) {
  const [active, setActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);

  const handleInputFocus = () => {
    setActive(true);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      enter(inputValue);
      setInputValue('');
      setActive(false);
      inputRef.current.blur();
    }
  };

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

    setActive(false)
    enter()
  };

  return (
    <div className="w-full max-w-lg">
      <div className="relative group">
        {/* Animated gradient border container */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#0000FF] via-[#ff00a2] to-[#00ffae] rounded-full transition duration-75 animate-gradient-x"></div>
        
        {/* Inner content */}
        <div className="relative ring-1 ring-gray-700 py-1 flex space-x-2 text-lg text-[#D7D7FF] items-center bg-black rounded-full px-3">
          <div onClick={handleClick} className="cursor-pointer">
            <SparklesIcon />
          </div>
          <input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className={`bg-black placeholder-[#6c6c76] font-semibold outline-none transition-all duration-300 ${
              active ? "w-96" : "w-36"
            } pl-3`}
            placeholder="Ask Iris.ai"
          />

          <div onClick={() => setActive(false)} className="cursor-pointer text-[#636363]">
            <X />
          </div>
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
          animation: gradient-x 1.6s ease infinite;
        }
      `}</style>
    </div>
  );
}