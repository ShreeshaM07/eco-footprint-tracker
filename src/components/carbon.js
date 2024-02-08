import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { FaQuestionCircle } from "react-icons/fa";
import "./common/Tailwind.css";

export const CarbonFootprintCalculator = () => {
  const [electric, setElectric] = useState("");
  const [NaturalGas, setNaturalGas] = useState("");
  const [BioMass, setBioMass] = useState("");
  const [LPG, setLPG] = useState("");
  const [Coal, setCoal] = useState("");
  const [HeatingOil, setHeatingOil] = useState("");
  const [NumberOfPeople, setNumberOfPeople] = useState("");
  let [homeCarbonFootprint, setHomeCarbonFootprint] = useState(null);
  const [username, setUsername] = useState("");
  const [tooltipVisible1, setTooltipVisible1] = useState(false);

  const db = getFirestore();
  const usersCollection = collection(db, "users");
  const navigate = useNavigate();
  
  const toggleTooltip1 = () => {
    setTooltipVisible1(!tooltipVisible1);
  };

  const calculateCarbonFootprint = async (homeCarbonFootprint) => {
    const newCarbonData = {
      electric,
      NaturalGas,
      BioMass,
      LPG,
      Coal,
      HeatingOil,
      NumberOfPeople,
      homeCarbonFootprint,
      timestamp: new Date(),
    };

    const userEmail = sessionStorage.getItem("User Email");
    const userQuery = query(usersCollection, where("email", "==", userEmail));

    try {
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setUsername(userDoc.id || "");

        const userDocRef = doc(usersCollection, userDoc.id);

        // Include year in the current month
        const currentDate = new Date();
        const currentMonthYear = currentDate.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
        const currentMonthRef = collection(userDocRef, currentMonthYear);

        // Use consumptionHome as the document id
        const consumptionHomeRef = doc(currentMonthRef, "consumptionHome");

        try {
          await setDoc(consumptionHomeRef, newCarbonData);
          console.log(
            "Carbon footprint data saved to Firestore for the current month ",
            newCarbonData
          );
          await calculateAndStoreTotal(
            currentMonthRef,
            currentMonthYear,
            userDocRef
          );
          // navigate('/home');
        } catch (error) {
          console.error(
            "Error saving carbon footprint data to Firestore:",
            error
          );
          alert(error.message);
        }
      } else {
        console.log("User not found in Firestore");
        alert("User not found in Firestore");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      alert("Error fetching user data:", error.message);
    }
  };

  async function updateLastUpdated(userdoc) {
    try {
        // Update the lastUpdated field with the current server timestamp
        await updateDoc(userdoc, {
            lastUpdated: new Date()
        });

        console.log('Last updated successfully!');
    } catch (error) {
        console.error('Error updating lastUpdated:', error);
    }
}

  const calculateAndStoreTotal = async (
    currentMonthRef,
    currentMonthYear,
    userDocRef
  ) => {
    const totalDocRef = collection(userDocRef, "Total");
    const totalMYDocRef = doc(totalDocRef, currentMonthYear);

    const querySnapshot = await getDocs(currentMonthRef);

    let totalHome = 0;
    let totalFood = 0;
    let totalVehicle = 0;
    let totalFlight = 0;
    let totalPublicVehicle = 0;
    let totalExpenditure = 0;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      totalHome += data.homeCarbonFootprint || 0;
      totalFood += data.foodCarbonFootprint || 0;
      totalVehicle += data.vehicleCarbonFootprint || 0;
      totalFlight += data.flightCarbonFootprint || 0;
      totalPublicVehicle += data.PublicVehicleCarbonFootprint || 0;
      totalExpenditure += data.ExpenditureCarbonFootprint || 0;
    });

    const totalDocData = {
      totalHome,
      totalFood,
      totalVehicle,
      totalFlight,
      totalPublicVehicle,
      totalExpenditure,
      totalCarbonFootprint:
        totalHome +
        totalFood +
        totalVehicle +
        totalFlight +
        totalPublicVehicle +
        totalExpenditure,
      timestamp: new Date(),
    };

    try {
      await setDoc(totalMYDocRef, totalDocData);
      console.log(
        "Total carbon footprint data saved to Firestore for the current month ",
        totalDocData
      );
    } catch (error) {
      console.error(
        "Error saving total carbon footprint data to Firestore:",
        error
      );
      alert(error.message);
    }
    updateLastUpdated(userDocRef);

  };

  const handleCalculate = (e) => {
    const electricBillFactor = 0.93;
    const NaturalGasFactor = 0.18;
    const BioMassFactor = 0.2;
    const LPGFactor = 3.3;
    const CoalFactor = 2.87;
    const HeatingOilFactor = 3.9;

    let totalFootprint =
      (electric * electricBillFactor +
        NaturalGas * NaturalGasFactor +
        BioMass * BioMassFactor +
        LPG * LPGFactor +
        Coal * CoalFactor +
        HeatingOil * HeatingOilFactor) /
      NumberOfPeople;

    setHomeCarbonFootprint(totalFootprint);
    calculateCarbonFootprint(totalFootprint);
  };

  return (
    <div className="w-[90%] flex flex-col items-center py-10 mx-[5vw]">
      <div className="w-full pt-5 text:black bg-white font-extrabold text-3xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl 2xl:text-5xl text-center z-10">
        Carbon Footprint At Home
      </div>

      <div className="flex flex-row items-center flex-wrap bg-white w-full h-[90%]">
        <p className="w-full pt-5 text:black bg-white  sm:text-xl md:text-xl lg:text-xl xl:text-xl 2xl:text-xl text-center z-10">
              Note: Please fill in the details once a month
              <FaQuestionCircle className="mx-auto"
                onMouseEnter={toggleTooltip1}
                onMouseLeave={toggleTooltip1}
              />
              {tooltipVisible1 && (
                <div className="bg-white p-2 rounded shadow-lg z-10">
                  <div className="flex flex-col z-10">
                    <p className="text-xs">If you wish to update some values in the current month then you will have to update all the fields in the current screen.</p>
                  </div>
                </div>
              )}
        </p>
        <div className="flex items-center flex-col w-full h-full lg:w-1/2 lg:mt-[1%] space-y-0 py-20">
          <div className="flex flex-row items-center justify-center mb-4 mx-3">
            <span className="sm:mr-2 font-medium">Number of members in household :</span>
            
            <label className="relative w-1/2 sm:w-auto block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center -ml-4 sm:ml-2">
              <input
                type="number"
                value={NumberOfPeople}
                placeholder=""
                className="block w-full rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                onChange={(e) => setNumberOfPeople(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="flex flex-row items-center justify-center mb-4">
            <span className="mr-2 font-medium">Electricity :</span>
            <label
              className="relative w-1/2 sm:w-auto block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2"
            >
              <input
                type="number"
                value={electric}
                placeholder="in kWh"
                className="block w-full rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                onChange={(e) => setElectric(Number(e.target.value))}
              />
            </label>
          </div>

          <br />
          <div className="flex flex-row items-center justify-center mb-4">
            <span className="mr-2 font-medium">Natural Gas :</span>
            <label className="relative w-1/2 sm:w-auto block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
              <input
                type="number"
                value={NaturalGas}
                placeholder="in kWh"
                className="block w-full rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                onChange={(e) => setNaturalGas(Number(e.target.value))}
              />
            </label>
          </div>

          <br />

          <div className="flex flex-row items-center justify-center mb-4">
            <span className="mr-2 font-medium">Biomass :</span>
            <label className="relative w-1/2 sm:w-auto block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
              <input
                type="number"
                value={BioMass}
                placeholder="in kg"
                className="block w-full rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                onChange={(e) => setBioMass(Number(e.target.value))}
              />
            </label>
          </div>

          <br />

          <div className="flex flex-row items-center mb-4 justify-center">
            <span className="mr-2 font-medium">Coal :</span>
            <label className="relative w-1/2 sm:w-auto block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
              <input
                type="number"
                value={Coal}
                placeholder="in kg"
                className="block w-full rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                onChange={(e) => setCoal(Number(e.target.value))}
              />
            </label>
          </div>

          <br />

          <div className="flex flex-row items-center mb-4 justify-center">
            <span className="mr-2 font-medium">Heating Oil :</span>
            <label className="relative w-1/2 sm:w-auto block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
              <input
                type="number"
                value={HeatingOil}
                placeholder="in liters"
                className="block w-full rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                onChange={(e) => setHeatingOil(Number(e.target.value))}
              />
            </label>
          </div>

          <br />

          <div className="flex flex-row items-center mb-4 justify-center">
            <span className="mr-2 font-medium">LPG :</span>
            <label className="relative w-1/2 sm:w-auto block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
              <input
                type="number"
                value={LPG}
                placeholder="in kg"
                className="block w-full rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                onChange={(e) => setLPG(Number(e.target.value))}
              />
            </label>
          </div>
          <br />
          <button onClick={handleCalculate}>
            <a className="group inline-block rounded bg-gradient-to-r from-yellow-300 via-lime-300 to-green-300 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75">
              <span className="block rounded-sm bg-white px-8 py-3 text-sm font-medium group-hover:bg-transparent">
                Calculate
              </span>
            </a>
          </button>
          <br />

          {homeCarbonFootprint !== null && (
            <div className="text-xl font-bold mb-4">
              Your estimated carbon footprint is: {homeCarbonFootprint.toFixed(3)} kgCO2
              per month
            </div>
          )}
          {/* {calculateCarbonFootprint} */}
        </div>

        <div className="relative h-0 w-0 lg:h-full lg:w-1/2">
          <img src={require("../assets/home.jpg")} />
        </div>
      </div>
    </div>
  );
};

export default CarbonFootprintCalculator;
