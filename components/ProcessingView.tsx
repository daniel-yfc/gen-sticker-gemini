import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProcessingViewProps {
  t: (key: string) => any;
}

const ProcessingView: React.FC<ProcessingViewProps> = ({ t }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = t('processing_steps');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 2500); 

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        <div className="relative bg-white p-4 rounded-2xl shadow-lg">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-gray-900">{t('processing_title')}</h3>
        <p className="text-indigo-600 font-medium animate-pulse">
          {steps[currentStep]}
        </p>
      </div>

      <div className="w-64 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProcessingView;
