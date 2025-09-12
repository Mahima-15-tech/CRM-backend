// // routes/webLeadRoutes.js
// const express = require("express");
// const router = express.Router();
// const { getLeads, getLeadById, updateLeadStatus, convertToFT } = require("../controllers/webLeadController");
// const { authenticateUser } = require('../middleware/authMiddleware');

// router.post("/convertToFT", authenticateUser, convertToFT);
// router.get("/:id", getLeadById);
// router.put("/:id", updateLeadStatus);
// router.get("/", getLeads);





// module.exports = router;

const express = require("express");
const router = express.Router();
const { authenticateUser } = require('../middleware/authMiddleware');
const { 
  getLeads, 
  getLeadById, 
//   updateLeadStatus, 
  convertToFT, 
  updateLead, 
  disposeLead, 
  deleteLead 
} = require("../controllers/webLeadController");


router.post("/convertToFT", authenticateUser, convertToFT);
router.get("/:id", getLeadById);
router.put("/:id", updateLead);          // ✅ update full lead
router.patch("/delete/:id", deleteLead); // ✅ delete
router.post("/dispose/:id", disposeLead);// ✅ dispose
router.get("/", getLeads);

module.exports = router;