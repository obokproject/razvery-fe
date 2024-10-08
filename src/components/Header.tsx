import React, { useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link } from "react-router-dom";

interface HeaderProps {
  isLoggedIn: boolean;
  openLoginModal: () => void; // LoginModal을 열기 위한 함수
  profile: string;
}

const Header: React.FC<HeaderProps> = ({
  isLoggedIn,
  openLoginModal,
  profile,
}) => {
  const [imageError, setImageError] = useState(false);
  const handleImageError = () => {
    setImageError(true);
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
            <p className="mb-0 ms-2 d-flex align-items-center text-[40px] font-bold leading-[60px] tracking-wide">
              라즈베리
            </p>
          </span>
        </Navbar.Brand>
        <Nav className="ms-auto">
          {isLoggedIn ? (
            <>
              <Nav.Link as={Link} to="/mypage">
                <img
                  src={(!imageError && profile) || "/images/user-profile.png"}
                  alt="Profile"
                  className="w-[40px] h-[40px] rounded-full object-cover"
                  onError={handleImageError}
                />
              </Nav.Link>
            </>
          ) : (
            <>
              <Nav.Link onClick={openLoginModal}>로그인</Nav.Link>
            </>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;
