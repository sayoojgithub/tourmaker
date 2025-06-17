import React, { useState,useEffect } from "react";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import uploadImageToCloudinary from "../../Utils/uploadCloudinary";

const AddBankForm = ({ onNext, bankId }) => {
  const [formData, setFormData] = useState({
    bankName: "",
    bankIfscCode: "",
    bankAccountNumber: "",
    bankBranch: "",
    bankQrCode: "", // Field for storing QR code URL
  });
  console.log(formData);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewURL, setPreviewURL] = useState("");
  useEffect(() => {
    if (bankId) {
      const fetchBankDetails = async () => {
        const company = JSON.parse(localStorage.getItem("user")); // Get company info
  
        try {
          const response = await fetch(
            `${BASE_URL}/company/fetchBankDetails/${company._id}/${bankId}`
          );
  
          if (!response.ok) {
            throw new Error("Failed to fetch bank details");
          }
  
          const data = await response.json();
          console.log(data)
          setFormData(data);
          setPreviewURL(data.bankQrCode)
        } catch (error) {
          console.error("Failed to fetch bank details:", error);
          toast.error("Failed to fetch bank details");
        }
      };
  
      fetchBankDetails();
    } else {
      // Reset form data if no bank is provided
      setFormData({
        bankName: "",
        bankIfscCode: "",
        bankAccountNumber: "",
        bankBranch: "",
        bankQrCode: "",
      });
    }
  }, [bankId]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bankName) newErrors.bankName = "Bank name is required";
    if (!formData.bankIfscCode)
      newErrors.bankIfscCode = "IFSC code is required";
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankIfscCode))
      newErrors.bankIfscCode = "Invalid IFSC code format";

    if (!formData.bankAccountNumber)
      newErrors.bankAccountNumber = "Bank account number is required";
    else if (!/^\d{9,18}$/.test(formData.bankAccountNumber))
      newErrors.bankAccountNumber = "Invalid bank account number";

    if (!formData.bankBranch) newErrors.bankBranch = "Bank branch is required";
    if (!formData.bankQrCode) newErrors.bankQrCode = "QR Code is required";

    return newErrors;
  };

  const handleFileInputChange = async (event) => {
    const file = event.target.files[0];

    try {
      setLoading(true);

      const data = await uploadImageToCloudinary(file);
      setPreviewURL(data.url);
      setFormData({ ...formData, bankQrCode: data.url });

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      toast.error("Image upload failed. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
  
    try {
      const company = JSON.parse(localStorage.getItem("user"));
      if (company) {
        const url = bankId
          ? `${BASE_URL}/company/updateBankDetails/${company._id}/${bankId}`
          : `${BASE_URL}/company/addBankDetails/${company._id}`;
  
        const method = bankId ? "PUT" : "POST";
  
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
  
        const data = await response.json();
        if (response.ok) {
          toast.success(
            bankId ? "Bank details updated successfully!" : "Bank details added successfully!"
          );
  
          // Reset form after successful action
          setFormData({
            bankName: "",
            bankIfscCode: "",
            bankAccountNumber: "",
            bankBranch: "",
            bankQrCode: "",
          });
          setPreviewURL("");
          onNext()
          
        } else {
          console.error("Failed to save bank details:", data.message);
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error("Error submitting bank details:", error);
      toast.error("An error occurred while saving bank details.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
<div className="w-full  p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg mt-1">
<form className="w-full" onSubmit={handleSubmit}>
        <div className="flex flex-wrap border shadow rounded-lg p-5 bg-white/20">
          <div className="flex items-center justify-center mb-2">
  <div className="flex items-center gap-1 bg-white/30 px-2 py-2 rounded-lg shadow">
    <h2 className="text-xl font-semibold text-red-600">
      {bankId ? "Update Bank Details:" : "Add Bank Details:"}
    </h2>
  </div>
</div>

          <div className="flex flex-col gap-4 w-full border-gray-400">
            {/* First Row: Bank Name & IFSC Code */}
            <div className="flex gap-4 w-full">
              <div className="w-1/2">
                <label className="text-gray-800 text-sm mb-2 block">
                  Bank Name
                </label>
                <input
                  name="bankName"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-2 py-2 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                  type="text"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="Enter bank name"
                />
                {errors.bankName && (
                  <p className="text-red-500 text-sm">{errors.bankName}</p>
                )}
              </div>
              <div className="w-1/2">
                <label className="text-gray-800 text-sm mb-2 block">
                  IFSC Code
                </label>
                <input
                  name="bankIfscCode"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-2 py-2 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                  type="text"
                  value={formData.bankIfscCode}
                  onChange={handleChange}
                  placeholder="Enter IFSC code"
                />
                {errors.bankIfscCode && (
                  <p className="text-red-500 text-sm">{errors.bankIfscCode}</p>
                )}
              </div>
            </div>

            {/* Second Row: Account Number & Branch */}
            <div className="flex gap-4 w-full">
              <div className="w-1/2">
                <label className="text-gray-800 text-sm mb-2 block">
                  Account Number
                </label>
                <input
                  name="bankAccountNumber"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-2 py-2 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                />
                {errors.bankAccountNumber && (
                  <p className="text-red-500 text-sm">
                    {errors.bankAccountNumber}
                  </p>
                )}
              </div>
              <div className="w-1/2">
                <label className="text-gray-800 text-sm mb-2 block">
                  Branch
                </label>
                <input
                  name="bankBranch"
                  className="bg-gray-100 w-full text-gray-800 text-sm px-2 py-2 focus:bg-transparent outline-blue-500 transition-all rounded-lg"
                  type="text"
                  value={formData.bankBranch}
                  onChange={handleChange}
                  placeholder="Enter bank branch"
                />
                {errors.bankBranch && (
                  <p className="text-red-500 text-sm">{errors.bankBranch}</p>
                )}
              </div>
            </div>

            {/* QR Code Upload */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="w-full lg:w-1/3 flex flex-col items-center">
                <div className="flex items-center space-x-4">
                  {/* Input Field */}
                  <div className="relative w-[130px] h-[50px]">
                    <input
                      type="file"
                      name="bankQrCode"
                      onChange={handleFileInputChange}
                      className="opacity-0 z-10 absolute w-full h-full cursor-pointer"
                    />
                    <label className="absolute w-full h-full top-0 left-0 text-xs font-bold uppercase border border-primaryColor text-center text-primaryColor flex items-center justify-center cursor-pointer rounded-lg hover:bg-primaryColor hover:text-white transition-all">
                      Select qr code
                    </label>
                  </div>

                  {/* Loader & Image Container */}
                  <div className="w-[50px] h-[50px] rounded-md border-2 border-solid border-primaryColor flex items-center justify-center">
                    {loading ? (
                      <HashLoader
                        color={"#5c27d6"}
                        loading={loading}
                        size={30}
                      />
                    ) : (
                      formData.bankQrCode && (
                        <img
                          src={previewURL}
                          alt="QR Code"
                          className="w-full h-full object-cover rounded-md"
                        />
                      )
                    )}
                  </div>
                </div>

                {/* Error message */}
                {errors.bankQrCode && (
                  <p className="text-red-500 text-xs mt-1 font-bold">
                    {errors.bankQrCode}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button 
            type="submit"
            className="py-2.5 px-3 text-center bg-primaryColor text-white w-full font-bold rounded-lg mt-1">
             {bankId ? "Update Bank Details:" : "Add Bank Details:"}
            </button>
            <button
              type="button"
              onClick={onNext}
              className="py-2 px-1 text-center bg-red-500 text-white w-full font-bold rounded-lg mt-1"
            >
              Switch
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddBankForm;
