import React, { useEffect, useState } from "react";
import CarsTable from "../components/CarsTable";
import {
  getAllCars,
  getUnapprovedCars,
  approveCar,
  rejectCar,
  markSold,
  deleteCar   // ✅ ADD THIS
} from "../api/cars";

export default function CarsPage() {
  const [tab, setTab] = useState("all");
  const [cars, setCars] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCars: 0
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [totalAll, setTotalAll] = useState(0);
  const [totalUnapproved, setTotalUnapproved] = useState(0);

  const loadCars = async (selectedTab = tab, selectedPage = page) => {
    try {
      setLoading(true);

      let res;

      if (selectedTab === "all") {
        res = await getAllCars(selectedPage);
        setTotalAll(res?.pagination?.totalCars || 0);
      } else {
        res = await getUnapprovedCars(selectedPage);
        setTotalUnapproved(res?.pagination?.totalCars || 0);
      }

      setCars(res?.data || []);
      setPagination(res?.pagination || {});
    } catch (err) {
      console.error("Error loading cars:", err);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, [tab, page]);

  const handleApprove = async (id) => {
    await approveCar(id);
    loadCars();
  };

  const handleReject = async (id) => {
    await rejectCar(id);
    loadCars();
  };

  const handleSold = async (id) => {
    await markSold(id);
    loadCars();
  };

  // ✅ DELETE HANDLER
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure?");
    if (!confirmDelete) return;

    await deleteCar(id);
    loadCars();
  };

  return (
    <div className="dealer-page">
      <h2>Cars</h2>

      <div className="tabs">
        <button
          className={tab === "all" ? "tab active" : "tab"}
          onClick={() => {
            setTab("all");
            setPage(1);
          }}
        >
          All Cars ({totalAll})
        </button>

        <button
          className={tab === "unapproved" ? "tab active" : "tab"}
          onClick={() => {
            setTab("unapproved");
            setPage(1);
          }}
        >
          Unapproved Cars ({totalUnapproved})
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <CarsTable
          cars={cars}
          onApprove={handleApprove}
          onReject={handleReject}
          onSold={handleSold}
          onDelete={handleDelete}   // ✅ PASS DELETE
        />
      )}

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Prev
        </button>

        <span>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>

        <button
          disabled={page === pagination.totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}