import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import logo from "../media/logo_nt.png";
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
      <Container></Container>
    </Navbar>
  );
}

export default NavBar;
