import { prisma } from './db.js';

const XP_COOLDOWN_SECONDS = 60;
const MIN_XP = 15;
const MAX_XP = 25;

const userCooldowns = new Map();

export async function maybeAwardXp(discordUserId) {
  const last = userCooldowns.get(discordUserId) || 0;
  const now = Date.now();
  if (now - last < XP_COOLDOWN_SECONDS * 1000) return null;
  userCooldowns.set(discordUserId, now);

  let user = await prisma.user.findUnique({ where: { discordId: discordUserId } });
  if (!user) user = await prisma.user.create({ data: { discordId: discordUserId, username: 'Unknown' } });
  let profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile) profile = await prisma.profile.create({ data: { userId: user.id } });

  const gained = Math.floor(Math.random() * (MAX_XP - MIN_XP + 1)) + MIN_XP;
  const updated = await prisma.profile.update({ where: { id: profile.id }, data: { xp: profile.xp + gained } });
  return { gained, total: updated.xp };
}


