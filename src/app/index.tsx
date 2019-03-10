import {AnchorButton} from '@blueprintjs/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {TopBar} from './components/top_bar';

class App extends React.Component {
  render() {
    return (
      <div>
        <TopBar />
        <AnchorButton text='Click' />
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
