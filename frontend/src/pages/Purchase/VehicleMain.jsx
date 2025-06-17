import React, { useState } from 'react';
import VehicleForm from './VehicleForm';
import VehicleList from './VehicleList';

const VehicleMain = () => {
  const [showList, setShowList] = useState(false);
 
  return (
    <div className="container mx-auto p-4">
      {!showList ? (
        <VehicleForm
          onNext={() => setShowList(true)}
         
        />
      ) : (
        <VehicleList />
      )}
    </div>
  );
};

export default VehicleMain;
