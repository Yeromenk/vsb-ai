import { useEffect, useRef, useState } from 'react';
import { SendHorizontal, FilePlus2 } from 'lucide-react';
import './NewChat.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const NewChat = ({ data }) => {
  const [inputValue, setInputValue] = useState('');
  const endRef = useRef(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [input, setInput] = useState('');

  const handleInputChange = e => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.overflowY = 'hidden';
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (textarea.scrollHeight > 128) {
      textarea.style.overflowY = 'auto';
      textarea.style.height = '128px';
    }

    setInputValue(textarea.value);
  };

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [message]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => {
      return axios
        .put(
          `http://localhost:3000/ai/user-prompt/chat/${data.id}`,
          {
            message: message.length ? message : undefined,
          },
          {
            withCredentials: true,
          }
        )
        .then(res => res.data.response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', data.id] }).then(() => {
        setMessage('');
        setResponse('');
        setInput('');
      });
    },
    onError: error => {
      console.error('Error in handleSend:', error);
    },
  });

  return (
    <div className="new-chat-container">
      <div className="new-chat"></div>
      <div className="document-input">
        <form>
          <div className="input-container">
            <FilePlus2 className="input-icon" />
            <textarea
              rows={1}
              value={inputValue}
              onChange={handleInputChange}
              placeholder="What do you want to ask?"
            />
            <button type="submit">
              <SendHorizontal className="send-button" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChat;
