import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, ArrowRight, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const handleFinish = () => {
    if (!name.trim()) return alert("Please enter your name");
    localStorage.setItem('userName', name.trim());
    localStorage.setItem('theme', theme);
    window.location.href = '/'; 
  };

  return (
    <div className="flex flex-col h-full bg-parchment text-walnut overflow-y-auto p-6 relative">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />

      <div className="mt-12 mb-10 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-16 h-16 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-walnut/10 dark:border-white/10 rounded-3xl flex items-center justify-center mb-6 shadow-sm dark:shadow-none">
          <Sparkles size={28} className="text-primary" />
        </div>
        <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">Welcome to your space</h1>
        <p className="text-sm text-walnut/60 dark:text-walnut/70">Let's set up your spiritual companion.</p>
      </div>

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/80 ml-2">What is your name?</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Hazik"
            className="w-full bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-walnut/10 dark:border-white/10 rounded-2xl p-4 text-lg font-serif focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm dark:shadow-none text-walnut"
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/80 ml-2">Choose your aesthetic</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all
                ${theme === 'light' ? 'bg-white dark:bg-white/10 border-primary shadow-md shadow-primary/10' : 'bg-white/50 dark:bg-white/5 border-walnut/10 dark:border-white/10 hover:border-primary/30'}`}
            >
              <Sun size={24} className={`mb-2 ${theme === 'light' ? 'text-primary' : 'text-walnut/40'}`} />
              <span className={`text-sm font-bold ${theme === 'light' ? 'text-walnut' : 'text-walnut/50'}`}>Light</span>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all 
                ${theme === 'dark' ? 'bg-[#1a2f24] border-[#4ade80] shadow-md shadow-[#4ade80]/10' : 'bg-[#1a2f24]/50 border-transparent hover:border-[#4ade80]/30'}`}
            >
              <Moon size={24} className={`mb-2 ${theme === 'dark' ? 'text-[#4ade80]' : 'text-white/40'}`} />
              <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-white/50'}`}>Dark</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-8 pb-4 animate-in fade-in duration-700 delay-300 fill-mode-both">
        <button 
          onClick={handleFinish}
          disabled={!name.trim()}
          className="w-full bg-walnut dark:bg-primary hover:bg-walnut/90 disabled:bg-walnut/30 disabled:opacity-50 text-parchment dark:text-white font-bold py-4 rounded-2xl transition-all flex justify-center items-center gap-2 shadow-sm active:scale-[0.98]"
        >
          Begin Journey <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}