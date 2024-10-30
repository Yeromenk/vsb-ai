import './Home.css';
import {FileText, Languages, Text} from 'lucide-react';
import {Link} from "react-router-dom";
import {AuthContext} from "../../context/AuthContext";
import {useContext} from "react";

const Home = () => {
    const {currentUser} = useContext(AuthContext);

    const formatedName = currentUser?.username.charAt(0).toUpperCase() + currentUser?.username.slice(1);

    return (
        <div className='home-container'>
            <div className='home'>
                <div className='hello'>
                    <h1>Hello, {formatedName}!</h1>
                    <p>How can I help you?</p>
                </div>
                <div className="choose-task">
                    <Link to='/translate' className='task'><Languages/> Translate a text</Link>
                    <Link to='/format' className='task'><Text/> Create an alternative text</Link>
                    <Link to='/summarize' className='task'><FileText/> Summarize a file</Link>
                </div>
            </div>
        </div>
    );
};

export default Home;