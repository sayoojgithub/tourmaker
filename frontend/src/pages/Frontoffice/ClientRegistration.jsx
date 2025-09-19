
// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import { BASE_URL } from "../../config";

// const ClientRegistration = ({ prefill, clientByEntryId }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     mobileNumber: "",
//     whatsappNumber: "",
//     additionalNumber: "",
//     primaryTourName: null, // react-select option: { _id, value, label }
//     tourName: [],
//     groupType: "",
//     numberOfPersons: "",
//     startDate: "",
//     endDate: "",
//     numberOfDays: "",
//     pincode: "",
//     district: "",
//     state: "",
//     clientContactOption: "",
//     clientType: "",
//     clientCurrentLocation: "",
//     connectedThrough: "",
//     behavior: "",
//     additionalRequirments: "",
//     gstNumber: "",
//   });

//   const [destinations, setDestinations] = useState([]);
//   const [loading, setLoading] = useState(false); // for destinations select
//   const [errors, setErrors] = useState({});
//   const [isLoading, setIsLoading] = useState(false); // submit state

//   const hasPrefill =
//     !!(prefill && (prefill.mobileNumber || prefill.primaryTourName || prefill.name));

//   const customStyles = {
//     control: (base, state) => ({
//       ...base,
//       backgroundColor: "#f3f4f6",
//       borderRadius: "10px",
//       boxShadow: state.isFocused ? "0 0 5px rgba(0, 120, 255, 0.5)" : "none",
//       border: state.isFocused ? "2px solid #007BFF" : "1px solid #ccc",
//       padding: "5px",
//       height: "50px",
//       display: "flex",
//       alignItems: "center",
//       overflowX: "auto",
//       whiteSpace: "nowrap",
//     }),
//     option: (base, state) => ({
//       ...base,
//       backgroundColor: state.isFocused ? "#007BFF" : "white",
//       color: state.isFocused ? "white" : "black",
//       padding: "10px",
//       cursor: "pointer",
//       "&:hover": { backgroundColor: "#0056b3", color: "white" },
//     }),
//     multiValue: (base) => ({
//       ...base,
//       backgroundColor: "#007BFF",
//       color: "white",
//       borderRadius: "5px",
//       padding: "3px 5px",
//       margin: "2px",
//       display: "flex",
//       alignItems: "center",
//       whiteSpace: "nowrap",
//     }),
//     multiValueLabel: (base) => ({
//       ...base,
//       color: "white",
//       padding: "0 5px",
//     }),
//     multiValueRemove: (base) => ({
//       ...base,
//       color: "white",
//       cursor: "pointer",
//       "&:hover": { backgroundColor: "#0056b3", color: "white" },
//     }),
//     placeholder: (base) => ({ ...base, color: "#aaa", fontSize: "0.9rem" }),
//     dropdownIndicator: (base) => ({
//       ...base,
//       color: "#007BFF",
//       "&:hover": { color: "#0056b3" },
//     }),
//     indicatorSeparator: () => ({ display: "none" }),
//     clearIndicator: (base) => ({
//       ...base,
//       color: "#ccc",
//       "&:hover": { color: "#007BFF" },
//     }),
//     menu: (base) => ({
//       ...base,
//       backgroundColor: "white",
//       borderRadius: "10px",
//       boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
//       zIndex: 10,
//       maxHeight: "100px",
//       overflowY: "auto",
//     }),
//   };

//   // -------- destinations ----------
//   const fetchDestinations = async () => {
//     try {
//       setLoading(true);
//       const storedUser = JSON.parse(localStorage.getItem("user"));
//       if (!storedUser?.companyId) {
//         throw new Error("Company not found in local storage.");
//       }
//       const response = await fetch(
//         `${BASE_URL}/purchaser/getDestinationsName?companyId=${storedUser.companyId}`
//       );
//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || "Failed to fetch destinations");
//       }
//       const data = await response.json();
//       const options = data.map((destination) => ({
//         _id: destination._id,
//         value: destination.value,
//         label: destination.label,
//       }));
//       setDestinations(options);
//     } catch (error) {
//       console.error("Failed to fetch destinations:", error);
//       toast.error(error.message || "An error occurred while fetching destinations");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDestinations();
//   }, []);

//   // -------- prefill enforcement ----------
//   useEffect(() => {
//     if (hasPrefill) {
//       setFormData((s) => ({
//         ...s,
//         name: prefill.name || "",
//         mobileNumber: prefill.mobileNumber || "",
//         primaryTourName: prefill.primaryTourName || null, // {_id,value,label}
        
//       }));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [JSON.stringify(prefill)]);

//   // sync prefilled primaryTourName to actual option object after destinations load
//   useEffect(() => {
//     if (formData.primaryTourName && destinations.length) {
//       const match = destinations.find((d) => d._id === formData.primaryTourName._id);
//       if (match) {
//         setFormData((s) => ({ ...s, primaryTourName: match }));
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [destinations.length]);

//   const handleChange = (selectedOption, name) => {
//     setFormData((prev) => ({ ...prev, [name]: selectedOption }));
//   };

//   // -------- pincode autofill ----------
//   const fetchPincodeDetails = async (pincode) => {
//     try {
//       const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();
//       if (!Array.isArray(data) || !data[0] || data[0].Status !== "Success") {
//         toast.error("Invalid Pincode , Please check the pincode.");
//         return { error: "Invalid Pincode", details: null };
//       }
//       const po = data[0].PostOffice?.[0];
//       if (!po) throw new Error("No Post Office found for this pincode");
//       return { country: po.Country, state: po.State, district: po.District };
//     } catch (error) {
//       console.error("Error fetching pincode details:", error.message);
//       toast.error(error.message);
//       return { error: error.message, details: null };
//     }
//   };

//   const handlePincodeChange = async (e) => {
//     const value = e.target.value;
//     setFormData((prevState) => ({
//       ...prevState,
//       pincode: value,
//       district: "",
//       state: "",
//     }));
//     if (value.length > 6) {
//       toast.error("Pincode should be exactly 6 digits.");
//       return;
//     }
//     if (value.length === 6) {
//       const details = await fetchPincodeDetails(value);
//       if (details && !details.error) {
//         setFormData((prev) => ({
//           ...prev,
//           district: details.district || "",
//           state: details.state || "",
//         }));
//       }
//     }
//   };

//   // -------- days calculation ----------
//   const calculateNumberOfDays = (startDate, endDate) => {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     if (start < today) {
//       toast.error("Start date cannot be in the past.");
//       return "";
//     }
//     if (end < today) {
//       toast.error("End date cannot be in the past.");
//       return "";
//     }
//     if (start > end) {
//       toast.error("Start date should be before the end date.");
//       return "";
//     }
//     const timeDiff = end - start;
//     const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
//     return daysDiff >= 0 ? daysDiff : "";
//   };

//   useEffect(() => {
//     if (formData.startDate && formData.endDate) {
//       const days = calculateNumberOfDays(formData.startDate, formData.endDate);
//       setFormData((prev) => ({ ...prev, numberOfDays: days.toString() }));
//     }
//   }, [formData.startDate, formData.endDate]);

//   // -------- validation ----------
//   const validateForm = () => {
//     const newErrors = {};
//     if (!formData.name.trim()) newErrors.name = "It is mandatory.";
//     if (!formData.mobileNumber.trim()) newErrors.mobileNumber = "It is mandatory.";
//     else if (!/^\d+$/.test(formData.mobileNumber)) newErrors.mobileNumber = "must be digits.";
//     if (!formData.primaryTourName) newErrors.primaryTourName = "It is mandatory.";
//     if (!formData.groupType) newErrors.groupType = "It is mandatory.";
//     if (!formData.numberOfPersons) newErrors.numberOfPersons = "It is mandatory.";
//     else if (isNaN(formData.numberOfPersons) || Number(formData.numberOfPersons) <= 0)
//       newErrors.numberOfPersons = "Must be greater than 0.";
//     if (!formData.startDate) newErrors.startDate = "It is mandatory.";
//     if (!formData.endDate) newErrors.endDate = "It is mandatory.";
//     if (!formData.numberOfDays) newErrors.numberOfDays = "It is mandatory.";
//     if (!formData.pincode) newErrors.pincode = "It is mandatory.";
//     if (!formData.district) newErrors.district = "It is mandatory.";
//     if (!formData.state) newErrors.state = "It is mandatory.";
//     if (!formData.clientContactOption) newErrors.clientContactOption = "It is mandatory.";
//     if (!formData.clientType) newErrors.clientType = "It is mandatory.";
//     if (!formData.clientCurrentLocation) newErrors.clientCurrentLocation = "It is mandatory.";
//     if (!formData.connectedThrough) newErrors.connectedThrough = "It is mandatory.";
//     if (!formData.behavior) newErrors.behavior = "It is mandatory.";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // -------- submit ----------
//   const handleCreateClient = async () => {
//     if (!hasPrefill) {
//       toast.error("Open this form from Clients To Create (＋) to create a client.");
//       return;
//     }
//     if (isLoading) return;
//     if (!validateForm()) {
//       toast.error("Please correct the errors in the form.");
//       return;
//     }
//     setIsLoading(true);
//     try {
//       const userData = JSON.parse(localStorage.getItem("user"));
//       const frontOfficerId = userData?._id;
//       const companyId = userData?.companyId;

//       const clientData = {
//         name: formData.name,
//         mobileNumber: formData.mobileNumber,
//         whatsappNumber: formData.whatsappNumber,
//         additionalNumber: formData.additionalNumber,
//         primaryTourName: formData.primaryTourName, // {_id,value,label}
//         tourName: formData.tourName,               // array of {_id,value,label}
//         groupType: formData.groupType,             // {value,label}
//         numberOfPersons: formData.numberOfPersons,
//         startDate: formData.startDate,
//         endDate: formData.endDate,
//         numberOfDays: formData.numberOfDays,
//         pincode: formData.pincode,
//         district: formData.district,
//         state: formData.state,
//         clientContactOption: formData.clientContactOption,
//         clientType: formData.clientType,
//         clientCurrentLocation: formData.clientCurrentLocation,
//         connectedThrough: formData.connectedThrough,
//         behavior: formData.behavior,
//         additionalRequirments: formData.additionalRequirments,
//         gstNumber: formData.gstNumber,
//         frontOfficerId,
//         companyId,
//         clientByEntryId: clientByEntryId,
//       };

//       const response = await fetch(`${BASE_URL}/frontoffice/registerClient`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(clientData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || "Failed to register client");
//       }

//       await response.json();
//       toast.success("Client registered successfully");

//       // optional: clear non-prefilled fields
//       setFormData((s) => ({
//         ...s,
//         whatsappNumber: "",
//         additionalNumber: "",
//         tourName: [],
//         groupType: "",
//         numberOfPersons: "",
//         startDate: "",
//         endDate: "",
//         numberOfDays: "",
//         pincode: "",
//         district: "",
//         state: "",
//         clientContactOption: "",
//         clientType: "",
//         clientCurrentLocation: "",
//         connectedThrough: "",
//         behavior: "",
//         additionalRequirments: "",
//         gstNumber: "",
//       }));
//     } catch (error) {
//       console.error("Failed to register client:", error);
//       toast.error(error.message || "An error occurred while registering the client");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="w-full  p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg mt-1">
//       {!hasPrefill && (
//         <div className="mb-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
//           Open this form from <b>Clients To Create</b> (click the ＋ on a row) to create a client. The submit button is disabled otherwise.
//         </div>
//       )}

//       <form className="grid grid-cols-4 gap-3 p-4 bg-white/20 rounded-lg shadow-lg ">
//         {/* Row 1 */}
//         <div>
//           <input
//             type="text"
//             placeholder="Name"
//             value={formData.name}
//             onChange={(e) => (
//               setFormData({ ...formData, name: e.target.value }),
//               errors.name && setErrors({ ...errors, name: "" })
//             )}
//             className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
//           />
//           {errors.name && (
//             <p style={{ color: "red", fontWeight: "500" }}>{errors.name}</p>
//           )}
//         </div>

//         <div>
//           <input
//             type="text"
//             placeholder="Mobile Number"
//             value={formData.mobileNumber}
//             readOnly
//             onChange={(e) => (
//               setFormData({ ...formData, mobileNumber: e.target.value }),
//               errors.mobileNumber && setErrors({ ...errors, mobileNumber: "" })
//             )}
//             className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
//           />
//           {errors.mobileNumber && (
//             <p style={{ color: "red", fontWeight: "500" }}>
//               {errors.mobileNumber}
//             </p>
//           )}
//         </div>

//         <input
//           type="text"
//           placeholder="WhatsApp Number"
//           value={formData.whatsappNumber}
//           onChange={(e) =>
//             setFormData({ ...formData, whatsappNumber: e.target.value })
//           }
//           className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
//         />

//         <input
//           type="text"
//           placeholder="Additional Number"
//           value={formData.additionalNumber}
//           onChange={(e) =>
//             setFormData({ ...formData, additionalNumber: e.target.value })
//           }
//           className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
//         />

//         {/* Row 2 */}
//         <div>
//           <Select
//             options={destinations}
//             value={formData.primaryTourName}
//             onChange={(selected) => {
//               handleChange(selected, "primaryTourName");
//               if (errors.primaryTourName)
//                 setErrors({ ...errors, primaryTourName: "" });
//             }}
//             placeholder="Select Primary Destination"
//             styles={customStyles}
//             onMenuOpen={fetchDestinations}
//             isLoading={loading}
//           />
//           {errors.primaryTourName && (
//             <p style={{ color: "red", fontWeight: "500" }}>
//               {errors.primaryTourName}
//             </p>
//           )}
//         </div>

//         <div>
//           <Select
//             isMulti
//             options={destinations}
//             value={formData.tourName}
//             onChange={(selected) => {
//               handleChange(selected, "tourName");
//               if (errors.tourName) setErrors({ ...errors, tourName: "" });
//             }}
//             placeholder="Select Add-on Destinations"
//             styles={customStyles}
//             onMenuOpen={fetchDestinations}
//             isLoading={loading}
//           />
//           {errors.tourName && (
//             <p style={{ color: "red", fontWeight: "500" }}>{errors.tourName}</p>
//           )}
//         </div>

//         <div>
//           <Select
//             options={[
//               { value: "Single", label: "Single" },
//               { value: "Couple", label: "Couple" },
//               { value: "Family", label: "Family" },
//               { value: "Friends", label: "Friends" },
//             ]}
//             value={formData.groupType}
//             onChange={(selected) => handleChange(selected, "groupType")}
//             placeholder="Select Group Type"
//             styles={customStyles}
//           />
//           {errors.groupType && (
//             <p style={{ color: "red", fontWeight: "500" }}>
//               {errors.groupType}
//             </p>
//           )}
//         </div>

//         <div>
//           <input
//             type="text"
//             placeholder="Number of Persons"
//             value={formData.numberOfPersons}
//             onChange={(e) =>
//               setFormData({ ...formData, numberOfPersons: e.target.value })
//             }
//             className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
//           />
//           {errors.numberOfPersons && (
//             <p style={{ color: "red", fontWeight: "500" }}>
//               {errors.numberOfPersons}
//             </p>
//           )}
//         </div>

//         <div>
//           <input
//             type="date"
//             value={formData.startDate}
//             onChange={(e) => {
//               setFormData({ ...formData, startDate: e.target.value });
//               if (errors.startDate) setErrors({ ...errors, startDate: "" });
//             }}
//             className="bg-gray-100 border p-3 rounded w-full"
//           />
//           {errors.startDate && (
//             <p style={{ color: "red", fontWeight: "500" }}>
//               {errors.startDate}
//             </p>
//           )}
//         </div>

//         {/* Row 3 */}
//         <div>
//           <input
//             type="date"
//             value={formData.endDate}
//             onChange={(e) => (
//               setFormData({ ...formData, endDate: e.target.value }),
//               errors.endDate && setErrors({ ...errors, endDate: "" })
//             )}
//             className="bg-gray-100 border p-3 rounded w-full"
//           />
//           {errors.endDate && (
//             <p style={{ color: "red", fontWeight: "500" }}>{errors.endDate}</p>
//           )}
//         </div>

//         <input
//           type="text"
//           placeholder="Number of Days"
//           value={formData.numberOfDays}
//           disabled
//           className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
//         />

//         <div>
//           <input
//             type="text"
//             placeholder="Pincode"
//             value={formData.pincode}
//             onChange={handlePincodeChange}
//             className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
//           />
//           {errors.pincode && (
//             <p style={{ color: "red", fontWeight: "500" }}>{errors.pincode}</p>
//           )}
//         </div>

//         <div>
//           <input
//             type="text"
//             placeholder="District"
//             value={formData.district}
//             onChange={(e) => (
//               setFormData({ ...formData, district: e.target.value }),
//               errors.district && setErrors({ ...errors, district: "" })
//             )}
//             className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
//           />
//           {errors.district && (
//             <p style={{ color: "red", fontWeight: "500" }}>{errors.district}</p>
//           )}
//         </div>

//         <div>
//           <input
//             type="text"
//             placeholder="State"
//             value={formData.state}
//             onChange={(e) => (
//               setFormData({ ...formData, state: e.target.value }),
//               errors.state && setErrors({ ...errors, state: "" })
//             )}
//             className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
//           />
//           {errors.state && (
//             <p style={{ color: "red", fontWeight: "500" }}>{errors.state}</p>
//           )}
//         </div>

//         <div>
//           <Select
//             options={[
//               { value: "Phone", label: "Phone" },
//               { value: "Whatsapp", label: "Whatsapp" },
//             ]}
//             value={formData.clientContactOption}
//             onChange={(selected) => (
//               handleChange(selected, "clientContactOption"),
//               errors.clientContactOption &&
//                 setErrors({ ...errors, clientContactOption: "" })
//             )}
//             placeholder="Client Contact Option"
//             styles={customStyles}
//           />
//           {errors.clientContactOption && (
//             <p style={{ color: "red", fontWeight: "500" }}>
//               {errors.clientContactOption}
//             </p>
//           )}
//         </div>

//         <div>
//           <Select
//             options={[
//               { value: "Urgent Contact", label: "Urgent Contact" },
//               { value: "Non-Urgent Contact", label: "Non-Urgent Contact" },
//             ]}
//             value={formData.clientType}
//             onChange={(selected) => (
//               handleChange(selected, "clientType"),
//               errors.clientType && setErrors({ ...errors, clientType: "" })
//             )}
//             placeholder="Client Type"
//             styles={customStyles}
//           />
//           {errors.clientType && (
//             <p style={{ color: "red", fontWeight: "500" }}>
//               {errors.clientType}
//             </p>
//           )}
//         </div>

//         <div>
//           <Select
//             options={[
//               { value: "insider", label: "Insider" },
//               { value: "outsider", label: "Outsider" },
//             ]}
//             value={formData.clientCurrentLocation}
//             onChange={(selected) => (
//               handleChange(selected, "clientCurrentLocation"),
//               errors.clientCurrentLocation &&
//                 setErrors({ ...errors, clientCurrentLocation: "" })
//             )}
//             placeholder="Client Current Location"
//             styles={customStyles}
//           />
//           {errors.clientCurrentLocation && (
//             <p style={{ color: "red", fontWeight: "500" }}>
//               {errors.clientCurrentLocation}
//             </p>
//           )}
//         </div>

//         {/* Row 5 */}
//         <div>
//           <Select
//             options={[
//               { value: "Old Customer", label: "Old Customer" },
//               { value: "Facebook", label: "Facebook" },
//               { value: "Instagram", label: "Instagram" },
//               { value: "Whatsapp", label: "Whatsapp" },
//             ]}
//             value={formData.connectedThrough}
//             onChange={(selected) => (
//               handleChange(selected, "connectedThrough"),
//               errors.connectedThrough &&
//                 setErrors({ ...errors, connectedThrough: "" })
//             )}
//             placeholder="Connected Through"
//             styles={customStyles}
//           />
//           {errors.connectedThrough && (
//             <p style={{ color: "red", fontWeight: "500" }}>
//               {errors.connectedThrough}
//             </p>
//           )}
//         </div>

//         <div>
//           <Select
//             options={[
//               { value: "Polite", label: "Polite" },
//               { value: "Normal", label: "Normal" },
//               { value: "Hard", label: "Hard" },
//               { value: "Educated", label: "Educated" },
//             ]}
//             value={formData.behavior}
//             onChange={(selected) => (
//               handleChange(selected, "behavior"),
//               errors.behavior && setErrors({ ...errors, behavior: "" })
//             )}
//             placeholder="Client Behavior"
//             styles={customStyles}
//           />
//           {errors.behavior && (
//             <p style={{ color: "red", fontWeight: "500" }}>{errors.behavior}</p>
//           )}
//         </div>

//         <textarea
//           placeholder="Additional Requirments"
//           value={formData.additionalRequirments}
//           onChange={(e) =>
//             setFormData({ ...formData, additionalRequirments: e.target.value })
//           }
//           className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 col-span-1"
//         />

//         {/* GST Number Field */}
//         <div className="col-span-4 flex justify-center mt-1">
//           <input
//             type="text"
//             placeholder="GST Number"
//             value={formData.gstNumber}
//             onChange={(e) =>
//               setFormData({ ...formData, gstNumber: e.target.value })
//             }
//             className="bg-gray-100 border border-gray-300 rounded-lg p-1 w-full max-w-md shadow-md text-center focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
//           />
//         </div>

//         {/* Create Client Button */}
//         <div className="col-span-4 flex justify-center mt-1">
//           <button
//             type="button"
//             className={`${
//               hasPrefill ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"
//             } text-white font-semibold w-full py-2 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300`}
//             onClick={handleCreateClient}
//             disabled={isLoading || !hasPrefill}
//           >
//             {isLoading ? "Creating..." : "Create Client"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ClientRegistration;


import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";

const ClientRegistration = ({ prefill, clientByEntryId }) => {
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    whatsappNumber: "",
    additionalNumber: "",
    primaryTourName: null, // react-select option: { _id, value, label }
    tourName: [],
    groupType: "",
    numberOfPersons: "",
    startDate: "",
    endDate: "",
    numberOfDays: "",
    pincode: "",
    district: "",
    state: "",
    clientContactOption: "",
    clientType: "",            // { value, label } or ""
    clientCurrentLocation: "",
    connectedThrough: "",      // { value, label } or ""
    behavior: "",
    additionalRequirments: "",
    gstNumber: "",
  });

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false); // for destinations select
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // submit state

  const hasPrefill =
    !!(prefill && (prefill.mobileNumber || prefill.primaryTourName || prefill.name));

  // options used only when editing is allowed
  const CLIENT_TYPE_OPTS = [
    { value: "Urgent Contact", label: "Urgent Contact" },
    { value: "Non-Urgent Contact", label: "Non-Urgent Contact" },
  ];

  const customStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#f3f4f6",
      borderRadius: "10px",
      boxShadow: state.isFocused ? "0 0 5px rgba(0, 120, 255, 0.5)" : "none",
      border: state.isFocused ? "2px solid #007BFF" : "1px solid #ccc",
      padding: "5px",
      height: "50px",
      display: "flex",
      alignItems: "center",
      overflowX: "auto",
      whiteSpace: "nowrap",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#007BFF" : "white",
      color: state.isFocused ? "white" : "black",
      padding: "10px",
      cursor: "pointer",
      "&:hover": { backgroundColor: "#0056b3", color: "white" },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#007BFF",
      color: "white",
      borderRadius: "5px",
      padding: "3px 5px",
      margin: "2px",
      display: "flex",
      alignItems: "center",
      whiteSpace: "nowrap",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "white",
      padding: "0 5px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "white",
      cursor: "pointer",
      "&:hover": { backgroundColor: "#0056b3", color: "white" },
    }),
    placeholder: (base) => ({ ...base, color: "#aaa", fontSize: "0.9rem" }),
    dropdownIndicator: (base) => ({
      ...base,
      color: "#007BFF",
      "&:hover": { color: "#0056b3" },
    }),
    indicatorSeparator: () => ({ display: "none" }),
    clearIndicator: (base) => ({
      ...base,
      color: "#ccc",
      "&:hover": { color: "#007BFF" },
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      zIndex: 10,
      maxHeight: "100px",
      overflowY: "auto",
    }),
  };

  // -------- destinations ----------
  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.companyId) {
        throw new Error("Company not found in local storage.");
      }
      const response = await fetch(
        `${BASE_URL}/purchaser/getDestinationsName?companyId=${storedUser.companyId}`
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch destinations");
      }
      const data = await response.json();
      const options = data.map((destination) => ({
        _id: destination._id,
        value: destination.value,
        label: destination.label,
      }));
      setDestinations(options);
    } catch (error) {
      console.error("Failed to fetch destinations:", error);
      toast.error(error.message || "An error occurred while fetching destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  // -------- prefill from parent ----------
  useEffect(() => {
    if (hasPrefill) {
      setFormData((s) => ({
        ...s,
        name: prefill.name || "",
        mobileNumber: prefill.mobileNumber || "",
        primaryTourName: prefill.primaryTourName || null, // {_id,value,label}
        connectedThrough: prefill.connectedThrough || "",  // {value,label} or ""
        clientType: prefill.clientType || "",              // {value,label} or ""
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(prefill)]);

  // normalize prefilled clientType to actual option instance when editable
  useEffect(() => {
    const normalize = (opts, v) =>
      !v ? "" : opts.find((o) => o.value === (v.value ?? v)) || v;

    setFormData((s) => ({
      ...s,
      clientType: normalize(CLIENT_TYPE_OPTS, s.clientType),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPrefill]);

  // sync prefilled primaryTourName to actual option object after destinations load
  useEffect(() => {
    if (formData.primaryTourName && destinations.length) {
      const match = destinations.find((d) => d._id === formData.primaryTourName._id);
      if (match) {
        setFormData((s) => ({ ...s, primaryTourName: match }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinations.length]);

  const handleChange = (selectedOption, name) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOption }));
  };

  // -------- pincode autofill ----------
  const fetchPincodeDetails = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (!Array.isArray(data) || !data[0] || data[0].Status !== "Success") {
        toast.error("Invalid Pincode , Please check the pincode.");
        return { error: "Invalid Pincode", details: null };
      }
      const po = data[0].PostOffice?.[0];
      if (!po) throw new Error("No Post Office found for this pincode");
      return { country: po.Country, state: po.State, district: po.District };
    } catch (error) {
      console.error("Error fetching pincode details:", error.message);
      toast.error(error.message);
      return { error: error.message, details: null };
    }
  };

  const handlePincodeChange = async (e) => {
    const value = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      pincode: value,
      district: "",
      state: "",
    }));
    if (value.length > 6) {
      toast.error("Pincode should be exactly 6 digits.");
      return;
    }
    if (value.length === 6) {
      const details = await fetchPincodeDetails(value);
      if (details && !details.error) {
        setFormData((prev) => ({
          ...prev,
          district: details.district || "",
          state: details.state || "",
        }));
      }
    }
  };

  // -------- days calculation ----------
  const calculateNumberOfDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      toast.error("Start date cannot be in the past.");
      return "";
    }
    if (end < today) {
      toast.error("End date cannot be in the past.");
      return "";
    }
    if (start > end) {
      toast.error("Start date should be before the end date.");
      return "";
    }
    const timeDiff = end - start;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    return daysDiff >= 0 ? daysDiff : "";
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = calculateNumberOfDays(formData.startDate, formData.endDate);
      setFormData((prev) => ({ ...prev, numberOfDays: days.toString() }));
    }
  }, [formData.startDate, formData.endDate]);

  // -------- validation ----------
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "It is mandatory.";
    if (!formData.mobileNumber.trim()) newErrors.mobileNumber = "It is mandatory.";
    else if (!/^\d+$/.test(formData.mobileNumber)) newErrors.mobileNumber = "must be digits.";
    if (!formData.primaryTourName) newErrors.primaryTourName = "It is mandatory.";
    if (!formData.groupType) newErrors.groupType = "It is mandatory.";
    if (!formData.numberOfPersons) newErrors.numberOfPersons = "It is mandatory.";
    else if (isNaN(formData.numberOfPersons) || Number(formData.numberOfPersons) <= 0)
      newErrors.numberOfPersons = "Must be greater than 0.";
    if (!formData.startDate) newErrors.startDate = "It is mandatory.";
    if (!formData.endDate) newErrors.endDate = "It is mandatory.";
    if (!formData.numberOfDays) newErrors.numberOfDays = "It is mandatory.";
    if (!formData.pincode) newErrors.pincode = "It is mandatory.";
    if (!formData.district) newErrors.district = "It is mandatory.";
    if (!formData.state) newErrors.state = "It is mandatory.";
    if (!formData.clientContactOption) newErrors.clientContactOption = "It is mandatory.";
    if (!formData.clientType) newErrors.clientType = "It is mandatory.";
    if (!formData.clientCurrentLocation) newErrors.clientCurrentLocation = "It is mandatory.";
    // Connected Through must come from prefill (readonly input)
    if (
      !formData.connectedThrough ||
      !formData.connectedThrough.value ||
      !formData.connectedThrough.label
    ) {
      newErrors.connectedThrough = "Connected Through is mandatory.";
    }
    if (!formData.behavior) newErrors.behavior = "It is mandatory.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------- submit ----------
  const handleCreateClient = async () => {
    if (!hasPrefill) {
      toast.error("Open this form from Clients To Create (＋) to create a client.");
      return;
    }
    if (isLoading) return;
    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }
    setIsLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      const frontOfficerId = userData?._id;
      const companyId = userData?.companyId;

      const clientData = {
        name: formData.name,
        mobileNumber: formData.mobileNumber,
        whatsappNumber: formData.whatsappNumber,
        additionalNumber: formData.additionalNumber,
        primaryTourName: formData.primaryTourName, // {_id,value,label}
        tourName: formData.tourName,               // array of {_id,value,label}
        groupType: formData.groupType,             // {value,label}
        numberOfPersons: formData.numberOfPersons,
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfDays: formData.numberOfDays,
        pincode: formData.pincode,
        district: formData.district,
        state: formData.state,
        clientContactOption: formData.clientContactOption,
        clientType: formData.clientType,                 // {value,label}
        clientCurrentLocation: formData.clientCurrentLocation,
        connectedThrough: formData.connectedThrough,     // {value,label}
        behavior: formData.behavior,
        additionalRequirments: formData.additionalRequirments,
        gstNumber: formData.gstNumber,
        frontOfficerId,
        companyId,
        clientByEntryId: clientByEntryId,
      };

      const response = await fetch(`${BASE_URL}/frontoffice/registerClient`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to register client");
      }

      await response.json();
      toast.success("Client registered successfully");

      // optional: clear non-prefilled fields
      setFormData((s) => ({
        ...s,
        whatsappNumber: "",
        additionalNumber: "",
        tourName: [],
        groupType: "",
        numberOfPersons: "",
        startDate: "",
        endDate: "",
        numberOfDays: "",
        pincode: "",
        district: "",
        state: "",
        clientContactOption: "",
        clientType: s.clientType,             // keep chosen or prefilled
        clientCurrentLocation: "",
        connectedThrough: s.connectedThrough, // keep prefilled
        behavior: "",
        additionalRequirments: "",
        gstNumber: "",
      }));
    } catch (error) {
      console.error("Failed to register client:", error);
      toast.error(error.message || "An error occurred while registering the client");
    } finally {
      setIsLoading(false);
    }
  };

  const fmtErr = (k) =>
    errors[k] ? <p style={{ color: "red", fontWeight: 500 }}>{errors[k]}</p> : null;

  const isUrgentPrefill =
    !!formData.clientType && formData.clientType.value === "Urgent Contact";

  return (
    <div className="w-full  p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg mt-1">
      {!hasPrefill && (
        <div className="mb-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
          Open this form from <b>Clients To Create</b> (click the ＋ on a row) to create a client. The submit button is disabled otherwise.
        </div>
      )}

      <form className="grid grid-cols-4 gap-3 p-4 bg-white/20 rounded-lg shadow-lg ">
        {/* Row 1 */}
        <div>
          <input
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={(e) => (
              setFormData({ ...formData, name: e.target.value }),
              errors.name && setErrors({ ...errors, name: "" })
            )}
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
          {fmtErr("name")}
        </div>

        <div>
          <input
            type="text"
            placeholder="Mobile Number"
            value={formData.mobileNumber}
            readOnly
            onChange={(e) => (
              setFormData({ ...formData, mobileNumber: e.target.value }),
              errors.mobileNumber && setErrors({ ...errors, mobileNumber: "" })
            )}
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
          {fmtErr("mobileNumber")}
        </div>

        <input
          type="text"
          placeholder="WhatsApp Number"
          value={formData.whatsappNumber}
          onChange={(e) =>
            setFormData({ ...formData, whatsappNumber: e.target.value })
          }
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />

        <input
          type="text"
          placeholder="Additional Number"
          value={formData.additionalNumber}
          onChange={(e) =>
            setFormData({ ...formData, additionalNumber: e.target.value })
          }
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />

        {/* Row 2 */}
        <div>
          <Select
            options={destinations}
            value={formData.primaryTourName}
            onChange={(selected) => {
              handleChange(selected, "primaryTourName");
              if (errors.primaryTourName)
                setErrors({ ...errors, primaryTourName: "" });
            }}
            placeholder="Select Primary Destination"
            styles={customStyles}
            onMenuOpen={fetchDestinations}
            isLoading={loading}
          />
          {fmtErr("primaryTourName")}
        </div>

        <div>
          <Select
            isMulti
            options={destinations}
            value={formData.tourName}
            onChange={(selected) => {
              handleChange(selected, "tourName");
              if (errors.tourName) setErrors({ ...errors, tourName: "" });
            }}
            placeholder="Select Add-on Destinations"
            styles={customStyles}
            onMenuOpen={fetchDestinations}
            isLoading={loading}
          />
          {fmtErr("tourName")}
        </div>

        <div>
          <Select
            options={[
              { value: "Single", label: "Single" },
              { value: "Couple", label: "Couple" },
              { value: "Family", label: "Family" },
              { value: "Friends", label: "Friends" },
            ]}
            value={formData.groupType}
            onChange={(selected) => handleChange(selected, "groupType")}
            placeholder="Select Group Type"
            styles={customStyles}
          />
          {fmtErr("groupType")}
        </div>

        <div>
          <input
            type="text"
            placeholder="Number of Persons"
            value={formData.numberOfPersons}
            onChange={(e) =>
              setFormData({ ...formData, numberOfPersons: e.target.value })
            }
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
          {fmtErr("numberOfPersons")}
        </div>

        <div>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => {
              setFormData({ ...formData, startDate: e.target.value });
              if (errors.startDate) setErrors({ ...errors, startDate: "" });
            }}
            className="bg-gray-100 border p-3 rounded w-full"
          />
          {fmtErr("startDate")}
        </div>

        {/* Row 3 */}
        <div>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => (
              setFormData({ ...formData, endDate: e.target.value }),
              errors.endDate && setErrors({ ...errors, endDate: "" })
            )}
            className="bg-gray-100 border p-3 rounded w-full"
          />
          {fmtErr("endDate")}
        </div>

        <input
          type="text"
          placeholder="Number of Days"
          value={formData.numberOfDays}
          disabled
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
        />

        <div>
          <input
            type="text"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handlePincodeChange}
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
          {fmtErr("pincode")}
        </div>

        <div>
          <input
            type="text"
            placeholder="District"
            value={formData.district}
            onChange={(e) => (
              setFormData({ ...formData, district: e.target.value }),
              errors.district && setErrors({ ...errors, district: "" })
            )}
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
          {fmtErr("district")}
        </div>

        <div>
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) => (
              setFormData({ ...formData, state: e.target.value }),
              errors.state && setErrors({ ...errors, state: "" })
            )}
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 w-full"
          />
          {fmtErr("state")}
        </div>

        <div>
          <Select
            options={[
              { value: "Phone", label: "Phone" },
              { value: "Whatsapp", label: "Whatsapp" },
            ]}
            value={formData.clientContactOption}
            onChange={(selected) => (
              handleChange(selected, "clientContactOption"),
              errors.clientContactOption &&
                setErrors({ ...errors, clientContactOption: "" })
            )}
            placeholder="Client Contact Option"
            styles={customStyles}
          />
          {fmtErr("clientContactOption")}
        </div>

        {/* Client Type: read-only input if urgent prefilled, else Select */}
        <div>
          {isUrgentPrefill ? (
            <input
              type="text"
              placeholder="Client Type"
              value="Urgent Contact"
              readOnly
              className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none transition duration-300 w-full"
            />
          ) : (
            <Select
              options={CLIENT_TYPE_OPTS}
              value={formData.clientType || null}
              onChange={(selected) => (
                handleChange(selected, "clientType"),
                errors.clientType && setErrors({ ...errors, clientType: "" })
              )}
              placeholder="Client Type"
              styles={customStyles}
            />
          )}
          {fmtErr("clientType")}
        </div>

        <div>
          <Select
            options={[
              { value: "insider", label: "Insider" },
              { value: "outsider", label: "Outsider" },
            ]}
            value={formData.clientCurrentLocation}
            onChange={(selected) => (
              handleChange(selected, "clientCurrentLocation"),
              errors.clientCurrentLocation &&
                setErrors({ ...errors, clientCurrentLocation: "" })
            )}
            placeholder="Client Current Location"
            styles={customStyles}
          />
          {fmtErr("clientCurrentLocation")}
        </div>

        {/* Connected Through (readonly input, must be prefilled) */}
        <div>
          <input
            type="text"
            placeholder="Connected Through"
            value={
              formData.connectedThrough?.label ??
              formData.connectedThrough?.value ??
              ""
            }
            readOnly
            className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none transition duration-300 w-full"
          />
          {fmtErr("connectedThrough")}
        </div>

        <div>
          <Select
            options={[
              { value: "Polite", label: "Polite" },
              { value: "Normal", label: "Normal" },
              { value: "Hard", label: "Hard" },
              { value: "Educated", label: "Educated" },
            ]}
            value={formData.behavior}
            onChange={(selected) => (
              handleChange(selected, "behavior"),
              errors.behavior && setErrors({ ...errors, behavior: "" })
            )}
            placeholder="Client Behavior"
            styles={customStyles}
          />
          {fmtErr("behavior")}
        </div>

        <textarea
          placeholder="Additional Requirments"
          value={formData.additionalRequirments}
          onChange={(e) =>
            setFormData({ ...formData, additionalRequirments: e.target.value })
          }
          className="bg-gray-100 border border-gray-300 rounded-lg p-3 h-12 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 col-span-1"
        />

        {/* GST Number Field */}
        <div className="col-span-4 flex justify-center mt-1">
          <input
            type="text"
            placeholder="GST Number"
            value={formData.gstNumber}
            onChange={(e) =>
              setFormData({ ...formData, gstNumber: e.target.value })
            }
            className="bg-gray-100 border border-gray-300 rounded-lg p-1 w-full max-w-md shadow-md text-center focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />
        </div>

        {/* Create Client Button */}
        <div className="col-span-4 flex justify-center mt-1">
          <button
            type="button"
            className={`${
              hasPrefill ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"
            } text-white font-semibold w-full py-2 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300`}
            onClick={handleCreateClient}
            disabled={isLoading || !hasPrefill}
          >
            {isLoading ? "Creating..." : "Create Client"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientRegistration;


