import React from 'react';
import './Error.css';
import {Link} from 'react-router-dom';
import Layout from '../../layout/root/Root.jsx';

const Error = () => {
    return (
        <>
            <Layout/>
            <div className='error'>
                <h1>404</h1>
                <h2>Page Not Found</h2>
                <button><Link to='/home'>Home</Link></button>
            </div>
        </>

    );
};

export default Error;