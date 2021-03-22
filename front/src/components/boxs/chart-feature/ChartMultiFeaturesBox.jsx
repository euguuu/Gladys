import { Component } from 'preact';
import { connect } from 'unistore/preact';
import Chart from 'react-apexcharts';
import cx from 'classnames';
import get from 'get-value';

import ChartPeriodDropDown from './ChartPeriodDropDown';
import { RequestStatus, DASHBOARD_BOX_STATUS_KEY, DASHBOARD_BOX_DATA_KEY } from '../../../utils/consts';

import actions from '../../../actions/dashboard/boxes/chart';

@connect('session,user,DashboardBoxDataChartBox,DashboardBoxStatusChartBox', actions)
class ChartMultiFeaturesBox extends Component {
  toggleDropDown = () => {
    this.props.toggleDropDown(this.props.box, this.props.x, this.props.y);
  };

  changeChartPeriod = async e => {
    this.setState({ loading: true });
    this.props.getChartOption(this.props.box, this.props.x, this.props.y, e.target.name);
    this.setState({ loading: false });
  };

  getChartTitle = async () => {
    this.setState({ loading: true });
    await this.props.getChartTitle(this.props.box, this.props.x, this.props.y);
    this.setState({ loading: false });
  };

  getChartOption = async () => {
    this.props.getChartOption(this.props.box, this.props.x, this.props.y);
  };

  componentDidMount() {
    this.getChartTitle(this.props.box, this.props.x, this.props.y);
    this.getChartOption(this.props.box, this.props.x, this.props.y);
  }

  render(props, { loading }) {
    const boxData = get(props, `${DASHBOARD_BOX_DATA_KEY}ChartBox.${props.x}_${props.y}`);
    const boxStatus = get(props, `${DASHBOARD_BOX_STATUS_KEY}ChartBox.${props.x}_${props.y}`);
    const options = get(boxData, 'options');
    const series = get(boxData, 'series');
    const apexType = get(boxData, 'apexType');
    const showDropDownChartBox = get(boxData, 'showDropDownChartBox');
    const chartPeriod = get(boxData, 'chartPeriod');

    return (
      <div class="card">
        <div class={cx('dimmer', { active: loading })}>
          <div class="dimmer-content">
            <div class="card-body" style="padding:0.5em;">
              <div class="d-flex align-items-baseline">
                <div class="h5 mb-3 mr-2">{props.box.chartName}</div>
                <div class="ml-auto lh-1">
                  <ChartPeriodDropDown
                    box={props.box}
                    x={props.x}
                    y={props.y}
                    chartPeriod={chartPeriod}
                    showDropDownChartBox={showDropDownChartBox}
                    toggleDropDown={this.toggleDropDown}
                    changeChartPeriod={this.changeChartPeriod}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class={cx('dimmer', { active: boxStatus === RequestStatus.Getting })}>
          <div class="loader" />
          <div class="dimmer-content" style="height:250px">
            {boxStatus === RequestStatus.Success && options && series && apexType && (
              <Chart options={options} series={series} type={apexType} class="chart-sm" height="250px" />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ChartMultiFeaturesBox;