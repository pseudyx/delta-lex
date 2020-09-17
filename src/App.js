import React, { useState, useEffect } from 'react';
import Delta, { Events } from './delta';
import Stack from './modal';
import cmder from './cmder';
import ChatBox from './chatBox';
import { shallowEqual } from './lib/utils';

import listItemGroup from './components/listItemGroup';
import weatherForcastGroup from './components/weatherForcast';

function App() {
  const stackRef = React.useRef();
  const [transcript, setTranscript] = useState([]);
  const [message, setMessage] = useState(null);
  const [diagOn, setDiagOn] = useState(null);

  useEffect(() => {    
    cmder.on('addWindow', (content, callback) => callback(stackRef.current.add(content)));
    cmder.on('updateWindow', (win) => stackRef.current.update(win));

    Events.on('onSuccess', (data) => {

      //console.log(JSON.stringify(data))
  
      manageTranscript({state:data.dialogState, input:data.inputTranscript, response: data.message})
  
      if(data.dialogState === "Fulfilled"){
  
        if(data.intentName === "Search"){
          command('window', null, (id) => {
            command('search', data.slots.Query, data.slots.Num, (response) => {
              command('window', {id: id, content: listItemGroup(response.results) }) 
            });
          });
        }
  
        if(data.intentName === "GetWeather"){
          command('window', null, (id) => {
            command('weather', data.slots.Postcode, data.slots.Num, (response) => {
              command('window', {id: id, content: weatherForcastGroup(response.forecasts) }) 
            });
          });
        }
  
      }
    });

    Events.on('SettingsMenu', (ctr) => {
      command('window', {content: deltaSettings(ctr), width:222, height:170 })
    });

  }, []);

  const deltaSettings = (ctr) => {
    return (
      <div>
        <p>Customize the Entiy by toggling visual components</p>
        <ul>
        <li><button onClick={ctr.ToggleEntity}>Toggle</button> Entity</li>
        <li><button onClick={ctr.ToggleVoiceVisual}>Toggle</button> Voice Visual</li>
        <li><button onClick={() => setDiagOn(prev => !prev)}>Toggle</button> Dialogue</li>
        </ul>
      </div>)
  }
  

  const manageTranscript = (data) =>{

        setTranscript(prev => {
          if(!shallowEqual(prev[prev.length-1],data)) return [...prev, data]
          else return prev;
        });
    
  }

  const command = (cmd, ...args) => cmder.exec(cmd, args)

  const sendText = (inputValue) => {
    setMessage(inputValue);
    manageTranscript({state:'SendText', input:inputValue, response:null});
  }

  return (
    <div className="App">
      <ChatBox transcript={transcript} sendHandler={sendText} enabled={diagOn} />
      <Stack ref={stackRef} />
      <Delta name={'Delta_AU'} message={message} />
    </div>
  );
}

export default App;
