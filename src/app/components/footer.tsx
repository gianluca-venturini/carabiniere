import {Card, Elevation, Position, Spinner, Tooltip} from '@blueprintjs/core';
import * as React from 'react';
import {StatsResponse} from '../types';
import * as styles from './footer.css';

interface Props {
  stats?: StatsResponse;
}

// Animation on numbers
const COMPLETE_ANIMATION_MS = 1000;
const ANIMATION_FRAMES = 10;

export class Foooter extends React.Component<Props> {
  private oldStats?: StatsResponse;
  private startAnimation: number;
  private updateInterval?: number;

  constructor(props: Props) {
    super(props);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.stats === undefined) {
      return;
    }
    if (this.updateInterval !== undefined) {
      clearInterval(this.updateInterval);
    }
    this.oldStats = this.props.stats;
    this.startAnimation = new Date().getTime();
    this.updateInterval = window.setInterval(
      this.updateStats,
      COMPLETE_ANIMATION_MS / ANIMATION_FRAMES,
    );
  }

  render() {
    const {stats: newStats} = this.props;
    if (newStats === undefined) {
      return <Spinner size={Spinner.SIZE_SMALL} />;
    }
    const stats = this.oldStats ? this.oldStats : newStats;
    const percentAnimationCompletion = Math.min(
      (new Date().getTime() - this.startAnimation) / COMPLETE_ANIMATION_MS,
      1,
    );
    const displayStats = {
      ...newStats,
      fetchedEmails: this.interpolate(
        newStats.fetchedEmails,
        stats.fetchedEmails,
        percentAnimationCompletion,
      ),
      processedEmails: this.interpolate(
        newStats.processedEmails,
        stats.processedEmails,
        percentAnimationCompletion,
      ),
      discoveredEmails: this.interpolate(
        newStats.discoveredEmails,
        stats.discoveredEmails,
        percentAnimationCompletion,
      ),
    };
    return (
      <div className={styles.Footer}>
        {this.renderStat(
          'Estimated total emails',
          'Estimated number of emails to be processed',
          displayStats.totalMessages,
        )}
        {this.renderStat(
          'Discovered emails',
          'Email id found in inbox',
          displayStats.discoveredEmails,
        )}
        {this.renderStat(
          'Fetched emails',
          'Entire email fetched',
          displayStats.fetchedEmails,
        )}
        {this.renderStat(
          'Parsed emails',
          'Emails that already have completed all heuristics',
          displayStats.processedEmails,
        )}
        {this.renderStat(
          'Flagged emails',
          'Emails that contains sensitive information',
          displayStats.flaggedEmails,
        )}
      </div>
    );
  }

  private interpolate = (
    newValue: number,
    oldValue: number,
    percentage: number,
  ) => Math.round(newValue * percentage + oldValue * (1 - percentage))

  private updateStats = () => {
    this.forceUpdate();
  }

  private renderStat = (
    name: string,
    description: string,
    value: number | undefined,
  ) => (
    <Tooltip content={description} position={Position.TOP}>
      <Card
        interactive={true}
        elevation={Elevation.ZERO}
        className={styles.card}
      >
        <div>{name}</div>
        <div>{value || 0}</div>
      </Card>
    </Tooltip>
  )
}
