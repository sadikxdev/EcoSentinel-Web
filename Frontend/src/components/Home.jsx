import { NavLink, Outlet, useLocation } from "react-router-dom";
import "../css/home.css";

function Home() {
  const location = useLocation();
  const isWater = location.pathname === "/water";

  return (
    <div className={`quality-layout ${isWater ? "water-theme" : "air-theme"}`}>
      <div className="quality-switch">
        <NavLink to="/air" className="quality-btn">
          Air Quality
        </NavLink>

        <NavLink to="/water" className="quality-btn">
          Water Quality
        </NavLink>
      </div>

      <Outlet />
    </div>
  );
}

export default Home;