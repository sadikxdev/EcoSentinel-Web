import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import "../css/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  const getPageTitle = () => {
    if (location.pathname === "/dashboard") {
      return "Dashboard";
    }

    if (location.pathname === "/dashboard/upload") {
      return "Upload Image";
    }

    if (location.pathname === "/dashboard/images") {
      return "My Images";
    }

    return "Dashboard";
  };

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">◆</div>

          <div>
            <h2>EcoSentinel</h2>
            <span>Dashboard</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-title">MENU</p>

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">⌂</span>
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/dashboard/upload"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">↑</span>
            <span>Upload Image</span>
          </NavLink>

          <NavLink
            to="/dashboard/images"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">▦</span>
            <span>My Images</span>
          </NavLink>

        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.first_name?.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <strong>
                {user?.first_name} {user?.last_name}
              </strong>

              <span>{user?.email}</span>
            </div>
          </div>

          <button className="sidebar-logout" onClick={handleLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="header-label">WELCOME BACK</p>
            <h1>{getPageTitle()}</h1>
          </div>

          <div className="header-user">
            <span>
              {user?.first_name} {user?.last_name}
            </span>

            <div className="header-avatar">
              {user?.first_name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="dashboard-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default Dashboard;