import { useEffect } from "react";

export default function Button({
  children,
  onClick = () => {},
  isLoading = false,
  message = "processing",
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        onClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClick]);
  function LoadingDisplay({ message }) {
    return (
      <div className="flex items-center gap-2">
        <div className="">
          <svg
            className="w-5   h-auto mx-auto text-gray-300 animate-spin "
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <div className="">{message}</div>{" "}
      </div>
    );
  }
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex min-h-12 items-center justify-center w-full px-4 py-3 text-base font-semibold text-white transition-all duration-200 bg-[#174c3c] border border-transparent rounded-xl focus:outline-none hover:bg-[#103c2f] focus:bg-[#103c2f] disabled:cursor-wait disabled:opacity-70"
    >
      {isLoading ? <LoadingDisplay message={message} /> : children}
    </button>
  );
}
