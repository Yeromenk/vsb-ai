import './Translate.css'
import TranslateText from "../../components/textInput/TranslateText";
import Message from "../../components/messages/Message";
import React, {useState} from "react";

const Translate = () => {
    const [messages, setMessages] = useState([]);

    return (
        <div className='translate'>
            <div className="translate-container">
                <div className='about-translate'>
                    <h1>Translate</h1>
                    <p>Translate text from one language to another</p>
                </div>
                {/*<Message messages={messages}/>*/}
                <TranslateText setMessages={setMessages}/>
            </div>
        </div>
    );
};

export default Translate;