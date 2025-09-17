// src/admin/ManageMovie.tsx
import AllowTicketBooking from "./AllowTicketBooking/AllowTicketBooking";
import axios from "axios";
import "./ManageMovie.css";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const ManageMovie = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"add" | "upload" | "allow">("add");
  const [fileName, setFileName] = useState("No file chosen");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [movieList, setMovieList] = useState<{ id: number; name: string; shows: number; total_uploaded_shows: number }[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [timesByDate, setTimesByDate] = useState<{ [date: string]: string[] }>({});
  const [trailerUrl, setTrailerUrl] = useState("");
  const [maxShows, setMaxShows] = useState<number | null>(null);  
// get today date string (YYYY-MM-DD) to block earlier dates
  const todayDate = new Date().toISOString().split("T")[0];
  const fetchAvailableMovies = () => {
  axios.get("http://localhost:5000/available-movies")
    .then((res) => {
      const available = res.data.filter(
        (movie: any) => movie.total_uploaded_shows < movie.shows
      );
      setMovieList(available);
    })
    .catch((err) => console.error("❌ Failed to fetch available movies:", err));
};

 



// Add/Remove/Update time input fields
const addTimeField = (date: string) => {
  setTimesByDate((prev) => ({
    ...prev,
    [date]: [...(prev[date] || []), ""],
  }));
};

const removeTimeField = (date: string, index: number) => {
  setTimesByDate((prev) => ({
    ...prev,
    [date]: prev[date].filter((_, i) => i !== index),
  }));
};

const updateTime = (date: string, index: number, value: string) => {
  setTimesByDate((prev) => ({
    ...prev,
    [date]: prev[date].map((time, i) => (i === index ? value : time)),
  }));
};

const updateDate = (index: number, value: string) => {
  const updatedDates = [...dates];
  const oldDate = dates[index];
  updatedDates[index] = value;
  setDates(updatedDates);

  if (timesByDate[oldDate]) {
    setTimesByDate((prev) => {
      const updated = { ...prev };
      updated[value] = updated[oldDate];
      delete updated[oldDate];
      return updated;
    });
  }
};
  const removeDateField = (index: number) => {
    const toRemove = dates[index];
    setDates((prev) => prev.filter((_, i) => i !== index));
    setTimesByDate((prev) => {
      const updated = { ...prev };
      delete updated[toRemove];
      return updated;
    });
  };
  const getTotalSelectedShows = () => {
  return Object.values(timesByDate).reduce((acc, times) => acc + times.length, 0);
};

  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Load movies for upload form dropdown
useEffect(() => {
  fetchAvailableMovies(); // ✅ call the reusable function
}, []);


  return (
    <div className="admin-wrapper">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-content">
          <span className="admin-title">Welcome to NTPC-Movie-club-Admin page</span>
          <div className="admin-header-right">
            <Link to="/admin" className="nav-link">Home</Link>
            <Link to="/add-admin" className="nav-link">Add-Admin</Link>
            <span className="nav-link" onClick={() => navigate("/")}>Log-Out</span>
            <button className="menu-button" onClick={() => setMenuOpen(true)}>&#9776;</button>
          </div>
        </div>
      </div>

      {/* Slide-out menu */}
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

      {/* Main Content */}
      <div className="admin-content-box">
        <h2>Manage Movie</h2>

        {/* Tabs */}
        <div className="movie-tab-bar">
          <button className={activeTab === "add" ? "active" : ""} onClick={() => setActiveTab("add")}>Add Movie</button>
          <button className={activeTab === "upload" ? "active" : ""} onClick={() => setActiveTab("upload")}>Upload File</button>
          <button className={activeTab === "allow" ? "active" : ""} onClick={() => setActiveTab("allow")}>Allow Ticket Booking</button>
        </div>

        {/* Add Movie Form */}
        {activeTab === "add" && (
          <form
            className="movie-add-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const movieName = (form.elements.namedItem("movieName") as HTMLInputElement).value;
              const starring = (form.elements.namedItem("starring") as HTMLInputElement).value;
              const shows = Number((form.elements.namedItem("shows") as HTMLInputElement).value);
              const languages = (form.elements.namedItem("languages") as HTMLInputElement).value;
              const venue = (form.elements.namedItem("venue") as HTMLInputElement).value;
              const seats = Number((form.elements.namedItem("seats") as HTMLInputElement).value);

              if (!movieName || !starring || !shows || !languages || !venue || !seats) {
                alert("Please fill all fields.");
                return;
              }

              try {
                const response = await fetch("http://localhost:5000/add-movie", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: movieName,
                    starring,
                    shows,
                    languages,
                    venue,
                    seats,
                  }),
                });

                if (!response.ok) {
                  const errorText = await response.text();
                  console.error("Server responded with error:", errorText);
                  alert("❌ Failed to add movie. Server responded with error.");
                  return;
                }

                const data = await response.json();
                if (data.success) {
                  alert("✅ Movie added successfully!");
                  form.reset();
                  fetchAvailableMovies(); // 🔄 refresh dropdown
                } else {
                  alert("❌ Failed to add movie. Try again.");
                }
              } catch (err) {
                console.error("❌ Network or server error:", err);
                alert("❌ Server error, please try again.");
              }
            }}
          >
            <div className="form-grid">
              <div className="form-row">
                <label>🎬 Movie Name</label>
                <input name="movieName" type="text" placeholder="Enter movie name" />
              </div>
              <div className="form-row">
                <label>⭐ Starring</label>
                <input name="starring" type="text" placeholder="Actors / Actresses" />
              </div>
              <div className="form-row">
                <label>🎭 No. of Shows</label>
                <input name="shows" type="number" placeholder="E.g., 4" />
              </div>
              <div className="form-row">
                <label>🌐 Languages</label>
                <input name="languages" type="text" placeholder="E.g., Hindi, English" />
              </div>
              <div className="form-row">
                <label>📍 Venue / Hall</label>
                <input name="venue" type="text" placeholder="E.g., Community Hall" />
              </div>
              <div className="form-row">
                <label>🪑 No. of Seats</label>
                <input name="seats" type="number" placeholder="Total seats" />
              </div>
            </div>
            <button type="submit" className="register-btn">Save Movie</button>
          </form>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <form className="movie-upload-form">
            <div className="form-row">
              <label>🎥 Select Movie</label>
              <select
                value={selectedMovieId}
                onChange={(e) => {
                  const movieId = e.target.value;
                  setSelectedMovieId(movieId);
                  setFileName("No file chosen");
                  setPreviewUrl(null);
                  setDates([]);
                  setTimesByDate({});
                  setTrailerUrl("");

                  // 🧠 Use data already in movieList
                  const selectedMovie = movieList.find(
                    (movie) => movie.id.toString() === movieId
                  );

                  if (selectedMovie) {
                    const remainingShows = selectedMovie.shows - selectedMovie.total_uploaded_shows;
                    setMaxShows(remainingShows);
                  } else {
                    setMaxShows(null);
                  }
                }}
              >
                <option value="">-- Select Movie --</option>
                {movieList.map((movie) => (
                  <option key={movie.id} value={movie.id}>{movie.name}</option>
                ))}
              </select>
            </div>

            {selectedMovieId && (
              <>
                <div className="form-row">
                  <label>🎞️ Upload Poster Image</label>
                  <div className="custom-file-upload">
                    <button
                      type="button"
                      className="choose-file-btn"
                      disabled={fileName !== "No file chosen"}
                      onClick={() => document.getElementById("posterUpload")?.click()}
                    >
                      Choose File
                    </button>
                    <span className="file-name">{fileName}</span>
                    {fileName !== "No file chosen" && (
                      <button
                        type="button"
                        className="clear-file-btn"
                        onClick={() => {
                          setFileName("No file chosen");
                          setPreviewUrl(null);
                          const input = document.getElementById("posterUpload") as HTMLInputElement;
                          if (input) input.value = "";
                        }}
                      >
                        ❌
                      </button>
                    )}
                    <input
                      id="posterUpload"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFileName(file.name);
                          setPreviewUrl(URL.createObjectURL(file));
                        } else {
                          setFileName("No file chosen");
                          setPreviewUrl(null);
                        }
                      }}
                    />
                  </div>
                  <small className="file-note">Max size: 2MB | JPG, PNG formats only</small>
                  {previewUrl && (
                    <div className="image-preview">
                      <img src={previewUrl} alt="Poster Preview" />
                    </div>
                  )}
                </div>

                {/* 🎯 Show Dates + Times */}
                <div className="form-row">
                  <label>🗓️ Select Show Dates</label>
                  {dates.map((date, index) => (
                    <div key={index} className="date-time-group">
                        <input
                        type="date"
                        value={date}
                        min={todayDate}
                        disabled={!!date}
                        onChange={(e) => updateDate(index, e.target.value)}
                        />
                      <button
                        type="button"
                        className="remove-date-btn"
                        onClick={() => removeDateField(index)}
                      >
                        Remove Date
                      </button>

                      <div className="time-inputs">
                        {(timesByDate[date] || []).map((time, i) => (
                          <div key={i} className="time-row">
                           <input
                            type="time"
                            value={time}
                            disabled={!date}
                            min={
                                date === todayDate
                                ? (() => {
                                    const now = new Date();
                                    const hh = String(now.getHours()).padStart(2, "0");
                                    const mm = String(now.getMinutes()).padStart(2, "0");
                                    return `${hh}:${mm}`;
                                    })()
                                : "00:00"
                            }
                            onChange={(e) => {
                                const selectedTime = e.target.value;

                                // Block update if no date selected
                                if (!date) {
                                alert("📅 Please select a date before choosing a time.");
                                return;
                                }

                                // If today, enforce current time cutoff
                                if (date === todayDate) {
                                const now = new Date();
                                const nowMinutes = now.getHours() * 60 + now.getMinutes();
                                const [selHour, selMinute] = selectedTime.split(":").map(Number);
                                const selectedMinutes = selHour * 60 + selMinute;
                                if (selectedMinutes <= nowMinutes) {
                                    alert("⏰ Please select a time after the current time.");
                                    return;
                                }
                                }

                                updateTime(date, i, selectedTime);
                            }}
                            />

                            <button type="button" onClick={() => removeTimeField(date, i)}>Remove</button>
                          </div>
                        ))}
                        <button
                        type="button"
                        className="add-action-btn"
                        disabled={maxShows !== null && getTotalSelectedShows() >= maxShows}
                        onClick={() => addTimeField(date)}
                        >
                        + Add Time
                        </button>
                      </div>
                    </div>
                  ))}
                <button
                type="button"
                className="add-action-btn"
                disabled={maxShows !== null && getTotalSelectedShows() >= maxShows}
                onClick={() => setDates([...dates, ""])}
                >
                + Add Date
                </button>
                </div>

                {/* Trailer YouTube URL */}
                <div className="form-row">
                  <label>📺 Trailer YouTube URL</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    value={trailerUrl}
                    onChange={(e) => setTrailerUrl(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="register-btn"
                  onClick={async () => {
                    if (
                      !selectedMovieId ||
                      fileName === "No file chosen" ||
                      dates.length === 0 ||
                      Object.values(timesByDate).flat().length === 0 ||
                      !trailerUrl
                    ) {
                      alert("❌ Please complete all fields before uploading.");
                      return;
                    }

                    try {
                      const formData = new FormData();
                      formData.append("movieId", selectedMovieId);
                      formData.append("poster", (document.getElementById("posterUpload") as HTMLInputElement)?.files?.[0] || "");
                      formData.append("dates", JSON.stringify(dates));
                      formData.append("timesByDate", JSON.stringify(timesByDate));
                      formData.append("trailerUrl", trailerUrl);

                      const res = await axios.post("http://localhost:5000/upload-movie-details", formData, {
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      });

                      if (res.data.success) {
                        alert("✅ Upload successful!");
                        setSelectedMovieId("");
                        setFileName("No file chosen");
                        setPreviewUrl(null);
                        setDates([]);
                        setTimesByDate({});
                        setTrailerUrl("");
                        fetchAvailableMovies(); 
                      } else {
                        alert("❌ Upload failed. Try again.");
                      }
                    } catch (error) {
                      console.error("Upload error:", error);
                      alert("❌ Upload failed due to server error.");
                    }
                  }}
                >
                  Upload
                </button>

              </>
            )}
          </form>
        )}
        {activeTab === "allow" && <AllowTicketBooking />}
      </div>
    </div>
  );
};

export default ManageMovie;
