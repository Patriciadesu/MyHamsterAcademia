require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

let MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI && MONGODB_URI.endsWith('/')) {
  MONGODB_URI += 'MyHamsterAcademia';
} else if (MONGODB_URI && !MONGODB_URI.includes('?')) {
  MONGODB_URI += '/MyHamsterAcademia';
}

const mockUsers = [
  // Starway
  { discordId: 'dummy_1', username: 'Alex Rivera', discriminator: '0001', role: 'admin', class: 'Starway', group: 'Alpha' },
  { discordId: 'dummy_2', username: 'Sarah Jenkins', discriminator: '0002', role: 'user', class: 'Starway', group: 'Beta' },
  { discordId: 'dummy_3', username: 'Emily Vance', discriminator: '0003', role: 'user', class: 'Starway', group: 'Alpha' },
  { discordId: 'dummy_4', username: 'Michael Chang', discriminator: '0004', role: 'user', class: 'Starway', group: 'Alpha' },
  { discordId: 'dummy_5', username: 'Sophia Martinez', discriminator: '0005', role: 'user', class: 'Starway', group: 'Beta' },
  { discordId: 'dummy_6', username: 'David Kim', discriminator: '0006', role: 'user', class: 'Starway', group: 'Beta' },
  { discordId: 'dummy_7', username: 'Olivia Rossi', discriminator: '0007', role: 'user', class: 'Starway', group: '' },
  { discordId: 'dummy_8', username: 'James Wilson', discriminator: '0008', role: 'user', class: 'Starway', group: '' },
  { discordId: 'dummy_9', username: 'Chloe Bennett', discriminator: '0009', role: 'user', class: 'Starway', group: '' },
  { discordId: 'dummy_10', username: 'Daniel Foster', discriminator: '0010', role: 'user', class: 'Starway', group: '' },
  { discordId: 'dummy_11', username: 'Mia Nguyen', discriminator: '0011', role: 'user', class: 'Starway', group: '' },
  { discordId: 'dummy_12', username: "Liam O'Connor", discriminator: '0012', role: 'user', class: 'Starway', group: '' },
  
  // NSC
  { discordId: 'dummy_13', username: 'Jordan Chen', discriminator: '0013', role: 'user', class: 'NSC', group: 'Gamma' },
  { discordId: 'dummy_14', username: 'Marcus Thorne', discriminator: '0014', role: 'user', class: 'NSC', group: 'Gamma' },
  { discordId: 'dummy_15', username: 'Isabella Schmidt', discriminator: '0015', role: 'user', class: 'NSC', group: 'Delta' },
  { discordId: 'dummy_16', username: 'Ethan Hunt', discriminator: '0016', role: 'user', class: 'NSC', group: 'Delta' },
  { discordId: 'dummy_17', username: 'Ava Patel', discriminator: '0017', role: 'user', class: 'NSC', group: 'Delta' },
  { discordId: 'dummy_18', username: 'William Davies', discriminator: '0018', role: 'user', class: 'NSC', group: '' },
  { discordId: 'dummy_19', username: 'Harper Moore', discriminator: '0019', role: 'user', class: 'NSC', group: '' },
  { discordId: 'dummy_20', username: 'Benjamin White', discriminator: '0020', role: 'user', class: 'NSC', group: '' },
  { discordId: 'dummy_21', username: 'Amelia Taylor', discriminator: '0021', role: 'user', class: 'NSC', group: '' },
  { discordId: 'dummy_22', username: 'Lucas Anderson', discriminator: '0022', role: 'user', class: 'NSC', group: '' },
  { discordId: 'dummy_23', username: 'Evelyn Thomas', discriminator: '0023', role: 'user', class: 'NSC', group: '' },
  { discordId: 'dummy_24', username: 'Mason Clark', discriminator: '0024', role: 'user', class: 'NSC', group: '' },
  
  // Staff
  { discordId: 'dummy_25', username: 'Admin Pat', discriminator: '0025', role: 'admin', class: 'Staff', group: 'Management' },
  { discordId: 'dummy_26', username: 'Mod Sarah', discriminator: '0026', role: 'admin', class: 'Staff', group: 'Moderation' },
  { discordId: 'dummy_27', username: 'Dev John', discriminator: '0027', role: 'admin', class: 'Staff', group: 'Engineering' },
  { discordId: 'dummy_28', username: 'Support Emma', discriminator: '0028', role: 'user', class: 'Staff', group: 'Community' },
  { discordId: 'dummy_29', username: 'Mod Kevin', discriminator: '0029', role: 'admin', class: 'Staff', group: 'Moderation' },
  
  // Unassigned
  { discordId: 'dummy_30', username: 'Newbie Bob', discriminator: '0030', role: 'user', class: '', group: '' },
  { discordId: 'dummy_31', username: 'Guest Alice', discriminator: '0031', role: 'user', class: '', group: '' },
  { discordId: 'dummy_32', username: 'Unknown User 1', discriminator: '0032', role: 'user', class: '', group: '' },
];

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    for (const u of mockUsers) {
      // Check if exists
      const exists = await User.findOne({ discordId: u.discordId });
      if (!exists) {
        // Provide optional class, if empty use undefined
        const userDoc = new User({
          discordId: u.discordId,
          username: u.username,
          discriminator: u.discriminator,
          role: u.role,
          class: u.class ? u.class : undefined,
          group: u.group
        });
        await userDoc.save();
        console.log(`Inserted ${u.username}`);
      }
    }
    console.log('Done bulk adding dummy users');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
