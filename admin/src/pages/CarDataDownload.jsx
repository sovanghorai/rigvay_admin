import React, { useState } from "react";
import { getFilteredCars } from "../api/cars";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../styles/carDataDownload.css";

export default function CarDataDownload() {
  const [rigvayId, setRigvayId] = useState("");
  const [dealerId, setDealerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [limit, setLimit] = useState(300);

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH DATA ================= */
  const fetchData = async () => {
    setLoading(true);

    const data = await getFilteredCars({
      rigvay_id: rigvayId,
      dealerId,
      startDate,
      limit
    });

    setCars(data);
    setLoading(false);
  };

  /* ================= FORMAT DATE ================= */
  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
  };

  /* ================= PREPARE DATA ================= */
  const prepareData = () =>
    cars.map((car) => ({
      Title: `${car.brand} ${car.model} ${car.year}`,
      Image: car.images?.[0] || "",
      vehicle_offer_id: car.dealer?.rigvay_id,
      Dealer_id: car.dealer?._id,
      offer_description: `${car.type} | ${car.fuelType} | ${car.transmission} | ${car.distance} km | ${car.ownerType} Owner`,
      Price: car.price,
      Fuel: car.fuelType,
      Owner_Type: car.ownerType,
      URL: `https://rigvay.com/detail/${car.carId}`,
      Car_Type: car.type,
      Model_Year: car.year,
      Gear_Type: car.transmission,
      Fuel_Type: car.fuelType,
      Distance_Covered: car.distance,
      Created_Date: formatDate(car.createdAt)
    }));

  /* ================= EXCEL ================= */
  const downloadExcel = () => {
    if (!cars.length) return alert("No data");

    const ws = XLSX.utils.json_to_sheet(prepareData());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Cars");

    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

    saveAs(new Blob([buffer]), "Cars_Data.xlsx");
  };

  /* ================= CSV ================= */
  const downloadCSV = () => {
    if (!cars.length) return alert("No data");

    const ws = XLSX.utils.json_to_sheet(prepareData());
    const csv = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "Cars_Data.csv");
  };

  return (
    <div className="data-page">
      <h2>Data Download</h2>

      <div className="form-grid">
        <input
          placeholder="Rigvay ID"
          value={rigvayId}
          onChange={(e) => setRigvayId(e.target.value)}
        />

        <input
          placeholder="Dealer ID"
          value={dealerId}
          onChange={(e) => setDealerId(e.target.value)}
        />

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="number"
          placeholder="Limit"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />

        <button className="btn-result" onClick={fetchData}>
          {loading ? "Loading..." : "Get Result"}
        </button>

        <button className="btn-excel" onClick={downloadExcel}>
          Download Excel
        </button>

        <button className="btn-csv" onClick={downloadCSV}>
          Download CSV
        </button>
      </div>

      <div className="result-box">
        Total Cars: {cars.length}
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Title</th>
            <th>Price</th>
            <th>Fuel</th>
            <th>Distance</th>
            <th>Created Date</th>
          </tr>
        </thead>

        <tbody>
          {cars.map((car) => (
            <tr key={car._id}>
              <td>
                <img
                  src={car.images?.[0] || ""}
                  alt="car"
                  className="car-img"
                />
              </td>

              <td>{car.brand} {car.model}</td>
              <td>{car.price}</td>
              <td>{car.fuelType}</td>
              <td>{car.distance}</td>
              <td>{formatDate(car.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}