import { useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import Button from "../../components/Button";
import { toast } from "sonner";
import axios from "axios";

export default function ClientForgotPassword() {
	const { email, setEmail, BASE_URL, tenant } = useStates();
	const [isLoading, setIsLoading] = useState(false);

	async function loginHandler() {
		setIsLoading(true);
		try {
			setIsLoading(true);

			const config = {
				headers: {
					"Content-Type": "application/json",
					"X-Tenant-ID": tenant,
					Accept: "application/json",
				},
			};

			const body = { email: email };

			const res = await axios.post(
				`${BASE_URL}/api/v2/auth/customer/reset-password`,
				body,
				config
			);

			if (res.statusText === "OK") {
				toast.success(
					"Kindly check your email for the link to reset your password"
				);
			}
		} catch (e) {
			console.error(e);
			toast.error(e?.response?.data?.error);
		}
		setIsLoading(false);
	}

	return (
		<section className="py-10  sm:py-16 lg:py-24">
			<div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="max-w-2xl mx-auto text-center">
					<h2 className="text-3xl font-bold leading-tight text-black ">
						Welcome to LemonBooks!
					</h2>
					<p className="max-w-xl mx-auto mt-4 text-base leading-relaxed text-gray-600">
						Kindly enter your email to reset your password
					</p>
				</div>

				<div className="relative max-w-md mx-auto mt-2">
					<div className="overflow-hidden bg-white rounded-md shadow-md">
						<div className="px-4 py-6 sm:px-8 sm:py-7">
							<div>
								<div className="space-y-5">
									<div>
										<label className="text-base font-medium text-gray-900">
											Email address
										</label>
										<div className="mt-2.5 relative text-gray-400 focus-within:text-gray-600">
											<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
												<svg
													className="w-5 h-5"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
													/>
												</svg>
											</div>

											<input
												onChange={(e) => setEmail(e.target.value)}
												type="email"
												value={email}
												name=""
												id="email"
												placeholder="Enter email to get started"
												className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
											/>
										</div>
									</div>

									<div>
										<Button onClick={loginHandler} isLoading={isLoading}>
											Reset Password
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
