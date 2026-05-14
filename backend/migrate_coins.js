const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

let MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI.endsWith('/')) {
  MONGODB_URI += 'MyHamsterAcademia';
} else if (!MONGODB_URI.includes('?')) {
  MONGODB_URI += '/MyHamsterAcademia';
}

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('Connected');
  const res = await User.updateMany({ coin: { $in: [0, null] } }, { $set: { coin: 1000 } });
  console.log('Updated users:', res);
  process.exit(0);
});
