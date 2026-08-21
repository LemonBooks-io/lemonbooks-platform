import { useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import axios from "axios";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

export default function SetPassword() {
	const {
		password,
		setPassword,
		BASE_URL,
		userProfile,
		setUserProfile,
		setAccessToken,
		tenant,
		toast,
	} = useStates();

	const [isLoading, setIsLoading] = useState(false);

	const [confirmPassword, setConfirmPassword] = useState("");
	const navigate = useNavigate();

	async function setPasswordHandler() {
		if (confirmPassword === "" || password === "") {
			toast.error("Password cannot be empty");
			return;
		}
		if (confirmPassword !== "" && confirmPassword !== password) {
			toast.error("Entered password do not match");
			return;
		}

		const params = new URLSearchParams(window.location.search);

		let token = params.get("token");

		if (!token) {
			token = userProfile?.accessToken;
		}

		const headers = {
			Authorization: `Bearer ${token}`, // Replace with your token
			tenantId: tenant,
			"Content-Type": "application/json",
		};
		const body = { newPassword: password };

		try {
			setIsLoading(true);
			const res = await axios.patch(
				`${BASE_URL}/api/v2/auth/change-password`,
				body,
				{
					headers,
				}
			);
			if (res) {
				// const profileInfo = await fetchProfile(accessToken);

				// setUserProfile(profileInfo);
				toast.success(res?.data?.message);

				localStorage.removeItem("accessToken");
				localStorage.removeItem("userProfile");
				setAccessToken(null);
				setUserProfile(null);

				// alert("Password change successful");
				navigate("/");
			}
		} catch (e) {
			toast.error(e?.response?.data?.error);
			// alert(e?.response?.data?.error);
		}

		setIsLoading(false);
	}

	// if (otpSent) {
	//   return <EnterOtp />;
	// }

	return (
		<section className="py-10  sm:py-16 lg:py-24">
			<div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
				<div className="max-w-2xl mx-auto text-center">
					<h2 className="text-3xl font-bold leading-tight text-black ">
						Welcome to LemonBooks!!!
					</h2>
					<p className="max-w-xl mx-auto mt-4 text-base leading-relaxed text-gray-600">
						Please set your password now
					</p>
				</div>

				{/* <AccountTypeSelector /> */}

				<div className="relative max-w-md mx-auto mt-2">
					<div className="overflow-hidden bg-white rounded-md shadow-md">
						<div className="px-4 py-6 sm:px-8 sm:py-7">
							<div>
								<div className="space-y-5">
									<div>
										<label className="text-base font-medium text-gray-900">
											{" "}
											Enter Password
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
														d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
													/>
												</svg>
											</div>

											<input
												onChange={(e) => setConfirmPassword(e.target.value)}
												type="password"
												value={confirmPassword}
												name=""
												id="password1"
												placeholder="Enter new password"
												className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
											/>
										</div>
									</div>

									<div>
										<div className="flex items-center justify-between">
											<label className="text-base font-medium text-gray-900">
												{" "}
												Confirm Password{" "}
											</label>
										</div>
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
														d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
													/>
												</svg>
											</div>

											<input
												onChange={(e) => setPassword(e.target.value)}
												type="password"
												name=""
												id="pass"
												value={password}
												placeholder="Confirm your password"
												className="block w-full py-4 pl-10 pr-4 text-black placeholder-gray-500 transition-all duration-200 bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-600 caret-blue-600"
											/>
										</div>
									</div>

									<div>
										<Button onClick={setPasswordHandler} isLoading={isLoading}>
											Set Password
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
