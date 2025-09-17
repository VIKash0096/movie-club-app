const db = require("./db");

function startScreeningTimer() {
  // runs every 60 seconds
  console.log("⏱️ Screening end-check timer started");
  setInterval(() => {
    const now = new Date();

    // format current date/time for MySQL
    const datePart = now.toISOString().split("T")[0];
    const timePart = now.toTimeString().split(" ")[0]; // HH:MM:SS

    const query = `
      UPDATE movie_shows
      SET is_ended = TRUE, is_screening = FALSE
      WHERE 
        is_screening = TRUE
        AND is_ended = FALSE
        AND (
          show_date < ? 
          OR (show_date = ? AND show_time < ?)
        )
    `;

    db.query(query, [datePart, datePart, timePart], (err, result) => {
      if (err) {
        console.error("❌ Error in screening timer:", err.message);
      } else if (result.affectedRows > 0) {
        console.log(`🏁 Moved ${result.affectedRows} shows to ended status`);
      }
    });
  }, 60 * 1000); // runs every 60 sec
}

module.exports = startScreeningTimer;
