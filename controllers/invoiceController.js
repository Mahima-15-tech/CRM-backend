// controllers/invoiceController.js
const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

const Invoice = require("../models/Invoice");

const PDFDocument = require('pdfkit');
// const KYC = require("../models/KYC");


// Generate invoice number dynamically
let invoiceCounter = 1;

exports.addInvoice = async (req, res) => {
  try {
  const {
  clientName, mobile, product, pack, price, discount, paid,
  gst, transactionCharge, startDate, endDate, duration, createdBy,
  leadSource, leadResponse , leadId, paymentId // ✅ added
} = req.body;


    const newInvoice = new Invoice({
      invoiceNumber: `INV-${invoiceCounter++}`,
      invoiceDate: new Date(),
      clientName, mobile, product, pack, price, discount, paid,
      gst, transactionCharge, startDate, endDate, duration,
      createdBy,leadSource,     // ✅ added
  leadResponse   ,leadId, paymentId 
    });

    const saved = await newInvoice.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Failed to create invoice", details: err.message });
  }
};

exports.getPendingInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ status: "Pending" }).populate("createdBy", "name username"); 
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("createdBy", "name");
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: "Failed to get invoice" });
  }
};

// /controllers/invoiceController.js
exports.updateInvoiceStatus = async (req, res) => {
  const { id } = req.params;
  const { statusType, value } = req.body;

  const invoice = await Invoice.findByIdAndUpdate(id, {
    [statusType]: value,
  }, { new: true });

  res.json({ success: true, updated: invoice });
};


exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedInvoice = await Invoice.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, updated: updatedInvoice });
  } catch (err) {
    console.error("Update invoice failed:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};




/// controllers/invoiceController.js
exports.approveOrDenyInvoice = async (req, res) => {
  try {
    const { statusType, value } = req.body;

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    invoice[statusType] = value;

    // ✅ Main logic to update to Running
  

    await invoice.save();
    res.json({ success: true, message: `${statusType} updated to ${value}` });
  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getAllInvoices = async (req, res) => {
  try {
    let filter = {};
    const userRole = req.user?.role;
    const userId = req.user?._id || req.tokenData?.id;

    if (!userRole) {
      return res.status(401).json({ message: "Unauthorized: Role missing" });
    }

    if (userRole.toLowerCase() !== "admin") {
      filter.createdBy = userId;
    }

    const invoices = await Invoice.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "name username"); // ✅ add this line
    res.json(invoices);
  } catch (err) {
    console.error("❌ Invoice fetch error:", err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};




exports.generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).lean();
    if (!invoice) return res.status(404).send('Invoice not found');

    // Use cloud image URL instead of local file
    const logoUrl = 'https://res.cloudinary.com/dxw8erwq9/image/upload/v1753950744/logo_pnytco.jpg';

    const html = await ejs.renderFile(
      path.join(__dirname, '../utils/invoice-template.ejs'),
      { invoice, logoUrl }
    );

  const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);

  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).send('Failed to generate PDF');
  }
};



// Add this to invoiceController.js

exports.getInvoicesByStatus = async (req, res) => {
  try {
    const status = req.query.status;
    const role = (req.user?.role || "").toLowerCase();
    const userId = req.user?._id || req.tokenData?.id;

    const filter = {};

    if (status) filter.status = status;

    // 🔐 Only Admin can see all, others see only their own
    if (role !== "admin") {
      filter.createdBy = userId;
    }

    const invoices = await Invoice.find(filter)
      .populate("createdBy", "name")
      .populate("leadSource", "name");

    res.json(invoices);
  } catch (err) {
    console.error("❌ Error in getInvoicesByStatus:", err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};


// ✅ GET /api/invoices/client-count
exports.getClientCount = async (req, res) => {
  try {
    const { source } = req.query;

    const filter = { status: "Running" };
if (req.user?.role !== "Admin") {
  filter.createdBy = req.user?._id || req.tokenData?.id;
}

    // If source filter is required later, use $lookup and aggregate
  const count = await Invoice.countDocuments(filter);

    res.json({ success: true, count });
  } catch (error) {
    console.error("Client count error:", error);
    res.status(500).json({ success: false, error: "Failed to get invoice" });
  }
};
