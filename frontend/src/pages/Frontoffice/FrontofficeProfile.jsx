// import React, { useState, useContext,useEffect } from "react";
// import { authContext } from "../../context/authContext";
// import ClientRegistration from "./ClientRegistration";
// import ClientUpdation from "./ClientUpdation";
// import MyClientDetails from "./MyClientDetails";
// import ClientSearch from "./ClientSearch";
// import { BASE_URL } from "../../config";

// const FrontofficeProfile = () => {
//   const [tab, setTab] = useState("Create Client");
//   const [frontOfficeDetails, setFrontOfficeDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { state, dispatch } = useContext(authContext);
//   const [selectedClientId, setSelectedClientId] = useState(null)

//   useEffect(() => {
//     const fetchFrontOfficeDetails = async () => {
//       try {
//         const storedUser = JSON.parse(localStorage.getItem('user'));
//         if (storedUser) {
//           const response = await fetch(`${BASE_URL}/frontoffice/frontofficeDetails/${storedUser._id}`, {
//             headers: {
//               'Content-Type': 'application/json',
//             },
//           });
//           if (!response.ok) {
//             throw new Error('Network response was not ok');
//           }
//           const result = await response.json();
//           setFrontOfficeDetails(result);
//         }
//       } catch (error) {
//         setError(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFrontOfficeDetails();
//   }, []);
//   const handleLogout = () => {
//     dispatch({ type: "LOGOUT" });
//   };
//     // Function to handle "See More" clicks
//     const onSeeMore = (id) => {
//       setSelectedClientId(id);
//       setTab("Update Client"); // Switch to the Update Client tab automatically
//     };
//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error.message}</div>;
//   }
//   const buttonClasses = (currentTab) =>
//     `p-2 flex-1 text-lg text-center font-semibold rounded-full shadow-md transition-transform transform hover:scale-105 border-2 ${
//       tab === currentTab
//         ? "bg-blue-100 text-blue-900 border-blue-600 shadow-lg"
//         : "bg-offwhite text-blue-900 border-blue-400 hover:bg-blue-50 hover:text-blue-900"
//     }`;
  

//   return (
//     <div className="w-full bg-[#F0FBFC] mx-auto">
//       <div className="grid md:grid-cols-3 gap-10">
//         <div className="pb-[30px] px-[20px] rounded-md">
//         <div className={`flex items-center justify-center ${tab === "Create Client" ? "mt-[120px]" : tab === "Search Client" ? "mt-[73px]" : tab === "Client Details" ? "mt-[60px]":"mt-[128px]"}`}>
//         <img
//               className="inline-flex object-cover border-4 border-indigo-600 rounded-full shadow-[5px_5px_0_0_rgba(0,0,0,1)] shadow-indigo-600/100 bg-indigo-50 text-indigo-600 h-48 w-48"
//               src="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="
//               alt="User Avatar"
//             />
//           </div>
//           <div className="text-center mt-8">
//             <h3 className="text-[34px] leading-[40px] text-headingColor font-extrabold tracking-wide">
//               FRONT OFFICER
//             </h3>
//             <p className="text-textColor text-[16px] leading-6 font-semibold mt-2">
//               {frontOfficeDetails.name}
//             </p>
//             <p className="text-textColor text-[16px] leading-6 font-semibold mt-1">
//               {frontOfficeDetails.email}
//             </p>
//           </div>
//           <div className="mt-[50px] md:mt-[20px]">
//             <button
//               className="w-full bg-red-600 p-5 text-[16px] leading-7 rounded-md text-white font-bold"
//               onClick={handleLogout}
//             >
//               Logout
//             </button>
//           </div>
//         </div>
//         <div className="md:col-span-2 md:px-[30px] mt-2 ">
//           <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 ml-2 mb-2">
//             <button
//               type="button"
//               className={buttonClasses("Create Client")}
//               onClick={() => setTab("Create Client")}
//             >
//               CreateClient
//             </button>
//             <button
//               type="button"
//               className={buttonClasses("Search Client")}
//               onClick={() => setTab("Search Client")}
//             >
//               SearchClient
//             </button>
//             <button
//               type="button"
//               className={buttonClasses("Update Client")}
//               //onClick={() => setTab("Update Client")}
//             >
//               UpdateClient
//             </button>
//             <button
//               type="button"
//               className={buttonClasses("Client Details")}
//               onClick={() => setTab("Client Details")}
//             >
//               DownloadClientsList
//             </button>
            
//           </div>
//           <div className="mt-4 md:mt-0 mb-5">
//             {tab === "Create Client" && (
//               <div><ClientRegistration/></div>
//             )}
//             {tab === "Client Details" && (
//               <div><MyClientDetails/></div>
//             )}
//             {tab === "Update Client" && (
//               <ClientUpdation clientId={selectedClientId} />
//             )}
//             {tab === "Search Client" && (
//               <div><ClientSearch  onSeeMore={onSeeMore}/></div>
//             )}
           
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FrontofficeProfile;
import React, { useState, useContext, useEffect } from "react";
import { authContext } from "../../context/authContext";
import ClientRegistration from "./ClientRegistration";
import ClientUpdation from "./ClientUpdation";
import MyClientDetails from "./MyClientDetails";
import ClientSearch from "./ClientSearch";
import ClientsToCreate from "./ClientsToCreate";
import { BASE_URL } from "../../config";

const FrontofficeProfile = () => {
  const [tab, setTab] = useState("ClientsToCreate");
  const [frontOfficeDetails, setFrontOfficeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state, dispatch } = useContext(authContext);
  const [selectedClientId, setSelectedClientId] = useState(null);

  // NEW: holds the data to prefill ClientRegistration
  const [createPrefill, setCreatePrefill] = useState(null);
  const [clientByEntryId, setClientByEntryId] = useState(null);

  useEffect(() => {
    const fetchFrontOfficeDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          const response = await fetch(
            `${BASE_URL}/frontoffice/frontofficeDetails/${storedUser._id}`,
            { headers: { "Content-Type": "application/json" } }
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const result = await response.json();
          setFrontOfficeDetails(result);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFrontOfficeDetails();
  }, []);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const onSeeMore = (id) => {
    setSelectedClientId(id);
    setTab("Update Client");
  };

  // NEW: when user clicks "+" on ClientsToCreate row
  const onCreateFromRow = (row) => {
    // row contains: name, mobileNumber, primaryTourName({_id,value,label}), createdAtByEntry, etc.
    setCreatePrefill({
      name: row.name || "",
      mobileNumber: row.mobileNumber || "",
      primaryTourName: row.primaryTourName || null,
       connectedThrough: row.connectedThrough || null, // <-- add
      clientType: row.clientType || null,             // <-- add
    });
    setClientByEntryId(row._id)

    setTab("Create Client");
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const buttonClasses = (currentTab) =>
    `p-2 flex-1 text-lg text-center font-semibold rounded-full shadow-md transition-transform transform hover:scale-105 border-2 ${
      tab === currentTab
        ? "bg-blue-100 text-blue-900 border-blue-600 shadow-lg"
        : "bg-offwhite text-blue-900 border-blue-400 hover:bg-blue-50 hover:text-blue-900"
    }`;

  return (
    <div className="w-full bg-[#F0FBFC] mx-auto">
      <div className="grid md:grid-cols-3 gap-10">
        <div className="pb-[30px] px-[20px] rounded-md">
          <div className={`flex items-center justify-center ${
              tab === "Create Client" ? "mt-[120px]"
            : tab === "Search Client" ? "mt-[73px]"
            : tab === "Client Details" ? "mt-[60px]"
            : tab === "ClientsToCreate" ? "mt-[150px]"
            : "mt-[128px]"
          }`}>
            <img
              className="inline-flex object-cover border-4 border-indigo-600 rounded-full shadow-[5px_5px_0_0_rgba(0,0,0,1)] shadow-indigo-600/100 bg-indigo-50 text-indigo-600 h-48 w-48"
              src="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="
              alt="User Avatar"
            />
          </div>
          <div className="text-center mt-8">
            <h3 className="text-[34px] leading-[40px] text-headingColor font-extrabold tracking-wide">
              FRONT OFFICER
            </h3>
            <p className="text-textColor text-[16px] leading-6 font-semibold mt-2">
              {frontOfficeDetails?.name}
            </p>
            <p className="text-textColor text-[16px] leading-6 font-semibold mt-1">
              {frontOfficeDetails?.email}
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

        <div className="md:col-span-2 md:px-[30px] mt-2 ">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 ml-2 mb-2">
            <button
              type="button"
              className={buttonClasses("ClientsToCreate")}
              onClick={() => setTab("ClientsToCreate")}
            >
              ClientsToCreate
            </button>

            {/* IMPORTANT: hide/remove manual Create tab button to enforce flow */}
            {/* <button
              type="button"
              className={buttonClasses("Create Client")}
              onClick={() => setTab("Create Client")}
            >
              CreateClient
            </button> */}

            <button
              type="button"
              className={buttonClasses("Search Client")}
              onClick={() => setTab("Search Client")}
            >
              SearchClient
            </button>
            <button
              type="button"
              className={buttonClasses("Update Client")}
            >
              UpdateClient
            </button>
            <button
              type="button"
              className={buttonClasses("Client Details")}
              onClick={() => setTab("Client Details")}
            >
              DownloadClientsList
            </button>
          </div>

          <div className="mt-4 md:mt-0 mb-5">
            {tab === "ClientsToCreate" && (
              <ClientsToCreate onCreate={onCreateFromRow} />
            )}

            {tab === "Create Client" && (
              <ClientRegistration prefill={createPrefill} clientByEntryId={clientByEntryId} />
            )}

            {tab === "Client Details" && <MyClientDetails />}

            {tab === "Update Client" && (
              <ClientUpdation clientId={selectedClientId} />
            )}

            {tab === "Search Client" && (
              <ClientSearch onSeeMore={onSeeMore} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrontofficeProfile;
