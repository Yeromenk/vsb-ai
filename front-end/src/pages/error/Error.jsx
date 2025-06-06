import React from 'react';
import './Error.css';
import { Link } from 'react-router-dom';
import Layout from '../../layout/root/Root.jsx';
import { House } from 'lucide-react';

const Error = () => {
  return (
    <>
      <Layout />
      <div className="error">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <Link to="/home" className="error-link">
          <House size={20} className="home-icon" />
          <span>Home</span>
        </Link>
      </div>
    </>
  );
};

export default Error;
