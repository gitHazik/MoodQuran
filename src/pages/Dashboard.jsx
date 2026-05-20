import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Map, Flame, Bookmark, ArrowRight } from 'lucide-react';
import { getStreakData } from '../lib/streak'; 

export default function Dashboard() {
  const navigate = useNavigate();
  const [streakData, setStreakData] = useState({ streak: 0, lastActive: null });
  const userName = localStorage.getItem('userName') || 'Friend';

  useEffect(() => {
    setStreakData(getStreakData());
  }, []);

  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA');
  const isTodayActive = streakData.lastActive === todayStr;
  const activeCount = Math.min(streakData.streak, 7); 
  
  const endIndex = isTodayActive ? 6 : 5;
  const startIndex = endIndex - activeCount + 1;

  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i)); 
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), 
      isActive: i >= startIndex && i <= endIndex && activeCount > 0,
      isToday: i === 6
    };
  });

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto bg-transparent relative">
      
      {/* Decorative Background Blob */}
      <div className="absolute top-0 left-0 w-full h-64 bg-primary/5 blur-3xl -z-10 rounded-full mix-blend-multiply dark:mix-blend-lighten pointer-events-none" />

      {/* Header Profile Section */}
      <header className="flex justify-between items-end mb-8 pt-6">
        <div>
          <p className="text-primary font-bold tracking-widest text-[10px] uppercase mb-1">Welcome back</p>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-walnut">Salam, {userName}</h1>
        </div>
        <div className="w-12 h-12 bg-white/50 dark:bg-white/5 border border-walnut/10 dark:border-white/10 text-primary rounded-full flex items-center justify-center font-bold text-lg shadow-sm dark:shadow-none">
          {userName.charAt(0).toUpperCase()}
        </div>
      </header>

      {/* Elegant Streak Widget */}
      <section className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-walnut/10 dark:border-white/10 rounded-3xl p-6 mb-8 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 dark:bg-primary/20 rounded-xl text-primary">
              <Flame 
                size={20} 
                strokeWidth={2.5} 
                className={streakData.streak > 0 ? "animate-pulse" : ""} 
              />
            </div>
            <div>
              <h2 className="font-bold text-lg text-walnut leading-none mb-1">
                {streakData.streak > 0 ? `${streakData.streak} Day Streak` : "Start your streak"}
              </h2>
              <p className="text-xs text-walnut/50 dark:text-walnut/60">Consistent reflection</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between gap-1">
          {last7Days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div 
                className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500
                ${day.isActive 
                  ? 'bg-primary text-white shadow-md shadow-primary/20 dark:shadow-none scale-105' 
                  : day.isToday 
                    ? 'bg-white dark:bg-transparent border-2 border-primary/30 dark:border-primary/50 text-primary'
                    : 'bg-transparent border border-walnut/10 dark:border-white/10 text-walnut/40 dark:text-walnut/40'}`}
              >
                {day.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Asymmetric Navigation Grid */}
      <section className="grid grid-cols-2 gap-4 mt-auto mb-4">
        
        {/* MoodChat - Full Width Hero Card */}
        <button 
          onClick={() => navigate('/mood')} 
          className="col-span-2 group bg-white dark:bg-white/5 border border-walnut/10 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none hover:shadow-md hover:border-primary/30 dark:hover:border-primary/50 transition-all text-left relative overflow-hidden active:scale-[0.98]"
        >
          <div className="flex justify-between items-start mb-6">
            <div className="p-3.5 bg-primary/10 dark:bg-primary/20 text-primary rounded-2xl group-hover:scale-110 transition-transform duration-300">
              <Heart size={24} strokeWidth={2.5} />
            </div>
            <span className="bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              AI Chat
            </span>
          </div>
          <h3 className="font-serif font-bold text-2xl mb-1.5 text-walnut">MoodQuran</h3>
          <p className="text-sm text-walnut/60 dark:text-walnut/70 leading-relaxed pr-8">
            How is your heart today? Let the scripture guide you to peace.
          </p>
          <ArrowRight className="absolute bottom-6 right-6 text-primary opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" size={20} />
        </button>

        {/* PathLearner - Half Width */}
        <button 
          onClick={() => navigate('/paths')} 
          className="col-span-1 group bg-white dark:bg-white/5 border border-walnut/10 dark:border-white/10 rounded-3xl p-5 shadow-sm dark:shadow-none hover:shadow-md hover:border-primary/30 dark:hover:border-primary/50 transition-all text-left active:scale-[0.98]"
        >
          <div className="p-3 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
            <Map size={20} strokeWidth={2.5} />
          </div>
          <h3 className="font-bold text-lg mb-1 text-walnut">Journeys</h3>
          <p className="text-xs text-walnut/50 dark:text-walnut/60 leading-relaxed line-clamp-2">
            Curated spiritual pathways.
          </p>
        </button>

        {/* Library - Half Width */}
        <button 
          onClick={() => navigate('/saved')} 
          className="col-span-1 group bg-white dark:bg-white/5 border border-walnut/10 dark:border-white/10 rounded-3xl p-5 shadow-sm dark:shadow-none hover:shadow-md hover:border-primary/30 dark:hover:border-primary/50 transition-all text-left active:scale-[0.98]"
        >
          <div className="p-3 bg-primary/10 dark:bg-primary/20 text-primary rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300">
            <Bookmark size={20} strokeWidth={2.5} />
          </div>
          <h3 className="font-bold text-lg mb-1 text-walnut">Library</h3>
          <p className="text-xs text-walnut/50 dark:text-walnut/60 leading-relaxed line-clamp-2">
            Verses you have saved.
          </p>
        </button>

      </section>
    </div>
  );
}