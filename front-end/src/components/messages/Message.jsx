import React, { useEffect, useRef } from 'react';
import './Message.css';

const Message = ({ messages }) => {
    const endRef = useRef(null);

    useEffect(() => {
        if(messages.length > 0) {
            endRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [messages]);

    return (
        <div className='message'>
            <div className="container-message">
                <div className="chat">
                    {messages.length === 0 ? (
                            <>
                                <div className="words">
                                    <h1>Translate a text</h1>
                                    <p>Here you can translate a text and get an overview</p>
                                </div>
                            </>
                        ) : (
                            messages.map((message, index) => (
                                    <div key={index} className={`message ${message.type}-message`}>
                                        {message.text}
                                    </div>
                                ))
                        )}

                    <div ref={endRef} />
                </div>
            </div>
        </div>
    );
};

export default Message;
