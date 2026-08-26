# Telegram Login implementation (TypeScript + Express + Prisma)

This branch adds a minimal Telegram Login integration that verifies the Telegram Login Widget payload server-side, creates or links a user, records consent, and issues JWT + refresh token.

Important: DO NOT commit secrets. Set the required environment variables before running.

Required env variables (see .env.example):
- DATABASE_URL
- TELEGRAM_BOT_TOKEN
- JWT_SECRET
- REFRESH_TOKEN_SECRET

Quickstart (local):
1. Copy .env.example -> .env and fill values.
2. npm install
3. npx prisma generate
4. npx prisma migrate dev --name init
5. npm run dev
6. Open public/telegram_login.html and use the Telegram widget (hosted locally on http://localhost:3000)

Note: The Telegram widget requires a domain registered with Telegram for your bot's settings in some cases. For local testing you can use @BotFather settings and the widget should work in the browser.
