import { useEffect, useState } from "react";
import "../styles/analytics.css";
import { fetchLeadAnalytics } from "../api/analytics";

const AnalyticsPage = () => {
  const [data, setData] = useState({
    leads: [],
    pagination: { page: 1, totalPages: 1 },
    topCars: [],
    topDealers: [],
    dealerStats: [],
  });

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    dealer_rigvay_id: "",
    search: "",
  });

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchLeadAnalytics({ ...filters, page });
      setData(res);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const applyFilters = () => {
    setPage(1);
    loadData();
  };

  const downloadCSV = async () => {
    const token = localStorage.getItem("admin_access_token");

    const query = new URLSearchParams({
      ...filters,
      exportCsv: true,
    });

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/admin/lead-analytics?${query}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics.csv";
    a.click();
  };

  return (
    <div className="analytics-container">
      <h2 className="analytics-title">📊 Lead Analytics</h2>

      {/* FILTER */}
      <div className="filter-box">
        <input type="date" name="startDate" onChange={handleChange} />
        <input type="date" name="endDate" onChange={handleChange} />
        <input name="dealer_rigvay_id" placeholder="Dealer ID" onChange={handleChange} />
        <input name="search" placeholder="Search phone/car" onChange={handleChange} />

        <button onClick={applyFilters}>Apply</button>
        <button className="download-btn" onClick={downloadCSV}>
          ⬇ Download CSV
        </button>
        
      </div>
      {/* <div className="analytics-grid">
        <div className="card">
          <div className="card-header">
            <div className="card-icon icon-car">🚗</div>
            <h3>Top Cars</h3>
          </div>

          {data.topCars.map((c) => (
            <p key={c._id}>
              {c._id} <span>{c.total}</span>
            </p>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon icon-dealer">🏢</div>
            <h3>Top Dealers</h3>
          </div>

          {data.topDealers.map((d) => (
            <p key={d._id}>
              {d.dealer_name} <span>{d.total}</span>
            </p>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-icon icon-stats">📊</div>
            <h3>Dealer Stats</h3>
          </div>

          {data.dealerStats.map((d) => (
            <p key={d._id}>
              {d.dealer_name} | CALL: {d.call_count} | WP: {d.whatsapp_count}
            </p>
          ))}
        </div>
      </div> */}
      {loading && <p className="loading">Loading...</p>}

      {/* TABLE */}
      <div className="analytics-table">
        <div className="table-header">
          <span>User</span>
          <span>Phone</span>
          <span>Car</span>
          <span>Dealer</span>
          <span>Action</span>
          <span>Date</span>
        </div>

        {data.leads.length > 0 ? (
          data.leads.map((item, i) => (
            <div key={i} className="table-row">
              <span>{item.user_name}</span>
              <span>{item.user_phone}</span>

              <span>
                <a href={item.car_url} target="_blank" rel="noreferrer">
                  {item.car_rigvay_id}
                </a>
              </span>

              <span>
                {item.dealer_name}
                <br />
                <small>{item.dealer_rigvay_id}</small>
              </span>

              <span className={`tag ${item.action_type === "CALL" ? "call" : "whatsapp"}`}>
                {item.action_type}
              </span>

              <span>
                {new Date(item.enquiry_date).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p className="no-data">No data found</p>
        )}
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>

        <span>
          {data.pagination.page} / {data.pagination.totalPages}
        </span>

        <button
          disabled={page === data.pagination.totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* ANALYTICS CARDS */}
     
    </div>
  );
};

export default AnalyticsPage;