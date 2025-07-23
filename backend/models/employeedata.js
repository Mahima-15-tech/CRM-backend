const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fatherName: String,
  state: String,
  city: String,
  dob: { type: Date, required: false },
  address: String,
  mobile: String,
  email: String,
  username: { type: String, required: true, unique: true },
 

  // password: { type: String, required: true },
  profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile", required: true },

  reporting: String,
  joiningDate: Date,
  description: String,
  extension: { type: Number, default: 0 },
  target: { type: Number, default: 0 },
  experience: String,
  photo: String,
  status: { type: Boolean, default: true }, // true = active
  leadPermission: [String],
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  permissions: [
  {
    name: { type: String },
    group: { type: String },
    status: { type: Boolean, default: true },
  }
]

  // optional for now
}, { timestamps: true });

module.exports = mongoose.model('EmployeeData', employeeSchema);
