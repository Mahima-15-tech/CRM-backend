// const multer = require("multer");

// // memory storage
// const storage = multer.memoryStorage();

// // file filter
// const fileFilter = (req, file, cb) => {
//   const allowedTypes = [
//     "application/pdf",
//     "image/jpeg",
//     "image/png",
//     "image/webp"
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF and image files (jpeg, png, webp) are allowed!"), false);
//   }
// };

// // ✅ export multer instance (so you can use .single, .fields, .array)
// const upload = multer({ storage, fileFilter });

// module.exports = upload;


const multer = require("multer");

// memoryStorage so we can stream buffer to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only PDF and images (jpeg, png, webp) allowed"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 12 * 1024 * 1024 } });

module.exports = upload;
