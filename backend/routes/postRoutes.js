const express = require("express");
const Post = require("../models/Post");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Create Post
router.post("/", protect, async (req, res) => {
  try {
    const { bookName, content, hasSpoiler, tags } = req.body;

    const post = await Post.create({
      user: req.user.id,
      bookName,
      content,
      hasSpoiler,
      tags
    });

    res.status(201).json(post);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get logged-in user's posts
router.get("/mine", protect, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a post
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check ownership
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get all posts
router.get("/", async (req, res) => {
  try {
    const { showSpoilers } = req.query;

    let filter = {};

    // If user does NOT want spoilers
    if (showSpoilers !== "true") {
      filter.hasSpoiler = false;
    }

    const posts = await Post.find(filter).populate("user", "name email");

    res.json(posts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like / Unlike post
router.put("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.user.id;

    // Check if already liked
    if (!post.likes) post.likes = [];
    const alreadyLiked = post.likes?.includes(userId);

    if (alreadyLiked) {
      // Unlike
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      likesCount: post.likes.length
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add comment
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user: req.user.id,
      text
    };

    if (!post.comments) post.comments = [];

    post.comments.push(comment);

    await post.save();

    res.json({
      message: "Comment added",
      comments: post.comments
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;