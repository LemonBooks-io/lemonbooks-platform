import React from "react";
import { useState } from "react";

export default function SelectServices() {
	const permitArr = [
		{ permission: "ALL", title: "All Permissions", isSelected: false },
		{ permission: "ADD_ADMIN", title: "Add Admins", isSelected: false },
		{ permission: "DELETE_ADMIN", title: "Delete Admins", isSelected: false },
		{ permission: "ADD_CLIENT", title: "Add Clients", isSelected: false },
		{ permission: "DELETE_CLIENT", title: "Delete Clients", isSelected: false },
	];

	const [permissions, setPermissions] = useState(permitArr);

	const selectHandler = (index, checked) => {
		setPermissions((prevPermissions) =>
			prevPermissions.map((perm, i) =>
				i === index ? { ...perm, isSelected: checked } : perm
			)
		);
	};

	return (
		<div className="py-4 bg-white">
			<div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
				<div className="max-w-sm mx-auto">
					<p className="text-sm font-bold text-gray-900">User's permissions</p>

					<div className="mt-6 space-y-3">
						{permissions.map((perm, index) => (
							<div key={index} className="relative flex items-center">
								<div className="flex items-center h-5 gap-2">
									<input
										className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-0"
										type="checkbox"
										checked={perm.isSelected}
										onChange={(e) => selectHandler(index, e.target.checked)}
									/>
									<div className="">{perm.title}</div>
								</div>
							</div>
						))}
						{/* {permitArr.map((per, index) => (
              <div key={index} className="relative flex items-center">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-0"
                    checked={per?.isSelected}
                    onChange={(e) => selectHandler(index, e.target.checked)}
                  />
                </div>

                <div className="ml-3">
                  <label
                    htmlFor="profile"
                    className="text-sm font-medium text-gray-900"
                  >
                    {" "}
                    Owner Permission
                  </label>
                </div>
              </div>
            ))} */}
					</div>
				</div>
			</div>
		</div>
	);
}
