import { createContext, useContext, useEffect, useState } from "react";
import { getRequest, postRequest, BASE_URL } from "../utils/fetch-function";
import { v4 as uuidv4 } from "uuid";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { encryptKey } from "../utils/key-encryption";

const StatesContext = createContext<any>(undefined);

export function StatesProvider({ children }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [accountType, setAccountType] = useState(0);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [orders, setOrders] = useState(null);
	const [invoices, setInvoices] = useState([]);
	const [isAddService, setIsAddService] = useState(false);
	const [isBulkUpload, setIsbulkUpload] = useState(false);
	const [loadingUser, setLoadingUser] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState(null);

	const [isEnabled, setIsEnabled] = useState(false);
	const [bulkUploadData, setBulkUploadData] = useState(null);
	const [paymentsData, setPaymentsData] = useState([]);

	const [totalReceivables, setTotalReceivables] = useState({
		currency: "",
		total: 0,
	});

	const [allUsers, setAllUsers] = useState([]);

	const [enteredOtp, setEnteredOtp] = useState("");
	const [otpToken, setOtpToken] = useState("");
	const [accessToken, setAccessToken] = useState(
		localStorage.getItem("accessToken")
	);
	const [userProfile, setUserProfile] = useState(null);
	const [businessInfo, setBusinessInfo] = useState(null);

	const [path, setPath] = useState("");

	const [allClients, setAllClients] = useState(null);
	const [selectedClient, setSelectedClient] = useState(null);
	const [allServices, setAllServices] = useState(null);
	const [allItems, setAllItems] = useState([]);

	const [isFetching, setIsFetching] = useState(false);
	const [updateData, setUpdateData] = useState("");
	const [items, setItems] = useState(null);
	const [productsAndServices, setProductsAndServices] = useState(null);

	const [isClient, setIsClient] = useState(true);
	const [countsData, setCountsData] = useState(null);
	const [refresh, setRefresh] = useState("");
	const [categories, setCategories] = useState([]);
	const [isAdministrator, setIsAdministrator] = useState(true);
	const [serviceToAddBody, setServiceToAddBody] = useState(null);
	const [tenant, setTenant] = useState("");
	const [expiryDate, setExpiryDate] = useState(
		new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
	);
	const [onboardingAction, setOnboardingAction] = useState("currency");
	//options are: currency, logo and tap

	const [productCategoryTab, setProductCategoryTab] = useState("PRODUCT");

	const navigate = useNavigate();

	const { id } = useParams();

	const capitalize = (str) =>
		str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

	const [predefinedServices, setPredefinedServices] = useState([]);
	const isLogin = !!accessToken;

	function formatDate(dateString) {
		// Create a Date object from the input string
		const date = new Date(dateString);

		// Extract components
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		const day = date.getDate();
		const month = date.toLocaleString("en-US", { month: "short" }); // Short month name
		const year = date.getFullYear();

		// Return the formatted date
		return `${month} ${day}, ${year}`;
	}

	useEffect(() => {
		if (userProfile) {
			setIsClient(userProfile?.accountType !== "admin");
		}
	}, [userProfile]);

	useEffect(() => {
		async function fetchUser() {
			try {
				setLoadingUser(true);
				const dateNow = Date.now();

				if (Number(localStorage.getItem("expireAt") || 0) < dateNow) {
					localStorage.removeItem("accessToken");
					localStorage.removeItem("userProfile");
					localStorage.removeItem("businessInfo");
					localStorage.removeItem("expireAt");
					setAccessToken(null);
					setUserProfile(null);
					setBusinessInfo(null);
					return;
				} else {
					const savedUser =
						JSON.parse(localStorage.getItem("userProfile")) || null;
					const businessDetails =
						JSON.parse(localStorage.getItem("businessInfo")) || null;

					setUserProfile(savedUser);
					setBusinessInfo(businessDetails);
					setAccessToken(localStorage.getItem("accessToken"));
				}
			} catch (e) {
				console.error(e);
			} finally {
				setLoadingUser(false);
			}
		}
		fetchUser();
	}, [updateData]);

	useEffect(() => {
		try {
			const url = new URL(window.location.href);
			const subdomain = url.hostname.split(".")[0];

			const tenant =
				subdomain === "" || subdomain === "www" || subdomain === "localhost"
					? "administrator"
					: subdomain;

			setTenant(tenant);
		} catch (e) {
			console.error(e?.message);
		}
	}, []);

	useEffect(() => {
		async function fetchClients() {
			try {
				setIsFetching(true);

				const res = await getRequest(
					"customer/all",
					"offset=1&limit=20",
					userProfile?.accessToken
				);

				if (res) {
					if (res?.customers.length > 0) {
						const total = res.customers.reduce((sum, customer) => {
							return sum + Number(customer.receivables);
						}, 0);
						setTotalReceivables((cur) => ({
							...cur,
							total: total,
						}));
					}

					setAllClients(res);

					// setAllServices(res?.data?.data?.services);
				}
			} catch (error) {
				console.error("Error fetching services:", error);
				throw error; // Re-throw for error handling upstream
			} finally {
				setIsFetching(false);
			}
		}
		if (
			userProfile?.accessToken &&
			!id &&
			userProfile?.accessToken &&
			userProfile?.loginType !== "MFA_REQUIRED"
		) {
			fetchClients();
		}
	}, [updateData, userProfile?.accessToken, path]);

	// useEffect(() => {
	//   if (!id) {
	//     setSelectedClient(null);
	//   }
	// }, [path]);

	function handleLogout() {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("userProfile");
		localStorage.removeItem("businessInfo");
		setAccessToken("");
		setUserProfile(null);
		setBusinessInfo(null);
		if (userProfile?.accountType === "Customer") {
			navigate("/client");
		} else {
			navigate("/");
		}
	}

	useEffect(() => {
		async function fetchCategories() {
			try {
				const res = await getRequest(
					"category/all",
					"offset=1&limit=20",
					accessToken
				);

				if (res) {
					setCategories(res?.categories);
				}
			} catch (error) {
				console.error("Error fetching categories:", error);
				throw error; // Re-throw for error handling upstream
			}
		}
		if (userProfile?.loginType !== "MFA_REQUIRED" && userProfile?.accessToken) {
			fetchCategories();
		}
	}, [productCategoryTab, updateData, userProfile?.accessToken]);

	useEffect(() => {
		async function fetchItems() {
			try {
				setIsFetching(true);

				const res = await getRequest(
					"offerings/all",
					"offset=1&limit=20",
					userProfile?.accessToken
				);

				if (res) {
					const internalServices = res?.offerings?.filter(
						(item) => item?.id === "685ca5011374a38da9cc5c1e"
					);

					setAllServices(internalServices);

					setProductsAndServices(res);

					setItems(res);
				}
			} catch (error) {
				console.error("Error fetching services:", error);
				throw error; // Re-throw for error handling upstream
			} finally {
				setIsFetching(false);
			}
		}

		if (userProfile?.loginType !== "MFA_REQUIRED" && userProfile?.accessToken) {
			fetchItems();
		}
	}, [productCategoryTab, updateData, userProfile?.accessToken]);

	let queryParams;
	useEffect(() => {
		async function getAllInvoice() {
			try {
				setIsFetching(true);
				// Make a POST request without the Authorization header
				// const response = await getRequest(
				//   "invoices/all",
				//   `offset=1&limit=20&draft=${"invoice" === "estimate"}`,
				//   userProfile?.accessToken
				// );

				if (userProfile?.id) {
					queryParams = `offset=1&limit=500&recipientId=${userProfile?.id}`;
				} else {
					queryParams = `offset=1&limit=500`;
				}

				if (queryParams) {
					const response = await getRequest(
						"invoices/all",
						queryParams,
						userProfile?.accessToken
					);

					setInvoices(response);

					const end = new Date(
						Date.now() - 1 * 24 * 60 * 60 * 1000
					).toISOString();
					const start = new Date(Date.now()).toISOString();
				}
			} catch (err) {
				console.error(
					"Error creating invoice:",
					err.response ? err.response.data : err.message
				);
			} finally {
				setIsFetching(false);
			}
		}

		if (userProfile?.loginType !== "MFA_REQUIRED" && userProfile?.accessToken) {
			getAllInvoice();
		}
	}, [userProfile?.accessToken, updateData, userProfile?.id, queryParams]);

	useEffect(() => {
		async function getUsers() {
			try {
				setIsFetching(true);

				const response = await getRequest(
					"user/all",
					`offset=1&limit=20`,
					userProfile?.accessToken
				);

				// setInvoices(response);
				setAllUsers(response);
			} catch (err) {
				console.error(
					"Error creating invoice:",
					err.response ? err.response.data : err.message
				);
			} finally {
				setIsFetching(false);
			}
		}

		if (userProfile?.loginType !== "MFA_REQUIRED" && userProfile?.accessToken) {
			getUsers();
		}
	}, [userProfile?.accessToken, updateData]);

	//Route to onboarding

	// useEffect(() => {
	//   if (!userProfile?.accessToken) {
	//     // navigate("/");
	//   }

	//   if (businessInfo && userProfile?.accessToken?.length > 0) {
	//     if (!businessInfo?.currency) {
	//       navigate("/onboarding");
	//     }
	//   }
	// }, [businessInfo?.businessId, userProfile?.accessToken, updateData]);

	const triggerUpdate = () => {
		setUpdateData(uuidv4());
	};

	function formatUtcToLocalTime(utcString) {
		const date = new Date(utcString);

		const localHours = String(date.getHours()).padStart(2, "0");
		const localMinutes = String(date.getMinutes()).padStart(2, "0");

		const day = date.getDate();
		const monthNames = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		const month = monthNames[date.getMonth()];
		const year = date.getFullYear();

		return `${localHours}:${localMinutes}, ${month} ${day}, ${year}`;
	}

	function formatDateTime(dateTimeString) {
		const date = new Date(dateTimeString);

		// Format hours and minutes
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");

		// Format day and month
		const day = String(date.getDate()).padStart(2, "0");
		const month = date.toLocaleString("default", { month: "long" });
		const year = date.getFullYear();

		// return `${hours}:${minutes}, ${day} ${month}, ${year}`;
		return `${hours}:${minutes}, ${day} ${month}, ${year}`;
	}

	function maskKey(key, start, end) {
		const prefix = key.slice(0, start); // 'sk_test_'
		const suffix = key.slice(-end); // last 4 characters
		const maskedLength = key.length - prefix.length - suffix.length;
		const masked = "*".repeat(maskedLength);
		return prefix + masked + suffix;
	}

	const downloadPayments = () => {
		const headers = [
			"NAME",
			"INVOICE NO",
			"AMOUNT",
			"PAYMENT DATE",
			"PAYMENT METHOD",
			"STATUS",
		];
		const rows = paymentsData.map((row) => [
			`${row?.customer?.first_name}  ${row?.customer?.last_name}`,
			`${row?.invoiceNumber}`,
			`${row?.order?.amount} ${row?.order?.currency}`,
			formatDateTime(row?.updatedAt),
			row?.paymentMethod,
			row?.status,
		]);

		const csvContent = [headers, ...rows]
			.map((row) => row.map((field) => `"${field}"`).join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const link = document.createElement("a");
		link.href = URL.createObjectURL(blob);
		link.download = "dashboard-data.csv";
		link.click();
	};

	const handleDownloadTemplate = (name) => {
		const link = document.createElement("a");
		link.href = `/bulk-templates/${name}.csv`;
		link.download = `${name}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<StatesContext.Provider
			value={{
				email,
				setEmail,
				password,
				setPassword,
				accountType,
				setAccountType,
				BASE_URL,
				isLogin,
				isClient,
				enteredOtp,
				setEnteredOtp,
				otpToken,
				setOtpToken,
				accessToken,
				setAccessToken,
				userProfile,
				setUserProfile,
				selectedOrder,
				setSelectedOrder,
				selectedInvoice,
				setSelectedInvoice,
				handleLogout,
				orders,
				setOrders,
				formatDate,
				allClients,
				setAllClients,
				allServices,
				setAllServices,
				isFetching,
				setIsFetching,
				updateData,
				setUpdateData,
				invoices,
				setInvoices,
				countsData,
				setCountsData,
				refresh,
				setRefresh,
				items,
				setItems,
				categories,
				setCategories,
				isAdministrator,
				setIsAdministrator,
				postRequest,
				getRequest,
				tenant,
				setTenant,
				selectedClient,
				setSelectedClient,
				predefinedServices,
				setPredefinedServices,
				path,
				setPath,
				triggerUpdate,
				serviceToAddBody,
				setServiceToAddBody,
				toast,
				isAddService,
				setIsAddService,
				expiryDate,
				setExpiryDate,
				productCategoryTab,
				setProductCategoryTab,
				productsAndServices,
				setProductsAndServices,
				formatDateTime,
				capitalize,
				formatUtcToLocalTime,
				allUsers,
				setAllUsers,
				allItems,
				setAllItems,
				isBulkUpload,
				setIsbulkUpload,
				isEnabled,
				setIsEnabled,
				bulkUploadData,
				setBulkUploadData,
				downloadPayments,
				setPaymentsData,
				maskKey,
				encryptKey,
				totalReceivables,
				onboardingAction,
				setOnboardingAction,
				businessInfo,
				setBusinessInfo,
				selectedProduct,
				setSelectedProduct,
				loadingUser,
				setLoadingUser,
				handleDownloadTemplate,
			}}
		>
			{children}
		</StatesContext.Provider>
	);
}

export function useStates() {
	const context = useContext(StatesContext);
	if (context === undefined)
		throw new Error("States context was used outside StateProvider");
	return context;
}

// export { StatesProvider, useStates };StatesProvider
