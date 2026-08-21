/* eslint-disable react/prop-types */
import { IoMdClose } from "react-icons/io";

export default function PaymentOptionModal({
	isOpen,
	setIsOpen,
	paymentLinks,
	waitWhileInvoiceIsUnpaid,
	setProcessing,
}) {
	if (!isOpen) return null;

	async function handleSelectPaymentOption(url) {
		if (typeof url === "string" && url.startsWith("http")) {
			window.open(url, "_blank");

			await waitWhileInvoiceIsUnpaid();
			setIsOpen(false);
		} else {
			console.warn("Invalid URL provided:", url);
		}
	}

	return (
		<div
			className={`fixed  inset-0 z-50 flex items-center justify-center bg-black ${
				isOpen ? "bg-opacity-50" : "bg-opacity-0"
			}`}
		>
			<div className="relative w-full max-w-sm h-[220px] bg-white shadow-lg rounded-xl">
				<button
					onClick={() => {
						setIsOpen(false);
						setProcessing(false);
					}}
					className="absolute right-2 top-2"
				>
					<IoMdClose className="text-xl" />
				</button>

				<div className="px-4 py-5 sm:p-6">
					<p className="mt-5 text-xl font-bold text-gray-900">
						Select Payment Options
					</p>
					<p className="mt-3 text-sm font-medium text-gray-500">
						Select Payment option from below to proceed with your payment
					</p>
					<div className="flex items-center mt-8 space-x-2">
						{paymentLinks?.tap && (
							<button
								onClick={() => handleSelectPaymentOption(paymentLinks?.tap)}
								className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-semibold leading-5 text-gray-100 bg-indigo-500 border border-indigo-600 rounded-md hover:bg-indigo-700"
							>
								Pay With Card
							</button>
						)}
						{paymentLinks?.custom && (
							<button
								onClick={() => handleSelectPaymentOption(paymentLinks?.custom)}
								className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-semibold leading-5 text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 hover:text-gray-900"
							>
								Other method
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
