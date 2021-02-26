#!/usr/bin/env node

/**
 * @file hvac - Simple CLI for controlling Tuya-enabled smart plugs and switches
 * @author Avana Vana <dear.avana@gmail.com>
 * @version 1.1.0
 */

const TuyAPI = require('tuyapi');
const path = require('path');
const { name, version } = require('../package.json');
const dotenv = require('dotenv').config({
  path: path.join(__dirname, '../', '.env'),
});

/** @constant {Map} devices - A map created from a .env variable string containing device information that matches Tuya device id and key to a user-defined nickname that can be used as an argument in the CLI */

const devices = new Map(
  process.env.DEVICE_LIST.split(';').map((device) => [
    device.split(',')[0],
    { id: device.split(',')[1], key: device.split(',')[2] },
  ])
);

/** @constant {string} usage - Usage text to display on help option or error */

const usage = `Usage: ${name} <device> [ command ]

Simple CLI for controlling Tuya-enabled smart plugs and switches.

Arguments:
  device     Tuya-enabled device nickname (set in .env file)
  command    Either 'on' or 'off', or leave out to just get current device status.

Options:
  -h         Show this usage file`;

/**
 *  Wraps usage text in a console.info() call and exits the process with a specified exit code (default: 0)
 *
 *  @function showUsage
 *  @param {number} [code=0] - Node.js exit code, which is success (0) by default and should be (9) for any argument-related errors.
 */

const showUsage = (code = 0) => {
  if (code === 0) console.info(usage), process.exit(code);
  else console.error(usage), process.exit(code);
};

/**
 *  Generic handler for a Tuya-enabled device, which creates a TuyAPI class given a device nickname, using the {@link devices} Map, and processes given command.
 *
 *  @async
 *  @function commandDevice
 *  @param {string} config.deviceName - Device nickname, set in .env file
 *  @param {('on'|'off')} config.command - Optional command to send to device
 *  @returns {Boolean} Status of device after command, true for on, false for off
 */

const commandDevice = async ({ deviceName, command }) => {
  try {
    const device = new TuyAPI({
      id: devices.get(deviceName).id,
      key: devices.get(deviceName).key,
      issueGetOnConnect: false,
    });

    if (!device) throw new Error('Invalid device details.');

    await device.find();
    await device.connect();

    if (command === 'on' || command === 'off') {
      await device.set({ set: command === 'on' ? true : false });
    }

    const status = await device.get();
    if (!status) throw new Error("Couldn't get device status.");
    await device.disconnect();
    return status;
  } catch (err) {
    console.error(err.message);
  }
};

/**
 *  Parses CLI arguments into object that {@link commandDevice} can use
 *
 *  @function parseArgs
 *  @returns {Object} args - Object containing the device nickname and command (or null) user entered as CLI arguments
 */

const parseArgs = () => {
  const args = process.argv.slice(2);
  if (args.some((arg) => /^(?:--?[Hh](?:elp)?)$/.test(arg))) showUsage(0);
  if (args.length < 2) showUsage(9);
  return { deviceName: args[0], command: args[1] || null };
};

/** Do the thing @async */

(async () => {
  await commandDevice(parseArgs());
})();
