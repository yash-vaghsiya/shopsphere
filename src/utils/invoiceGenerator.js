import { jsPDF } from "jspdf";
import { formatCurrency, formatDate } from "./format";
import { getActiveGlobalCurrency } from "../features/currency/currencySlice";

/**
 * Shared utility to generate and download a professional PDF invoice for an order.
 * Uses pixel-perfect styling, structured tables, and clean margins.
 */
export const downloadInvoicePDF = (order) => {
  const doc = new jsPDF();
  
  // Fetch dynamic currency config
  const currencyConfig = getActiveGlobalCurrency();
  const currencyLabel = currencyConfig.code; // e.g. "INR", "USD", "EUR" etc.
  
  // Width of standard A4 is 210mm, height 297mm
  const margin = 15;
  let y = 20;

  // --- Header ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39); // Gray 900
  doc.text("SHOPSPHERE", margin, y);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); // Gray 500
  y += 5;
  doc.text("PREMIUM FUTURISTIC MARKETPLACE", margin, y);

  // --- Right-side Title "INVOICE" ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235); // Blue 600
  doc.text("INVOICE", 150, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81); // Gray 700
  doc.text(`Invoice ID:  INV-${order.id}`, 150, 28);
  doc.text(`Date:         ${formatDate(order.createdAt)}`, 150, 34);

  // Thick accent divider line
  y = 42;
  doc.setDrawColor(37, 99, 235); // Blue 600
  doc.setLineWidth(1.5);
  doc.line(margin, y, 210 - margin, y);

  // --- Bill To / Ship To Info section ---
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39); // Gray 900
  doc.text("CUSTOMER DETAILS", margin, y);
  doc.text("DELIVERY DESTINATION", 110, y);

  // Light border or underline for sections
  doc.setDrawColor(229, 231, 235); // Gray 200
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, 95, y + 2);
  doc.line(110, y + 2, 210 - margin, y + 2);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81); // Gray 700

  // Bill To Content
  const customerLines = [
    order.customerName,
    `Email: ${order.email}`,
    order.shippingAddress?.phone ? `Phone: ${order.shippingAddress.phone}` : ""
  ].filter(Boolean);

  let customerY = y;
  customerLines.forEach(line => {
    doc.text(line, margin, customerY);
    customerY += 5;
  });

  // Ship To Content
  const shippingLines = [
    order.shippingAddress?.fullName || order.customerName,
    order.shippingAddress?.address || "No address provided",
    `${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${order.shippingAddress?.zipCode || ""}`,
    order.shippingAddress?.phone ? `Phone: ${order.shippingAddress.phone}` : ""
  ].filter(Boolean);

  let shippingY = y;
  shippingLines.forEach(line => {
    doc.text(line, 110, shippingY);
    shippingY += 5;
  });

  // Take max Y
  y = Math.max(customerY, shippingY) + 8;

  // --- Table Headers ---
  doc.setFillColor(37, 99, 235); // Blue 600
  doc.rect(margin, y, 210 - (margin * 2), 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255); // White
  doc.text("PROCURED ITEM DESCRIPTION", margin + 4, y + 5.5);
  doc.text("UNIT PRICE", 120, y + 5.5, { align: "right" });
  doc.text("QTY", 150, y + 5.5, { align: "center" });
  doc.text("TOTAL PRICE", 195, y + 5.5, { align: "right" });

  y += 8;
  doc.setTextColor(55, 65, 81); // Reset font color

  // --- Procured items ---
  order.items.forEach((item) => {
    y += 2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    // Split item name if too long for spacing
    const splitName = doc.splitTextToSize(item.name, 90);
    const nameLinesCount = splitName.length;

    // Print split text
    splitName.forEach((line, i) => {
      doc.text(line, margin + 4, y + 4 + (i * 4.5));
    });

    // Price, Qty, total
    const itemPriceFormatted = formatCurrency(item.price).replace(/[^\d,.-]/g, "").trim();
    const itemTotalFormatted = formatCurrency(item.price * item.quantity).replace(/[^\d,.-]/g, "").trim();

    doc.text(`${currencyLabel} ${itemPriceFormatted}`, 120, y + 4, { align: "right" });
    doc.text(String(item.quantity), 150, y + 4, { align: "center" });
    doc.text(`${currencyLabel} ${itemTotalFormatted}`, 195, y + 4, { align: "right" });

    y += Math.max(nameLinesCount * 4.5, 6);

    // Draw light item divider
    doc.setDrawColor(243, 244, 246); // Gray 100
    doc.setLineWidth(0.3);
    doc.line(margin, y, 210 - margin, y);
  });

  y += 10;

  // --- Summary calculations block ---
  doc.setDrawColor(229, 231, 235); // Gray 200
  doc.setLineWidth(0.5);
  doc.line(125, y, 210 - margin, y); // Top border of summary area

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); // Gray 500

  const subtotalFormatted = formatCurrency(order.subtotal).replace(/[^\d,.-]/g, "").trim();
  const shippingFormatted = formatCurrency(order.shipping || 0).replace(/[^\d,.-]/g, "").trim();
  const taxFormatted = formatCurrency(order.tax || 0).replace(/[^\d,.-]/g, "").trim();
  const totalFormatted = formatCurrency(order.total).replace(/[^\d,.-]/g, "").trim();

  doc.text("Subtotal:", 150, y, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 65, 81);
  doc.text(`${currencyLabel} ${subtotalFormatted}`, 195, y, { align: "right" });

  if (order.discount && order.discount > 0) {
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(`Promo Offer (${order.couponCode || "Applied"}):`, 150, y, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38); // Red 600
    const discountFormatted = formatCurrency(order.discount).replace(/[^\d,.-]/g, "").trim();
    doc.text(`- ${currencyLabel} ${discountFormatted}`, 195, y, { align: "right" });
  }

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Postage & Handling:", 150, y, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 65, 81);
  doc.text(`${currencyLabel} ${shippingFormatted}`, 195, y, { align: "right" });

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Tax (GST):", 150, y, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 65, 81);
  doc.text(`${currencyLabel} ${taxFormatted}`, 195, y, { align: "right" });

  // Shaded block or double line for grand total
  y += 4;
  doc.setDrawColor(209, 213, 219); // Gray 300
  doc.line(125, y, 210 - margin, y);

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235); // Blue 600
  doc.text("Total Amount Charged:", 150, y, { align: "right" });
  doc.text(`${currencyLabel} ${totalFormatted}`, 195, y, { align: "right" });

  doc.setLineWidth(1);
  doc.setDrawColor(37, 99, 235); // Blue 600 underline for total
  doc.line(125, y + 2, 210 - margin, y + 2);

  // --- Footer block ---
  y = 265;
  doc.setDrawColor(229, 231, 235); // Gray 200 light border line
  doc.setLineWidth(0.5);
  doc.line(margin, y, 210 - margin, y);

  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39); // Gray 900
  doc.text("Thank you for your business!", 105, y, { align: "center" });

  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175); // Gray 400
  doc.text("Powered by ShopSphere Marketplace", 105, y, { align: "center" });
  y += 4;
  doc.text("For any support queries, email: support@shopsphere.com", 105, y, { align: "center" });

  // Save actual invoice file
  doc.save(`Invoice_${order.id}.pdf`);
};
