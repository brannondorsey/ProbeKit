#!/bin/bash
#=======================================================================
#
#          FILE:  generate_settings.sh
#
#         USAGE:  generate_settings.sh
#
#       OPTIONS:  generate_settings.sh
#  REQUIREMENTS:  ---
#         NOTES:  ---
#        AUTHOR: Brannon Dorsey, <brannon@brannondorsey.com>
#       COMPANY:  ---
#       CREATED: 04.30.2015
#      REVISION: 0.0.1
#=======================================================================

OS=$(uname)
SCRIPT_NAME=$(basename $0)
DIR_NAME=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
SETTINGS_DIR="$HOME/.probekit"

if [[ $OS == "Linux" ]] || [[ $OS == "Darwin" ]]; then

    # generate ~/.probekit (plus the maps/tiles path)
    mkdir -p "$SETTINGS_DIR/maps/tiles"

    # generate ~/.probekit/probes.csv if not there
    if [[ ! -e "$SETTINGS_DIR/probes.csv" ]] ; then
        touch "$SETTINGS_DIR/probes.csv"
        chown $(logname) "$SETTINGS_DIR/probes.csv"
    fi

    if [[ $? -ne 0 ]]; then
        echo "[$SCRIPT_NAME] Error creating $HOME/.probekit folder"
        exit 1
    fi

    INTERFACE="en1"
    if [[ $OS == "Linux" ]]; then
        INTERFACE="wlan0"
    fi

    MONGOD_PATH=$(which mongod)

    SETTINGS=$(cat "$DIR_NAME/../data/settings_template.json")
    SETTINGS=$(echo "$SETTINGS" | sed "s/INTERFACE/$INTERFACE/")
    SETTINGS=$(echo "$SETTINGS" | sed "s;MONGOD_PATH;$MONGOD_PATH;")

    echo "$SETTINGS" > "$SETTINGS_DIR/settings.json"

else
    echo "[$SCRIPT_NAME] This script is only supported on Linux and OSX platforms"
    exit 1
fi
