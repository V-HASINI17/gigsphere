const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const reviewController = require("../controllers/reviewController");

router.use(protect);

router.post("/", reviewController.createReview);
router.get("/:userId", reviewController.getUserReviews);

module.exports = router;
