import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Bookmark, Play, Pause } from 'lucide-react';
import { recordDailyActivity } from '../lib/streak';
import { supabase } from '../lib/supabase';

export default function MoodChat() {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  

  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  

  const [activeAudioId, setActiveAudioId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const suggestedPrompts = [
    "I feel overwhelmed with work.",
    "I am anxious about my future.",
    "I need a reminder to be patient.",
    "I am feeling grateful today."
  ];


  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const toggleAudio = async (reference, id) => {
    if (activeAudioId === id && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }


    if (audioRef.current) audioRef.current.pause();
    setActiveAudioId(id);
    setIsPlaying(true);

    const numbers = reference.match(/\d+/g);
    if (!numbers || numbers.length < 2) {
      console.error("Audio error: Could not find surah/verse numbers");
      setActiveAudioId(null);
      setIsPlaying(false);
      return;
    }

    const ayahKey = `${numbers[0]}:${numbers[1]}`;

    try {
      const res = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahKey}/ar.alafasy`);
      const json = await res.json();
      
      if (json.data?.audio) {
        audioRef.current = new Audio(json.data.audio);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setActiveAudioId(null);
        };
        await audioRef.current.play();
      } else {
        throw new Error("No audio available");
      }
    } catch (err) {
      console.error("Playback failed:", err);
      setActiveAudioId(null);
      setIsPlaying(false);
    }
  };

  const sendMessage = async (prompt) => {
    if (!prompt.trim() || isTyping) return;


    const userMessage = { id: Date.now(), sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    
    recordDailyActivity();

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-groq`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` 
        },
        body: JSON.stringify({ 
          messages: [{ role: "user", content: prompt }] 
        })
      });

      const data = await response.json();
      const aiResponse = JSON.parse(data.reply);

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: aiResponse.message, 
        verse: aiResponse.verse, 
        suggestedPath: aiResponse.suggestedPath, 
        originalPrompt: prompt 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        sender: 'bot', 
        text: "I'm having trouble connecting right now. Please try again." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full bg-transparent text-walnut relative">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-primary/10 to-transparent -z-10" />

      
      <header className="flex items-center gap-4 p-4 sticky top-0 z-20 bg-parchment/80 dark:bg-parchment/10 backdrop-blur-md border-b border-walnut/5 dark:border-white/5">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors bg-white/50 dark:bg-white/5 border border-walnut/10 dark:border-white/10"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-serif font-bold text-lg flex items-center gap-2">
          <Sparkles size={16} className="text-primary" /> MoodQuran Chat
        </h2>
      </header>

      
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 pb-10 mt-8">
            <div className="w-16 h-16 rounded-[2rem] bg-white/50 dark:bg-white/5 border border-walnut/10 dark:border-white/10 flex items-center justify-center shadow-sm">
              <Sparkles size={32} className="text-primary/60" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-serif font-bold text-walnut text-2xl">Spiritual Companion</p>
              <p className="text-sm text-walnut/60 dark:text-walnut/70">How is your heart today?</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-[300px]">
              {suggestedPrompts.map((p, i) => (
                <button key={i} onClick={() => sendMessage(p)} className="text-xs font-bold px-4 py-2 rounded-full border border-walnut/10 bg-white/80 dark:bg-white/5 text-walnut/80 hover:border-primary/30 transition-all shadow-sm active:scale-95">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-3xl p-5 text-sm leading-relaxed border ${msg.sender === 'user' ? 'bg-walnut dark:bg-primary border-transparent text-parchment rounded-br-sm shadow-md' : 'bg-white/90 dark:bg-white/10 backdrop-blur-sm border-walnut/10 text-walnut rounded-bl-sm shadow-sm'}`}>
              <p>{msg.text}</p>
              
              {msg.verse && (
                <div className="mt-5 pt-4 border-t border-walnut/10 dark:border-white/10 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <button 
                      onClick={() => toggleAudio(msg.verse.reference, msg.id)} 
                      className={`flex items-center gap-1.5 text-[10px] uppercase font-bold transition-all px-3 py-1 rounded-full border ${activeAudioId === msg.id ? 'bg-primary text-white border-primary' : 'bg-white/50 border-walnut/10'}`}
                    >
                      {activeAudioId === msg.id && isPlaying ? <Pause size={12} className="fill-current"/> : <Play size={12} className="fill-current"/>}
                      {activeAudioId === msg.id && isPlaying ? "Pause" : "Listen"}
                    </button>
                    <button onClick={async (e) => {
                      e.target.innerText = "Saving...";
                      const payload = { 
                        arabic: msg.verse.arabic, 
                        translation: msg.verse.translation, 
                        reference: msg.verse.reference, 
                        feeling: msg.originalPrompt || "..." 
                      };
                      await supabase.from('saved_verses').insert([payload]);
                      e.target.innerText = "Saved!";
                    }} className="text-[10px] uppercase font-bold text-walnut/50 hover:text-primary">
                      <Bookmark size={14} className="inline mr-1"/> Save
                    </button>
                  </div>
                  <p className="text-right text-xl font-serif font-bold text-walnut leading-relaxed">{msg.verse.arabic}</p>
                  <p className="text-sm italic text-walnut/70">"{msg.verse.translation}"</p>
                  <p className="text-[10px] uppercase font-bold text-primary mt-1">{msg.verse.reference}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-xs text-walnut/50 ml-4 animate-pulse">Reflecting...</div>}
        <div ref={chatEndRef} />
      </div>

      
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-4 border-t border-walnut/5 bg-parchment/80 backdrop-blur-md flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Share your heart..." 
          className="flex-1 bg-white/50 border border-walnut/10 rounded-2xl px-5 py-3 text-sm focus:outline-none" 
        />
        <button disabled={!input.trim() || isTyping} className="p-3 bg-walnut text-white rounded-2xl active:scale-95 transition-transform">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}