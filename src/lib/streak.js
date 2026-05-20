export const recordDailyActivity = () => {
  
  const today = new Date().toLocaleDateString('en-CA'); 
  
  const lastActive = localStorage.getItem('MoodQuran_last_active');
  let streak = parseInt(localStorage.getItem('MoodQuran_streak') || '0', 10);

  
  if (lastActive === today) {
    return streak;
  }

  
  if (lastActive) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');

    if (lastActive === yesterdayStr) {
      streak += 1; 
    } else {
      streak = 1; 
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