import { useStates } from "../../contexts/StatesContext";

export default function ProductCategoryTabs({ setProductServiceBody }) {
  const { productCategoryTab, setProductCategoryTab } = useStates();
  return (
    <div className="flex items-center  justify-between h-16">
      <div className="flex items-end justify-between ">
        <div className="flex justify-start gap-1 p-1 border border-dark-200 rounded-full">
          <button
            className={`text-black text-sm px-[15px] py-1 rounded-full font-bold ${
              productCategoryTab === "PRODUCT" ? "bg-gray-300 text-black " : ""
            }`}
            onClick={() => setProductCategoryTab("PRODUCT")}
          >
            PRODUCTS & SERVICES
          </button>
          <button
            className={`text-black text-sm px-[15px] py-1 rounded-full font-bold ${
              productCategoryTab === "CATEGORY" ? "bg-gray-300 text-black " : ""
            }`}
            onClick={() => {
              setProductCategoryTab("CATEGORY");
              setProductServiceBody({
                name: "",
                cost: "",
                currency: "KWD",
                description: "",
                billingCycle: "Monthly",
                serviceCycle: "Monthly",
                categoryId: "",
                type: "PRODUCT",
              });
            }}
          >
            CATEGORIES
          </button>
        </div>
      </div>
    </div>
  );
}
