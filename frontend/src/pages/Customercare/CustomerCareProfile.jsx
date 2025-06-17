import { useState, useEffect, useContext } from "react";
import { authContext } from "../../context/authContext";
import BookedClientsTable from "./BookedClientsTable";
import ClientDetails from "./ClientDetails";
import ToDoClientsTable from "./ToDoClientsTable";
import OnGoingClientsTable from "./OnGoingClientsTable";
import PendingClientsTable from "./PendingClientsTable";
import CompletedClientsTable from "./CompletedClientsTable";
import ClientsTodayCallHistory from "./ClientsTodayCallHistory";
import History from "./History";
import { BASE_URL } from "../../config";

const CustomerCareProfile = () => {
  const [tab, setTab] = useState("booked-clients");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state, dispatch } = useContext(authContext);
  const [selectedClientId, setSelectedClientId] = useState(null); // New State
  const [selectedClientTourStatus,setSelectedClientTourStatus] = useState(null);

  useEffect(() => {
    const fetchCustomerCareDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          const response = await fetch(
            `${BASE_URL}/customercare/customerCareDetails/${storedUser._id}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
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

    fetchCustomerCareDetails();
  }, []);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  const handleSeeMore = (clientId) => {
    setSelectedClientId(clientId);
    setTab("client-details")
  };
  const handleSeeMoreWithClientTourStatus = (clientId,clientTourStatus) => {
    setSelectedClientTourStatus(clientTourStatus)
    setSelectedClientId(clientId);
    setTab("client-details")
  };
  const goToHistory = () =>{
    setTab("History")
  }
  const handleBackFromHistory = () =>{
    setTab("client-details")
  }
  const handleSeeTodayPerformance = () =>{
    setTab("SeeTodayPerformance")
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
        <div className="pb-[50px] px-[30px] rounded-md mb-1">
          <div
            className={`flex items-center justify-center ${
              tab === "booked-clients" ? "mt-[145px]" :tab === "client-details" ? "mt-[85px]" :tab === "to-do" ? "mt-[145px]" :tab === "pending" ? "mt-[145px]":tab === "History" ? "mt-[100px]": "mt-[145px]"
            }`}
          >
            <img
              className="inline-flex object-cover border-4 border-indigo-600 rounded-full shadow-[5px_5px_0_0_rgba(0,0,0,1)] shadow-indigo-600/100 bg-indigo-50 text-indigo-600 h-48 w-48"
              src={
                user.logo ||
                "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="
              }
              alt="User Avatar"
            />
          </div>
          <div className="text-center mt-8">
            <h3 className="text-[34px] leading-[40px] text-headingColor font-extrabold tracking-wide">
              CUSTOMER CARE
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-1 ml-1">
            <button
              type="button"
              className={buttonClasses("booked-clients")}
              onClick={() => setTab("booked-clients")}
            >
              Booked Clients
            </button>
            {/* <button
              type="button"
              className={buttonClasses("client-details")}
              
            >
              Client Details
            </button> */}
            <button
              type="button"
              className={buttonClasses("to-do")}
              onClick={() => setTab("to-do")}
            >
              To-Do Clients
            </button>
            {/* <button
              type="button"
              className={buttonClasses("ongoing")}
              onClick={() => setTab("ongoing")}
            >
              Ongoing Clients
            </button> */}
            <button
              type="button"
              className={buttonClasses("pending")}
              onClick={() => setTab("pending")}
            >
              Pending Clients
            </button>
            <button
              type="button"
              className={buttonClasses("completed")}
              onClick={() => setTab("completed")}
            >
              Post-Tour Clients
            </button>
          </div>
          <div className="mt-4 md:mt-0 mb-1">
            {tab === "booked-clients" && <div><BookedClientsTable onSeeMore={handleSeeMoreWithClientTourStatus}/></div>}
            {tab === "client-details" && <div><ClientDetails clientId={selectedClientId} clientTourStatus={selectedClientTourStatus} goToHistory={goToHistory}/></div>}
            {tab === "to-do" && <div><ToDoClientsTable onSeeMore={handleSeeMoreWithClientTourStatus} handleSeeTodayPerformance={handleSeeTodayPerformance}/></div>}
            {tab === "ongoing" && <div><OnGoingClientsTable onSeeMore={handleSeeMore}/></div>}
            {tab === "pending" && <div><PendingClientsTable onSeeMore={handleSeeMore}/></div>}
            {tab === "completed" && <div><CompletedClientsTable onSeeMore={handleSeeMoreWithClientTourStatus}/></div>}
            {tab === "History" && <div><History clientId={selectedClientId} handleBackFromHistory={handleBackFromHistory}/></div>}
            {tab === "SeeTodayPerformance" && <div><ClientsTodayCallHistory onSeeMore={handleSeeMoreWithClientTourStatus}/></div>}






            
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCareProfile;
