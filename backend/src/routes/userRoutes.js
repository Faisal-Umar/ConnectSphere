const express = require("express");
const { getProfile, allUsers } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getProfile);
router.get("/", protect, allUsers);

module.exports = router;

