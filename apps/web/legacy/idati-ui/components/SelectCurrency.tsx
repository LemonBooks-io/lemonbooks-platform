import { useState } from "react";

export default function SelectCurrency({
  selectedCurrency,
  setSelectedCurrency,
}) {
  const [open, setOpen] = useState(false);

  const currencies = [
    { id: 5, description: "🇰🇼 Kuwaiti Dinar (KWD)", symbol: "KWD" },
    { id: 9, description: "🇺🇸 US Dollar (USD)", symbol: "USD" },
    { id: 1, description: "🇦🇪 UAE Dirham (AED)", symbol: "AED" },

    { id: 4, description: "🇬🇧 UK Pound Sterling (GBP)", symbol: "GBP" },
    { id: 2, description: "🇧🇭 Bahraini Dinar (BHD)", symbol: "BHD" },
    { id: 3, description: "🇪🇺 Euro (EUR)", symbol: "EUR" },

    { id: 6, description: "🇴🇲 Omani Riyal (OMR)", symbol: "OMR" },
    { id: 7, description: "🇶🇦 Qatari Riyal (QAR)", symbol: "QAR" },
    { id: 8, description: "🇸🇦 Saudi Riyal (SAR)", symbol: "SAR" },
  ];

  return (
    <div className="relative w-full">
      {/* Dropdown Toggle */}
      <div
        onClick={() => setOpen(!open)}
        className="cursor-pointer w-full py-3 px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm bg-white"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            {!selectedCurrency && (
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
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            )}
            <span>
              {selectedCurrency
                ? selectedCurrency?.description
                : "Select default currency"}
            </span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Dropdown Menu (Floating) */}
      {open && (
        <>
          {/* Backdrop click to close */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            <ul className="text-sm">
              {currencies.map((currency) => (
                <li
                  key={currency?.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setSelectedCurrency(currency);
                    setOpen(false);
                  }}
                >
                  {currency?.description}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
