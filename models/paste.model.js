import mongoose, { Schema } from "mongoose";

const pasteSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      minlength: 1,
    },
    ttl_seconds: {
      type: Number,
      default: null,
    },
    max_views: {
      type: Number,
      default: null,
    },
    views_count: {
      type: Number,
      default: 0,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    expires_at: {
      type: Date,
      default: null,
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);


pasteSchema.methods.isExpired = function (testNowMs = null) {
  const currentTime = testNowMs ? new Date(testNowMs) : new Date();

 
  if (this.expires_at && currentTime > this.expires_at) {
    return true;
  }

  return false;
};


pasteSchema.methods.isViewLimitExceeded = function () {
  if (this.max_views !== null && this.views_count >= this.max_views) {
    return true;
  }
  return false;
};


pasteSchema.methods.isAvailable = function (testNowMs = null) {
  return !this.isExpired(testNowMs) && !this.isViewLimitExceeded();
};


pasteSchema.methods.incrementViews = function () {
  this.views_count += 1;
  return this.save();
};


pasteSchema.methods.getRemainingViews = function () {
  if (this.max_views === null) {
    return null;
  }
  return Math.max(0, this.max_views - this.views_count);
};

export const Paste = mongoose.model("Paste", pasteSchema);