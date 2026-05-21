
# MoodQuran

I built **MoodQuran**, an AI-powered application designed to bridge the gap between mental well-being and faith. In a fast-paced world, finding the exact verse that speaks to immediate emotional distress—like burnout or anxiety—can be overwhelming. MoodQuran removes this friction. Using Groq's lightning-fast LLM inference within Supabase Edge Functions, the app analyzes a user's emotional state via an interactive "MoodChat" and instantly curates highly relevant Quranic verses. To guarantee absolute text authenticity, the AI never hallucinates scripture; instead, it generates verse keys to fetch verified Arabic text, translations, and recitation audio directly from the official Quran Foundation APIs. Beyond chat, the app fosters active reflection (Tadabbur) through structured 7-day learning "Journeys" and private journaling, seamlessly syncing saved verses and notes back to the user’s main QF account. Built with React and Tailwind, MoodQuran transforms moments of distress into profound spiritual connection.

## ✨ Features

- **AI MoodChat:** Interactive chat that analyzes your emotional state to curate relevant Quranic verses instantly.
- **Zero Hallucinations:** The AI strictly generates verse keys. All Arabic text, translations, and recitation audio are securely fetched from the official Quran Foundation APIs.
- **Active Reflection (Tadabbur):** Dive deeper with structured 7-day learning "Journeys" and dedicated private journaling spaces.
- **Seamless Syncing:** Automatically syncs your saved verses and personal notes directly to your main Quran Foundation account.

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend & Infrastructure:** Supabase (Edge Functions)
- **AI Integration:** Groq (LLM Inference)
- **External APIs:** Quran Foundation APIs (Verses, Translations, Audio, Bookmarks, Notes)
