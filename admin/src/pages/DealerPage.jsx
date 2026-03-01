import React, { useEffect, useRef, useState } from "react";
import DealersTable from "../components/DealersTable";
import {
  getAllDealers,
  getUnapprovedDealers,
  approveDealer,
  searchDealers
} from "../api/dealers";
import "../styles/dealerPage.css";

export default function DealerPage() {
  const [tab, setTab] = useState("all");
  const [dealers, setDealers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  /* ================= LOAD DEALERS ================= */

  const loadDealers = async () => {
    if (tab === "unapproved") {
      const data = await getUnapprovedDealers();
      setDealers(data || []);
      setTotalCount(data?.length || 0);
      setTotalPages(1);
      return;
    }

    const res = await getAllDealers(page, limit, search);
    setDealers(res.data || []);
    setTotalPages(res.pagination?.totalPages || 1);
    setTotalCount(res.pagination?.total || 0);
  };

  useEffect(() => {
    loadDealers();
  }, [page, tab, search]);

  /* ================= SEARCH SUGGESTION ================= */

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const data = await searchDealers(searchInput);
      setSuggestions(data || []);
      setShowSuggestions(true);
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  /* ================= CLICK OUTSIDE ================= */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= HANDLERS ================= */

  const handleApprove = async (id) => {
    await approveDealer(id);
    loadDealers();
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (dealer) => {
    const fullName = `${dealer.firstName} ${dealer.lastName}`;
    setSearchInput(fullName);
    setSearch(fullName);
    setShowSuggestions(false);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setSearchInput("");
    setSuggestions([]);
    setPage(1);
  };

  return (
    <div className="dealer-page">
      <h2>Dealers</h2>

      {/* ================= SEARCH ================= */}
      <div className="search-wrapper" ref={searchRef}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by dealer name, ID, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={() =>
              searchInput.length >= 2 && setShowSuggestions(true)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="search-input"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="suggestions-box">
              {suggestions.map((d) => (
                <div
                  key={d._id}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(d)}
                >
                  <div className="suggestion-name">
                    {d.firstName} {d.lastName}
                  </div>
                  <div className="suggestion-sub">
                    {d.rigvay_id} • {d.email}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleSearch} className="search-btn">
          Search
        </button>

        {search && (
          <button onClick={clearSearch} className="clear-btn">
            Clear
          </button>
        )}
      </div>

      {/* ================= TABS ================= */}

      <div className="tabs">
        <button
          className={tab === "all" ? "tab active" : "tab"}
          onClick={() => {
            setTab("all");
            setPage(1);
          }}
        >
          All Dealers
        </button>

        <button
          className={tab === "unapproved" ? "tab active" : "tab"}
          onClick={() => {
            setTab("unapproved");
            setPage(1);
          }}
        >
          Unapproved Dealers
        </button>
      </div>

      <div className="dealer-count">
        Total Dealers : {totalCount}
      </div>

      <DealersTable dealers={dealers} onApprove={handleApprove} />

      {tab === "all" && !search && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}