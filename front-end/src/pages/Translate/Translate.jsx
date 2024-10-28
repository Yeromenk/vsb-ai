import './Translate.css'
import TranslateText from "../../components/textInput/TranslateText";
import Message from "../../components/messages/Message";
import React, {useState} from "react";

const Translate = () => {
    const [messages, setMessages] = useState([]);

    return (
        <div className='translate'>
            <div className="translate-container">
                <Message messages={messages}/>
                <TranslateText setMessages={setMessages}/>
            </div>
        </div>
    );
};

export default Translate;