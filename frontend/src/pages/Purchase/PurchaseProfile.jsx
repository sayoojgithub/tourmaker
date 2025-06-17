import React, { useState, useEffect, useContext } from "react";
import { authContext } from "../../context/authContext";
import { BASE_URL } from "../../config";
import AccommodationMain from "./AccommodationMain";
import TravelAgencyMain from "./TravelAgencyMain";
import VehicleMain from "./VehicleMain";
import TripMain from "./TripMain";
import AddOnTripMain from "./AddOnTripMain";
import ActivityMain from "./ActivityMain";
import FixedItenararyMain from "./FixedItenararyMain";
import CreateDestination from "./CreateDestination";
import SpecialItineraryMain from "./SpecialItineraryMain"

const PurchaseProfile = () => {
  const [tab, setTab] = useState("Accommodation and Food");
  const [purchaserDetails, setPurchaserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state, dispatch } = useContext(authContext);

  useEffect(() => {
    const fetchPurchaserDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          const response = await fetch(
            `${BASE_URL}/purchaser/purchaserDetails/${storedUser._id}`,
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
          setPurchaserDetails(result);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaserDetails();
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

  const buttonClasses = (currentTab) =>
    `p-1 flex-1 text-lg text-center font-semibold rounded-full shadow-md transition-transform transform hover:scale-105 border-2 ${
      tab === currentTab
        ? "bg-blue-100 text-blue-900 border-blue-600 shadow-lg"
        : "bg-offwhite text-blue-900 border-blue-400 hover:bg-blue-50 hover:text-blue-900"
    }`;
  

  return (
    <div className="w-full mx-auto bg-[#F0FBFC]">
      <div className="grid  md:grid-cols-3 gap-10">
        <div className="pb-[30px] px-[20px] rounded-md md:col-span-1"
        style={{ maxWidth: "500px" }} // Adjust the width as needed
        >
       
          <div
            className={`flex items-center justify-center ${
              tab === "Accommodation and Food" ? "mt-[190px]" : tab ==="AddVehicles" ? "mt-[186px]" : tab ==="AddFixedItenary" ? "mt-[210px]" : tab ==="AddOnTrips"? "mt-[210px]":tab ==="AddActivity"? "mt-[210px]": tab==="AddDestination"?"mt-[140px]":tab ==="AddSpecialTour"?"mt-[190px]" :"mt-[180px]"
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
              PURCHASER
            </h3>
            <p className="text-textColor text-[16px] leading-6 font-semibold mt-2">
              {purchaserDetails.name}
            </p>
            <p className="text-textColor text-[16px] leading-6 font-semibold mt-1">
              {purchaserDetails.email}
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
        {/* Buttons Section */}
          {/* First Row (Top) */}
          <div className="grid grid-cols-5 md:grid-cols-5 gap-1 mb-2">
            <button
              type="button"
              className={buttonClasses("Accommodation and Food")}
              onClick={() => setTab("Accommodation and Food")}
            >
              Accommodation
            </button>
            <button
              type="button"
              className={buttonClasses("TravalAgency")}
              onClick={() => setTab("TravalAgency")}
            >
               AddAgency
            </button>
            <button
              type="button"
              className={buttonClasses("AddVehicles")}
              onClick={() => setTab("AddVehicles")}
            >
              AddVehicles
            </button>
           
            {/* <button
              type="button"
              className={buttonClasses("AddFixedItenary")}
              onClick={() => setTab("AddFixedItenary")}
            >
              Add Group Tour
            </button> */}
            <button
              type="button"
              className={buttonClasses("AddFixedItenary")}
              onClick={() => setTab("AddFixedItenary")}
            >
              AddGroupTour
            </button>
           
          
            <button
              type="button"
              className={buttonClasses("AddTrips")}
              onClick={() => setTab("AddTrips")}
            >
              AddTrips
            </button>
            
          </div>

          {/* Second Row (Bottom) */}
          <div className="grid grid-cols-5 gap-1 mb-1">
          
            <button
              type="button"
              className={buttonClasses("AddOnTrips")}
              onClick={() => setTab("AddOnTrips")}
            >
              AddAddOnTrips
            </button>
            {/* <button
              type="button"
              className={buttonClasses("AddActivity")}
              onClick={() => setTab("AddActivity")}
            >
              Add Activity
            </button>
            <button
              type="button"
              className={buttonClasses("AddDestination")}
              onClick={() => setTab("AddDestination")}
            >
              Add Destination
            </button> */}
            <button
              type="button"
              className={buttonClasses("AddActivity")}
              onClick={() => setTab("AddActivity")}
            >
              AddActivity
            </button>
             <button
              type="button"
              className={buttonClasses("AddDestination")}
              onClick={() => setTab("AddDestination")}
            >
              AddDestination
            </button>
             <button
              type="button"
              className={buttonClasses("AddSpecialTour")}
              onClick={() => setTab("AddSpecialTour")}
            >
              AddFixedItinerary
            </button>
             <button
              type="button"
              className={buttonClasses("AddActivityVender")}
              //onClick={() => setTab("AddActivityVender")}
            >
              AddActivityVender
            </button>

           
            <div className="col-span-1"></div> {/* Empty space for alignment */}
          </div>
          <div className="grid grid-cols-3 gap-1 mb-1">
          {/* <button
              type="button"
              className={buttonClasses("AddActivity")}
              onClick={() => setTab("AddActivity")}
            >
              AddActivity
            </button>
            <button
              type="button"
              className={buttonClasses("AddDestination")}
              onClick={() => setTab("AddDestination")}
            >
              AddDestination
            </button>
            <button
              type="button"
              className={buttonClasses("AddSpecialTour")}
              onClick={() => setTab("AddSpecialTour")}
            >
              AddFixedItinerary
            </button>
             <button
              type="button"
              className={buttonClasses("AddActivityVender")}
              onClick={() => setTab("AddActivityVender")}
            >
              AddActivityVender
            </button> */}

          </div>

          <div className="mt-1 md:mt-2 mb-5">
            {tab === "Accommodation and Food" && <AccommodationMain />}
            {tab === "TravalAgency" && <TravelAgencyMain />}
            {tab === "AddVehicles" && <VehicleMain />}
            {tab === "AddTrips" && <TripMain />}
            {tab === "AddOnTrips" && <AddOnTripMain />}
            {tab === "AddActivity" && <ActivityMain />}
            {tab === "AddFixedItenary" && <FixedItenararyMain />}
            {tab === "AddDestination" && <CreateDestination />}
            {tab === "AddSpecialTour" && <SpecialItineraryMain />}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseProfile;
