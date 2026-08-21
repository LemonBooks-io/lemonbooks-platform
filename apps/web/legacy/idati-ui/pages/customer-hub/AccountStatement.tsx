import { useCallback, useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";

import DateRangeSelector from "./DateRangeSelector";
import Statement from "./Statement";
import { getRequest } from "../../utils/fetch-function";
import { useStates } from "../../contexts/StatesContext";
import { DocumentDownload } from "iconsax-react";

export default function AccountStatement() {
	const printRef = useRef();
	const { userProfile } = useStates();
	// eslint-disable-next-line no-unused-vars
	const [statementData, setStatementData] = useState(null);

	const [defaultRange, setDefaultRange] = useState(null);

	const handleLoadStatement = useCallback(
		async (range) => {
			if (!range) return;
			if (!userProfile?.accessToken) return;

			// setProcessing(true);

			const res = await getRequest(
				`customer/statement`,
				`startDate=${range?.to}&endDate=${range?.from}`,
				userProfile?.accessToken
			);

			// setProcessing(false);

			if (res) {
				setStatementData(res);
			}

			return;
		},
		[userProfile?.accessToken]
	);

	useEffect(() => {
		if (!userProfile?.accessToken) return;

		const today = new Date();
		const lastMonth = new Date();
		lastMonth.setMonth(today.getMonth() - 1);

		const defaultRange = {
			from: lastMonth.toISOString(),
			to: today.toISOString(),
		};

		setDefaultRange(defaultRange);
		handleLoadStatement(defaultRange);
	}, [userProfile?.accessToken, handleLoadStatement]);

	const handleDownload = () => {
		const element = printRef.current;
		const opt = {
			margin: 0,
			filename: "statement.pdf",
			image: { type: "jpeg", quality: 0.98 },
			html2canvas: {
				scale: 2,
				useCORS: true,
				allowTaint: true,
			},
			jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
			pagebreak: { mode: ["avoid-all", "css", "legacy"] },
		};

		html2pdf().set(opt).from(element).save();
	};

	return (
		<div>
			<div className=" mx-auto  max-w-5xl px-4">
				<main>
					<div className="py-6">
						<div className=" mx-auto ">
							<h1 className="text-2xl font-normal text-gray-900">Statement</h1>
						</div>

						<div className=" mx-auto ">
							<div className="items-end ">
								<div className=" pt-4 ">
									<div className="md:flex md:items-end md:justify-between">
										<DateRangeSelector
											defaultFrom={defaultRange?.from}
											defaultTo={defaultRange?.to}
											onChange={(range) => setDefaultRange(range)}
										/>

										<div
											onClick={handleDownload}
											className="flex items-end h-full cursor-pointer px-1  justify-start mt-6 space-x-6 md:ml-auto md:justify-end md:mt-0"
										>
											<DocumentDownload className="h-7  w-auto text-gray-500" />
										</div>
									</div>
								</div>
							</div>

							<Statement
								printRef={printRef}
								defaultRange={defaultRange}
								setDefaultRange={setDefaultRange}
							/>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
