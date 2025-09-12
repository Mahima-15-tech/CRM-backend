const KycClient = require("../models/KycClient");
const cloudinary = require("../cloudinaryConfig");
const User = require("../models/User");

// helper: upload buffer to cloudinary (returns result)
const uploadBufferToCloudinary = (buffer, folder = "kycclient") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
};

// POST / -> create KYC (multi-file)
exports.createKYC = async (req, res) => {
  try {
    const { name, dob, mobile } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "name required" });
    if (!mobile) return res.status(400).json({ success: false, message: "mobile required" });

    const files = req.files || {};
    const uploaded = {};

    // allowed file fields: aadhaarFront, aadhaarBack, photo, pan
    for (const field of Object.keys(files)) {
      const f = files[field][0];
      if (!f) continue;
      const result = await uploadBufferToCloudinary(f.buffer, "kycclient");
      uploaded[field] = result.secure_url;
    }

    // ✅ Create KYC entry
   // ✅ Create KYC entry
const kyc = await KycClient.create({
  name,
  dob: dob || null,
  mobile,
  aadhaarFront: uploaded.aadhaarFront || null,
  aadhaarBack: uploaded.aadhaarBack || null,
  photo: uploaded.photo || null,
  pan: uploaded.pan || null,
  status: uploaded.aadhaarFront && uploaded.aadhaarBack && uploaded.pan 
            ? "Complete" 
            : "Pending",   // 👈 agar sare docs nahi mile to pending
  raisedBy: req.body.raisedBy || req.user?._id || null,
});


    // ✅ Update User table me KYC status
if (req.user?._id) {
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { kycStatus: kyc.status }, // 👈 same as KYC status
    { new: true }
  );
  console.log("✅ User updated:", updatedUser.kycStatus);
}



    return res.json({ success: true, kyc });
  } catch (err) {
    console.error("KYC create error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /status/:status
exports.getByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const q = status ? { status } : {};
    const items = await KycClient.find(q).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /attach/:id single file (query ?field=aadhaarFront etc.)
exports.attachFile = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "file required" });

    const result = await uploadBufferToCloudinary(file.buffer, "kycclient");
    const field = req.query.field || "fileUrl";

    const update = {};
    update[field] = result.secure_url;

    const updated = await KycClient.findByIdAndUpdate(id, { $set: update }, { new: true });
    return res.json({ success: true, updated });
  } catch (err) {
    console.error("Attach file error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};


// kycclient.controller.js
const submitKYC = async (req, res) => {
  try {
    const { name, dob, mobile } = req.body;

    // Save KYC details in KYC collection
    const kyc = await KYCClient.create({
      name,
      dob,
      mobile,
      aadhaarFront: req.files?.aadhaarFront[0]?.path,
      aadhaarBack: req.files?.aadhaarBack[0]?.path,
      photo: req.files?.photo[0]?.path,
      pan: req.files?.pan[0]?.path,
    });

    // ✅ User table me status update
    await User.findByIdAndUpdate(req.user._id, { kycStatus: "Complete" });

    res.json({ success: true, kyc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "KYC submission failed" });
  }
};

// GET /api/kycclient/me -> logged in user ka KYC record
// ✅ Get KYC for logged-in user
exports.getMyKYC = async (req, res) => {
  try {
    const kyc = await KycClient.findOne({ mobile: req.user.phone })
                               .sort({ createdAt: -1 })
                               .lean();

    if (!kyc) {
      return res.json({ success: true, kyc: { status: "Pending" } });
    }

    return res.json({ success: true, kyc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};




// ✅ Get latest KYC (without auth)
exports.getLatestKYC = async (req, res) => {
  try {
    const kyc = await KycClient.findOne().sort({ createdAt: -1 }).lean();

    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "No KYC record found",
      });
    }

    return res.json({
      success: true,
      kyc,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



// GET /api/kycclient/me


exports.createKYC = async (req, res) => {
  try {
    const { name, dob, mobile } = req.body;

    // ✅ check: logged-in user का phone और form का mobile same होना चाहिए
    if (req.user?.phone !== mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number does not match your registered number",
      });
    }

    const files = req.files || {};
    const uploaded = {};

    for (const field of Object.keys(files)) {
      const f = files[field][0];
      if (!f) continue;
      const result = await uploadBufferToCloudinary(f.buffer, "kycclient");
      uploaded[field] = result.secure_url;
    }

    // ✅ Create KYC entry with userId
    const kyc = await KycClient.create({
      name,
      dob: dob || null,
      mobile,
      aadhaarFront: uploaded.aadhaarFront || null,
      aadhaarBack: uploaded.aadhaarBack || null,
      pan: uploaded.pan || null,
      status:
        uploaded.aadhaarFront && uploaded.aadhaarBack && uploaded.pan
          ? "Complete"
          : "Pending",
      raisedBy: req.user?._id, // 👈 Always attach logged-in userId
    });

    // ✅ Update User table
    await User.findByIdAndUpdate(req.user._id, { kycStatus: kyc.status });

    return res.json({ success: true, kyc });
  } catch (err) {
    console.error("KYC create error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
