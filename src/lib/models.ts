import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  externalId: { type: String, required: true, unique: true },
  name: String,
  friends: [String],
});

const MemorySchema = new mongoose.Schema({
  title: String,
  description: String,
  icon: String,
  date: String,
  coords: { lat: Number, lng: Number }
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Memory = mongoose.models.Memory || mongoose.model("Memory", MemorySchema);