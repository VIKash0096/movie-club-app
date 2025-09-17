import React, { useState, type JSX } from "react";
import { Link } from "react-router-dom";
import "./manage-employee.css";

/**
 * UI-only page. No API calls, no validation logic.
 * Route: /manage-employee (already configured in main.tsx)
 */

const TABS = ["Add Employee", "Update Employee", "Add Dependant", "Update Dependant"] as const;
type TabKey = typeof TABS[number];

export default function ManageEmployee(): JSX.Element {
  const [active, setActive] = useState<TabKey>("Add Employee");

  return (
    <div className="me-page">
      {/* Top Bar */}
      <header className="me-header">
        <div className="me-header-left">
          <div className="me-logo">
            <i className="fa-solid fa-shield"></i>
          </div>
          <div className="me-title-wrap">
            <h1 className="me-title">Manage Employee</h1>
            <p className="me-subtitle">Employees and Dependants • UI only</p>
          </div>
        </div>

        <nav className="me-actions">
          <Link to="/admin" className="me-link">
            <i className="fa-solid fa-arrow-left"></i> Back to Admin
          </Link>
        </nav>
      </header>

      {/* Tabs */}
      <div className="me-container">
        <div className="me-tabs" role="tablist" aria-label="Employee actions">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={active === t}
              className={`me-tab ${active === t ? "active" : ""}`}
              onClick={() => setActive(t)}
            >
              <span className="me-tab-icon">
                {t === "Add Employee" && <i className="fa-solid fa-user-plus" />}
                {t === "Update Employee" && <i className="fa-solid fa-user-pen" />}
                {t === "Add Dependant" && <i className="fa-solid fa-user-group" />}
                {t === "Update Dependant" && <i className="fa-solid fa-user-gear" />}
              </span>
              <span className="me-tab-text">{t}</span>
            </button>
          ))}
        </div>

        {/* Panels */}
        <section className="me-panel">
          {active === "Add Employee" && (
            <Card title="Add Employee" description="Create a new employee. Emp No. is a 6‑digit code.">
              <AddEmployeeForm />
            </Card>
          )}
          {active === "Update Employee" && (
            <Card title="Update Employee" description="Search with Emp No., then edit contact info or status.">
              <UpdateEmployeeForm />
            </Card>
          )}
          {active === "Add Dependant" && (
            <Card title="Add Dependant" description="Register a dependant for an employee.">
              <AddDependantForm />
            </Card>
          )}
          {active === "Update Dependant" && (
            <Card title="Update Dependant" description="Find dependant records by the employee’s number.">
              <UpdateDependantForm />
            </Card>
          )}
        </section>
      </div>

      <footer className="me-footer">
        <p>UI demo page • No backend connected</p>
      </footer>
    </div>
  );
}

/* ------------------------------- Building blocks ------------------------------- */

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="me-card" role="region" aria-label={title}>
      <div className="me-card-header">
        <h2>{title}</h2>
        {description ? <p className="me-card-desc">{description}</p> : null}
      </div>
      <div className="me-card-body">{children}</div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="me-label-wrap">
        <label htmlFor={htmlFor} className="me-label">
          {label}
        </label>
        {hint ? <span className="me-hint">{hint}</span> : null}
      </div>
      <div className="me-input-wrap">{children}</div>
    </>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="me-grid">{children}</div>;
}

/* ----------------------------------- Forms ----------------------------------- */

function AddEmployeeForm() {
  const [empNo, setEmpNo] = useState("");
  const [empName, setEmpName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("active"); // default
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setEmpNo("");
    setEmpName("");
    setMobile("");
    setEmail("");
    setPassword("");
    setStatus("active");
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!empNo || !empName || !mobile || !email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/employees/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId: empNo,
          password,
          name: empName,
          email,
          phone: mobile,
          status,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(`✅ Employee added (ID: ${data.id})`);
        clearForm();
      } else {
        setMessage(data.message || "❌ Failed to add employee.");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error while adding employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="me-form" onSubmit={handleSubmit}>
      <TwoCol>
        <Field label="Emp No." htmlFor="add-emp-no" hint="6-digit Emp Code">
          <input
            id="add-emp-no"
            inputMode="numeric"
            placeholder="e.g. 123456"
            className="me-input"
            value={empNo}
            onChange={(e) => setEmpNo(e.target.value.trim())}
          />
        </Field>

        <Field label="Emp Name" htmlFor="add-emp-name">
          <input
            id="add-emp-name"
            placeholder="Full name"
            className="me-input"
            value={empName}
            onChange={(e) => setEmpName(e.target.value)}
          />
        </Field>

        <Field label="Mobile No." htmlFor="add-emp-mobile">
          <input
            id="add-emp-mobile"
            inputMode="tel"
            placeholder="10-digit number"
            className="me-input"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </Field>

        <Field label="Email ID" htmlFor="add-emp-email">
          <input
            id="add-emp-email"
            type="email"
            placeholder="name@company.com"
            className="me-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password" htmlFor="add-emp-password">
          <input
            id="add-emp-password"
            type="text"
            placeholder="Initial password"
            className="me-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <Field label="Status" htmlFor="add-emp-status">
          <select
            id="add-emp-status"
            className="me-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </Field>
      </TwoCol>

      <div className="me-actions-row">
        <button type="submit" className="me-btn me-btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Submit"}
        </button>
        <button type="reset" className="me-btn me-btn-ghost" onClick={clearForm}>
          Reset
        </button>
      </div>

      {message && <div className="me-result-hint">{message}</div>}
    </form>
  );
}


function UpdateEmployeeForm() {
  const [empNo, setEmpNo] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!empNo) {
      setMessage("⚠ Please enter Employee No.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/employees/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId: empNo,
          name,
          phone: mobile,
          email,
          status
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage("✅ Employee updated successfully");
      } else {
        setMessage("❌ Update failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error");
    }
  };

  return (
    <form className="me-form" onSubmit={handleUpdate}>
      <TwoCol>
        <Field label="Emp No." htmlFor="upd-emp-no" hint="6-digit Emp Code">
          <input
            id="upd-emp-no"
            inputMode="numeric"
            placeholder="e.g. 123456"
            className="me-input"
            value={empNo}
            onChange={(e) => setEmpNo(e.target.value)}
          />
        </Field>

        <Field label="Emp Name" htmlFor="upd-emp-name">
          <input
            id="upd-emp-name"
            placeholder="Full name"
            className="me-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Mobile No." htmlFor="upd-emp-mobile">
          <input
            id="upd-emp-mobile"
            inputMode="tel"
            placeholder="10-digit number"
            className="me-input"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </Field>

        <Field label="Email ID" htmlFor="upd-emp-email">
          <input
            id="upd-emp-email"
            type="email"
            placeholder="name@company.com"
            className="me-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Status" htmlFor="upd-emp-status">
          <select
            id="upd-emp-status"
            className="me-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="" disabled>Select status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </Field>
      </TwoCol>

      <div className="me-actions-row">
        <button type="submit" className="me-btn me-btn-primary">Update</button>
        <button
          type="reset"
          className="me-btn me-btn-ghost"
          onClick={() => {
            setEmpNo(""); setName(""); setMobile(""); setEmail(""); setStatus(""); setMessage("");
          }}
        >
          Reset
        </button>
      </div>

      {message && <p className="me-status-msg">{message}</p>}
    </form>
  );
}


function AddDependantForm() {
  const [empNo, setEmpNo] = useState("");
  const [depName, setDepName] = useState("");
  const [relation, setRelation] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dependants, setDependants] = useState<Array<any>>([]);

  const clearForm = () => {
    setDepName("");
    setRelation("");
    setDob("");
    setGender("");
    setMessage(null);
  };

  const handleAddDependant = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!empNo) {
      setMessage("Enter Emp No. (loginId).");
      return;
    }
    if (!depName || !relation || !dob || !gender) {
      setMessage("Fill all dependant fields.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/employees/add-dependant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId: empNo,
          name: depName,
          relation,
          dob,
          gender,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Dependant added successfully.");
        clearForm();
        // refresh list
        fetchDependants();
      } else {
        setMessage(data.message || "Failed to add dependant.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error while adding dependant.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDependants = async () => {
    setMessage(null);
    if (!empNo) {
      setMessage("Enter Emp No. to load dependants.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/employees/dependants/${encodeURIComponent(empNo)}`);
      if (res.ok) {
        const list = await res.json();
        setDependants(list || []);
        setMessage("Loaded dependants.");
      } else if (res.status === 404) {
        setDependants([]);
        setMessage("Employee not found.");
      } else {
        setMessage("Failed to load dependants.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error while fetching dependants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="me-form" onSubmit={handleAddDependant}>
      <TwoCol>
        <Field label="Emp No." htmlFor="add-dep-empno" hint="6-digit Emp Code">
          <input
            id="add-dep-empno"
            inputMode="numeric"
            placeholder="e.g. 123456"
            className="me-input"
            value={empNo}
            onChange={(e) => setEmpNo(e.target.value.trim())}
          />
        </Field>

        <Field label="Dependent Name" htmlFor="add-dep-name">
          <input
            id="add-dep-name"
            placeholder="Dependant full name"
            className="me-input"
            value={depName}
            onChange={(e) => setDepName(e.target.value)}
          />
        </Field>

        <Field label="Relation" htmlFor="add-dep-relation">
          <select
            id="add-dep-relation"
            className="me-select"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
          >
            <option value="">Select relation</option>
            <option value="spouse">Spouse</option>
            <option value="child">Child</option>
            <option value="parent">Parent</option>
            <option value="other">Other</option>
          </select>
        </Field>

        <Field label="DOB" htmlFor="add-dep-dob">
          <input
            id="add-dep-dob"
            type="date"
            className="me-input"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </Field>

        <Field label="Gender" htmlFor="add-dep-gender">
          <select
            id="add-dep-gender"
            className="me-select"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </TwoCol>

      <div className="me-actions-row">
        <button type="submit" className="me-btn me-btn-primary" disabled={loading}>
          {loading ? "Saving..." : "Submit"}
        </button>
        <button
          type="button"
          className="me-btn me-btn-ghost"
          onClick={() => {
            clearForm();
            setDependants([]);
            setMessage(null);
          }}
        >
          Reset
        </button>

        {/* quick load dependants button */}
        <button
          type="button"
          className="me-btn"
          onClick={fetchDependants}
          style={{ marginLeft: 12 }}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Dependants"}
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        {message && <div className="me-result-hint">{message}</div>}

        {dependants.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <h4>Dependants</h4>
            <table className="movie-table" style={{ width: "100%", fontSize: 14 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Relation</th>
                  <th>DOB</th>
                  <th>Gender</th>
                </tr>
              </thead>
              <tbody>
                {dependants.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.relation}</td>
                    <td>{d.dob ? new Date(d.dob).toLocaleDateString() : ""}</td>
                    <td>{d.gender}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </form>
  );
}


function UpdateDependantForm() {
  const [empNo, setEmpNo] = useState("");
  const [dependants, setDependants] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const fetchDependants = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/employees/dependants/${empNo}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setDependants(data);
      } else {
        setDependants([]);
        setMessage("No dependants found");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error fetching dependants");
    }
  };

  const updateDependant = async (dep: any) => {
    try {
      const res = await fetch(`http://localhost:5000/employees/update-dependant`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dep),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Dependant updated successfully");
      } else {
        setMessage("Update failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error updating dependant");
    }
  };
  const deleteDependant = async (dependantId: number) => {
    if (!window.confirm("Are you sure you want to delete this dependant?")) return;

    try {
      const res = await fetch(`http://localhost:5000/employees/delete-dependant/${dependantId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDependants(dependants.filter(d => d.id !== dependantId));
        setMessage("Dependant deleted successfully");
      } else {
        setMessage("Delete failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error deleting dependant");
    }
  };

  return (
    <>
      {/* Search form */}
      <form className="me-form" onSubmit={fetchDependants}>
        <TwoCol>
          <Field label="Emp No." htmlFor="upd-dep-empno" hint="6-digit Emp Code">
            <input
              id="upd-dep-empno"
              inputMode="numeric"
              placeholder="e.g. 123456"
              className="me-input"
              value={empNo}
              onChange={(e) => setEmpNo(e.target.value)}
            />
          </Field>
        </TwoCol>

        <div className="me-actions-row">
          <button type="submit" className="me-btn me-btn-primary">Find</button>
          <button
            type="reset"
            className="me-btn me-btn-ghost"
            onClick={() => { setEmpNo(""); setDependants([]); setMessage(""); }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Dependants list for editing */}
      {dependants.length > 0 && (
        <div className="me-dependants-list">
          {dependants.map((dep, idx) => (
            <div key={dep.id} className="me-dependant-item">
              <input
                className="me-input"
                value={dep.name}
                onChange={(e) => {
                  const updated = [...dependants];
                  updated[idx].name = e.target.value;
                  setDependants(updated);
                }}
              />
              <select
                className="me-select"
                value={dep.relation}
                onChange={(e) => {
                  const updated = [...dependants];
                  updated[idx].relation = e.target.value;
                  setDependants(updated);
                }}
              >
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="other">Other</option>
              </select>
              <input
                type="date"
                className="me-input"
                value={dep.dob?.slice(0, 10)}
                onChange={(e) => {
                  const updated = [...dependants];
                  updated[idx].dob = e.target.value;
                  setDependants(updated);
                }}
              />
              <select
                className="me-select"
                value={dep.gender}
                onChange={(e) => {
                  const updated = [...dependants];
                  updated[idx].gender = e.target.value;
                  setDependants(updated);
                }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <button
                className="me-btn me-btn-primary"
                onClick={() => updateDependant({
                  dependantId: dep.id,
                  name: dep.name,
                  relation: dep.relation,
                  dob: dep.dob,
                  gender: dep.gender
                })}
              >
                Save
              </button>
              <button
                className="me-btn me-btn-danger"
                onClick={() => deleteDependant(dep.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {message && <p className="me-status-msg">{message}</p>}
    </>
  );
}

