import './Home.css';
import { FileText, Languages, Text, Mail, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const { hasApiKey } = useContext(AuthContext);

  const formatedName =
    currentUser?.username.charAt(0).toUpperCase() + currentUser?.username.slice(1);

  return (
    <div className="home-container">
      <div className="home">
        <div className="hello">
          {!hasApiKey ? (
            <div className="warning-message">
              <span className="warning-icon">⚠️</span>
              <span>Please set up your OpenAI API key in your profile to use AI features.</span>
            </div>
          ) : (
            <>
              <h1>Hello, {formatedName}!</h1>
              <p>How can I help you today?</p>
              <div className="choose-task">
                <Link to="/translate" className="task">
                  <Languages /> Translate text
                </Link>
                <Link to="/format" className="task">
                  <Text /> Format & improve text
                </Link>
                <Link to="/summarize" className="task">
                  <FileText /> Analyze documents
                </Link>
                <Link to="/email" className="task">
                  <Mail /> Email assistant
                </Link>
                <Link to="/new-prompt" className="task task--featured">
                  <Plus /> Create custom chat
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
