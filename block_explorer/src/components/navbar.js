import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import logo from "../media/logo_nt.png";
import { Link } from "react-router-dom";
function NavBar() {
  return (
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand href="#home">
        <img
          alt=""
          src={logo}
          width="50"
          height="50"
          className="d-inline-block align-mid ml-3"
        />{" "}
        ArgoChain
      </Navbar.Brand>
      <ul className="navbar-nav mr-auto mt-2 mt-lg-0">
        <Link to="/" style={{ textDecoration: "none" }}>
          <li className="nav-item active">
            <span className="nav-link">Blockchain</span>
          </li>
        </Link>
        <Link to="/accounts" style={{ textDecoration: "none" }}>
          <li className="nav-item">
            <span className="nav-link">Accounts</span>
          </li>
        </Link>
      </ul>
    </Navbar>
  );
}

export default NavBar;
