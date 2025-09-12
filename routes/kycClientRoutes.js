const express = require("express");
const router = express.Router();
const upload = require("../middleware/Upload");
const controller = require("../controllers/kycClientController");
const { authenticateUser } = require("../middleware/authMiddleware");


// Main create KYC
router.post(
  "/", authenticateUser,
  upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "pan", maxCount: 1 }
  ]),
  controller.createKYC
);

// Attach single file
router.post("/attach/:id", upload.single("file"), controller.attachFile);

// Get by status
router.get("/status/:status", controller.getByStatus);
router.get("/me", authenticateUser,  controller.getMyKYC);

router.get("/latest", controller.getLatestKYC);
// Get my KYC



module.exports = router;
