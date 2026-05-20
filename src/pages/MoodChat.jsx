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
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);

  const toggleAudio = async (reference, msgId) => {
    if (activeAudioId === msgId && audioRef.current) {
      if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); } 
      else { audioRef.current.play(); setIsPlaying(true); }
      return;
    }

    if (audioRef.current) audioRef.current.pause();
    setActiveAudioId(msgId);
    setIsPlaying(true);

    const bracketMatch = reference.match(/\[(.*?)\]/);
    if (!bracketMatch) { setActiveAudioId(null); setIsPlaying(false); return; }
    const numbers = bracketMatch[1].match(/\d+/g);
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

  const sendMessage = async (textToProcess) => {
    if (!textToProcess.trim() || isTyping) return;

    const userMessage = { id: Date.now(), sender: 'user', text: textToProcess };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    recordDailyActivity();

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-groq`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: textToProcess }] })
      });
      const data = await response.json();
      const aiResponse = JSON.parse(data.reply);
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: aiResponse.message, verse: aiResponse.verse, suggestedPath: aiResponse.suggestedPath, originalPrompt: textToProcess }]);
    } catch (error) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', text: "Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full bg-transparent text-walnut relative">
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-primary/10 to-transparent -z-10 pointer-events-none" />

      <header className="flex items-center gap-4 p-4 sticky top-0 z-20 bg-parchment/80 dark:bg-parchment/10 backdrop-blur-md border-b border-walnut/5 dark:border-white/5">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors bg-white/50 dark:bg-white/5 border border-walnut/10 dark:border-white/10">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-serif font-bold text-lg leading-tight flex items-center gap-1.5 text-walnut">
            <Sparkles size={16} className="text-primary" /> MoodQuran Chat
          </h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 pb-10 mt-8">
            <div className="w-16 h-16 rounded-[2rem] bg-white/50 dark:bg-white/5 border border-walnut/10 dark:border-white/10 flex items-center justify-center shadow-sm dark:shadow-none">
              <Sparkles size={32} className="text-primary/60" />
            </div>
            <div className="text-center space-y-2 mb-2">
              <p className="font-serif font-bold text-walnut text-2xl tracking-tight">Spiritual Companion</p>
              <p className="text-sm text-walnut/60 dark:text-walnut/70 max-w-[260px] mx-auto leading-relaxed">
                How is your heart today? Select a prompt below or type your own feeling.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 justify-center max-w-[320px]">
              {suggestedPrompts.map((prompt, i) => (
                <button key={i} onClick={() => sendMessage(prompt)} className="text-xs font-bold px-4 py-2.5 rounded-full border border-walnut/10 dark:border-white/10 bg-white/80 dark:bg-white/5 text-walnut/80 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all shadow-sm dark:shadow-none active:scale-95">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] rounded-3xl p-5 text-sm leading-relaxed border ${msg.sender === 'user' ? 'bg-walnut dark:bg-primary border-transparent text-parchment dark:text-white rounded-br-sm shadow-md' : 'bg-white/90 dark:bg-white/10 backdrop-blur-sm border-walnut/10 dark:border-white/10 text-walnut rounded-bl-sm shadow-sm'}`}>
              <p>{msg.text}</p>
              
              {msg.verse && (
                <div className="mt-5 pt-4 border-t border-walnut/10 dark:border-white/10 space-y-3">
                  <div className="flex justify-between items-center mb-3">
                    <button onClick={() => toggleAudio(msg.verse.reference, msg.id)} className={`flex items-center gap-1.5 text-[10px] uppercase font-bold transition-all duration-300 px-3 py-1.5 rounded-full border ${activeAudioId === msg.id ? 'bg-primary text-white border-primary' : 'bg-parchment/50 dark:bg-white/5 border-walnut/10 dark:border-white/10 text-walnut hover:text-primary'}`}>
                      {activeAudioId === msg.id && isPlaying ? <><Pause size={12} className="fill-current"/> Pause</> : <><Play size={12} className="fill-current"/> Listen</>}
                    </button>
                    <button onClick={async (e) => {
                        const btn = e.currentTarget; btn.innerHTML = 'Saving...'; btn.classList.add('text-primary'); 
                        try {
                          const payload = { arabic: msg.verse.arabic, translation: msg.verse.translation, reference: msg.verse.reference, feeling: msg.originalPrompt || "Felt overwhelmed" };
                          const { data: { user } } = await supabase.auth.getUser();
                          if (user) payload.user_id = user.id;
                          await supabase.from('saved_verses').insert([payload]);
                          btn.innerHTML = 'Saved!';
                        } catch (err) { btn.innerHTML = 'Error'; }
                      }} className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-walnut/50 dark:text-walnut/60 hover:text-primary transition-colors">
                      <Bookmark size={14} /> Save
                    </button>
                  </div>
                  <p className="text-right text-xl font-serif tracking-wide text-walnut font-bold leading-loose">{msg.verse.arabic}</p>
                  <p className="text-sm italic text-walnut/70 font-medium">"{msg.verse.translation}"</p>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-primary mt-1">{msg.verse.reference}</p>
                </div>
              )}

              {msg.suggestedPath && (
                <button onClick={() => navigate('/paths')} className="mt-4 w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs py-3 px-4 rounded-2xl transition-all flex items-center justify-center gap-1 active:scale-95">
                  Enter '{msg.suggestedPath}' Pathway →
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && <div className="flex items-center gap-1 bg-white/80 dark:bg-white/10 border border-walnut/10 dark:border-white/10 px-5 py-4 rounded-full rounded-bl-sm text-xs text-walnut/60 font-bold w-max animate-pulse shadow-sm">Consulting scripture...</div>}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="p-4 bg-parchment/80 dark:bg-parchment/10 backdrop-blur-md border-t border-walnut/5 dark:border-white/5 flex gap-2 items-center">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Share your feeling..." className="flex-1 bg-white/80 dark:bg-white/5 border border-walnut/10 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm dark:shadow-none text-walnut" />
        <button type="submit" disabled={!input.trim() || isTyping} className="p-3.5 bg-walnut dark:bg-primary disabled:opacity-50 text-white rounded-2xl transition-all shadow-sm active:scale-95">
          <Send size={18} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}