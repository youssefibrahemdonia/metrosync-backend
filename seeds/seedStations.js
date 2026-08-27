require('dotenv').config();
const mongoose = require('mongoose');
const Station = require('../src/models/Station');
const stations = [
  { name: 'Downtown Central', line: 'Red Line', order: 1 },
  { name: 'City Park', line: 'Red Line', order: 2 },
  { name: 'Grand Avenue', line: 'Red Line', order: 3 },
  { name: 'Financial District', line: 'Red Line', order: 4 },
  { name: 'Riverfront', line: 'Red Line', order: 5 },
  { name: 'North Market', line: 'Red Line', order: 6 },
  { name: 'West End', line: 'Blue Line', order: 1 },
  { name: 'University Heights', line: 'Blue Line', order: 2 },
  { name: 'Medical Center', line: 'Blue Line', order: 3 },
  { name: 'Tech Park', line: 'Blue Line', order: 4 },
  { name: 'Airport North', line: 'Blue Line', order: 5 },
  { name: 'Harbor View', line: 'Blue Line', order: 6 },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas...');

    await Station.deleteMany({});
    console.log('Cleared existing stations.');

    const createdStations = await Station.insertMany(stations);
    console.log(`Successfully seeded ${createdStations.length} stations.`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    process.exit(1);
  }
};

seedDB();