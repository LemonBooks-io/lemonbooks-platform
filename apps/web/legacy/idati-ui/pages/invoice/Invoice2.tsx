import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { useStates } from "../../contexts/StatesContext";
import { useLocation } from "react-router-dom";

export default function Invoice2() {
	const location = useLocation();
	const { selectedOrder, setSelectedOrder, orders, formatDate } = useStates();
	const [qrCodeLink, setQrCodeLink] = useState("");
	const [items, setItems] = useState([]);
	const [invoiceTotals, setInvoiceTotals] = useState(null);

	const path = location.pathname.substring(8);

	useEffect(() => {
		if (orders) {
			setSelectedOrder(
				orders.orders.find((q) => q.orderItems.invoiceNumber === path)
			);
		}
	}, [orders, path]);

	useEffect(() => {
		if (selectedOrder) {
			setQrCodeLink(selectedOrder?.orderReceipt?.qr_code);
			const itemsLoaded = selectedOrder?.orderItems?.items;
			let itemArr = [];
			let totals = {
				totalEx: 0,
				levyATotal: 0,
				levyBTotal: 0,
				levyCTotal: 0,
				levyDTotal: 0,
				levyETotal: 0,
			};

			for (let item of itemsLoaded) {
				const withoutTax = item.unitPrice / 1.15;
				const totalEeach = (
					withoutTax -
					(item.levyAmountA +
						item.levyAmountB +
						item.levyAmountC +
						item.levyAmountE) /
						item.quantity
				).toFixed(3);

				totals = {
					...totals,
					totalEx:
						totals.totalEx + Number((totalEeach * item.quantity).toFixed(3)),
					levyATotal: totals.levyATotal + Number(item.levyAmountA),
					levyBTotal: totals.levyBTotal + Number(item.levyAmountB),
					levyCTotal: totals.levyCTotal + Number(item.levyAmountC),
					levyETotal: totals.levyETotal + Number(item.levyAmountE),
				};

				const eachItem = {
					id: item.itemCode.slice(-15),
					description: item.description,
					quantity: item.quantity,
					unitPriceEx: totalEeach,
					totalPrice: (totalEeach * item.quantity).toFixed(3),
				};
				itemArr.push(eachItem);
			}
			setInvoiceTotals(totals);

			setItems(itemArr);
		}
	}, [selectedOrder]);



	const dynamicUrl = "https://example.com";
	return (
		<div className="p-8 bg-white max-w-4xl mx-auto border rounded-lg shadow-lg">
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-2xl font-bold text-green-600">VAT INVOICE</h1>
					<p className="mt-2 text-sm"></p>
				</div>
				<div>
					{/* <img
            src="https://via.placeholder.com/80" // Replace with your logo URL
            alt="Logo"
            className="w-20"
          /> */}
				</div>
			</div>

			{/* Customer and Vendor Info */}
			<div className="grid grid-cols-2 gap-4 mb-8">
				<div>
					<h2 className="font-bold text-gray-700">CUSTOMER:</h2>
					<p>{selectedOrder?.orderItems?.businessPartnerName}</p>
					<p className="text-sm text-gray-600">
						Customer TIN: {selectedOrder?.orderItems?.businessPartnerTin}
					</p>
					<p className="text-sm text-gray-600">
						Invoice No: {selectedOrder?.orderItems?.invoiceNumber}
					</p>
					<p className="text-sm text-gray-600">
						Date: {formatDate(selectedOrder?.orderItems?.transactionDate)}
					</p>
				</div>
				<div>
					<h2 className="font-bold text-gray-700">VENDOR:</h2>
					<p>Ghana Cup Coffee</p>
					<p className="text-sm text-gray-600">
						Vendor TIN: {selectedOrder?.orderReceipt?.distributor_tin}
					</p>
					<p className="text-sm text-gray-600">
						Due Date: {formatDate(selectedOrder?.orderItems?.transactionDate)}
					</p>
					<p className="text-sm text-gray-600">
						Currency: {selectedOrder?.orderItems?.currency}
					</p>
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
					{items.map((item, index) => (
						<tr key={index}>
							<td className="border border-gray-300 p-2">{item?.id}</td>
							<td className="border border-gray-300 p-2">{item.description}</td>
							<td className="border border-gray-300 p-2">
								{item?.unitPriceEx}
							</td>
							<td className="border border-gray-300 p-2">{item.quantity}</td>
							<td className="border border-gray-300 p-2">{item?.totalPrice}</td>
						</tr>
					))}
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
								<td className="text-right">
									{invoiceTotals?.totalEx.toFixed(3)}
								</td>
							</tr>
							<tr>
								<td className="text-gray-600">NHIL (2.5%):</td>
								<td className="text-right">
									{invoiceTotals?.levyATotal.toFixed(3)}
								</td>
							</tr>
							<tr>
								<td className="text-gray-600">GetFund Levy (2.5%):</td>
								<td className="text-right">
									{" "}
									{invoiceTotals?.levyBTotal.toFixed(3)}
								</td>
							</tr>
							<tr>
								<td className="text-gray-600">Covid Levy (1%):</td>
								<td className="text-right">
									{" "}
									{invoiceTotals?.levyCTotal.toFixed(3)}
								</td>
							</tr>
							<tr>
								<td className="text-gray-600">Tourism Levy (1%):</td>
								<td className="text-right">
									{" "}
									{invoiceTotals?.levyETotal.toFixed(3)}
								</td>
							</tr>

							<tr>
								<td className="text-gray-600">Total VAT (15%):</td>
								<td className="text-right">
									{selectedOrder?.orderItems?.totalVat.toFixed(3)}
								</td>
							</tr>
							<tr className="font-bold">
								<td className="text-gray-700">Total:</td>
								<td className="text-right">
									{selectedOrder?.orderItems?.totalAmount}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			{/* Footer with SDC Information and QR Code */}
			<div className="grid grid-cols-2  border-t pt-4">
				<div className="text-sm text-gray-600">
					<h2 className="font-bold text-gray-700 mb-2">SDC INFORMATION:</h2>
					<p>
						<span className="font-bold">SDC ID:</span>{" "}
						{selectedOrder?.orderReceipt?.message?.ysdcid}
					</p>
					<p>
						<span className="font-bold">Item Count:</span>{" "}
						{selectedOrder?.orderReceipt?.message?.ysdcitems}
					</p>
					<p>
						<span className="font-bold">Receipt Number:</span>{" "}
						{selectedOrder?.orderReceipt?.message?.ysdcrecnum}
					</p>
					<p>
						<span className="font-bold">Receipt Date & Time:</span>{" "}
						{selectedOrder?.orderReceipt?.message?.ysdctime}
					</p>
					<p>
						<span className="font-bold">MRC:</span>{" "}
						{selectedOrder?.orderReceipt?.message?.ysdcmrc}
					</p>
					<p>
						<span className="font-bold">Internal Data:</span>{" "}
						{selectedOrder?.orderReceipt?.message?.ysdcintdata}
					</p>
					<p>
						<span className="font-bold">Receipt Signature:</span>{" "}
						{selectedOrder?.orderReceipt?.message?.ysdcregsig}
					</p>
				</div>
				<div className="flex justify-end items-center">
					<QRCode value={qrCodeLink} className="h-[200px]" />
				</div>
			</div>
		</div>
	);
}
