import React from 'react';
import pure from 'recompose/pure';
import { connect } from 'react-redux';
import { Tabs, Tab } from 'material-ui/Tabs';
// import SwipeableViews from 'react-swipeable-views';
import PowerList from 'components/PowerList';
import Filter from 'components/Filter';
import ItemsList from 'components/InstancesList';
import Scrollable from 'components/Scrollable';
import listTypes from 'components/InstancesList/types';
import { vehiclesActions, gfActions } from 'services/FleetModel/actions';
import { getSelectedVehicleId } from 'services/FleetModel/reducer';
import * as listEvents from './events';
import * as mapEvents from 'containers/MapFleet/events';
import { dimensions } from 'configs/theme';

import styles from './styles.css';

class OperationalPowerList extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      currentExpandedVehicleId: undefined,
      currentExpandedGFId: undefined,
      selectedTab: listTypes.withVehicleDetails,
    };

    props.eventDispatcher.registerHandler(mapEvents.MAP_VEHICLE_SELECTED, this.onVehicleClick);
    props.eventDispatcher.registerHandler(mapEvents.MAP_GF_SELECTED, this.onGFClick);
  }
  //
  // TODO: done in MAP now - mounting order dependant, need be indepenent
  // componentDidMount() {
  //   const globalSelectedVehicleId = this.props.getSelectedVehicleId;
  //   if (globalSelectedVehicleId !== '') {
  //     this.onVehicleClick(globalSelectedVehicleId);
  //   }
  // }
  onGFClick = (itemId, isExpanded = true) => {
    this.onItemClick(itemId, isExpanded, 'location');
  }

  onVehicleClick = (itemId, isExpanded = true) => {
    this.onItemClick(itemId, isExpanded, 'vehicle');
    this.props.setSelectedVehicleId(itemId);
  }

  onItemClick = (itemId, isExpanded, type) => {
    this.props.eventDispatcher.fireEvent(listEvents.OPS_LIST_ITEM_SELECTED, itemId);
    const value = isExpanded ? itemId : undefined;
    let selectedTab;

    switch (type) {
      case 'vehicle': {
        selectedTab = listTypes.withVehicleDetails;

        this.setState({
          selectedTab,
          currentExpandedVehicleId: value,
        });
        break;
      }
      case 'location': {
        selectedTab = listTypes.withGFDetails;

        this.setState({
          selectedTab,
          currentExpandedGFId: value,
        });
        break;
      }
      default: break;
    }

    this.onTabChange(selectedTab);
  }

  onTabChange = (value) => {
    if (value === listTypes.withVehicleDetails
    || value === listTypes.withGFDetails) {
      this.props.eventDispatcher.fireEvent(listEvents.OPS_LIST_TAB_SWITCH, value, () => {
        this.setState({
          selectedTab: value,
        });
      });
    }
  }

  render() {
    return (
      <PowerList>
        <Tabs
          inkBarStyle={{
            backgroundColor: 'rgba(255,255,255,0.5)',
          }}
          className={styles.fullHeight}
          contentContainerClassName={styles.contentFullHeight}
          onChange={this.onTabChange}
          value={this.state.selectedTab}
        >
          <Tab
            label="Vehicles"
            value={listTypes.withVehicleDetails}
          >
            <Filter filterFunc={this.props.filterVehiclesFunc} />
            <Scrollable offsetTop={dimensions.powerlistFilterHeight}>
              <ItemsList
                scrollIntoView
                currentExpandedItemId={this.state.currentExpandedVehicleId}
                onItemClick={this.onVehicleClick}
                data={this.props.vehicles}
                type={listTypes.withVehicleDetails}
              />
            </Scrollable>
          </Tab>
          <Tab
            label="Locations"
            value={listTypes.withGFDetails}
          >
            <Filter filterFunc={this.props.filterGFsFunc} />
            <Scrollable offsetTop={dimensions.powerlistFilterHeight}>
              <ItemsList
                scrollIntoView
                currentExpandedItemId={this.state.currentExpandedGFId}
                onItemClick={this.onGFClick}
                data={this.props.gfs}
                type={listTypes.withGFDetails}
              />
            </Scrollable>
          </Tab>
        </Tabs>
      </PowerList>
    );
  }
}

OperationalPowerList.contextTypes = {
  muiTheme: React.PropTypes.object.isRequired,
};
OperationalPowerList.propTypes = {
  vehicles: React.PropTypes.array.isRequired,
  gfs: React.PropTypes.array.isRequired,
  eventDispatcher: React.PropTypes.object.isRequired,
  filterVehiclesFunc: React.PropTypes.func.isRequired,
  filterGFsFunc: React.PropTypes.func.isRequired,
  setSelectedVehicleId: React.PropTypes.func.isRequired,
  getSelectedVehicleId: React.PropTypes.string.isRequired,
};
const mapState = (state) => ({
  getSelectedVehicleId: getSelectedVehicleId(state),
});
const mapDispatch = {
  filterVehiclesFunc: vehiclesActions.filterVehicles,
  setSelectedVehicleId: vehiclesActions.setSelectedVehicleId,
  filterGFsFunc: gfActions.filterGFs,
};

const PureOperationalPowerList = pure(OperationalPowerList);

export default connect(mapState, mapDispatch)(PureOperationalPowerList);