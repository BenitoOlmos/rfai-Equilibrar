import React, { useState } from 'react';
import { User, ClientProfile } from './types';
import { ALL_USERS } from './constants';
import { ClientDashboard } from './components/ClientDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Eye, EyeOff, ArrowRight, HelpCircle, Moon } from 'lucide-react';
import { BrandLogo } from './components/BrandLogo';

const LoginPage: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = ALL_USERS.find(u => u.email === email);
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales inválidas.');
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    const user = ALL_USERS.find(u => u.email === demoEmail);
    if (user) onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white font-sans relative overflow-hidden">
      
      {/* Background Decor from design */}
      <div className="absolute top-0 w-full h-full bg-white"></div>
      
      <div className="w-full max-w-[550px] bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-12 relative z-10 flex flex-col items-center">
        
        {/* Header Logo */}
        <div className="mb-10 w-48 h-48 -mt-24 bg-white rounded-full flex items-center justify-center shadow-sm">
            <BrandLogo className="w-40 h-40 scale-125" />
        </div>

        <h1 className="text-3xl font-light text-slate-800 mb-8 text-center">
            Plataforma <span className="font-bold text-brand-500">RFAI</span>
        </h1>

        <form onSubmit={handleLogin} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 rounded-full bg-slate-50/50 border border-slate-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 outline-none transition-all text-slate-600 placeholder:text-slate-300 font-medium"
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
                className="w-full px-6 py-4 rounded-full bg-slate-50/50 border border-slate-100 focus:border-brand-500 focus:ring-1 focus:ring-brand-200 outline-none transition-all text-slate-600 placeholder:text-slate-300 font-medium tracking-widest"
                placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-brand-500 transition-colors">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>}

          <button type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-full font-bold shadow-lg shadow-brand-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group">
            Iniciar Sesión
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="text-center">
            <button type="button" className="text-sm text-slate-400 hover:text-brand-600 transition-colors font-medium">
                ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>

        {/* Demo Section */}
        <div className="mt-12 w-full pt-8 border-t border-slate-50">
            <p className="text-center text-[10px] text-slate-400 mb-6 uppercase font-bold tracking-widest">Accesos Demo - Programa Culpa</p>
            
            <div className="grid grid-cols-4 gap-2 mb-6">
                <button onClick={() => handleDemoLogin('lucia@client.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all">
                    S1
                </button>
                <button onClick={() => handleDemoLogin('carlos@client.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all">
                    S2
                </button>
                <button onClick={() => handleDemoLogin('pedro@client.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all">
                    S3
                </button>
                 <button onClick={() => handleDemoLogin('ana@client.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-brand-500 hover:text-brand-600 hover:bg-brand-50 transition-all">
                    S4
                </button>
            </div>

            <p className="text-center text-[10px] text-indigo-400 mb-6 uppercase font-bold tracking-widest">Accesos Demo - Programa Angustia</p>
            <div className="grid grid-cols-4 gap-2 mb-6">
                <button onClick={() => handleDemoLogin('paula@angustia.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    S1
                </button>
                <button onClick={() => handleDemoLogin('jorge@angustia.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    S2
                </button>
                <button onClick={() => handleDemoLogin('sofia@angustia.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    S3
                </button>
                 <button onClick={() => handleDemoLogin('miguel@angustia.com')} className="py-2 rounded-lg border border-slate-100 text-[10px] font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    S4
                </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleDemoLogin('coord@equilibrar.cl')} className="py-3 px-2 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-wide">
                    Coordinador
                </button>
                 <button onClick={() => handleDemoLogin('prof@equilibrar.cl')} className="py-3 px-2 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-wide">
                    Profesional
                </button>
                <button onClick={() => handleDemoLogin('admin@equilibrar.cl')} className="py-3 px-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition-all uppercase tracking-wide">
                    Admin
                </button>
            </div>
        </div>

        {/* Footer */}
        <div className="mt-12 mb-4 text-center">
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mb-4">Centro Clínico Equilibrar © 2024</p>
             <div className="flex justify-center gap-4">
                <button className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-brand-500 hover:border-brand-200 transition-all">
                    <Moon size={14} />
                </button>
                <button className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 hover:text-brand-500 hover:border-brand-200 transition-all">
                    <HelpCircle size={14} />
                </button>
             </div>
        </div>

      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  if (currentUser.role === 'CLIENT') {
    return <ClientDashboard user={currentUser as ClientProfile} onLogout={handleLogout} />;
  }

  // Coordinator, Admin, Professional share the dashboard layout but permissions differ inside
  return <AdminDashboard currentUser={currentUser} onLogout={handleLogout} />;
}