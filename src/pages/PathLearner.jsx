import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Lock, Play, Pause, Send, Map, CircleDot, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { recordDailyActivity } from '../lib/streak';
import { pathways } from '../data/paths';

export default function PathLearner() {
  const navigate = useNavigate();
  const [activePathId, setActivePathId] = useState('anxiety');
  
  
  const [completedReflections, setCompletedReflections] = useState({});
  
  const [expandedDay, setExpandedDay] = useState(null);
  const [reflectionInput, setReflectionInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeAudioId, setActiveAudioId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const activePath = pathways[activePathId];

  useEffect(() => {
    fetchProgress();
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [activePathId]);

  const fetchProgress = async () => {
    
    const { data } = await supabase
      .from('path_reflections')
      .select('day_number, reflection_text')
      .eq('path_id', activePathId);
      
    if (data) {
      const reflectionsMap = {};
      data.forEach(entry => {
        reflectionsMap[entry.day_number] = entry.reflection_text;
      });
      setCompletedReflections(reflectionsMap);
    }
    setExpandedDay(null);
  };

  const toggleAudio = async (reference, dayNumber) => {
    if (activeAudioId === dayNumber && audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); }
      else { audioRef.current.play(); setIsPlaying(true); }
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    setActiveAudioId(dayNumber);
    setIsPlaying(true);

    const numbers = reference.match(/\d+/g);
    if (!numbers || numbers.length < 2) return;
    const ayahKey = `${numbers[0]}:${numbers[1]}`;

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahKey}/ar.alafasy`);
      const json = await res.json();
      if (json.data && json.data.audio) {
        audioRef.current = new Audio(json.data.audio);
        audioRef.current.onended = () => { setIsPlaying(false); setActiveAudioId(null); };
        await audioRef.current.play();
      }
    } catch (error) { setActiveAudioId(null); setIsPlaying(false); }
  };

  const completeDay = async (dayNumber) => {
    if (!reflectionInput.trim()) return alert("Please write a short reflection.");
    setIsSaving(true);
    try {
      const payload = { path_id: activePathId, day_number: dayNumber, reflection_text: reflectionInput };
      const { data: { user } } = await supabase.auth.getUser();
      if (user) payload.user_id = user.id;
      
      await supabase.from('path_reflections').insert([payload]);
      recordDailyActivity();
      
      
      setCompletedReflections(prev => ({ ...prev, [dayNumber]: reflectionInput }));
      setReflectionInput('');
      

    } catch (error) { 
      alert("Error saving progress."); 
    } finally { 
      setIsSaving(false); 
    }
  };

  
  const firstUncompletedDay = activePath.days.find(d => !completedReflections[d.dayNumber])?.dayNumber || 999;

  return (
    <div className="flex flex-col h-full bg-transparent text-walnut relative overflow-hidden">
      
      
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />


      <header className="shrink-0 flex items-center gap-4 p-6 z-20 bg-parchment/80 dark:bg-parchment/10 backdrop-blur-md border-b border-walnut/10 dark:border-white/10">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors bg-white/50 dark:bg-white/5 border border-walnut/10 dark:border-white/10">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-serif font-bold text-xl tracking-tight text-walnut">Journeys</h2>
        </div>
      </header>

      
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 z-0">
        
        
        <div className="flex gap-2 px-6 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {Object.values(pathways).map(path => (
            <button key={path.id} onClick={() => setActivePathId(path.id)} className={`whitespace-nowrap px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ${activePathId === path.id ? 'bg-primary text-white shadow-md shadow-primary/20 dark:shadow-none scale-105' : 'bg-white dark:bg-white/5 border border-walnut/10 dark:border-white/10 text-walnut/60 dark:text-walnut/70 hover:text-walnut hover:border-primary/30 hover:bg-primary/5'}`}>
              {path.title}
            </button>
          ))}
        </div>

        
        <div className="px-6 mt-8 mb-10">
          <span className="text-primary font-bold tracking-widest text-[10px] uppercase mb-2 block">{activePath.totalDays}-Day Module</span>
          <h1 className="text-3xl font-serif font-bold mb-3 tracking-tight text-walnut leading-tight">{activePath.title}</h1>
          <p className="text-sm text-walnut/60 dark:text-walnut/70 leading-relaxed max-w-[280px]">{activePath.description}</p>
        </div>

        
        <div className="px-6">
          {activePath.days.map((day, index) => {
            const savedReflection = completedReflections[day.dayNumber];
            const isCompleted = !!savedReflection;
            const isLocked = day.dayNumber > firstUncompletedDay;
            const isCurrent = day.dayNumber === firstUncompletedDay;
            const isExpanded = expandedDay === day.dayNumber;
            const isLast = index === activePath.days.length - 1;

            return (
              <div key={day.dayNumber} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <button onClick={() => { if (!isLocked) setExpandedDay(isExpanded ? null : day.dayNumber); }} className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${isCompleted ? 'bg-primary text-white shadow-md shadow-primary/30 dark:shadow-none' : isCurrent ? 'bg-white dark:bg-transparent border-2 border-primary text-primary shadow-sm scale-110' : 'bg-white/50 dark:bg-white/5 border border-walnut/10 dark:border-white/10 text-walnut/30 dark:text-walnut/40'}`}>
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : isCurrent ? <CircleDot size={18} strokeWidth={2.5} className="animate-pulse" /> : <Lock size={16} />}
                  </button>
                  {!isLast && <div className={`w-[2px] flex-1 my-1 transition-colors duration-500 ${isCompleted ? 'bg-primary/40' : 'bg-walnut/10 dark:bg-white/10'}`} />}
                </div>

                <div className={`flex-1 pb-8 ${isLast ? 'pb-2' : ''}`}>
                  <div className={`cursor-pointer transition-all duration-300 ${isLocked ? 'opacity-40' : 'opacity-100 hover:translate-x-1'}`} onClick={() => { if (!isLocked) setExpandedDay(isExpanded ? null : day.dayNumber); }}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isCompleted ? 'text-primary/70' : isCurrent ? 'text-primary' : 'text-walnut/40 dark:text-walnut/50'}`}>Day {day.dayNumber}</p>
                    <h3 className={`font-serif font-bold text-xl tracking-tight ${isCurrent ? 'text-walnut' : 'text-walnut/70'}`}>{day.title}</h3>
                  </div>

                  <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      
                      <div className="bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-walnut/20 dark:border-white/10 rounded-3xl p-6 shadow-sm dark:shadow-none relative">
                        <button onClick={() => toggleAudio(day.reference, day.dayNumber)} className={`absolute -top-3 right-6 flex items-center gap-1.5 text-[10px] uppercase font-bold transition-all duration-300 px-4 py-1.5 rounded-full shadow-sm border border-white dark:border-transparent ${activeAudioId === day.dayNumber ? 'bg-primary text-white scale-105' : 'bg-parchment dark:bg-white/10 text-walnut border-walnut/10 dark:border-white/10 hover:bg-primary/10 hover:text-primary'}`}>
                          {activeAudioId === day.dayNumber && isPlaying ? <><Pause size={12} className="fill-current"/> Pause</> : <><Play size={12} className="fill-current"/> Listen</>}
                        </button>
                        <p className="text-right text-2xl font-serif tracking-wide font-bold leading-loose mt-2 text-walnut/90 dark:text-walnut">{day.arabic}</p>
                        <p className="text-sm italic font-medium mt-4 text-walnut/70 leading-relaxed">"{day.translation}"</p>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-primary/60 mt-4 pt-3 border-t border-walnut/10 dark:border-white/10">{day.reference}</p>
                      </div>

                      
                      {isCompleted ? (
                        <div className="mt-4 bg-primary/5 border border-primary/20 rounded-2xl p-5 relative overflow-hidden">
                          <Quote size={80} className="absolute -top-4 -left-4 text-primary opacity-5" />
                          <div className="flex items-center gap-2 mb-3">
                            <Check size={16} className="text-primary" strokeWidth={3} />
                            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Your Reflection</p>
                          </div>
                          <p className="text-sm leading-relaxed text-walnut/80 dark:text-walnut/90 relative z-10 pl-2 border-l-2 border-primary/30">
                            {savedReflection}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          <div className="bg-white/50 dark:bg-white/5 border border-walnut/10 dark:border-white/10 rounded-2xl p-4 shadow-sm dark:shadow-none">
                            <p className="text-xs font-medium leading-relaxed text-walnut/80 dark:text-walnut/90">
                              <strong className="text-primary block mb-1">Reflect:</strong> {day.prompt}
                            </p>
                          </div>
                          <textarea 
                            value={reflectionInput} 
                            onChange={(e) => setReflectionInput(e.target.value)} 
                            placeholder="Tap to write your thoughts..." 
                            className="w-full bg-white dark:bg-white/5 border border-walnut/10 dark:border-white/10 rounded-2xl p-4 text-sm min-h-[100px] focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 resize-none shadow-inner dark:shadow-none text-walnut" 
                          />
                          <button onClick={() => completeDay(day.dayNumber)} disabled={!reflectionInput.trim() || isSaving} className="w-full bg-walnut dark:bg-primary hover:bg-walnut/90 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all flex justify-center items-center gap-2 shadow-sm active:scale-[0.98]">
                            {isSaving ? "Saving..." : "Lock in Reflection"} {!isSaving && <Send size={16} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}