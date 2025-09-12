// utils/cronJobs.js
const cron = require("node-cron");
const Invoice = require("../models/Invoice");
const PendingPaymentLead = require("../models/PendingPaymentLead");
const LeadUpload = require("../models/LeadUpload");

cron.schedule("0 0 * * *", async () => { // daily at midnight
  try {
    const today = new Date();

    // 1️⃣ Find expired Running invoices for Lead (not WebLead)
    const expiredInvoices = await Invoice.find({
      status: "Running",
      endDate: { $lt: today },
      leadId: { $exists: true }, // only Lead, not WebLead
    });

    for (const invoice of expiredInvoices) {
      // 2️⃣ Mark invoice as Completed
      invoice.status = "Completed";
      await invoice.save();

      // 3️⃣ Add to PendingPaymentLead collection if not already added
      const existingPending = await PendingPaymentLead.findOne({ leadId: invoice.leadId });
      if (!existingPending) {
        const lead = await LeadUpload.findById(invoice.leadId);
        if (lead) {
          const newPending = new PendingPaymentLead({
            leadId: lead._id,
            name: lead.name,
            mobile: lead.mobile,
            email: lead.email,
            lastInvoice: invoice._id,
            lastService: invoice.product,
            createdAt: new Date(),
          });
          await newPending.save();
          global.io && global.io.emit('pendingCountsUpdated');
        }
      }
    }

    console.log(`✅ Cron: Expired invoices processed, ${expiredInvoices.length} leads moved to pending payment.`);
  } catch (err) {
    console.error("❌ Cron job error:", err);
  }
});
