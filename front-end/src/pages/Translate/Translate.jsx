import './Translate.css'
import TranslateText from "../../components/textInput/TranslateText";

const Translate = () => {
    return (
        <div className='translate'>
            <div className="translate-container">
                <div className="words">
                    <h1>Translate a text</h1>
                    <p>Here you can translate a text and get an overview</p>
                </div>
                <TranslateText/>
            </div>
        </div>
    );
};

export default Translate;