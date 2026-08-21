import { useRef, useState } from "react";

export default function UploadLogo({ handleImageUpload }) {
	const [logoPreview, setLogoPreview] = useState(null);
	const fileInputRef = useRef();

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setLogoPreview(URL.createObjectURL(file));
		handleImageUpload(file); // <— SEND FILE TO PARENT
	};

	return (
		<div className="relative w-full">
			{/* Upload Trigger */}
			<div
				onClick={() => fileInputRef.current.click()}
				className="cursor-pointer w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm bg-white"
			>
				<div className="flex justify-between items-center">
					<div className="flex items-center space-x-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5 12h14M12 5l7 7-7 7"
							/>
						</svg>
						<span>
							{logoPreview ? "Logo selected" : "Click to upload logo"}
						</span>
					</div>
					{logoPreview && (
						<img
							src={logoPreview}
							alt="Uploaded logo"
							className="h-6 w-6 rounded object-cover"
						/>
					)}
				</div>
			</div>

			{/* Hidden File Input */}
			<input
				type="file"
				accept="image/*"
				ref={fileInputRef}
				onChange={handleFileChange}
				className="hidden"
			/>
		</div>
	);
}
