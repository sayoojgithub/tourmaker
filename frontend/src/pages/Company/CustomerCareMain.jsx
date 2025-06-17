import React, { useState } from "react";
import CompanyCustomerCares from "./CompanyCustomerCares";
import EditCustomerCareDestinations from "./EditCustomerCareDestination";

const CustomerCareMain = () => {
  const [selectedCustomerCare, setSelectedCustomerCare] = useState(null);

  const handleEdit = (customercare) => {
    setSelectedCustomerCare(customercare);
  };

  const handleBack = () => {
    setSelectedCustomerCare(null);
  };

  return (
    <div className="p-5">
      {selectedCustomerCare ? (
        <EditCustomerCareDestinations customercare={selectedCustomerCare} onBack={handleBack} />
      ) : (
        <CompanyCustomerCares onEdit={handleEdit} />
      )}
    </div>
  );
};

export default CustomerCareMain;
