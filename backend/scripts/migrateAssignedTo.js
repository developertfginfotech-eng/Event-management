require('dotenv').config();
const mongoose = require('mongoose');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  const leads = mongoose.connection.db.collection('leads');

  const wrapResult = await leads.updateMany(
    { assignedTo: { $exists: true, $ne: null, $not: { $type: 'array' } } },
    [{ $set: { assignedTo: ['$assignedTo'] } }]
  );
  console.log(`Wrapped ${wrapResult.modifiedCount} leads`);

  const nullResult = await leads.updateMany(
    { $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }] },
    { $set: { assignedTo: [] } }
  );
  console.log(`Nulls converted: ${nullResult.modifiedCount}`);

  await mongoose.disconnect();
}
migrate().catch(err => { console.error(err); process.exit(1); });
