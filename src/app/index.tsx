import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {fetchFlaggedEmails, fetchStats} from './api';
import * as styles from './app.css';
import {ContentBody} from './components/content_body';
import {Foooter} from './components/footer';
import {TopBar} from './components/top_bar';
import {Message, StatsResponse} from './types';

interface AppState {
  flaggedMessages: ReadonlyArray<Message>;
  stats?: StatsResponse;
}

class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    setInterval(this.updateFlaggedEmais, 10000);
    setInterval(this.updateStats, 1000);
    this.state = {flaggedMessages: []};
    this.updateFlaggedEmais();
    this.updateStats();
  }

  render() {
    const {flaggedMessages, stats} = this.state;
    return (
      <div className={styles.App}>
        <TopBar />
        <Foooter stats={stats} />
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

  private updateStats = async () => {
    const stats = await fetchStats();
    this.setState({
      stats,
    });
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
