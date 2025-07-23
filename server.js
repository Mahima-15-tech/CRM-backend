require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const path = require('path');
 


const authRoutes = require('./routes/authRoutes');
const CompanyRoutes = require('./routes/CompanyRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const productGroups = require('./routes/productGroups');
const scriptRoutes = require('./routes/scriptRoutes')
const scriptMasterRoutes = require('./routes/scriptmasterroutes');
const templateRoutes = require('./routes/templateRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const profileRoutes = require('./routes/profileRoutes');
const employeedataRoutes = require('./routes/employeedataRoutes');
const PermissionRoutes = require('./routes/PermissionRoutes');
const graphRoutes = require('./routes/graphRoutes');
const teamRoutes = require('./routes/teamRoutes');
const leadRoutes = require('./routes/leadRoutes');
const LeadSourceRoutes = require('./routes/LeadSourceRoutes');
const leadUploadRoutes= require('./routes/leadUploadRoutes');
const fetchlimitRoutes = require('./routes/fetchlimitRoutes');
// const dashboardRoutes = require('./routes/userDashboard');
const dashboardRoutess = require('./routes/dashboard');
const leadFormRoutes = require("./routes/leadformRoutes");
const ftAssignmentRoutes = require('./routes/ftassignmentroutes');
const paymentServiceRoutes = require("./routes/PaymentServiceRoutes");
const kycRoutes = require("./routes/kycRoutes");
const invoiceRoutes = require("./routes/invoiceroutes");
const userRoutes = require('./routes/userroutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();



const allowedOrigins = [
  'http://localhost:5173',
  'https://crm.technoviaan.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);  // allow non-browser requests
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.json());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  // ✅ Call the cleanup after DB is connected
})
.catch((err) => console.error(err));
// Test route
app.get('/', (req, res) => {
  res.send('CRM Backend is running');
});


app.use('/api/auth', authRoutes);
app.use('/api', CompanyRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/productgroups', productGroups);
app.use('/api/scripts', scriptRoutes);
app.use('/api/scriptmaster', scriptMasterRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/payment-modes', paymentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api', employeedataRoutes);
app.use('/api/permissions', PermissionRoutes);
app.use('/api/graphs', graphRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/leadresponses', leadRoutes);
app.use('/api/leadsource', LeadSourceRoutes);
app.use("/api/leads", leadUploadRoutes);
app.use('/api/fetchlimits', fetchlimitRoutes);
// app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutess);
app.use("/api/lead-form", leadFormRoutes);
app.use('/api/ftassignment', ftAssignmentRoutes);
app.use("/api/payments", paymentServiceRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use(adminRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
