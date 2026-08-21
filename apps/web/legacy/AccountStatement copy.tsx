import React, { useState } from "react";

export default function AccountStatement() {
  return (
    <div>
      <div className="container px-4 mx-auto">
        <div className="sticky top-0 z-10 flex flex-shrink-0 h-16 bg-white border-b border-gray-200">
          <div className="flex flex-1 px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-between flex-1 lg:justify-end">
              <div className="flex items-center -m-2 xl:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 text-gray-400 bg-white rounded-lg hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                >
                  <svg
                    className="w-6 h-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="flex ml-4 mr-auto xl:ml-0">
                <div className="flex items-center flex-shrink-0">
                  <img
                    className="block w-auto h-8 xl:hidden"
                    src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/logo.svg"
                    alt=""
                  />
                </div>
              </div>

              <div className="flex-1 hidden max-w-xs ml-auto lg:block">
                <label for="" className="sr-only">
                  {" "}
                  Search{" "}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      ></path>
                    </svg>
                  </div>

                  <input
                    type="search"
                    name=""
                    id=""
                    className="border block w-full py-2 pl-10 border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
                    placeholder="Search here"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 sm:ml-5">
                <div className="relative">
                  <button
                    type="button"
                    className="p-1 text-gray-700 transition-all duration-200 bg-white rounded-full hover:text-gray-900 focus:outline-none hover:bg-gray-100"
                  >
                    <svg
                      className="w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      ></path>
                    </svg>
                  </button>
                  <span className="inline-flex items-center px-1.5 absolute -top-px -right-1 py-0.5 rounded-full text-xs font-semibold bg-indigo-600 text-white">
                    {" "}
                    2{" "}
                  </span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    className="p-1 text-gray-700 transition-all duration-200 bg-white rounded-full hover:text-gray-900 focus:outline-none hover:bg-gray-100"
                  >
                    <svg
                      className="w-6 h-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      ></path>
                    </svg>
                  </button>
                </div>

                <button
                  type="button"
                  className="flex items-center max-w-xs rounded-full xl:hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                >
                  <img
                    className="object-cover bg-gray-300 rounded-full w-9 h-9"
                    src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/previews/settings/2/avatar-male.png"
                    alt=""
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <main>
          <div className="py-6">
            <div className="px-4 mx-auto sm:px-6 md:px-8">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>

            <div className="px-4 mx-auto mt-8 sm:px-6 md:px-8">
              <div className="w-full pb-1 overflow-x-auto">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px space-x-10">
                    {[
                      "Profile",
                      "Password",
                      "Team",
                      "Notification",
                      "Integrations",
                      "Licenses",
                    ].map((tab, index) => (
                      <a
                        key={tab}
                        href="#"
                        className={`py-4 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                          tab === "Integrations"
                            ? "text-indigo-600 border-indigo-600"
                            : "text-gray-500 border-transparent hover:border-gray-300"
                        }`}
                      >
                        {tab}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>

              <div className="mt-8 border border-indigo-300 rounded-lg bg-indigo-50">
                <div className="px-4 py-5 sm:p-6">
                  <div className="md:flex md:items-center md:justify-between">
                    <img
                      className="flex-shrink-0 object-cover w-16 h-16 rounded-lg"
                      src="https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/previews/settings/3/avatar-female.png"
                      alt=""
                    />
                    <div className="flex-1 max-w-xs mt-4 md:mt-0 md:ml-6">
                      <p className="text-base font-bold text-gray-900">
                        Learn how to connect new apps with Rareblocks API
                      </p>
                      <p className="mt-1 text-sm font-medium text-gray-500">
                        Lorem ipsum dolor sit amet, consec tetur.
                      </p>
                    </div>

                    <div className="flex items-center justify-start mt-6 space-x-6 md:ml-auto md:justify-end md:mt-0">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold leading-5 text-white transition-all duration-200 bg-indigo-600 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-500"
                      >
                        View Tutorial
                      </button>
                      <button
                        type="button"
                        className="text-sm font-medium text-gray-500 transition-all duration-200 hover:text-gray-900"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-base font-bold text-gray-900">
                    Connect Apps
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Lorem ipsum dolor sit amet, consectetur adipis.
                  </p>
                </div>

                <div className="mt-4 sm:mt-0">
                  <label htmlFor="search-app" className="sr-only">
                    Search App
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="search"
                      name="search-app"
                      id="search-app"
                      className="block w-full py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600"
                      placeholder="Search App"
                    />
                  </div>
                </div>
              </div>

              <div className="flow-root mt-8">
                <div className="-my-5 divide-y divide-gray-200">
                  {[
                    {
                      name: "Mailchimp",
                      logo: "mailchimp-logo.png",
                      description:
                        "Lorem ipsum dolor sit amet, consectetur adipis.",
                      enabled: false,
                    },
                    {
                      name: "Zapier",
                      logo: "zapier-logo.png",
                      description: "Lorem ipsum dolor sit amet, consectes.",
                      enabled: true,
                    },
                    {
                      name: "Telegram",
                      logo: "telegram-logo.png",
                      description: "Lorem ipsum dolor sit amet.",
                      enabled: false,
                    },
                    {
                      name: "Slack",
                      logo: "slack-logo.png",
                      description:
                        "Lorem ipsum dolor sit amet, consectetur adipis.",
                      enabled: true,
                    },
                    {
                      name: "Dropbox",
                      logo: "dropbox-logo.png",
                      description: "Lorem ipsum dolor sit amet adipis.",
                      enabled: false,
                    },
                  ].map((app, index) => (
                    <div key={app.name} className="py-5">
                      <div className="sm:flex sm:items-center sm:justify-between sm:space-x-5">
                        <div className="flex items-center flex-1 min-w-0">
                          <img
                            className="flex-shrink-0 object-cover w-10 h-10 rounded-full"
                            src={`https://landingfoliocom.imgix.net/store/collection/clarity-dashboard/images/previews/settings/3/${app.logo}`}
                            alt={`${app.name} logo`}
                          />
                          <div className="flex-1 min-w-0 ml-4">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {app.name}
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-500 truncate">
                              {app.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 sm:space-x-6 pl-14 sm:pl-0 sm:justify-end sm:mt-0">
                          <a
                            href="#"
                            className="text-sm font-medium text-gray-400 transition-all duration-200 hover:text-gray-900"
                          >
                            Learn More
                          </a>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={app.enabled}
                            className="relative inline-flex flex-shrink-0 w-11 h-6 transition-all duration-200 ease-in-out bg-white border border-gray-200 rounded-full cursor-pointer focus:outline-none"
                          >
                            <span className="sr-only">Enable</span>
                            <span
                              aria-hidden="true"
                              className={`inline-block w-3.5 h-3.5 mt-1 ml-1 transition duration-200 ease-in-out transform rounded-full pointer-events-none ring-0 ${
                                app.enabled
                                  ? "translate-x-5 bg-indigo-600"
                                  : "translate-x-0 bg-gray-400"
                              }`}
                            ></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
