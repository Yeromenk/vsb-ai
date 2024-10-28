import './Summarize.css';
import DocumentInput from "../../components/textInput/DocumentInput.jsx";


const Summarize = () => {
    return (
        <div className='summarize-container'>
            <div className='summarize'>
                <div className='hello'>
                    <h1>Summarize a file</h1>
                    <p>Here you can summarize a file and get an overview</p>
                </div>
                <DocumentInput/>
            </div>
        </div>
    );
};

export default Summarize;