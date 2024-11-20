import './Summarize.css';
import {FilePlus2, Send} from "lucide-react";
import React, {useState} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import axios from "axios";


const Summarize = ({data}) => {
    const [file, setFile] = useState(null);
    const [action, setAction] = useState('');

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn:  () => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('action', action);
            return axios.put(`http://localhost:3000/ai/format/file/${data.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }, {
                withCredentials: true,
            }).then((res) => res.data.response);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['chat', data.id]}).then(() => {
                setFile(null);
                setAction('');
            });
        },
        onError: (error) => {
            console.error("Error in handleSend:", error);
        }
    });

    const add = async () => {
        try {
            mutation.mutate();
        } catch (e) {
            console.error("Error in handleSend:", e);
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