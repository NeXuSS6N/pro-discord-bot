import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import flash from 'connect-flash';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';
import { prisma } from '../lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function startWebServer(botClient) {
  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use('/static', express.static(path.join(__dirname, 'static')));

  app.use(helmet());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    session({
      secret: config.web.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false },
    })
  );
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (e) {
      done(e);
    }
  });

  passport.use(
    new DiscordStrategy(
      {
        clientID: config.discord.clientId,
        clientSecret: config.discord.clientSecret,
        callbackURL: `${config.web.baseUrl}/auth/callback`,
        scope: ['identify', 'guilds'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const existing = await prisma.user.findUnique({ where: { discordId: profile.id } });
          const data = {
            discordId: profile.id,
            username: profile.username,
            discriminator: profile.discriminator ?? null,
            avatar: profile.avatar ?? null,
          };
          const user = existing
            ? await prisma.user.update({ where: { id: existing.id }, data })
            : await prisma.user.create({ data });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  function ensureAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
  }

  app.get('/', (req, res) => {
    res.render('home', { user: req.user, botUser: botClient.user });
  });

  app.get('/login', passport.authenticate('discord'));
  app.get('/auth/callback', passport.authenticate('discord', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/dashboard');
  });
  app.get('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  });

  app.get('/dashboard', ensureAuth, async (req, res) => {
    const guilds = botClient.guilds.cache.map((g) => ({ id: g.id, name: g.name, iconUrl: g.iconURL() }));
    res.render('dashboard', { user: req.user, botUser: botClient.user, guilds });
  });

  app.get('/guild/:id', ensureAuth, async (req, res) => {
    const guild = botClient.guilds.cache.get(req.params.id);
    if (!guild) return res.redirect('/dashboard');
    const settings = await prisma.guildSettings.findUnique({ where: { guildId: guild.id } });
    const existingConfigs = await prisma.commandConfig.findMany({ where: { guildId: guild.id } });
    const existingByName = new Map(existingConfigs.map((c) => [c.name, c]));
    const allNames = Array.from(botClient.commands.keys()).sort();
    const commandConfigs = allNames.map((name) => existingByName.get(name) || { name, enabled: true, cooldownSeconds: 0, requiredRoleId: null, channelId: null });
    res.render('guild', { user: req.user, botUser: botClient.user, guild, settings, commandConfigs });
  });

  app.post('/guild/:id/settings', ensureAuth, async (req, res) => {
    const guild = botClient.guilds.cache.get(req.params.id);
    if (!guild) return res.redirect('/dashboard');
    const data = {
      locale: req.body.locale || undefined,
      welcomeChannelId: req.body.welcomeChannelId || null,
      logChannelId: req.body.logChannelId || null,
      welcomeEnabled: req.body.welcomeEnabled === 'on',
      economyEnabled: req.body.economyEnabled === 'on',
      moderationEnabled: req.body.moderationEnabled === 'on',
      welcomeMessage: req.body.welcomeMessage || undefined,
      dailyRewardAmount: Number(req.body.dailyRewardAmount || 250),
    };
    const existing = await prisma.guildSettings.findUnique({ where: { guildId: guild.id } });
    if (existing) await prisma.guildSettings.update({ where: { id: existing.id }, data });
    else await prisma.guildSettings.create({ data: { guildId: guild.id, ...data } });
    req.flash('success', 'Settings saved');
    res.redirect(`/guild/${guild.id}`);
  });

  app.post('/guild/:id/commands', ensureAuth, async (req, res) => {
    const guild = botClient.guilds.cache.get(req.params.id);
    if (!guild) return res.redirect('/dashboard');
    const allNames = Array.from(botClient.commands.keys());
    for (const name of allNames) {
      const enabled = req.body[`enabled_${name}`] === 'on';
      const cooldownSeconds = Number(req.body[`cooldownSeconds_${name}`] || 0);
      const requiredRoleId = (req.body[`requiredRoleId_${name}`] || '').trim() || null;
      const channelId = (req.body[`channelId_${name}`] || '').trim() || null;
      const data = { name, enabled, cooldownSeconds, requiredRoleId, channelId };
      const existing = await prisma.commandConfig.findUnique({ where: { guildId_name: { guildId: guild.id, name } } });
      if (existing) await prisma.commandConfig.update({ where: { id: existing.id }, data });
      else await prisma.commandConfig.create({ data: { guildId: guild.id, ...data } });
    }
    req.flash('success', 'Commands updated');
    res.redirect(`/guild/${guild.id}`);
  });

  app.listen(config.web.port, () => {
    console.log(`Web server running at ${config.web.baseUrl}`);
  });
}


