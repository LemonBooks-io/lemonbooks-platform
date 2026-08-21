/* eslint-disable react/prop-types */
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useStates } from "../contexts/StatesContext";
import LoadingModal from "../pages/loading/LoadingModal";

const ProtectedRoute = ({ allowedRoles }) => {
	const { userProfile, loadingUser, isLogin } = useStates();
	const location = useLocation();

	const user = userProfile;

	if (loadingUser) {
		return <LoadingModal />;
	}

	if (!isLogin) {
		// store where they came from so we can send them back later
		return <Navigate to="/" state={{ from: location }} replace />;
	}

	if (allowedRoles && user && !allowedRoles.includes(user.accountType)) {
		// redirect back to the previous page if unauthorized
		const from = location.state?.from || "/";
		return <Navigate to={from} replace />;
	}

	return <Outlet />;
};

export default ProtectedRoute;
