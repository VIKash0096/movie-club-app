import "./AdminPage.css";
import "./AddAdmin.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddAdmin = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
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

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      loginId,
      password,
      name,
      email,
      phone,
    };

    try {
      const response = await fetch("http://localhost:5000/add-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Admin added successfully!");
        setTimeout(() => navigate("/admin"), 2000);
      } else {
        toast.error("Failed to add admin. Try again.");
      }
    } catch (error) {
      toast.error("Server error. Please try again.");
      console.error("Error:", error);
    }
  };

  return (
    <div className="admin-wrapper">
      {/* ✅ Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <span className="admin-title">Welcome to NTPC-Movie-club-Admin page</span>
          <div className="admin-header-right">
            <Link to="/admin" className="nav-link">Home</Link>
            <Link to="/add-admin" className="nav-link">Add-Admin</Link>
            <span className="nav-link" onClick={() => navigate("/")}>Log-Out</span>
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
              <a href="#">Manage Employee</a>
            </nav>
          </div>
        </div>
      )}

      {/* ✅ White content box */}
      <div className="admin-content-box">
        <h2 className="add-admin-title">Add New Admin</h2>
        <form className="add-admin-form" onSubmit={handleAddAdmin}>
          <div className="form-grid">
            <div className="form-row">
              <label>Login ID</label>
              <input
                type="text"
                placeholder="6-digit Emp Code"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Admin's Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Email ID</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Phone</label>
              <input
                type="tel"
                placeholder="10-digit Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="register-btn">Add Admin</button>
        </form>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AddAdmin;
