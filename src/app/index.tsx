import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {fetchFlaggedEmails} from './api';
import * as styles from './app.css';
import {ContentBody} from './components/content_body';
import {TopBar} from './components/top_bar';
import {Message} from './types';

interface AppState {
  flaggedMessages: ReadonlyArray<Message>;
}

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    setInterval(this.updateFlaggedEmais, 10000);
    this.state = {flaggedMessages: []};
    this.updateFlaggedEmais();
  }

  render() {
    const {flaggedMessages} = this.state;
    return (
      <div className={styles.App}>
        <TopBar />
        <ContentBody messages={flaggedMessages} />
      </div>
    );
  }

  private updateFlaggedEmais = async () => {
    const result = await fetchFlaggedEmails();
    this.setState({
      flaggedMessages: result.messages,
    });
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
