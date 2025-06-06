import { Link } from 'react-router-dom';
import { CirclePlus, FileText, Languages, Text, User, Mail } from 'lucide-react';

const UtilityLinks = ({ isActive, customChats, setIsSidebarOpen }) => {
  return (
    <>
      <Link
        to="/translate"
        className={`utility-link ${isActive('/translate') ? 'active' : ''}`}
        onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
      >
        <Languages /> Translate a text
      </Link>
      <Link
        to="/format"
        className={`utility-link ${isActive('/format') ? 'active' : ''}`}
        onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
      >
        <Text /> Create an alternative text
      </Link>
      <Link
        to="/summarize"
        className={`utility-link ${isActive('/summarize') ? 'active' : ''}`}
        onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
      >
        <FileText /> Summarize a file
      </Link>
      <Link
        to="/email"
        className={`utility-link ${isActive('/email') ? 'active' : ''}`}
        onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
      >
        <Mail /> Email Assistant
      </Link>
      <Link
        to="/new-prompt"
        className={`utility-link ${isActive('/new-prompt') ? 'active' : ''}`}
        onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
      >
        <CirclePlus /> New Prompt
      </Link>

      {/* custom chat utility links */}
      {customChats.map(chat => (
        <Link
          key={chat.id}
          to={`/template/${chat.id}`}
          className={`utility-link custom-utility-link ${
            isActive(`/template/${chat.id}`) ? 'active' : ''
          }`}
          onClick={() => window.innerWidth <= 768 && setIsSidebarOpen(false)}
        >
          <User /> {chat.title}
        </Link>
      ))}
    </>
  );
};

export default UtilityLinks;
