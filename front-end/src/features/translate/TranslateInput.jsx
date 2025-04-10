// features/translate/TranslateInput.jsx
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import TextTranslator from '../../components/common/TextTranslator/TextTranslator';
import './TranslateInput.css';

const TranslateInput = () => {
  const { currentUser } = useContext(AuthContext);
  const userId = currentUser.id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
                         text,
                         sourceLanguage,
                         targetLanguage,
                       }) => {
      const response = await axios.post('http://localhost:3000/ai/chats', {
        message: text,
        sourceLanguage,
        targetLanguage,
        userId,
      });
      return response.data.response;
    },
    onSuccess : newChat => {
      queryClient.invalidateQueries({ queryKey: ['ChatList'] });
      navigate(`/translate/chat/${newChat.id}`);
    },
    onError   : error => {
      console.error('Error in handleSend:', error);
    },
  });

  return (
    <div className="translate-text">
      <div className="translate-container">
        <div className="overview">
          <h1>Translate Text</h1>
          <p>Here you can translate a text and get an overview</p>
        </div>

        <TextTranslator
          onSubmit={mutation.mutate}
          loading={mutation.isPending}
        />
      </div>
    </div>
  );
};

export default TranslateInput;