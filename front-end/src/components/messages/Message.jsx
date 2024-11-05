import React, { useContext, useRef } from 'react';
import './Message.css';
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import TranslateText from "../textInput/TranslateText";
import { AuthContext } from "../../context/AuthContext";

const Message = () => {
    const { currentUser } = useContext(AuthContext);
    const firstLetter = currentUser?.username.charAt(0).toUpperCase();

    const endRef = useRef(null);
    const path = useLocation().pathname;
    const chatId = path.split("/").pop();

    const { isPending, data, error } = useQuery({
        queryKey: ['chat', chatId],
        queryFn: () =>
            axios.get(`http://localhost:3000/ai/chat/${chatId}`, {
                withCredentials: true,
                params: {
                    chatId
                }
            }).then(res => res.data.response),
    });

    return (
        <div className='message'>
            <div className="container-message">
                <div className="chat">
                    {isPending
                        ? "Loading..."
                        : error
                            ? "An error occurred"
                            : data?.history?.map((message, index) => (
                                <div key={index} className="message-container">
                                    {message.role === 'model' && (
                                        <div className="avatar model-avatar">
                                            <img src='/vsb-logo.jpg' alt='vsb-logo' />
                                        </div>
                                    )}
                                    <div className={`message ${message.role}-message`}>
                                        {message.text}
                                    </div>
                                    {message.role === 'user' && (
                                        <div className="avatar user-avatar">
                                            {firstLetter}
                                        </div>
                                    )}
                                </div>
                            ))}

                    <div ref={endRef} />
                </div>
                <TranslateText />
            </div>
        </div>
    );
};

export default Message;
