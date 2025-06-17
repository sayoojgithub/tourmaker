import { useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { Link } from "react-router-dom";
import { authContext } from "../../context/authContext";

const navLinks = [
  {
    path: "/home",
    display: "Home",
  },
];

const Header = () => {
  const headerRef = useRef(null);
  const { user, role, token } = useContext(authContext);

  const navigate = useNavigate();

  useEffect(() => {
    const handleStickyHeader = () => {
      if (window.scrollY > 80) {
        headerRef.current.classList.add("sticky__header");
      } else {
        headerRef.current.classList.remove("sticky__header");
      }
    };

    window.addEventListener("scroll", handleStickyHeader);

    return () => window.removeEventListener("scroll", handleStickyHeader);
  }, []);

  const handleProfileClick = () => {
    if (role === "agency") {
      navigate("/company-profile");
    }
    if (role === "front office") {
      navigate("/frontoffice-profile");
    }
    if (role === "executive") {
      navigate("/executive-profile");
    }
    if (role === "sales") {
      navigate("/sales-profile");
    }
    if (role === "purchase") {
      navigate("/purchase-profile");
    }
    if (role === "billing") {
      navigate("/billing-profile");
    }
    if (role === "booking") {
      navigate("/booking-profile");
    }
    if (role === "customer care") {
      navigate("/customcare-profile");
    }
  }

  return (
    <header
      ref={headerRef}
      className="header flex items-center sticky top-0 bg-white shadow-md z-50 sm:w-full"
    >
      <div className="container mx-auto ">
        <div className="flex items-center justify-between ">
          {/*==========logo=======*/}
          <div>
            <img src={logo} alt="logo" className="w-48 h-20" />
          </div>
          {/* =======menu======= */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
                <img
                  className="w-16 h-16 rounded-full cursor-pointer"
                  src={
                    user.logo ||
                    "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="
                  }
                  alt="User Logo"
                  onClick={handleProfileClick}
                />
                <span className="top-0 left-7 absolute w-3.5 h-3.5 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></span>
              </div>
            ) : (
              <Link to="/login">
                <button className="text-white bg-primaryColor py-2 px-6 font-bold h-11 flex items-center justify-center rounded-full">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
