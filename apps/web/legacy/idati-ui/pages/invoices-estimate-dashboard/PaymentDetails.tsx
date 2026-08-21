import { useEffect, useState } from "react";
import Button from "../../components/Button";
import { useStates } from "../../contexts/StatesContext";
import { useParams } from "react-router-dom";
import { getRequest, patchRequest } from "../../utils/fetch-function";
import { calculateTotal } from "../../utils/helper-functions";

export default function PaymentDetails() {
	const {
		setSelectedInvoice,
		selectedInvoice,
		invoices,
		userProfile,
		setIsFetching,
		toast,
		updateData,
		triggerUpdate,
	} = useStates();
	const [paymentInfo, setPaymentInfo] = useState(null);

	const [isLoading, setIsLoading] = useState(false);

	const { id } = useParams();

	useEffect(() => {
		async function fetchPaymentDetails() {
			setIsFetching(true);
			if (id) {
				const selected = invoices?.invoices?.find(
					(q) => q.invoiceNumber === id
				);

				setSelectedInvoice(selected);
			}

			if (selectedInvoice) {
				const res = await getRequest(
					`payment/get-payment-proofs/${selectedInvoice?.id}`,
					"",
					userProfile?.accessToken
				);

				setPaymentInfo(res);
			}
			setIsFetching(false);
		}

		fetchPaymentDetails();
	}, [id, selectedInvoice, invoices, updateData]);

	async function handleApprove() {
		setIsLoading(true);
		try {
			const res = await patchRequest(
				`payment/approve/${paymentInfo?.id}`,
				{},
				userProfile?.accessToken,
				""
			);

			toast.success(res?.message);

			triggerUpdate();
		} catch (e) {
			toast.error(e?.response?.data?.error);
		} finally {
			setIsLoading(false);
		}
	}

	console.log({ paymentInfo });

	return (
		<section className="py-12 bg-white ">
			<div className="px-4 mx-auto ">
				<div className=" mx-auto max-w-7xl">
					<div className="flex items-center justify-between">
						<p className="text-2xl font-semibold text-gray-900">
							Payment Details for Invoice {selectedInvoice?.invoiceNumber}
						</p>

						{paymentInfo?.approvedBy?.name && (
							<p>
								Approved By:{" "}
								<span className="font-bold">
									{paymentInfo?.approvedBy.name}
								</span>
							</p>
						)}
					</div>

					<div className="mt-6 overflow-hidden bg-white border border-gray-200 md:mt-8 rounded-xl">
						<div className="md:flex">
							<div className="md:max-w-[450px]">
								<img
									className="object-cover w-full h-full"
									src={paymentInfo?.proofDocumentUrl}
									alt=""
								/>
							</div>

							<div className="flex flex-col justify-between flex-1 p-6 sm:p-8">
								<div className="space-y-3">
									<div className="grid items-center grid-cols-2 ">
										<label className=" text-xl font-medium text-gray-900">
											Total Amount:
										</label>

										<div className="font-bold text-xl">
											{" "}
											{calculateTotal(selectedInvoice?.order?.items).toFixed(
												3
											)}{" "}
											{selectedInvoice?.order?.currency}
										</div>
									</div>

									<div className="grid items-center grid-cols-2">
										<span className="text-base font-medium text-gray-900">
											Payment Method:
										</span>

										<div className="px-4 py-1  rounded-lg">
											<div className="flex items-center justify-between space-x-8">
												{paymentInfo?.paymentMethod}
											</div>
										</div>
									</div>

									<div className="grid items-center grid-cols-2">
										<span className="text-base font-medium text-gray-900">
											Reference ID:
										</span>

										<div className="px-4 py-1  rounded-lg">
											<div className="flex items-center justify-between space-x-8">
												{paymentInfo?.referenceId}
											</div>
										</div>
									</div>

									<div className="grid items-center grid-cols-2">
										<span className="text-base font-medium text-gray-900">
											Remark:
										</span>

										<div className="px-4 py-1  rounded-lg">
											<div className="flex items-center justify-between space-x-8">
												{paymentInfo?.additionalDetails}
											</div>
										</div>
									</div>
								</div>

								<div className="mt-12 space-y-5   md:mt-0">
									<p className="text-base font-medium text-gray-500">
										Check the receiving account to see if the above payment has
										been received, and then approve it. Only approve payments
										that have been verified.
									</p>

									{paymentInfo?.status === "PENDING" && (
										<Button
											isLoading={isLoading}
											message="Approving payment..."
											onClick={handleApprove}
										>
											Approve Payment
										</Button>
									)}

									{paymentInfo?.status === "APPROVED" && (
										<div className="inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-green-900 transition-all duration-200 bg-green-300 ">
											{" "}
											This payment has been confirmed and approved!
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
