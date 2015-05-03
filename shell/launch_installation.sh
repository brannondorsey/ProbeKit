#!/bin/bash
#=======================================================================
#
#          FILE:  launch_installation.sh
#
#         USAGE:  ./launch_installation
#
#       OPTIONS:  ./launch_installation
#  REQUIREMENTS:  ---
#         NOTES:  ---
#        AUTHOR: Brannon Dorsey, <brannon@brannondorsey.com>
#       COMPANY:  ---
#       CREATED: 05.03.2015
#      REVISION: 0.0.1
#=======================================================================

DIR_NAME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PATH_TO_SERVER="$DIR_NAME/../node/server.js"
PATH_TO_UPLOAD_SERVER="$DIR_NAME/../node/upload_server.js"

# check if app is already running
if [[ $(ps aux | grep "$PATH_TO_SERVER" | wc -l) -eq 1 ]]; then

    echo "Pulling changes to master"

    cd "$DIR_NAME/.."
    git checkout master
    git pull origin master

    echo " Installation is not running. Running installation."

    /usr/local/bin/node "$PATH_TO_SERVER"  -i en1 &
    /usr/local/bin/node "$PATH_TO_UPLOAD_SERVER" &

    echo "servers launched, sleeping 10 seconds"
    sleep 10
    echo "launching Google Chrome"
    # /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --kiosk &

else
    echo " Installation is already running. Exiting."
fi

