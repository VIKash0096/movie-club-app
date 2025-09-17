import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AllowTicketBooking.css";

interface Show {
  show_date: string;
  show_time: string;
}

interface MovieWithShows {
  id: number;
  name: string;
  shows: Show[];
}

const AllowTicketBooking: React.FC = () => {
  const [upcomingMovies, setUpcomingMovies] = useState<MovieWithShows[]>([]);
  const [screeningMovies, setScreeningMovies] = useState<MovieWithShows[]>([]);
  const [expandedMovieId, setExpandedMovieId] = useState<number | null>(null);
  const [endedMovies, setEndedMovies] = useState<MovieWithShows[]>([]);

  useEffect(() => {
    fetchUpcomingMovies();
    fetchScreeningMovies();
    fetchEndedMovies(); 
      // Poll every 30 seconds
  const interval = setInterval(() => {
    fetchScreeningMovies();
    fetchEndedMovies();
  }, 30000); // 30,000 ms = 30 sec

  return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const fetchUpcomingMovies = () => {
    axios
      .get("http://localhost:5000/movies-with-shows")
      .then((res) => setUpcomingMovies(res.data))
      .catch((err) => console.error("❌ Failed to load upcoming:", err));
  };

  const fetchScreeningMovies = () => {
    axios
      .get("http://localhost:5000/screening-movies")
      .then((res) => setScreeningMovies(res.data))
      .catch((err) => console.error("❌ Failed to load screening:", err));
  };
  const fetchEndedMovies = () => {
  axios
    .get("http://localhost:5000/ended-movies")
    .then((res) => setEndedMovies(res.data))
    .catch((err) => console.error("❌ Failed to load ended:", err));
 };
  const handleDeleteShow = async (movieId: number, showDate: string, showTime: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this showtime?");
    if (!confirmed) return;

    const rawDate = new Date(showDate);
    const formattedDate = `${rawDate.getFullYear()}-${(rawDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${rawDate.getDate().toString().padStart(2, "0")}`;

    const formattedTime = showTime.length === 5 ? `${showTime}:00` : showTime;

    try {
      const response = await fetch("http://localhost:5000/delete-showtime", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId, showDate: formattedDate, showTime: formattedTime }),
      });

      const data = await response.json();
      if (data.success) {
        alert("✅ Showtime deleted");
        fetchUpcomingMovies();
        fetchScreeningMovies();
      } else {
        alert("❌ " + data.message);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete showtime.");
    }
  };
const handleMoveToScreening = async (movieId: number, showDate: string, showTime: string) => {
  // Format date and time for backend
  const rawDate = new Date(showDate);
  const formattedDate = `${rawDate.getFullYear()}-${(rawDate.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${rawDate.getDate().toString().padStart(2, "0")}`;

  const formattedTime = showTime.length === 5 ? `${showTime}:00` : showTime;

  try {
    const res = await axios.post("http://localhost:5000/mark-screening", {
      movieId,
      showDate: formattedDate,
      showTime: formattedTime,
    });

    if (res.data.success) {
      // 1. Remove the showtime from upcomingMovies
      setUpcomingMovies((prev) =>
        prev
          .map((movie) => {
            if (movie.id !== movieId) return movie;
            const remaining = movie.shows.filter(
              (s) => !(s.show_date === showDate && (s.show_time === showTime || s.show_time === formattedTime))
            );
            return remaining.length > 0 ? { ...movie, shows: remaining } : null;
          })
          .filter((m): m is MovieWithShows => m !== null)
      );

      // 2. Add the showtime to screeningMovies
      setScreeningMovies((prev) => {
        const existing = prev.find((m) => m.id === movieId);
        if (existing) {
          return prev.map((m) =>
            m.id === movieId
              ? {
                  ...m,
                  shows: [...m.shows, { show_date: showDate, show_time: formattedTime }],
                }
              : m
          );
        } else {
          const movie = upcomingMovies.find((m) => m.id === movieId);
          return movie
            ? [...prev, { id: movieId, name: movie.name, shows: [{ show_date: showDate, show_time: formattedTime }] }]
            : prev;
        }
      });
    } else {
      alert("❌ Failed to mark as screening");
    }
  } catch (err) {
    console.error("Mark screening error:", err);
    alert("❌ Error moving to screening");
  }
};


  const renderMovieBlock = (
    movieList: MovieWithShows[],
    section: "upcoming" | "screening"| "ended"
  ) => {
    return movieList.map((movie) => (
      <div className="movie-toggle-block1" key={movie.id}>
        <div
          className="ticket-movie-header"
          onClick={() =>
            setExpandedMovieId(expandedMovieId === movie.id ? null : movie.id)
          }
        >
          <span className="movie-name">{movie.name}</span>
          <button className="dropdown1-toggle">
            {expandedMovieId === movie.id ? "▲" : "▼"}
          </button>
        </div>

        {expandedMovieId === movie.id && (
          <ul className="showtime1-list">
            {movie.shows.map((show, idx) => (
              <li key={idx} className="showtime-row">
                <span>
                  📅 {new Date(show.show_date ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })} {" "}
                  🕒 {new Date(`1970-01-01T${show.show_time}`).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
                <div className="showtime-buttons">
                  <button
                    className="delete-btn"
                    title="Delete show"
                    onClick={() => handleDeleteShow(movie.id, show.show_date, show.show_time)}
                  >
                    🗑️
                  </button>
                  {section === "upcoming" && (
                    <button
                      className="mark-screening-btn"
                      title="Mark as screening"
                      onClick={() => handleMoveToScreening(movie.id, show.show_date, show.show_time)}
                    >
                      🎬
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    ));
  };

  return (
    <div className="ticket-booking-container">
      <h2>🎟️ Allow Ticket Booking</h2>

      <div className="booking-section">
        <h3>📅 Upcoming Movies</h3>
        {upcomingMovies.length === 0 ? (
          <div className="booking-card">No upcoming movies to display yet.</div>
        ) : (
          renderMovieBlock(upcomingMovies, "upcoming")
        )}
      </div>

      <div className="booking-section">
        <h3>🎬 Currently Screening Movies</h3>
        {screeningMovies.length === 0 ? (
          <div className="booking-card">No screening movies available.</div>
        ) : (
          renderMovieBlock(screeningMovies, "screening")
        )}
      </div>

      <div className="booking-section">
        <h3>🏁 Ended Screenings</h3>
        {endedMovies.length === 0 ? (
          <div className="booking-card">No past movies found.</div>
        ) : (
          renderMovieBlock(endedMovies, "ended") // <-- use your existing method
        )}
      </div>
    </div>
  );
};

export default AllowTicketBooking;