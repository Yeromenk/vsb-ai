import React from 'react';
import {
  FiMail,
  FiMessageSquare,
  FiSend,
  FiInbox,
  FiFile,
  FiFolder,
  FiSearch,
  FiStar,
  FiPaperclip,
  FiBookmark,
  FiTag,
  FiEdit,
} from 'react-icons/fi';
import './AnimatedBackground.css';

const AnimatedBackground = () => {
  const icons = [
    FiMail,
    FiMessageSquare,
    FiSend,
    FiInbox,
    FiFile,
    FiFolder,
    FiSearch,
    FiStar,
    FiPaperclip,
    FiBookmark,
    FiTag,
    FiEdit,
  ];

  return (
    <div className="animated-background">
      {icons.map((Icon, index) => (
        <Icon key={index} className={`floating-icon icon-${index + 1}`} />
      ))}
    </div>
  );
};

export default AnimatedBackground;
