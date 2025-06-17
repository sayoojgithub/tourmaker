import React, { useState } from "react";
import CompanyExecutives from "./CompanyExecutives";
import EditExecutiveDestinations from "./EditExecutiveDestinations";

const ExecutiveMain = () => {
  const [selectedExecutive, setSelectedExecutive] = useState(null);

  const handleEdit = (executive) => {
    setSelectedExecutive(executive);
  };

  const handleBack = () => {
    setSelectedExecutive(null);
  };

  return (
    <div className="p-5">
      {selectedExecutive ? (
        <EditExecutiveDestinations executive={selectedExecutive} onBack={handleBack} />
      ) : (
        <CompanyExecutives onEdit={handleEdit} />
      )}
    </div>
  );
};

export default ExecutiveMain;
