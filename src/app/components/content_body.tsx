import * as moment from 'moment';
import * as React from 'react';
import {AutoSizer} from 'react-virtualized/dist/commonjs/AutoSizer';
import {List, ListRowRenderer} from 'react-virtualized/dist/commonjs/List';
import {Message} from '../types';
import * as styles from './content_body.css';

interface ContentBodyProps {
  messages: ReadonlyArray<Message>;
}

// TODO: fetch user email from backend in order to redirect correctly in all edge cases
const userEmail = 0;

/**
 * Renders all the emails.
 * It's optimized for rendering large number of elements, it only renders what's visible
 */
export const ContentBody = (props: ContentBodyProps) => {
  const makeHandleClick = (emailId: string) => () => {
    window.open(`https://mail.google.com/mail/u/${userEmail}/#sent/${emailId}`);
  };
  const formatDate = (date: Date) => {
    const now = new Date();
    if (now.getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
      return moment(date).fromNow();
    } else {
      return moment(date).format('LL');
    }
  };
  // Function for rendering one row of the table
  const rowRenderer: ListRowRenderer = ({style, index}) => {
    const {messages} = props;
    const message = messages[index];
    return (
      <div
        className={styles.Row}
        key={`${message.emailServiceId}:${message.emailId}`}
        onClick={makeHandleClick(message.emailId)}
        style={style}
      >
        <div>{message.from}</div>
        <div>{message.to}</div>
        <div>{message.subject}</div>
        <div>
          {message.flags.map((flag) => (
            <span className='bp3-tag .modifier'>{flag}</span>
          ))}
        </div>
        <div>{`${formatDate(message.date)}`}</div>
      </div>
    );
  };

  return (
    <div className={styles.ContentBody}>
      <div className={styles.ContentBodyTableHeader}>
        <th>From</th>
        <th>To</th>
        <th>Subject</th>
        <th>Flags</th>
        <th>Date</th>
      </div>
      <AutoSizer>
        {({height, width}) => (
          <div className={styles.ContentBodyTableBody}>
            <List
              height={height}
              width={width}
              // Keep this value in sync with css
              rowHeight={30}
              rowCount={props.messages.length}
              rowRenderer={rowRenderer}
            />
          </div>
        )}
      </AutoSizer>
    </div>
  );
};
