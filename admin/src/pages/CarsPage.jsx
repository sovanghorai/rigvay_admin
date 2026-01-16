import React, { useEffect, useState } from "react";
import CarsTable from "../components/CarsTable";
import {
  getAllCars,
  getUnapprovedCars,
  approveCar,
} from "../api/cars";

export default function CarsPage() {
  const [tab, setTab] = useState("all");
  const [cars, setCars] = useState([]);

  const load = async () => {
    if (tab === "all") setCars(await getAllCars());
    else setCars(await getUnapprovedCars());
  };

  useEffect(() => {
    load();
  }, [tab]);

  const handleApprove = async (id) => {
    await approveCar(id);
    load();
  };
  
  
  return (
    <div className="dealer-page">
      <h2>Cars</h2>

      <div className="tabs">
        <button
          className={tab === "all" ? "tab active" : "tab"}
          onClick={() => setTab("all")}
        >
          All Cars
        </button>
        <button
          className={tab === "unapproved" ? "tab active" : "tab"}
          onClick={() => setTab("unapproved")}
        >
          Unapproved Cars
        </button>
      </div>

      <CarsTable cars={cars} onApprove={handleApprove} />
    </div>
  );
}
