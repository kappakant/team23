import { NavLink } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  return (
    <nav className="pumppal-nav">
      <ul className="nav-list">
        <li>
          <NavLink to="/" className="nav-link" end>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/log" className="nav-link">
            Log
          </NavLink>
        </li>
        <li>
          <NavLink to="/gym" className="nav-link">
            Gym
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className="nav-link">
            Profile
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile-edit" className="nav-link">
            Edit
          </NavLink>
        </li>
        <li>
          <NavLink to="/user" className="nav-link">
            User
          </NavLink>
        </li>
        <li>
          <NavLink to="/login" className="nav-link">
            Login
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}