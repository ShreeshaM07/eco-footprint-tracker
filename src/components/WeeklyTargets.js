import React, { useState, useEffect } from 'react';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import Header from './common/Header';
import './common/Tailwind.css';

function WeeklyTargets() {
  const [targets, setTargets] = useState({
    publicTransportTarget: 0,
    walkOrCycleTarget: 0,
    vegetarianFoodTarget: 0,
    publicTransportCount: 0,
    walkOrCycleCount: 0,
    vegetarianFoodCount: 0,
    lastResetTimestamp: null,
    lastFilledDate : null,
  });
  const [isEditing, setIsEditing] = useState({
    publicTransportTarget: false,
    walkOrCycleTarget: false,
    plasticUsageTarget: false,
    vegetarianFoodTarget: false,
  });
  const [username, setUsername] = useState('');
  // const [plasticInput, setPlasticInput] = useState('');
  const [formFilledForToday, setFormFilledForToday] = useState(false);

  useEffect(() => {
    const fetchTargets = async () => {
      
    const Username = sessionStorage.getItem('Username');
    if(Username)
    {
        setUsername(Username);
        try {

 

            const db = getFirestore();
            const userDocRef = doc(db, 'weeklytargets', Username);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (shouldResetCounts(data.lastResetTimestamp)) {
              await resetCounts(Username);
              } else {
                setTargets(data);
              }
              if (isFilledForToday(data.lastFilledDate)) {
                setFormFilledForToday(true);
              }
            } else {
              await resetCounts();
            }


      } catch (error) {
        console.error('Error fetching targets:', error);
      }
              }
        else{
            console.log('Username not defined or null');
        } 
    };

    fetchTargets();
  }, []);

  const shouldResetCounts = (timestamp) => {
    if (!timestamp) return true;
    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
    const difference = Date.now() - timestamp.toMillis();
    return difference >= oneWeekInMilliseconds;
  };

//   const setDefaultTargets = async (username) => {
//     const db = getFirestore();
//     if(username!='')
//     {
//         const userDocRef = doc(db, 'weeklytargets', username);
//         const defaultTargets = {
//           publicTransportTarget: 0,
//           walkOrCycleTarget: 0,
//           plasticUsageTarget: 0,
//           vegetarianFoodTarget: 0,
//           publicTransportCount: 0,
//           walkOrCycleCount: 0,
//           plasticUsageCount: 0,
//           vegetarianFoodCount: 0,
//           lastResetTimestamp: new Date(),
//         };
    
//         await setDoc(userDocRef, defaultTargets);
//         setTargets(defaultTargets);
//     }

//   };

  const isFilledForToday = (lastFilledDate) => {
    if (!lastFilledDate) return false; // If lastFilledDate is null, form is not filled for today
    const today = new Date();
    const lastFilledDay = lastFilledDate.toDate();
    return (
      today.getDate() === lastFilledDay.getDate() &&
      today.getMonth() === lastFilledDay.getMonth() &&
      today.getFullYear() === lastFilledDay.getFullYear()
    );
  };
  const resetCounts = async (username) => {
    try {

      const db = getFirestore();
      console.log(username,"username");
      const userDocRef = doc(db, 'weeklytargets', username);
      console.log(userDocRef.path,'path')
      await setDoc(userDocRef, {
        ...targets,
        publicTransportCount: 0,
        walkOrCycleCount: 0,
        plasticUsageCount: 0,
        vegetarianFoodCount: 0,
        lastResetTimestamp: new Date(),
        lastFilledDate: new Date(),
      });
      console.log('Counts reset successfully.');
    } catch (error) {
      console.error('Error resetting counts:', error);
    }
  };

  const handleDropdownChange = (targetName, value) => {
    setTargets(prevTargets => ({
      ...prevTargets,
      [targetName]: value,
    }));
  };

  const handleUpdateTarget = async (targetName) => {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'weeklytargets', username);
      await setDoc(userDocRef, { ...targets, 
        publicTransportCount: 0,
        walkOrCycleCount: 0,
        vegetarianFoodCount: 0,
        lastResetTimestamp: new Date(),
        lastFilledDate : new Date(),
    }, { merge: true });
      console.log('Target updated successfully:', targetName);
      setIsEditing(prevState => ({
        ...prevState,
        [targetName]: false,
      }));
    } catch (error) {
      console.error('Error updating target:', error);
    }
  };

  const handleIncrementCount = async (targetName, value) => {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'weeklytargets', username);
      const countIncrement = value ? 1 : 0; // Increment count if value is true (Yes), otherwise keep it unchanged
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        await setDoc(
          userDocRef,
          {
            ...data, // Include existing data
            [`${targetName}Count`]: data[`${targetName}Count`] + countIncrement,
            lastFilledDate: new Date(),
          },
          { merge: true }
        );
        console.log('Count incremented successfully for:', targetName);
      } else {
        console.error('Document does not exist.');
      }
    } catch (error) {
      console.error('Error incrementing count:', error);
    }
  };
  

  // const handleIncrementPlasticCount = async () => {
  //   try {
  //     const db = getFirestore();
  //     const userDocRef = doc(db, 'weeklytargets', username);
  //     const docSnap = await getDoc(userDocRef);
  //     if (docSnap.exists()) {
  //       const data = docSnap.data();
  //       const newPlasticCount = data.plasticUsageCount + parseInt(plasticInput);
  //       await setDoc(
  //         userDocRef,
  //         {
  //           ...data,
  //           plasticUsageCount: newPlasticCount,
  //           lastFilledDate: new Date(),
  //         },
  //         { merge: true }
  //       );
  //       console.log('Plastic count updated successfully.');
  //     }
  //   } catch (error) {
  //     console.error('Error updating plastic count:', error);
  //   }
  // };
  

  return (
    <div>
      <Header />
      <h2>Weekly Targets</h2>
      <div>
        <div>
          <strong>Use public transport or carpooling to go to work:</strong>{' '}
          {!isEditing.publicTransportTarget ? (
            <>
              {targets.publicTransportTarget}
              <button onClick={() => setIsEditing(prevState => ({ ...prevState, publicTransportTarget: true }))}>Edit</button>
            </>
          ) : (
            <>
              <select value={targets.publicTransportTarget} onChange={(e) => handleDropdownChange('publicTransportTarget', parseInt(e.target.value))}>
                {[...Array(7)].map((_, index) => (
                  <option key={index} value={index + 1}>{index + 1}</option>
                ))}
              </select>
              <button onClick={() => handleUpdateTarget('publicTransportTarget')}>Update</button>
            </>
          )}
        </div>

        <div>
          <strong>Go by walk or cycle/bike for errands within 2-3km radius:</strong>{' '}
          {!isEditing.walkOrCycleTarget ? (
            <>
              {targets.walkOrCycleTarget}
              <button onClick={() => setIsEditing(prevState => ({ ...prevState, walkOrCycleTarget: true }))}>Edit</button>
            </>
          ) : (
            <>
              <select value={targets.walkOrCycleTarget} onChange={(e) => handleDropdownChange('walkOrCycleTarget', parseInt(e.target.value))}>
                {[...Array(7)].map((_, index) => (
                  <option key={index} value={index + 1}>{index + 1}</option>
                ))}
              </select>
              <button onClick={() => handleUpdateTarget('walkOrCycleTarget')}>Update</button>
            </>
          )}
        </div>

        {/* <div>
          <strong>Use of plastic that is not reusable:</strong>{' '}
          {!isEditing.plasticUsageTarget ? (
            <>
              {targets.plasticUsageTarget}
              <button onClick={() => setIsEditing(prevState => ({ ...prevState, plasticUsageTarget: true }))}>Edit</button>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="size-10 leading-10 text-gray-600 transition hover:opacity-75"
                onClick={() => setTargets(prevTargets => ({ ...prevTargets, plasticUsageTarget: prevTargets.plasticUsageTarget - 1 }))}
              >
                -
              </button>

              <input
                type="number"
                id="plasticUsageTarget"
                value={targets.plasticUsageTarget}
                className="h-10 w-24 rounded border-gray-200 sm:text-sm"
                readOnly
              />

              <button
                type="button"
                className="size-10 leading-10 text-gray-600 transition hover:opacity-75"
                onClick={() => setTargets(prevTargets => ({ ...prevTargets, plasticUsageTarget: prevTargets.plasticUsageTarget + 1 }))}
              >
                +
              </button>

              <button onClick={() => handleUpdateTarget('plasticUsageTarget')}>Update</button>
            </div>
          )}
        </div> */}

        <div>
          <strong>Consumption of vegetarian food or low meat food:</strong>{' '}
          {!isEditing.vegetarianFoodTarget ? (
            <>
              {targets.vegetarianFoodTarget}
              <button onClick={() => setIsEditing(prevState => ({ ...prevState, vegetarianFoodTarget: true }))}>Edit</button>
            </>
          ) : (
            <>
              <select value={targets.vegetarianFoodTarget} onChange={(e) => handleDropdownChange('vegetarianFoodTarget', parseInt(e.target.value))}>
                {[...Array(7)].map((_, index) => (
                  <option key={index} value={index + 1}>{index + 1}</option>
                ))}
              </select>
              <button onClick={() => handleUpdateTarget('vegetarianFoodTarget')}>Update</button>
            </>
          )}
        </div>
      </div>
      <div>
        <div>
          <strong>Did you use public transport or carpool to go to work today?</strong>{' '}
          <button onClick={() => handleIncrementCount('publicTransport', true)}>Yes</button>
          <button onClick={() => handleIncrementCount('publicTransport', false)}>No</button>
        </div>

        <div>
          <strong>Did you go by cycle or walk to go by errands within (2 or 3 km) instead of a car or motorcycle?</strong>{' '}
          <button onClick={() => handleIncrementCount('walkOrCycle', true)}>Yes</button>
          <button onClick={() => handleIncrementCount('walkOrCycle', false)}>No</button>
        </div>

        {/* <div>
          <strong>How many plastics did you use today that are not reusable?</strong>{' '}
          <input
            type="number"
            value={plasticInput}
            onChange={(e) => setPlasticInput(e.target.value)}
          />
          <button onClick={handleIncrementPlasticCount}>Update</button>
        </div> */}


        <div>
          <strong>Did you consume only vegetarian or low meat foods today?</strong>{' '}
          <button onClick={() => handleIncrementCount('vegetarianFood', true)}>Yes</button>
          <button onClick={() => handleIncrementCount('vegetarianFood', false)}>No</button>
        </div>

        {/* Add more questions here as needed */}
      </div>
      {formFilledForToday && <p>Filled for the day</p>}
    </div>
  );
}

export default WeeklyTargets;