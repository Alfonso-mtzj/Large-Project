require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await mongoose.connection.db.collection('users').drop();
  console.log('Collection dropped!');
  mongoose.disconnect();
}).catch(e => {
  console.log('Error:', e.message);
  mongoose.disconnect();
});
