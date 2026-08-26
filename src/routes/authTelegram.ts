import express from 'express';
import { verifyTelegramAuth } from '../lib/telegramVerify';
import { PrismaClient } from '@prisma/client';
import { createAccessToken, createRefreshTokenHash } from '../lib/jwt';
import crypto from 'crypto';

const prisma = new PrismaClient();
const router = express.Router();

// POST /api/auth/telegram
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.hash || !payload.auth_date) {
      return res.status(400).send('Missing required Telegram payload fields');
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) return res.status(500).send('Server misconfigured');

    const ok = verifyTelegramAuth(payload, botToken, { maxAgeSeconds: 300 });
    if (!ok) return res.status(401).send('Invalid Telegram auth payload');

    const telegramId = BigInt(payload.id);
    const now = new Date();

    // Find or create TelegramAccount
    let t = await prisma.telegramAccount.findUnique({ where: { telegramId } });
    let userId: string | null = null;

    if (t) {
      // update lastAuthAt and fields
      await prisma.telegramAccount.update({
        where: { id: t.id },
        data: {
          username: payload.username || null,
          firstName: payload.first_name || null,
          lastName: payload.last_name || null,
          photoUrl: payload.photo_url || null,
          lastAuthAt: now,
          consentAt: now,
          rawPayload: payload
        }
      });
      userId = t.userId ?? null;
    } else {
      // Optionally link to an existing user by email if provided and desired.
      // For now create a user-less telegram account and a corresponding user.
      const user = await prisma.user.create({ data: {} });
      userId = user.id;
      t = await prisma.telegramAccount.create({
        data: {
          userId,
          telegramId,
          username: payload.username || null,
          firstName: payload.first_name || null,
          lastName: payload.last_name || null,
          photoUrl: payload.photo_url || null,
          lastAuthAt: now,
          consentAt: now,
          rawPayload: payload
        }
      });
    }

    // Issue tokens
    if (!userId) return res.status(500).send('No associated user');

    const accessToken = createAccessToken({ userId });
    const refreshToken = crypto.randomBytes(48).toString('hex');
    const refreshHash = createRefreshTokenHash(refreshToken);

    await prisma.refreshToken.create({ data: { userId, tokenHash: refreshHash } });

    return res.json({ accessToken, refreshToken, userId });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal error');
  }
});

export default router;
