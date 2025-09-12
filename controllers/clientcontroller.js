// controllers/clientController.js
const User = require('../models/User');
const WebLead = require('../models/weblead');
const Lead = require('../models/LeadUpload');
const FTAssignment = require('../models/FTAssignment');
const Invoice = require('../models/Invoice');


exports.getClientDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password');
    const webLead = await WebLead.findOne({ userId: userId });
    // try find Lead that corresponds (may have been created on convertToFT)
    const lead = webLead ? await Lead.findOne({ $or: [{ mobile: webLead.phone }, { email: webLead.email }] }) : null;

    const ft = lead ? await FTAssignment.find({ leadId: lead._id })
      .populate('productId leadSourceId raisedBy') : [];

    const invoices = lead ? await Invoice.find({ leadId: lead._id }).sort({createdAt:-1}) : [];

    res.json({ user, webLead, lead, ft, invoices });
  } catch (err) {
    console.error('Client dashboard error', err);
    res.status(500).json({ error: 'Server error' });
  }
};


