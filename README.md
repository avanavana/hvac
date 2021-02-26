# hvac

Simple CLI for controlling Tuya-enabled smart plugs and switches.

## Usage

```
Usage: hvac <device> [ command ] [ options ]

Simple CLI for controlling Tuya-enabled smart plugs and switches.

Arguments:
  device     Tuya-enabled device nickname (set in .env file)
  command    Either 'on' or 'off', or leave out to just get current device status.

Options:
  -h         Show this usage file
  -v         Show the version number
```

## What can I do with this?

You can use it to simply turn on and off linked devices by name on the command line, or use it for more in-depth automation. Included is a sample implementation in a cron job, which takes temperature and humidity data from a Switchbot Meter (through the Switchbot HTTP API), logs it to a file that can be used for stats/graphs/etc, calculates a rolling average, and then uses that average to turn on or off a heater if it is above or below a threshold set in the script.

## Installation

1. Clone or fork this repo and do npm install in the project directory to install dependencies.
2. Change `sample.env` to `.env`, and replace the sample values with your own in the format provided. `device-01-name,device-01-id,device-01-key;device-02-name,device-02-id,device-02-key`. Device Name, ID, and Key for each device separated by commas, and each device separated by a semicolon. To get this information, you will need to install [`tuya-cli`](https://github.com/TuyaAPI/cli) and follow the instructions [here](https://github.com/codetheweb/tuyapi/blob/master/docs/SETUP.md), after which you will have the necessary IDs and keys for each device. The device name here is any nickname you want to use to refer to it via command line.
3. If you want to use the cron job, and you have a Switchbot Meter and Hub, you can generate an API key with their mobile app: Go to Profile &rsaquo; Preferences, then tap 'App Version' 10 times, after which 'Developer Options' will show up - tap on that, and then tap 'Get Token', and use it in the indicated place in the shell script. To get your Switchbot Meter ID, send an HTTP GET request to `https://api.switch-bot.com/v1.0/devices/`, and all linked devices, along with their IDs will be returned. With both the Switchbot API key and device/meter ID filled in, change the `max_t`, `min_t`, `base`, and `logs` variables to your desired maximum (shut-off) temperature, minimum (turn-on) temperature, repository directory, and log-out directory, respectively. I find that as a cron job, it works well run every 5 minutes or so, so add a line to your crontab that looks something like `*/5 * * * * /absolute-path-to/hvac/hvac-cron > /dev/null 2>&1`.

MIT &copy;2021, Avana Vana
