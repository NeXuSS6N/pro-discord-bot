export function getXpForLevel(level) {
  let xp = 0;
  for (let l = 0; l < level; l += 1) {
    xp += 5 * l * l + 50 * l + 100;
  }
  return xp;
}

export function getLevelFromXp(totalXp) {
  let level = 0;
  while (totalXp >= getXpForLevel(level + 1)) {
    level += 1;
  }
  return level;
}

export function getProgress(totalXp) {
  const level = getLevelFromXp(totalXp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const intoLevel = totalXp - currentLevelXp;
  const needed = Math.max(1, nextLevelXp - currentLevelXp);
  const percent = Math.min(100, Math.max(0, Math.floor((intoLevel / needed) * 100)));
  return { level, currentLevelXp, nextLevelXp, intoLevel, needed, percent };
}

export function buildProgressBar(percent, width = 20) {
  const filled = Math.round((percent / 100) * width);
  const empty = Math.max(0, width - filled);
  return `[#${'█'.repeat(filled)}${'—'.repeat(empty)}] ${percent}%`;
}


