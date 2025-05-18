import React from 'react';
import { Link } from 'react-router-dom';
import '../Style/Navbar.css';

const Navbar = ({userEmail ,signOut}) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="nav-link p-2  text-white">Home</Link>
        <Link to="/about" className="nav-link p-2 text-white">About</Link>
      </div>
      <div className="navbar-right">
        <h3 to="/profile" className="nav-link p-2 m-1 border text-white">{userEmail}</h3>
        <button onClick={signOut} variation="primary" style={{ margin: '10px' }}>
        Sign Out
      </button>
      </div>
    </nav>
  );
};

export default Navbar;
