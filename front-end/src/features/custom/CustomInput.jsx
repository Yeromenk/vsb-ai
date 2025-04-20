import { useEffect, useState } from 'react';
import { SendHorizontal } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import './CustomInput.css';
import { handleTextareaAutoResize } from '../../utils/TextAutoResize';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import { toast } from 'react-hot-toast';

const CustomInput = () => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const { id: templateId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [unauthorized, setUnauthorized] = useState(false);

  // Fetch template details
  const { data: template, isLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/ai/chat/${templateId}`, {
          withCredentials: true,
        })
        .then(res => res.data.response)
        .catch(err => {
          if (err.response?.data?.unauthorized) {
            setUnauthorized(true);
          }
          throw err;
        }),
  });

  useEffect(() => {
    if (unauthorized) {
      toast.error("You don't have access to this template");
      navigate('/home');
    }
  }, [unauthorized, navigate]);

  // Mutation to create a conversation from a template
  const mutation = useMutation({
    mutationFn: async message => {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:3000/ai/chats/custom-conversation',
        {
          templateId,
          message,
        },
        { withCredentials: true }
      );
      return response.data.response;
    },
    onSuccess: newChat => {
      queryClient.invalidateQueries(['ChatList']);
      // Navigate to the new conversation
      navigate(`/custom/chat/${newChat.id}`);
    },
    onError: error => {
      console.error('Error creating conversation:', error);
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
    handleTextareaAutoResize(e, setInputValue);
  };

  if (isLoading) return <LoadingState message="Loading template..." />;

  return (
    <div className="message">
      <div className="container-message">
        <div className="user-prompt-container">
          <div className="user-prompt">
            <h1>{template?.title || 'Custom Chat'}</h1>
            {template?.description && <p className="description">{template.description}</p>}
          </div>
          <div className="document-input-prompt">
            <form onSubmit={handleSend}>
              <div className="custom-input-container">
                <textarea
                  rows={1}
                  value={inputValue}
                  onChange={handleInputChange}
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