import React from "react";
import "../styles/admin.css";

export default function CarsTable({ cars, onApprove }) {
  return (
    <div className="dealers-table-wrap">
      <table className="dealers-table">
        <thead>
          <tr>
            <th>Car</th>
            <th>Type</th>
            <th>Price</th>
            <th>Distance</th>
            <th>Owner</th>
            <th>Location</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {cars && cars.length ? (
            cars.map((car) => (
              <tr key={car._id}>
                {/* CAR INFO */}
                <td>
                  <strong>
                    {car.brand} {car.model}
                  </strong>
                  <div style={{ fontSize: "0.85rem", color: "#667" }}>
                    {car.year} • {car.fuelType} • {car.transmission}
                  </div>
                </td>

                {/* TYPE */}
                <td>{car.type || "-"}</td>

                {/* PRICE */}
                <td>₹ {car.price?.toLocaleString("en-IN")}</td>

                {/* DISTANCE */}
                <td>
                  {car.distance
                    ? `${car.distance.toLocaleString()} km`
                    : "-"}
                </td>

                {/* OWNER TYPE */}
                <td>{car.ownerType || "-"}</td>

                {/* LOCATION */}
                <td>
                  {car.location?.city}, {car.location?.state}
                </td>

                {/* STATUS */}
                <td>
                  {car.status === "live" ? (
                    <span className="badge approved">Live</span>
                  ) : (
                    <span className="badge unapproved">Unapproved</span>
                  )}
                </td>

                {/* ACTION */}
                <td>
                  {car.status !== "live" && (
                    <button
                      className="btn-approve"
                      onClick={() => onApprove(car._id)}
                    >
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="empty">
                No cars found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

