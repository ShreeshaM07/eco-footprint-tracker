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
} from "firebase/firestore";

export const CarbonFootprintCalculatorExpenditure = () => {
    const [Eating_out, setEating_out] = useState("");
    const [Car_Maintenance, setCar_Maintenance] = useState("");
    const [clothing, setclothing] = useState("");
    const [Furniture, setFurniture] = useState("");
    const [Domestic_Water, setDomestic_Water] = useState("");
    const [Telephone_Internet, setTelephone_Internet] = useState("");
    const [Computer_Elec, setComputer_Elec] = useState("");
    const [Electrical_Appliances, setElectrical_Appliances] = useState("");
    const [Postage, setPostage] = useState("");
    const [Magazines, setMagazines] = useState("");
    const [Stationary, setStationary] = useState("");
    const [Hair_SelfCare, setHair_SelfCare] = useState("");
    const [Pet_Food, setPet_Food] = useState("");
    const [Hotel_Stays, setHotel_Stays] = useState("");
    const [Insurance, setInsurance] = useState("");
    const [Other, setOther] = useState("");
    let [ExpenditureCarbonFootprint, setExpenditureCarbonFootprint] =
        useState(null);
    const [username, setUsername] = useState("");

    const db = getFirestore();
    const usersCollection = collection(db, "users");
    const navigate = useNavigate();

    const calculateCarbonFootprintExpenditure = async (
        ExpenditureCarbonFootprint
    ) => {
        const newExpenditureData = {
            Eating_out,
            Car_Maintenance,
            clothing,
            Furniture,
            Domestic_Water,
            Telephone_Internet,
            Computer_Elec,
            Electrical_Appliances,
            Postage,
            Magazines,
            Stationary,
            Hair_SelfCare,
            Pet_Food,
            Hotel_Stays,
            Insurance,
            Other,
            ExpenditureCarbonFootprint,
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
                const consumptionExpenditureRef = doc(
                    currentMonthRef,
                    "consumptionExpenditure"
                );

                try {
                    await setDoc(consumptionExpenditureRef, newExpenditureData);
                    console.log(
                        "Carbon footprint data saved to Firestore for the current month ",
                        newExpenditureData
                    );
                    await calculateAndStoreTotal(
                        currentMonthRef,
                        currentMonthYear,
                        userDocRef
                    );
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
    };

    const handleExpenditureCalculate = () => {
        const Eating_outFactor = 0.22;
        const Car_MaintenanceFactor = 0.16;
        const clothingFactor = 0.62;
        const FurnitureFactor = 0.29;
        const Domestic_WaterFactor = 0.19;
        const Telephone_InternetFactor = 0.08;
        const Computer_ElecFactor = 0.29;
        const Electrical_AppliancesFactor = 0.39;
        const PostageFactor = 0.19;
        const MagazinesFactor = 0.62;
        const StationaryFactor = 0.55;
        const Hair_SelfCareFactor = 0.62;
        const Pet_FoodFactor = 0.71;
        const Hotel_StaysFactor = 0.25;
        const InsuranceFactor = 0.62;
        const OtherLegalFactor = 0.47;

        const totalExpenditureCarbonFootprint =
            Eating_out * Eating_outFactor +
            Car_Maintenance * Car_MaintenanceFactor +
            clothing * clothingFactor +
            Furniture * FurnitureFactor +
            Domestic_Water * Domestic_WaterFactor +
            Telephone_Internet * Telephone_InternetFactor +
            Computer_Elec * Computer_ElecFactor +
            Electrical_Appliances * Electrical_AppliancesFactor +
            Postage * PostageFactor +
            Magazines * MagazinesFactor +
            Stationary * StationaryFactor +
            Hair_SelfCare * Hair_SelfCareFactor +
            Pet_Food * Pet_FoodFactor +
            Hotel_Stays * Hotel_StaysFactor +
            Insurance * InsuranceFactor +
            Other * OtherLegalFactor;

        setExpenditureCarbonFootprint(totalExpenditureCarbonFootprint);
        calculateCarbonFootprintExpenditure(totalExpenditureCarbonFootprint);
    };

    return (
      <div className="w-[90%] flex flex-col items-center py-10 mx-[5vw]">
        <div className="w-full pt-5 text:black bg-white font-extrabold sm:text-3xl md:text-4xl lg:text-4xl xl:text-4xl 2xl:text-5xl text-center">
          CarbonFootPrint from Expenditure
        </div>

        <div className="flex flex-row items-center flex-wrap bg-white w-full h-[90%]">
          <div className="flex items-center flex-col w-full h-full lg:w-1/2 lg:mt-[1%] space-y-0 py-20">
            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">Expenditure on Food:</span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  value={Eating_out}
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  onChange={(e) => setEating_out(Number(e.target.value))}
                />
              </label>
            </div>

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on Car Maintenance:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Car_Maintenance}
                  onChange={(e) => setCar_Maintenance(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">Expenditure on clothing:</span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={clothing}
                  onChange={(e) => setclothing(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on furniture:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Furniture}
                  onChange={(e) => setFurniture(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on Domestic Water:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Domestic_Water}
                  onChange={(e) => setDomestic_Water(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on Telephone & Internet:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Telephone_Internet}
                  onChange={(e) =>
                    setTelephone_Internet(Number(e.target.value))
                  }
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on Computer & Electronics:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Computer_Elec}
                  onChange={(e) => setComputer_Elec(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on Electrical Appliances:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Electrical_Appliances}
                  onChange={(e) =>
                    setElectrical_Appliances(Number(e.target.value))
                  }
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on Postage & Couriers:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Postage}
                  onChange={(e) => setPostage(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on Magazines & Books:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Magazines}
                  onChange={(e) => setMagazines(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on Stationary:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Stationary}
                  onChange={(e) => setStationary(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on Hair & Self-care:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  value={Hair_SelfCare}
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  onChange={(e) => setHair_SelfCare(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">Expenditure on Pet Food:</span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Pet_Food}
                  onChange={(e) => setPet_Food(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on Hotel Stays:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Hotel_Stays}
                  onChange={(e) => setHotel_Stays(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on Insurance:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Insurance}
                  onChange={(e) => setInsurance(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <div className="flex flex-wrap flex-row items-center mb-4">
              <span className="mr-2 font-medium">
                Expenditure on Other Legal Services:
              </span>
              <label className="relative block rounded-md border border-gray-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 flex flex-row flex-col items-center ml-2">
                <input
                  type="number"
                  placeholder="In USD"
                  className="block rounded-sm bg-white px-2 py-2 text-sm font-medium group-hover:bg-transparent"
                  value={Other}
                  onChange={(e) => setOther(Number(e.target.value))}
                />
              </label>
            </div>

            <br />

            <button onClick={handleExpenditureCalculate}>
              <a className="group inline-block rounded bg-gradient-to-r from-yellow-300 via-lime-300 to-green-300 p-[2px] hover:text-white focus:outline-none focus:ring active:text-opacity-75">
                <span className="block rounded-sm bg-white px-8 py-3 text-sm font-medium group-hover:bg-transparent">
                  Calculate
                </span>
              </a>
            </button>
            <br />
            {ExpenditureCarbonFootprint !== null && (
              <div className="text-xl font-bold mb-4">
                <p>Your estimated vehicle carbon footprint is: </p>
                {ExpenditureCarbonFootprint} kgCO2 per month
              </div>
            )}
            {calculateCarbonFootprintExpenditure}
          </div>

          <div className="relative h-0 w-0 lg:h-full lg:w-1/2">
            <img src={require("../assets/home.jpg")} />
          </div>
        </div>
      </div>
    );
};

export default CarbonFootprintCalculatorExpenditure;
