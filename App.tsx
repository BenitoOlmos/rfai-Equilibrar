import React, { useState } from 'react';
import { ClientProfile } from './types';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Eye, EyeOff, ArrowRight, HelpCircle, Moon } from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { authService } from './src/services/api';

const LoginPage: React.FC<{ onLogin: (sessionData: any) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      if (response.success) {
        onLogin(response);
      } else {
        setError('Credenciales inválidas.');
      }
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login(demoEmail);
      if (response.success) {
        onLogin(response);
      } else {
        setError('Usuario no encontrado');
      }
    } catch (err: any) {
      setError(err.response?.data?.mensaje || 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center bg-white font-sans relative overflow-hidden">

      {/* Background Decor from design */}
      <div className="absolute top-0 w-full h-full bg-white"></div>

      <div className="w-full max-w-[550px] bg-white rounded-[2rem] md:rounded-[3rem] shadow-none md:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-0 md:border border-slate-100 p-6 md:p-12 relative z-10 flex flex-col items-center">

        {/* Header Logo */}
        <div className="mb-8 md:mb-10 w-32 h-32 md:w-48 md:h-48 -mt-16 md:-mt-24 bg-white rounded-full flex items-center justify-center shadow-sm z-20">
          <BrandLogo className="w-24 h-24 md:w-40 md:h-40 scale-125" />
        </div>

        <h1 className="text-2xl md:text-3xl font-light text-slate-800 mb-6 md:mb-8 text-center">
          Plataforma <span className="font-bold text-brand-500">RFAI</span>
        </h1>

        <form onSubmit={handleLogin} className="w-full space-y-5 md:space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-full bg-slate-50/50 border border-slate-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 outline-none transition-all text-slate-600 placeholder:text-slate-300 font-medium text-base"
              placeholder="ejemplo@clinica.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-full bg-slate-50/50 border border-slate-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 outline-none transition-all text-slate-600 placeholder:text-slate-300 font-medium tracking-widest text-base"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-500 transition-colors p-2">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-full font-bold shadow-lg shadow-brand-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group text-base disabled:opacity-50">
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>

          <div className="text-center">
            <button type="button" className="text-sm text-slate-400 hover:text-brand-600 transition-colors font-medium p-2">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>

        {/* Demo Section */}
        <div className="mt-8 md:mt-12 w-full pt-8 border-t border-slate-50">
          <p className="text-center text-[10px] text-slate-400 mb-4 md:mb-6 uppercase font-bold tracking-widest">Accesos Demo - Programa Culpa</p>

          <div className="grid grid-cols-4 gap-2 mb-4 md:mb-6">
            <button onClick={() => handleDemoLogin('lucia@client.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95">
              S1
            </button>
            <button onClick={() => handleDemoLogin('carlos@client.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95">
              S2
            </button>
            <button onClick={() => handleDemoLogin('pedro@client.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95">
              S3
            </button>
            <button onClick={() => handleDemoLogin('ana@client.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-95">
              S4
            </button>
          </div>

          <p className="text-center text-[10px] text-indigo-400 mb-4 md:mb-6 uppercase font-bold tracking-widest">Accesos Demo - Programa Angustia</p>
          <div className="grid grid-cols-4 gap-2 mb-6">
            <button onClick={() => handleDemoLogin('paula@angustia.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95">
              S1
            </button>
            <button onClick={() => handleDemoLogin('jorge@angustia.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95">
              S2
            </button>
            <button onClick={() => handleDemoLogin('sofia@angustia.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95">
              S3
            </button>
            <button onClick={() => handleDemoLogin('miguel@angustia.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95">
              S4
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => handleDemoLogin('coordinacion@test.cl')} className="py-3 px-2 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-wide active:scale-95">
              Coordinador
            </button>
            <button onClick={() => handleDemoLogin('profesional@test.cl')} className="py-3 px-2 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-wide active:scale-95">
              Profesional
            </button>
            <button onClick={() => handleDemoLogin('admin@test.cl')} className="py-3 px-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition-all uppercase tracking-wide active:scale-95">
              Admin
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 md:mt-12 mb-4 text-center">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-4">Centro Clínico Equilibrar © 2024</p>
          <div className="flex justify-center gap-4">
            <button className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-brand-500 hover:border-brand-200 transition-all p-0">
              <Moon size={14} />
            </button>
            <button className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-brand-500 hover:border-brand-200 transition-all p-0">
              <HelpCircle size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default function App() {
  const [userSession, setUserSession] = useState<any | null>(null);

  const handleLogout = () => {
    setUserSession(null);
    localStorage.removeItem('rfai_session');
  };

  if (!userSession) {
    return <LoginPage onLogin={(sessionData) => {
      setUserSession(sessionData);
      localStorage.setItem('rfai_session', JSON.stringify(sessionData));
    }} />;
  }

  const rol = userSession.user.rol;

  if (rol === 'CLIENTE') {
    // Convertir formato backend a formato que espera ClientDashboard
    const clientProfile: ClientProfile = {
      id: userSession.user.id,
      name: userSession.user.nombre,
      email: userSession.user.email,
      role: 'CLIENT',
      avatar: 'https://picsum.photos/200/200?random=1',
      status: 'ACTIVE',
      phase: userSession.matricula?.dimension || 'ANGUSTIA',
      currentWeek: Math.min(Math.max(1, userSession.semanasDisponibles || 1), 4),
      startDate: userSession.matricula?.fechaInicio || new Date().toISOString(),
      nextSession: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      program: userSession.matricula?.dimension || 'ANGUSTIA',
      progress: {
        week1: {
          isLocked: false,
          isCompleted: (userSession.semanasDisponibles || 0) > 1,
          initialTestDone: (userSession.semanasDisponibles || 0) >= 1,
          guideCompleted: false,
          audioListened: 0,
          meetingAttended: false
        },
        week2: {
          isLocked: (userSession.semanasDisponibles || 0) < 2,
          isCompleted: (userSession.semanasDisponibles || 0) > 2,
          guideCompleted: false,
          audioListened: 0
        },
        week3: {
          isLocked: (userSession.semanasDisponibles || 0) < 3,
          isCompleted: (userSession.semanasDisponibles || 0) > 3,
          guideCompleted: false,
          audioListened: 0
        },
        week4: {
          isLocked: (userSession.semanasDisponibles || 0) < 4,
          isCompleted: false,
          guideCompleted: false,
          audioListened: 0
        }
      },
      clinicalData: {
        testScores: [],
        audioUsage: []
      }
    };

    return <ClientDashboard user={clientProfile} onLogout={handleLogout} />;
  }

  // Admin, Coordinator, Professional
  return <AdminDashboard currentUser={{ ...userSession.user, role: rol }} onLogout={handleLogout} />;
}