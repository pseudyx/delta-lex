import React from 'react';
import Delta from './delta';
import Stack from './modal';
import cmder from './cmder';

function App() {
  const child = React.createRef();
  cmder.on('addWindow', (content, callback) => callback(child.current.add(content)));
  cmder.on('updateWindow', (win) => child.current.update(win));

  return (
    <div className="App">
      <Stack ref={child} />
      <Delta name={'Delta_AU'} commandHandler={(cmd, ...args) => cmder.exec(cmd, args)} />
    </div>
  );
}

export default App;
