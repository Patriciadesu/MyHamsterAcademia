require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_CALLBACK_URL;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://api.questcity.cloud/myhamsteracademia';
let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env");
} else {
  if (MONGODB_URI.endsWith('/')) {
    MONGODB_URI += 'MyHamsterAcademia';
  } else if (!MONGODB_URI.includes('?')) {
    // If it doesn't end with / and doesn't have query params, append /MyHamsterAcademia
    MONGODB_URI += '/MyHamsterAcademia';
  }
  
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
}

app.get('/api/auth/discord/login', (req, res) => {
  const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email`;
  res.redirect(discordLoginUrl);
});

app.get('/api/auth/discord/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No code provided');
  }

  try {
    const params = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    });

    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = tokenResponse.data;

    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const discordUser = userResponse.data;

    let user = await User.findOne({ discordId: discordUser.id });
    if (!user) {
      user = new User({
        discordId: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar,
        email: discordUser.email
      });
      await user.save();
      console.log(`New user registered: ${user.username}`);
    } else {
      user.username = discordUser.username;
      user.discriminator = discordUser.discriminator;
      user.avatar = discordUser.avatar;
      user.email = discordUser.email;
      await user.save();
      console.log(`Existing user logged in: ${user.username}`);
    }

    const token = jwt.sign(
      { id: discordUser.id, username: discordUser.username, discriminator: discordUser.discriminator, avatar: discordUser.avatar, email: discordUser.email }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.redirect(`${FRONTEND_URL}/main?token=${token}`);
  } catch (error) {
    console.error('Discord OAuth Error:', error.response ? error.response.data : error.message);
    res.redirect(`${FRONTEND_URL}/?error=discord_auth_failed`);
  }
});

app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Always fetch latest data from DB to ensure it's up to date
    const user = await User.findOne({ discordId: decoded.id });
    if (!user) return res.status(404).json({ error: 'User not found in DB' });
    
    res.json({
      id: user.discordId,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
      email: user.email
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
