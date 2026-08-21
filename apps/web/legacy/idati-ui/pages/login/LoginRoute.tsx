import { useStates } from "../../contexts/StatesContext";

import Login from "./Login";

import Dashboard from "../admin-portal/Dashboard";
import EnterOtp from "../otp/EnterOtp";
import SetPassword from "./SetPassword";
import OnboardingModal from "../onboarding-files/OnboardingModal";
import CustomerDashboard from "../customer-hub/CustomerDashboard";

export default function LoginRoute() {
	const { isLogin, userProfile, businessInfo } = useStates();

	if (!isLogin) {
		return <Login />;
	} else {
		if (userProfile?.loginType === "MFA_REQUIRED") {
			return <EnterOtp />;
		} else if (userProfile?.hasSetPassword === false) {
			return <SetPassword />;
		} else if (
			userProfile?.loginType === "LOGIN_SUCCESS" &&
			userProfile?.accountType !== "Customer" &&
			!businessInfo?.currency
		) {
			return <OnboardingModal />;
		} else if (
			userProfile?.loginType === "LOGIN_SUCCESS" &&
			userProfile?.accountType !== "Customer"
		) {
			return <Dashboard />;
		} else if (
			userProfile?.loginType === "LOGIN_SUCCESS" &&
			userProfile?.accountType === "Customer"
		) {
			return <CustomerDashboard />;
		}
	}
}
