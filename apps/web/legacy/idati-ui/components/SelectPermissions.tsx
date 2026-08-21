import React from "react";
import { useState } from "react";

export default function SelectPermissions({ setPermissions, permissions }) {
	const [terms, setTerms] = useState(false);
	const [profile, setProfile] = useState(true);

	const selectHandler = (index, checked) => {
		setPermissions((prevPermissions) =>
			prevPermissions.map((perm, i) =>
				i === index ? { ...perm, isSelected: checked } : perm
			)
		);
	};

	return (
		<div className="py-4 bg-white">
			<div className="px-2 mx-auto  max-w-7xl">
				<div className="max-w-sm mx-auto">
					<p className="text-sm font-bold text-gray-900">User's permissions</p>

					<div className="mt-6 grid grid-cols-2 gap-4">
						{permissions?.map((perm, index) => (
							<div key={index} className="relative flex items-center">
								<div className="flex items-center h-5 gap-2">
									<input
										className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-0"
										type="checkbox"
										checked={perm.isSelected}
										onChange={(e) => selectHandler(index, e.target.checked)}
									/>
									<div>{perm.title}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
