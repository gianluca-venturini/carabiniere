import * as cx from 'classnames';
import * as React from 'react';
import {Message} from '../types';
import * as styles from './content_body.css';

interface ContentBodyProps {
  messages: ReadonlyArray<Message>;
}

// TODO: fetch user email from backend in order to redirect correctly in all edge cases
const userEmail = 0;

export const ContentBody = (props: ContentBodyProps) => {
  const makeHandleClick = (emailId: string) => () => {
    window.open(`https://mail.google.com/mail/u/${userEmail}/#sent/${emailId}`);
  };
  return (
    <table className={cx('bp3-html-table', '.modifier', styles.ContentBody)}>
      <thead>
        <tr>
          <th>From</th>
          <th>To</th>
          <th>Subject</th>
          <th>Flags</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {props.messages.map((message) => (
          <tr
            className={styles.Row}
            key={`${message.emailServiceId}:${message.emailId}`}
            onClick={makeHandleClick(message.emailId)}
          >
            <td>{message.from}</td>
            <td>{message.to}</td>
            <td>{message.subject}</td>
            <td>{message.flags}</td>
            <td>{`${message.date}`}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
