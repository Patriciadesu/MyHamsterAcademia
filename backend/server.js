require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('./models/User');
const Group = require('./models/Group');
const ClassQueue = require('./models/ClassQueue');
const ShowState = require('./models/ShowState');

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

const ADMIN_GUILD_ID = process.env.ADMIN_GUILD_ID;
const ADMIN_ROLE_IDS = process.env.ADMIN_ROLE_IDS ? process.env.ADMIN_ROLE_IDS.split(',').map(id => id.trim()) : [];

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
  const discordLoginUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20email%20guilds.members.read`;
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

    // Check for admin role using guilds.members.read
    let role = 'user';
    if (ADMIN_GUILD_ID && ADMIN_ROLE_IDS.length > 0) {
      try {
        const memberResponse = await axios.get(`https://discord.com/api/users/@me/guilds/${ADMIN_GUILD_ID}/member`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        const memberData = memberResponse.data;
        const userRoles = memberData.roles || [];
        
        if (userRoles.some(r => ADMIN_ROLE_IDS.includes(r))) {
          role = 'admin';
        }
      } catch (err) {
        console.error('Error fetching guild member data:', err.response ? err.response.data : err.message);
        // If they are not in the server or request fails, they stay as 'user'
      }
    }

    let user = await User.findOne({ discordId: discordUser.id });
    if (!user) {
      user = new User({
        discordId: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar,
        email: discordUser.email,
        role: role,
        class: role === 'admin' ? 'Staff' : undefined
      });
      await user.save();
      console.log(`New user registered: ${user.username} with role ${role}`);
    } else {
      user.username = discordUser.username;
      user.discriminator = discordUser.discriminator;
      user.avatar = discordUser.avatar;
      user.email = discordUser.email;
      user.role = role; // Update role in case it changed
      if (role === 'admin') {
        user.class = 'Staff';
      }
      await user.save();
      console.log(`Existing user logged in: ${user.username} with role ${role}`);
    }

    const token = jwt.sign(
      { id: user.discordId, username: user.username, discriminator: user.discriminator, avatar: user.avatar, email: user.email, role: user.role }, 
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
      email: user.email,
      role: user.role,
      class: user.class,
      group: user.group
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/:id/group', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { group } = req.body;
    
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.group = group || '';
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update group' });
  }
});

app.put('/api/users/:id/class', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { class: newClass } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.class = newClass || undefined;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// Get all groups with populated users and queue
app.get('/api/groups', requireAdmin, async (req, res) => {
  try {
    const groups = await Group.find({}).populate('users', 'username avatar discordId discriminator').populate('queue', 'username avatar discordId discriminator');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get current saved queue for a class
app.get('/api/groups/queue/:class', requireAdmin, async (req, res) => {
  try {
    const targetClass = req.params.class;
    const saved = await ClassQueue.findOne({ class: targetClass });
    if (!saved) return res.json({ class: targetClass, queue: [] });
    res.json({ class: saved.class, queue: saved.queue, lastRandomized: saved.lastRandomized });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// Randomize group ORDER for a specific class (which group goes first, not users within group)
app.post('/api/groups/randomize-class', requireAdmin, async (req, res) => {
  try {
    const { class: targetClass } = req.body;
    if (!targetClass) return res.status(400).json({ error: 'class is required' });

    // Get all users in this class that have a group assigned
    const usersInClass = await User.find({
      class: targetClass,
      group: { $exists: true, $ne: '' }
    });

    if (usersInClass.length === 0) {
      return res.json({ class: targetClass, queue: [] });
    }

    // Collect distinct group names
    const groupNamesSet = new Set();
    for (const user of usersInClass) {
      groupNamesSet.add(user.group);
    }
    const groupNames = Array.from(groupNamesSet);

    // Fisher-Yates shuffle the GROUP names (group order)
    for (let i = groupNames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [groupNames[i], groupNames[j]] = [groupNames[j], groupNames[i]];
    }

    // Build result: ordered list of groups with their member count
    const result = groupNames.map((name, idx) => {
      const members = usersInClass.filter(u => u.group === name);
      return {
        position: idx + 1,
        name,
        memberCount: members.length,
      };
    });

    // Persist the result to ClassQueue
    await ClassQueue.findOneAndUpdate(
      { class: targetClass },
      { class: targetClass, queue: result, lastRandomized: new Date() },
      { upsert: true, new: true }
    );

    res.json({ class: targetClass, queue: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to randomize class queue' });
  }
});

// Show Management Routes

// Start show for a class (Admin only)
app.post('/api/show/start', requireAdmin, async (req, res) => {
  try {
    const { class: targetClass } = req.body;
    if (!targetClass) return res.status(400).json({ error: 'class is required' });

    // Verify there is a queue for this class
    const classQueue = await ClassQueue.findOne({ class: targetClass });
    if (!classQueue || classQueue.queue.length === 0) {
      return res.status(400).json({ error: 'No queue randomized for this class' });
    }

    // Reset show state
    await ShowState.deleteMany({});
    const newState = new ShowState({
      activeClass: targetClass,
      currentGroupIndex: 0,
      status: 'waiting_for_group'
    });
    await newState.save();

    res.json({ success: true, state: newState });
  } catch (err) {
    res.status(500).json({ error: 'Failed to start show' });
  }
});

// Get current show status (All users)
app.get('/api/show/status', async (req, res) => {
  try {
    const state = await ShowState.findOne({});
    if (!state) return res.json({ status: 'idle' });

    // Get current group info
    const classQueue = await ClassQueue.findOne({ class: state.activeClass });
    const currentGroup = classQueue ? classQueue.queue[state.currentGroupIndex] : null;

    res.json({
      ...state.toObject(),
      currentGroupName: currentGroup ? currentGroup.name : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch show status' });
  }
});

// Trigger timer (Group members only)
app.post('/api/show/trigger-timer', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ discordId: decoded.id });
    if (!user) return res.status(401).json({ error: 'User not found' });

    const state = await ShowState.findOne({});
    if (!state || state.status !== 'waiting_for_group') {
      return res.status(400).json({ error: 'Not waiting for group to start' });
    }

    // Verify user belongs to the current group
    const classQueue = await ClassQueue.findOne({ class: state.activeClass });
    const currentGroup = classQueue ? classQueue.queue[state.currentGroupIndex] : null;

    if (!currentGroup || user.group !== currentGroup.name || user.class !== state.activeClass) {
      return res.status(403).json({ error: 'You are not in the active group' });
    }

    state.status = 'timer_running';
    state.timerStartedAt = Date.now(); // Store as number (Unix timestamp)
    await state.save();

    res.json({ success: true, state });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger timer' });
  }
});

// Force trigger timer (Admin only - for testing)
app.post('/api/show/force-trigger-timer', requireAdmin, async (req, res) => {
  try {
    const state = await ShowState.findOne({});
    if (!state || state.status !== 'waiting_for_group') {
      return res.status(400).json({ error: 'Not waiting for group to start' });
    }

    state.status = 'timer_running';
    state.timerStartedAt = Date.now();
    await state.save();

    res.json({ success: true, state });
  } catch (err) {
    res.status(500).json({ error: 'Failed to force trigger timer' });
  }
});

// Move to next group (Admin only)
app.post('/api/show/next', requireAdmin, async (req, res) => {
  try {
    const state = await ShowState.findOne({});
    if (!state) return res.status(400).json({ error: 'No active show' });

    const classQueue = await ClassQueue.findOne({ class: state.activeClass });
    if (state.currentGroupIndex + 1 >= classQueue.queue.length) {
      return res.status(400).json({ error: 'No more groups in queue' });
    }

    state.currentGroupIndex += 1;
    state.status = 'waiting_for_group';
    state.timerStartedAt = null;
    await state.save();

    res.json({ success: true, state });
  } catch (err) {
    res.status(500).json({ error: 'Failed to move to next group' });
  }
});

// End show (Admin only)
app.post('/api/show/end', requireAdmin, async (req, res) => {
  try {
    await ShowState.deleteMany({});
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to end show' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
