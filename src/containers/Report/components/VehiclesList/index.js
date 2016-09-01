import React from 'react';
import pure from 'recompose/pure';
import { connect } from 'react-redux';
import PowerList from 'components/PowerList';
import Filter from 'components/Filter';
import VehiclesList from 'components/InstancesList';
import listTypes from 'components/InstancesList/types';
import { reportVehiclesActions } from '../../actions';
import { vehiclesActions } from 'services/FleetModel/actions';
import * as fromFleetReducer from 'services/FleetModel/reducer';
import { getSelectedVehicles } from '../../reducer';

class ReportsVehiclesList extends React.Component {

  onVehicleCheck = (id, isInputChecked) => {
    this.props.chooseVehiclesForReport(id, isInputChecked);
  }

  onFilter = (filterString) => {
    this.props.setFiltering(filterString);
    this.props.filterFunc(filterString);
  }

  renderList() {
    return (
      <VehiclesList
        onItemClick={this.onVehicleCheck}
        data={this.props.vehicles}
        selectedItems={this.props.selectedVehicles}
        type={listTypes.withCheckboxes}
      />
    );
  }

  render() {
    return (
      <PowerList
        fixed={this.props.fixed}
        className={this.props.className}
        filter={
          <Filter filterFunc={this.onFilter} />
        }
        content={this.renderList()}
      />
    );
  }
}

ReportsVehiclesList.propTypes = {
  className: React.PropTypes.string,
  filterFunc: React.PropTypes.func.isRequired,
  setFiltering: React.PropTypes.func.isRequired,
  chooseVehiclesForReport: React.PropTypes.func.isRequired,
  vehicles: React.PropTypes.array.isRequired,
  selectedVehicles: React.PropTypes.array.isRequired,
  fixed: React.PropTypes.bool,
};

const mapState = (state) => ({
  vehicles: fromFleetReducer.getVehiclesEx(state),
  selectedVehicles: getSelectedVehicles(state).toArray(),
});
const mapDispatch = {
  chooseVehiclesForReport: reportVehiclesActions.chooseVehiclesForReport,
  setFiltering: reportVehiclesActions.setFiltering,
  filterFunc: vehiclesActions.filterVehicles,
};

const PureReportVehiclesList = pure(ReportsVehiclesList);

export default connect(mapState, mapDispatch)(PureReportVehiclesList);

