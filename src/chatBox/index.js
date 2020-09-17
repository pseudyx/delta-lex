import React, { useState } from 'react';
import './chatbox.css';

export const ChatBox = ({transcript, sendHandler}) =>  {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    const line = (number,data) => {
        if(data.input !== undefined && data.input !== null && data.input !== ""){
            if(data.response !== undefined && data.response !== null && data.response !== ""){
                return(<span key={number}>
                    <span className={'chatInput'}>{data.input}</span>
                    <span className={'chatResponse'}>{data.response}</span>
                    </span>);
            } else {
                return (<span key={number}>
                    <span className={'chatInput'}>{data.input}</span>
                    </span>)
            }
        } else if(data.response !== undefined && data.response !== null && data.response !== "") {
            return (<span key={number}>
                <span className={'chatResponse'}>{data.response}</span>
                </span>)
        } else {
            return null;
        }
    }
  
    return (
        <div className={'chatBox'}>
            <div className={'chatTab'} onClick={() => setOpen(prev => !prev)}></div>
            {(open) ? 
            <div className={'chatBody'}>
                <div className={'chatContent'}>
                        {transcript.map((data, i) => line(i,data))}
                </div>
                <div><input type="text" value={ inputValue } onChange={ (evt) => setInputValue(evt.target.value) }></input><button onClick={() => sendHandler(inputValue)}>submit</button></div>
            </div> : null}
        </div>);

}

export default ChatBox;