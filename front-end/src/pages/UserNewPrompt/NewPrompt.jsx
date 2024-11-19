import React from 'react';
import './NewPrompt.css';

const NewPrompt = () => {
    return (
        <div className='new-prompt'>
            <div className="container-new-prompt">
                <h1>Configure your own chat</h1>
                <p>Here you can configure your own chat. You just need to write a name, description and a instructions</p>
                <div className="form-prompt">

                    <h3>Name</h3>
                    <input type="text" placeholder="Name" className='text'/>

                    <h3>Description</h3>
                    <input type="text" placeholder="Description" className='text'/>

                    <h3>Instructions</h3>
                    <textarea placeholder="Instructions" className='instructions'/>

                    <button>Save</button>
                </div>
            </div>
        </div>
    );
};

export default NewPrompt;