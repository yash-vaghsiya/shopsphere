import { jsPDF } from "jspdf";
import { formatCurrency, formatDate } from "./format";
import { getActiveGlobalCurrency } from "../features/currency/currencySlice";

export const downloadInvoicePDF = (order) => {
  const doc = new jsPDF();
  const currencyConfig = getActiveGlobalCurrency();
  const currencyLabel = currencyConfig.code;
  const margin = 15;
  const pageWidth = 210;
  const pageHeight = 297;
  const footerPos = 270;
  const maxY = footerPos - 15;

  const get = (obj, ...keys) => { for (const k of keys) { const v = obj[k]; if (v !== undefined && v !== null) return v; } return undefined; };

  const safeNum = (val) => {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  };

  const oId = get(order, 'id', 'Id', 'orderId', 'OrderId');
  const oCreatedAt = get(order, 'createdAt', 'CreatedAt', 'orderDate', 'OrderDate', 'date', 'Date');
  const oCustomerName = get(order, 'customerName', 'CustomerName', 'name', 'Name', 'userName', 'UserName');
  const oEmail = get(order, 'email', 'Email');
  const oItems = get(order, 'items', 'Items', 'orderItems', 'OrderItems') || [];
  const oShippingAddress = get(order, 'shippingAddress', 'ShippingAddress') || {};
  const oPhone = get(oShippingAddress, 'phone', 'Phone', 'mobile', 'Mobile');
  const oFullName = get(oShippingAddress, 'fullName', 'FullName', 'name', 'Name');
  const oAddress = get(oShippingAddress, 'address', 'Address');
  const oCity = get(oShippingAddress, 'city', 'City');
  const oState = get(oShippingAddress, 'state', 'State');
  const oZip = get(oShippingAddress, 'zipCode', 'ZipCode', 'zip', 'Zip');

  const itemSubtotal = oItems.reduce((s, it) => s + safeNum(get(it, 'price', 'Price', 'unitPrice', 'UnitPrice')) * safeNum(get(it, 'quantity', 'Quantity')), 0);
  const subtotal = safeNum(get(order, 'subtotal', 'Subtotal', 'subTotal', 'SubTotal') || itemSubtotal);
  const shipping = safeNum(get(order, 'shipping', 'Shipping', 'shippingCost', 'ShippingCost', 'postage', 'Postage'));
  const tax = safeNum(get(order, 'tax', 'Tax', 'gst', 'GST', 'taxAmount', 'TaxAmount'));
  const total = safeNum(get(order, 'total', 'Total', 'amount', 'Amount', 'totalAmount', 'TotalAmount') || subtotal + shipping + tax);

  let oDiscount = safeNum(get(order, 'discount', 'Discount'));
  let oDiscountPercent = safeNum(get(order, 'discountPercent', 'DiscountPercent'));
  const oCouponCode = get(order, 'couponCode', 'CouponCode', 'coupon', 'Coupon');
  if (oDiscountPercent > 0 && oDiscountPercent <= 1) oDiscountPercent *= 100;
  if (oDiscount === 0 && oDiscountPercent > 0 && subtotal > 0) {
    oDiscount = parseFloat(((subtotal * oDiscountPercent) / 100).toFixed(2));
  } else if (oDiscount === 0 && subtotal + shipping + tax - total > 0.5) {
    oDiscount = parseFloat((subtotal + shipping + tax - total).toFixed(2));
    if (subtotal > 0) oDiscountPercent = parseFloat(((oDiscount / subtotal) * 100).toFixed(1));
  }

  let y = 20;

  const addFooter = () => {
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, footerPos, pageWidth - margin, footerPos);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.text("Thank you for your business!", 105, footerPos + 8, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Powered by ShopSphere Marketplace", 105, footerPos + 12, { align: "center" });
    doc.text("For any support queries, email: support@shopsphere.com", 105, footerPos + 16, { align: "center" });
  };

  const checkSpace = (needed) => {
    if (y + needed > maxY) {
      addFooter();
      doc.addPage();
      y = 20;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39);
  doc.text("SHOPSPHERE", margin, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  y += 5;
  doc.text("PREMIUM FUTURISTIC MARKETPLACE", margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(37, 99, 235);
  doc.text("INVOICE", 150, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  doc.text(`Invoice ID:  INV-${oId}`, 150, 28);
  doc.text(`Date:         ${formatDate(oCreatedAt)}`, 150, 34);

  y = 42;
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text("CUSTOMER DETAILS", margin, y);
  doc.text("DELIVERY DESTINATION", 110, y);

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 2, 95, y + 2);
  doc.line(110, y + 2, pageWidth - margin, y + 2);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);

  const custLines = [
    oCustomerName,
    oEmail ? `Email: ${oEmail}` : "",
    oPhone ? `Phone: ${oPhone}` : "",
  ].filter(Boolean);

  let custY = y;
  custLines.forEach((l) => { doc.text(l, margin, custY); custY += 5; });

  const shipLines = [
    oFullName || oCustomerName,
    oAddress || "No address provided",
    `${oCity || ""}, ${oState || ""} - ${oZip || ""}`,
    oPhone ? `Phone: ${oPhone}` : "",
  ].filter(Boolean);

  let shipY = y;
  shipLines.forEach((l) => { doc.text(l, 110, shipY); shipY += 5; });

  y = Math.max(custY, shipY) + 8;

  checkSpace(12);
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, y, pageWidth - margin * 2, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("PROCURED ITEM DESCRIPTION", margin + 4, y + 5.5);
  doc.text("UNIT PRICE", 120, y + 5.5, { align: "right" });
  doc.text("QTY", 150, y + 5.5, { align: "center" });
  doc.text("TOTAL PRICE", 195, y + 5.5, { align: "right" });
  y += 8;
  doc.setTextColor(55, 65, 81);

  oItems.forEach((item) => {
    const iName = get(item, 'name', 'Name', 'productName', 'ProductName') || '';
    const iPrice = safeNum(get(item, 'price', 'Price', 'unitPrice', 'UnitPrice'));
    const iQty = safeNum(get(item, 'quantity', 'Quantity'));
    const splitName = doc.splitTextToSize(iName, 90);
    const itemH = Math.max(splitName.length * 4.5, 6) + 4;
    checkSpace(itemH + 6);

    y += 2;
    splitName.forEach((ln, i) => doc.text(ln, margin + 4, y + 4 + i * 4.5));

    const ipFmt = formatCurrency(iPrice).replace(/[^\d,.-]/g, "").trim();
    const itFmt = formatCurrency(iPrice * iQty).replace(/[^\d,.-]/g, "").trim();

    doc.text(`${currencyLabel} ${ipFmt}`, 120, y + 4, { align: "right" });
    doc.text(String(iQty), 150, y + 4, { align: "center" });
    doc.text(`${currencyLabel} ${itFmt}`, 195, y + 4, { align: "right" });

    y += Math.max(splitName.length * 4.5, 6);
    doc.setDrawColor(243, 244, 246);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
  });

  y += 10;

  checkSpace(45);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(125, y, pageWidth - margin, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);

  const sFmt = formatCurrency(subtotal).replace(/[^\d,.-]/g, "").trim();
  const shFmt = formatCurrency(shipping).replace(/[^\d,.-]/g, "").trim();
  const tFmt = formatCurrency(tax).replace(/[^\d,.-]/g, "").trim();
  const totFmt = formatCurrency(total).replace(/[^\d,.-]/g, "").trim();

  doc.text("Subtotal:", 150, y, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 65, 81);
  doc.text(`${currencyLabel} ${sFmt}`, 195, y, { align: "right" });

  if (oDiscount > 0) {
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    const pctLabel = oDiscountPercent > 0 ? ` (${oDiscountPercent}% Off)` : '';
    doc.text(`Promo Offer${pctLabel} (${oCouponCode || "Applied"}):`, 150, y, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    const dFmt = formatCurrency(oDiscount).replace(/[^\d,.-]/g, "").trim();
    doc.text(`- ${currencyLabel} ${dFmt}`, 195, y, { align: "right" });
  }

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Postage & Handling:", 150, y, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 65, 81);
  doc.text(`${currencyLabel} ${shFmt}`, 195, y, { align: "right" });

  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Tax (GST):", 150, y, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 65, 81);
  doc.text(`${currencyLabel} ${tFmt}`, 195, y, { align: "right" });

  y += 4;
  doc.setDrawColor(209, 213, 219);
  doc.line(125, y, pageWidth - margin, y);

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text("Total Amount Charged:", 150, y, { align: "right" });
  doc.text(`${currencyLabel} ${totFmt}`, 195, y, { align: "right" });
  doc.setLineWidth(1);
  doc.setDrawColor(37, 99, 235);
  doc.line(125, y + 2, pageWidth - margin, y + 2);

  addFooter();
  doc.save(`Invoice_${oId}.pdf`);
};
