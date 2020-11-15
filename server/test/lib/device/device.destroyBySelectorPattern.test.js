const EventEmitter = require('events');

const Device = require('../../../lib/device');

const StateManager = require('../../../lib/state');

const event = new EventEmitter();

describe('Device', () => {
  it('save test param', async () => {
    const stateManager = new StateManager(event);
    stateManager.setState('device', 'test-device', {
      id: 'cfsmb47f-4d25-4381-8923-2633b23192sm',
      name: 'test',
      selector: 'testSelectorPattern',
    });

    const device = new Device(event, {}, stateManager);
    await device.destroyBySelectorPattern('testSelectorPattern');
  });
});