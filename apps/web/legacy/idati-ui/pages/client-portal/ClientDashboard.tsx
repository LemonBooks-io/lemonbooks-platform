import { Logout } from "iconsax-react";
import { useStates } from "../../contexts/StatesContext";
import { useNavigate } from "react-router-dom";
import LoadingModal from "../loading/LoadingModal";

export default function ClientDashboard() {
  const {
    setAccessToken,
    accessToken,
    userProfile,
    isFetching,
    allServices,
    handleLogout,
  } = useStates();
  const navigate = useNavigate();
  if (!userProfile) return null;
  const subscribedServices = {
    title: "Services and Payments",
    description: "List of services subscribed to, amount and payment due dates",
    services: [
      {
        id: "12131212",
        serviceName: "Revel System POS",
        amount: "50kd/mount",
        nextDueOn: "Oct. 15 2024",
      },
      {
        id: "wde2e2e",
        serviceName: "Realtime Sales data Syncronization",
        amount: "10kwd/month/est",
        nextDueOn: "Oct. 15 2024",
      },
    ],
    route: "/",
  };
  const dashboardItems = [
    {
      title: "24 hrs Order Volume",
      description: "List of all orders made within the last 24hrs period",
      route: "/",
    },
    {
      title: "7days Order Volume ",
      description: "List of all orders made within the last 7days period",
      route: "/",
    },
  ];

  function goToDataHandler() {
    navigate("/orders");
  }

  // function handleLogout() {
  //   localStorage.removeItem("accessToken");
  //   setAccessToken("");
  // }

  return (
    <section className=" py-5   h-screen">
      <LoadingModal />
      {!isFetching && (
        <div className="">
          {" "}
          <div
            onClick={handleLogout}
            className="flex px-4 justify-end mx-auto item-center max-w-7xl sm:px-6 lg:px-8 cursor-pointer "
          >
            <Logout size="32" className="text-gray-800 flex " />
          </div>
          <div className=" px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex w-full ">
              {" "}
              <div className="relative grid w-full  grid-cols-1 sm:grid-cols-2 items-center justify-between mt-6 ">
                <div className="text-center items-center justify-between max-w-[500px] flex flex-row gap-2">
                  <div className="text-lg gap-2 flex flex-col">
                    {" "}
                    <div className=" flex gap-8  font-semibold text-gray-900 font-pj">
                      <span className="font-normal ">Client Name:</span>{" "}
                    </div>
                    <div className=" flex gap-8  font-semibold text-gray-900 font-pj">
                      <span className="font-normal ">Establishment IDs:</span>{" "}
                    </div>
                    <div className=" flex gap-8  font-semibold text-gray-900 font-pj">
                      <span className="font-normal ">Revel Url:</span>{" "}
                    </div>
                    <div className=" flex gap-8  font-semibold text-gray-900 font-pj">
                      <span className="font-normal "> Client Email:</span>{" "}
                    </div>
                  </div>

                  <div className="text-lg gap-1 flex flex-col">
                    {" "}
                    <div className=" flex gap-8  font-semibold text-gray-900 font-pj">
                      <span>{userProfile?.user?.name}</span>
                    </div>
                    <div className=" flex font-semibold text-gray-900 font-pj">
                      {userProfile?.user?.establishmentId.map((est, index) => (
                        <div key={est} className="">
                          <span>{est} </span>
                          {index <
                            userProfile?.user?.establishmentId?.length - 1 && (
                            <span className="mr-2">,</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className=" flex gap-8  font-semibold text-gray-900 font-pj">
                      <span>{userProfile?.user?.establishmentUrl}</span>
                    </div>
                    <div className=" flex gap-8  font-semibold text-gray-900 font-pj">
                      <span>{userProfile?.user?.email}</span>
                    </div>
                  </div>
                </div>
                <div className="relative grid  grid-cols-1 gap-4 max-w-[600px]  mt-6">
                  <button
                    // onClick="
                    className="inline-flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-md focus:outline-none hover:bg-blue-700 focus:bg-blue-700"
                  >
                    Make Payment
                  </button>

                  <button
                    onClick={goToDataHandler}
                    className="inline-flex items-center justify-center w-full px-4 py-3 text-base font-semibold text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-md focus:outline-none hover:bg-blue-700 focus:bg-blue-700"
                  >
                    View Sales Data
                  </button>
                </div>
              </div>
            </div>

            <div className=" relative mt-14">
              <div className="  relative grid  grid-cols-1 gap-5 mx-auto sm:gap-6 lg:gap-10 ">
                <div className="bg-white shadow-xl rounded-xl">
                  <div className="p-4 px-8">
                    <h3 className="text-xl justify-start flex font-bold text-gray-900 font-pj mt-11">
                      {subscribedServices.title}
                    </h3>
                    <p className="mt-3 flex items-start text-start justify-start text-base font-normal leading-7 text-gray-600">
                      {subscribedServices.description}
                    </p>

                    {subscribedServices.services.map((service, index) => (
                      <div
                        key={index}
                        className=" bg-slate-100 flex mt-8 justify-between items-center"
                      >
                        <div className=" bg-slate-100  py-2 px-5 rounded-full text-lg text-gray-700 flex gap-1 items-center justify-center">
                          <span className="font-semibold text-xl">
                            {service.serviceName}
                          </span>
                        </div>
                        <div className=" text-gray-700   py-2 px-5 rounded-full text-lg flex gap-1 items-center justify-center">
                          <div className="">
                            <p className="font-semibold text-sm">
                              {service.amount}
                            </p>
                            <p className="font-semibold text-normal">
                              {service.nextDueOn}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-14">
              <div className="  relative grid  grid-cols-1 gap-5 mx-auto sm:gap-6 lg:gap-10 sm:grid-cols-2">
                {dashboardItems.map((item, index) => (
                  <div key={index} className="bg-white shadow-xl rounded-xl">
                    <div className="p-4 px-8">
                      <h3 className="text-xl justify-start flex font-bold text-gray-900 font-pj mt-11">
                        {item.title}
                      </h3>
                      <p className="mt-3 flex items-start text-start justify-start text-base font-normal leading-7 text-gray-600">
                        {item.description}
                      </p>

                      <div className="flex mt-8 justify-between items-center">
                        <div className=" bg-slate-100  py-2 px-5 rounded-full text-lg flex gap-1 items-center justify-center">
                          <span className="font-bold text-2xl">21</span>
                          <span> Orders</span>
                        </div>
                        <div className=" bg-slate-100   py-2 px-5 rounded-full text-lg flex gap-1 items-center justify-center">
                          <span className="font-bold text-2xl">250</span>
                          <span> KD</span>
                        </div>
                      </div>

                      {/* <a
                    href="mailto:info@sorobuild.io?subject=Demo%20Request%20Staking"
                    title=""
                    className="inline-flex gap-2 items-center justify-center px-8 py-3 mt-8 text-base font-bold text-gray-900 transition-all duration-200 rounded-xl font-pj "
                    role="button"
                  >
                    View Clients Details <ArrowRight />
                  </a> */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
