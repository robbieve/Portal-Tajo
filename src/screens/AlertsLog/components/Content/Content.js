import React from 'react';
import { css } from 'aphrodite/no-important';
import FixedContent from 'components/FixedContent';
import AlertsFilter from '../AlertsFilter/AlertsFilter';
import AlertsTimeline from '../AlertsTimeline/AlertsTimeline';
import classes from './classes';

const Content = () => {
  return (
    <FixedContent containerClassName={css(classes.contentWrapper)}>
      <AlertsFilter />
      <AlertsTimeline />
    </FixedContent>
  );
};

export default Content;