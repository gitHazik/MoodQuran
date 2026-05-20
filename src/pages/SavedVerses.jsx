import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, Quote, Loader2, Play, Pause } from 'lucide-react';
import { supabase } from '../lib/supabase';

// SavedVerses page: fetches the user's saved verse records from Supabase,
// displays them in a library-style list, and allows listening to each verse
// via the AlQuran Cloud audio API.
export default function SavedVerses() {
  const navigate = useNavigate();
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeAudioId, setActiveAudioId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => { fetchSavedVerses(); return () => { if (audioRef.current) audioRef.current.pause(); }; }, []);

  const fetchSavedVerses = async () => {
    const { data, error } = await supabase.from('saved_verses').select('*').order('created_at', { ascending: false });
    if (!error && data) setVerses(data);
    setLoading(false);
  };

  const toggleAudio = async (reference, verseId) => {
    if (activeAudioId === verseId && audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
      else { audioRef.current.play(); setIsPlaying(true); } return;
    }
    if (audioRef.current) audioRef.current.pause();
    setActiveAudioId(verseId); setIsPlaying(true);

    const numbers = reference.match(/\d+/g);
    if (!numbers || numbers.length < 2) { setActiveAudioId(null); setIsPlaying(false); return; }
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

  return (
    <div className="flex flex-col h-full bg-transparent text-walnut overflow-y-auto scrollbar-hide relative">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />

      <header className="flex items-center gap-4 p-6 sticky top-0 z-20 bg-parchment/80 dark:bg-parchment/10 backdrop-blur-md border-b border-walnut/10 dark:border-white/10">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors bg-white/50 dark:bg-white/5 border border-walnut/10 dark:border-white/10">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-serif font-bold text-xl tracking-tight text-walnut">Library</h2>
      </header>

      <div className="p-6 space-y-6 pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-primary">
            <Loader2 className="animate-spin mb-3" size={36} strokeWidth={2.5} />
            <p className="text-xs font-bold uppercase tracking-widest text-primary/80">Opening vault...</p>
          </div>
        ) : verses.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-24 h-24 bg-white/50 dark:bg-white/5 border border-walnut/10 dark:border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Bookmark size={36} className="text-primary/40" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif font-bold text-2xl mb-2 text-walnut">Your vault is empty</h3>
            <button onClick={() => navigate('/mood')} className="mt-8 font-bold text-sm bg-walnut dark:bg-primary text-white px-8 py-3.5 rounded-full hover:bg-walnut/90 transition-all shadow-sm active:scale-95">
              Go to MoodChat
            </button>
          </div>
        ) : (
          <div className="space-y-8 mt-2">
            {verses.map((verse) => (
              <div key={verse.id} className="bg-white/90 dark:bg-white/5 backdrop-blur-sm border border-walnut/20 dark:border-white/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-primary/10 dark:bg-primary/20 text-primary text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                    When you felt: {verse.feeling}
                  </div>
                  <Quote size={20} className="text-walnut/10 dark:text-white/10" />
                </div>

                <p className="text-right text-2xl font-serif tracking-wide text-walnut/90 dark:text-walnut font-bold leading-loose mt-2">
                  {verse.arabic}
                </p>
                <p className="text-sm italic font-medium text-walnut/70 leading-relaxed mt-4 border-l-2 border-primary/30 pl-4">
                  "{verse.translation}"
                </p>
                
                <div className="flex flex-col gap-4 mt-6 pt-4 border-t border-walnut/10 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-primary/60">
                      {verse.reference}
                    </p>
                    <button 
                      onClick={() => toggleAudio(verse.reference, verse.id)}
                      className={`flex items-center gap-1.5 text-[10px] uppercase font-bold transition-all duration-300 px-4 py-2 rounded-full shadow-sm border ${activeAudioId === verse.id ? 'bg-primary text-white border-primary' : 'bg-parchment dark:bg-white/10 text-walnut border-walnut/10 dark:border-white/10 hover:bg-primary/10 hover:text-primary'}`}
                    >
                      {activeAudioId === verse.id && isPlaying ? <><Pause size={12} className="fill-current" /> Pause</> : activeAudioId === verse.id && !isPlaying ? <><Play size={12} className="fill-current" /> Resume</> : <><Play size={12} className="fill-current" /> Listen</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}