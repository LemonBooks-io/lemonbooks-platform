import React from "react";
import QRCode from "react-qr-code";

export default function InvoiceReceipt() {
  const qrCodeData = "https://example.com/receipt/NS230811"; // Replace with actual data

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-72 p-4 bg-white shadow-lg rounded-lg">
        {/* Company Info */}
        <div className="text-center">
          <p className="font-bold">ABC COMPANY LTD.</p>
          <p>CXX000000YY</p>
          <p>ACCRA</p>
          <p>INVOICE #: NS230811</p>
        </div>

        {/* Server and Customer Details */}
        <div className="mt-4">
          <p className="text-sm">
            <strong>Served by:</strong> Fred
          </p>
          <p className="text-sm">
            <strong>Date:</strong> 27th Oct, 2023
          </p>
          <p className="text-sm">
            <strong>Time:</strong> 10:53
          </p>
          <p className="text-sm mt-2">
            <strong>Customer Details</strong>
          </p>
          <p className="text-sm">Name: Cash</p>
        </div>

        {/* Item List */}
        <div className="mt-4 border-t border-b border-gray-300 py-2">
          <div className="flex justify-between text-sm font-semibold">
            <p>Qty</p>
            <p>Item</p>
            <p>Price</p>
          </div>
          <div className="flex justify-between text-sm">
            <p>1</p>
            <p>Fridge</p>
            <p>GH₵ 1300.00</p>
          </div>
        </div>

        {/* Totals Section */}
        <div className="mt-4 text-sm">
          <div className="flex justify-between">
            <p>Sub-total</p>
            <p>1300.00</p>
          </div>
          <div className="flex justify-between">
            <p>Discount</p>
            <p>0.00</p>
          </div>
          <div className="flex justify-between">
            <p>NHIL (2.5%)</p>
            <p>26.66</p>
          </div>
          <div className="flex justify-between">
            <p>GETFund (2.5%)</p>
            <p>26.66</p>
          </div>
          <div className="flex justify-between">
            <p>COVID (1%)</p>
            <p>10.66</p>
          </div>
          <div className="flex justify-between">
            <p>CST (5%)</p>
            <p>0.00</p>
          </div>
          <div className="flex justify-between">
            <p>Tourism (1%)</p>
            <p>0.00</p>
          </div>
          <div className="flex justify-between">
            <p>VAT (15%)</p>
            <p>169.57</p>
          </div>
          <div className="flex justify-between font-bold mt-2">
            <p>Total</p>
            <p>GH₵ 1300.00</p>
          </div>
        </div>

        {/* SDC Information */}
        <div className="mt-4 text-sm">
          <p className="font-bold">SDC Information</p>
          <p>SDC ID: EV-266623-001</p>
          <p>Item Count: 1</p>
          <p>Receipt Number: 41906NS</p>
          <p>Receipt Date & Time: Fri, 27/10/23 10:53</p>
          <p>MRC: 90-AC-98-RC-08-23</p>
          <p>Internal Data: OH4GDQKS5FYW5H6P4BRX</p>
          <p>Receipt Signature: JTHYWUUMSDRZOI</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mt-4">
          {/* <QRCode value={qrCodeData} size={120} level="M" /> */}
          <QRCode value={qrCodeData} className="h-[200px]" />
        </div>
      </div>
    </div>
  );
}
