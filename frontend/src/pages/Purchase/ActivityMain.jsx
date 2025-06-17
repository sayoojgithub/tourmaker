import React, { useState } from 'react'
import ActivityForm from './ActivityForm'
import ActivityList from './ActivityList'
const ActivityMain = () => {
  const [showList, setShowList] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const handleNext = (id = null) =>{
    if (id) {
      setSelectedActivity(id)
    }
    setShowList(false)
  }
  return (
    <div className='container mx-auto p-4'>
    { !showList ? (
      <ActivityForm
        onNext={() => setShowList(true)}
        activityId={selectedActivity}
      />
    ): (
      <ActivityList
       onEdit={handleNext}
       />
    )

    }

    </div>
  )
  

   
  
}

export default ActivityMain