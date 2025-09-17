const express = require("express");
const router = express.Router();
const db = require("./db");

// GET /ended-movies
router.get("/", (req, res) => {
  const query = `
    SELECT m.id AS movie_id, m.name AS movie_name, ms.show_date, ms.show_time
    FROM movies m
    JOIN movie_shows ms ON m.id = ms.movie_id
    WHERE ms.is_ended = TRUE
    ORDER BY m.name, ms.show_date, ms.show_time
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Error fetching ended movies:", err.message);
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
        show_date: row.show_date.toISOString().split("T")[0],
        show_time: row.show_time,
      });
    });

    res.json(Array.from(movieMap.values()));
  });
});

module.exports = router;
