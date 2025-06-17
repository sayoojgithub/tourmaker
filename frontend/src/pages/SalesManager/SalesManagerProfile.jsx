import React, { useState, useEffect, useContext } from "react";
import ClientsList from "./ClientsList";
import ClientDetails from "./ClientDetails";
import ExecutivesStatus from "./ExecutivesStatus";
import ClientsStatus from "./ClinetsStatus";
import ClientsStatusOfExecutive from "./ClientsStatusOfExecutive";
import ClientsOfExecutive from "./ClientsOfExecutive";
import ClientRegistrationReport from "./ClientRegistrationReport";
import ExecutivesReport from "./ExecutivesReport";
import ManagePoints from "./ManagePoints";
import { authContext } from "../../context/authContext";
import { BASE_URL } from "../../config";

const SalesManagerProfile = () => {
  const [tab, setTab] = useState("Clients List");
  const [salesManagerDetails, setSalesManagerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state, dispatch } = useContext(authContext);
  const [selectedClientId, setSelectedClientId] = useState(null); // New State
  const [selectedExecutiveId, setSelectedExecutiveId] = useState(null); // New State


  useEffect(() => {
    const fetchSalesManagerDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          const response = await fetch(
            `${BASE_URL}/salesManager/salesManagerDetails/${storedUser._id}`,
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
          setSalesManagerDetails(result);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesManagerDetails();
  }, []);

  const handleSeeMore = (clientId) => {
    setSelectedClientId(clientId);
    setTab("Client Details"); // Switch tab to Client Full Details
  };
  const handleSeeMoreExecutive = (executiveId) => {
    setSelectedExecutiveId(executiveId)
    setTab("Executive Status")
 
  };
  const handleSeeMoreClientsOfExecutive = (executiveId) => {
    setSelectedExecutiveId(executiveId)
    setTab("Executive Clients")
 
  };

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
    `p-2 flex-1 text-lg text-center font-semibold rounded-full shadow-md transition-transform transform hover:scale-105 border-2 ${
      tab === currentTab
        ? "bg-blue-100 text-blue-900 border-blue-600 shadow-lg"
        : "bg-offwhite text-blue-900 border-blue-400 hover:bg-blue-50 hover:text-blue-900"
    }`;

  return (
    <div className="w-full px-5 mx-auto bg-[#F0FBFC]">
      <div className="grid md:grid-cols-3 gap-10">
        <div className="pb-[30px] px-[20px] rounded-md">
          <div
            className={`flex items-center justify-center ${
              tab === "Client Details" ? "mt-[120px]" :tab === "Clients Status" ?"mt-[133px]":tab === "Executive Status" ? "mt-[133px]" :tab ==="ExecutivesDownloadReport"?"mt-[120px]":tab ==="ClientsDownloadReport"?"mt-[110px]": "mt-[130px]"
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
              SALES MANAGER
            </h3>
            <p className="text-textColor text-[16px] leading-6 font-semibold mt-2">
              {salesManagerDetails.name}
            </p>
            <p className="text-textColor text-[16px] leading-6 font-semibold mt-1">
              {salesManagerDetails.email}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ml-1">
            <button
              type="button"
              className={buttonClasses("Clients List")}
              onClick={() => setTab("Clients List")}
            >
              ClientsList
            </button>
            
            {/* <button type="button" className={buttonClasses("Client Details")}>
              ChangeExecutive
            </button> */}
            {/* <button
              type="button"
              className={buttonClasses("Executives Status")}
              //onClick={() => setTab("Executives Status")}
            >
              Executives Status
            </button> */}
            <button type="button" className={buttonClasses("Clients Status")} onClick={() => setTab("Clients Status")}>
              ClientsGraph
            </button>
            <button
              type="button"
              className={buttonClasses("ClientsDownloadReport")}
              onClick={() => setTab("ClientsDownloadReport")}
            >
              ClientsReport
            </button>
            <button
              type="button"
              className={buttonClasses("Executive List")}
              onClick={() => setTab("Executive List")}
            >
              ExecutiveList
            </button>
            {/* <button
              type="button"
              className={buttonClasses("Executive Status")}
              //onClick={() => setTab("Executive List")}
            >
              ExecutiveGraph
            </button> */}
            {/* <button
              type="button"
              className={buttonClasses("Executive Clients")}
              //onClick={() => setTab("Executive List")}
            >
              ExecutiveClients
            </button> */}
            <button
              type="button"
              className={buttonClasses("ExecutivesDownloadReport")}
              onClick={() => setTab("ExecutivesDownloadReport")}
            >
              Exe/FO-Report
            </button>
            <button
              type="button"
              className={buttonClasses("ManagePoints")}
              onClick={() => setTab("ManagePoints")}
            >
              ManagePoints
            </button>
          </div>
          <div className="mt-4 md:mt-5 mb-5">
            {tab === "Clients List" && (
              <div>
                <ClientsList onSeeMore={handleSeeMore} />
              </div>
            )}
            {tab === "Client Details" && (
              <div>
                <ClientDetails clientId={selectedClientId} />
              </div>
            )}
            {tab === "Clients Status" && (
              <div>
                <ClientsStatus/>
              </div>
            )}
            {tab === "Executive List" && (
              <div>
                <ExecutivesStatus onSeeMoreExecutive={handleSeeMoreExecutive} onViewClients={handleSeeMoreClientsOfExecutive} />
              </div>
            )}
            {tab === "Executive Status" && (
              <div>
                <ClientsStatusOfExecutive executiveId={selectedExecutiveId}/>
              </div>
            )}
            {tab === "Executive Clients" && (
              <div>
                <ClientsOfExecutive executiveId={selectedExecutiveId} onSeeMore={handleSeeMore}/>
              </div>
            )}
            {tab === "ClientsDownloadReport" && (
              <div>
                <ClientRegistrationReport/>
              </div>
            )}
            {tab === "ExecutivesDownloadReport" && (
              <div>
                <ExecutivesReport/>
              </div>
            )}
            {tab === "ManagePoints" && (
              <div>
                <ManagePoints/>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesManagerProfile;
