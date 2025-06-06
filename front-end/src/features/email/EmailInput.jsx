// Fix for front-end/src/features/email/EmailInput.jsx
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';
import EmailAssistant from '../../components/email-assistant/EmailAssistant';
import './EmailInput.css';

const EmailInput = () => {
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async emailData => {
      const response = await axios.post('http://localhost:3000/ai/chats', {
        prompt: emailData.message,
        message: emailData.message, // Add this line to provide both fields
        userId,
      });
      return response.data.response;
    },
    onSuccess: newChat => {
      queryClient.invalidateQueries({ queryKey: ['ChatList'] });
      navigate(`/email/chat/${newChat.id}`);
    },
    onError: error => {
      console.error('Error sending email:', error);
      toast.error('Failed to answer email. Please try again.');
    },
  });

  return (
    <div className="email-page">
      <div className="email-container">
        <div className="overview">
          <h1 className="email-page__title">Email Assistant</h1>
          <p className="email-page__subtitle">
            Compose and send professional emails with AI assistance
          </p>
        </div>

        <EmailAssistant onSubmit={mutation.mutate} loading={mutation.isPending} />
      </div>
    </div>
  );
};

export default EmailInput;
