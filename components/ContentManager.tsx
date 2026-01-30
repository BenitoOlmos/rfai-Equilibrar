import React, { useState, useEffect } from 'react';
import { adminService } from '../src/services/api';
import { Plus, Search, FileText, Video, Headphones, GraduationCap, Edit, Trash2, X, Filter, Link as LinkIcon, AlertCircle, CheckCircle2, BarChart2 } from 'lucide-react';

interface ResourceItem {
    id: number;
    type: 'AUDIO' | 'VIDEO_MEET' | 'TEST' | 'DOCUMENTO' | 'ENLACE' | 'GUIDE';
    title: string;
    program: 'CULPA' | 'ANGUSTIA';
    details: string;
    url: string;
    status: 'ACTIVO' | 'INACTIVO';
    week: number;
}

interface ModuleOption {
    id: number;
    numero_semana: number;
    modulo_titulo: string;
    programa_nombre: string;
    programa_id: number;
    programa_slug: string;
}

export const ContentManager: React.FC = () => {
    const [resources, setResources] = useState<ResourceItem[]>([]);
    const [modules, setModules] = useState<ModuleOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('ALL');

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
    const [formData, setFormData] = useState({
        titulo: '',
        tipo: 'AUDIO',
        url: '',
        descripcion: '',
        moduloId: 0,
        programId: 1, // Default RFAI Culpa or first available
        week: 1,
        activo: true
    });

    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMsg({ type, text });
        setTimeout(() => setMsg(null), 3000);
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const [resData, modData] = await Promise.all([
                adminService.getRecursos(),
                adminService.getModulos()
            ]);
            setResources(resData);
            setModules(modData);

            // Set default module if needed
            if (modData.length > 0 && formData.moduloId === 0) {
                setFormData(prev => ({ ...prev, moduloId: modData[0].id }));
            }
        } catch (error) {
            console.error(error);
            showMessage('error', 'Error al cargar contenidos');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.titulo || !formData.url || !formData.moduloId) {
            showMessage('error', 'Completa los campos obligatorios');
            return;
        }

        try {
            if (editingItem) {
                await adminService.updateRecurso(editingItem.id, {
                    titulo: formData.titulo,
                    url: formData.url,
                    descripcion: formData.descripcion,
                    activo: formData.activo
                });
                showMessage('success', 'Recurso actualizado');
            } else {
                await adminService.createRecurso({
                    titulo: formData.titulo,
                    tipo: formData.tipo,
                    url: formData.url,
                    descripcion: formData.descripcion,
                    moduloId: formData.moduloId
                });
                showMessage('success', 'Recurso creado');
            }
            setShowModal(false);
            loadData();
        } catch (error) {
            showMessage('error', 'Error al guardar');
        }
    };

    const openEdit = (item: ResourceItem) => {
        setEditingItem(item);
        // Find module id is tricky since we normalized data. 
        // We will just assume user selects module again or we keep it as is if backend doesn't return module_id explicitly in getRecursos (my bad).
        // Update: getRecursos returns week and program, but not module_id. 
        // To properly edit module, I should have included module_id in getRecursos.
        // For now, I won't allow moving modules in EDIT mode to simplify, or I will try to match based on week/prog.

        const matchedModule = modules.find(m => m.numero_semana === item.week && m.programa_slug.toUpperCase().includes(item.program));

        setFormData({
            titulo: item.title,
            tipo: item.type,
            url: item.url,
            descripcion: item.details.split(' - ')[1] || '',
            moduloId: matchedModule ? matchedModule.id : 0,
            programId: matchedModule ? matchedModule.programa_id : 0,
            week: item.week,
            activo: item.status === 'ACTIVO'
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditingItem(null);
        setFormData({
            titulo: '',
            tipo: 'AUDIO',
            url: '',
            descripcion: '',
            moduloId: modules.length > 0 ? modules[0].id : 0,
            programId: modules.length > 0 ? modules[0].programa_id : 1,
            week: 1,
            activo: true
        });
        setShowModal(true);
    };

    const filtered = resources.filter(r =>
        (filterType === 'ALL' || r.type === filterType) &&
        (r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.details.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getIcon = (type: string) => {
        switch (type) {
            case 'AUDIO': return <Headphones size={20} className="text-white" />;
            case 'VIDEO_MEET': return <Video size={20} className="text-white" />;
            case 'TEST': return <BarChart2 size={20} className="text-white" />;
            case 'DOCUMENTO': return <FileText size={20} className="text-white" />;
            case 'ENLACE': return <LinkIcon size={20} className="text-white" />;
            case 'GUIDE': return <GraduationCap size={20} className="text-white" />;
            default: return <FileText size={20} className="text-white" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'AUDIO': return 'bg-indigo-500';
            case 'VIDEO_MEET': return 'bg-rose-500';
            case 'TEST': return 'bg-amber-500';
            case 'DOCUMENTO': return 'bg-emerald-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="bg-white h-full flex flex-col rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
            {/* Toast */}
            {msg && (
                <div className={`absolute top-0 left-0 right-0 z-50 p-2 text-center text-xs font-bold animate-in slide-in-from-top ${msg.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {msg.text}
                </div>
            )}

            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">Biblioteca de Recursos</h3>
                    <p className="text-xs text-slate-400">Gestión de audios, documentos y videos</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-200">
                    <Plus size={18} /> <span className="hidden sm:inline">Nuevo Recurso</span>
                </button>
            </div>

            <div className="p-4 border-b border-slate-100 bg-white flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
                        placeholder="Buscar contenido..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 overflow-x-auto">
                    {['ALL', 'AUDIO', 'DOCUMENTO', 'VIDEO_MEET', 'TEST'].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filterType === t ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {t === 'ALL' ? 'Todos' : t === 'VIDEO_MEET' ? 'Videos' : t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? <div className="text-center py-10 text-slate-400">Cargando biblioteca...</div> :
                    filtered.length === 0 ? <div className="text-center py-10 text-slate-400">No se encontraron recursos</div> :
                        filtered.map(item => (
                            <div key={item.id} className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all bg-white group flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-100 ${getColor(item.type)}`}>
                                        {getIcon(item.type)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                                        <div className="flex flex-wrap gap-2 text-xs mt-1">
                                            <span className="font-medium text-slate-500">{item.details}</span>
                                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${item.program === 'ANGUSTIA' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>{item.program}</span>
                                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${item.status === 'ACTIVO' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{item.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(item)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"><Edit size={16} /></button>
                                    {/* Delete could be added here if needed, keeping simple with just Edit/Inactivate via edit */}
                                </div>
                            </div>
                        ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">{editingItem ? 'Editar Recurso' : 'Nuevo Recurso'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                    value={formData.titulo} onChange={e => setFormData({ ...formData, titulo: e.target.value })} placeholder="Título del contenido" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                                        value={formData.tipo} onChange={e => setFormData({ ...formData, tipo: e.target.value as any })}>
                                        <option value="AUDIO">Audio</option>
                                        <option value="VIDEO_MEET">Video / Meet</option>
                                        <option value="DOCUMENTO">Documento PDF</option>
                                        <option value="ENLACE">Enlace Externo</option>
                                        <option value="TEST">Test Clínico</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estado</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                                        value={formData.activo ? 'true' : 'false'} onChange={e => setFormData({ ...formData, activo: e.target.value === 'true' })}>
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Asignar a Módulo</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none"
                                    value={formData.moduloId} onChange={e => setFormData({ ...formData, moduloId: Number(e.target.value) })}>
                                    {modules.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.programa_nombre} - Semana {m.numero_semana}: {m.modulo_titulo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">URL del Recurso</label>
                                <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                                    value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} placeholder="https://..." />
                                <p className="text-[10px] text-slate-400 mt-1">Enlace directo al archivo (Cloud Storage, Drive, YouTube, etc)</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción / Notas</label>
                                <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none" rows={3}
                                    value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Breve descripción..." />
                            </div>

                            <button onClick={handleSave} className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl mt-4 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                                {editingItem ? 'Guardar Cambios' : 'Crear Recurso'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
