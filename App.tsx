import React, { useState, useEffect } from 'react';
import { ClientProfile } from './types';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfessionalDashboard } from './components/ProfessionalDashboard';
import { Eye, EyeOff, ArrowRight, HelpCircle, Moon, Sun } from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';
import { authService, dashboardService } from './src/services/api';

const LoginPage: React.FC<{ onLogin: (sessionData: any) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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

  // Nueva función para pre-cargar datos de staff
  const handleStaffPreload = (staffEmail: string, staffPassword: string) => {
    setEmail(staffEmail);
    setPassword(staffPassword);
    setError('');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const openFAQ = () => {
    window.open('https://equilibrar.cl/preguntas-frecuentes', '_blank');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center font-sans relative overflow-auto py-8 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>

      {/* Background Decor from design */}
      <div className={`absolute top-0 w-full h-full ${darkMode ? 'bg-slate-900' : 'bg-white'}`}></div>

      <div className={`w-full max-w-[550px] rounded-[2rem] md:rounded-[3rem] shadow-none md:shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-0 md:border p-6 md:p-12 relative z-10 flex flex-col items-center my-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
        }`}>

        {/* Header Logo */}
        <div className={`mb-8 md:mb-10 w-32 h-32 md:w-48 md:h-48 -mt-20 md:-mt-28 rounded-full flex items-center justify-center shadow-sm z-20 ${darkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
          <BrandLogo className="w-24 h-24 md:w-40 md:h-40 scale-125" />
        </div>

        <h1 className={`text-2xl md:text-3xl font-light mb-6 md:mb-8 text-center ${darkMode ? 'text-white' : 'text-slate-800'
          }`}>
          Plataforma <span className="font-bold text-brand-500">RFAI</span>
        </h1>

        <form onSubmit={handleLogin} className="w-full space-y-5 md:space-y-6">
          <div className="space-y-2">
            <label className={`block text-[10px] font-bold uppercase tracking-widest pl-1 ${darkMode ? 'text-slate-400' : 'text-slate-400'
              }`}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-6 py-4 rounded-full border focus:border-brand-500 focus:ring-1 focus:ring-brand-200 outline-none transition-all font-medium text-base ${darkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                : 'bg-slate-50/50 border-slate-100 text-slate-600 placeholder:text-slate-300'
                }`}
              placeholder="ejemplo@clinica.com"
            />
          </div>

          <div className="space-y-2">
            <label className={`block text-[10px] font-bold uppercase tracking-widest pl-1 ${darkMode ? 'text-slate-400' : 'text-slate-400'
              }`}>Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-6 py-4 rounded-full border focus:border-brand-500 focus:ring-1 focus:ring-brand-200 outline-none transition-all font-medium tracking-widest text-base ${darkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                  : 'bg-slate-50/50 border-slate-100 text-slate-600 placeholder:text-slate-300'
                  }`}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-6 top-1/2 -translate-y-1/2 transition-colors p-2 ${darkMode ? 'text-slate-400 hover:text-brand-500' : 'text-slate-300 hover:text-brand-500'
                }`}>
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
            <button type="button" className={`text-sm transition-colors font-medium p-2 ${darkMode ? 'text-slate-400 hover:text-brand-500' : 'text-slate-400 hover:text-brand-600'
              }`}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>

        {/* Demo Section */}
        <div className={`mt-8 md:mt-12 w-full pt-8 border-t ${darkMode ? 'border-slate-700' : 'border-slate-50'
          }`}>
          <p className={`text-center text-[10px] mb-4 md:mb-6 uppercase font-bold tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'
            }`}>Accesos Demo - Programa Culpa</p>

          <div className="grid grid-cols-4 gap-2 mb-4 md:mb-6">
            <button
              onClick={() => handleStaffPreload('lucia@client.com', 'demo123')}
              className={`py-2 px-1 rounded-lg border text-[9px] font-bold transition-all active:scale-95 ${darkMode
                ? 'border-slate-600 text-slate-300 hover:border-brand-500 hover:text-brand-500 hover:bg-slate-700'
                : 'border-slate-100 text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50'
                }`}
              type="button">
              Lucía<br />S1
            </button>
            <button
              onClick={() => handleStaffPreload('carlos@client.com', 'demo123')}
              className={`py-2 px-1 rounded-lg border text-[9px] font-bold transition-all active:scale-95 ${darkMode
                ? 'border-slate-600 text-slate-300 hover:border-brand-500 hover:text-brand-500 hover:bg-slate-700'
                : 'border-slate-100 text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50'
                }`}
              type="button">
              Carlos<br />S2
            </button>
            <button
              onClick={() => handleStaffPreload('pedro@client.com', 'demo123')}
              className={`py-2 px-1 rounded-lg border text-[9px] font-bold transition-all active:scale-95 ${darkMode
                ? 'border-slate-600 text-slate-300 hover:border-brand-500 hover:text-brand-500 hover:bg-slate-700'
                : 'border-slate-100 text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50'
                }`}
              type="button">
              Pedro<br />S3
            </button>
            <button
              onClick={() => handleStaffPreload('ana@client.com', 'demo123')}
              className={`py-2 px-1 rounded-lg border text-[9px] font-bold transition-all active:scale-95 ${darkMode
                ? 'border-slate-600 text-slate-300 hover:border-brand-500 hover:text-brand-500 hover:bg-slate-700'
                : 'border-slate-100 text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50'
                }`}
              type="button">
              Ana<br />S4
            </button>
          </div>

          <p className={`text-center text-[10px] mb-4 md:mb-6 uppercase font-bold tracking-widest ${darkMode ? 'text-indigo-400' : 'text-indigo-400'
            }`}>Accesos Demo - Programa Angustia</p>
          <div className="grid grid-cols-4 gap-2 mb-6">
            <button
              onClick={() => handleStaffPreload('paula@angustia.com', 'demo123')}
              className={`py-2 px-1 rounded-lg border text-[9px] font-bold transition-all active:scale-95 ${darkMode
                ? 'border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-700'
                : 'border-slate-100 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              type="button">
              Paula<br />S1
            </button>
            <button
              onClick={() => handleStaffPreload('jorge@angustia.com', 'demo123')}
              className={`py-2 px-1 rounded-lg border text-[9px] font-bold transition-all active:scale-95 ${darkMode
                ? 'border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-700'
                : 'border-slate-100 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              type="button">
              Jorge<br />S2
            </button>
            <button
              onClick={() => handleStaffPreload('sofia@angustia.com', 'demo123')}
              className={`py-2 px-1 rounded-lg border text-[9px] font-bold transition-all active:scale-95 ${darkMode
                ? 'border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-700'
                : 'border-slate-100 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              type="button">
              Sofía<br />S3
            </button>
            <button
              onClick={() => handleStaffPreload('miguel@angustia.com', 'demo123')}
              className={`py-2 px-1 rounded-lg border text-[9px] font-bold transition-all active:scale-95 ${darkMode
                ? 'border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-400 hover:bg-slate-700'
                : 'border-slate-100 text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              type="button">
              Miguel<br />S4
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleStaffPreload('coordinacion@test.cl', 'se1234')}
              className={`py-3 px-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wide active:scale-95 ${darkMode
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              type="button">
              Coordinador
            </button>
            <button
              onClick={() => handleStaffPreload('profesional@test.cl', 'cr1234')}
              className={`py-3 px-2 rounded-xl text-[10px] font-bold transition-all uppercase tracking-wide active:scale-95 ${darkMode
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              type="button">
              Profesional
            </button>
            <button
              onClick={() => handleStaffPreload('admin@test.cl', 'bo1234')}
              className="py-3 px-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition-all uppercase tracking-wide active:scale-95"
              type="button">
              Admin
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 md:mt-12 mb-4 text-center">
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 ${darkMode ? 'text-slate-600' : 'text-slate-300'
            }`}>Centro Clínico Equilibrar © 2024</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleDarkMode}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all p-0 ${darkMode
                ? 'border-slate-600 text-brand-500 hover:text-brand-400 hover:border-brand-400'
                : 'border-slate-100 text-slate-300 hover:text-brand-500 hover:border-brand-200'
                }`}>
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={openFAQ}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all p-0 ${darkMode
                ? 'border-slate-600 text-slate-400 hover:text-brand-500 hover:border-brand-400'
                : 'border-slate-100 text-slate-300 hover:text-brand-500 hover:border-brand-200'
                }`}>
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
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const handleLogout = () => {
    setUserSession(null);
    setClientProfile(null);
    localStorage.removeItem('rfai_session');
  };

  // Cargar perfil del cliente cuando hay sesión
  useEffect(() => {
    if (userSession && userSession.user.rol === 'CLIENTE') {
      setIsLoadingProfile(true);
      dashboardService.getClientProfile(userSession.user.id)
        .then((profile) => {
          setClientProfile(profile);
        })
        .catch((error) => {
          console.error('Error al cargar perfil:', error);
          // Crear fallback profile
          const fallbackProfile: ClientProfile = {
            id: userSession.user.id,
            name: userSession.user.nombre,
            email: userSession.user.email,
            role: 'CLIENT',
            avatar: 'https://picsum.photos/200/200?random=1',
            status: 'ACTIVE',
            currentWeek: Math.min(Math.max(1, userSession.semanasDisponibles || 1), 4) as 1 | 2 | 3 | 4,
            startDate: userSession.matricula?.fechaInicio || new Date().toISOString(),
            nextSession: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            program: userSession.matricula?.dimension || 'ANGUSTIA',
            progress: {
              week1: { isLocked: false, isCompleted: false, initialTestDone: false, guideCompleted: false, audioListened: 0, meetingAttended: false },
              week2: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
              week3: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 },
              week4: { isLocked: true, isCompleted: false, guideCompleted: false, audioListened: 0 }
            },
            clinicalData: { testScores: [], audioUsage: [] }
          };
          setClientProfile(fallbackProfile);
        })
        .finally(() => {
          setIsLoadingProfile(false);
        });
    }
  }, [userSession]);

  if (!userSession) {
    return <LoginPage onLogin={(sessionData) => {
      setUserSession(sessionData);
      localStorage.setItem('rfai_session', JSON.stringify(sessionData));
    }} />;
  }

  const rol = userSession.user.rol;

  if (rol === 'CLIENTE') {
    if (isLoadingProfile) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando perfil...</p>
        </div>
      </div>;
    }

    if (!clientProfile) {
      return <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-red-500">Error al cargar perfil del cliente</p>
      </div>;
    }

    return <ClientDashboard user={clientProfile} onLogout={handleLogout} />;
  }

  // Profesional
  if (rol === 'PROFESIONAL') {
    return <ProfessionalDashboard
      currentUser={{ ...userSession.user, role: rol }}
      onLogout={handleLogout}
    />;
  }

  // Admin, Coordinator
  return <AdminDashboard currentUser={{ ...userSession.user, role: rol }} onLogout={handleLogout} />;
}