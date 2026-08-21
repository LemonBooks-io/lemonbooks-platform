/* eslint-disable react/prop-types */
/* eslint-disable no-mixed-spaces-and-tabs */
import { useEffect, useRef, useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { calculateTotal } from "../../utils/helper-functions";
import Button from "../../components/Button";
import PaymentOptionModal from "../customer-hub/PaymentOptionModal";
import axios from "axios";
import { postRequest } from "../../utils/fetch-function";

export default function CustomerInvoiceEstimatePrint({ type }) {
	const location = useLocation();
	const {
		setSelectedOrder,
		orders,
		formatDate,
		invoices,
		selectedInvoice,
		setSelectedInvoice,
		formatUtcToLocalTime,
		businessInfo,
		toast,
		tenant,
		BASE_URL,
		triggerUpdate,
		userProfile,
	} = useStates();
	const invoiceRef = useRef();
	const buttonRef = useRef(null);
	const buttonRef2 = useRef(null);

	const path = location.pathname.substring(8);
	const [filtering, setFiltering] = useState(true);

	const { id } = useParams();

	const navigate = useNavigate();

	useEffect(() => {
		if (invoices?.invoices?.length > 0) {
			const selectedInv = invoices?.invoices?.find(
				(invoice) => invoice?.invoiceNumber === id
			);
			setSelectedInvoice(selectedInv);
			setFiltering(false);
		}
	}, [invoices?.invoices, id, setSelectedInvoice]);

	useEffect(() => {
		if (orders) {
			setSelectedOrder(
				orders.orders.find((q) => q.orderItems.invoiceNumber === path)
			);
		}
	}, [orders, path, setSelectedOrder]);

	const downloadPdf = () => {
		const input = invoiceRef.current;
		const button = buttonRef.current;
		const button2 = buttonRef2.current;

		if (!input) return;

		// Hide the button before generating the canvas
		if (button) {
			button.style.display = "none";
			if (type === "invoice") {
				button2.style.display = "none";
			}
		}

		// Wait a tick to ensure the UI has re-rendered
		setTimeout(() => {
			html2canvas(input, {
				scale: 2,
				useCORS: true,
				allowTaint: true,
				logging: false,
			}).then((canvas) => {
				const imgData = canvas.toDataURL("image/png");
				const pdf = new jsPDF("p", "mm", "a4");
				const imgProps = pdf.getImageProperties(imgData);
				const pdfWidth = pdf.internal.pageSize.getWidth();
				const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
				pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
				pdf.save(
					`${
						type === "invoice" || type === "payment" ? "invoice" : "estimate"
					}-${selectedInvoice?.invoiceNumber || "file"}.pdf`
				);

				// Show the button again
				if (button) {
					button.style.display = "inline-block";

					if (type === "invoice") {
						button2.style.display = "flex";
					}
				}
			});
		}, 100);
	};

	const buttons = [
		{
			id: 1,
			name: "Download",
			icon: "/editIcon.svg",
			onClick: () => {
				downloadPdf();
			},
		},
		{
			id: 2,
			name: "Close",
			icon: "/resendIcon.svg",
			onClick: () => {
				type === "invoice"
					? navigate("/")
					: type === "payment"
					? navigate("/customer-payments")
					: navigate("/customer-estimates");
			},
		},
		...(type === "estimate" && selectedInvoice?.status !== "APPROVED"
			? [
					{
						id: 3,
						name: "Approve",
						icon: "/sendIcon.svg",
						onClick: () => {
							toast.info("Under Development...");
						},
					},
					{
						id: 4,
						name: "Reject",
						icon: "/editIcon.svg",
						onClick: () => {
							toast.info("Under Development...");
						},
					},
			  ]
			: []),
	];

	const [processing, setProcessing] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [paymentLinks, setPaymentLinks] = useState({ tap: null, custom: null });

	async function handleMergeInvoice() {
		setProcessing(true);

		const response = await postRequest(
			"invoices/payment-links",
			{
				invoiceIds: [selectedInvoice.id],
			},
			userProfile?.accessToken,
			""
		);

		if (response) {
			setPaymentLinks((pre) => ({
				...pre,
				tap: response?.data?.tapInvoiceUrl,
				custom: response?.data?.customInvoiceUrl,
			}));
		}

		setIsOpen(true);

		setProcessing(false);
	}

	function afterWaitProcessess() {
		setIsOpen(false);
		setProcessing(false);
		triggerUpdate();
	}

	async function waitWhileInvoiceIsUnpaid(maxRetries = 6, delayMs = 10000) {
		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			setProcessing(true);
			const config = {
				headers: {
					"Content-Type": "application/json",
					"X-Tenant-ID": tenant,

					Accept: "application/json", // Include this if the server checks `Accept` headers
				},
			};

			const res = await axios.get(
				`${BASE_URL}/api/v2/invoices/${selectedInvoice.id}`,
				config
			);

			if (res?.data?.data?.status !== "UNPAID") {
				toast?.success("Payment has been received!");
				afterWaitProcessess();
				return;
			}

			if (attempt < maxRetries) {
				console.log(
					`Attempt ${attempt}: status is 'UNPAID', retrying in ${
						delayMs / 1000
					}s...`
				);
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			} else {
				console.log(
					`Attempt ${attempt}: status still 'UNPAID', max retries reached, continuing anyway.`
				);
				afterWaitProcessess();
			}
		}
	}

	return (
		<>
			{filtering ? (
				<div className="flex justify-center py-6">
					<div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
				</div>
			) : (
				<div className="px-4">
					<PaymentOptionModal
						processing={processing}
						isOpen={isOpen}
						setIsOpen={setIsOpen}
						paymentLinks={paymentLinks}
						waitWhileInvoiceIsUnpaid={waitWhileInvoiceIsUnpaid}
						setProcessing={setProcessing}
					/>

					<div className="max-w-4xl mt-6 justify-end flex gap-2 mx-auto p-1 rounded-md text-sm text-gray-800">
						{buttons?.map((button) => (
							<button
								title={`
									${
										(button.name === "Approve" || button.name === "Reject") &&
										"Under Development"
									}
									
								`}
								onClick={button.onClick}
								key={button?.id}
								type="button"
								className={`ml-4 h-[50px] lg:ml-0 mt-2 inline-flex  items-center justify-center w-[200px] px-4 py-3 text-sm font-semibold leading-5 text-grey-700 transition-all duration-200 bg-gray-300 border border-transparent rounded-sm`}
							>
								<img className="w-5 h-5 mr-1 " src={button?.icon} />
								{button?.name} {button?.name === "Send Reminder" ? "" : type}
							</button>
						))}
					</div>

					<div
						ref={invoiceRef}
						className="bg-white p-10 max-w-4xl mt-2 mx-auto text-sm text-gray-800 border rounded-lg shadow-lg"
					>
						{/* Header */}
						<div>
							{" "}
							<div className="flex justify-between mb-10">
								<div>
									<h2 className="text-lg font-bold mb-2 uppercase text-gray-700">
										Billed To
									</h2>
									<p>
										{selectedInvoice?.customer?.company
											? `${selectedInvoice?.customer?.company} (${selectedInvoice?.customer?.first_name}
								${selectedInvoice?.customer?.last_name})`
											: `(${selectedInvoice?.customer?.first_name}
								${selectedInvoice?.customer?.last_name})`}
									</p>
									<p>
										{selectedInvoice?.customer?.address &&
											selectedInvoice?.customer?.address}
									</p>

									<p>
										{selectedInvoice?.customer?.phone &&
											selectedInvoice?.customer?.phone.country_code +
												" " +
												selectedInvoice?.customer?.phone.number}
									</p>
								</div>
								<div className="text-right">
									<h2 className="text-lg font-bold uppercase text-gray-700 mb-2">
										{businessInfo?.logoUrl ? (
											<img
												src={businessInfo.logoUrl}
												className="w-28 h-auto ml-auto"
											/>
										) : (
											<svg
												className="w-20 h-auto ml-auto"
												viewBox="0 0 80 80"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M68.0543 1.67383H11.9874C6.29189 1.67383 1.6748 6.29092 1.6748 11.9864V68.0534C1.6748 73.7488 6.29189 78.3659 11.9874 78.3659H68.0543C73.7498 78.3659 78.3669 73.7488 78.3669 68.0534V11.9864C78.3669 6.29092 73.7498 1.67383 68.0543 1.67383Z"
													fill="#2563EB"
												/>
												<path
													d="M26.1288 26.252H13.3455C11.7405 26.252 10.4395 27.553 10.4395 29.158V66.2929C10.4395 67.8979 11.7405 69.1989 13.3455 69.1989H26.1288C27.7337 69.1989 29.0348 67.8979 29.0348 66.2929V29.158C29.0348 27.553 27.7337 26.252 26.1288 26.252Z"
													fill="white"
												/>
												<path
													d="M47.9484 50.0547H35.7983C34.2728 50.0547 33.0361 51.0171 33.0361 52.2044V67.0678C33.0361 68.255 34.2728 69.2175 35.7983 69.2175H47.9484C49.4739 69.2175 50.7106 68.255 50.7106 67.0678V52.2044C50.7106 51.0171 49.4739 50.0547 47.9484 50.0547Z"
													fill="white"
												/>
												<path
													d="M72.5784 26.2521C72.5784 29.8581 71.5091 33.3832 69.5057 36.3816C67.5022 39.3799 64.6547 41.7168 61.3231 43.0968C57.9916 44.4768 54.3256 44.8378 50.7888 44.1343C47.2521 43.4308 44.0033 41.6943 41.4535 39.1445C38.9036 36.5946 37.1671 33.3459 36.4636 29.8091C35.7601 26.2723 36.1212 22.6064 37.5012 19.2748C38.8811 15.9432 41.218 13.0957 44.2164 11.0923C47.2147 9.08885 50.7398 8.01953 54.3458 8.01953L54.3458 26.2521H72.5784Z"
													fill="white"
												/>
											</svg>
										)}
									</h2>

									<p>
										{businessInfo?.name ? `${businessInfo?.name}` : `LemonBooks`}
									</p>
									<p>{businessInfo?.address}</p>
								</div>
							</div>
						</div>

						{/* Invoice Metadata */}
						<div className="flex justify-between border-b-4 border-purple-600 py-3 mb-6 font-medium">
							<div>
								<p>
									Date Issued:{" "}
									<span className="font-semibold">
										{selectedInvoice?.createdAt
											? formatUtcToLocalTime(selectedInvoice?.createdAt)
											: ""}
									</span>
								</p>
								<p>
									{type === "payment" ? `Payment Date: ` : `Due Date: `}
									{type === "payment" ? (
										<span className="font-semibold">
											{formatDate(selectedInvoice?.updatedAt)}
										</span>
									) : (
										<span className="font-semibold">
											{formatDate(selectedInvoice?.due)}
										</span>
									)}
								</p>
							</div>
							<div className="text-right">
								<p>
									{type === "invoice" || type === "payment"
										? "Invoice Number"
										: "Estimate Number"}
									:{" "}
									<span className="font-semibold">
										{selectedInvoice?.invoiceNumber}
									</span>
								</p>
								<p className="text-purple-700 font-bold text-lg">
									{type === "payment"
										? `Amount Paid: ${calculateTotal(
												selectedInvoice?.order?.items
										  ).toFixed(3)}`
										: `Amount Due: ${calculateTotal(
												selectedInvoice?.order?.items
										  ).toFixed(3)}`}
								</p>
								<p>
									{selectedInvoice.paymentMethod === "UNSELECTED"
										? ""
										: `Payment Method: ${selectedInvoice.paymentMethod}`}
								</p>
							</div>
						</div>

						{/* Table of Items */}
						<table className="w-full text-left mb-6">
							<thead>
								<tr className="text-purple-700 text-sm uppercase tracking-wider">
									<th className="py-2">Products</th>
									<th className="py-2 text-center">Rate</th>
									<th className="py-2 text-center">Discount</th>
									<th className="py-2 text-center">Qty</th>
									<th className="py-2 text-right">Amount</th>
								</tr>
							</thead>
							<tbody>
								{selectedInvoice?.order?.items?.map((item, index) => (
									<tr key={index} className="border-b border-gray-300 text-sm">
										<td className="py-2">
											<p className="font-medium">{item.name}</p>
											<pre className="text-xs text-gray-500">
												{item.description}
											</pre>
										</td>
										<td className="py-2 text-center">
											{(Number(item?.amount) || 0).toFixed(3)} {item?.currency}
										</td>
										<td className="py-2 text-center">
											{(Number(item?.discount) || 0).toFixed(3)}{" "}
											{item?.currency}
										</td>
										<td className="py-2 text-center">{item?.quantity}</td>
										<td className="py-2 text-right">
											{Number(
												((item?.amount || 0) - (item?.discount || 0)) *
													(item?.quantity || 1)
											).toFixed(3)}
											{item?.currency}
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{/* Summary */}
						<div className="grid grid-cols-2 gap-8">
							<div />
							<div>
								<table className="w-full text-sm mb-4">
									<tbody>
										<tr>
											<td className="py-1 text-gray-600">Subtotal</td>
											<td className="text-right">
												{Number(selectedInvoice?.order?.amount).toFixed(3)}{" "}
												{selectedInvoice?.order?.currency}
											</td>
										</tr>
										<tr>
											<td className="py-1 text-gray-600">Discount</td>
											<td className="text-right">
												-
												{selectedInvoice?.order?.items
													?.reduce((acc, next) => {
														const discount = next.discount
															? Number(next.discount)
															: 0;
														const quantity = next.quantity
															? Number(next.quantity)
															: 0;

														return acc + discount * quantity;
													}, 0)
													.toFixed(3) || "0.000"}{" "}
												{selectedInvoice?.order.currency}
											</td>
										</tr>
										<tr>
											<td className="py-1 text-gray-600">Tax</td>
											<td className="text-right">
												+ {selectedInvoice?.order?.tax?.toFixed(3) || "0.000"}{" "}
												{selectedInvoice?.order.currency}
											</td>
										</tr>
										<tr className="text-lg font-bold border-t border-purple-600 mt-2">
											<td className="py-2">Total</td>
											<td className="text-right">
												{calculateTotal(selectedInvoice?.order?.items).toFixed(
													3
												)}{" "}
												{selectedInvoice?.order?.currency}
											</td>
										</tr>
									</tbody>
								</table>

								<div className="border-t-4 border-purple-600 py-2 font-bold text-purple-700 flex justify-between text-sm">
									<span>
										{type === "payment" ? "Amount Paid" : "Amount Due"}
									</span>
									<span>
										{calculateTotal(selectedInvoice?.order?.items).toFixed(3)}{" "}
										{selectedInvoice?.order?.currency}
									</span>
								</div>
							</div>
						</div>

						{/* Notes and Terms */}
						<div className="flex justify-between  items-center mt-10">
							<div className="text-sm">
								<div className="mb-3">
									<h3 className="font-semibold text-gray-700 mb-1">Remark</h3>
									<p>
										{selectedInvoice?.remarks || "Thank you for your business!"}
									</p>
								</div>
								<div></div>
							</div>

							<div className="">
								{selectedInvoice?.status === "UNPAID" && (
									<div className="flex w-full max-w-[250px] mt-2">
										<Button
											isLoading={processing}
											message="Processing..."
											onClick={handleMergeInvoice}
										>
											Make Payment
										</Button>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
