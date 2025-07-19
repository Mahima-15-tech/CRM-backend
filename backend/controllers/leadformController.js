// leadFormController.js (new file)
const Lead = require("../models/LeadUpload");
const Employee = require("../models/Employee");

// POST /api/lead-form/add
exports.addLead = async (req, res) => {
  try {
    const {
      name,
      fatherName,
      email,
      mobile,
      alternateMobile,
      dob,
      aadhar,
      pan,
      gst,
      address,
      city,
      state,
      district,
      occupation,
      segment,
      investment,
      experience,
      leadStatus,
      leadResponse,
      description,
      callbackDate,
      profile,
      leadType,
      leadSource,
      assignedTo, // will be null or employeeId
      employee // always logged in user's id
    } = req.body;

    const newLead = new Lead({
      name,
      fatherName,
      email,
      mobile,
      alternateMobile,
      dob,
      aadhar,
      pan,
      gst,
      address,
      city,
      state,
      district,
      occupation,
      segment,
      investment,
      experience,
      leadStatus,
      leadResponse,
      description,
      callbackDate,
      profile,
      leadType,
      leadSource,
      assignedTo: assignedTo || employee, // only admin can set assignedTo
      employee,
    });

    await newLead.save();
    res.status(201).json({ message: "Lead added successfully" });
  } catch (error) {
    console.error("Error adding lead:", error);
    res.status(500).json({ message: "Server error while adding lead" });
  }
};
