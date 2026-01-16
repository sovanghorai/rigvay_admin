import { useState } from "react";
import "../styles/CarsTable.css";

export default function CarsTable({ cars, onApprove }) {
  const [previewImg, setPreviewImg] = useState(null);
  const getDaysAgo = (date) => {
    if (!date) return { text: "", className: "" };
    const days = Math.floor(
      (new Date() - new Date(date)) / (1000 * 60 * 60 * 24),
    );
    if (days === 0) {
      return { text: "Added today", className: "today" };
    }
    if (days === 1) {
      return { text: "Added yesterday", className: "yesterday" };
    }
    return { text: `Added ${days} days ago`, className: "old" };
  };

  return (
    <>
      <div className="dealers-table-wrap">
        <table className="dealers-table">
          <thead>
            <tr>
              <th>Car</th>
              <th>Images</th>
              <th>Type</th>
              <th>Price</th>
              <th>Fuel</th>
              <th>Transmission</th>
              <th>Location</th>
              <th>Distance (km)</th>
              <th>Reg. Year</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {cars && cars.length ? (
              cars.map((car) => {
                const daysInfo = getDaysAgo(car.createdAt);
                const images = car.images?.slice(0, 10) || [];
                const distanceInKm = car.distance
                  ? (car.distance).toLocaleString("en-IN")
                  : "-";

                return (
                  <tr key={car._id}>
                    {/* CAR INFO */}
                    <td>
                      <strong>
                        {car.brand} {car.model}
                      </strong>
                      <div className="car-year">{car.year}</div>
                      <div className={`days-ago ${daysInfo.className}`}>
                        {daysInfo.text}
                      </div>
                    </td>

                    {/* IMAGES */}
                    <td>
                      <div className="car-images">
                        {images.length ? (
                          images.map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt="car"
                              className="car-thumb"
                              onClick={() => setPreviewImg(url)}
                            />
                          ))
                        ) : (
                          <span className="no-images">No images</span>
                        )}
                      </div>
                    </td>

                    <td>{car.type}</td>
                    <td>₹ {car.price?.toLocaleString("en-IN")}</td>
                    <td>{car.fuelType}</td>
                    <td>{car.transmission}</td>

                    {/* NEW FIELDS */}
                    <td>
                      {car.location?.state && car.location?.city
                        ? `${car.location.state}, ${car.location.city}`
                        : car.location?.state
                          ? car.location.state
                          : car.location?.city
                            ? car.location.city
                            : "-"}
                    </td>
                    <td>{distanceInKm}</td>
                    <td>{car.registrationYear || "-"}</td>

                    {/* STATUS */}
                    <td>
                      {car.status === "live" ? (
                        <span className="badge approved">Live</span>
                      ) : (
                        <span className="badge unapproved">{car.status}</span>
                      )}
                    </td>

                    {/* APPROVE BUTTON */}
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
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="empty">
                  No cars found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImg && (
        <div className="image-modal" onClick={() => setPreviewImg(null)}>
          <div className="image-box">
            <img src={previewImg} alt="preview" />
          </div>
        </div>
      )}
    </>
  );
}
