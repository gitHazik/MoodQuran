import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleFinish = () => {
    if (!name.trim()) return alert("Please enter your name");
    localStorage.setItem('userName', name.trim());
    window.location.href = '/'; 
  };

  return (
    <div className="flex flex-col h-full bg-parchment text-walnut overflow-y-auto p-6 relative">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

      <div className="mt-16 mb-12 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
          <Sparkles size={32} className="text-primary" />
        </div>
        <h1 className="text-3xl font-serif font-bold tracking-tight mb-3">Salam, Friend</h1>
        <p className="text-sm text-walnut/70">What should we call you on your journey?</p>
      </div>

      <div className="space-y-6">
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-lg font-serif focus:outline-none focus:border-primary/50 transition-all shadow-inner text-walnut"
        />

        <button 
          onClick={handleFinish}
          disabled={!name.trim()}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex justify-center items-center gap-2 shadow-md active:scale-[0.98]"
        >
          Begin Journey <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}