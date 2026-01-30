import React, { useState, useEffect } from 'react';
import { adminService } from '../src/services/api';
import { UserPlus, Search, User, Filter, AlertCircle, CheckCircle2, MoreVertical, Edit, Shield, Save, X, Power, UserCog } from 'lucide-react';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'PROFESSIONAL' | 'CLIENT';
    status: 'ACTIVO' | 'INACTIVO' | 'PAUSADO' | 'SUSPENDIDO';
    avatar: string;
    program?: string;
    currentWeek?: number;
    matriculaId?: number;
}

export const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'ALL' | 'CLIENT' | 'PROFESSIONAL'>('ALL');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Edit Modal State
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Create Mode
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        email: '',
        rol: 'CLIENTE',
        programaId: 1,
        estado: 'ACTIVO'
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await adminService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (isCreating) {
                await adminService.crearUsuario(formData);
                showMessage('success', 'Usuario creado exitosamente');
            } else if (editingUser) {
                await adminService.updateUsuario(editingUser.id, {
                    nombre: formData.nombre,
                    email: formData.email,
                    estado: formData.estado,
                });
                showMessage('success', 'Usuario actualizado correctamente');
            }
            setShowModal(false);
            loadUsers();
        } catch (error) {
            showMessage('error', 'Error al guardar los cambios');
        }
    };

    const toggleStatus = async (user: AdminUser) => {
        const newStatus = user.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        if (!confirm(`¿Cambiar estado de ${user.name} a ${newStatus}?`)) return;

        try {
            await adminService.updateUsuario(user.id, { estado: newStatus });
            showMessage('success', `Usuario ${newStatus.toLowerCase()} correctamente`);
            loadUsers(); // Refresh
        } catch (error) {
            showMessage('error', 'Error al cambiar estado');
        }
    };

    const openEdit = (user: AdminUser) => {
        setEditingUser(user);
        setIsCreating(false);
        setFormData({
            id: user.id,
            nombre: user.name,
            email: user.email,
            rol: user.role,
            programaId: 1,
            estado: user.status
        });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditingUser(null);
        setIsCreating(true);
        setFormData({
            id: `u-${Date.now()}`,
            nombre: '',
            email: '',
            rol: 'CLIENTE',
            programaId: 1,
            estado: 'ACTIVO'
        });
        setShowModal(true);
    };

    const handleAssignClaudio = async (matriculaId: number) => {
        if (!confirm('¿Vincular este paciente con Claudio Reyes?')) return;
        try {
            await adminService.vincularProfesional(matriculaId, 'prof-claudio-reyes');
            alert('Vinculación exitosa');
            loadUsers();
        } catch (e) {
            alert('Error al vincular');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'ALL' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="bg-white h-full flex flex-col rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">Gestión de Usuarios</h3>
                    <p className="text-xs text-slate-400">Administración general del sistema</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-100"
                >
                    <UserPlus size={18} />
                    <span className="hidden sm:inline">Nuevo Usuario</span>
                </button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-slate-100 bg-white flex gap-3 relative">
                {message && (
                    <div className={`absolute top-0 left-0 right-0 z-10 p-2 text-center text-xs font-bold animate-in slide-in-from-top duration-300 ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {message.text}
                    </div>
                )}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setFilterRole('ALL')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterRole === 'ALL' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                    >Todos</button>
                    <button
                        onClick={() => setFilterRole('CLIENT')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${filterRole === 'CLIENT' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >Pacientes</button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="text-center py-10 text-slate-400">Cargando usuarios...</div>
                ) : (
                    filteredUsers.map(user => (
                        <div key={user.id} className="p-4 rounded-xl border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all bg-white group relative">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={user.avatar} className="w-10 h-10 rounded-full object-cover bg-slate-100" alt="" />
                                        <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${user.status === 'ACTIVO' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{user.name}</h4>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                        <div className="flex gap-2 mt-1">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'PROFESSIONAL' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-emerald-100 text-emerald-700'
                                                }`}>{user.role}</span>
                                            {user.program && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                                    {user.program}
                                                </span>
                                            )}
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${user.status === 'ACTIVO' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {user.status === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => openEdit(user)}
                                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => toggleStatus(user)}
                                            className={`p-2 rounded-lg transition-colors ${user.status === 'ACTIVO' ? 'text-green-600 hover:bg-red-50 hover:text-red-500' : 'text-slate-400 hover:bg-green-50 hover:text-green-600'}`}
                                            title={user.status === 'ACTIVO' ? 'Desactivar' : 'Activar'}
                                        >
                                            <Power size={16} />
                                        </button>
                                    </div>

                                    {/* Action: Link to Claudio if orphan */}
                                    {user.role === 'CLIENT' && user.matriculaId && !user.program /* Only show if looks unassigned or special case? Actually unassigned logic needs checking backend response. */ && (
                                        <button
                                            onClick={() => handleAssignClaudio(user.matriculaId!)}
                                            className="text-[10px] bg-brand-50 text-brand-600 px-2 py-1 rounded font-bold hover:bg-brand-100"
                                            title="Asignar a Claudio Reyes"
                                        >
                                            Vincular
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">
                                {isCreating ? 'Nuevo Usuario' : 'Editar Usuario'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {!isCreating && (
                                <div className="p-3 bg-slate-50 rounded-xl flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-slate-600">Estado</span>
                                    <select
                                        value={formData.estado} // Corrected
                                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                                        className="bg-white border text-sm rounded-lg p-1.5 focus:ring-brand-500"
                                    >
                                        <option value="ACTIVO">Activo</option>
                                        <option value="INACTIVO">Inactivo</option>
                                        <option value="PAUSADO">Pausado</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {isCreating && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol</label>
                                        <select
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                                            value={formData.rol}
                                            onChange={e => setFormData({ ...formData, rol: e.target.value })}
                                        >
                                            <option value="CLIENTE">Paciente</option>
                                            <option value="PROFESIONAL">Profesional</option>
                                            <option value="ADMIN">Administrador</option>
                                            <option value="COORDINADOR">Coordinador</option>
                                        </select>
                                    </div>
                                    {formData.rol === 'CLIENTE' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Programa Inicial</label>
                                            <select
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                                                value={formData.programaId}
                                                onChange={e => setFormData({ ...formData, programaId: Number(e.target.value) })}
                                            >
                                                <option value={1}>RFAI - Programa Culpa</option>
                                                <option value={2}>RFAI - Programa Angustia</option>
                                            </select>
                                        </div>
                                    )}
                                </>
                            )}

                            <button
                                onClick={handleSave}
                                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-100 transition-all mt-4"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
