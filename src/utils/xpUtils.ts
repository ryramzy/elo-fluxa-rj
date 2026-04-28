export const getLevelName = (level: number) => {
  const names = ['Beginner', 'Explorer', 'Conversationalist', 'Rising Star', 'Fluent', 'Native Flow'];
  return names[level - 1] || 'Beginner';
};

export const getXPToNextLevel = (profile: any) => {
  if (!profile) return 0;

  const ranges = [
    { level: 1, min: 0, max: 499 },
    { level: 2, min: 500, max: 999 },
    { level: 3, min: 1000, max: 1999 },
    { level: 4, min: 2000, max: 2999 },
    { level: 5, min: 3000, max: 4999 },
  ];

  const current = ranges.find(r => r.level === profile.level);
  return current ? current.max - profile.xp : 0;
};

export const getXPProgress = (profile: any) => {
  if (!profile) return { current: 0, total: 100, percentage: 0 };

  const ranges = [
    { level: 1, min: 0, max: 499 },
    { level: 2, min: 500, max: 999 },
    { level: 3, min: 1000, max: 1999 },
    { level: 4, min: 2000, max: 2999 },
    { level: 5, min: 3000, max: 4999 },
  ];

  const current = ranges.find(r => r.level === profile.level);
  if (!current) return { current: 0, total: 100, percentage: 0 };

  const currentXP = profile.xp - current.min;
  const totalXP = current.max - current.min;
  const percentage = (currentXP / totalXP) * 100;

  return {
    current: currentXP,
    total: totalXP,
    percentage: Math.min(percentage, 100)
  };
};

export const canLevelUp = (profile: any) => {
  if (!profile) return false;
  
  const ranges = [
    { level: 1, max: 499 },
    { level: 2, max: 999 },
    { level: 3, max: 1999 },
    { level: 4, max: 2999 },
    { level: 5, max: 4999 },
  ];

  const current = ranges.find(r => r.level === profile.level);
  return current ? profile.xp >= current.max : false;
};
