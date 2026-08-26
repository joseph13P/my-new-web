import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authTelegramRouter from './routes/authTelegram';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/public', express.static('public'));
app.use('/api/auth/telegram', authTelegramRouter);

app.get('/', (_req, res) => {
  res.send('<a href="/public/telegram_login.html">Open Telegram Login demo</a>');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
