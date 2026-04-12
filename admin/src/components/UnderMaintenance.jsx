import "./../styles/maintenance.css";
import Logo from "../assets/logo.png";


const UnderMaintenance = ({ title = "Page Under Maintenance", subtitle = "We're working to improve this page. Please check back later and stay tuned!." }) => {
  return (
    <div className="maintenance-wrapper">
      <div className="maintenance-card">

        {/* Brand Logo */}
        <div className="maintenance-logo">
          <img src={Logo} alt="Logo" />
        </div>

        {/* Title */}
        <h2 className="maintenance-title">{title}</h2>

        {/* Subtitle */}
        <p className="maintenance-subtitle">{subtitle}</p>

      </div>
    </div>
  );
};

export default UnderMaintenance;