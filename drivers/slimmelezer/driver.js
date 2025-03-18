'use strict';

const { Driver } = require('homey');
const fetch = require('node-fetch');

class SlimmeLezerDriver extends Driver 
{

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() 
  {
    //this.log('SlimmeLezer driver has been initialized');
  }

  /**
   * onPairListDevices is called when a user is adding a device
   * and the 'list_devices' view is called.
   * This should return an array with the data of devices that are available for pairing.
   */
  async onPairListDevices() {
    this.log('SlimmeLezerDriver searching mDNS for devices names "slimmelezer"');
    
    // Try mDNS discovery first
    const discoveryStrategy = this.getDiscoveryStrategy();
    const discoveryResults = discoveryStrategy.getDiscoveryResults();

    // Convert discovery results to devices array
    const devices = Object.values(discoveryResults).map(discoveryResult => {
      return {
        name: discoveryResult.name,
        data: {
          id: discoveryResult.id,
          address: discoveryResult.address
        },
      };
    });

    // If no devices found via mDNS, try slimmelezer.local
    if (devices.length === 0) {
      this.log('SlimmeLezerDriver mDNS fallback, searching for "slimmelezer.local" in network');

      try {
        const response = await fetch('http://slimmelezer.local/sensor/power_consumed');
        if (response.ok) {
          devices.push({
            name: 'SlimmeLezer+',
            data: {
              id: 'slimmelezer-local',
              address: 'slimmelezer.local'
            }
          });
        }
      } catch (error) {
        this.log('Could not connect to slimmelezer.local:', error);
      }
    }

    return devices;
  }

}

module.exports = SlimmeLezerDriver;
