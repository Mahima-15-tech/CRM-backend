// middleware/upload.js
const multer = require("multer");

// memory storage (directly send to cloudinary etc.)
const storage = multer.memoryStorage();

// allow pdf and image mimetypes
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files (jpeg, png, webp) are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
