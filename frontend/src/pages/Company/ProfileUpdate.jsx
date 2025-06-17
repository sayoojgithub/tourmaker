import React, { useState } from "react";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import uploadImageToCloudinary from "../../Utils/uploadCloudinary";
import { BASE_URL } from "../../config";

const ProfileUpdate = ({ user, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    email: user.email || "",
    mobileNumber: user.mobileNumber || "",
    cgstPercentage: user.cgstPercentage || 0,
    sgstPercentage: user.sgstPercentage || 0,
    sacNumber: user.sacNumber || "",
    logo: user.logo || "",
  });
  const [previewURL, setPreviewURL] = useState(user.logo || "");
  const [loading, setLoading] = useState(false); // State to track loading state
  const [errors, setErrors] = useState({}); // State to track validation errors

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors({ ...errors, [name]: "" });

    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!formData.mobileNumber) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be 10 digits";
    }
    if (
      formData.cgstPercentage === "" ||
      isNaN(formData.cgstPercentage) ||
      formData.cgstPercentage < 0 ||
      formData.cgstPercentage > 100
    ) {
      newErrors.cgstPercentage = "CGST must be a number between 0 and 100";
    }

    if (
      formData.sgstPercentage === "" ||
      isNaN(formData.sgstPercentage) ||
      formData.sgstPercentage < 0 ||
      formData.sgstPercentage > 100
    ) {
      newErrors.sgstPercentage = "SGST must be a number between 0 and 100";
    }
      // SAC Number (Optional, but must be 6 digits and start with 99 if filled)
  if (formData.sacNumber && formData.sacNumber !== "") {
    if (!/^(99\d{4})$/.test(formData.sacNumber)) {
      newErrors.sacNumber = "SAC must be a 6-digit code starting with 99";
    }
  }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];
    try {
      setLoading(true); // Set loading to true before starting upload
      const data = await uploadImageToCloudinary(file);
      setPreviewURL(data.url);
      setFormData({ ...formData, logo: data.url });
      setErrors({ ...errors, logo: null }); // Clear logo error
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false); // Set loading back to false whether upload succeeds or fails
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        const response = await fetch(
          `${BASE_URL}/company/updateProfile/${storedUser._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update profile");
        }

        const updatedUser = await response.json();
        onUserUpdate(updatedUser);
        toast.success("Profile updated successfully!");
        console.log("Form data submitted:", formData);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="w-full  p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg mt-1">
      <form className=" w-full  " onSubmit={handleSubmit}>
        <div className="flex flex-wrap border shadow rounded-lg p-3 bg-white/20">
         <div className="flex items-center justify-center mb-1">
  <div className="flex items-center gap-1 bg-white/30 px-2 py-2 rounded-lg shadow">
    <h2 className="text-xl font-semibold text-red-600">Update profile here:</h2>
  </div>
</div>

          <div className="flex flex-col gap-2 w-full border-gray-400">
            <div>
              <label className="text-gray-800 text-sm mb-1 block">Email</label>
              <input
                name="email"
                className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                type="text"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="text-gray-800 text-sm mb-1 block">
                Mobile Number
              </label>
              <input
                name="mobileNumber"
                className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                type="text"
                value={formData.mobileNumber}
                onChange={handleChange}
              />
              {errors.mobileNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mobileNumber}
                </p>
              )}
            </div>
            {/* CGST and SGST Fields */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-gray-800 text-sm mb-1 block">
                  CGST Percentage
                </label>
                <input
                  name="cgstPercentage"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                  type="number"
                  value={formData.cgstPercentage}
                  onChange={handleChange}
                />
                {errors.cgstPercentage && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.cgstPercentage}
                  </p>
                )}
              </div>

              <div>
                <label className="text-gray-800 text-sm mb-1 block">
                  SGST Percentage
                </label>
                <input
                  name="sgstPercentage"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                  type="number"
                  value={formData.sgstPercentage}
                  onChange={handleChange}
                />
                {errors.sgstPercentage && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.sgstPercentage}
                  </p>
                )}
              </div>
              {/* SAC Number */}
              <div>
                <label className="text-gray-800 text-sm mb-1 block">
                  SAC Number
                </label>
                <input
                  name="sacNumber"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-3 py-3 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                  type="text"
                  value={formData.sacNumber}
                  onChange={handleChange}
                />
                {errors.sacNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.sacNumber}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-gray-800 text-sm mb-1 block">Logo</label>
              <div className="flex items-center gap-3">
                {previewURL && (
                  <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
                    <img
                      src={previewURL}
                      alt="logo"
                      className="w-full rounded-full"
                    />
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
                    className="flex justify-center items-center mx-auto"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                className="py-2.5 px-3 m-1 text-center bg-primaryColor text-white w-full font-bold rounded-lg mt-1"
                type="submit"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileUpdate;
