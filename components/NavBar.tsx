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
      </ul>
    </nav>
  );
}


