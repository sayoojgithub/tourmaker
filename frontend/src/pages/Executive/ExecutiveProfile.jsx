import React, { useState, useEffect, useContext } from "react";
import { authContext } from "../../context/authContext";
import { BASE_URL } from "../../config";
import NewClientsTable from "./NewClientsTable";
import PendingTable from "./PendingTable";
import ToDoTable from "./ToDoTable";
import InterestedClientsTable from "./InterestedClientsTable";
import ConfirmedClientsTable from "./ConfirmedClientsTable";
import ClientSearch from "./ClientSearch";
import Itinerary from "./Itenary";
import FixedItenararyList from "./FixedItenararyList";
import FixedItenararyDetails from "./FixedItenararyDetails";
import SpecialItenararyList from "./SpecialItenararyList";
import SpecialItenararyDetails from "./SpecialItenararyDetails";
import AllClients from "./AllClients";

const ExecutiveProfile = () => {
  const [tab, setTab] = useState("New Clients");
  const [executiveDetails, setExecutiveDetails] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null); // New State
  const [selectedPrimaryTourName, setSelectedPrimaryTourName] = useState(null);
  const [selectedFixedTripId, setSelectedFixedTripId] = useState(null);
  const [selectedSpecialTripId, setSelectedSpecialTripId] = useState(null);
  const [selectedClientDaysForCustomTour, setSelectedClientDaysForCustomTour] = useState(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state, dispatch } = useContext(authContext);

  useEffect(() => {
    const fetchExecutiveDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          const response = await fetch(
            `${BASE_URL}/executive/executiveDetails/${storedUser._id}`,
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
          setExecutiveDetails(result);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutiveDetails();
  }, []);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };
  const handleSeeMore = (clientId) => {
    setSelectedClientId(clientId);
    setTab("Client Full Details"); // Switch tab to Client Full Details
  };
  const handleFixedItenararyOption = (primaryTourName) => {
    setSelectedPrimaryTourName(primaryTourName);
    setTab("Fixed-Itenarary-List");
  };
  const handleSpecialItenararyOption = (primaryTourName) => {
    setSelectedPrimaryTourName(primaryTourName);
    setTab("Special-Itenarary-List");
  };
  const handleCustomItenararyOption = (numberOfDays) => {
    setSelectedClientDaysForCustomTour(numberOfDays)
    setTab("Itinerary");
  };
  const handleSeeMoreOfFixedTrip = (fixedTripId) =>{
    setSelectedFixedTripId(fixedTripId)
    setTab("Fixed-Itenarary-Details")
  }
  const handleSeeMoreOfSpecialTrip = (specialTripId) =>{
    setSelectedSpecialTripId(specialTripId)
    setTab("Special-Itenarary-Details")
  }

  const gotoConfirmed = ()=>{
    setTab("Confirmed")
  }
  console.log(selectedClientId);
  console.log(selectedPrimaryTourName);
  console.log(tab)

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const buttonClasses = (currentTab) =>
    `p-2 flex-1 text-lg text-center font-semibold rounded-full shadow-md transition-transform transform hover:scale-105 border-2 ${
      tab === currentTab
        ? "bg-blue-100 text-blue-900 border-blue-600 shadow-lg"
        : "bg-offwhite text-blue-900 border-blue-400 hover:bg-blue-50 hover:text-blue-900"
    }`;

  

  return (
    <div className="w-full mx-auto bg-[#F0FBFC]">
      <div className="grid  md:grid-cols-3 gap-10">
        <div className="pb-[30px] px-[20px] rounded-md">
          <div
            className={`flex items-center justify-center ${
              tab === "Client Full Details" ? "mt-[125px]" :tab === "Fixed-Itenarary-List" ? "mt-[130px]":tab === "Fixed-Itenarary-Details" ? "mt-[100px]" : "mt-[130px]"
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
              EXECUTIVE
            </h3>
            <p className="text-textColor text-[16px] leading-6 font-semibold mt-2">
              {executiveDetails.name}
            </p>
            <p className="text-textColor text-[16px] leading-6 font-semibold mt-1">
              {executiveDetails.email}
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
        <div className="md:col-span-2 md:px-[30px] mt-2">
          <div className="grid grid-cols-3 md:grid-cols-3 gap-1 mb-2">
            <button
              type="button"
              className={buttonClasses("New Clients")}
              onClick={() => setTab("New Clients")}
            >
              NewClients
            </button>
            {/* <button
              type="button"
              className={buttonClasses("Client Full Details")}
              //onClick={() => setTab("Client Full Details")}
            >
              Client Details
            </button> */}
            {/* <button
              type="button"
              className={buttonClasses("Fixed-Itenarary-List")}
              //onClick={() => setTab("Fixed-Itenarary-List")}
            >
              Group Trips
            </button> */}
            {/* <button
              type="button"
              className={buttonClasses("Fixed-Itenarary-Details")}
              //onClick={() => setTab("Fixed-Itenarary-Details")}
            >
              Group Trip 
            </button> */}
            {/* <button
              type="button"
              className={buttonClasses("Itinerary")}
              //onClick={() => setTab("Itinerary")}
            >
              Custom Trip
            </button> */}
            <button
              type="button"
              className={buttonClasses("To-Do")}
              onClick={() => setTab("To-Do")}
            >
              ToDo
            </button>
            <button
              type="button"
              className={buttonClasses("Pending")}
              onClick={() => setTab("Pending")}
            >
              Pending
            </button>
            <button
              type="button"
              className={buttonClasses("interested")}
              onClick={() => setTab("interested")}
            >
              Interested
            </button>
            <button
              type="button"
              className={buttonClasses("Confirmed")}
              onClick={() => setTab("Confirmed")}
            >
              Confirmed
            </button>
            <button
              type="button"
              className={buttonClasses("All Clients")}
              onClick={() => setTab("All Clients")}
            >
              AllClients
            </button>
            
          </div>
          <div className="mt-4 md:mt-2 mb-5">
            {tab === "New Clients" && (
              <div className="overflow-x-auto">
                <NewClientsTable onSeeMore={handleSeeMore} />
              </div>
            )}
            {tab === "Client Full Details" && (
              <div>
                <ClientSearch
                  clientId={selectedClientId}
                  onFixedItineraryOption={handleFixedItenararyOption}
                  onCustomItineraryOption={handleCustomItenararyOption}
                  onSpecialItineraryOption={handleSpecialItenararyOption}
                />
              </div>
            )}
            {tab === "Itinerary" && (
              <div>
                <Itinerary 
                  selectedClientId={selectedClientId}
                  numberOfDays={selectedClientDaysForCustomTour}
                  gotoConfirmed={gotoConfirmed}
                />
              </div>
            )}
            {tab === "Fixed-Itenarary-List" && (
              <div>
                <FixedItenararyList
                  selectedClientId={selectedClientId}
                  selectedPrimaryTourName={selectedPrimaryTourName}
                  handleSeeMoreOfFixedTrip={handleSeeMoreOfFixedTrip}
                />
              </div>
            )}
            {tab === "Fixed-Itenarary-Details" && (
              <div>
                <FixedItenararyDetails
                  selectedClientId={selectedClientId}
                  selectedFixedTripId={selectedFixedTripId}
                  gotoConfirmed={gotoConfirmed}
                />
              </div>
            )}
            {tab === "Special-Itenarary-List" && (
              <div>
                <SpecialItenararyList
                  selectedClientId={selectedClientId}
                  selectedPrimaryTourName={selectedPrimaryTourName}
                  handleSeeMoreOfSpecialTrip={handleSeeMoreOfSpecialTrip}
                />
              </div>
            )}
            {tab === "Special-Itenarary-Details" && (
              <div>
                <SpecialItenararyDetails
                  selectedClientId={selectedClientId}
                  selectedSpecialTripId={selectedSpecialTripId}
                  gotoConfirmed={gotoConfirmed}
                />
              </div>
            )}
            {tab === "To-Do" && (
              <div>
                <ToDoTable onSeeMore={handleSeeMore} />
              </div>
            )}
            {tab === "Pending" && (
              <div>
                <PendingTable onSeeMore={handleSeeMore} />
              </div>
            )}
            {tab === "interested" && (
              <div>
                <InterestedClientsTable onSeeMore={handleSeeMore} />
              </div>
            )}
            {tab === "Confirmed" && (
              <div>
                <ConfirmedClientsTable />
              </div>
            )}
            {tab === "All Clients" && (
              <div>
                <AllClients />
              </div>
            )}
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveProfile;
