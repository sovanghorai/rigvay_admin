import { useEffect, useState } from "react";
import "../styles/analytics.css";
import UnderMaintenance from "../components/UnderMaintenance";

const AnalyticsPage = () => {
  const [data, setData] = useState([]);

  // useEffect(() => {
  //   // Replace with your API
  //   fetch("http://localhost:8000/api/car-analytics")
  //     .then((res) => res.json())
  //     .then((res) => setData(res))
  //     .catch((err) => console.error(err));
  // }, []);

  return (
    <UnderMaintenance title="Analytics Coming Soon!"/>
    // <div className="analytics-container">
    //   <h2 className="analytics-title">Car Analytics</h2>

    //   <div className="analytics-table">
    //     <div className="table-header">
    //       <span>Car ID</span>
    //       <span>Name</span>
    //       <span>URL</span>
    //       <span>Clicks</span>
    //     </div>

    //     {data.map((car) => (
    //       <div key={car.id} className="table-row">
    //         <span>{car.id}</span>
    //         <span>{car.name}</span>
    //         <span>
    //           <a href={car.url} target="_blank" rel="noreferrer">
    //             View
    //           </a>
    //         </span>
    //         <span className="click-count">{car.clicks}</span>
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
};

export default AnalyticsPage;