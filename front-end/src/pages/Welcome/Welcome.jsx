import { Link } from 'react-router-dom';
import './Welcome.css';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.js';

const Welcome = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="welcome">
      <div className="content">
        <h1>Welcome to VSB AI</h1>
        <p>
          This is an AI-powered platform where you can translate between languages, summarize
          documents, format text in different styles, send emails, and create custom chat agents for
          specific tasks.
        </p>
        {currentUser ? (
          <Link to="/home">
            <button>Continue</button>
          </Link>
        ) : (
          <Link to="/login">
            <button>Get Started</button>
          </Link>
        )}
      </div>
      <div className="logo">
        <img src="/vsb-logo.jpg" alt="vsb-logo" />
      </div>
    </div>
  );
};

export default Welcome;
