import { useState } from "react";
import "../styles/carsTable.css";
import { getDealerProfile } from "../api/cars";

export default function CarsTable({
  cars = [],
  onApprove,
  onReject,
  onSold,
  onDelete
}) {
  const [previewImg, setPreviewImg] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const getDaysAgo = (date) => {
    if (!date) return "";
    const days = Math.floor(
      (new Date() - new Date(date)) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return "Added today";
    if (days === 1) return "Added yesterday";
    return `Added ${days} days ago`;
  };

  const handleProfileClick = async (dealerId) => {
    try {
      const res = await getDealerProfile(dealerId);
      setProfileData(res?.data?.profile || null);
      setShowProfile(true);
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {cars.length > 0 ? (
              cars.map((car) => {
                const images = car.images?.slice(0, 4) || [];

                return (
                  <tr key={car._id} className={car.status === "sold" ? "sold-row" : ""}>
                    
                    {/* Car */}
                    <td>
                      <strong>{car.brand} {car.model}</strong>
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        {getDaysAgo(car.createdAt)}
                      </div>
                    </td>

                    {/* Images */}
                    <td>
                      <div className="car-images">
                        {images.length > 0 ? (
                          images.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="car"
                              className="car-thumb"
                              onClick={() => setPreviewImg(img)}
                            />
                          ))
                        ) : (
                          <span>No images</span>
                        )}
                      </div>
                    </td>

                    {/* Type */}
                    <td>{car.type || "-"}</td>

                    {/* Price */}
                    <td>₹ {car.price?.toLocaleString("en-IN") || "-"}</td>

                    {/* Fuel */}
                    <td>{car.fuelType || "-"}</td>

                    {/* Transmission */}
                    <td>{car.transmission || "-"}</td>

                    {/* Location */}
                    <td>{car.location || "-"}</td>

                    {/* Distance */}
                    <td>{car.distance || "-"}</td>

                    {/* Registration Year */}
                    <td>{car.registrationYear || "-"}</td>

                    {/* Status */}
                    <td>
                      {car.status === "live" && (
                        <span className="badge approved">Live</span>
                      )}
                      {car.status === "review" && (
                        <span className="badge unapproved">Review</span>
                      )}
                      {car.status === "sold" && (
                        <span className="badge sold">Sold</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="action-buttons">

                      {/* Approve (only if not live) */}
                      {car.status !== "live" && (
                        <button
                          className="btn btn-approve"
                          onClick={() => onApprove(car._id)}
                        >
                          Approve
                        </button>
                      )}

                      {/* Reject (only if live) */}
                      {car.status === "live" && (
                        <button
                          className="btn btn-reject"
                          onClick={() => onReject(car._id)}
                        >
                          Reject
                        </button>
                      )}

                      {/* Sold */}
                      {car.status !== "sold" && (
                        <button
                          className="btn btn-sold"
                          onClick={() => onSold(car._id)}
                        >
                          Sold
                        </button>
                      )}

                      {/* Delete (Always visible) */}
                      <button
                        className="btn btn-delete"
                        onClick={() => onDelete(car._id)}
                      >
                        Delete
                      </button>

                      {/* Profile */}
                      <button
                        className="btn btn-profile"
                        onClick={() => handleProfileClick(car.dealer?._id)}
                      >
                        Profile
                      </button>

                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: "center" }}>
                  No cars found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImg && (
        <div className="modal" onClick={() => setPreviewImg(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <img src={previewImg} alt="preview" style={{ width: "100%" }} />
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="modal" onClick={() => setShowProfile(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Dealer Profile</h3>

            {profileData ? (
              <>
                <img
                  src={profileData.profileImageUrl}
                  alt="profile"
                  className="profile-img"
                />
                <p><strong>Name:</strong> {profileData.firstName} {profileData.lastName}</p>
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Phone:</strong> {profileData.phone}</p>
                <p><strong>Company:</strong> {profileData.companyName}</p>
                <p><strong>State:</strong> {profileData.state}</p>
              </>
            ) : (
              <p>Loading...</p>
            )}

            <button
              className="btn btn-close"
              onClick={() => setShowProfile(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}