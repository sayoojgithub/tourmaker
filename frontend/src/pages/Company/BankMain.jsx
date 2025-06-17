import React, { useState } from 'react';
import AddBankForm from './AddBankForm';
import AddedBanksList from './AddedBanksList';

const BankMain = () => {
  const [showList, setShowList] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  const handleNext = (id = null) => {
    if (id) {
      setSelectedBank(id);
    }
    setShowList(false);
  };

  return (
    <div className="container mx-auto p-4">
      {!showList ? (
        <AddBankForm
          onNext={() => setShowList(true)}
          bankId={selectedBank}
        />
      ) : (
        <AddedBanksList onEdit={handleNext} />
      )}
    </div>
  );
};

export default BankMain;
