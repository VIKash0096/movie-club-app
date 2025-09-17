// Load required modules
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

// Initialize express app
const app = express();
const port = process.env.PORT || 5000;
const endedMoviesRouter = require("./endedMovies");
// Middleware setup
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// MySQL connection setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL database");
  }
});

// Route for user login
app.post("/login", (req, res) => {
  const { loginId, password } = req.body;

  const query = "SELECT * FROM users WHERE login_id = ? AND password = ?";
  db.query(query, [loginId, password], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (results.length > 0) {
      const user = results[0];
      res.json({
        success: true,
        message: "Login successful",
        role: user.role,
        name: user.name,
      });
    } else {
      res.json({ success: false, message: "Invalid login ID or password" });
    }
  });
});
// Route for adding a new admin
app.post("/add-admin", (req, res) => {
  const {
    loginId,
    password,
    name,
    email,
    phone,
  } = req.body;

  const insertAdminQuery = `
    INSERT INTO users 
    (login_id, password, name, email, phone, role)
    VALUES (?, ?, ?, ?, ?, 'admin')
  `;

  db.query(
    insertAdminQuery,
    [
      loginId,
      password,
      name,
      email,
      phone,
    ],
    (err, result) => {
      if (err) {
        console.error("❌ Error adding admin:", err.message);
        return res.status(500).json({ success: false, message: "Failed to add admin" });
      }
      res.status(200).json({ success: true, message: "Admin added successfully" });
    }
  );
});

// Route to add a new movie
app.post("/add-movie", (req, res) => {
  const {
    name,
    starring,
    shows,
    languages,
    venue,
    seats
  } = req.body;

  // Step 1: Check if movie with the same name exists
  const checkQuery = "SELECT * FROM movies WHERE LOWER(name) = LOWER(?)";
  db.query(checkQuery, [name], (err, results) => {
    if (err) {
      console.error("❌ Error checking movie:", err.message);
      return res.status(500).json({ success: false, message: "Server error" });
    }

    if (results.length > 0) {
      // Movie exists, so update the shows count
      const existingMovie = results[0];
      const newShowCount = existingMovie.shows + Number(shows);

      const updateQuery = `
        UPDATE movies 
        SET shows = ?, starring = ?, languages = ?, venue = ?, seats = ?
        WHERE id = ?
      `;
      db.query(updateQuery, [newShowCount, starring, languages, venue, seats, existingMovie.id], (err2) => {
        if (err2) {
          console.error("❌ Error updating movie:", err2.message);
          return res.status(500).json({ success: false, message: "Update failed" });
        }

        res.status(200).json({ success: true, message: "Movie updated successfully" });
      });

    } else {
      // Movie doesn't exist, insert it
      const insertQuery = `
        INSERT INTO movies (name, starring, shows, languages, venue, seats)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      db.query(
        insertQuery,
        [name, starring, shows, languages, venue, seats],
        (err3) => {
          if (err3) {
            console.error("❌ Error adding movie:", err3.message);
            return res.status(500).json({ success: false, message: "Insert failed" });
          }

          res.status(200).json({ success: true, message: "Movie added successfully" });
        }
      );
    }
  });
});


// ✅ Route to fetch all movies (only id and name)
app.get("/movies", (req, res) => {
  const query = "SELECT id, name FROM movies";
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching movies:", err.message);
      return res.status(500).json({ success: false, message: "Failed to fetch movies" });
    }
    res.status(200).json(results); // ✅ return only the array
  });
});
app.get("/available-movies", (req, res) => {
  const query = `
    SELECT m.id, m.name, m.shows, 
           COUNT(ms.id) AS total_uploaded_shows
    FROM movies m
    LEFT JOIN movie_shows ms ON m.id = ms.movie_id
    GROUP BY m.id
    HAVING total_uploaded_shows < m.shows
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching available movies:", err.message);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json(results);
  });
});

// Route to fetch single movie details (for show count)
app.get("/movie/:id", (req, res) => {
  const movieId = req.params.id;
  const query = "SELECT id, name, shows FROM movies WHERE id = ?";
  db.query(query, [movieId], (err, results) => {
    if (err) {
      console.error("❌ Error fetching movie details:", err.message);
      return res.status(500).json({ success: false, message: "Failed to fetch movie details" });
    }
    if (results.length === 0) {
      return res.status(404).json({ success: false, message: "Movie not found" });
    }
    res.status(200).json(results[0]);
  });
}); // You can configure this later to store actual files

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

app.post("/upload-movie-details", upload.single("poster"), (req, res) => {
  const { movieId, dates, timesByDate, trailerUrl } = req.body;
  const poster = req.file;

  if (!movieId || !poster || !dates || !timesByDate || !trailerUrl) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  // Parse JSON strings for dates and times
  const parsedDates = JSON.parse(dates);
  const parsedTimesByDate = JSON.parse(timesByDate);

  // update movies table with poster + trailer
  const updateMovieQuery = `
    UPDATE movies
    SET poster = ?, trailer_url = ?
    WHERE id = ?
  `;

  db.query(updateMovieQuery, [poster.filename, trailerUrl, movieId], (err, result) => {
    if (err) {
      console.error("❌ Error updating movie poster/trailer:", err.message);
      return res.status(500).json({ success: false, message: "Movie update failed" });
    }

    // insert into movie_shows
    const showValues = [];
    parsedDates.forEach(date => {
      const times = parsedTimesByDate[date] || [];
      times.forEach(time => {
        showValues.push([movieId, date, time, trailerUrl, poster.filename, false]);
      });
    });

    const insertShowsQuery = `
      INSERT INTO movie_shows (movie_id, show_date, show_time, trailer_url, poster_filename, is_screening)
      VALUES ?
    `;

    db.query(insertShowsQuery, [showValues], (err2, result2) => {
      if (err2) {
        console.error("❌ Error inserting shows:", err2.message);
        return res.status(500).json({ success: false, message: "Shows insert failed" });
      }
      console.log(`✅ Uploaded movie details for movie_id ${movieId}`);
      return res.json({ success: true });
    });
  });
});
// Route: Get movies that have at least one show scheduled
app.get("/movies-with-shows", (req, res) => {
  const query = `
    SELECT m.id AS movie_id, m.name AS movie_name, ms.show_date, ms.show_time
    FROM movies m
    JOIN movie_shows ms ON m.id = ms.movie_id
    WHERE ms.is_screening = FALSE AND ms.is_ended = FALSE
    ORDER BY m.name, ms.show_date, ms.show_time
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching movies with shows:", err.message);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    // Group shows by movie
    const movieMap = new Map();

    results.forEach((row) => {
      if (!movieMap.has(row.movie_id)) {
        movieMap.set(row.movie_id, {
          id: row.movie_id,
          name: row.movie_name,
          shows: [],
        });
      }

      movieMap.get(row.movie_id).shows.push({
        show_date: row.show_date,
        show_time: row.show_time,
      });
    });

    const groupedMovies = Array.from(movieMap.values());
    res.json(groupedMovies);
  });
});
// ✅ Delete a showtime from movie_shows
app.delete("/delete-showtime", (req, res) => {
  const { movieId, showDate, showTime } = req.body;
  console.log("🔎 Delete params => ", { movieId, showDate, showTime });
  const query = `
    DELETE FROM movie_shows 
    WHERE movie_id = ? AND show_date = ? AND show_time = ?
  `;

  db.query(query, [movieId, showDate, showTime], (err, result) => {
    if (err) {
      console.error("❌ Error deleting showtime:", err.message);
      return res.status(500).json({ success: false, message: "Delete failed" });
    }

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Showtime deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Showtime not found" });
    }
  });
});
app.post("/mark-screening", (req, res) => {
  const { movieId, showDate, showTime } = req.body;

  const query = `
    UPDATE movie_shows
    SET is_screening = TRUE
    WHERE movie_id = ? AND show_date = ? AND show_time = ?
  `;

  db.query(query, [movieId, showDate, showTime], (err, result) => {
    if (err) {
      console.error("❌ Error marking as screening:", err.message);
      return res.status(500).json({ success: false, message: "Failed to mark as screening" });
    }

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Show marked as screening" });
    } else {
      res.status(404).json({ success: false, message: "Showtime not found" });
    }
  });
});
app.get("/screening-movies", (req, res) => {
  const query = `
    SELECT m.id AS movie_id, m.name AS movie_name, ms.show_date, ms.show_time
    FROM movies m
    JOIN movie_shows ms ON m.id = ms.movie_id
    WHERE ms.is_screening = TRUE
    ORDER BY m.name, ms.show_date, ms.show_time
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching screening movies:", err.message);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    // Group by movie
    const movieMap = new Map();
    results.forEach((row) => {
      if (!movieMap.has(row.movie_id)) {
        movieMap.set(row.movie_id, {
          id: row.movie_id,
          name: row.movie_name,
          shows: [],
        });
      }

      movieMap.get(row.movie_id).shows.push({
        show_date: row.show_date,
        show_time: row.show_time,
      });
    });

    const groupedMovies = Array.from(movieMap.values());
    res.json(groupedMovies);
  });
});
const startScreeningTimer = require("./screeningTimer");
startScreeningTimer();
app.use("/ended-movies", endedMoviesRouter);
const employeesRouter = require("./employees")(db);
app.use("/employees", employeesRouter);

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
