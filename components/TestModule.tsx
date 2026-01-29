import React, { useState } from 'react';
import { TEST_QUESTIONS_CULPA, TEST_QUESTIONS_ANGUSTIA } from '../constants';
import { ProgramType } from '../types';

interface TestModuleProps {
  program: ProgramType;
  onComplete: () => void;
  onClose: () => void;
}

export const TestModule: React.FC<TestModuleProps> = ({ program, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // Select questions based on program
  const questions = program === 'ANGUSTIA' ? TEST_QUESTIONS_ANGUSTIA : TEST_QUESTIONS_CULPA;

  const handleAnswer = (val: number) => {
    setAnswers(prev => ({ ...prev, [questions[currentStep].id]: val }));
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 200);
    } else {
      onComplete();
    }
  };

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  // Theme colors based on program
  const themeColor = program === 'ANGUSTIA' ? 'bg-indigo-600' : 'bg-teal-600';
  const themeLight = program === 'ANGUSTIA' ? 'bg-indigo-50 text-indigo-700 border-indigo-500' : 'bg-teal-50 text-teal-700 border-teal-500';
  const themeBar = program === 'ANGUSTIA' ? 'bg-indigo-400' : 'bg-teal-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className={`p-6 text-white flex justify-between items-center ${themeColor}`}>
          <div>
            <h2 className="text-2xl font-bold font-sans">Test de {program === 'ANGUSTIA' ? 'Angustia' : 'Culpa'}</h2>
            <p className="opacity-90 text-sm">Evaluación RFAI</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold">{currentStep + 1}</span>
            <span className="opacity-75">/{questions.length}</span>
          </div>
        </div>
        
        <div className="h-2 bg-slate-100 w-full">
          <div className={`h-full transition-all duration-500 ease-out ${themeBar}`} style={{ width: `${progress}%` }} />
        </div>

        <div className="p-8 md:p-12">
          <div className="mb-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
              {currentQuestion.category}
          </div>
          <h3 className="text-xl md:text-2xl text-slate-800 font-medium mb-8 text-center leading-relaxed min-h-[5rem] flex items-center justify-center">
            {currentQuestion.text}
          </h3>

          <div className="grid grid-cols-5 gap-2 md:gap-4 mb-8">
            {[1, 2, 3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => handleAnswer(val)}
                className={`
                  flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
                  ${answers[currentQuestion.id] === val 
                    ? `${themeLight} scale-105 shadow-md` 
                    : 'border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50'}
                `}
              >
                <span className="text-2xl font-bold mb-1">{val}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider hidden md:block">
                  {val === 1 ? 'Nunca' : val === 5 ? 'Siempre' : ''}
                </span>
              </button>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-8 text-sm text-slate-400">
            <button onClick={onClose} className="hover:text-slate-600">Cancelar</button>
            <div className="flex gap-2 text-xs">
              <span>1 = Muy en desacuerdo</span>
              <span>5 = Muy de acuerdo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};