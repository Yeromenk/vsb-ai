import { useContext, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import './CustomInput.css';

const CustomInput = () => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { id: chatId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/ai/chat/${chatId}`, {
          withCredentials: true,
        })
        .then(res => res.data.response),
  });

  const mutation = useMutation({
    mutationFn: async message => {
      setLoading(true);
      // Create a new chat based on the template
      const response = await axios.post(
        'http://localhost:3000/ai/chats/new-prompt',
        {
          name: `${data?.title || 'Custom Chat'} Conversation`,
          description: data?.description || '',
          instructions: data?.instructions || '',
          message: message
        },
        { withCredentials: true }
      );
      return response.data.response;
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries(['ChatList']);
      // Navigate to the newly created conversation
      navigate(`/chat/${newChat.id}`);
    },
    onError: error => {
      console.error('Error creating new conversation:', error);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleSend = async event => {
    event.preventDefault();
    if (inputValue.trim() === '') return;
    mutation.mutate(inputValue);
  };

  const handleInputChange = e => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.overflowY = 'hidden';
    textarea.style.height = `${textarea.scrollHeight}px`;

    if (textarea.scrollHeight > 128) {
      textarea.style.overflowY = 'auto';
      textarea.style.height = '128px';
    }

    setInputValue(e.target.value);
  };

  return (
    <div className="message">
      <div className="container-message">
        <div className="user-prompt-container">
          <div className="user-prompt">
            <h1>{data?.title || 'Custom Chat'}</h1>
            {data?.description && <p className="description">{data.description}</p>}
          </div>
          <div className="document-input-prompt">
            <form onSubmit={handleSend}>
              <div className="input-container">
                <textarea
                  rows={1}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onInput={handleInputChange}
                  placeholder="Start a new conversation..."
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !inputValue.trim()}>
                  <SendHorizontal className="send-button" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomInput;