import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  lastUploadDate: {
    type: Date,
    default: null,
  },
  uploadsToday: {
    type: Number,
    default: 0,
  },
  dailyUploadLimit: {
    type: Number,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to check if user can upload today
UserSchema.methods.canUploadToday = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastUpload = this.lastUploadDate ? new Date(this.lastUploadDate) : null;

  // If no upload date or last upload was on a different day, reset the counter
  if (!lastUpload || lastUpload < today) {
    return true;
  }

  // Check if user has reached daily limit
  return this.uploadsToday < this.dailyUploadLimit;
};

// Method to increment upload count
UserSchema.methods.incrementUploadCount = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastUpload = this.lastUploadDate ? new Date(this.lastUploadDate) : null;

  // If it's a new day, reset the counter
  if (!lastUpload || lastUpload < today) {
    this.uploadsToday = 1;
    this.lastUploadDate = new Date();
  } else {
    this.uploadsToday += 1;
    this.lastUploadDate = new Date();
  }

  await this.save();
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
