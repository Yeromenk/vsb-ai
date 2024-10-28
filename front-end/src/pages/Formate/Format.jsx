import './Format.css'
import FormatingText from "../../components/textInput/FormatingText.jsx";

const Format = () => {
    return (
        <div className='format-container'>
            <div className='format'>
                <div className='hello'>
                    <h1>Format a text</h1>
                    <p>Here you can format a text and get an overview</p>
                </div>
                <FormatingText />
            </div>
        </div>
    );
};

export default Format;