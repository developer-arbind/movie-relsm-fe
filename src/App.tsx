import { useState } from "react";
import { useNavigate } from "react-router-dom";
const App = () => {
  const history = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [menuOne, setMenuOne] = useState(false);
  return (
    <div>
      <section>
        <nav className="font-inter mx-auto h-auto w-full max-w-screen-2xl lg:relative lg:top-0">
          <div className="flex flex-col px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-4 xl:px-20">
            <a href="#">
              <img
                src="https://i.imgur.com/2UVX7N8.png"
                width={"300px"}
                alt=""
              />
            </a>
            <div
              className={`mt-14 flex flex-col space-y-8 lg:mt-0 lg:flex lg:flex-row lg:space-x-1 lg:space-y-0 ${
                isOpen ? "" : "hidden"
              }`}
            >
              <div className="relative flex flex-col">
                <button
                  onClick={() => setMenuOne(!menuOne)}
                  className={`flex flex-row rounded-lg lg:px-6 lg:py-4 lg: lg:hover:text-gray-800 ${
                    menuOne
                      ? "text-gray-800 lg:border lg:border-gray-600 lg:bg-gray-50"
                      : "text-black lg:border lg:border-white"
                  }`}
                >
                  How Is It Working?
                  <svg
                    className={`fill-current transition ${
                      menuOne ? "rotate-180" : "rotate-0"
                    }`}
                    style={{ width: "24px", height: "24px" }}
                    viewBox="0 0 24 24"
                  >
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"></path>
                  </svg>
                </button>
                {menuOne && (
                  <div className="z-50 flex w-full flex-col rounded-lg px-5 py-5 lg:absolute lg:top-20 lg:w-[800px] bg-gray-100 lg:flex-row lg:flex-wrap lg:py-7 xl:w-[950px]">
                    {/* ITEM */}
                    <a
                      className="flex grow flex-col rounded-lg px-5 py-5  lg:basis-60 xl:px-8"
                      href="#"
                    >
                      {/* ICON */}
                      <div className="relative">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 40 40"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="40" height="40" fill="#C4C4C4" />
                          <path
                            d="M18.4688 18.6875C18.8312 18.6875 19.125 18.3937 19.125 18.0312C19.125 17.6688 18.8312 17.375 18.4688 17.375C18.1063 17.375 17.8125 17.6688 17.8125 18.0312C17.8125 18.3937 18.1063 18.6875 18.4688 18.6875Z"
                            fill="black"
                          />
                          <path
                            d="M24.3751 14.75H15.6251C15.3931 14.7503 15.1707 14.8425 15.0066 15.0066C14.8426 15.1706 14.7503 15.393 14.7501 15.625V22.6236L14.75 22.6253L14.7501 24.375C14.7503 24.607 14.8426 24.8294 15.0066 24.9934C15.1707 25.1575 15.3931 25.2497 15.6251 25.25H24.3751C24.607 25.2497 24.8294 25.1575 24.9935 24.9934C25.1575 24.8294 25.2498 24.607 25.2501 24.375V15.625C25.2498 15.393 25.1575 15.1706 24.9935 15.0066C24.8294 14.8425 24.607 14.7503 24.3751 14.75ZM22.8063 19.125C22.642 18.9612 22.4195 18.8691 22.1875 18.8691C21.9555 18.8691 21.733 18.9612 21.5688 19.125L19.1251 21.5688L17.9938 20.4375C17.8295 20.2737 17.607 20.1817 17.375 20.1817C17.1431 20.1817 16.9205 20.2737 16.7563 20.4375L15.6251 21.5687V15.625H24.3751L24.3754 20.6941L22.8063 19.125Z"
                            fill="black"
                          />
                        </svg>
                      </div>
                      {/* TEXT */}
                      <h2 className="font-inter mb-1 mt-5 text-lg font-medium text-black">
                        Analytics
                      </h2>
                      <p className="font-inter max-w-64 text-sm text-gray-500 lg:max-w-sm">
                        Get a better understanding of where your traffic is
                        coming from
                      </p>
                    </a>
                    {/* ITEM */}
                    <a
                      className="flex grow flex-col rounded-lg px-5 py-5  lg:basis-60 xl:px-8"
                      href="#"
                    >
                      {/* ICON */}
                      <div className="relative">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 40 40"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="40" height="40" fill="#C4C4C4" />
                          <path
                            d="M18.4688 18.6875C18.8312 18.6875 19.125 18.3937 19.125 18.0312C19.125 17.6688 18.8312 17.375 18.4688 17.375C18.1063 17.375 17.8125 17.6688 17.8125 18.0312C17.8125 18.3937 18.1063 18.6875 18.4688 18.6875Z"
                            fill="black"
                          />
                          <path
                            d="M24.3751 14.75H15.6251C15.3931 14.7503 15.1707 14.8425 15.0066 15.0066C14.8426 15.1706 14.7503 15.393 14.7501 15.625V22.6236L14.75 22.6253L14.7501 24.375C14.7503 24.607 14.8426 24.8294 15.0066 24.9934C15.1707 25.1575 15.3931 25.2497 15.6251 25.25H24.3751C24.607 25.2497 24.8294 25.1575 24.9935 24.9934C25.1575 24.8294 25.2498 24.607 25.2501 24.375V15.625C25.2498 15.393 25.1575 15.1706 24.9935 15.0066C24.8294 14.8425 24.607 14.7503 24.3751 14.75ZM22.8063 19.125C22.642 18.9612 22.4195 18.8691 22.1875 18.8691C21.9555 18.8691 21.733 18.9612 21.5688 19.125L19.1251 21.5688L17.9938 20.4375C17.8295 20.2737 17.607 20.1817 17.375 20.1817C17.1431 20.1817 16.9205 20.2737 16.7563 20.4375L15.6251 21.5687V15.625H24.3751L24.3754 20.6941L22.8063 19.125Z"
                            fill="black"
                          />
                        </svg>
                      </div>
                      {/* TEXT */}
                      <h2 className="font-inter mb-1 mt-5 text-lg font-medium text-black">
                        Engagement
                      </h2>
                      <p className="font-inter max-w-64 text-sm text-gray-500 lg:max-w-sm">
                        Speak directly to your customers in a more meaningful
                        way
                      </p>
                    </a>
                    {/* ITEM */}
                    <a
                      className="flex grow flex-col rounded-lg px-5 py-5  lg:basis-60 xl:px-8"
                      href="#"
                    >
                      {/* ICON */}
                      <div className="relative">
                        <svg
                          width="40"
                          height="40"
                          viewBox="0 0 40 40"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="40" height="40" fill="#C4C4C4" />
                          <path
                            d="M18.4688 18.6875C18.8312 18.6875 19.125 18.3937 19.125 18.0312C19.125 17.6688 18.8312 17.375 18.4688 17.375C18.1063 17.375 17.8125 17.6688 17.8125 18.0312C17.8125 18.3937 18.1063 18.6875 18.4688 18.6875Z"
                            fill="black"
                          />
                          <path
                            d="M24.3751 14.75H15.6251C15.3931 14.7503 15.1707 14.8425 15.0066 15.0066C14.8426 15.1706 14.7503 15.393 14.7501 15.625V22.6236L14.75 22.6253L14.7501 24.375C14.7503 24.607 14.8426 24.8294 15.0066 24.9934C15.1707 25.1575 15.3931 25.2497 15.6251 25.25H24.3751C24.607 25.2497 24.8294 25.1575 24.9935 24.9934C25.1575 24.8294 25.2498 24.607 25.2501 24.375V15.625C25.2498 15.393 25.1575 15.1706 24.9935 15.0066C24.8294 14.8425 24.607 14.7503 24.3751 14.75ZM22.8063 19.125C22.642 18.9612 22.4195 18.8691 22.1875 18.8691C21.9555 18.8691 21.733 18.9612 21.5688 19.125L19.1251 21.5688L17.9938 20.4375C17.8295 20.2737 17.607 20.1817 17.375 20.1817C17.1431 20.1817 16.9205 20.2737 16.7563 20.4375L15.6251 21.5687V15.625H24.3751L24.3754 20.6941L22.8063 19.125Z"
                            fill="black"
                          />
                        </svg>
                      </div>
                      {/* TEXT */}
                      <h2 className="font-inter mb-1 mt-5 text-lg font-medium text-black">
                        Automations
                      </h2>
                      <p className="font-inter max-w-64 text-sm text-gray-500 lg:max-w-sm">
                        Build strategic funnels that will drive your customers
                        to convert
                      </p>
                    </a>
                  </div>
                )}
              </div>
              <a
                href="#"
                className="font-inter rounded-lg lg:px-6 lg:py-4 lg: lg:hover:text-gray-800"
              >
                Terms and Condition
              </a>
              <a
                href="#"
                className="font-inter rounded-lg lg:px-6 lg:py-4 lg: lg:hover:text-gray-800"
              >
                Privacy
              </a>
              <a
                href="#"
                className="font-inter lg: rounded-lg pb-8 lg:px-6 lg:py-4 lg: lg:hover:text-gray-800"
              >
                FAQs
              </a>
            </div>
            <div
              className={`flex flex-col space-y-8 lg:flex lg:flex-row lg:space-x-3 lg:space-y-0 ${
                isOpen ? "" : "hidden"
              }`}
            >
              <a
                className="font-inter rounded-lg bg-black px-8 py-4 text-center text-white hover:bg-gray-800"
                href="#"
              >
                Reconnect
              </a>
            </div>
            <button
              className="absolute right-5 lg:hidden"
              onClick={() => {
                setIsOpen(!isOpen);
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.75 12H20.25"
                  stroke="#160042"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M3.75 6H20.25"
                  stroke="#160042"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
                <path
                  d="M3.75 18H20.25"
                  stroke="#160042"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>
          </div>
        </nav>
      </section>
      <section>
        {/* Container */}
        <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-24 lg:py-32">
          {/* Component */}
          <div className="grid grid-cols-1 items-center gap-12 sm:gap-20 lg:grid-cols-2 lg:gap-28">
            {/* Heading Div */}
            <div className="max-w-[720px] lg:max-w-[842px]">
              <h1 className="mb-4 text-4xl font-semibold md:text-6xl">
                Wanna Experience A movie with your friends in{" "}
                <span className="bg-[url('https://assets.website-files.com/63904f663019b0d8edf8d57c/6390526ac2a607693620c97b_Rectangle%2010.svg')] bg-cover bg-center px-4 text-white">
                  Realtime
                </span>
              </h1>
              <p className="mb-6 max-w-[528px] text-xl text-[#636262] md:mb-10 lg:mb-12">
                Create a room, invite your friends, and enjoy laughing, getting
                scared, and having fun together in real-time sync. No more
                counting down from 1, 2, 3!
              </p>
              <a
                style={{ cursor: "pointer" }}
                onClick={() => history("/create-room")}
                className="inline-block rounded-xl bg-black px-8 py-4 text-center font-semibold text-white [box-shadow:rgb(19,_83,_254)_6px_6px]"
              >
                Create Room.
              </a>
            </div>
            {/* Image Div */}
            <div className="relative mx-auto h-full max-h-[640px] w-[90%] max-w-[640px] lg:w-full lg:max-w-[480px]">
              <img
                src="https://i.imgur.com/Oc1mTTn.png"
                alt=""
                className="h-full w-full max-w-[800px] object-cover"
              />
              {/* Testimonial Div */}
              <div className="absolute -left-[7.5%] bottom-[10%] right-auto top-auto flex h-28 w-80 flex-col items-start justify-center border border-solid border-black bg-white px-5 py-3 [box-shadow:rgb(0,_0,_0)_4px_4px] lg:left-[-45%]">
                {/* Testimonial Text */}
                <div className="mb-4 flex h-auto items-start">
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63906655aa174e025702f043_Group%20(1).svg"
                    alt=""
                    className="mr-2 inline-block"
                  />
                  <p className="pt-1.5 text-sm text-[#636262]">
                    god, what just happened, I can't understand😱
                  </p>
                </div>
                <div className="flex h-auto w-full items-center justify-between">
                  {/* Author */}
                  <div className="flex items-center">
                    <img
                      src="https://static.wikia.nocookie.net/obluda/images/3/31/Johan_smirk.png/revision/latest?cb=20240224064817"
                      alt=""
                      className="mr-2 inline-block h-8"
                    />
                    <div>
                      <p className="text-sm font-bold">Arbind Kumar</p>
                      <p className="text-sm">Developer</p>
                    </div>
                  </div>
                  {/* Stars Review */}
                  <div>
                    <img
                      src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6390676b385b0525c99b09a8_Vector.svg"
                      alt=""
                      className="mr-1 inline-block w-3.5"
                    />
                    <img
                      src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6390676b385b0525c99b09a8_Vector.svg"
                      alt=""
                      className="mr-1 inline-block w-3.5"
                    />
                    <img
                      src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6390676b385b0525c99b09a8_Vector.svg"
                      alt=""
                      className="mr-1 inline-block w-3.5"
                    />
                    <img
                      src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6390676b385b0525c99b09a8_Vector.svg"
                      alt=""
                      className="mr-1 inline-block w-3.5"
                    />
                    <img
                      src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6390676b385b0525c99b09a8_Vector.svg"
                      alt=""
                      className="mr-1 inline-block w-3.5"
                    />
                  </div>
                </div>
              </div>
              {/* Testimonial Div */}
              <div className="absolute -left-[7.5%] -right-[5%] bottom-1/2 top-auto flex h-28 w-80 flex-col items-start justify-center border border-solid border-black bg-white px-5 py-3 [box-shadow:rgb(0,_0,_0)_4px_4px] sm:bottom-[35%] lg:left-auto lg:right-[-10%]">
                {/* Testimonial Text */}
                <div className="mb-4 flex h-auto items-start">
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63906655aa174e025702f043_Group%20(1).svg"
                    alt=""
                    className="mr-2 inline-block"
                  />
                  <p className="pt-1.5 text-sm text-[#636262]">
                    Disgusting, how the hell someone can kill like this, this is
                    pure pshyco
                  </p>
                </div>
                <div className="flex h-auto w-full items-center justify-between">
                  {/* Author */}
                  <div className="flex items-center">
                    <img
                      src="https://i.pinimg.com/236x/24/50/6d/24506d71d06e5c15f325555ce64f1514.jpg"
                      alt=""
                      className="mr-2 inline-block h-8"
                    />
                    <div>
                      <p className="text-sm font-bold">Aalok Patel</p>
                      <p className="text-sm">High school student</p>
                    </div>
                  </div>
                  {/* Stars Review */}
                  <div>
                    <img
                      src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6390676b385b0525c99b09a8_Vector.svg"
                      alt=""
                      className="mr-1 inline-block w-3.5"
                    />
                    <img
                      src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6390676b385b0525c99b09a8_Vector.svg"
                      alt=""
                      className="mr-1 inline-block w-3.5"
                    />
                    <img
                      src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6390676b385b0525c99b09a8_Vector.svg"
                      alt=""
                      className="mr-1 inline-block w-3.5"
                    />
                    <img
                      src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6390676b385b0525c99b09a8_Vector.svg"
                      alt=""
                      className="mr-1 inline-block w-3.5"
                    />
                    <img
                      src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6390676b385b0525c99b09a8_Vector.svg"
                      alt=""
                      className="mr-1 inline-block w-3.5"
                    />
                  </div>
                </div>
              </div>
              {/* Shadow Divs */}
              <div className="absolute bottom-0 left-4 right-0 top-4 -z-10 h-full w-full -rotate-[4.5deg] bg-[#1353fe]"></div>
              <div className="absolute bottom-0 left-4 right-0 top-4 -z-10 h-full w-full -rotate-[10deg] bg-[#1353fe33]"></div>
            </div>
          </div>
        </div>
        {/* Image Background */}
        <img
          src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63906ac023b5302b668e8a80_Frame%20427322870.svg"
          alt=""
          className="absolute bottom-0 left-auto right-0 top-auto -z-10 hidden md:bottom-auto md:left-auto md:right-0 md:top-0 md:inline-block"
        />
      </section>
      <section>
        {/* Container */}
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24 lg:py-32">
          {/* Heading Div */}
          <div className="mx-auto w-full max-w-3xl text-center">
            <h2 className="text-3xl font-semibold md:text-5xl">
              It's Supreme{" "}
              <span className="bg-[url('https://assets.website-files.com/63904f663019b0d8edf8d57c/63915f9749aaab0572c48dae_Rectangle%2018.svg')] bg-cover bg-center bg-no-repeat px-4 text-white">
                User- Features
              </span>
            </h2>
            <div className="mx-auto mb-8 mt-4 max-w-[528px] md:mb-12 lg:mb-16">
              <p className="text-[#636262]">
                Everything is completely free of cost. We don’t store any of
                your information, and there is no database involved. Enjoy
                watching as much as you want with end-to-end P2P connectivity.
              </p>
            </div>
          </div>
          {/* Features Div */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 md:grid-cols-3 lg:gap-12">
            {/* Feature Item */}
            <div className="relative mb-8 flex flex-col rounded-2xl border border-solid border-black p-8 [box-shadow:rgb(0,_0,_0)_9px_9px] lg:mb-4">
              <div className="absolute -top-8 bottom-auto left-auto right-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border border-solid border-[#9b9b9b] bg-white [box-shadow:rgb(0,_0,_0)_0px_5px] lg:right-8">
                <img
                  src="https://assets.website-files.com/63904f663019b0d8edf8d57c/639157f1a197859a6cd7f265_image%203.png"
                  alt=""
                  className="relative z-10 inline-block h-8"
                />
                <div className="absolute z-0 h-8 w-8 rounded-full border border-[#c0d1ff] bg-[#c0d1ff]"></div>
              </div>
              <p className="mb-4 text-xl font-semibold">
                Video+Text Communication
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipiscing elit ut
                aliquam, purus sit.
              </p>
            </div>
            {/* Feature Item */}
            <div className="relative mb-8 flex flex-col rounded-2xl border border-solid border-black p-8 [box-shadow:rgb(0,_0,_0)_9px_9px] lg:mb-4">
              <div className="absolute -top-8 bottom-auto left-auto right-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border border-solid border-[#9b9b9b] bg-white [box-shadow:rgb(0,_0,_0)_0px_5px] lg:right-8">
                <img
                  src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63915859fa889834c4f1ff92_image%203-2.png"
                  alt=""
                  className="relative z-10 inline-block h-8"
                />
                <div className="absolute z-0 h-8 w-8 rounded-full border border-[#c0d1ff] bg-[#c0d1ff]"></div>
              </div>
              <p className="mb-4 text-xl font-semibold">
                Realtime Sync Controll
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipiscing elit ut
                aliquam, purus sit.
              </p>
            </div>
            {/* Feature Item */}
            <div className="relative mb-8 flex flex-col rounded-2xl border border-solid border-black p-8 [box-shadow:rgb(0,_0,_0)_9px_9px] lg:mb-4">
              <div className="absolute -top-8 bottom-auto left-auto right-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border border-solid border-[#9b9b9b] bg-white [box-shadow:rgb(0,_0,_0)_0px_5px] lg:right-8">
                <img
                  src="https://assets.website-files.com/63904f663019b0d8edf8d57c/639158510667812dff08e1af_image%203-4.png"
                  alt=""
                  className="relative z-10 inline-block h-8"
                />
                <div className="absolute z-0 h-8 w-8 rounded-full border border-[#c0d1ff] bg-[#c0d1ff]"></div>
              </div>
              <p className="mb-4 text-xl font-semibold">
                Flexibility&Reconnectivity
              </p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipiscing elit ut
                aliquam, purus sit.
              </p>
            </div>
            {/* Feature Item */}
            <div className="relative mb-8 flex flex-col rounded-2xl border border-solid border-black p-8 [box-shadow:rgb(0,_0,_0)_9px_9px] lg:mb-4">
              <div className="absolute -top-8 bottom-auto left-auto right-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border border-solid border-[#9b9b9b] bg-white [box-shadow:rgb(0,_0,_0)_0px_5px] lg:right-8">
                <img
                  src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6391585b7b7cd87baef5e9ec_image%203-1.png"
                  alt=""
                  className="relative z-10 inline-block h-8"
                />
                <div className="absolute z-0 h-8 w-8 rounded-full border border-[#c0d1ff] bg-[#c0d1ff]"></div>
              </div>
              <p className="mb-4 text-xl font-semibold">Speed</p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipiscing elit ut
                aliquam, purus sit.
              </p>
            </div>
            {/* Feature Item */}
            <div className="relative mb-8 flex flex-col rounded-2xl border border-solid border-black p-8 [box-shadow:rgb(0,_0,_0)_9px_9px] lg:mb-4">
              <div className="absolute -top-8 bottom-auto left-auto right-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border border-solid border-[#9b9b9b] bg-white [box-shadow:rgb(0,_0,_0)_0px_5px] lg:right-8">
                <img
                  src="https://assets.website-files.com/63904f663019b0d8edf8d57c/639158557ac2b528531836f1_image%203-3.png"
                  alt=""
                  className="relative z-10 inline-block h-8"
                />
                <div className="absolute z-0 h-8 w-8 rounded-full border border-[#c0d1ff] bg-[#c0d1ff]"></div>
              </div>
              <p className="mb-4 text-xl font-semibold">Quality</p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipiscing elit ut
                aliquam, purus sit.
              </p>
            </div>
            {/* Feature Item */}
            <div className="relative mb-8 flex flex-col rounded-2xl border border-solid border-black p-8 [box-shadow:rgb(0,_0,_0)_9px_9px] lg:mb-4">
              <div className="absolute -top-8 bottom-auto left-auto right-4 flex h-16 w-16 flex-col items-center justify-center rounded-full border border-solid border-[#9b9b9b] bg-white [box-shadow:rgb(0,_0,_0)_0px_5px] lg:right-8">
                <img
                  src="https://assets.website-files.com/63904f663019b0d8edf8d57c/639157f3db4f4b8767c499ba_image%203-5.png"
                  alt=""
                  className="relative z-10 inline-block h-8"
                />
                <div className="absolute z-0 h-8 w-8 rounded-full border border-[#c0d1ff] bg-[#c0d1ff]"></div>
              </div>
              <p className="mb-4 text-xl font-semibold">Resources</p>
              <p>
                Lorem ipsum dolor sit amet consectetur adipiscing elit ut
                aliquam, purus sit.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section>
        {/* Container */}
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24 lg:py-32">
          {/* Heading Div */}
          <div className="mx-auto w-full max-w-3xl">
            {/* Component */}
            <div className="text-center">
              <p className="uppercase text-[#1353fe]">3 easy steps</p>
              <h2 className="text-3xl font-semibold capitalize md:text-5xl">
                How it{" "}
                <span className="bg-[url('https://assets.website-files.com/63904f663019b0d8edf8d57c/639156ce1c70c97aeb755c8a_Rectangle%2010%20(1).svg')] bg-cover bg-center bg-no-repeat px-4 text-white">
                  works
                </span>
              </h2>
              <div className="mx-auto mb-8 mt-4 max-w-[528px] md:mb-12 lg:mb-16">
                <p className="text-[#636262]">
                  Lorem ipsum dolor sit amet consectetur adipiscing elit ut
                  aliquam,purus sit amet luctus magna fringilla urna
                </p>
              </div>
            </div>
          </div>
          {/* How it Works Div */}
          <div className="mx-auto grid grid-cols-1 gap-4 sm:justify-items-stretch md:grid-cols-3 lg:gap-8">
            {/* How it Works Item */}
            <div className="relative flex flex-col items-center gap-4 p-8 text-center">
              <div className="mb-5 flex max-w-[400px] flex-col items-center justify-center rounded-xl border border-solid border-black bg-white px-8 py-5 [box-shadow:rgb(0,_0,_0)_4px_4px] md:mb-6 lg:mb-8">
                <p className="text-xl font-bold">1</p>
              </div>
              <p className="mb-2 text-xl font-semibold">Find Component</p>
              <p className="text-sm text-[#636262]">
                Lorem ipsum dolor sit amet consectetur adipiscing elit ut
                aliquam, purus sit.
              </p>
              <img
                src="https://assets.website-files.com/63904f663019b0d8edf8d57c/639833af1925275b6f0b43e1_Vector%2032.svg"
                alt=""
                className="absolute bottom-[-33%] left-0 right-auto top-auto -z-10 hidden w-96 md:bottom-auto md:left-[136px] md:right-[-50%] md:top-[18%] md:inline-block lg:left-auto"
              />
            </div>
            {/* How it Works Item */}
            <div className="relative flex flex-col items-center gap-4 p-8 text-center">
              <div className="mb-5 flex max-w-[400px] flex-col items-center justify-center rounded-xl border border-solid border-black bg-white px-8 py-5 [box-shadow:rgb(0,_0,_0)_4px_4px] md:mb-6 lg:mb-8">
                <p className="text-xl font-bold">2</p>
              </div>
              <p className="mb-2 text-xl font-semibold">Copy and Paste</p>
              <p className="text-sm text-[#636262]">
                Lorem ipsum dolor sit amet consectetur adipiscing elit ut
                aliquam, purus sit.
              </p>
              <img
                src="https://assets.website-files.com/63904f663019b0d8edf8d57c/639834731925279c5e0b4ee5_Vector%2033.svg"
                alt=""
                className="absolute bottom-[-33%] left-0 right-auto top-auto -z-10 hidden w-96 md:bottom-auto md:left-[136px] md:right-[-50%] md:top-[8%] md:inline-block lg:left-auto"
              />
            </div>
            {/* How it Works Item */}
            <div className="relative flex flex-col items-center gap-4 p-8 text-center">
              <div className="mb-5 flex max-w-[400px] flex-col items-center justify-center rounded-xl border border-solid border-black bg-white px-8 py-5 [box-shadow:rgb(0,_0,_0)_4px_4px] md:mb-6 lg:mb-8">
                <p className="text-xl font-bold">3</p>
              </div>
              <p className="mb-2 text-xl font-semibold">Done!</p>
              <p className="text-sm text-[#636262]">
                Lorem ipsum dolor sit amet consectetur adipiscing elit ut
                aliquam, purus sit.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-10">
        {/* Component */}
        <div className="grid w-full grid-cols-1 items-center gap-8 rounded-3xl bg-black p-[60px] sm:grid-cols-3 sm:gap-12 md:grid-cols-5 md:gap-6">
          <div className="flex justify-center">
            <img
              src="https://www.curotec.com/wp-content/uploads/2023/09/curotec-nodejs.png"
              alt=""
              className="inline-block"
            />
          </div>
          <div className="flex justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Redis_Logo.svg/1200px-Redis_Logo.svg.png"
              alt=""
              className="inline-block"
            />
          </div>
          <div className="flex justify-center">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/WebRTC_Logo.svg/2560px-WebRTC_Logo.svg.png"
              alt=""
              className="inline-block"
            />
          </div>
          <div className="flex justify-center">
            <img
              src="https://buzzvel.com/storage/conversions/9/conversions/technology-react-js-logo-normal.webp"
              alt=""
              className="inline-block"
            />
          </div>
          <div className="flex justify-center">
            <img
              src="https://i.imgur.com/sUoiWhP.png"
              alt=""
              className="inline-block"
            />
          </div>
        </div>
      </section>
      <>
        <section className="relative">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-10 md:py-24 lg:py-32">
            {/* Container */}
            <div className="mx-auto w-full max-w-3xl">
              {/* Component */}
              <div className="text-center">
                <h2 className="text-3xl font-semibold md:text-5xl">
                  What
                  <span className="bg-[url('https://assets.website-files.com/63904f663019b0d8edf8d57c/6391714b7ac2b51acc1a2548_Rectangle%2017%20(1).svg')] bg-contain bg-center bg-no-repeat px-4 text-white">
                    Our Clients
                  </span>
                  Are Saying
                </h2>
                <div className="mx-auto mb-8 mt-4 max-w-[528px] md:mb-12 lg:mb-16">
                  <p className="text-[#636262]">
                    Lorem ipsum dolor sit amet consectetur adipiscing elit ut
                    aliquam,purus sit amet luctus magna fringilla urna
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-8 grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 sm:justify-items-stretch md:mb-12 md:grid-cols-3 md:gap-8 lg:mb-16">
              <div className="relative mb-4 flex grid-cols-1 flex-col place-items-center justify-between gap-6 rounded-2xl border border-solid border-[#636262] bg-white px-8 pb-8 pt-16 max-[767px]:mt-4 md:mb-8 md:px-6 md:pb-8 md:pt-16 lg:mb-4">
                <div className="mb-4 flex flex-col items-center">
                  <h6 className="text-base font-semibold">Harry Peter</h6>
                  <p className="text-sm text-[#636262]">Designer</p>
                </div>
                <p className="mb-4 text-[#636262]">
                  “Lorem ipsum dolor sit amet, &nbsp;elit ut aliquam, purus sit
                  amet luctus venenatis elit ut aliquam, purus sit amet luctus
                  venenatis"
                </p>
                <div className="flex">
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                </div>
                <div className="absolute bottom-[auto] left-[auto] right-[50%] top-[-32px] flex h-16 w-16 translate-x-1/2 flex-col items-center justify-center rounded-full border border-solid border-[#9b9b9b] bg-white [box-shadow:rgb(0,_0,_0)_0px_3px]">
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63905430069fb027f83abb71_Ellipse-3.jpg"
                    alt=""
                    className="inline-block h-full w-full rounded-full"
                  />
                </div>
              </div>
              <div className="relative mb-4 flex grid-cols-1 flex-col place-items-center justify-between gap-6 rounded-2xl border border-solid border-[#636262] bg-white px-8 pb-8 pt-16 max-[767px]:mt-4 md:mb-8 md:px-6 md:pb-8 md:pt-16 lg:mb-4">
                <div className="mb-4 flex flex-col items-center">
                  <h6 className="text-base font-semibold">Harry Peter</h6>
                  <p className="text-sm text-[#636262]">Designer</p>
                </div>
                <p className="mb-4 text-[#636262]">
                  “Lorem ipsum dolor sit amet, &nbsp;elit ut aliquam, purus sit
                  amet luctus venenatis elit ut aliquam, purus sit amet luctus
                  venenatis"
                </p>
                <div className="flex">
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                </div>
                <div className="absolute bottom-[auto] left-[auto] right-[50%] top-[-32px] flex h-16 w-16 translate-x-1/2 flex-col items-center justify-center rounded-full border border-solid border-[#9b9b9b] bg-white [box-shadow:rgb(0,_0,_0)_0px_3px]">
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63905435069fb009d43abbb1_Ellipse-2.jpg"
                    alt=""
                    className="inline-block h-full w-full rounded-full"
                  />
                </div>
              </div>
              <div className="relative mb-4 flex grid-cols-1 flex-col place-items-center justify-between gap-6 rounded-2xl border border-solid border-[#636262] bg-white px-8 pb-8 pt-16 max-[767px]:mt-4 md:mb-8 md:px-6 md:pb-8 md:pt-16 lg:mb-4">
                <div className="mb-4 flex flex-col items-center">
                  <h6 className="text-base font-semibold">Harry Peter</h6>
                  <p className="text-sm text-[#636262]">Designer</p>
                </div>
                <p className="mb-4 text-[#636262]">
                  “Lorem ipsum dolor sit amet, &nbsp;elit ut aliquam, purus sit
                  amet luctus venenatis elit ut aliquam, purus sit amet luctus
                  venenatis"
                </p>
                <div className="flex">
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/63904f663019b0ce62f8d5ba_Vector.svg"
                    alt=""
                    className="mr-1 inline-block w-3.5 flex-none"
                  />
                </div>
                <div className="absolute bottom-[auto] left-[auto] right-[50%] top-[-32px] flex h-16 w-16 translate-x-1/2 flex-col items-center justify-center rounded-full border border-solid border-[#9b9b9b] bg-white [box-shadow:rgb(0,_0,_0)_0px_3px]">
                  <img
                    src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6390543797156ee437ef0425_Ellipse-1.jpg"
                    alt=""
                    className="inline-block h-full w-full rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <a
                href="#"
                className="inline-block rounded-xl bg-black px-8 py-4 text-center font-semibold text-white [box-shadow:rgb(19,_83,_254)_6px_6px]"
              >
                Get Started
              </a>
            </div>
          </div>
        </section>
        <img
          src="https://assets.website-files.com/63904f663019b0d8edf8d57c/639174a3de7d11bdf3ccbf01_Frame%20427322885.svg"
          alt=""
          className="absolute bottom-[auto] left-[auto] right-[0%] top-[0%] -z-10 inline-block max-[767px]:hidden"
        />
      </>
      <section>
        {/* Container */}
        <div className="mx-auto w-full max-w-5xl px-5 py-16 md:px-10 md:py-24 lg:py-32">
          {/* Heading */}
          <div className="mx-auto mb-8 max-w-3xl text-center md:mb-12 lg:mb-16">
            <h2 className="mb-4 mt-6 text-3xl font-extrabold md:text-5xl">
              Frequently Asked Questions
            </h2>
            <div className="mx-auto mt-4 max-w-[528px]">
              <p className="text-[#636262]">
                Lorem ipsum dolor sit amet consectetur adipiscing elit ut
                aliquam,purus sit amet luctus magna fringilla urna
              </p>
            </div>
          </div>

          {/* FAQ Items */}
          <div className="mb-8 md:mb-12 lg:mb-16">
            <div className="mb-6 rounded-2xl bg-[#eceae2] p-8">
              <div className="flex cursor-pointer items-start justify-between">
                <p className="text-xl font-bold">
                  How this theme is different from others in market?
                </p>
                <div className="relative ml-10 mt-1 flex h-5 w-5 items-center justify-center">
                  <div className="absolute h-5 w-0.5 bg-[#0b0b1f]"></div>
                  <div className="h-0.5 w-5 bg-[#0b0b1f]"></div>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-[#636262]">
                  Pellentesque in nisi aliquet, pellentesque purus eget,
                  imperdiet turpis. Fusce at enim quis neque viverra convallis.
                  Vivamus ut elementum leo, eget tempus nisl. Sed viverra enim
                  ac turpis posuere consectetur. Sed enim nibh, consequat vitae
                  lacus eu, ullamcorper ullamcorper massa. Pellentesque purus
                  eget, imperdiet turpis.
                </p>
              </div>
            </div>
            <div className="mb-6 rounded-2xl bg-[#eceae2] p-8">
              <div className="flex cursor-pointer items-start justify-between">
                <p className="text-xl font-bold">
                  What is your policy on distributon of Flowspark assets?
                </p>
                <div className="relative ml-10 mt-1 flex h-5 w-5 items-center justify-center">
                  <div className="absolute h-5 w-0.5 bg-[#0b0b1f]"></div>
                  <div className="h-0.5 w-5 bg-[#0b0b1f]"></div>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-[#636262]">
                  Pellentesque in nisi aliquet, pellentesque purus eget,
                  imperdiet turpis. Fusce at enim quis neque viverra convallis.
                  Vivamus ut elementum leo, eget tempus nisl. Sed viverra enim
                  ac turpis posuere consectetur. Sed enim nibh, consequat vitae
                  lacus eu, ullamcorper ullamcorper massa. Pellentesque purus
                  eget, imperdiet turpis.
                </p>
              </div>
            </div>
            <div className="mb-6 rounded-2xl bg-[#eceae2] p-8">
              <div className="flex cursor-pointer items-start justify-between">
                <p className="text-xl font-bold">
                  How can I contribute to Flowspark?
                </p>
                <div className="relative ml-10 mt-1 flex h-5 w-5 items-center justify-center">
                  <div className="absolute h-5 w-0.5 bg-[#0b0b1f]"></div>
                  <div className="h-0.5 w-5 bg-[#0b0b1f]"></div>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-[#636262]">
                  Pellentesque in nisi aliquet, pellentesque purus eget,
                  imperdiet turpis. Fusce at enim quis neque viverra convallis.
                  Vivamus ut elementum leo, eget tempus nisl. Sed viverra enim
                  ac turpis posuere consectetur. Sed enim nibh, consequat vitae
                  lacus eu, ullamcorper ullamcorper massa. Pellentesque purus
                  eget, imperdiet turpis.
                </p>
              </div>
            </div>
            <div className="mb-6 rounded-2xl bg-[#eceae2] p-8">
              <div className="flex cursor-pointer items-start justify-between">
                <p className="text-xl font-bold">
                  What other themes do you have?
                </p>
                <div className="relative ml-10 mt-1 flex h-5 w-5 items-center justify-center">
                  <div className="absolute h-5 w-0.5 bg-[#0b0b1f]"></div>
                  <div className="h-0.5 w-5 bg-[#0b0b1f]"></div>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-[#636262]">
                  Pellentesque in nisi aliquet, pellentesque purus eget,
                  imperdiet turpis. Fusce at enim quis neque viverra convallis.
                  Vivamus ut elementum leo, eget tempus nisl. Sed viverra enim
                  ac turpis posuere consectetur. Sed enim nibh, consequat vitae
                  lacus eu, ullamcorper ullamcorper massa. Pellentesque purus
                  eget, imperdiet turpis.
                </p>
              </div>
            </div>
          </div>
          <p className="text-center">
            Can’t find the answer you’re looking for? Reach out to our{" "}
            <a href="#" className="text-black">
              customer support team
            </a>
            .
          </p>
        </div>
      </section>
      {/* Footer Standard Email V2 */}
      <section className="bg-black text-white">
        <div className="flex w-screen flex-col px-6 py-20 lg:px-10 xl:px-24">
          {/* TOP CONTAINER */}
          <div className="flex flex-col lg:flex-row lg:justify-between">
            {/* LEFT DIV */}
            <div className="flex flex-col lg:mr-20">
              {/* LOGO */}
              <a
                href="#"
                className="mb-12 inline-block max-w-full font-bold text-[#1353fe]"
              >
                <img
                  src="https://assets.website-files.com/63904f663019b0d8edf8d57c/6399728d302d2471f18b229f_Group%2047874%20(2).svg"
                  alt=""
                  className="inline-block max-h-10"
                />
              </a>
              <p className="font-inter my-4 max-w-[350px] text-base font-light">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit ut al
              </p>
              {/* NEWSLETTER & EMAIL */}
              <div className="flex flex-col">
                <form action="" className="mb-10 mt-5 max-w-[421px]">
                  <div className="relative">
                    <label htmlFor="email" className="font-inter font-medium">
                      SUBSCRIBE TO NEWSLETTER
                    </label>
                    <input
                      type="email"
                      className="font-inter relative mt-4 w-full rounded-md border border-black bg-[#232323] px-6 py-4 text-base"
                      placeholder="Enter your email"
                      name="email"
                    />
                    <button
                      type="submit"
                      className="absolute right-[15px] top-[55px]"
                    >
                      <img
                        src="https://assets.website-files.com/63904f663019b0d8edf8d57c/639974a7f44de6baa9a134aa_PaperPlaneTilt%20(1).svg"
                        alt=""
                        className="inline-block"
                      />
                    </button>
                  </div>
                </form>
                <div>
                  <h3 className="font-inter mb-4 mt-8 font-medium">EMAIL US</h3>
                  <p className="font-inter text-base">support@wachwith.me</p>
                </div>
              </div>
            </div>
            {/* RIGHT DIV */}
            <div className="mt-7 max-w-[700px] grow lg:flex lg:flex-row">
              {/* FOOTER LINKS */}
              <div className="flex grow flex-row flex-wrap lg:flex-nowrap lg:items-start">
                {/* LINK BLOCK */}
                <div className="my-5 mr-8 flex max-w-[500px] grow basis-[100px] flex-col space-y-5 lg:my-0">
                  <h2 className="font-inter font-medium">SOLUTION</h2>
                  <a href="" className="font-inter font-light text-gray-500">
                    Marketing
                  </a>
                  <a href="" className="font-inter font-light text-gray-500">
                    Analytics
                  </a>
                  <a href="" className="font-inter font-light text-gray-500">
                    Commerce
                  </a>
                  <a href="" className="font-inter font-light text-gray-500">
                    Insights
                  </a>
                </div>
                {/* LINK BLOCK */}
                <div className="my-5 mr-8 flex max-w-[500px] grow basis-[100px] flex-col space-y-5 lg:my-0">
                  <h2 className="font-inter font-medium">SUPPORT</h2>
                  <a href="" className="font-inter font-light text-gray-500">
                    Pricing
                  </a>
                  <a href="" className="font-inter font-light text-gray-500">
                    Documentation
                  </a>
                  <a href="" className="font-inter font-light text-gray-500">
                    Guides
                  </a>
                  <a href="" className="font-inter font-light text-gray-500">
                    API Status
                  </a>
                </div>
                {/* LINK BLOCK */}
                <div className="my-5 mr-8 flex max-w-[500px] grow basis-[100px] flex-col space-y-5 lg:my-0 lg:mr-0">
                  <h2 className="font-inter font-medium">COMPANY</h2>
                  <a href="" className="font-inter font-light text-gray-500">
                    About
                  </a>
                  <a href="" className="font-inter font-light text-gray-500">
                    Blog
                  </a>
                  <a href="" className="font-inter font-light text-gray-500">
                    Jobs
                  </a>
                  <a href="" className="font-inter font-light text-gray-500">
                    Press
                  </a>
                  <a href="" className="font-inter font-light text-gray-500">
                    Partners
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* BOTTOM CONTAINER */}
          <div className="mt-20 lg:flex lg:flex-row-reverse lg:justify-between">
            {/* SOCIAL MEDIA ICONS */}
            <div className="mb-8 mt-6 flex flex-row lg:mb-0 lg:mt-0">
              <a href="" className="mr-4 transition hover:text-gray-400">
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.25C9.4791 2.25005 7.05619 3.22647 5.23968 4.97439C3.42317 6.72231 2.35426 9.10586 2.25723 11.6249C2.1602 14.1439 3.0426 16.6026 4.71928 18.4851C6.39595 20.3676 8.73657 21.5275 11.25 21.7214V14.2501H9C8.80109 14.2501 8.61032 14.1711 8.46967 14.0304C8.32902 13.8898 8.25 13.699 8.25 13.5001C8.25 13.3012 8.32902 13.1104 8.46967 12.9698C8.61032 12.8291 8.80109 12.7501 9 12.7501H11.25V10.5001C11.2509 9.70472 11.5673 8.94218 12.1297 8.37977C12.6921 7.81736 13.4546 7.501 14.25 7.50009H15.75C15.9489 7.50009 16.1397 7.57911 16.2803 7.71976C16.421 7.86041 16.5 8.05118 16.5 8.25009C16.5 8.449 16.421 8.63977 16.2803 8.78042C16.1397 8.92107 15.9489 9.00009 15.75 9.00009H14.25C13.8523 9.00054 13.471 9.15872 13.1898 9.43993C12.9086 9.72114 12.7505 10.1024 12.75 10.5001V12.7501H15C15.1989 12.7501 15.3897 12.8291 15.5303 12.9698C15.671 13.1104 15.75 13.3012 15.75 13.5001C15.75 13.699 15.671 13.8898 15.5303 14.0304C15.3897 14.1711 15.1989 14.2501 15 14.2501H12.75V21.7214C15.2634 21.5275 17.604 20.3676 19.2807 18.4851C20.9574 16.6026 21.8398 14.1439 21.7427 11.6249C21.6457 9.10587 20.5768 6.72232 18.7603 4.9744C16.9438 3.22649 14.5209 2.25006 12 2.25Z" />
                </svg>
              </a>
              <a href="" className="mx-4 transition hover:text-gray-400">
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
                  <path d="M16.125 2.625H7.875C6.4831 2.62658 5.14865 3.18021 4.16443 4.16443C3.18021 5.14865 2.62658 6.4831 2.625 7.875V16.125C2.62658 17.5169 3.18021 18.8513 4.16443 19.8356C5.14865 20.8198 6.4831 21.3734 7.875 21.375H16.125C17.5169 21.3734 18.8513 20.8198 19.8356 19.8356C20.8198 18.8513 21.3734 17.5169 21.375 16.125V7.875C21.3734 6.4831 20.8198 5.14865 19.8356 4.16443C18.8513 3.18021 17.5169 2.62658 16.125 2.625ZM12 16.5C11.11 16.5 10.24 16.2361 9.49993 15.7416C8.75991 15.2471 8.18314 14.5443 7.84254 13.7221C7.50195 12.8998 7.41283 11.995 7.58647 11.1221C7.7601 10.2492 8.18868 9.44736 8.81802 8.81802C9.44736 8.18868 10.2492 7.7601 11.1221 7.58647C11.995 7.41283 12.8998 7.50195 13.7221 7.84254C14.5443 8.18314 15.2471 8.75991 15.7416 9.49993C16.2361 10.24 16.5 11.11 16.5 12C16.4987 13.1931 16.0241 14.3369 15.1805 15.1805C14.3369 16.0241 13.1931 16.4987 12 16.5ZM16.875 8.25C16.6525 8.25 16.435 8.18402 16.25 8.0604C16.065 7.93679 15.9208 7.76109 15.8356 7.55552C15.7505 7.34995 15.7282 7.12375 15.7716 6.90552C15.815 6.68729 15.9222 6.48684 16.0795 6.3295C16.2368 6.17217 16.4373 6.06502 16.6555 6.02162C16.8738 5.97821 17.1 6.00049 17.3055 6.08564C17.5111 6.17078 17.6868 6.31498 17.8104 6.49998C17.934 6.68499 18 6.9025 18 7.125C18 7.42337 17.8815 7.70952 17.6705 7.9205C17.4595 8.13147 17.1734 8.25 16.875 8.25Z" />
                </svg>
              </a>
              <a href="" className="mx-4 transition hover:text-gray-400">
                <svg
                  className="fill-current"
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M21.5952 12.4998C22.1776 11.988 22.5489 11.2779 22.6367 10.5076C22.7245 9.73723 22.5226 8.96177 22.0703 8.33205C21.618 7.70233 20.9476 7.2634 20.1895 7.10064C19.4315 6.93788 18.64 7.06293 17.969 7.45147V5.46854C17.9694 4.83357 17.7763 4.21356 17.4153 3.69117C17.0544 3.16878 16.5427 2.76884 15.9486 2.54466C15.3546 2.32048 14.7063 2.28271 14.0902 2.4364C13.4741 2.59009 12.9195 2.92793 12.5003 3.40487C11.9885 2.82243 11.2784 2.45118 10.5081 2.36336C9.73772 2.27555 8.96225 2.47744 8.33253 2.92976C7.70282 3.38208 7.26388 4.05249 7.10112 4.81054C6.93836 5.5686 7.06342 6.36009 7.45197 7.03104H5.46904C4.83406 7.03063 4.21405 7.22379 3.69166 7.58476C3.16927 7.94573 2.76933 8.45736 2.54515 9.05144C2.32097 9.64552 2.28321 10.2938 2.4369 10.9099C2.59059 11.526 2.92843 12.0806 3.40538 12.4998C2.82293 13.0115 2.45168 13.7217 2.36386 14.492C2.27603 15.2624 2.47792 16.0378 2.93024 16.6676C3.38257 17.2973 4.05297 17.7362 4.81103 17.899C5.56909 18.0617 6.36059 17.9367 7.03154 17.5481V19.531C7.03113 20.166 7.22428 20.786 7.58525 21.3084C7.94622 21.8308 8.45785 22.2307 9.05193 22.4549C9.64602 22.6791 10.2943 22.7169 10.9104 22.5632C11.5265 22.4095 12.0811 22.0717 12.5003 21.5947C13.012 22.1772 13.7222 22.5484 14.4925 22.6362C15.2629 22.724 16.0383 22.5221 16.668 22.0698C17.2978 21.6175 17.7367 20.9471 17.8995 20.189C18.0622 19.431 17.9372 18.6395 17.5486 17.9685H19.5315C20.1665 17.969 20.7865 17.7758 21.3089 17.4148C21.8313 17.0539 22.2312 16.5422 22.4554 15.9481C22.6796 15.3541 22.7174 14.7058 22.5637 14.0897C22.41 13.4736 22.0721 12.919 21.5952 12.4998ZM8.59404 5.46854C8.59404 5.05414 8.75866 4.65671 9.05168 4.36369C9.34471 4.07066 9.74214 3.90604 10.1565 3.90604C10.5709 3.90604 10.9684 4.07066 11.2614 4.36369C11.5544 4.65671 11.719 5.05414 11.719 5.46854V7.03104H10.1565C9.74228 7.03057 9.34513 6.8658 9.05221 6.57287C8.75928 6.27995 8.59451 5.8828 8.59404 5.46854ZM3.90654 10.156C3.90701 9.74179 4.07178 9.34463 4.36471 9.05171C4.65763 8.75879 5.05478 8.59402 5.46904 8.59354H10.1565C10.5708 8.59402 10.9679 8.75879 11.2609 9.05171C11.5538 9.34463 11.7186 9.74179 11.719 10.156V11.7185H5.46904C5.05478 11.7181 4.65763 11.5533 4.36471 11.2604C4.07178 10.9675 3.90701 10.5703 3.90654 10.156ZM16.4065 19.531C16.4065 19.9454 16.2419 20.3429 15.9489 20.6359C15.6559 20.9289 15.2584 21.0935 14.844 21.0935C14.4296 21.0935 14.0322 20.9289 13.7392 20.6359C13.4462 20.3429 13.2815 19.9454 13.2815 19.531V17.9685H14.844C15.2583 17.969 15.6554 18.1338 15.9484 18.4267C16.2413 18.7196 16.4061 19.1168 16.4065 19.531ZM19.5315 16.406H14.844C14.4298 16.4056 14.0326 16.2408 13.7397 15.9479C13.4468 15.655 13.282 15.2578 13.2815 14.8435V13.281H19.5315C19.9459 13.281 20.3434 13.4457 20.6364 13.7387C20.9294 14.0317 21.094 14.4291 21.094 14.8435C21.094 15.2579 20.9294 15.6554 20.6364 15.9484C20.3434 16.2414 19.9459 16.406 19.5315 16.406Z" />
                </svg>
              </a>
              <a href="" className="mx-4 transition hover:text-gray-400">
                <svg
                  className="fill-current"
                  width="25"
                  height="25"
                  viewBox="0 0 25 25"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M23.9883 7.58391L21.0426 10.5297C20.4545 17.354 14.6994 22.6565 7.81089 22.6565C6.39249 22.6565 5.22357 22.4316 4.33651 21.9881C3.62063 21.6301 3.32738 21.246 3.25461 21.1367C3.18933 21.0388 3.14702 20.9274 3.13083 20.8108C3.11464 20.6943 3.12499 20.5755 3.16112 20.4635C3.19724 20.3515 3.2582 20.2491 3.33945 20.164C3.42069 20.0789 3.52012 20.0132 3.63031 19.9718C3.65544 19.9624 5.95923 19.0775 7.44821 17.3929C6.52206 16.7334 5.70694 15.9305 5.0335 15.0145C3.69483 13.1977 2.27901 10.0427 3.13598 5.32923C3.16148 5.18895 3.22489 5.05833 3.31932 4.95152C3.41376 4.8447 3.53562 4.76577 3.67171 4.72326C3.8078 4.68075 3.95293 4.67629 4.09137 4.71037C4.22981 4.74445 4.35629 4.81575 4.4571 4.91657C4.49153 4.9509 7.74246 8.15592 11.7166 9.19118L11.7171 8.59361C11.7256 7.34276 12.2303 6.14644 13.1204 5.26759C14.0105 4.38874 15.2132 3.89929 16.4641 3.90682C17.2766 3.91808 18.0724 4.1399 18.7737 4.55063C19.4749 4.96136 20.0576 5.54694 20.4649 6.25019L23.4359 6.25024C23.5904 6.25024 23.7414 6.29606 23.8699 6.3819C23.9984 6.46774 24.0985 6.58975 24.1577 6.73251C24.2168 6.87526 24.2323 7.03234 24.2021 7.18389C24.172 7.33543 24.0976 7.47464 23.9883 7.58391Z" />
                </svg>
              </a>
            </div>
            <p className="font-inter text-sm text-gray-500 lg:mt-0">
              © Copyright 2021. All rights reserved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
