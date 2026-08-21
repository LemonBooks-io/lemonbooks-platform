import { useEffect, useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import LoadingModal from "../loading/LoadingModal";

import axios from "axios";
import Button from "../../components/Button";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PaymentStatus from "./PaymentStatus";
import { calculateTotal } from "../../utils/helper-functions";
import { useNavigate } from "react-router-dom";

export default function CustomPaymentPage() {
	const [invoiceToPay, setInvoiceToPay] = useState(null);
	const [isLoading, setIsLoading] = useState(null);

	const navigate = useNavigate();

	const [paymentBody, setPaymentBody] = useState({
		referenceId: "",
		paymentMethod: "",
		otherPaymentMethod: "",
		image: null,
		additionalDetails: "",
	});

	const urlParams = new URLSearchParams(window.location.search);
	const invoiceId = urlParams.get("invoiceId");

	const {
		tenant,
		BASE_URL,
		toast,
		formatDate,
		setIsFetching,
		isFetching,
		triggerUpdate,
		updateData,
	} = useStates();

	const handleImageUpload = (event) => {
		const file = event.target.files[0];
		if (file) {
			setPaymentBody((cur) => ({
				...cur,
				image: file,
			}));
		}
	};

	useEffect(() => {
		async function fetchInvoiceData() {
			setIsFetching(true);
			const config = {
				headers: {
					"Content-Type": "application/json",
					"X-Tenant-ID": tenant,

					Accept: "application/json", // Include this if the server checks `Accept` headers
				},
			};

			const res = await axios.get(
				`${BASE_URL}/api/v2/invoices/${invoiceId}`,
				config
			);

			setInvoiceToPay(res?.data?.data);
			setIsFetching(false);
		}

		if (invoiceId && tenant) {
			fetchInvoiceData();
		}
	}, [tenant, invoiceId, updateData, setIsFetching, BASE_URL]);

	async function handleUpload() {
		const formData = new FormData();
		formData.append("image", paymentBody.image);
		formData.append("referenceId", paymentBody.referenceId);
		formData.append("paymentMethod", paymentBody.paymentMethod);
		formData.append("otherPaymentMethod", paymentBody.otherPaymentMethod);
		formData.append("additionalDetails", paymentBody.additionalDetails);

		const config = {
			headers: {
				"X-Tenant-ID": tenant,
			},
		};

		setIsLoading(true);

		try {
			const res = await axios.post(
				`${BASE_URL}/api/v2/payment/upload-payment-proof/${invoiceId}`,
				formData,
				config
			);

			toast?.success(res?.data?.message);
			triggerUpdate();

			setTimeout(() => {
				window.close();
			}, 800);
		} catch (e) {
			toast.error(e?.response?.data?.error);
		} finally {
			setIsLoading(false);
		}
	}

	useEffect(() => {
		if (!invoiceToPay) return;

		if (
			invoiceToPay.status === "PAID" ||
			invoiceToPay.status === "REQUIRE_APPROVAL"
		) {
			navigate("/", { replace: true });
		}
	}, [invoiceToPay, navigate]);

	return (
		<section className="py-12 bg-white ">
			{/* <LoadingModal /> */}
			<>
				{/* Header */}

				{/* Invoice Metadata */}
				{isFetching ? (
					<LoadingModal />
				) : invoiceToPay === null ? (
					<LoadingModal />
				) : (
					<div className="bg-white p-10 max-w-4xl mt-2 mx-auto text-sm text-gray-800 border rounded-lg shadow-lg">
						<div className="flex justify-between border-b-4 border-gray-600 py-3 mb-6 font-medium">
							<div>
								<p>
									Issuer:{" "}
									<span className="font-semibold">
										{invoiceToPay?.business?.name}
									</span>
								</p>
								<p>
									Due Date:{" "}
									<span className="font-semibold">
										{invoiceToPay && formatDate(invoiceToPay?.due)}
									</span>
								</p>
							</div>
							<div className="text-right">
								<p>
									Invoice Number:{" "}
									<span className="font-semibold">
										{invoiceToPay?.invoiceNumber}
									</span>
								</p>
								<p className="text-gray-900 font-bold text-lg">
									Amount Due:{" "}
									{calculateTotal(invoiceToPay?.order?.items).toFixed(3)}{" "}
									{invoiceToPay?.order?.currency}
								</p>
							</div>
						</div>

						{/* Table of Items */}
						<table className="w-full text-left mb-6">
							<thead>
								<tr className="text-gray-700 text-sm uppercase tracking-wider">
									<th className="py-2">Products</th>
									<th className="py-2 text-center">Rate</th>
									<th className="py-2 text-center">Discount</th>
									<th className="py-2 text-center">Qty</th>
									<th className="py-2 text-right">Amount</th>
								</tr>
							</thead>
							<tbody>
								{invoiceToPay?.order?.items?.map((item, index) => (
									<tr key={index} className="border-b border-gray-300 text-sm">
										<td className="py-2">
											<p className="font-medium">{item.name}</p>
											<p className="text-xs text-gray-500">
												{item.description}
											</p>
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
												{Number(invoiceToPay?.order?.amount).toFixed(3)}{" "}
												{invoiceToPay?.order?.currency}
											</td>
										</tr>
										<tr>
											<td className="py-1 text-gray-600">Discount</td>
											<td className="text-right">
												-
												{invoiceToPay?.order?.items
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
												{invoiceToPay?.order.currency}
											</td>
										</tr>
										<tr>
											<td className="py-1 text-gray-600">Tax</td>
											<td className="text-right">
												+ {invoiceToPay?.order?.tax?.toFixed(3) || "0.000"}{" "}
												{invoiceToPay?.order.currency}
											</td>
										</tr>
										<tr className="text-lg font-bold border-t border-gray-600 mt-2">
											<td className="py-2">Total</td>
											<td className="text-right">
												{calculateTotal(invoiceToPay?.order?.items).toFixed(3)}{" "}
												{invoiceToPay?.order?.currency}
											</td>
										</tr>
									</tbody>
								</table>

								<div className="border-t-4 border-gray-600 py-2 font-bold text-gray-700 flex justify-between text-sm">
									<span>Amount Due</span>
									<span>
										{" "}
										{calculateTotal(invoiceToPay?.order?.items).toFixed(3)}{" "}
										{invoiceToPay?.order?.currency}
									</span>
								</div>
							</div>
						</div>

						{/* Notes and Terms */}

						<div className="flex justify-between border-t-2  items-center mt-10 ">
							<div className=" mx-auto  w-full ">
								<div className=" mx-auto">
									<div className="grid grid-cols-1 mt-8 lg:grid-cols-5 lg:items-start xl:grid-cols-6 gap-y-10 lg:gap-x-12 xl:gap-x-16">
										<div className="pt-2  lg:order-1 lg:col-span-5 xl:col-span-6">
											<div className="flow-root">
												<div className="divide-y divide-gray-200 -my-7">
													{invoiceToPay?.status === "UNPAID" && (
														<div className="py-7">
															<h2 className="text-base font-bold text-gray-900">
																Upload Payment Proof
															</h2>

															<div className="mt-6 space-y-4">
																<div className="bg-white border-2 border-gray-900 rounded-md">
																	<div className="px-4 py-5 sm:p-6">
																		<div className="grid grid-cols-2 mt-5 sm:grid-cols-4 gap-x-6 gap-y-5">
																			<div className="col-span-2">
																				<label className="text-sm font-medium text-gray-600">
																					{" "}
																					Select payment option
																				</label>
																				<div className="mt-2">
																					<PaymentMethodSelector
																						setPaymentBody={setPaymentBody}
																					/>
																				</div>
																			</div>

																			<div className="col-span-2">
																				<label className="text-sm font-medium text-gray-600">
																					{" "}
																					Reference ID (Optional)
																				</label>
																				<div className="mt-2">
																					<input
																						onChange={(e) => {
																							setPaymentBody((cur) => ({
																								...cur,
																								referenceId: e.target?.value,
																							}));
																						}}
																						type="text"
																						name=""
																						id=""
																						placeholder="REF12232**"
																						className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																					/>
																				</div>
																			</div>
																		</div>

																		<div className="grid grid-cols-2 mt-5 sm:grid-cols-4 gap-x-6 gap-y-5">
																			<div className="mt-4 col-span-2 sm:col-span-4">
																				<label
																					htmlFor="paymentProof"
																					className="block text-sm font-medium text-gray-700 mb-2"
																				>
																					Upload payment proof
																				</label>
																				<input
																					onChange={handleImageUpload}
																					type="file"
																					name="paymentProof"
																					id="paymentProof"
																					accept="image/*,application/pdf"
																					className="block w-full text-sm  text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800"
																				/>
																				<p className="mt-1 text-xs text-gray-500">
																					Accepted formats: PDF, JPG, PNG (max
																					5MB)
																				</p>
																			</div>

																			<div className="col-span-4">
																				<label className="text-sm font-medium text-gray-600">
																					{" "}
																					Additional payment details (optional)
																				</label>
																				<div className="mt-2">
																					<input
																						onChange={(e) => {
																							setPaymentBody((cur) => ({
																								...cur,
																								additionalDetails:
																									e.target?.value,
																							}));
																						}}
																						type="text"
																						name=""
																						id=""
																						placeholder="ex: payment was made by ***"
																						className="block w-full px-4 py-3 text-sm font-normal text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-md caret-gray-900 focus:ring-gray-900 focus:border-gray-900"
																					/>
																				</div>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														</div>
													)}
													{(invoiceToPay?.status === "REQUIRE_APPROVAL" ||
														invoiceToPay?.status === "PAID") && (
														<PaymentStatus status={invoiceToPay?.status} />
													)}
													{invoiceId && !invoiceToPay && (
														<PaymentStatus status={invoiceToPay?.status} />
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{invoiceToPay?.status === "UNPAID" && (
							<div className="mt-4">
								{" "}
								<Button
									message="Payment proof uploading..."
									isLoading={isLoading}
									onClick={handleUpload}
								>
									Confirm Payment Proof upload
								</Button>
							</div>
						)}
					</div>
				)}
			</>
		</section>
	);
}
