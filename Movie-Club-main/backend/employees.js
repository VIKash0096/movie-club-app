const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // Add employee
  router.post("/add", (req, res) => {
    const { loginId, password, name, email, phone, status } = req.body;
    if (!loginId || !password || !name || !email || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const sql = "INSERT INTO users (login_id, password, name, email, phone, status, role) VALUES (?,?,?,?,?,?, 'employee')";
    db.query(sql, [loginId, password, name, email, phone, status || "active"], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true, id: result.insertId });
    });
  });

  // Update employee status
router.put("/update", (req, res) => {
  const { loginId, name, phone, email, status } = req.body;

  if (!loginId) {
    return res.status(400).json({ success: false, message: "loginId required" });
  }

  const sql = `
    UPDATE users 
    SET name = ?, phone = ?, email = ?, status = ?
    WHERE login_id = ?
  `;

  db.query(sql, [name, phone, email, status, loginId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: result.affectedRows > 0 });
  });
});

  // Add dependant
  router.post("/add-dependant", (req, res) => {
    const { loginId, name, relation, dob, gender } = req.body;
    db.query("SELECT id FROM users WHERE login_id=?", [loginId], (err, results) => {
      if (err || results.length === 0) return res.status(404).json({ success: false, message: "User not found" });

      const userId = results[0].id;
      const sql = "INSERT INTO dependants (user_id, name, relation, dob, gender) VALUES (?,?,?,?,?)";
      db.query(sql, [userId, name, relation, dob, gender], (err2, result) => {
        if (err2) return res.status(500).json({ success: false });
        res.json({ success: true, dependantId: result.insertId });
      });
    });
  });

  // Get dependants for a user
  router.get("/dependants/:loginId", (req, res) => {
    const loginId = req.params.loginId;
    db.query("SELECT id FROM users WHERE login_id=?", [loginId], (err, results) => {
      if (err || results.length === 0) return res.status(404).json({ success: false });
      const userId = results[0].id;
      db.query("SELECT * FROM dependants WHERE user_id=?", [userId], (err2, dependants) => {
        if (err2) return res.status(500).json({ success: false });
        res.json(dependants);
      });
    });
  });
// Update dependant details
router.put("/update-dependant", (req, res) => {
  const { dependantId, name, relation, dob, gender } = req.body;

  if (!dependantId) {
    return res.status(400).json({ success: false, message: "dependantId required" });
  }

  const sql = `
    UPDATE dependants
    SET name = ?, relation = ?, dob = ?, gender = ?
    WHERE id = ?
  `;
  const formattedDob = new Date(dob).toISOString().split("T")[0];
  db.query(sql, [name, relation, formattedDob, gender, dependantId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: result.affectedRows > 0 });
  });
});
// Delete dependant
router.delete("/delete-dependant/:dependantId", (req, res) => {
  const dependantId = req.params.dependantId;

  if (!dependantId) {
    return res.status(400).json({ success: false, message: "dependantId required" });
  }

  const sql = "DELETE FROM dependants WHERE id = ?";
  db.query(sql, [dependantId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: result.affectedRows > 0 });
  });
});


  return router;
};
