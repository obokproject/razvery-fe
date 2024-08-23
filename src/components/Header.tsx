import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
  openLoginModal: () => void; // LoginModal을 열기 위한 함수
}

const Header: React.FC<HeaderProps> = ({
  isLoggedIn,
  onLogout,
  openLoginModal,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <Navbar className="h-100">
      <Container className="h-100 d-flex align-items-center">
        <Navbar.Brand as={Link} to="/">
          <span className="fs-4 d-flex">
            <img
              src="/images/logo-razvery.png"
              alt="logo"
              style={{ height: "76px" }}
            ></img>
            <p className="mb-0 ms-2 d-flex align-items-center">라즈베리</p>
          </span>
        </Navbar.Brand>
        <Nav className="ms-auto">
          {isLoggedIn ? (
            <>
              <Nav.Link as={Link} to="/mypage">
                <img
                  src={`${process.env.PUBLIC_URL}/images/user-profile.png`}
                  alt="Profile"
                  style={{ width: "40px", height: "40px", borderRadius: "50%" }}
                />
              </Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link onClick={openLoginModal}>회원가입</Nav.Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
