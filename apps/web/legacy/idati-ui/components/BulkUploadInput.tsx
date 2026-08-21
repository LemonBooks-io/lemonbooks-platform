import { useState } from "react";
import { useStates } from "../contexts/StatesContext";

export default function BulkUploadInput({ templateName }) {
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const { bulkUploadData, setBulkUploadData, handleDownloadTemplate } =
    useStates();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("csv", file);

    setBulkUploadData(formData);
  };
  return (
    <div className=" col-span-2 sm:col-span-4">
      <div className="flex justify-between">
        {" "}
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Data CSV
        </label>
        <button
          onClick={() => handleDownloadTemplate(templateName)}
          className="mb-2 text-indigo-600"
        >
          Download template
        </button>
      </div>
      <input
        onChange={handleUpload}
        type="file"
        id="paymentProof"
        accept=".csv"
        className="block w-full text-sm  text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 file:mr-4 file:py-3 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-800"
      />
      <p className="mt-1 text-xs text-gray-500">
        Follow sample format to create data csv
      </p>
    </div>
  );
}
