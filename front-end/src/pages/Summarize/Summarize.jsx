import './Summarize.css';
import {FilePlus2, Send} from "lucide-react";
import React, {useEffect, useRef, useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';

const Summarize = ({data}) => {
    const [file, setFile] = useState(null);
    const [action, setAction] = useState('');
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null);
    const endRef = useRef()

    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [data, response]);

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('action', action);
            const {data: result} = await axios.put(`http://localhost:3000/ai/format/file/${data.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            }, {
                withCredentials: true,
            })
            return result.response;
        },
        onSuccess: (result) => {
            queryClient.invalidateQueries({queryKey: ['chat', data.id]}).then(() => {
                setResponse(result)
                setFile(null);
                setAction('');
                setError(null)

            });
        },
        onError: (error) => {
            setError(error)
            console.error("Error in handleSend:", error);
        }
    });

    const add = async () => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('action', action);
            const fileAction = await axios.post('http://localhost:3000/ai/file', {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            const fileResponse = fileAction.data

            setResponse(fileResponse)
            setLoading(false)
            mutation.mutate();
        } catch (e) {
            console.error("Error in handleSend:", e);
            setLoading(false)
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleActionChange = (newAction) => {
        setAction(newAction);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !action) return;

        await add();

        console.log(`File: ${file.name}, Action: ${action}`);
    };

    return (
        <div className='document-input'>
            <div className="document-input-container">
                <div className="file-container">
                    <form onSubmit={handleSubmit}>
                        <div className='file-input-container'>
                            <label className='file-label'>
                                <FilePlus2 className='input-icon'/>
                                <span>{file ? file.name : 'Choose a file'}</span>
                                <input type='file' onChange={handleFileChange} hidden/>
                            </label>
                        </div>
                        <div className='action-buttons'>
                            <button
                                type='button'
                                className={action === 'summarize' ? 'active' : ''}
                                onClick={() => handleActionChange('summarize')}
                            >
                                Summarize
                            </button>
                            <button
                                type='button'
                                className={action === 'describe' ? 'active' : ''}
                                onClick={() => handleActionChange('describe')}
                            >
                                Describe
                            </button>
                        </div>
                        <button type='submit' disabled={!file || !action}>
                            <Send className='button-icon'/> Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Summarize;