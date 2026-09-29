import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: { type: String, required: true, trim: true },
    authorEmail: { type: String, default: "" },
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const communityPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "All",
        "Balcony Gardens",
        "Pest & Care Tips",
        "Plant Showcases",
        "DIY & Compost",
        "Beginner Q&A",
        "General",
      ],
      default: "General",
    },
    plantTag: { type: String, default: "General", trim: true },
    author: {
      name: { type: String, required: true, trim: true },
      email: { type: String, default: "" },
      role: { type: String, default: "Urban Gardener" },
      avatar: { type: String, default: "" },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    likes: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
  },
  { timestamps: true }
);

export const CommunityPost = mongoose.model("CommunityPost", communityPostSchema);
