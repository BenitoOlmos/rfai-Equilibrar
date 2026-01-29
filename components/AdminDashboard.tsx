import React, { useState, useEffect } from 'react';
import { User, ClientProfile, Role, ProgramType } from '../types';
import { ALL_USERS, MOCK_CLIENT_W1 } from '../constants';
import { Users, Activity, Calendar as CalendarIcon, Settings, ChevronRight, ChevronLeft, LogOut, Search, UserPlus, Video, Clock, FileText, Headphones, TrendingUp, AlertCircle, CheckCircle2, ChevronDown, MapPin, MoreVertical, Phone, ArrowLeft, ArrowRight, Sun, Moon, ToggleLeft, ToggleRight, Plus, X, Mail, Briefcase, Lock, Database, Server, HardDrive, Shield, Save, Edit, Menu, RefreshCw, CreditCard, File, Link as LinkIcon, Trash2, Mic, CheckSquare, Power, Upload, Image as ImageIcon, Filter } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { BrandLogo } from './BrandLogo';

interface Props {
  currentUser: User;
  onLogout: () => void;
}

// ==========================================
// SHARED HELPERS
// ==========================================

const getMeetingDate = (startDateStr: string, weekNum: number) => {
    const date = new Date(startDateStr);
    date.setDate(date.getDate() + (weekNum - 1) * 7);
    date.setDate(date.getDate() + 2);
    date.setHours(10, 0, 0, 0);
    
    const now = new Date();
    const isPast = date < now;
    const dateStr = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const formatted = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    
    return { formatted, isPast, fullDate: date };
};

const getDailyAudioData = () => [
    { day: 'Lun', mins: 45 },
    { day: 'Mar', mins: 30 },
    { day: 'Mié', mins: 0 },
    { day: 'Jue', mins: 60 },
    { day: 'Vie', mins: 25 },
    { day: 'Sáb', mins: 15 },
    { day: 'Dom', mins: 45 },
];

// ==========================================
// CONTENT MANAGEMENT COMPONENT (Mobile Optimized)
// ==========================================

interface ContentItem {
    id: number;
    type: 'AUDIO' | 'GUIDE' | 'TEST' | 'DOC';
    title: string;
    prog: 'CULPA' | 'ANGUSTIA' | 'AMBOS';
    details: string; // duration, items, etc.
}

const ContentManager: React.FC = () => {
    const [activeType, setActiveType] = useState<'AUDIO' | 'GUIDE' | 'TEST' | 'DOC'>('AUDIO');
    const [showUploadModal, setShowUploadModal] = useState(false);
    
    // Mock Data State
    const [resources, setResources] = useState<ContentItem[]>([
        { id: 1, type: 'AUDIO', title: 'S1: Desactivar la Alerta', prog: 'CULPA', details: '15:00 min' },
        { id: 2, type: 'AUDIO', title: 'S1: Validación Angustia', prog: 'ANGUSTIA', details: '12:30 min' },
        { id: 3, type: 'GUIDE', title: 'Guía S1: Comprensión', prog: 'AMBOS', details: '4 Pasos' },
        { id: 4, type: 'TEST', title: 'Test Inicial RFAI', prog: 'CULPA', details: '7 Items' },
        { id: 5, type: 'TEST', title: 'Test Angustia RFAI', prog: 'ANGUSTIA', details: '15 Items' },
        { id: 6, type: 'DOC', title: 'Manual de Bienvenida', prog: 'AMBOS', details: 'PDF 2.4MB' },
    ]);

    const filteredResources = resources.filter(r => r.type === activeType);

    const handleDelete = (id: number) => {
        if(confirm('¿Estás seguro de eliminar este recurso?')) {
            setResources(prev => prev.filter(r => r.id !== id));
        }
    };

    return (
        <div className="h-full bg-slate-50 flex flex-col relative">
            {/* Header Sticky */}
            <div className="bg-white px-4 py-3 border-b border-slate-100 flex justify-between items-center sticky top-0 z-20 shadow-sm safe-area-top">
                <div>
                    <h2 className="font-bold text-lg text-slate-800 leading-tight">Biblioteca RFAI</h2>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Gestión de Contenidos</p>
                </div>
                <button 
                    onClick={() => setShowUploadModal(true)} 
                    className="bg-slate-900 text-white p-2 md:px-4 md:py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                >
                    <Plus size={20} /> <span className="hidden md:inline">Crear Nuevo</span>
                </button>
            </div>

            {/* Filter Tabs - Horizontal Scroll for Mobile */}
            <div className="bg-white border-b border-slate-50">
                <div className="flex overflow-x-auto py-3 px-4 gap-3 no-scrollbar snap-x">
                    {[
                        { id: 'AUDIO', label: 'Audios', icon: Headphones, color: 'indigo' },
                        { id: 'GUIDE', label: 'Guías', icon: FileText, color: 'amber' },
                        { id: 'TEST', label: 'Tests', icon: CheckSquare, color: 'teal' },
                        { id: 'DOC', label: 'Docs', icon: File, color: 'blue' },
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveType(item.id as any)} 
                            className={`snap-start shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${activeType === item.id 
                                ? `bg-${item.color}-50 text-${item.color}-700 border-${item.color}-200 ring-1 ring-${item.color}-200` 
                                : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'}`}
                        >
                            <item.icon size={16}/> {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {filteredResources.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 animate-pulse"><Upload size={32} className="opacity-50"/></div>
                        <p className="text-sm font-medium">No hay contenidos aquí</p>
                        <p className="text-xs">Sube un nuevo archivo para comenzar</p>
                    </div>
                ) : (
                    filteredResources.map((res) => (
                        <div key={res.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all duration-200">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${res.type === 'AUDIO' ? 'bg-indigo-50 text-indigo-600' : res.type === 'GUIDE' ? 'bg-amber-50 text-amber-600' : res.type === 'TEST' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {res.type === 'AUDIO' ? <Headphones size={20} /> : res.type === 'GUIDE' ? <FileText size={20} /> : res.type === 'TEST' ? <CheckSquare size={20} /> : <File size={20} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-slate-800 text-sm truncate">{res.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${res.prog === 'ANGUSTIA' ? 'bg-indigo-100 text-indigo-700' : res.prog === 'CULPA' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'}`}>{res.prog}</span>
                                        <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{res.details}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                                <button className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-brand-50 hover:text-brand-600 border border-transparent hover:border-brand-100 transition-all"><Edit size={18} /></button>
                                <button onClick={() => handleDelete(res.id)} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-all"><Trash2 size={18} /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Upload Modal (Mobile Bottom Sheet Style) */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center sm:p-4">
                    <div className="bg-white w-full max-w-lg rounded-t-[2rem] md:rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-xl text-slate-800">Crear Recurso</h3>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Tipo de Recurso</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setActiveType('AUDIO')} className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeType === 'AUDIO' ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500' : 'border-slate-200 text-slate-500'}`}><Headphones size={18}/> Audio</button>
                                    <button onClick={() => setActiveType('DOC')} className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeType === 'DOC' ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 text-slate-500'}`}><File size={18}/> Doc</button>
                                    <button onClick={() => setActiveType('GUIDE')} className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeType === 'GUIDE' ? 'border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-500' : 'border-slate-200 text-slate-500'}`}><FileText size={18}/> Guía</button>
                                    <button onClick={() => setActiveType('TEST')} className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeType === 'TEST' ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500' : 'border-slate-200 text-slate-500'}`}><CheckSquare size={18}/> Test</button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Título</label>
                                    <input type="text" placeholder="Ej: Audio Semana 1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-slate-400 focus:ring-0 outline-none transition-all" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Programa</label>
                                    <div className="relative">
                                        <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none appearance-none">
                                            <option value="AMBOS">Ambos Programas</option>
                                            <option value="CULPA">RFAI Culpa</option>
                                            <option value="ANGUSTIA">RFAI Angustia</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Upload/Create Area */}
                            <div className="pt-2">
                                {(activeType === 'AUDIO' || activeType === 'DOC') && (
                                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-brand-400 transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-brand-50 group-hover:text-brand-500 transition-colors">
                                            <Upload size={24} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-600">Subir Archivo</span>
                                        <span className="text-xs mt-1">MP3, PDF, DOCX (Max 50MB)</span>
                                    </div>
                                )}

                                {activeType === 'GUIDE' && (
                                    <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex flex-col items-center text-center">
                                        <FileText size={32} className="text-amber-400 mb-3" />
                                        <h4 className="font-bold text-amber-800 text-sm mb-1">Constructor de Guías</h4>
                                        <p className="text-xs text-amber-600 mb-4">Crea pasos interactivos y preguntas reflexivas.</p>
                                        <button className="w-full bg-white border border-amber-200 text-amber-700 font-bold py-3 rounded-xl text-sm hover:bg-amber-100 shadow-sm">Abrir Editor</button>
                                    </div>
                                )}

                                {activeType === 'TEST' && (
                                    <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100 flex flex-col items-center text-center">
                                        <CheckSquare size={32} className="text-teal-400 mb-3" />
                                        <h4 className="font-bold text-teal-800 text-sm mb-1">Constructor de Tests</h4>
                                        <p className="text-xs text-teal-600 mb-4">Define escalas y preguntas de evaluación.</p>
                                        <button className="w-full bg-white border border-teal-200 text-teal-700 font-bold py-3 rounded-xl text-sm hover:bg-teal-100 shadow-sm">Configurar Test</button>
                                    </div>
                                )}
                            </div>

                            <button className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-xl shadow-slate-200 hover:bg-slate-800 active:scale-[0.98] transition-all">
                                Guardar Recurso
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// SHARED COMPONENTS (CALENDAR & LISTS)
// ==========================================

const ProCalendarModule: React.FC<{ onSelectClient: (c: ClientProfile) => void }> = ({ onSelectClient }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [appointments, setAppointments] = useState<any[]>([]);

    useEffect(() => {
        const day = selectedDate.getDay();
        const apps = (day === 0 || day === 6) ? [] : [
            { id: 'apt-1', time: '09:00', duration: 60, type: 'Evaluación Inicial', client: ALL_USERS[3] as ClientProfile, status: 'completed' },
            { id: 'apt-2', time: '11:30', duration: 45, type: 'Sesión de Seguimiento', client: ALL_USERS[4] as ClientProfile, status: 'pending' },
            { id: 'apt-3', time: '15:00', duration: 60, type: 'Revisión de Guía', client: ALL_USERS[7] as ClientProfile, status: 'pending' }, 
        ];
        setAppointments(day % 2 === 0 ? apps : [apps[1], apps[0]]);
    }, [selectedDate]);

    const weekDays = Array.from({length: 14}, (_, i) => {
        const d = new Date(); d.setDate(new Date().getDate() + i); return d;
    });

    return (
        <div className="h-full flex flex-col bg-slate-50">
            <div className="bg-white px-6 py-6 border-b border-slate-100 shadow-sm z-10 sticky top-0">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 capitalize">
                            {selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                        </h2>
                        <p className="text-slate-500 text-sm">Agenda RFAI</p>
                    </div>
                    <button className="bg-brand-50 text-brand-700 p-3 rounded-xl hover:bg-brand-100 transition-colors">
                        <CalendarIcon size={20} />
                    </button>
                </div>
                <div className="flex overflow-x-auto gap-3 pb-2 -mx-2 px-2 no-scrollbar">
                    {weekDays.map((date, idx) => {
                        const isSelected = date.toDateString() === selectedDate.toDateString();
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                            <button key={idx} onClick={() => setSelectedDate(date)} className={`flex flex-col items-center justify-center min-w-[4.5rem] h-20 rounded-2xl border transition-all duration-300 ${isSelected ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-200 scale-105' : 'bg-white border-slate-100 text-slate-400 hover:border-brand-200'}`}>
                                <span className="text-xs font-medium uppercase tracking-wider mb-1">{date.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                                <span className={`text-xl font-bold ${isSelected ? 'text-white' : isToday ? 'text-brand-600' : 'text-slate-700'}`}>{date.getDate()}</span>
                                {isToday && !isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1"></span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
                {appointments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                        <CalendarIcon size={48} className="mb-4 text-slate-300" />
                        <p>No hay citas programadas para este día.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map((apt) => {
                            const isAngustia = apt.client.program === 'ANGUSTIA';
                            return (
                                <div key={apt.id} className="flex gap-4 group">
                                    <div className="flex flex-col items-center min-w-[3.5rem] pt-2">
                                        <span className="font-bold text-slate-800">{apt.time}</span>
                                        <div className="h-full w-0.5 bg-slate-200 mt-2 group-last:bg-transparent relative">
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-300"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${apt.status === 'completed' ? 'bg-slate-300' : isAngustia ? 'bg-indigo-500' : 'bg-brand-500'}`}></div>
                                        <div className="flex justify-between items-start mb-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${apt.status === 'completed' ? 'bg-slate-100 text-slate-500' : isAngustia ? 'bg-indigo-50 text-indigo-700' : 'bg-brand-50 text-brand-700'}`}>{apt.type}</span>
                                            <MoreVertical size={16} className="text-slate-300"/>
                                        </div>
                                        <div className="flex items-center gap-4 mb-4 cursor-pointer" onClick={() => onSelectClient(apt.client)}>
                                            <img src={apt.client.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg leading-tight">{apt.client.name}</h3>
                                                <p className="text-slate-500 text-xs">Semana {apt.client.currentWeek} • {apt.client.program}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <a href="#" className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${apt.status === 'completed' ? 'bg-slate-50 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                                                <Video size={16} /> {apt.status === 'completed' ? 'Finalizada' : 'Unirse'}
                                            </a>
                                            <button onClick={() => onSelectClient(apt.client)} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
                                                <FileText size={16} /> Ficha
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

const ProClientsList: React.FC<{ onSelect: (c: ClientProfile) => void, selectedId?: string, className?: string }> = ({ onSelect, selectedId, className }) => {
    const clients = ALL_USERS.filter(u => u.role === 'CLIENT') as ClientProfile[];
  
    return (
        <div className={`bg-white h-full flex flex-col ${className}`}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
                <h3 className="font-bold text-lg text-slate-800 tracking-tight">Pacientes</h3>
                <button className="text-brand-600 bg-brand-50 hover:bg-brand-100 p-2 rounded-full transition-colors"><UserPlus size={18} /></button>
            </div>
            
            <div className="p-4 border-b border-slate-100 bg-white sticky top-[80px] z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input type="text" placeholder="Buscar..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-all" />
                </div>
            </div>
      
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 md:pb-4">
                {clients.map(client => {
                     const progressPercent = (client.currentWeek / 4) * 100;
                     const isAngustia = client.program === 'ANGUSTIA';
                     const tags = isAngustia ? 'RFAI - Angustia' : 'RFAI - Culpa';
                     const badgeColor = isAngustia ? 'text-indigo-600 bg-indigo-50' : 'text-brand-600 bg-brand-50';
                     const barColor = isAngustia ? 'bg-indigo-500' : 'bg-brand-500';
                     const borderColor = selectedId === client.id ? (isAngustia ? 'border-indigo-500 bg-indigo-50/50' : 'border-brand-500 bg-brand-50/50') : 'border-slate-100 hover:border-slate-300';

                     return (
                      <div key={client.id} onClick={() => onSelect(client)} className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative overflow-hidden group hover:shadow-md ${borderColor}`}>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="relative">
                                <img src={client.avatar} alt={client.name} className="w-12 h-12 rounded-full bg-slate-200 object-cover border-2 border-white shadow-sm" />
                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${client.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-sm truncate ${selectedId === client.id ? 'text-slate-900' : 'text-slate-800'}`}>{client.name}</h4>
                                <p className="text-xs text-slate-500 font-medium">{tags}</p>
                            </div>
                            <div className="text-right">
                                 <span className={`text-xs font-bold px-2 py-1 rounded-lg ${badgeColor}`}>Sem {client.currentWeek}</span>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                            <div className={`${barColor} h-full rounded-full`} style={{ width: `${progressPercent}%` }}></div>
                        </div>
                      </div>
                    );
                })}
            </div>
        </div>
    );
};

const ProClientDetail: React.FC<{ client: ClientProfile; onBack?: () => void }> = ({ client, onBack }) => {
    const isAngustia = client.program === 'ANGUSTIA';
    const themeColor = isAngustia ? 'text-indigo-600' : 'text-brand-600';
    const themeBg = isAngustia ? 'bg-indigo-50' : 'bg-brand-50';
    const chartColor = isAngustia ? '#6366f1' : '#0d9488';

    // Prepare chart data
    const scoresData = client.clinicalData.testScores.map(ts => ({
        week: `S${ts.week}`,
        ...ts.scores
    }));

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-500">
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="relative">
                        <img src={client.avatar} alt={client.name} className="w-16 h-16 rounded-full object-cover border-4 border-slate-50 shadow-sm" />
                        <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${client.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 leading-tight">{client.name}</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Mail size={14} /> {client.email}
                        </div>
                        <div className="flex gap-2 mt-2">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${themeBg} ${themeColor}`}>{client.program}</span>
                             <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wide">Semana {client.currentWeek}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-all">
                        <Phone size={20} />
                    </button>
                    <button className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:bg-brand-50 transition-all">
                        <Video size={20} />
                    </button>
                    <button className="p-3 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2 font-bold text-sm">
                        <FileText size={18} /> <span className="hidden sm:inline">Ficha Clínica</span>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Adherencia</p>
                        <p className={`text-2xl font-bold ${themeColor}`}>85%</p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div className={`h-full ${isAngustia ? 'bg-indigo-500' : 'bg-brand-500'}`} style={{width: '85%'}}></div>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Prox. Sesión</p>
                        <p className="text-lg font-bold text-slate-700 mt-1">{client.nextSession ? new Date(client.nextSession).toLocaleDateString() : 'Pendiente'}</p>
                        <p className="text-[10px] text-slate-400">Video conferencia</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Audios</p>
                         <div className="flex items-end gap-2">
                            <p className="text-2xl font-bold text-slate-700">12</p>
                            <span className="text-xs text-green-500 font-bold mb-1 flex items-center"><TrendingUp size={12}/> +2</span>
                         </div>
                         <p className="text-[10px] text-slate-400">Esta semana</p>
                    </div>
                     <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Estado</p>
                         <p className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded inline-block mt-1">Estable</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Clinical Evolution */}
                    <div className="p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-slate-800">Evolución Clínica</h3>
                                <p className="text-xs text-slate-400">Puntajes RFAI semanales</p>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={18}/></button>
                        </div>
                        <div className="h-64 w-full">
                            {scoresData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={scoresData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                            itemStyle={{fontSize: '12px', fontWeight: 'bold'}}
                                        />
                                        {Object.keys(scoresData[0]).filter(k => k !== 'week').map((key, i) => (
                                            <Line 
                                                key={key} 
                                                type="monotone" 
                                                dataKey={key} 
                                                stroke={['#0d9488', '#f59e0b', '#6366f1', '#ec4899'][i % 4]} 
                                                strokeWidth={3} 
                                                dot={{fill: 'white', strokeWidth: 2, r: 4}} 
                                                activeDot={{r: 6}}
                                            />
                                        ))}
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <Activity size={32} className="mb-2 opacity-50"/>
                                    <span className="text-sm font-medium">Sin datos suficientes</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Audio Usage */}
                    <div className="p-6 rounded-3xl border border-slate-100 shadow-sm">
                         <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="font-bold text-slate-800">Uso de Herramientas</h3>
                                <p className="text-xs text-slate-400">Minutos de escucha por día</p>
                            </div>
                        </div>
                        <div className="h-64 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getDailyAudioData()}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                    <Bar dataKey="mins" radius={[4, 4, 0, 0]}>
                                        {getDailyAudioData().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.mins > 40 ? chartColor : '#cbd5e1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Progress Detail */}
                <div className="p-6 rounded-3xl border border-slate-100 shadow-sm bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 mb-4">Progreso del Programa</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(week => {
                            const wKey = `week${week}` as keyof typeof client.progress;
                            const status = client.progress[wKey];
                            return (
                                <div key={week} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${status.isCompleted ? 'bg-green-100 text-green-600' : status.isLocked ? 'bg-slate-100 text-slate-400' : `${themeBg} ${themeColor}`}`}>
                                        {status.isCompleted ? <CheckCircle2 size={16}/> : status.isLocked ? <Lock size={14}/> : week}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <span className={`text-sm font-bold ${status.isLocked ? 'text-slate-400' : 'text-slate-700'}`}>Semana {week}</span>
                                            {status.isCompleted && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Completado</span>}
                                            {!status.isCompleted && !status.isLocked && <span className={`text-[10px] font-bold ${themeColor} ${themeBg} px-2 py-0.5 rounded`}>En curso</span>}
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div className={`h-full ${status.isCompleted ? 'bg-green-500' : !status.isLocked ? (isAngustia ? 'bg-indigo-500' : 'bg-brand-500') : 'bg-transparent'}`} style={{width: status.isCompleted ? '100%' : !status.isLocked ? '30%' : '0%'}}></div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};

// ==========================================
// ADMINISTRATOR COMPONENTS (Improved)
// ==========================================

const AdminGlobalPanel: React.FC = () => {
    return (
        <div className="space-y-6 pb-24 md:pb-0">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <p className="text-slate-500 text-sm">Bienvenido de nuevo,</p>
                    <h2 className="text-2xl font-bold text-slate-800">Dr. Administrador</h2>
                </div>
            </div>

            {/* Top Row Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Users Stat */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Usuarios</p>
                            <h3 className="text-4xl font-bold text-slate-800 mt-1">1,240</h3>
                        </div>
                        <div className="p-3 bg-brand-50 rounded-2xl text-brand-500">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-600"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Admin</span>
                            <span className="font-bold">45</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-600"><span className="w-2 h-2 rounded-full bg-brand-400"></span> Pro</span>
                            <span className="font-bold">120</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-600"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Client</span>
                            <span className="font-bold">1k+</span>
                        </div>
                    </div>
                </div>

                {/* Server Status (Dark Card) */}
                <div className="bg-slate-900 p-6 rounded-3xl shadow-xl text-white relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-6">
                        <Server className="text-brand-400" size={24} />
                        <h3 className="font-bold tracking-wide text-brand-400">SERVIDORES</h3>
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-slate-300 text-sm">MySQLDB (GCP)</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-green-400 text-xs font-mono">14ms</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-300 text-sm">MobaXterm SSH</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-green-400 text-xs font-mono">CONNECTED</span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative blurred blob */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                </div>
            </div>

            {/* Activity Logs */}
            <div>
                <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="font-bold text-lg text-slate-800">Logs de Actividad</h3>
                    <button className="text-brand-600 text-sm font-bold">Ver Todo</button>
                </div>
                <div className="space-y-3">
                    <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 relative">
                            <UserPlus size={18} />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h4 className="font-bold text-slate-800 text-sm">Nuevo Profesional</h4>
                                <span className="text-[10px] text-slate-400">10:42 AM</span>
                            </div>
                            <p className="text-xs text-slate-500">Admin creó perfil para <span className="italic text-slate-600">Dr. Alvarez</span></p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                        <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center shrink-0">
                            <HardDrive size={18} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between">
                                <h4 className="font-bold text-slate-800 text-sm">Backup MySQL</h4>
                                <span className="text-[10px] text-slate-400">09:30 AM</span>
                            </div>
                            <p className="text-xs text-slate-500">Sistema completó respaldo automático en GCP Bucket.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminSettings: React.FC = () => {
    return (
        <div className="h-full bg-slate-50 flex flex-col">
            <div className="bg-white px-4 py-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <button className="p-2 -ml-2 hover:bg-slate-50 rounded-full text-slate-600"><ArrowLeft size={20}/></button>
                    <h3 className="font-bold text-slate-800">Configuración RFAI</h3>
                </div>
                <button className="text-brand-500 font-bold text-sm">Guardar</button>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto pb-24">
                {/* Integrations */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-brand-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span> ONLINE</span>
                            <Video size={20} className="text-slate-200" />
                        </div>
                        <p className="text-[10px] text-slate-400">API Status</p>
                        <p className="text-sm font-bold text-slate-800">Google Meet</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-brand-500 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-brand-500 rounded-full"></span> SYNCED</span>
                            <Database size={20} className="text-slate-200" />
                        </div>
                        <p className="text-[10px] text-slate-400">Database</p>
                        <p className="text-sm font-bold text-slate-800">Cloud SQL</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminUserManagement: React.FC<{ onSelectUser: (u: User) => void, currentUserRole: Role }> = ({ onSelectUser, currentUserRole }) => {
    const [filter, setFilter] = useState<'ALL' | 'ADMIN' | 'PROF' | 'COORD' | 'CLIENT'>('ALL');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [mockUsers, setMockUsers] = useState(ALL_USERS);
    
    // Filter users logic
    const filteredUsers = mockUsers.filter(u => {
        if (filter === 'ALL') return true;
        if (filter === 'ADMIN') return u.role === 'ADMIN';
        if (filter === 'PROF') return u.role === 'PROFESSIONAL';
        if (filter === 'COORD') return u.role === 'COORDINATOR';
        if (filter === 'CLIENT') return u.role === 'CLIENT';
        return true;
    });

    const toggleStatus = (id: string) => {
        setMockUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : u));
    };

    const deleteUser = (id: string) => {
        if(confirm('¿Eliminar usuario?')) {
            setMockUsers(prev => prev.filter(u => u.id !== id));
        }
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 relative">
            {/* Header with Search and Add */}
            <div className="bg-white p-4 border-b border-slate-100 sticky top-0 z-10 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-xl text-slate-800">Gestión de Usuarios</h2>
                    <button onClick={() => setShowCreateModal(true)} className="bg-brand-400 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-200 transition-all">
                        <Plus size={18} /> Nuevo
                    </button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Buscar por nombre, email..." className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-200 transition-all" />
                </div>
                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {['Todos', 'Admin', 'Profesional', 'Coordinador', 'Pacientes'].map((label, idx) => {
                        const key = ['ALL', 'ADMIN', 'PROF', 'COORD', 'CLIENT'][idx] as any;
                        return (
                            <button 
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${filter === key ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
                {filteredUsers.map(user => {
                    const roleColor = user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : user.role === 'PROFESSIONAL' ? 'bg-brand-50 text-brand-700' : user.role === 'COORDINATOR' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-600';
                    const roleLabel = user.role === 'ADMIN' ? 'Administrador' : user.role === 'PROFESSIONAL' ? 'Profesional RFAI' : user.role === 'COORDINATOR' ? 'Coordinador' : 'Cliente';
                    const isClient = user.role === 'CLIENT';
                    const client = isClient ? user as ClientProfile : null;
                    const isAngustia = client?.program === 'ANGUSTIA';

                    return (
                        <div key={user.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 group">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={user.avatar} className="w-12 h-12 rounded-full object-cover border border-slate-100" alt="" />
                                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{user.name}</h3>
                                        <p className="text-xs text-slate-400">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => toggleStatus(user.id)}
                                        className={`p-2 rounded-full border transition-all ${user.status === 'ACTIVE' ? 'text-green-600 bg-green-50 border-green-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200' : 'text-slate-400 bg-slate-50 border-slate-200 hover:bg-green-50 hover:text-green-600'}`}
                                        title={user.status === 'ACTIVE' ? 'Desactivar Usuario' : 'Activar Usuario'}
                                    >
                                        <Power size={18} />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="flex gap-2 flex-wrap">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${roleColor}`}>
                                    {roleLabel}
                                </span>
                                {isClient && (
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${isAngustia ? 'bg-indigo-100 text-indigo-700' : 'bg-brand-50 text-brand-700'}`}>
                                        {client?.program}
                                    </span>
                                )}
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${user.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {user.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                                <button onClick={() => onSelectUser(user)} className="bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                                    <Edit size={14}/> Editar
                                </button>
                                <button onClick={() => deleteUser(user.id)} className="bg-white border border-slate-200 text-slate-400 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors">
                                    <Trash2 size={14}/> Eliminar
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create Modal Simulation */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center sm:p-4">
                    <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Crear Usuario</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="Nombre completo" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm" placeholder="usuario@email.com" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm">
                                    <option value="CLIENT">Paciente (Cliente)</option>
                                    <option value="PROFESSIONAL">Profesional</option>
                                    {/* Role Based Access Control for Dropdown */}
                                    {currentUserRole === 'ADMIN' && <option value="COORDINATOR">Coordinador</option>}
                                    {currentUserRole === 'ADMIN' && <option value="ADMIN">Administrador</option>}
                                </select>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl mt-2 hover:bg-brand-700">Guardar Usuario</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminView: React.FC<{ currentUser: User; onLogout: () => void }> = ({ currentUser, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'global' | 'users' | 'content' | 'settings'>('global');

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">
             <aside className="hidden md:flex w-20 bg-slate-900 text-white flex-col items-center py-6 gap-8 z-20 shadow-xl">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-900/50">A.</div>
                <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                    <button onClick={() => setActiveTab('global')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'global' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Activity size={24} /></button>
                    <button onClick={() => setActiveTab('users')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Users size={24} /></button>
                    <button onClick={() => setActiveTab('content')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'content' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Briefcase size={24} /></button>
                    <button onClick={() => setActiveTab('settings')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Settings size={24} /></button>
                </nav>
                <div className="flex flex-col gap-4">
                    <button onClick={onLogout} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 flex items-center justify-center transition-colors"><LogOut size={18} /></button>
                    <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-slate-700" alt="Profile" />
                </div>
            </aside>

             <main className="flex-1 relative bg-slate-50 overflow-hidden flex flex-col">
                {activeTab === 'global' && <div className="h-full overflow-y-auto p-4 md:p-8 pb-24"><AdminGlobalPanel /></div>}
                {activeTab === 'users' && <AdminUserManagement currentUserRole="ADMIN" onSelectUser={(u) => console.log('Selected user:', u)} />}
                {activeTab === 'content' && <ContentManager />}
                {activeTab === 'settings' && <AdminSettings />}
             </main>

            {/* Admin Mobile Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button onClick={() => setActiveTab('global')} className={`flex flex-col items-center gap-1 ${activeTab === 'global' ? 'text-indigo-600' : 'text-slate-400'}`}><Activity size={20} /><span className="text-[10px] font-bold">Resumen</span></button>
                <button onClick={() => setActiveTab('users')} className={`flex flex-col items-center gap-1 ${activeTab === 'users' ? 'text-indigo-600' : 'text-slate-400'}`}><Users size={20} /><span className="text-[10px] font-bold">Usuarios</span></button>
                <button onClick={() => setActiveTab('content')} className={`flex flex-col items-center gap-1 ${activeTab === 'content' ? 'text-indigo-600' : 'text-slate-400'}`}><Briefcase size={20} /><span className="text-[10px] font-bold">Contenido</span></button>
                <button onClick={onLogout} className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-500"><LogOut size={20} /><span className="text-[10px] font-bold">Salir</span></button>
            </div>
        </div>
    );
};

const CoordinatorView: React.FC<{ currentUser: User; onLogout: () => void }> = ({ currentUser, onLogout }) => {
    // Coordinator can manage users, view progress (clients list), and manage content.
    // They are like a "Lite Admin" without Server settings, but with Calendar.
    const [activeTab, setActiveTab] = useState<'clients' | 'calendar' | 'users' | 'content'>('clients');
    const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
    const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

    const handleClientSelect = (client: ClientProfile) => {
        setSelectedClient(client);
        setIsMobileDetailOpen(true);
        setActiveTab('clients');
    };

    return (
        <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">
             <aside className="hidden md:flex w-20 bg-slate-900 text-white flex-col items-center py-6 gap-8 z-20 shadow-xl">
                <div className="w-10 h-10 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center font-bold shadow-lg">C.</div>
                <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                    <button onClick={() => setActiveTab('clients')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'clients' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Activity size={24} /></button>
                    <button onClick={() => setActiveTab('calendar')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'calendar' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><CalendarIcon size={24} /></button>
                    <div className="h-px bg-slate-700 w-full my-2"></div>
                    <button onClick={() => setActiveTab('users')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'users' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Users size={24} /></button>
                    <button onClick={() => setActiveTab('content')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'content' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Briefcase size={24} /></button>
                </nav>
                <div className="flex flex-col gap-4">
                    <button onClick={onLogout} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 flex items-center justify-center transition-colors"><LogOut size={18} /></button>
                    <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-slate-700" alt="Profile" />
                </div>
            </aside>

            {/* Layout Handling based on Tab */}
            {activeTab === 'clients' ? (
                <>
                    <div className={`hidden md:flex w-80 bg-white border-r border-slate-200 z-10 flex-col shadow-sm`}>
                        <ProClientsList onSelect={handleClientSelect} selectedId={selectedClient?.id} />
                    </div>
                    <main className="flex-1 relative bg-slate-50 overflow-hidden flex flex-col">
                        <div className="hidden md:block h-full w-full">
                            {selectedClient ? <ProClientDetail client={selectedClient} /> : <div className="h-full flex items-center justify-center text-slate-400"><p>Selecciona un paciente para ver su avance</p></div>}
                        </div>
                        <div className="md:hidden h-full w-full relative">
                            {isMobileDetailOpen && selectedClient ? (
                                <div className="absolute inset-0 z-30 bg-white animate-in slide-in-from-right duration-200">
                                    <ProClientDetail client={selectedClient} onBack={() => setIsMobileDetailOpen(false)} />
                                </div>
                            ) : (
                                <ProClientsList onSelect={handleClientSelect} selectedId={selectedClient?.id} />
                            )}
                        </div>
                    </main>
                </>
            ) : (
                <main className="flex-1 relative bg-slate-50 overflow-hidden flex flex-col">
                    {activeTab === 'calendar' && <div className="h-full overflow-y-auto pb-20 md:pb-0"><ProCalendarModule onSelectClient={(c) => {setSelectedClient(c); setActiveTab('clients');}} /></div>}
                    {activeTab === 'users' && <AdminUserManagement currentUserRole="COORDINATOR" onSelectUser={(u) => console.log(u)} />}
                    {activeTab === 'content' && <ContentManager />}
                </main>
            )}

            {/* Coordinator Mobile Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button onClick={() => setActiveTab('clients')} className={`flex flex-col items-center gap-1 ${activeTab === 'clients' ? 'text-slate-900' : 'text-slate-400'}`}><Activity size={20} /><span className="text-[10px] font-bold">Pacientes</span></button>
                <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center gap-1 ${activeTab === 'calendar' ? 'text-slate-900' : 'text-slate-400'}`}><CalendarIcon size={20} /><span className="text-[10px] font-bold">Agenda</span></button>
                <button onClick={() => setActiveTab('users')} className={`flex flex-col items-center gap-1 ${activeTab === 'users' ? 'text-slate-900' : 'text-slate-400'}`}><Users size={20} /><span className="text-[10px] font-bold">Gestión</span></button>
                <button onClick={() => setActiveTab('content')} className={`flex flex-col items-center gap-1 ${activeTab === 'content' ? 'text-slate-900' : 'text-slate-400'}`}><Briefcase size={20} /><span className="text-[10px] font-bold">Contenido</span></button>
                <button onClick={onLogout} className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-500"><LogOut size={20} /><span className="text-[10px] font-bold">Salir</span></button>
            </div>
        </div>
    );
}

export const AdminDashboard: React.FC<Props> = ({ currentUser, onLogout }) => {
  if (currentUser.role === 'ADMIN') {
    return <AdminView currentUser={currentUser} onLogout={onLogout} />;
  }
  if (currentUser.role === 'COORDINATOR') {
    return <CoordinatorView currentUser={currentUser} onLogout={onLogout} />;
  }
  
  // Professional View implementation
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(MOCK_CLIENT_W1);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'clients' | 'calendar'>('clients');
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  const handleClientSelect = (client: ClientProfile) => {
      setSelectedClient(client);
      setIsMobileDetailOpen(true);
      setActiveSidebarTab('clients');
  };

  return (
      <div className="flex h-screen bg-slate-100 overflow-hidden font-sans text-slate-800">
           <aside className="hidden md:flex w-20 bg-slate-900 text-white flex-col items-center py-6 gap-8 z-20 shadow-xl">
              <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand-900/50">P.</div>
              <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                  <button onClick={() => setActiveSidebarTab('clients')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeSidebarTab === 'clients' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Users size={24} /></button>
                  <button onClick={() => setActiveSidebarTab('calendar')} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${activeSidebarTab === 'calendar' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><CalendarIcon size={24} /></button>
              </nav>
              <div className="flex flex-col gap-4">
                  <button onClick={onLogout} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 flex items-center justify-center transition-colors"><LogOut size={18} /></button>
                  <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-slate-700" alt="Profile" />
              </div>
           </aside>

           <div className={`hidden md:flex w-80 bg-white border-r border-slate-200 z-10 flex-col shadow-sm transition-all duration-300 ${activeSidebarTab === 'clients' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute'}`}>
              <ProClientsList onSelect={handleClientSelect} selectedId={selectedClient?.id} />
           </div>

           <main className="flex-1 relative bg-slate-50 overflow-hidden flex flex-col">
              <div className="hidden md:block h-full w-full">
                  {activeSidebarTab === 'calendar' ? <ProCalendarModule onSelectClient={handleClientSelect} /> : (selectedClient ? <ProClientDetail client={selectedClient} /> : <div className="h-full flex items-center justify-center text-slate-400"><p>Selecciona un paciente</p></div>)}
              </div>

              <div className="md:hidden h-full w-full relative">
                  {isMobileDetailOpen && selectedClient && activeSidebarTab === 'clients' && <div className="absolute inset-0 z-30 bg-white animate-in slide-in-from-right duration-200"><ProClientDetail client={selectedClient} onBack={() => setIsMobileDetailOpen(false)} /></div>}
                  {activeSidebarTab === 'calendar' && <div className="absolute inset-0 z-20 bg-white pb-20"><ProCalendarModule onSelectClient={handleClientSelect} /></div>}
                  {activeSidebarTab === 'clients' && !isMobileDetailOpen && <div className="absolute inset-0 z-20 bg-white pb-20"><ProClientsList onSelect={handleClientSelect} selectedId={selectedClient?.id} /></div>}
              </div>
           </main>

          <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <button onClick={() => { setActiveSidebarTab('clients'); setIsMobileDetailOpen(false); }} className={`flex flex-col items-center gap-1 ${activeSidebarTab === 'clients' ? 'text-brand-600' : 'text-slate-400'}`}><Users size={20} /><span className="text-[10px] font-bold">Pacientes</span></button>
              <button onClick={() => setActiveSidebarTab('calendar')} className={`flex flex-col items-center gap-1 ${activeSidebarTab === 'calendar' ? 'text-brand-600' : 'text-slate-400'}`}><CalendarIcon size={20} /><span className="text-[10px] font-bold">Agenda</span></button>
              <button onClick={onLogout} className="flex flex-col items-center gap-1 text-slate-400 hover:text-red-500"><LogOut size={20} /><span className="text-[10px] font-bold">Salir</span></button>
          </div>
      </div>
  );
};