const express = require("express");
const router = express.Router();
const kycController = require("../controllers/kycController");
const upload = require("../middleware/multer");
const { authenticateUser } = require("../middleware/authMiddleware");

// ✅ Specific routes first
router.post("/create", authenticateUser, kycController.createKYCEntry);
router.post("/upload/:id", authenticateUser, upload.single("file"), kycController.uploadKYC);


router.patch("/:id", authenticateUser, kycController.updateKYCStatus);

// ✅ THEN generic :status route last
router.get("/:status", authenticateUser, kycController.getKYCByStatus);


module.exports = router;
