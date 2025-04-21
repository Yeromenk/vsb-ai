import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import LoadingState from '../../components/common/LoadingState/LoadingState';
import MessageInput from '../../components/common/MessageInput/MessageInput';
import './CustomInput.css';

const CustomInput = () => {
  const [loading, setLoading] = useState(false);
  const { id: templateId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [unauthorized, setUnauthorized] = useState(false);

  // Fetch template details
  const { data: template, isLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/ai/chat/${templateId}`,
          { withCredentials: true }
        );
        return res.data.response;
      } catch (err) {
        if (err.response?.data?.unauthorized) {
          setUnauthorized(true);
        }
        throw err;
      }
    },
  });

  useEffect(() => {
    if (unauthorized) {
      toast.error("You don't have access to this template");
      navigate('/home');
    }
  }, [unauthorized, navigate]);

  // Mutation to create a conversation from a template
  const mutation = useMutation({
    mutationFn: async (message) => {
      setLoading(true);
      const response = await axios.post(
        'http://localhost:3000/ai/chats/custom-conversation',
        { templateId, message },
        { withCredentials: true }
      );
      return response.data.response;
    },
    onSuccess: (newChat) => {
      queryClient.invalidateQueries(['ChatList']);
      navigate(`/custom/chat/${newChat.id}`);
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation. Please try again.');
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleSubmit = useCallback((message) => {
    mutation.mutate(message);
  }, [mutation]);

  if (isLoading) return <LoadingState message="Loading template..." />;

  return (
    <div className="message">
      <div className="container-message">
        <div className="user-prompt-container">
          <MessageInput
            onSubmit={handleSubmit}
            loading={loading}
            title={template?.title || 'Custom Chat'}
            description={template?.description}
            placeholder="Start a new conversation..."
          />
        </div>
      </div>
    </div>
  );
};

export default CustomInput;