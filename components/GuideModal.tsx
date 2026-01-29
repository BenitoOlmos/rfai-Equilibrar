import React, { useState } from 'react';
import { GuideStep } from '../types';
import { ChevronRight, Save, X } from 'lucide-react';

interface GuideModalProps {
  week: number;
  steps: GuideStep[];
  onComplete: () => void;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ week, steps, onComplete, onClose }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const currentStep = steps[currentStepIdx];
  const isLastStep = currentStepIdx === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-teal-700 font-bold text-lg uppercase tracking-wider">Guía Semana {week}</h2>
            <p className="text-slate-500 text-sm">Reprogramación Focalizada</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">{currentStep.title}</h3>
            <p className="text-slate-600 italic">{currentStep.description}</p>
          </div>

          <div className="space-y-8">
            {currentStep.questions.map((q) => (
              <div key={q.id} className="space-y-3">
                <label className="block text-slate-700 font-medium text-lg">{q.text}</label>
                {q.type === 'text' && (
                  <textarea
                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all outline-none bg-slate-50 min-h-[120px]"
                    placeholder="Escribe tu reflexión aquí..."
                    value={responses[q.id] || ''}
                    onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                  />
                )}
                {q.type === 'choice' && (
                    <div className="flex gap-4">
                        <button 
                            className={`px-6 py-2 rounded-full border ${responses[q.id] === 'Si' ? 'bg-teal-600 text-white border-teal-600' : 'border-slate-300 text-slate-600'}`}
                            onClick={() => setResponses({...responses, [q.id]: 'Si'})}
                        >Sí</button>
                        <button 
                            className={`px-6 py-2 rounded-full border ${responses[q.id] === 'No' ? 'bg-teal-600 text-white border-teal-600' : 'border-slate-300 text-slate-600'}`}
                            onClick={() => setResponses({...responses, [q.id]: 'No'})}
                        >No</button>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
          <div className="flex gap-2">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 w-8 rounded-full transition-all duration-300 ${idx === currentStepIdx ? 'bg-teal-500 w-12' : 'bg-slate-200'}`} 
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-teal-200 transform hover:-translate-y-0.5"
          >
            {isLastStep ? 'Finalizar Guía' : 'Siguiente'}
            {isLastStep ? <Save size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};