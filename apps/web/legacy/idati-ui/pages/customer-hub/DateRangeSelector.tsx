/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";

export default function DateRangeSelector({
	defaultFrom,
	defaultTo,
	onChange,
}) {
	const [from, setFrom] = useState("");
	const [to, setTo] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (defaultFrom) setFrom(defaultFrom.slice(0, 10)); // yyyy-mm-dd
		if (defaultTo) setTo(defaultTo.slice(0, 10));
	}, [defaultFrom, defaultTo]);

	useEffect(() => {
		if (from && to) {
			const fromDate = new Date(from);
			const toDate = new Date(to);

			if (fromDate > toDate) {
				setError("Start date cannot be after end date.");
				onChange(null);
			} else {
				setError("");
				onChange({
					from: fromDate.toISOString(),
					to: toDate.toISOString(),
				});
			}
		}
	}, [from, to]);

	return (
		<div className="  w-full  py-2 px-4 border border-gray-200 rounded-lg shadow-sm max-w-xl ">
			<h2 className="text-lg font-semibold text-gray-800 mb-4">
				Select Statement Period
			</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<div>
					<label
						htmlFor="from"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						From Date
					</label>
					<input
						id="from"
						name="from"
						type="date"
						value={from}
						onChange={(e) => setFrom(e.target.value)}
						className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
					/>
				</div>

				<div>
					<label
						htmlFor="to"
						className="block text-sm font-medium text-gray-700 mb-1"
					>
						To Date
					</label>
					<input
						id="to"
						name="to"
						type="date"
						value={to}
						onChange={(e) => setTo(e.target.value)}
						className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2"
					/>
				</div>
			</div>

			{error && (
				<p className="mt-3 text-sm text-red-600 font-medium">{error}</p>
			)}
		</div>
	);
}
