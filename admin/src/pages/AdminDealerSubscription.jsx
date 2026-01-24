import React, { useEffect, useState, useRef } from "react";
import {
  Search,
  X,
  Check,
  AlertCircle,
  Calendar,
  CreditCard,
  Users,
  ChevronDown,
  History,
  RefreshCw
} from "lucide-react";

import {
  searchDealers,
  getDealerSubscription,
  getDealerAllSubscriptions,
  getPlans,
  changeDealerPlan,
  deactivateSubscription,
  reactivateSubscription
} from "../api/dealers";

export default function AdminDealerSubscription() {
  const [query, setQuery] = useState("");
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const dropdownRef = useRef(null);

  /* -------------------- Outside Click -------------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* -------------------- Search Dealers -------------------- */
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setDealers([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchDealers(query.trim());
        setDealers(results);
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error("Search error:", error);
        showNotification("Failed to search dealers", "error");
        setDealers([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  /* -------------------- Load Plans -------------------- */
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansData = await getPlans();
        setPlans(plansData);
      } catch (error) {
        console.error("Error loading plans:", error);
        showNotification("Failed to load plans", "error");
      }
    };
    loadPlans();
  }, []);

  /* -------------------- Helpers -------------------- */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenChangePlan = () => {
    setSelectedPlanId(currentSubscription?.plan?._id || "");
    setShowChangePlanModal(true);
  };

  const clearSelection = () => {
    setSelectedDealer(null);
    setCurrentSubscription(null);
    setAllSubscriptions([]);
    setQuery("");
    setShowDropdown(false);
  };

  /* -------------------- Select Dealer -------------------- */
  const selectDealer = async (dealerProfile) => {
    setSelectedDealer(dealerProfile);
    setShowDropdown(false);
    setLoading(true);

    try {
      const sub = await getDealerSubscription(dealerProfile._id);
      setCurrentSubscription(sub);

      const allSubs = await getDealerAllSubscriptions(dealerProfile._id);
      setAllSubscriptions(allSubs);
    } catch (err) {
      console.error(err);
      showNotification("Failed to load subscription", "error");
    }

    setLoading(false);
  };

  /* -------------------- Change Plan -------------------- */
  const handlePlanChange = async () => {
    if (!selectedPlanId || !selectedDealer) return;

    setLoading(true);
    try {
      await changeDealerPlan(selectedDealer._id, selectedPlanId);

      const sub = await getDealerSubscription(selectedDealer._id);
      setCurrentSubscription(sub);

      const allSubs = await getDealerAllSubscriptions(selectedDealer._id);
      setAllSubscriptions(allSubs);

      setShowChangePlanModal(false);
      showNotification("Plan changed successfully");
    } catch (err) {
      console.error(err);
      showNotification(err?.message || "Failed to change plan", "error");
    }

    setLoading(false);
  };

  /* -------------------- Deactivate -------------------- */
  const handleDeactivate = async () => {
    if (!selectedDealer) return;
    if (!confirm("Are you sure?")) return;

    setLoading(true);
    try {
      await deactivateSubscription(selectedDealer._id);

      setCurrentSubscription(null);

      const allSubs = await getDealerAllSubscriptions(selectedDealer._id);
      setAllSubscriptions(allSubs);

      showNotification("Subscription deactivated");
    } catch (err) {
      console.error(err);
      showNotification(err?.message || "Failed to deactivate", "error");
    }

    setLoading(false);
  };

  /* -------------------- Reactivate -------------------- */
  const handleReactivate = async (subscriptionId) => {
    if (!selectedDealer) return;

    setLoading(true);
    try {
      await reactivateSubscription(selectedDealer._id, subscriptionId);

      const sub = await getDealerSubscription(selectedDealer._id);
      setCurrentSubscription(sub);

      const allSubs = await getDealerAllSubscriptions(selectedDealer._id);
      setAllSubscriptions(allSubs);

      setShowHistoryModal(false);
      showNotification("Subscription reactivated");
    } catch (err) {
      console.error(err);
      showNotification(err?.message || "Failed to reactivate", "error");
    }

    setLoading(false);
  };

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh"
      }}
    >
      {/* Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "16px 24px",
            borderRadius: "8px",
            backgroundColor:
              notification.type === "success" ? "#d4edda" : "#f8d7da",
            color:
              notification.type === "success" ? "#155724" : "#721c24",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontWeight: 500
          }}
        >
          {notification.type === "success" ? (
            <Check size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {notification.message}
        </div>
      )}

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
      >
        <h2
          style={{
            margin: "0 0 8px 0",
            color: "#212529",
            fontSize: "2rem",
            fontWeight: 700
          }}
        >
          Dealer Subscription Management
        </h2>
        <p
          style={{
            margin: "0 0 32px 0",
            color: "#6c757d",
            fontSize: "1rem"
          }}
        >
          Search and manage dealer subscription plans
        </p>

        {/* ================= SEARCH ================= */}
        <div
          style={{ position: "relative", marginBottom: "32px" }}
          ref={dropdownRef}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={20}
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#6c757d"
              }}
            />
            <input
              type="text"
              placeholder="Search by dealer name, ID, email, or company..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "14px 48px",
                fontSize: "1rem",
                border: "2px solid #dee2e6",
                borderRadius: "8px",
                outline: "none"
              }}
              onFocus={() =>
                dealers.length > 0 && setShowDropdown(true)
              }
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setDealers([]);
                  setShowDropdown(false);
                }}
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6c757d"
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* ================= DROPDOWN ================= */}
          {showDropdown && dealers.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "8px",
                backgroundColor: "white",
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                maxHeight: "400px",
                overflowY: "auto",
                zIndex: 100
              }}
            >
              {dealers.map((d) => (
                <div
                  key={d._id}
                  onClick={() => selectDealer(d)}
                  style={{
                    padding: "16px",
                    cursor: "pointer",
                    borderBottom: "1px solid #f1f3f5",
                    backgroundColor:
                      selectedDealer?._id === d._id
                        ? "#e7f3ff"
                        : "transparent"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px"
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "#007bff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 600,
                        fontSize: "1.1rem"
                      }}
                    >
                      {d.firstName[0]}
                      {d.lastName[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {d.firstName} {d.lastName}
                      </div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          color: "#6c757d"
                        }}
                      >
                        {d.email} • {d.rigvay_id}
                      </div>
                      {d.companyName && (
                        <div
                          style={{
                            fontSize: "0.875rem",
                            color: "#868e96"
                          }}
                        >
                          {d.companyName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= SELECTED DEALER ================= */}
        {selectedDealer && (
          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              padding: "24px",
              marginBottom: "32px",
              border: "2px solid #e9ecef"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px"
              }}
            >
              <div>
                <h3>
                  {selectedDealer.firstName}{" "}
                  {selectedDealer.lastName}
                </h3>
                <div style={{ color: "#6c757d" }}>
                  {selectedDealer.rigvay_id} •{" "}
                  {selectedDealer.email}
                </div>
              </div>
              <button
                onClick={clearSelection}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* ================= CURRENT SUBSCRIPTION ================= */}
            {loading ? (
              <div style={{ padding: "40px", color: "#6c757d" }}>
                Loading subscription details...
              </div>
            ) : currentSubscription ? (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "20px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "16px"
                  }}
                >
                  <h4>Current Subscription</h4>
                  <span
                    style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      backgroundColor: "#d4edda",
                      color: "#155724",
                      fontSize: "0.8rem",
                      fontWeight: 600
                    }}
                  >
                    Active
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    marginBottom: "20px"
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#6c757d",
                        fontSize: "0.85rem",
                        marginBottom: "4px"
                      }}
                    >
                      <CreditCard size={16} />
                      Plan Name
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 600
                      }}
                    >
                      {currentSubscription.plan?.name}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#6c757d",
                        fontSize: "0.85rem",
                        marginBottom: "4px"
                      }}
                    >
                      <Users size={16} />
                      Car Limit
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 600
                      }}
                    >
                      {currentSubscription.unlimited
                        ? "Unlimited"
                        : currentSubscription.carLimit}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#6c757d",
                        fontSize: "0.85rem",
                        marginBottom: "4px"
                      }}
                    >
                      <Calendar size={16} />
                      Valid Until
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 600
                      }}
                    >
                      {new Date(
                        currentSubscription.endDate
                      ).toLocaleDateString()}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        color: "#6c757d",
                        fontSize: "0.85rem",
                        marginBottom: "4px"
                      }}
                    >
                      Amount
                    </div>
                    <div
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        color: "#007bff"
                      }}
                    >
                      ₹{currentSubscription.amount}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleOpenChangePlan}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    <ChevronDown size={20} /> Change Plan
                  </button>

                  <button
                    onClick={() => setShowHistoryModal(true)}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "white",
                      color: "#6c757d",
                      border: "2px solid #dee2e6",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    <History size={20} /> History
                  </button>

                  <button
                    onClick={handleDeactivate}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "white",
                      color: "#dc3545",
                      border: "2px solid #dc3545",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: 600
                    }}
                  >
                    Deactivate
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "8px",
                  padding: "40px",
                  textAlign: "center"
                }}
              >
                <AlertCircle
                  size={48}
                  style={{ color: "#ffc107", marginBottom: "16px" }}
                />
                <h4>No Active Subscription</h4>
                <p style={{ color: "#6c757d" }}>
                  This dealer doesn't have an active subscription plan
                </p>
                <button
                  onClick={handleOpenChangePlan}
                  style={{
                    padding: "12px 32px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Assign Plan
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= HISTORY MODAL ================= */}
        {showHistoryModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "32px",
                maxWidth: "800px",
                width: "90%",
                maxHeight: "90vh",
                overflowY: "auto"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "24px"
                }}
              >
                <h3>Subscription History</h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {allSubscriptions.length > 0 ? (
                  allSubscriptions.map((sub) => (
                    <div
                      key={sub._id}
                      style={{
                        padding: "20px",
                        border: sub.active
                          ? "2px solid #28a745"
                          : "1px solid #dee2e6",
                        borderRadius: "8px",
                        backgroundColor: sub.active
                          ? "#f0f9f4"
                          : "white"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "12px"
                        }}
                      >
                        <div>
                          <h4>{sub.planName}</h4>
                          <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                            {sub.razorpayOrderId === "ADMIN_ASSIGNED"
                              ? "Admin Assigned"
                              : `Order: ${sub.razorpayOrderId}`}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "12px",
                              backgroundColor: sub.active
                                ? "#d4edda"
                                : "#f8d7da",
                              color: sub.active
                                ? "#155724"
                                : "#721c24",
                              fontSize: "0.8rem",
                              fontWeight: 600
                            }}
                          >
                            {sub.active ? "Active" : "Inactive"}
                          </span>

                          {!sub.active && sub.endDate > new Date().toISOString() && (
                            <button
                              onClick={() => handleReactivate(sub._id)}
                              disabled={loading}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                fontWeight: 500
                              }}
                            >
                              <RefreshCw size={14} /> Reactivate
                            </button>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: "12px",
                          marginBottom: "12px"
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                            Amount
                          </div>
                          <div style={{ fontWeight: 600 }}>
                            ₹{sub.amount}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                            Car Limit
                          </div>
                          <div style={{ fontWeight: 600 }}>
                            {sub.unlimited ? "Unlimited" : sub.carLimit}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                            Start Date
                          </div>
                          <div style={{ fontWeight: 600 }}>
                            {new Date(sub.startDate).toLocaleDateString()}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "0.8rem", color: "#6c757d" }}>
                            End Date
                          </div>
                          <div style={{ fontWeight: 600 }}>
                            {new Date(sub.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "#6c757d" }}>
                        Created: {new Date(sub.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
                    No subscription history found
                  </div>
                )}
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= CHANGE PLAN MODAL ================= */}
        {showChangePlanModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "32px",
                maxWidth: "900px",
                width: "90%",
                maxHeight: "90vh",
                overflowY: "auto"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "24px"
                }}
              >
                <h3>
                  {currentSubscription ? "Change Plan" : "Assign Plan"}
                </h3>
                <button
                  onClick={() => setShowChangePlanModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  <X size={24} />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px"
                }}
              >
                {plans
                  .filter((plan) => {
                    if (plan.name === "Free Trial") {
                      return !allSubscriptions.some(
                        (s) => s.planName === "Free Trial"
                      );
                    }
                    return true;
                  })
                  .map((plan) => {
                    const isSelected =
                      selectedPlanId === plan._id;
                    const isCurrent =
                      currentSubscription?.plan?._id ===
                      plan._id;

                    return (
                      <div
                        key={plan._id}
                        onClick={() =>
                          !isCurrent &&
                          setSelectedPlanId(plan._id)
                        }
                        style={{
                          padding: "20px",
                          border: isSelected
                            ? "3px solid #007bff"
                            : isCurrent
                            ? "2px solid #28a745"
                            : "2px solid #dee2e6",
                          borderRadius: "12px",
                          cursor: isCurrent
                            ? "not-allowed"
                            : "pointer",
                          backgroundColor: isSelected
                            ? "#e7f3ff"
                            : isCurrent
                            ? "#f0f9f4"
                            : "white",
                          position: "relative",
                          opacity: isCurrent ? 0.7 : 1
                        }}
                      >
                        {isCurrent && (
                          <div
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              padding: "4px 10px",
                              borderRadius: "12px",
                              backgroundColor: "#d4edda",
                              color: "#155724",
                              fontSize: "0.75rem",
                              fontWeight: 600
                            }}
                          >
                            Current
                          </div>
                        )}

                        {isSelected && !isCurrent && (
                          <div
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              backgroundColor: "#007bff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <Check size={16} color="white" />
                          </div>
                        )}

                        <h4>{plan.name}</h4>
                        <div
                          style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#007bff",
                            marginBottom: "16px"
                          }}
                        >
                          ₹{plan.amount}
                          <span
                            style={{
                              fontSize: "1rem",
                              fontWeight: 400,
                              color: "#6c757d"
                            }}
                          >
                            /mo
                          </span>
                        </div>

                        <div style={{ fontSize: "0.9rem" }}>
                          ✓{" "}
                          {plan.unlimited
                            ? "Unlimited cars"
                            : `${plan.carLimit} cars`}
                        </div>
                        <div style={{ fontSize: "0.9rem" }}>
                          ✓ {plan.durationMonths} month
                          {plan.durationMonths > 1 ? "s" : ""}{" "}
                          validity
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px"
                }}
              >
                <button
                  onClick={() => setShowChangePlanModal(false)}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "white",
                    border: "2px solid #dee2e6",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handlePlanChange}
                  disabled={
                    !selectedPlanId ||
                    selectedPlanId ===
                      currentSubscription?.plan?._id ||
                    loading
                  }
                  style={{
                    padding: "12px 24px",
                    backgroundColor:
                      selectedPlanId &&
                      selectedPlanId !==
                        currentSubscription?.plan?._id
                        ? "#007bff"
                        : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor:
                      selectedPlanId &&
                      selectedPlanId !==
                        currentSubscription?.plan?._id
                        ? "pointer"
                        : "not-allowed",
                    fontWeight: 600
                  }}
                >
                  {loading
                    ? "Processing..."
                    : currentSubscription
                    ? "Change Plan"
                    : "Assign Plan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
