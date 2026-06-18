const Message = require("../models/Message");
const User = require("../models/User");
const mongoose = require("mongoose");

// 1. Get past messages between two users for a specific gig
exports.getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const { gigId } = req.query;
    const currentUserId = req.user._id;

    if (!gigId) {
      return res.status(400).json({ message: "gigId query parameter is required" });
    }

    const messages = await Message.find({
      gigId,
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).sort({ timestamp: 1 });

    // Mark received messages as read
    await Message.updateMany(
      { gigId, senderId: otherUserId, receiverId: currentUserId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Get active conversation list for the current user
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = new mongoose.Types.ObjectId(req.user._id);

    // Aggregate unique (gigId, otherUserId) conversation pairs
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
        }
      },
      { $sort: { timestamp: -1 } },
      {
        $addFields: {
          // Determine the other participant
          otherUserId: {
            $cond: {
              if: { $eq: ["$senderId", currentUserId] },
              then: "$receiverId",
              else: "$senderId"
            }
          }
        }
      },
      {
        $group: {
          _id: {
            gigId: "$gigId",
            otherUserId: "$otherUserId"
          },
          lastMessage: { $first: "$message" },
          lastSender: { $first: "$senderId" },
          isRead: { $first: "$isRead" },
          timestamp: { $first: "$timestamp" }
        }
      },
      { $sort: { timestamp: -1 } }
    ]);

    // Populate conversation participant and gig info
    const populatedConversations = await Promise.all(
      conversations.map(async (convo) => {
        const otherUserId = convo._id.otherUserId;
        const gigId = convo._id.gigId;

        const otherUser = await User.findById(otherUserId).select(
          "name email role trustScore isVerified"
        );
        const job = await require("../models/Job")
          .findById(gigId)
          .select("title salary status");

        return {
          otherUser,
          gig: job,
          lastMessage: convo.lastMessage,
          lastSender: convo.lastSender,
          isRead: convo.isRead,
          timestamp: convo.timestamp
        };
      })
    );

    // Filter out conversations where the job or user was deleted
    res.json(populatedConversations.filter((c) => c.otherUser && c.gig));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
