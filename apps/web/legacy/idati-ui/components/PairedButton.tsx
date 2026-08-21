export default function PairedButton({
  children,
  onClick = () => {},
  isLoading = false,
  message = "processing",
}) {
  function LoadingDisplay({ message }) {
    return (
      <div className="flex items-center gap-2">
        <div className="">
          <svg
            className="w-5  h-auto mx-auto text-gray-300 animate-spin "
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
    <>
      <button
        onClick={onClick}
        className="inline-flex items-center justify-center w-full px-4 py-4 text-base font-semibold text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-l-md focus:outline-none hover:bg-indigo-700 focus:bg-indigo-700"
      >
        {isLoading ? <LoadingDisplay message={message} /> : children}
      </button>
    </>
  );
}
