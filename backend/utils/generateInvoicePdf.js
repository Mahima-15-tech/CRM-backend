// utils/generateInvoicePdf.js
const PDFDocument = require('pdfkit');
const moment = require('moment');

function generateInvoicePDF(invoice, stream) {
  const doc = new PDFDocument({ margin: 40 });

  // Header: Logo and company info
  doc
    .image('public/logo.png', 40, 40, { width: 100 }) // update with your real logo path
    .fontSize(10)
    .text('Financial Research', 400, 40, { align: 'right' })
    .text('Vijay Nagar, Indore - 452001', { align: 'right' })
    .text('support@mail.com', { align: 'right' })
    .text('Phone: +91-928...', { align: 'right' })
    .text('www.vvcomp.com', { align: 'right' })
    .text('GSTIN: 23XXXXXXXXXX', { align: 'right' });

  doc.moveDown();

  // Invoice title & number
  doc
    .fontSize(16)
    .text('INVOICE', { align: 'center' })
    .moveDown();

  doc
    .fontSize(10)
    .text(`Invoice No: ${invoice.invoiceNumber}`)
    .text(`Invoice Date: ${moment(invoice.invoiceDate).format("DD-MM-YYYY")}`)
    .moveDown();

  // Client info
  doc
    .text(`Bill To: ${invoice.clientName}`)
    .text(`Mobile: ${invoice.clientMobile || "-"}`)
    .text(`Address: ${invoice.clientAddress || "-"}`)
    .moveDown();

  // Table header
  const tableTop = doc.y;
  const itemX = 40;
  const columnWidths = [30, 100, 60, 60, 60, 60, 50, 60]; // sum to page width

  doc.fontSize(10);
  const headers = ['S.No', 'Product', 'Pack', 'Start', 'End', 'Service Rate', 'GST', 'Total'];

  headers.forEach((header, i) => {
    doc.text(header, itemX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), tableTop, {
      width: columnWidths[i],
      align: 'center',
    });
  });

  doc.moveDown(0.5);

  // Table row
  const rowY = doc.y;
  const values = [
    '1',
    invoice.product,
    invoice.pack,
    moment(invoice.startDate).format("DD-MMM-YYYY"),
    moment(invoice.endDate).format("DD-MMM-YYYY"),
    `₹${invoice.price}`,
    `₹${invoice.gst}`,
    `₹${invoice.paid}`
  ];

  values.forEach((val, i) => {
    doc.text(val, itemX + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), rowY, {
      width: columnWidths[i],
      align: 'center',
    });
  });

  doc.moveDown(2);

  // Total
  doc.text(`Net Paid: ₹${invoice.paid}`, { align: 'right' });
  doc.text(`Total Invoice Amount in words: Rupees ${invoice.paid} only`, { align: 'right' });

  doc.moveDown();

  // Terms
  doc
    .text('Terms & Conditions:', { underline: true })
    .text('1. This is a computer generated invoice. No signature required.')
    .text('2. Payment is non-refundable.')
    .text('3. Trading/Investment is subject to market risk.')
    .text('4. No refund for complimentary services.');

  doc.end();

  doc.pipe(stream);
}

module.exports = generateInvoicePDF;
