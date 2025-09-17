import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Inside your component:
const App: React.FC = () => {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  if (!loginId || !password) {
    toast.warn("Please fill in both Login ID and Password.");
    return;
  }

  try {
    const response = await axios.post("http://localhost:5000/login", {
      loginId,
      password,
    });

    if (response.data.success) {
      const role = response.data.role;
      const name= response.data.name;
      // console.log("✅ Name from backend:", name); 
      toast.success("Login successful!");

      setTimeout(() => {
        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/employee", { state: {name} });
        }
        }, 1500);
    } else {
      toast.error("Invalid login ID or password");
    }
  } catch (error) {
    toast.error("Server error. Please try again.");
  }
};
const carouselImages = [
  "/movie1.jpg",
  "/movie2.jpg",
  "/movie3.jpg",
  "/movie4.jpg",
  "/movie5.jpg",
];
const [isHovered, setIsHovered] = useState(false);

const [currentImage, setCurrentImage] = useState(0);

const prevImage = () => {
  setCurrentImage((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
};

const nextImage = () => {
  setCurrentImage((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
};

useEffect(() => {
  if (isHovered) return; // pause when hovered
  const interval = setInterval(() => {
    setCurrentImage((prev) => (prev + 1) % carouselImages.length);
  }, 3000);

  return () => clearInterval(interval);
}, [isHovered]); // ← add dependency here



  return (
    <div className="wrapper">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>NTPC - TSTPS - Movie Club</h1>
          <p className="sub-text">Only for Movie Club Members</p>
          <p className="chrome-note">Best viewed in Chrome Browser...</p>
        </div>
      </header>

      {/* Login Section */}
      <section className="login-box">
        <div className="login-container">
          <form onSubmit={handleSubmit}>
            <table className="login-table">
              <tbody>
                <tr>
                  <td colSpan={2}>
                    <div className="login-row">
                      <span className="login-label">Login Id:</span>
                      <div className="input-icon">
                        <i className="fas fa-user"></i>
                        <input
                          type="text"
                          placeholder="6 digit Emp Code"
                          value={loginId}
                          onChange={(e) => setLoginId(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td colSpan={2}>
                    <div className="password-row">
                      <span className="login-label">Password:</span>
                      <div className="input-icon">
                        <i className="fas fa-lock"></i>
                        <input
                          type="password"
                          placeholder="E-Apps Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td colSpan={2}>
                    <div className="submit-row">
                      <button className="submit-btn" type="submit">Submit</button>
                      <span className="password-hint">
                        ( To change password, Please access E-Application & change password. )
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      </section>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Navigation Links */}
      <nav className="nav-links">
        <a href="#">About the Application</a>
        <a href="#">Membership Form</a>
        <a href="#">Guest Entry Pass</a>
        <a href="#">Circular</a>
      </nav>

      {/* Movie Details */}
      <section className="movie-section">
        <div className="movie-header">
          <span className="movie-title">Movie Name: </span>
          <span className="movie-name">BOU BUTTU BHUTA</span>
        </div>
        <div className="movie-stars">
          Starring: Babushan Mohanty; Archita; Aparajita Mohanty; Jagannath
        </div>

        <h2 className="movie-table-title">UPCOMING / CURRENT MOVIE DETAILS</h2>

        <table className="movie-table">
          <thead>
            <tr>
              <th>Show Date & Time</th>
              <th>Booking Open Date & Time</th>
              <th>Booking Close Date & Time</th>
              <th>Cancel Date & Time</th>
              <th>No. of Seats Available</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>27-07-2025 18:30:00</td>
              <td>26-07-2025 09:00:00</td>
              <td>27-07-2025 17:30:00</td>
              <td>27-07-2025 17:30:00</td>
              <td>9</td>
            </tr>
            <tr>
              <td>30-07-2025 18:30:00</td>
              <td>26-07-2025 09:00:00</td>
              <td>30-07-2025 17:30:00</td>
              <td>30-07-2025 17:30:00</td>
              <td>36</td>
            </tr>
          </tbody>
        </table>
      </section>

{/* Carousel Section */}
      <section className="movie-carousel-section">
        <div
          className="carousel-wrapper"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {carouselImages.map((src, index) => {
            let className = "carousel-slide";
            if (index === currentImage) className += " active";
            else if (index === (currentImage - 1 + carouselImages.length) % carouselImages.length)
              className += " prev";
            else if (index === (currentImage + 1) % carouselImages.length)
              className += " next";
            else className += " hidden";

            return (
              <img key={index} src={src} alt={`Movie ${index + 1}`} className={className} />
            );
          })}

          <button className="carousel-arrow left" onClick={prevImage}>&#10094;</button>
          <button className="carousel-arrow right" onClick={nextImage}>&#10095;</button>
        </div>
      </section>


      {/* Footer */}
      <footer className="footer-glassy-dark">
        <p>Designed, Developed & Maintained by IT Dept, NTPC, TSTPS, KANHA</p>
      </footer>
    </div>
  );
};

export default App;
