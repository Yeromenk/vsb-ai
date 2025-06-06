import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import TextTranslator from '../../components/text-translator/TextTranslator';
import './Translate.css';

const Translate = ({ data, setPendingMessage, setIsAiLoading, inputRef }) => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: translationData => {
      return axios.put(
        `http://localhost:3000/ai/translate/chat/${data.id}`,
        {
          message: translationData.text,
          sourceLanguage: translationData.sourceLanguage,
          targetLanguage: translationData.targetLanguage,
        },
        {
          withCredentials: true,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', data.id] }).then(() => {
        setPendingMessage(null);
        setIsAiLoading(false);
      });
    },
    onError: error => {
      console.error('error in handleSend:', error);
      toast.error('error updating chat history');
      setPendingMessage(null);
      setIsAiLoading(false);
    },
  });

  const handleTranslate = async translationData => {
    setLoading(true);
    setPendingMessage(translationData.text);
    setIsAiLoading(true);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // First, get translation
      await axios.post('http://localhost:3000/ai/translate', {
        message: translationData.text,
        sourceLanguage: translationData.sourceLanguage,
        targetLanguage: translationData.targetLanguage,
      });

      // Then update the chat with both the original text and translation
      mutation.mutate(translationData);
    } catch (error) {
      console.error('error in translation:', error);
      toast.error('error in translating text. Please try again later.');
      setPendingMessage(null);
      setIsAiLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="translate-page">
      <div className="translator-wrapper" ref={inputRef}>
        <TextTranslator
          onSubmit={handleTranslate}
          loading={loading}
          initialSource={data?.sourceLanguage || 'English'}
          initialTarget={data?.targetLanguage || 'Czech'}
        />
      </div>
    </div>
  );
};

export default Translate;
