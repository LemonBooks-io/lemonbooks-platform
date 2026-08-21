/* eslint-disable react/prop-types */
/* eslint-disable no-mixed-spaces-and-tabs */
import { useEffect, useRef, useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { postRequest } from "../../utils/fetch-function";
import { calculateTotal } from "../../utils/helper-functions";

export default function InvoiceEstimatePrint({ type }) {
	const location = useLocation();
	const {
		selectedOrder,
		setSelectedOrder,
		orders,
		formatDate,
		invoices,
		selectedInvoice,
		setSelectedInvoice,
		toast,
		formatUtcToLocalTime,
		setAllItems,
		businessInfo,
		userProfile,
		triggerUpdate,
	} = useStates();

	const invoiceRef = useRef();
	const buttonRef = useRef(null);
	const buttonRef2 = useRef(null);

	const path = location.pathname.substring(8);
	const [isLoading, setIsLoading] = useState(false);
	const [isConverting, setIsConverting] = useState(false);

	const { id } = useParams();

	const navigate = useNavigate();

	useEffect(() => {
		if (invoices?.invoices?.length > 0) {
			const selectedInv = invoices?.invoices?.find(
				(invoice) => invoice?.invoiceNumber === id,
			);
			setSelectedInvoice(selectedInv);
		}
	}, [invoices?.invoices, id, setSelectedInvoice]);

	useEffect(() => {
		if (orders) {
			setSelectedOrder(
				orders.orders.find((q) => q.orderItems.invoiceNumber === path),
			);
		}
	}, [orders, path, setSelectedOrder]);

	useEffect(() => {
		if (selectedOrder) {
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
				const withoutTax = item?.unitPrice / 1.15;
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
		}
	}, [selectedOrder]);

	async function waitForImages(element) {
		const images = element.querySelectorAll("img");

		await Promise.all(
			[...images].map(
				(img) =>
					new Promise((resolve) => {
						if (img.complete) resolve();
						else img.onload = resolve;
					}),
			),
		);
	}

	const downloadPdf = async () => {
		const input = invoiceRef.current;
		const button = buttonRef.current;
		const button2 = buttonRef2.current;

		if (!input) return;

		// Hide the button before generating the canvas
		if (button) {
			button.style.display = "none";
			if (type === "invoice" && button2) {
				button2.style.display = "none";
			}
		}

		await waitForImages(input);

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
				pdf.save(`invoice-${selectedInvoice?.invoiceNumber || "file"}.pdf`);

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
		...(type === "invoice" && selectedInvoice.status !== "VOID"
			? [
					{
						id: 1,
						name: isLoading ? "Resending" : "Resend",
						icon: "/resendIcon.svg",
						onClick: async () => {
							try {
								setIsLoading(true);
								await postRequest(
									`invoices/${selectedInvoice?.id}/resend`,
									{},
									userProfile?.accessToken,
								);

								toast.success(`${"Invoice resent successfully"}`);
								navigate(-1);
							} catch (err) {
								toast?.error(err?.response?.data?.error);
								console.error(err);
								return;
							} finally {
								setIsLoading(false);
							}
						},
					},
				]
			: []),

		...(type === "estimate" && selectedInvoice.status !== "APPROVED"
			? [
					{
						id: 1,
						name: isLoading ? "Resending" : "Resend",
						icon: "/resendIcon.svg",
						onClick: async () => {
							try {
								setIsLoading(true);
								await postRequest(
									`invoices/${selectedInvoice?.id}/resend`,
									{},
									userProfile?.accessToken,
								);

								toast.success(`${"Estimate resent successfully"}`);
								navigate(-1);
							} catch (err) {
								toast?.error(err?.response?.data?.error);
								console.error(err);
								return;
							} finally {
								setIsLoading(false);
							}
						},
					},
					{
						id: 2,
						name: isConverting
							? "Converting..."
							: selectedInvoice?.status !== "DELIVERED"
								? "Converted"
								: "Convert to Invoice",
						icon: "/reminderIcon.svg",
						onClick: async () => {
							const due = new Date();
							due.setDate(due.getDate() + 1);
							const dueDate = due.getTime();

							const expiry = new Date();
							expiry.setDate(expiry.getDate() + 7);
							const expiryDate = due.getTime();

							try {
								setIsConverting(true);
								const res = await postRequest(
									`invoices/convert-estimate/${selectedInvoice?.id}`,
									{ due: dueDate, expiry: expiryDate },
									userProfile?.accessToken,
								);

								if (res.success) {
									toast.success(res.message);
									navigate(-1);
									triggerUpdate();
								}
							} catch (err) {
								toast?.error(err?.response?.data?.error);
								console.error(err);
								return;
							} finally {
								setIsConverting(false);
							}
						},
					},
				]
			: []),
		{
			id: 3,
			name: "Reuse ",
			icon: "/reuseIcon.svg",
			onClick: () => {
				navigate(`/${type}s/create`);
				setAllItems(selectedInvoice?.order?.items);
			},
		},
	];

	return (
		<>
			<div className="max-w-4xl mt-6 flex flex-wrap justify-end gap-2 mx-auto p-1 rounded-md text-sm text-gray-800">
				{buttons?.map((button) => (
					<button
						onClick={button?.onClick}
						disabled={isLoading || isConverting}
						key={button?.id}
						type="button"
						className={`ml-4 h-[50px] lg:ml-0 mt-2 inline-flex w-full sm:max-w-[200px] disabled:cursor-not-allowed items-center justify-center px-4 py-3 text-sm font-semibold leading-5 text-grey-700 transition-all duration-200 bg-gray-300 border border-transparent rounded-sm`}
					>
						<img className="w-5 h-5 mr-1 " src={button?.icon} />
						{button?.name === "Convert to Invoice"
							? button?.name
							: button?.name + " " + type}
					</button>
				))}
			</div>
			<div
				ref={invoiceRef}
				className="bg-white p-10 max-w-4xl mt-2 mx-auto  rounded-md text-sm text-gray-800 border shadow-lg"
			>
				<div>
					<div className="flex justify-end mb-4">
						<button
							onClick={downloadPdf}
							ref={buttonRef}
							className="cursor-pointer print:hidden"
							aria-label="Download PDF"
						>
							<svg
								className="h-7 w-7 text-gray-700"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M18 20H6C5.73 20 5.48 19.89 5.29 19.71C5.1 19.52 5 19.26 5 19C5 18.73 5.1 18.48 5.29 18.29C5.48 18.11 5.73 18 6 18H18C18.27 18 18.52 18.11 18.71 18.29C18.9 18.48 19 18.73 19 19C19 19.26 18.9 19.52 18.71 19.71C18.52 19.89 18.27 20 18 20Z"
									fill="currentColor"
								/>
								<path
									d="M15.92 11.62C15.84 11.44 15.72 11.28 15.55 11.17C15.39 11.06 15.2 11 15 11H13V5C13 4.73 12.89 4.48 12.71 4.29C12.52 4.11 12.26 4 12 4C11.73 4 11.48 4.11 11.29 4.29C11.1 4.48 11 4.73 11 5V11H9C8.8 11 8.61 11.06 8.44 11.17C8.28 11.28 8.15 11.44 8.08 11.62C8 11.8 7.98 12 8.02 12.2C8.06 12.39 8.15 12.57 8.29 12.71L11.29 15.71C11.38 15.8 11.5 15.87 11.62 15.92C11.74 15.97 11.87 16 12 16C12.13 16 12.26 15.97 12.38 15.92C12.5 15.87 12.61 15.8 12.71 15.71L15.71 12.71C15.85 12.57 15.94 12.39 15.98 12.2C16.02 12 16 11.8 15.92 11.62Z"
									fill="currentColor"
								/>
							</svg>
						</button>
					</div>
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

							<p>{businessInfo?.name ? `${businessInfo?.name}` : `LemonBooks`}</p>
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
								{selectedInvoice?.createdAt &&
									formatUtcToLocalTime(selectedInvoice?.createdAt)}
							</span>
						</p>
						<p>
							Due Date:{" "}
							<span className="font-semibold">
								{selectedInvoice?.due && formatDate(selectedInvoice?.due)}
							</span>
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
										selectedInvoice?.order?.items,
									).toFixed(3)}`
								: `Amount Due: ${calculateTotal(
										selectedInvoice?.order?.items,
									).toFixed(3)}`}
						</p>
						<p>
							{selectedInvoice?.paymentMethod === "UNSELECTED"
								? ""
								: `Payment Method: ${selectedInvoice?.paymentMethod}`}
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
									{(Number(item?.discount) || 0).toFixed(3)} {item?.currency}
								</td>
								<td className="py-2 text-center">{item?.quantity}</td>
								<td className="py-2 text-right">
									{Number(
										((item?.amount || 0) - (item?.discount || 0)) *
											(item?.quantity || 1),
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
										{calculateTotal(selectedInvoice?.order?.items).toFixed(3)}{" "}
										{selectedInvoice?.order?.currency}
									</td>
								</tr>
							</tbody>
						</table>

						<div className="border-t-4 border-purple-600 py-2 font-bold text-purple-700 flex justify-between text-sm">
							<span>Amount Due</span>
							<span>
								{" "}
								{calculateTotal(selectedInvoice?.order?.items).toFixed(3)}{" "}
								{selectedInvoice?.order?.currency}
							</span>
						</div>
					</div>
				</div>

				{/* Notes and Terms */}

				<div className="flex justify-between  items-center mt-10 ">
					<div className=" text-sm">
						<div className="mb-3">
							<h3 className="font-semibold text-gray-700 mb-1">Remark</h3>
							<p>
								{selectedInvoice?.remarks || "Thank you for your business!"}
							</p>
						</div>
						<div></div>
					</div>
				</div>
			</div>
		</>
	);
}
