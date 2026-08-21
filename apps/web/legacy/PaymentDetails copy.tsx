import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import { useStates } from "../../contexts/StatesContext";
import { useParams } from "react-router-dom";
import { getRequest, patchRequest } from "../../utils/fetch-function";

export default function PaymentDetails() {
	const {
		setSelectedInvoice,
		selectedInvoice,
		invoices,
		userProfile,
		setIsFetching,
	} = useStates();
	const [paymentInfo, setPaymentInfo] = useState(null);

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
	}, [id, selectedInvoice, invoices]);

	async function handleApprove() {
		const res = await patchRequest(
			`payment/approve/${paymentInfo?.id}`,
			{},
			userProfile?.accessToken,
			""
		);
	}

	return (
		<section className="py-8 bg-white ">
			<div className="px-10 mx-auto ">
				<div className="relative grid grid-cols-1 mt-8 lg:items-start lg:grid-cols-2 lg:mt-12 gap-y-12 lg:gap-x-16">
					<div className="space-y-3">
						<div className="overflow-hidden max-w-[800px]  rounded-lg aspect-w-16 aspect-h-9">
							<img
								className="object-cover w-full h-full "
								src={paymentInfo?.proofDocumentUrl}
								alt=""
							/>
						</div>
					</div>

					<div className="lg:sticky lg:top-6">
						<h1 className="text-2xl font-semibold text-gray-900">
							Proof of Payment
						</h1>

						<p className="mt-4 text-base font-normal leading-7 text-gray-700">
							Check if payment has been received and approve
						</p>

						<h3 className="mt-4 text-base font-bold text-gray-900">
							Payment details
						</h3>
						<div className="mt-5 space-y-4 text-sm font-medium text-gray-600 list-disc list-inside">
							<div>
								<span className="font-bold">Payment Method:</span>{" "}
								{paymentInfo?.paymentMethod}
							</div>
							<div>
								<span className="font-bold">Reference ID::</span>{" "}
								{paymentInfo?.referenceId}
							</div>
							<div>
								<span className="font-bold">Additional details::</span>{" "}
								{paymentInfo?.additionalDetails}
							</div>
						</div>

						<h3 className="mt-10 text-base font-bold text-gray-900">
							Total amount:
						</h3>
						<div className="grid grid-cols-1 mt-4 gap-x-5">
							<label className="relative flex items-center p-4 border border-gray-200 rounded-md cursor-pointer ">
								<input
									type="radio"
									name="package"
									value="regularLicense"
									className="sr-only"
								/>
								<div className="flex flex-col">
									<span className="block text-xl font-bold text-gray-900">
										{" "}
										{selectedInvoice?.order?.amount}{" "}
										{selectedInvoice?.order?.currency}
									</span>
									<div className="flex items-center mt-1.5">
										<span className="text-sm font-medium text-gray-500">
											{" "}
											Invoice id: {selectedInvoice?.invoiceNumber}
										</span>
									</div>
								</div>
							</label>
						</div>

						<div className="grid grid-co mt-10 sm:grid-cols-1 sm:gap-x-5 gap-y-4">
							<Button onClick={handleApprove}>Confirm Payment</Button>
							{/* <button
                type="button"
                className="
                            inline-flex
                            items-center
                            justify-center
                            w-full
                            px-4
                            py-3
                            text-base
                            font-bold
                            leading-7
                            text-center text-gray-900
                            transition-all
                            duration-200
                            bg-gray-100
                            border-2 border-transparent
                            rounded-md
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900
                            hover:bg-gray-200
                            focus:bg-gray-200
                        "
              >
                Live Preview
              </button> */}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
