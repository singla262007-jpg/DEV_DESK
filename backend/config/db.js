const mongoose = require("mongoose");

// Expose `id` (string) instead of `_id` / `__v` so the frontend gets a clean shape.
const toJSON = {
  virtuals: false,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
};

async function connectDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  console.log(`Connected to MongoDB (database: ${mongoose.connection.name})`);
}

module.exports = { connectDB, toJSON };
