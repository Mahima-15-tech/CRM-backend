// models/employee.js
const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
});

module.exports = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
