import React,{useState} from 'react'
import AddOnTripForm from './AddOnTripForm'
import AddOnTripList from './AddOnTripList'

const AddOnTripMain = () => {
    const [showList, setShowList] = useState(false);
    const [selectedAddOnTrip, setSelectedAddOnTrip] = useState(null);

    const handleNext = (id = null) => {
        if (id) {
            setSelectedAddOnTrip(id);
        }
        setShowList(false)
    }

  return (
    <div className="container mx-auto p-4">
      {!showList ? (
        <AddOnTripForm
          onNext={() => setShowList(true)}
          tripId={selectedAddOnTrip}
        />
      ) : (
        <AddOnTripList onEdit={handleNext} />
      )}
    </div>
  )
}

export default AddOnTripMain