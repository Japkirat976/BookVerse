const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    bookName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    hasSpoiler: {
      type: Boolean,
      default: false
    },
    tags: {
      type: [String],
      default: []
    },
    likes: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
        }
    ],
    comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      text: {
        type: String,
        required: true
      }
    }
  ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);