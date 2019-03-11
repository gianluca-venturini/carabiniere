import {Button, Icon, Spinner} from '@blueprintjs/core';
import {IconNames} from '@blueprintjs/icons';
import * as React from 'react';
import * as styles from './top_bar.css';

export const TopBar = (props: {
  gmailAuthClick: () => void;
  fetchingData?: boolean;
}) => (
  <div className={styles.TopBar}>
    <Button onClick={props.gmailAuthClick} className={styles.AuthButton}>
      Gmail login
    </Button>
    {props.fetchingData === true ? (
      <div className={styles.status}>
        <Spinner size={14} />
        <span>analyzing emails...</span>
      </div>
    ) : (
      props.fetchingData === false && (
        <div className={styles.status}>
          <Icon icon={IconNames.ENDORSED} />
          <span>All email analyzed</span>
        </div>
      )
    )}
  </div>
);
