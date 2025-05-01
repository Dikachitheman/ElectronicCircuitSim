import { SparklesIcon } from "lucide-react";
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

export function IrisAI({enter}) {
    return (
      <div className="">
        <div className="relative group">
          {/* Animated gradient border container */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#0000FF] via-[#ff00a2] to-[#00ffae] rounded-[62px] transition duration-75 animate-gradient-x"></div>
          
          {/* Inner content */}
          <div className="relative ring-1 ring-gray-700 py-[4px] flex space-x-[8px] text-[18px] text-[#D7D7FF] items-center bg-[#000000] rounded-[68px] px-[12px]">
              <div onClick={enter}>
                  <SparklesIcon />
              </div>
              <input className="bg-black placeholder-[#6c6c76] w-[144px] pl-[12px] font-[600]" placeholder="Ask Iris.ai"/>
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