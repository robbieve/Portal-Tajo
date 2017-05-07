import React from 'react';
import ReactDOM from 'react-dom';
import pure from 'recompose/pure';
import { connect } from 'react-redux';
import { VelocityTransitionGroup } from 'velocity-react';
import { Chip,
  // FloatingActionButton, Paper,
      Card, CardHeader, CardText } from 'material-ui';

// import ContentAdd from 'material-ui/svg-icons/content/add';
// import ContentAddClose from 'material-ui/svg-icons/hardware/keyboard-arrow-down';

import MainActionButton from 'components/Controls/MainActionButton';
// import Layout from 'components/Layout';

import AlertsList from './AlertsList';

import { getAlertConditionByIdFunc,
    getAlertConditions } from 'services/AlertsSystem/reducer';

import * as alertKinds from 'services/AlertsSystem/alertKinds';

import styles from './styles.css';

const stylesChip = {
  margin: 4,
  height: 32,
};

// const stylesAddBtn = {
//   float: 'right',
// };

class GFAlerts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isAdding: false,
      expanded: false,
    };
  }

  onAddClick = () => {
    this.setState({ isAdding: !this.state.isAdding });
  }

  handleExpandChange = (expanded) => {
    this.setState({ expanded });
  }

  closeList = () => {
    this.setState({ isAdding: false });
  }
  render() {
    // const alertKindData = alertKinds.getAlertByKind(alertKinds._ALERT_KIND_GF);
    // <Avatar color="#156671" icon={alertKindData.icon} />
    const myGFAlerts = this.props.vehicleAlerts.map(alertId => (this.props.alertById(alertId)))
        .filter(alrt => alrt !== null && alrt.kind === alertKinds._ALERT_KIND_GF && alrt.onEnter === this.props.onEnter)
        .map(alrt => (
          <Chip
            key={alrt.id}
            onRequestDelete={() => (this.props.onRemoveClick(alrt.id))}
            style={stylesChip}
          >
            {alrt.gfName}
          </Chip>));
    return (
      <Card
        className={styles.wrapper}
        expanded={this.state.expanded}
        onExpandChange={this.handleExpandChange}
      >
        <CardHeader
          title={`${this.props.onEnter ? 'On Enter' : 'On Exit'} Location:
            ${myGFAlerts.length === 0 ? 'no' : myGFAlerts.length} alerts`}
          actAsExpander
          showExpandableButton
        />
        <VelocityTransitionGroup
          enter={{ animation: 'slideDown', duration: 200 }}
          leave={{ animation: 'slideUp', duration: 200 }}
        >
          { this.state.expanded && (<CardText expandable style={{ padding: 0, minHeight: 40 }}>
            <div
              style={{ float: 'right', margin: 4 }}
              ref={(componentInstance) => {
                this.rootNode = ReactDOM.findDOMNode(componentInstance);
              }}
            >
              <MainActionButton
                label={'ADD'}
                onClick={this.onAddClick}
              />
            </div>
            {/* <FloatingActionButton
          style={stylesAddBtn}
          onClick={this.onAddClick}
          ref={(componentInstance) => {
            this.rootNode = ReactDOM.findDOMNode(componentInstance);
          }}
        >
          {this.state.isAdding ? <ContentAddClose /> : <ContentAdd />}
        </FloatingActionButton>*/}
            <AlertsList
              isOpen={this.state.isAdding}
              handleRequestClose={this.closeList}
              anchorEl={this.rootNode}
              vehicleId={this.props.vehicleId}
              vehicleAlerts={this.props.vehicleAlerts}
              doAddAlert={this.props.doAddAlert}
              onEnter={this.props.onEnter}
            />

            <div className={styles.chipsWrapper}>
              {/* <VelocityTransitionGroup
            component="div"
            style={{ display: 'flex', flexWrap: 'wrap' }}
            enter={{ animation: 'slideDown', duration: 200 }}
            leave={{ animation: 'slideUp', duration: 200 }}
          >*/}
              {myGFAlerts}
              {/* </VelocityTransitionGroup>*/}
            </div>
          </CardText>)}
        </VelocityTransitionGroup>
      </Card>
    );
  }
}

GFAlerts.propTypes = {
  onEnter: React.PropTypes.bool.isRequired,
  vehicleId: React.PropTypes.string.isRequired,
  vehicleAlerts: React.PropTypes.arrayOf(React.PropTypes.string).isRequired,
  alertById: React.PropTypes.func.isRequired,
  alertConditions: React.PropTypes.array.isRequired,

  doAddAlert: React.PropTypes.func.isRequired,
  onRemoveClick: React.PropTypes.func.isRequired,
};

const mapState = state => ({
  alertById: getAlertConditionByIdFunc(state),
  alertConditions: getAlertConditions(state),
});
const mapDispatch = {
};

export default connect(mapState, mapDispatch)(pure(GFAlerts));
