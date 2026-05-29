import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Brain } from 'lucide-react';

interface AISimulationProgressProps {
  onComplete: () => void;
  analysisSteps: string[];
  technicalLogs: string[];
  isVisible: boolean;
}

const AISimulationProgress: React.FC<AISimulationProgressProps> = ({ onComplete, analysisSteps, technicalLogs, isVisible }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [telemetry, setTelemetry] = useState<string[]>([]);

  // Stable reference to prevent effect re-runs if parent provides a non-memoized callback
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // Only reset and run if visible
    if (!isVisible) {
      setCurrentStep(0);
      setTelemetry([]);
      return;
    }

    let isCancelled = false;
    let timer: any;

    const runSimulation = async () => {
      // Start from where we left off or 0
      setTelemetry([]);
      setCurrentStep(0);

      for (let i = 0; i < analysisSteps.length; i++) {
        if (isCancelled) return;
        
        await new Promise(resolve => { timer = setTimeout(resolve, 400); });
        
        if (isCancelled) return;
        setCurrentStep(i + 1);
        setTelemetry(prev => [...prev.slice(-3), technicalLogs[i] || "EXTRACTING: Data_Stream..."]);
      }
      if (!isCancelled) timer = setTimeout(() => onCompleteRef.current(), 500);
    };

    runSimulation();

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [isVisible]); // Removed onComplete from deps to prevent simulation restarts

  const progress = (currentStep / analysisSteps.length) * 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-emerald-950/60 backdrop-blur-md p-4"
        >
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 border border-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Brain size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic leading-tight">
                SAIE Neural <span className="text-emerald-600">Synthesis</span>
              </h2>
            </div>

            <div className="space-y-6">
              <div className="relative h-3 bg-emerald-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-emerald-900">
                  {Math.round(progress)}% Complete
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Current Operation</p>
                <p className="text-sm font-bold text-slate-800 italic leading-relaxed">
                  {analysisSteps[currentStep - 1] || analysisSteps[0]}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-32 overflow-y-auto custom-scrollbar">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Telemetry Log</p>
                {telemetry.map((log, index) => (
                  <p key={index} className="text-[10px] text-slate-600 font-mono leading-tight">
                    {log}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-8 text-center">
              <RefreshCw className="animate-spin text-emerald-600 mx-auto mb-3" size={32} />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Processing Institutional Data...</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AISimulationProgress;