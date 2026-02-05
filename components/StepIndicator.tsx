
import React from 'react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
  steps: { id: AppStep; name: string }[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="mb-10 w-full">
      <div className="flex justify-between mb-3">
        {steps.map((step, idx) => {
          const isActive = idx <= currentIndex;
          const isCurrent = step.id === currentStep;
          
          return (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-500 mb-2 ${
                  isCurrent ? 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,1)] scale-125' : 
                  isActive ? 'bg-indigo-400' : 'bg-gray-800'
                }`}
              />
              <span className={`text-[8px] font-black uppercase tracking-widest hidden md:block ${
                isCurrent ? 'text-white' : isActive ? 'text-gray-400' : 'text-gray-700'
              }`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-[2px] w-full bg-gray-900 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default StepIndicator;
