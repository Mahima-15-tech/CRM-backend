// const express = require("express");
// const router = express.Router();
// const kycController = require("../controllers/kycController");
// const upload = require("../middleware/multer");
// const { authenticateUser } = require("../middleware/authMiddleware");

// // ✅ Specific routes first
// router.post("/create", authenticateUser, kycController.createKYCEntry);
// router.post("/upload/:id", authenticateUser, upload.single("file"), kycController.uploadKYC);


// router.patch("/:id", authenticateUser, kycController.updateKYCStatus);

// // ✅ THEN generic :status route last
// router.get("/:status", authenticateUser, kycController.getKYCByStatus);

// router.post("/kyc", upload, kycController.uploadMultipleKYC);



// module.exports = router;


const express = require("express");
const router = express.Router();
const kycController = require("../controllers/kycController");
const upload = require("../middleware/Upload"); // make sure correct file
const { authenticateUser } = require("../middleware/authMiddleware");

// Create entry
router.post("/create", authenticateUser, kycController.createKYCEntry);

// Single file upload (when attaching to existing KYC)
router.post("/upload/:id", authenticateUser, upload.single("file"), kycController.uploadKYC);

// Update status
router.patch("/:id", authenticateUser, kycController.updateKYCStatus);

// Get by status
router.get("/:status", authenticateUser, kycController.getKYCByStatus);

// ✅ Multiple KYC upload (fix here)
router.post(
  "/upload/:id",
  authenticateUser,
  upload.single("file"),   // ✅ now works
  kycController.uploadKYC
);

// Multiple KYC upload
router.post(
  "/kyc",
  authenticateUser,
  upload.fields([
    { name: "aadhaar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "addressProof", maxCount: 1 },
    { name: "photo", maxCount: 1 },
    { name: "signature", maxCount: 1 }
  ]),
  kycController.uploadMultipleKYC
);


module.exports = router;
