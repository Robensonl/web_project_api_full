const mongoose = require('mongoose');
let mongoUri;

module.exports.connectToDatabase = async () => {

  mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/around_project_test';

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
};

module.exports.disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

module.exports.clearCollection = async (collectionName) => {
  const collection = mongoose.connection.collections[collectionName];
  if (collection) {
    await collection.deleteMany({});
  }
};
