import { NavLink } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <NavLink to="/" className="nav-logo">
        <span className="logo-mark">
          G<span>↗</span>
        </span>
        Give<span>Flow</span>
        <b>DONATION MANAGEMENT</b>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/campaigns">Campaigns</NavLink>
        <NavLink to="/donors">Donors</NavLink>
        <NavLink to="/history">History</NavLink>
        <NavLink to="/donate" className="nav-cta">
          ＋ Record donation
        </NavLink>
      </div>
    </nav>
  );
}
export default Navbar;
