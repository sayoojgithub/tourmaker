import { useState, useEffect, useContext } from "react";
import { authContext } from "../../context/authContext";
import { BASE_URL } from "../../config";
import CreateClient from "./CreateClient";
import SearchClients from "./SearchClients";
import Report from "./Report";
const EntryProfile = () => {
  const [tab, setTab] = useState("Create Clients");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state, dispatch } = useContext(authContext);

  useEffect(() => {
    const fetchEntryEmployeeDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          const response = await fetch(`${BASE_URL}/entry/entryEmployeeDetails/${storedUser._id}`, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const result = await response.json();
          setUser(result);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntryEmployeeDetails();
  }, []);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };
  
 

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  const buttonClasses = (currentTab) =>
    `p-3 flex-1 text-lg text-center font-semibold rounded-full shadow-md transition-transform transform hover:scale-105 border-2 ${
      tab === currentTab
        ? "bg-blue-100 text-blue-900 border-blue-600 shadow-lg"
        : "bg-offwhite text-blue-900 border-blue-400 hover:bg-blue-50 hover:text-blue-900"
    }`;

  return (
    <div className="w-full bg-[#F0FBFC] px-5 mx-auto">
      <div className="grid md:grid-cols-3 gap-10">
      <div className="pb-[30px] px-[20px] rounded-md">
          <div
            className={`flex items-center justify-center ${
              tab === "Confirmed Clients" ? "mt-[130px]" :tab === "Client Details" ?"mt-[110px]":tab === "Booked Clients" ? "mt-[130px]" :tab === "Search Clients" ? "mt-[150px]": "mt-[90px]"
            }`}
          >
            <img
              className="inline-flex object-cover border-4 border-indigo-600 rounded-full shadow-[5px_5px_0_0_rgba(0,0,0,1)] shadow-indigo-600/100 bg-indigo-50 text-indigo-600 h-48 w-48"
              src="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="
              alt="User Avatar"
            />
          </div>
          <div className="text-center mt-8">
            <h3 className="text-[34px] leading-[40px] text-headingColor font-extrabold tracking-wide">
              ENTRY
            </h3>
            <p className="text-textColor text-[16px] leading-6 font-semibold mt-2">
              {user.name}
            </p>
            <p className="text-textColor text-[16px] leading-6 font-semibold mt-1">
              {user.email}
            </p>
          </div>
          <div className="mt-[50px] md:mt-[20px]">
            <button
              className="w-full bg-red-600 p-5 text-[16px] leading-7 rounded-md text-white font-bold"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
        <div className="md:col-span-2 md:px-[30px] m-2">
          <div className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-1 ml-1">
          <button
              type="button"
              className={buttonClasses("Create Clients")}
              onClick={() => setTab("Create Clients")}
            >
              Create Clients
            </button>
            <button
              type="button"
              className={buttonClasses("Search Clients")}
              onClick={() => setTab("Search Clients")}
            >
              Search Clients
            </button>
            <button
              type="button"
              className={buttonClasses("Report")}
              onClick={() => setTab("Report")}
            >
              Report
            </button>
            

          </div>
          <div className="mt-4 md:mt-4 mb-1">
          {tab === "Create Clients" && <div><CreateClient/></div>}
          {tab === "Search Clients" && <div><SearchClients/></div>}
          {tab === "Report" && <div><Report/></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryProfile;
