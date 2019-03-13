import {Position, Spinner, Tag, Tooltip} from '@blueprintjs/core';
import * as cx from 'classnames';
import * as crypto from 'crypto-js';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as React from 'react';
import {AutoSizer} from 'react-virtualized/dist/commonjs/AutoSizer';
import {List, ListRowRenderer} from 'react-virtualized/dist/commonjs/List';
import {FlagExtra} from '../../server/email_flagger/type';
import {Message} from '../types';
import * as styles from './content_body.css';

interface ContentBodyProps {
  messages: ReadonlyArray<Message>;
  fetchingPages: boolean;
}

// TODO: fetch user email from backend in order to redirect correctly in all edge cases
const userEmail = 0;

const tagColorClasses = [
  styles.tagBlue,
  styles.tagViolet,
  styles.tagOrange,
  styles.tagGray,
  styles.tagYellow,
  styles.tagPink,
];

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
  const getTagClass = (flag: string) => {
    // Color based on an hash of the flag
    const classIndex =
      parseInt(crypto.SHA256(flag).toString(), 16) % tagColorClasses.length;
    return tagColorClasses[classIndex];
  };

  const renderHeader = (name: string, description: string) => (
    <Tooltip content={description} position={Position.BOTTOM}>
      <div className={styles.HeaderRow} key={name}>
        {name}
      </div>
    </Tooltip>
  );

  // Function for rendering one row of the table
  const rowRenderer: ListRowRenderer = ({style, index}) => {
    const {messages} = props;
    if (index >= messages.length) {
      // Render a spinner on the last row
      return (
        <div className={styles.Row} key={'loader'} style={style}>
          <Spinner size={14} className={styles.rowSpinner} />
        </div>
      );
    }

    const message = messages[index];
    return (
      <div
        className={styles.Row}
        key={`${message.emailServiceId}:${message.emailId}`}
        onClick={makeHandleClick(message.emailId)}
        style={style}
      >
        <div key='from'>{message.from}</div>
        <div key='to'>{message.to}</div>
        <div key='subject'>{message.subject}</div>
        <div key='flags'>
          {message.flags.map((flag) => {
            const flagLabel = (
              <Tag className={getTagClass(flag.flag)}>{flag.flag}</Tag>
            );
            const formatExtra = (extra: FlagExtra) => {
              return _.keys(extra)
                .map((extraName) => `${flag.extra[extraName]}`)
                .join(' - ');
            };
            return flag.extra ? (
              <Tooltip
                content={formatExtra(flag.extra)}
                position={Position.TOP}
              >
                {flagLabel}
              </Tooltip>
            ) : (
              flagLabel
            );
          })}
        </div>
        <div key='date'>{`${formatDate(message.date)}`}</div>
      </div>
    );
  };

  return (
    <div className={styles.ContentBody}>
      <AutoSizer>
        {({height, width}) => (
          <div>
            <div className={styles.ContentBodyTableHeader}>
              {renderHeader('From', 'Sender of the message')}
              {renderHeader('To', 'Receiver of the message')}
              {renderHeader('Subject', 'The subject of the email')}
              {renderHeader(
                'Flags',
                'One or more heuristics that identified the message as sensitive',
              )}
              {renderHeader('Date', 'Date in which the email was received')}
            </div>
            <div className={styles.ContentBodyTableBody}>
              <List
                height={height - 30}
                width={width}
                // Keep this value in sync with css
                rowHeight={30}
                rowCount={props.messages.length + (props.fetchingPages ? 1 : 0)}
                rowRenderer={rowRenderer}
              />
            </div>
          </div>
        )}
      </AutoSizer>
    </div>
  );
};
