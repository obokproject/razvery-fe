import React, { useState } from "react";
import { Container, Row, Col, Dropdown } from "react-bootstrap";
import { Instagram } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [isOpen, setIsOpen] = useState(false);
  const familySites = [
    { name: "TMD", url: "http://tmdedu.com/" },
    { name: "강남구청", url: "https://www.gangnam.go.kr/" },
    { name: "서울시", url: "https://www.seoul.go.kr/" },
  ];
  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <footer className="p-[40px] mt-auto h-[300px] border-t-[1px] border-t-[#323232]">
      <Container>
        <Row className="col-span-2">
          <Col md={8} className="mb-3 flex flex-column justify-between">
            <h5 className="mt-2 mb-4 text-xl">라즈베리</h5>
            <p className="mb-4 text-base">주소:서울시 강남구 역삼로 160 9층</p>
          </Col>
          <Col md={2} className="mb-3">
            <h6 className="mb-4">▼ 바로가기</h6>
            <ul>
              <li>
                <Link
                  to="https://www.instagram.com/razvery_/"
                  className="text-muted"
                >
                  <Instagram />
                </Link>
              </li>
              <li className="mt-4">
                <Link
                  to="/about"
                  className="text-muted"
                  style={{ textDecoration: "none" }}
                >
                  소개
                </Link>
              </li>
            </ul>
          </Col>
          <Col md={2} className="mb-3 mb-md-0">
            <h6 className="mb-4">▼ 법적 고지</h6>
            <ul>
              <li>
                <Link
                  to="https://glitter-juniper-6f6.notion.site/1b776b68933f4879ad42d758f324950a"
                  className="text-muted"
                  style={{ textDecoration: "none" }}
                >
                  이용약관
                </Link>
              </li>
              <li className="mt-4">
                <Link
                  to="https://glitter-juniper-6f6.notion.site/c1627b068c3d4453abe5fc9f56f49eb9"
                  className="text-muted"
                >
                  개인정보처리방침
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
        <div className="flex justify-between items-center pr-[40px]">
          <p className="mb-4 text-sm">
            RazVery &copy; {currentYear} All rights reserved.
          </p>
          <div className="relative">
            {/* 
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 hover:text-gray-300
               "
            >
              <div
                className="p-2 flex items-center bg-[#ffb561] rounded-full"
                style={{ width: "136px" }}
              >
                Family Sites <Plus />
              </div>
            </button>
            
            {isOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-48 rounded-md bg-white">
                {familySites.map((site, index) => (
                  <a
                    key={index}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-gray-700 "
                    style={{ cursor: "pointer", textDecoration: "none" }}
                  >
                    {site.name}
                  </a>
                ))}
              </div>
            )} */}
            <Link
              to="http://tmdedu.com/"
              className="flex items-center p-2 hover:text-gray-300 text-dark
               "
              target="_blank"
              style={{ textDecoration: "none" }}
            >
              <div
                className="p-2 flex items-center bg-[#ffb561] rounded-full  "
                style={{ width: "136px" }}
              >
                Family Sites <Plus />
              </div>
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
