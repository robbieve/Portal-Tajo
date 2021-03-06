import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { List } from 'immutable';
import { css } from 'aphrodite/no-important';
import {
  translate,
  makePhrasesShape,
} from 'utils/i18n';
import { ALERT_KINDS } from 'services/AlertsSystem/alertKinds';
import LogsFilter from '../KindsFilter';
import phrases from '../../PropTYpes';
import TimelineHeader from './TimelineHeader';
import TimelineEvent from './TimelineEvent';
import classes from './AlertsTimeline.classes';

const EmptyTimeline = ({ translations }) => (
  <div className={css([classes.listWrapper, classes.listWrapper_empty])}>
    { translations.no_events_for_specified_period }
  </div>
);

EmptyTimeline.propTypes = {
  translations: makePhrasesShape(phrases).isRequired,
};

const TEmptyTimeline = translate(phrases)(EmptyTimeline);

function _makeHeaderTimeRange(range = {}) {
  const format = 'DD-MM-YYYY HH:mm';

  return {
    from: moment(range.fromDate).format(format),
    to: moment(range.toDate).format(format),
  };
}

function makeFilterFromKinds() {
  return new List(ALERT_KINDS).map(kind => kind.value);
}

class AlertsTimeline extends React.Component {

  constructor(props) {
    super(props);

    const filterKinds = makeFilterFromKinds();

    this.totalFiltersAmount = filterKinds.length;

    this.state = {
      activeKinds: filterKinds,
    };
  }

  /**
   * Update local state of active filters.
   * Filters array is immutable.
   *
   * @param {String} nextKind - one of available alerts kinds
   */
  onFilterKindsChange = (nextKind) => {
    const filterIndex = this.state.activeKinds.indexOf(nextKind);
    const nextFilters = this.state.activeKinds.update((list) => {
      if (filterIndex !== -1) return list.delete(filterIndex);

      return list.push(nextKind);
    });

    this.setState({
      activeKinds: nextFilters,
    });
  }

  filterEvents = event => this.state.activeKinds.indexOf(event.get('eventKind')) !== -1;

  renderEvents() {
    return this.props.entries.filter(this.filterEvents).map(event => (
      <TimelineEvent
        {...event.toJS()}
        key={event.get('id')}
      />
    ));
  }

  render() {
    const range = _makeHeaderTimeRange(this.props.dateRange);
    const isFilterActive = this.state.activeKinds.size !== this.totalFiltersAmount;
    const entries = this.renderEvents();

    return (
      <div className={css(classes.wrapper)}>
        <TimelineHeader
          dateRange={range}
          isDefaultRange={this.props.displayDefaultRange}
          totalAmount={this.props.entries.size}
          isFiltered={isFilterActive}
          filteredAmount={entries.size}
          selectedVehicleName={this.props.selectedVehicleName}
        />

        { this.props.entries.size !== 0 && (
          <LogsFilter
            onKindsChange={this.onFilterKindsChange}
            activeFilters={this.state.activeKinds}
            containerClassName={css(classes.filter)}
            labelClassName={css(classes.filter__label)}
          />
        )}

        { this.props.entries.size === 0 ? <TEmptyTimeline /> : (
          <div className={css(classes.listWrapper)}>
            { entries }
          </div>
        )}

      </div>
    );
  }
}

AlertsTimeline.propTypes = {
  entries: PropTypes.instanceOf(List).isRequired,
  displayDefaultRange: PropTypes.bool.isRequired,
  dateRange: PropTypes.shape({
    fromDate: PropTypes.instanceOf(Date).isRequired,
    toDate: PropTypes.instanceOf(Date).isRequired,
  }),
  selectedVehicleName: PropTypes.string,
};

AlertsTimeline.defaultTypes = {
  dateRange: undefined,
  selectedVehicleName: undefined,
};

export default AlertsTimeline;
