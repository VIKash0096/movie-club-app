import { useLocation } from 'react-router-dom';
import './EmployeePage.css';

const EmployeePage = () => {
  const location = useLocation();
  const name = location.state?.name || "Employee";
  console.log("Location State:", location.state);

  return (
    <div className="employee-wrapper">
      <div className="employee-header">
        <h1>Welcome {name}</h1>
      </div>
      <div className="employee-content-box">
        <p>This is your employee dashboard.</p>
      </div>
    </div>
  );
};

export default EmployeePage;
