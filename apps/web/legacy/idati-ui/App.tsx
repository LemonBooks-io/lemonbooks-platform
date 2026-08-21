import { Toaster } from "sonner";

import "./App.css";

import { StatesProvider } from "./contexts/StatesContext";

import { Route, Routes, BrowserRouter as Router } from "react-router-dom";

import LoginRoute from "./pages/login/LoginRoute";
import OrderData from "./pages/orders/OrderData";

import MakePayments from "./pages/payments/MakePayments";
import ReturnHome from "./pages/return-home/ReturnHome";
import Layout from "./layout/Layout";

import Invoice2 from "./pages/invoice/Invoice2";
import Services from "./pages/add-update-service/Services";

import CreateInvoiceEstimate from "./pages/invoices-estimate-dashboard/CreateInvoiceEstimate";
import ClientDashboard from "./pages/client-customer-dashboard/ClientDashboard";
import CreateEditClient from "./pages/client-customer-dashboard/CreateEditClient";
import ViewUpdateInvoice from "./pages/invoices-estimate-dashboard/ViewUpdateInvoice";
import InvoicesEstimatesDashboard from "./pages/invoices-estimate-dashboard/InvoicesEstimatesDashboard";

import SetPassword from "./pages/login/SetPassword";

import ClientDetails from "./pages/client-customer-dashboard/ClientDetails";
import ClientSupport from "./pages/client-customer-dashboard/ClientSupport";
import ServicesTable from "./pages/client-customer-dashboard/ServicesTable";
import ClientInvoicesEstimates from "./pages/client-customer-dashboard/ClientInvoicesEstimates";
import ItemsTable from "./pages/invoices-estimate-dashboard/ItemsTable";
import CreateProductsServicesAndCategories from "./pages/items-dashboard/CreateProductsServicesAndCategories";
import ProductsServicesCategoriesDashboard from "./pages/items-dashboard/ProductsServicesCategoriesDashboard";
import CreateEditUser from "./pages/client-customer-dashboard/CreateEditUser";
import InvoiceEstimatePrint from "./pages/invoices-estimate-dashboard/InvoiceEstimatePrint";
import UsersDashboard from "./pages/users-dashboard/UsersDashboard";
import CustomPaymentPage from "./pages/payments/CustomPaymentPage";
import PaymentsDashboard from "./pages/invoices-estimate-dashboard/PaymentsDashboard";
import PaymentDetails from "./pages/invoices-estimate-dashboard/PaymentDetails";
import SettingsPage from "./pages/settings-files/SettingsPage";
import OnboardingModal from "./pages/onboarding-files/OnboardingModal";

import ChangePasswordClient from "./pages/login/ChangePasswordClient";
import ClientLogin from "./pages/login/ClientLogin";
import AccountStatement from "./pages/customer-hub/AccountStatement";
import BusinessesDashboard from "./pages/businesses/BusinessesDashboard";
import CreateBusiness from "./pages/businesses/CreateBusiness";
import ProtectedRoute from "./layout/ProtectedRoute";
import CustomerLayout from "./layout/CustomerLayout";
import CustomerEstimatesDashboard from "./pages/client-customer-dashboard/CustomerEstimatesDashboard";
import CustomerInvoiceEstimatePrint from "./pages/invoices-estimate-dashboard/CustomerInvoiceEstimatePrint";
import ForgotPassword from "./pages/login/ForgotPassword";
import ClientForgotPassword from "./pages/login/ClientForgotPassword";
import UpdateProduct from "./pages/items-dashboard/UpdateProduct";
import TapPayment from "./components/TapPayment";

function App() {
	return (
		<div className="">
			<Toaster position="top-center" richColors />
			<Router>
				<StatesProvider>
					<Routes>
						<Route path="/" element={<LoginRoute />} index />
						<Route path="/forgotPassword" element={<ForgotPassword />} />
						<Route
							path="/client/forgotPassword"
							element={<ClientForgotPassword />}
						/>
						<Route path="/changePassword" element={<SetPassword />} />
						<Route
							path="/client/changePassword"
							element={<ChangePasswordClient />}
						/>
						<Route path="/client" element={<ClientLogin />} />
						<Route path="/custom-payment" element={<CustomPaymentPage />} />
						<Route path="/onboarding" element={<OnboardingModal />} />

						<Route
							element={
								<ProtectedRoute
									allowedRoles={["Administrator", "Business", "System"]}
								/>
							}
						>
							<Route element={<Layout />}>
								<Route path="/orders" element={<OrderData />}>
									<Route path=":id" element={<Invoice2 />} />
								</Route>
								<Route path="/clients" element={<ClientDashboard />} />
								<Route path="/clients/:id" element={<ClientDetails />}>
									<Route index element={<ServicesTable />} />
									<Route path="support" element={<ClientSupport />} />
									<Route
										path="invoices"
										element={<ClientInvoicesEstimates type="invoice" />}
									/>
									<Route
										path="estimates"
										element={<ClientInvoicesEstimates type="estimate" />}
									/>
									<Route
										path="payments"
										element={<ClientInvoicesEstimates type="payment" />}
									/>
									<Route
										path="invoices/create"
										element={<ItemsTable type={"Invoice"} />}
									/>
									<Route path="businesses/create" element={<ServicesTable />} />
									<Route
										path="estimates/create"
										element={<ItemsTable type={"Estimate"} />}
									/>
								</Route>
								<Route
									path="/clients/:id/edit"
									element={
										<CreateEditClient
											attribute={{
												buttonDescription: "Save Updates",
												header: "Edit Selected Client",
											}}
										/>
									}
								/>
								<Route path="/services" element={<Services />} />
								<Route path="/payment" element={<MakePayments />} />
								<Route
									path="/invoices"
									element={<InvoicesEstimatesDashboard type="invoice" />}
								>
									<Route path=":id/edit" element={<ViewUpdateInvoice />} />
									<Route
										path=":id"
										element={<InvoiceEstimatePrint type="invoice" />}
									/>
								</Route>
								<Route
									path="/payments"
									element={<PaymentsDashboard type="invoice" />}
								>
									<Route path=":id" element={<PaymentDetails />} />
								</Route>
								<Route
									path="/estimates"
									element={<InvoicesEstimatesDashboard type="estimate" />}
								>
									<Route path=":id/edit" element={<ViewUpdateInvoice />} />
									<Route
										path=":id"
										element={<InvoiceEstimatePrint type="estimate" />}
									/>
								</Route>
								<Route path="/businesses" element={<BusinessesDashboard />} />
								<Route
									path="/products-services"
									element={<ProductsServicesCategoriesDashboard />}
								/>

								<Route
									path="/products-services/:id/edit"
									element={<UpdateProduct type="invoice" />}
								/>

								<Route path="/users" element={<UsersDashboard />} />
								<Route path="/settings" element={<SettingsPage />} />
								<Route
									path="/invoices/create"
									element={<CreateInvoiceEstimate type={"Invoice"} />}
								/>
								<Route
									path="/estimates/create"
									element={<CreateInvoiceEstimate type={"Estimate"} />}
								/>
								<Route
									path="/clients/create"
									element={
										<CreateEditClient
											attribute={{
												buttonDescription: "Create  Client",
												header: "Create New Client",
											}}
										/>
									}
								/>
								<Route
									path="/users/create"
									element={
										<CreateEditUser
											attribute={{
												buttonDescription: "Create Client",
												header: "Create New Client",
											}}
										/>
									}
								/>
								<Route
									path="/users/:id/edit"
									element={
										<CreateEditUser
											attribute={{
												buttonDescription: "Save Updates",
												header: "Edit Selected User",
											}}
										/>
									}
								/>
								<Route
									path="/products-services/create"
									element={
										<CreateProductsServicesAndCategories type={"Invoice"} />
									}
								/>
								<Route
									path="/businesses/create"
									element={<CreateBusiness type={"Invoice"} />}
								/>
							</Route>
						</Route>

						<Route element={<ProtectedRoute allowedRoles={["Customer"]} />}>
							<Route element={<CustomerLayout />}>
								<Route path="/statement" element={<AccountStatement />} />
								<Route
									path="/customer-invoices"
									element={<AccountStatement />}
								/>
								<Route
									path="/customer-invoices/:id"
									element={<CustomerInvoiceEstimatePrint type="invoice" />}
								/>
								<Route
									path="/customer-estimates"
									element={<CustomerEstimatesDashboard type="estimate" />}
								/>
								<Route
									path="/customer-estimates/:id"
									element={<CustomerInvoiceEstimatePrint type="estimate" />}
								/>
								<Route
									path="/customer-payments"
									element={<CustomerEstimatesDashboard type="payment" />}
								/>
								<Route
									path="/customer-payments/:id"
									element={<CustomerInvoiceEstimatePrint type="payment" />}
								/>
								<Route path="/orders" element={<OrderData />}>
									<Route path=":id" element={<Invoice2 />} />
								</Route>{" "}
								<Route path="/services" element={<Services />} />
								<Route path="/payment" element={<MakePayments />} />
								<Route
									path="/customer-invoices/id"
									element={<InvoiceEstimatePrint type="invoice" />}
								/>
								<Route
									path="/payments"
									element={<PaymentsDashboard type="invoice" />}
								>
									<Route path=":id" element={<PaymentDetails />} />
								</Route>
								<Route
									path="/estimates"
									element={<InvoicesEstimatesDashboard type="estimate" />}
								>
									<Route path=":id/edit" element={<ViewUpdateInvoice />} />
									<Route
										path=":id"
										element={<InvoiceEstimatePrint type="estimate" />}
									/>
								</Route>
								<Route path="/businesses" element={<BusinessesDashboard />} />
								<Route
									path="/products-services"
									element={<ProductsServicesCategoriesDashboard />}
								/>
								<Route path="tap-payment" element={<TapPayment />} />
							</Route>
						</Route>

						<Route path="*" element={<ReturnHome />} />
					</Routes>
				</StatesProvider>
			</Router>
		</div>
	);
}

export default App;
