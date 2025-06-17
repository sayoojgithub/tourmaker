import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import uploadImageToCloudinary from "../Utils/uploadCloudinary";

const fetchPincodeDetails = async (pincode) => {
  try {
    const response = await fetch(
      `https://api.postalpincode.in/pincode/${pincode}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    if (data[0].Status !== "Success") {
      throw new Error("Invalid Pincode");
    }
    const postOffice = data[0].PostOffice[0];
    if (!postOffice) {
      throw new Error("No Post Office found for this pincode");
    }
    return {
      country: postOffice.Country,
      state: postOffice.State,
      district: postOffice.District,
    };
  } catch (error) {
    console.error("Error fetching pincode details:", error.message);
    toast.error("There was a problem fetching the pincode details. Please wait and try again.");

    return {
      error: error.message,
      details: null
    };
  }
};


const CompanySignup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    pincode: "",
    country: "",
    state: "",
    district: "",
    landLineNumber: "",
    mobileNumber: "",
    logo: "",
    gstNumber: "",         // New field for GST Number
    buildingName: "",      // New field for Building Name
    streetOrLocality: "",  // New field for Street/Locality
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewURL, setPreviewURL] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!formData.pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = "Pincode is invalid";
    }
    if (!formData.country.trim()) {
      errors.country = "Country is required";
    }
    if (!formData.state.trim()) {
      errors.state = "State is required";
    }
    if (!formData.district.trim()) {
      errors.district = "District is required";
    }
    if (formData.landLineNumber.trim() && !/^\d{10}$/.test(formData.landLineNumber)) {
      errors.landLineNumber = "Landline number is invalid";
    }
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      errors.mobileNumber = "Mobile number is invalid";
    }
    

    return errors;
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: "" });

    setFormData({ ...formData, [name]: value });

    if (name === "pincode" && /^\d{6}$/.test(value)) {
      try {
        const details = await fetchPincodeDetails(value);
        if (details) {
          setFormData((prevData) => ({
            ...prevData,
            country: details.country,
            state: details.state,
            district: details.district,
          }));
        }
      } catch (error) {
        console.error("Error fetching pincode details:", error);
        // Optionally handle error state or show error message
      }
    }
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];

    try {
      setLoading(true);

      const data = await uploadImageToCloudinary(file);
      setPreviewURL(data.url);
      setFormData({ ...formData, logo: data.url });

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Image upload failed. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate();
    setErrors(errors);

    if (Object.keys(errors).length === 0) {
      const formDataToSend = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        pincode: formData.pincode,
        country: formData.country,
        state: formData.state,
        district: formData.district,
        landLineNumber: formData.landLineNumber,
        mobileNumber: formData.mobileNumber,
        logo: formData.logo,
        gstNumber: formData.gstNumber,           // Include GST Number
        buildingName: formData.buildingName,     // Include Building Name
        streetOrLocality: formData.streetOrLocality, // Include Street/Local
      };

      try {
        const response = await fetch(`${BASE_URL}/auth/register-company`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formDataToSend),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success("OTP sent to registered email");
          navigate("/otp", { state: { email: formData.email } });
        } else {
          toast.error(`Registration failed: ${data.message}`);
        }
      } catch (error) {
        toast.error("An error occurred: " + error.message);
      }
    }
  };

  return (
    <div className="font-sans bg-[#F0FBFC]">
  <div className="min-h-screen flex flex-col items-center justify-center p-6">
    <div className="grid lg:grid-cols-2 items-center gap-6 max-w-7xl max-lg:max-w-xl w-full">
      <form className="lg:max-w-xl w-full bg-white p-6 rounded-xl shadow-xl transition-transform transform hover:scale-105 hover:shadow-2xl" onSubmit={handleSubmit}>
        <h3 className="text-gray-800 text-3xl font-extrabold mb-12">
          Company Registration
        </h3>
        <div className="grid gap-2 lg:grid-cols-3 space-y-0">
          <div>
            <label className="text-gray-800 text-sm mb-2 block">Name</label>
            <input
              name="name"
              type="text"
              className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              placeholder="Enter name"
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-800 text-sm mb-2 block">Email</label>
            <input
              name="email"
              type="email"
              className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                {errors.email}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-800 text-sm mb-2 block">Password</label>
            <input
              name="password"
              type="password"
              className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                {errors.password}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-800 text-sm mb-2 block">Pincode</label>
            <input
              name="pincode"
              type="text"
              className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              placeholder="Enter pincode"
              value={formData.pincode}
              onChange={handleChange}
            />
            {errors.pincode && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                {errors.pincode}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-800 text-sm mb-2 block">Country</label>
            <input
              name="country"
              type="text"
              readOnly
              className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              value={formData.country}
              onChange={handleChange}
            />
            {errors.country && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                {errors.country}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-800 text-sm mb-2 block">State</label>
            <input
              name="state"
              type="text"
              readOnly
              className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              value={formData.state}
              onChange={handleChange}
            />
            {errors.state && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                {errors.state}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-800 text-sm mb-2 block">District</label>
            <input
              name="district"
              type="text"
              readOnly
              className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              value={formData.district}
              onChange={handleChange}
            />
            {errors.district && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                {errors.district}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-800 text-sm mb-2 block">
              Landline Number
            </label>
            <input
              name="landLineNumber"
              type="text"
              className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              placeholder="Landline num"
              value={formData.landLineNumber}
              onChange={handleChange}
            />
            {errors.landLineNumber && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                {errors.landLineNumber}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-800 text-sm mb-2 block">
              Mobile Number
            </label>
            <input
              name="mobileNumber"
              type="text"
              className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
              placeholder="Mobile num"
              value={formData.mobileNumber}
              onChange={handleChange}
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-xs mt-1 font-bold">
                {errors.mobileNumber}
              </p>
            )}
          </div>
           {/* GST Number Field */}
  <div>
    <label className="text-gray-800 text-sm mb-2 block">
      GST Number
    </label>
    <input
      name="gstNumber"
      type="text"
      className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
      placeholder="GST Number"
      value={formData.gstNumber}
      onChange={handleChange}
    />
  </div>

  {/* Building Name Field */}
  <div>
    <label className="text-gray-800 text-sm mb-2 block">
      Building Name
    </label>
    <input
      name="buildingName"
      type="text"
      className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
      placeholder="Building Name"
      value={formData.buildingName}
      onChange={handleChange}
    />
  </div>

  {/* Street/Locality Field */}
  <div>
    <label className="text-gray-800 text-sm mb-2 block">
      Street/Locality
    </label>
    <input
      name="streetOrLocality"
      type="text"
      className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
      placeholder="Street/Locality"
      value={formData.streetOrLocality}
      onChange={handleChange}
    />
  </div>
          <div className="lg:col-span-3 flex justify-center">
            <div className="w-full lg:w-1/3 flex flex-col items-center">
              {formData.logo && (
                <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center mb-2">
                  <img src={previewURL} alt="" className="w-full rounded-full" />
                </figure>
              )}
              <div className="relative w-[130px] h-[50px]">
                <input
                  type="file"
                  name="logo"
                  onChange={handleFileInputChange}
                  className="opacity-0 z-10 absolute w-full h-full cursor-pointer"
                />
                <label className="absolute w-full h-full top-0 left-0 text-xs font-bold uppercase border border-primaryColor text-center text-primaryColor flex items-center justify-center cursor-pointer rounded-lg hover:bg-primaryColor hover:text-white transition-all">
                  Select Logo
                </label>
              </div>
              {loading && (
                <HashLoader
                  color={"#5c27d6"}
                  loading={loading}
                  size={30}
                  className="flex justify-center items-center mx-auto mt-2"
                />
              )}
              {errors.logo && (
                <p className="text-red-500 text-xs mt-1 font-bold">
                  {errors.logo}
                </p>
              )}
            </div>
          </div>
        </div>
        <button className="w-full py-4 bg-primaryColor text-white font-bold rounded-lg mt-5">
          Register
        </button>
        <p className="text-sm text-gray-800 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#87ceeb] hover:underline font-semibold"
          >
            Login here
          </Link>
        </p>
      </form>
      <div className="h-full max-lg:mt-12">
        <img
          src="https://readymadeui.com/login-image.webp"
          className="w-full h-full object-cover rounded-lg"
          alt="Company Registration"
        />
      </div>
    </div>
  </div>
</div>

  );
};

export default CompanySignup;
