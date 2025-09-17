import "./AdminPage.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const AdminPage = () => {
  const movieImages = [
    "/movie1.jpg",
    "/movie2.jpg",
    "/movie3.jpg",
    "/movie4.jpg",
    "/movie5.jpg",
    "/movie6.jpg",
    "/movie7.jpg",
    "/movie8.jpg",
    "/movie9.jpg",
    "/movie10.jpg",
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % movieImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? movieImages.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(nextImage, 3000);
    return () => clearInterval(interval);
  }, [isHovered]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="admin-wrapper">
      {/* ✅ Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <span className="admin-title">Welcome to NTPC-Movie-club-Admin page</span>
          <div className="admin-header-right">
            <Link to="/admin" className="nav-link">Home</Link>
            <Link to="/add-admin" className="nav-link">Add-Admin</Link>
            <a className="nav-link" onClick={() => navigate("/")}>Log-Out</a>
            <button className="menu-button" onClick={() => setMenuOpen(true)}>
              &#9776;
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Slide-out menu */}
      {menuOpen && (
        <div className="slide-menu-backdrop">
          <div className="slide-menu" ref={menuRef}>
            <nav className="slide-menu-nav">
              <a href="#">Book Ticket</a>
              <a href="#">Cancel Ticket</a>
              <a href="#">Display Ticket</a>
              <a href="#">Booking Chart (Emp-wise)</a>
              <a href="#">Booking Chart (Seat-wise)</a>
              <a onClick={() => { navigate("/manage-movie"); setMenuOpen(false); }}>Manage Movie</a>
              <a onClick={() => { navigate("/manage-employee"); setMenuOpen(false); }}>Manage Employee</a>
            </nav>
          </div>
        </div>
      )}

      {/* ✅ Main White Content Box */}
      <div className="admin-content-box">
        <h2>Admin Dashboard</h2>
        <p>Welcome! You can manage movie schedules, users, and more from here.</p>

        {/* ✅ Recommended Section */}
        <section className="admin-recommended-section">
          <h3>Recommended Movies</h3>
          <div
            className="admin-carousel-wrapper wide"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {movieImages.map((src, index) => {
              const total = movieImages.length;
              const relPos = (index - currentImage + total) % total;

              let className = "carousel-slide";

              if (relPos === 0) {
                className += " center";
              } else if (relPos === 1) {
                className += " clear-right";
              } else if (relPos === total - 1) {
                className += " clear-left";
              } else if (relPos === 2) {
                className += " semi-clear-right";
              } else if (relPos === total - 2) {
                className += " semi-clear-left";
              } else if (relPos === 3) {
                className += " blurred-right";
              } else if (relPos === total - 3) {
                className += " blurred-left";
              } else {
                className += " hidden";
              }

              return (
                <img
                  key={index}
                  src={src}
                  alt={`Recommended Movie ${index + 1}`}
                  className={className}
                />
              );
            })}

            <button className="carousel-arrow left" onClick={prevImage}>
              &#10094;
            </button>
            <button className="carousel-arrow right" onClick={nextImage}>
              &#10095;
            </button>
          </div>
        </section>
      </div>

      {/* 🎬 Trailer Section (outside white box) */}
      <section className="admin-trailer-section">
        <h3>Movie Trailer</h3>
        <div className="trailer-player-box">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/0WWzgGyAH6Y"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default AdminPage;
