#!/bin/zsh

# @file hvac-cron
# @desc Shell script meant to run on cron, which pings a Switchbot thermometer/hygrometer, logs its data, calculates moving averages of temperature and humidity, and then controls a Tuya-enabled heater to keep temperature conditions within a specified range
# @author Avana Vana <dear.avana@gmail.com>
# @version 2.1.0
# @requires [jq]{@link https://stedolan.github.io/jq/} (JSON parsing utility)

# note: to use in crontab, all paths in this file must be absolute for all files and non-built-in executables

# temperature & humidity (not yet implemented) preferences
max_t=25.5
min_t=24.5
#max_h=
#min_h=

# code directory - replace with path to your copy of "hvac" nodejs tuya CLI
base="/absolute-path-to/hvac"

# log directory - replace with path to your copy of "hvac" nodejs tuya CLI
logs="/private/var/log/hvac"

# retrieve current measurements (temperature & humidity) from Switchbot Meter
current=($(curl -s "https://api.switch-bot.com/v1.0/devices/${SWITCHBOT_METER_ID}/status" --header "Authorization: ${SWITCHBOT_API_KEY}" | /usr/local/bin/jq -r '.body.temperature, .body.humidity'))

if (( ${#current[@]} )); then

  # calculate rolling averages from last 5 measurements
  avg_t=$(cat "${logs}"/temp-humid.log | tail -n 5 | awk '{ sum += $2; n++} END {if (n > 0) print sum / n; }')
  avg_h=$(cat "${logs}"/temp-humid.log | tail -n 5 | awk '{ sum += $3; n++} END {if (n > 0) print sum / n; }')

  # log latest measurements
  echo -n "$(date '+%Y_%m_%d-%H%M') ${current[1]} ${current[2]} ${avg_t} ${avg_h}" >> "${logs}"/temp-humid.log

  # turn heater on or off based on temperature preferences and log event or lack thereof
  if [[ ${avg_t} -gt ${max_t} ]] ; then
    /usr/local/bin/node "${base}/bin/index.js" office-heater off
    echo " off" >> "${logs}"/temp-humid.log
  elif [[ ${avg_t} -lt ${min_t} ]] ; then
    /usr/local/bin/node "${base}/bin/index.js" office-heater on
    echo " on" >> "${logs}"/temp-humid.log
  else
    echo " --" >> "${logs}"/temp-humid.log
  fi

fi
