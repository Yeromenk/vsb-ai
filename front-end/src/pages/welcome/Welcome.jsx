import { Link } from 'react-router-dom';
import './Welcome.css';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.js';
import { ArrowRight } from 'lucide-react';
import AnimatedBackground from '../../components/animated-background/AnimatedBackground';

const Welcome = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="welcome">
      <AnimatedBackground />
      <div className="content">
        <div className="badge">
          <span>AI-Powered Platform</span>
        </div>

        <h1>
          Welcome to <span className="gradient-text">VSB AI</span>
        </h1>

        <p>
          This is an AI-powered platform where you can translate between languages, summarize
          documents, format text in different styles, send emails, and create custom chat agents for
          specific tasks.
        </p>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🌐</div>
            <span>Translation</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">📝</div>
            <span>Summarization</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">✉️</div>
            <span>Email Drafting</span>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🤖</div>
            <span>Custom Agents</span>
          </div>
        </div>

        {currentUser ? (
          <Link to="/home">
            <button className="cta-button">
              Continue
              <ArrowRight size={20} />
            </button>
          </Link>
        ) : (
          <Link to="/login">
            <button className="cta-button">
              Get Started
              <ArrowRight size={20} />
            </button>
          </Link>
        )}
      </div>

      <div className="logo">
        <div className="logo-glow"></div>
        <img src="/vsb-logo.jpg" alt="vsb-logo" />
      </div>
    </div>
  );
};

export default Welcome;
