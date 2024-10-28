import {Link} from "react-router-dom";
import './ChatList.css';
import {Languages, FileText, Text} from 'lucide-react';

const ChatList = () => {
    return (
        <div className='chatList'>
            <Link to='/translate'><Languages/> Translate a text</Link>
            <Link to='/format'><Text/> Create an alternative text</Link>
            <Link to='/summarize'><FileText/> Summarize a file</Link>

            <h1>Chat List</h1>
            <div className='list'>
                <Link to='/'>Title of chat</Link>
                <Link to='/'>Title of chat</Link>
                <Link to='/'>Title of chat</Link>
                <Link to='/'>Title of chat</Link>
                <Link to='/'>Title of chat</Link>
                <Link to='/'>Title of chat</Link>
                <Link to='/'>Title of chat</Link>




            </div>

            <div className='footer'>
                <p>VSB AI can make mistakes. Recommended to check information</p>
            </div>
        </div>
    );
};

export default ChatList;