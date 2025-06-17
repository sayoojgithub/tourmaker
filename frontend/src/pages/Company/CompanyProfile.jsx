import { useState, useEffect, useContext } from "react";
import { authContext } from "../../context/authContext";
import ProfileUpdate from "./ProfileUpdate";
import EmployeeRegistration from "./EmployeeRegistration";
import BankMain from "./BankMain";
//import CompanyExecutives from "./CompanyExecutives";
import ExecutiveMain from "./ExecutiveMain";
import CustomerCareMain from "./CustomerCareMain";
import FrontOfficerDestinationCount from "./FrontOfficerDestinationCount";
import { BASE_URL } from "../../config";

const CompanyProfile = () => {
  const [tab, setTab] = useState("settings");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { state, dispatch } = useContext(authContext);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
          const response = await fetch(`${BASE_URL}/company/companyDetails/${storedUser._id}`, {
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const result = await response.json();
          console.log(result)
          setUser(result);
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, []);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
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
    <div className="w-full bg-[#F0FBFC] px-5 mx-auto">
      <div className="grid md:grid-cols-3 gap-10">
        <div className="pb-[50px] px-[30px] rounded-md mb-1">
        <div className={`flex items-center justify-center ${tab === "Registering" ? "mt-[170px]" :tab === "CompanyExecutives" ? "mt-[175px]":tab === "CompanyCustomerCares" ? "mt-[170px]": "mt-[195px]"}`}>
         <img
    className="inline-flex object-contain border-4 border-blue-600 rounded-full shadow-[5px_5px_0_0_rgba(0,0,0,1)] shadow-blue-600/100 bg-white text-blue-600 h-48 w-48"
    src={
      user.logo ||
      "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="
    }
    alt="User Avatar"
  />
          </div>
          <div className="text-center mt-8">
            <h3
  className="leading-[1.2] text-headingColor font-extrabold tracking-wide truncate text-[clamp(1.5rem, 5vw, 2rem)]"
  title={user.name}
>
  {user.name}
</h3>
            <p className="text-textColor text-[16px] leading-6 font-semibold mt-2">
              {user.email}
            </p>
            <p className="text-textColor text-[16px] leading-6 font-semibold mt-1">
              {user.mobileNumber}
            </p>
          </div>
          <div className="mt-[50px] md:mt-[20px]">
            <button className="w-full bg-red-600 p-5 text-[16px] leading-7 rounded-md text-white font-bold" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
        <div className="md:col-span-2 md:px-[10px] m-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 ml-1">
            <button
              type="button"
              className={buttonClasses("settings")}
              onClick={() => setTab("settings")}
            >
              UpdateProfile
            </button>
            <button
              type="button"
              className={buttonClasses("Registering")}
              onClick={() => setTab("Registering")}
            >
              RegisterStaff
            </button>

            <button
              type="button"
              className={buttonClasses("AddBankDetails")}
              onClick={() => setTab("AddBankDetails")}
            >
              AddBankInfo
            </button>
            <button
              type="button"
              className={buttonClasses("CompanyExecutives")}
              onClick={() => setTab("CompanyExecutives")}
            >
              Executives
            </button>
            <button
              type="button"
              className={buttonClasses("CompanyCustomerCares")}
              onClick={() => setTab("CompanyCustomerCares")}
            >
              CustomerCare
            </button>
             <button
              type="button"
              className={buttonClasses("FrontOfficerDestinationCreatedCount")}
              onClick={() => setTab("FrontOfficerDestinationCreatedCount")}
            >
             FrontOfficer Destination Log
            </button>
          </div>
          <div className="mt-4 md:mt-0 mb-1">
            {tab === "Registering" && (
              <div><EmployeeRegistration/></div>
            )}
            {tab === "settings" && (
              <div><ProfileUpdate user={user} onUserUpdate={handleUserUpdate}/></div>
            )}
            {tab === "AddBankDetails" && <div><BankMain/></div>}
            {tab === "CompanyExecutives" && <div><ExecutiveMain/></div>}
            {tab === "CompanyCustomerCares" && <div><CustomerCareMain/></div>}
            {tab === "FrontOfficerDestinationCreatedCount" && <div><FrontOfficerDestinationCount/></div>}


          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
