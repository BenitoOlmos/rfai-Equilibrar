import React, { useState } from 'react';
import { ClientProfile } from '../types';
import { WEEKLY_CONTENT_CULPA, WEEKLY_CONTENT_ANGUSTIA, GUIDES_CULPA, GUIDES_ANGUSTIA } from '../constants';
import { Lock, CheckCircle, Play, FileText, Video, Headphones, BarChart, LogOut, Pause } from 'lucide-react';
import { GuideModal } from './GuideModal';
import { TestModule } from './TestModule';
import { BrandLogo } from './BrandLogo';

interface Props {
  user: ClientProfile;
  onLogout: () => void;
}

export const ClientDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeWeek, setActiveWeek] = useState<number>(user.currentWeek);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showTest, setShowTest] = useState<boolean>(false);
  const [audioPlaying, setAudioPlaying] = useState<number | null>(null);

  // Select Content Based on Program
  const contentMap = user.program === 'ANGUSTIA' ? WEEKLY_CONTENT_ANGUSTIA : WEEKLY_CONTENT_CULPA;
  const guidesMap = user.program === 'ANGUSTIA' ? GUIDES_ANGUSTIA : GUIDES_CULPA;
  const programColor = user.program === 'ANGUSTIA' ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-brand-600 bg-brand-50 border-brand-100';
  const progressColor = user.program === 'ANGUSTIA' ? 'bg-indigo-500' : 'bg-brand-500';

  const handleTestComplete = () => {
    setShowTest(false);
    alert("¡Test completado! Tus resultados han sido guardados y enviados a tu especialista.");
  };

  const handleGuideComplete = () => {
    setShowGuide(false);
    alert("¡Guía guardada con éxito! Has avanzado en tu proceso.");
  };

  const getMeetingDate = (startDateStr: string, weekNum: number) => {
    const date = new Date(startDateStr);
    date.setDate(date.getDate() + (weekNum - 1) * 7);
    date.setDate(date.getDate() + 2); 
    date.setHours(10, 0, 0, 0);
    const dateStr = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute:'2-digit' });
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                <BrandLogo className="w-full h-full" />
             </div>
             <div className="hidden sm:block">
                <h1 className="text-sm md:text-lg font-bold text-slate-800 tracking-tight leading-none">EQUILIBRAR</h1>
                <p className={`text-[10px] font-bold uppercase tracking-widest leading-none mt-1 ${user.program === 'ANGUSTIA' ? 'text-indigo-600' : 'text-brand-600'}`}>
                    Programa {user.program}
                </p>
             </div>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:flex flex-col items-end">
                <span className="font-semibold text-sm">{user.name}</span>
                <span className="text-xs text-slate-500">Semana {user.currentWeek} de 4</span>
            </div>
            <img src={user.avatar} alt="Profile" className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white shadow-md" />
            <button onClick={onLogout} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 sm:px-6 lg:px-8">
        <div className="mb-8 md:mb-10 text-center md:text-left md:flex justify-between items-end">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-800 mb-2">Tu Camino</h2>
            <p className="text-slate-500 max-w-xl text-sm md:text-lg">
              {user.program === 'ANGUSTIA' 
                ? "La angustia no necesita desaparecer, necesita dejar de ser vivida desde el miedo."
                : "La culpa no es un error de fábrica; es una respuesta aprendida que hoy puede ser reordenada."}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
             <div className={`inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-xs md:text-sm font-semibold ${programColor}`}>
                <BarChart size={14} />
                Progreso: {user.currentWeek * 25 - 10}%
             </div>
          </div>
        </div>

        <div className="relative space-y-6 md:space-y-8 before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
          {[1, 2, 3, 4].map((weekNum) => {
            const config = contentMap[weekNum as keyof typeof contentMap];
            const isLocked = weekNum > user.currentWeek;
            const isCurrent = weekNum === user.currentWeek;
            const isCompleted = weekNum < user.currentWeek;
            
            return (
              <div key={weekNum} className={`relative flex items-start md:items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isLocked ? 'opacity-60 grayscale' : 'opacity-100'}`}>
                
                <div className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-all duration-300 mt-1 md:mt-0
                    ${isCompleted ? `${progressColor} border-slate-100 text-white` : 
                      isCurrent ? `bg-white border-${user.program === 'ANGUSTIA' ? 'indigo' : 'brand'}-500 text-${user.program === 'ANGUSTIA' ? 'indigo' : 'brand'}-600 scale-110 md:scale-125` : 
                      'bg-slate-100 border-slate-200 text-slate-400'}`}>
                    {isLocked ? <Lock size={14} /> : isCompleted ? <CheckCircle size={16} /> : <span className="font-bold text-sm md:text-base">{weekNum}</span>}
                </div>
                
                <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0 p-5 md:p-6 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-lg">
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div>
                            <span className={`text-[10px] md:text-xs font-bold tracking-wider uppercase mb-1 block ${user.program === 'ANGUSTIA' ? 'text-indigo-600' : 'text-brand-600'}`}>Semana {weekNum}</span>
                            <h3 className="text-lg md:text-xl font-bold text-slate-800 leading-tight">{config.title}</h3>
                            <p className="text-xs md:text-sm text-slate-500 mt-0.5">{config.subtitle}</p>
                        </div>
                        {isCurrent && <span className={`px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold rounded-full animate-pulse whitespace-nowrap ${user.program === 'ANGUSTIA' ? 'bg-indigo-100 text-indigo-700' : 'bg-brand-100 text-brand-700'}`}>En curso</span>}
                    </div>

                    <p className="text-slate-600 text-xs md:text-sm mb-5 leading-relaxed hidden sm:block">
                        {config.description}
                    </p>

                    {!isLocked && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                            <button onClick={() => setShowTest(true)} className={`flex items-center gap-3 p-2 md:p-3 rounded-xl bg-slate-50 border border-slate-100 transition-all group/btn text-left ${user.program === 'ANGUSTIA' ? 'hover:bg-indigo-50 hover:border-indigo-200' : 'hover:bg-brand-50 hover:border-brand-200'}`}>
                                <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm ${user.program === 'ANGUSTIA' ? 'text-indigo-600' : 'text-brand-600'}`}><FileText size={16} /></div>
                                <div><span className="block text-sm font-bold text-slate-700">Test</span><span className="text-[10px] text-slate-400 hidden sm:inline">Evaluar estado</span></div>
                            </button>

                            {config.hasMeet && (
                                <div className="relative group/meet">
                                    {(isCurrent || (!isCompleted && !isLocked)) && <div className="absolute -top-2 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md animate-bounce z-20 border border-white">!</div>}
                                    <a href="https://meet.google.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition-all group/btn text-left relative overflow-hidden h-full">
                                        <div className="w-8 h-8 shrink-0 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm z-10"><Video size={16} /></div>
                                        <div className="z-10 overflow-hidden"><span className="block text-sm font-bold text-slate-900 truncate">Sesión</span><span className="text-[10px] text-slate-500 font-medium truncate block">{getMeetingDate(user.startDate, weekNum)}</span></div>
                                    </a>
                                </div>
                            )}

                            <button onClick={() => setShowGuide(true)} className="flex items-center gap-3 p-2 md:p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 transition-all group/btn text-left">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm"><FileText size={16} /></div>
                                <div><span className="block text-sm font-bold text-slate-700">Guía</span><span className="text-[10px] text-slate-400 hidden sm:inline">Trabajo personal</span></div>
                            </button>

                            <div className="sm:col-span-2 mt-1 p-3 md:p-4 bg-slate-800 rounded-xl md:rounded-2xl text-white flex items-center justify-between shadow-lg shadow-slate-200">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 ${user.program === 'ANGUSTIA' ? 'bg-indigo-500' : 'bg-brand-500'}`}><Headphones size={16} /></div>
                                    <div className="min-w-0">
                                        <p className="text-xs md:text-sm font-bold truncate pr-2">{config.audioTitle}</p>
                                        <p className="text-[10px] md:text-xs text-slate-400">15 min • Visualización</p>
                                    </div>
                                </div>
                                <button onClick={() => setAudioPlaying(audioPlaying === weekNum ? null : weekNum)} className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-white text-slate-900 flex items-center justify-center transition-colors ${user.program === 'ANGUSTIA' ? 'hover:bg-indigo-400' : 'hover:bg-brand-400'}`}>
                                    {audioPlaying === weekNum ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {isLocked && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                            <p className="text-xs text-slate-400 flex items-center justify-center gap-2"><Lock size={12} /> Próximamente</p>
                        </div>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {showGuide && <GuideModal week={user.currentWeek} steps={guidesMap[user.currentWeek] || []} onClose={() => setShowGuide(false)} onComplete={handleGuideComplete} />}
      {showTest && <TestModule program={user.program} onClose={() => setShowTest(false)} onComplete={handleTestComplete} />}
    </div>
  );
};