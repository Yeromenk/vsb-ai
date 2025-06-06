import { useState, useEffect, useContext, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

export const useChat = (chatId, type) => {
  const [pendingMessage, setPendingMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const endRef = useRef(null);
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Chat data query
  const {
    data: chat,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () =>
      axios
        .get(`http://localhost:3000/ai/chat/${chatId}`, {
          withCredentials: true,
        })
        .then(res => res.data.response)
        .catch(error => {
          if (error.response?.data?.unauthorized) {
            setUnauthorized(true);
          }
          throw error;
        }),
  });

  // Send message mutation based on a chat type
  const mutation = useMutation({
    mutationFn: message => {
      setLoading(true);
      const endpoint =
        type === 'custom'
          ? `/ai/chats/custom-conversation/${chatId}`
          : `/ai/${type}/chat/${chatId}`;

      return axios
        .put(endpoint, { message }, { withCredentials: true })
        .then(res => res.data.response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['chat', chatId]);
      setPendingMessage(null);
    },
    onError: error => {
      console.error('error sending message:', error);
      setPendingMessage(null);
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // Handle unauthorized
  useEffect(() => {
    if (unauthorized) {
      toast.error("You don't have access to this chat");
      navigate('/home');
    }
  }, [unauthorized, navigate]);

  // Auto-scroll effect
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.history, pendingMessage, loading]);

  return {
    chat,
    isLoading,
    error,
    pendingMessage,
    setPendingMessage,
    loading,
    setLoading,
    mutation,
    endRef,
    currentUser,
    unauthorized,
  };
};
