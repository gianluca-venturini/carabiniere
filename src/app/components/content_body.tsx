import {Position, Tooltip} from '@blueprintjs/core';
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
          {message.flags.map((flag) => {
            const flagLabel = (
              <span className='bp3-tag .modifier'>{flag.flag}</span>
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
        <div>{`${formatDate(message.date)}`}</div>
      </div>
    );
  };

  return (
    <div className={styles.ContentBody}>
      <div className={styles.ContentBodyTableHeader}>
        <th>
          <Tooltip content={'Sender of the message'} position={Position.BOTTOM}>
            From
          </Tooltip>
        </th>
        <th>
          <Tooltip
            content={'Receiver of the message'}
            position={Position.BOTTOM}
          >
            To
          </Tooltip>
        </th>
        <th>
          <Tooltip
            content={'The subject of the email'}
            position={Position.BOTTOM}
          >
            Subject
          </Tooltip>
        </th>
        <th>
          <Tooltip
            content={
              'One or more heuristics that identified the message as sensitive'
            }
            position={Position.BOTTOM}
          >
            Flags
          </Tooltip>
        </th>
        <th>
          <Tooltip
            content={'Date in which the email was received'}
            position={Position.BOTTOM}
          >
            Date
          </Tooltip>
        </th>
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
