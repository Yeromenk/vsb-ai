import { Link } from 'react-router-dom';
import './Welcome.css';


const Welcome = () => {
    return (
        <div className='welcome'>
            <div className='content'>
                <h1>Welcome to VSB AI</h1>
                <p>This is a platform where you can translate, summarize and create alternative text</p>
                <Link to='/login'>
                    <button>Get Started</button>
                </Link>
            </div>
            <div className='logo'>
                <img src='../../../public/vsb-logo.jpg' alt='vsb-logo'/>
            </div>
        </div>
    );
};

export default Welcome;