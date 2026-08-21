/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useStates } from "../../contexts/StatesContext";
import { getRequest } from "../../utils/fetch-function";

export default function Statement({ printRef, defaultRange }) {
	const { businessInfo, userProfile } = useStates();
	const [processing, setProcessing] = useState(false);
	const [statementData, setStatementData] = useState(null);

	function formatDate(dateString) {
		// Create a Date object from the input string
		const date = new Date(dateString);

		const day = date.getDate();
		const month = date.toLocaleString("en-US", { month: "short" });
		const year = date.getFullYear();

		// Return the formatted date
		return `${month} ${day}, ${year}`;
	}

	const handleLoadStatement = useCallback(
		async (range) => {
			if (!range) return;
			if (!userProfile?.accessToken) return;

			setProcessing(true);

			const res = await getRequest(
				`customer/statement`,
				`startDate=${range?.to}&endDate=${range?.from}`,
				userProfile?.accessToken
			);

			setProcessing(false);

			if (res) {
				setStatementData(res);
			}

			return;
		},
		[userProfile?.accessToken]
	);

	useEffect(() => {
		if (!defaultRange || !userProfile?.accessToken) return;

		handleLoadStatement(defaultRange);
	}, [defaultRange, userProfile?.accessToken, handleLoadStatement]);

	// const reversedStatement = [...data.statementData].reverse();
	const reversedStatement = useMemo(
		() =>
			statementData?.statementData
				.slice()
				.reverse()
				.filter(
					(statement) => statement?.description !== "Estimate for your order"
				),
		[statementData?.statementData]
	);

	return (
		<div>
			<div className=" mt-2  min-h-screen">
				{processing ? (
					<div className="flex justify-center py-6">
						<div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
					</div>
				) : (
					<div
						ref={printRef}
						className="bg-white border max-w-5xl mx-auto p-10 rounded-md shadow-md text-sm"
					>
						{/* HEADER */}
						<div className="flex justify-between items-start mt-5 mb-6 ">
							<div className="  gap-4 items-center">
								<img
									src={
										businessInfo?.logoUrl
											? businessInfo?.logoUrl
											: "/lemonbooks.svg"
									}
									alt="Logo"
									className="h-auto w-32 object-contain"
								/>
								<div>
									<p className="text-xs text-gray-500">
										{businessInfo?.description
											? businessInfo.description
											: "We don’t find solutions. we create them."}
									</p>
								</div>
							</div>
							<div className="text-right  text-gray-700 text-sm">
								<p className="font-bold">
									{" "}
									{businessInfo?.name
										? businessInfo?.name
										: statementData?.businessName}
								</p>
								<p>{businessInfo?.address && businessInfo?.address}</p>
							</div>
						</div>

						{/* TITLE */}
						<div className="flex justify-between items-end mb-6">
							<div></div>
							<div className="text-right">
								<h2 className="text-lg font-bold text-gray-900">
									Statement of Accounts
								</h2>
							</div>
						</div>

						{/* ACCOUNT SUMMARY */}
						<div className="border border-gray-200 rounded mb-6 max-w-sm ml-auto">
							<div className="bg-gray-100 font-semibold px-4 py-2 border-b">
								Account Summary
							</div>
							<div className="divide-y divide-gray-200 text-sm">
								{/* {statementData?.dueBalanceBeforeStartDate && ( */}
								<div className="flex justify-between px-4 py-2">
									<span>Opening Balance</span>
									<span>
										KWD{" "}
										{statementData?.dueBalanceBeforeStartDate?.toFixed(3) ||
											"0.000"}
									</span>
								</div>
								{/* )} */}

								{/* {statementData?.invoicedAmount && ( */}
								<div className="flex justify-between px-4 py-2">
									<span>Invoiced Amount</span>
									<span>
										KWD{" "}
										{statementData?.totalInvoicedAmount?.toFixed(3) || "0.000"}
									</span>
								</div>
								{/* )} */}
								{/* {statementData?.amountReceived && ( */}
								<div className="flex justify-between px-4 py-2">
									<span>Amount Received</span>
									<span>
										KWD{" "}
										{statementData?.totalPaymentsReceived?.toFixed(3) ||
											"0.000"}
									</span>
								</div>
								{/* )} */}

								<div className="flex justify-between px-4 py-2 font-semibold text-red-700">
									<span>Balance Due</span>
									<span>
										KWD {Number(statementData?.receivable)?.toFixed(3)}
									</span>
								</div>
							</div>
						</div>

						{/* TABLE */}
						<div>
							<table className="w-full border-collapse">
								<thead>
									<tr className="bg-gray-800 text-white text-xs uppercase">
										<th className="text-left p-2">Date</th>
										<th className="text-left p-2">Transactions</th>
										<th className="text-left p-2">Invoice Number</th>
										<th className="text-left p-2">Details</th>
										<th className="text-right p-2">Amount</th>
										<th className="text-right p-2">Payments</th>
										<th className="text-right p-2">Balance</th>
									</tr>
								</thead>
								<tbody>
									{reversedStatement?.map((t, i) => (
										<tr
											key={t?.invoiceNumber || t?.paymentId}
											className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
										>
											<td className="p-2 align-top">{formatDate(t?.date)}</td>
											<td className="p-2 align-top">{t?.type}</td>
											<td className="p-2 whitespace-pre-line">
												{t?.invoiceNumber || t.description.split("-")[1]}
											</td>
											<td className="p-2 whitespace-pre-line">
												{t.description}
											</td>
											<td className="p-2 text-right align-top">
												{t?.type === "invoice" && t?.amount?.toFixed(3)}
											</td>
											<td className="p-2 text-right align-top">
												{t?.type === "payment" && t?.amount?.toFixed(3)}
											</td>
											<td className="p-2 text-right align-top">
												{t?.balance?.toFixed(3)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* FINAL BALANCE */}
						<div className="mt-6 text-right font-semibold text-md">
							<>
								Balance Due:{" "}
								<span className="text-red-600">
									KWD {statementData?.receivable?.toFixed(3)}
								</span>
							</>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
