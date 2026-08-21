import React from "react";

export default function Invoice() {
  return (
    <div className="p-8 bg-white max-w-4xl mx-auto border rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-green-600">VAT INVOICE</h1>
          <p className="mt-2 text-sm">GRA</p>
        </div>
        <div>
          <img
            src="https://via.placeholder.com/80" // Replace with your logo URL
            alt="Logo"
            className="w-20"
          />
        </div>
      </div>

      {/* Customer and Vendor Info */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <h2 className="font-bold text-gray-700">CUSTOMER:</h2>
          <p>fred (cash customer)</p>
          <p className="text-sm text-gray-600">Customer TIN: VC000000090</p>
          <p className="text-sm text-gray-600">Invoice No: 2306130907</p>
          <p className="text-sm text-gray-600">Date: 13 Jun 2023</p>
        </div>
        <div>
          <h2 className="font-bold text-gray-700">VENDOR:</h2>
          <p>Spring Data Works Limited</p>
          <p className="text-sm text-gray-600">Vendor TIN: C0034186913</p>
          <p className="text-sm text-gray-600">Due Date: 13 Jun 2023</p>
          <p className="text-sm text-gray-600">Currency: GHS</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-8 border-collapse border border-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Item Code</th>
            <th className="border border-gray-300 p-2">Item Description</th>
            <th className="border border-gray-300 p-2">Item Price</th>
            <th className="border border-gray-300 p-2">Quantity</th>
            <th className="border border-gray-300 p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-300 p-2">TXC00813115822</td>
            <td className="border border-gray-300 p-2">Air Frame</td>
            <td className="border border-gray-300 p-2">950.00</td>
            <td className="border border-gray-300 p-2">10.00</td>
            <td className="border border-gray-300 p-2">950.00</td>
          </tr>
        </tbody>
      </table>

      {/* Remarks and Totals */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <h2 className="font-bold text-gray-700">Remarks:</h2>
          <p>No remarks</p>
        </div>
        <div>
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="text-gray-600">Total (Excl. Taxes):</td>
                <td className="text-right">950.00</td>
              </tr>
              <tr>
                <td className="text-gray-600">NHIL (2.5%):</td>
                <td className="text-right">23.75</td>
              </tr>
              <tr>
                <td className="text-gray-600">GetFund Levy (2.5%):</td>
                <td className="text-right">23.75</td>
              </tr>
              <tr>
                <td className="text-gray-600">Covid Levy (1%):</td>
                <td className="text-right">9.50</td>
              </tr>
              <tr>
                <td className="text-gray-600">Total VAT (15%):</td>
                <td className="text-right">151.05</td>
              </tr>
              <tr className="font-bold">
                <td className="text-gray-700">Total:</td>
                <td className="text-right">1,158.05</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-4">
        <p className="text-sm text-gray-600">
          SDC ID: VS00000027 | Receipt No: 11083 | Receipt Signature:
          FYCLDZK7U1UOLQ
        </p>
      </div>
    </div>
  );
}
