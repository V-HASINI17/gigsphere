const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getMessages, getConversations } = require("../controllers/chatController");

router.use(protect);

router.get("/messages/:otherUserId", getMessages);
router.get("/conversations", getConversations);

module.exports = router;
