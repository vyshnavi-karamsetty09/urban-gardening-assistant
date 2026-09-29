import express from "express";
import { CommunityPost } from "../models/CommunityPost.js";
import { COMMUNITY_SEED_POSTS } from "../data/communitySeed.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Helper to ensure default seed posts exist
async function ensureSeedPosts() {
  try {
    const count = await CommunityPost.countDocuments();
    if (count === 0) {
      await CommunityPost.insertMany(COMMUNITY_SEED_POSTS);
    }
  } catch (err) {
    console.error("Community auto-seed notice:", err.message);
  }
}

// GET /api/community - List posts with category, search and sort
router.get("/", async (req, res) => {
  try {
    await ensureSeedPosts();

    const { category, q, sort } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { title: regex },
        { content: regex },
        { plantTag: regex },
        { "author.name": regex },
      ];
    }

    const sortOption = sort === "popular" ? { likes: -1, createdAt: -1 } : { createdAt: -1 };
    const posts = await CommunityPost.find(filter).sort(sortOption).lean();

    return res.json({ posts: posts || [] });
  } catch (error) {
    console.error("Failed to fetch community posts:", error);
    // Return seed fallback in case of database issue
    let posts = [...COMMUNITY_SEED_POSTS];
    if (req.query.category && req.query.category !== "All") {
      posts = posts.filter((p) => p.category === req.query.category);
    }
    return res.json({ posts });
  }
});

// POST /api/community - Create a new post
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { title, content, category, plantTag, authorName } = req.body || {};

    if (!title || title.trim().length < 4) {
      return res.status(400).json({ message: "Please provide a descriptive title (at least 4 characters)." });
    }

    if (!content || content.trim().length < 10) {
      return res.status(400).json({ message: "Please provide detailed content (at least 10 characters)." });
    }

    const postCategory = category || "General";
    const postPlantTag = plantTag ? plantTag.trim() : "General";

    const user = req.user;
    const author = {
      name: user?.name || authorName?.trim() || "Urban Gardener",
      email: user?.email || "",
      role: user?.role === "admin" ? "Garden Guide Admin" : user?.bio ? "Urban Gardener" : "Balcony Enthusiast",
      avatar: user?.name ? user.name.slice(0, 1).toUpperCase() : "🌱",
      userId: user?._id || undefined,
    };

    const newPost = new CommunityPost({
      title: title.trim(),
      content: content.trim(),
      category: postCategory,
      plantTag: postPlantTag,
      author,
      likes: 1, // Author automatically gives first star
      likedBy: user?.email ? [user.email] : [],
      comments: [],
    });

    const saved = await newPost.save();
    return res.status(201).json({ post: saved, message: "Post shared with the community!" });
  } catch (error) {
    console.error("Failed to create post:", error);
    return res.status(500).json({ message: "Unable to create community post. Please try again." });
  }
});

// POST /api/community/:id/like - Like or unlike a post
router.post("/:id/like", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userIdentifier = req.user?.email || req.body?.userEmail || "anonymous_user";

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const alreadyLiked = post.likedBy.includes(userIdentifier);
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((email) => email !== userIdentifier);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userIdentifier);
      post.likes = post.likes + 1;
    }

    await post.save();
    return res.json({
      post,
      liked: !alreadyLiked,
      likesCount: post.likes,
    });
  } catch (error) {
    console.error("Failed to like post:", error);
    return res.status(500).json({ message: "Could not update like." });
  }
});

// POST /api/community/:id/comments - Add comment to a post
router.post("/:id/comments", optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, authorName } = req.body || {};

    if (!text || text.trim().length < 2) {
      return res.status(400).json({ message: "Comment cannot be empty." });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const commentAuthor = req.user?.name || authorName?.trim() || "Fellow Gardener";
    const comment = {
      author: commentAuthor,
      authorEmail: req.user?.email || "",
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    return res.status(201).json({ post, comment, message: "Comment added!" });
  } catch (error) {
    console.error("Failed to add comment:", error);
    return res.status(500).json({ message: "Could not add comment." });
  }
});

export default router;
