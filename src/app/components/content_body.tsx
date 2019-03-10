import * as cx from 'classnames';
import * as React from 'react';
import {Message} from '../types';
import * as styles from './content_body.css';

interface ContentBodyProps {
  messages: ReadonlyArray<Message>;
}

export const ContentBody = (props: ContentBodyProps) => (
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
        <tr key={`${message.emailServiceId}:${message.emailId}`}>
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
