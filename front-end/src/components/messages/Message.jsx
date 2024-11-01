import React, {useEffect, useRef} from 'react';
import './Message.css';
import {useLocation} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import axios from "axios";

const Message = ({messages}) => {
    const endRef = useRef(null);

    useEffect(() => {
        if (messages.length > 0) {
            endRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages]);

    const path = useLocation().pathname;
    const chatId = path.split('/').pop();

    const {isPending, data, error} = useQuery({
        queryKey: ['chatData', chatId],
        queryFn: () =>
            axios.get(`http://localhost:3000/ai/chat/${chatId}`, {
                withCredentials: true,
                params: {
                    chatId
                }
            }).then(res => res.data),
    })

    return (
        <div className='message'>
            <div className="container-message">
                <div className="chat">
                    {isPending
                        ? "Loading..."
                        : error
                            ? "An error occurred"
                            : data?.response?.messages?.map((message, index) => (
                                <div key={index} className={`message ${message.type}-message`}>
                                    {message.text}
                                </div>
                            ))}

                    {/*{messages.length === 0 ? (*/}
                    {/*        <>*/}
                    {/*            <div className="words">*/}
                    {/*                <h1>Translate a text</h1>*/}
                    {/*                <p>Here you can translate a text and get an overview</p>*/}
                    {/*            </div>*/}
                    {/*        </>*/}
                    {/*    ) : (*/}
                    {/*        messages.map((message, index) => (*/}
                    {/*                <div key={index} className={`message ${message.type}-message`}>*/}
                    {/*                    {message.text}*/}
                    {/*                </div>*/}
                    {/*            ))*/}
                    {/*    )}*/}

                    <div ref={endRef}/>
                </div>
            </div>
        </div>
    );
};

export default Message;
