// Company model
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: String,
  website: String,
  state: String,
  city: String,
  address: String,
  monthStartDay: String,
  monthEndDay: String,
  lastDayOfMonth: String,
   policy: String,
});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
