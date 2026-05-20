// src/lib/streak.js

export const recordDailyActivity = () => {
  // Get today's date in YYYY-MM-DD format based on local time
  const today = new Date().toLocaleDateString('en-CA'); 
  
  const lastActive = localStorage.getItem('MoodQuran_last_active');
  let streak = parseInt(localStorage.getItem('MoodQuran_streak') || '0', 10);

  // If already active today, do nothing but return current streak
  if (lastActive === today) {
    return streak;
  }

  // Check if active yesterday
  if (lastActive) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');

    if (lastActive === yesterdayStr) {
      streak += 1; // Streak continues!
    } else {
      streak = 1; // Streak broken, start over at 1
    }
  } else {
    streak = 1; 
  }

  
  localStorage.setItem('MoodQuran_last_active', today);
  localStorage.setItem('MoodQuran_streak', streak.toString());
  
  return streak;
};

export const getStreakData = () => {
  return {
    streak: parseInt(localStorage.getItem('MoodQuran_streak') || '0', 10),
    lastActive: localStorage.getItem('MoodQuran_last_active')
  };
};