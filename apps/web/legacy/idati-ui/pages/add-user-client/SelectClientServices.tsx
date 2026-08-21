import React from "react";
import { useState } from "react";

export default function SelectClientServices({
	allServices,
	setSelectedServices,
	selectedServices,
}) {
	const selectHandler = (id, checked) => {
		setPermissions((prevPermissions) =>
			prevPermissions.map((ser, i) =>
				i === id ? { ...perm, isSelected: checked } : perm
			)
		);
	};

	const handleServiceSelection = (serviceId, isChecked) => {
		setSelectedServices((prevSelected) => {
			if (isChecked) {
				// Add the service ID if it is checked and not already in the array
				return [...prevSelected, serviceId];
			} else {
				// Remove the service ID if it is unchecked
				return prevSelected.filter((id) => id !== serviceId);
			}
		});
	};

	return (
		<div className="py-4 bg-white ">
			<div className="px-2 mx-auto ">
				<div className=" mx-auto ">
					<p className="text-sm font-normal text-gray-900">
						Pre-selected Services
					</p>
					{/* "mt-6 grid grid-cols-2 gap-4" */}
					<div className="mt-4 flex flex-row  gap-10">
						{allServices?.map((ser) => (
							<div key={ser?.id} className="relative flex items-center">
								<div className="flex items-center h-5 gap-2">
									<input
										className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-0"
										type="checkbox"
										checked={selectedServices.includes(ser.id)}
										onChange={(e) =>
											handleServiceSelection(ser.id, e.target.checked)
										}
									/>
									<div>{ser?.serviceName}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
