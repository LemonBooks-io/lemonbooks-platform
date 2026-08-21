import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function TapPayment() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	useEffect(() => {
		const paymentId = searchParams.get("payment_id");
		const status = searchParams.get("status");

		console.log({ searchParams });

		console.log({ paymentId, status });

		if (status === "success") {
			// show success toast, call API, etc
		}

		navigate("/");
		// redirect after processing
	}, [navigate, searchParams]);
	return (
		<div className="flex justify-center py-6">
			<div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
		</div>
	);
}

export default TapPayment;
