#!/bin/bash
#=======================================================================
#
#          FILE:  import_datapack.sh
#
#         USAGE:  import_datapack.sh <datapack> <collectionName>
#
#       OPTIONS:  import_datapack.sh
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

function die() {
    echo $1
    exit $2
}

if [[ $OS == "Linux" ]] || [[ $OS == "Darwin" ]]; then

    if [[ $# -lt "2" ]] || [[ ! -e $1 ]]; then
        die "Usage: import_datapack.sh <datapack> <collectionName>" 1
    fi

    DATA_PACK=$1
    COLLECTION_NAME=$2

    if mongo --version &>/dev/null && \
       mongod --version &>/dev/null && \
       mongoimport --version &>/dev/null ; then

        # check if mongo is running
        MONGOD_PROC_COUNT=$(ps aux | grep mongod | wc -l) 
        
        # grep outputs at least 1 result
        if [[ "$MONGOD_PROC_COUNT" -eq "1" ]]; then

            echo "[$SCRIPT_NAME] mongod is not running, launching mongod and sleeping for 5 seconds"
            mongod &>/dev/null &
            sleep 5 # allow mongod to start
        fi

        mkdir -p "$SETTINGS_DIR"

        if [[ $? -ne "0" ]]; then
            die "[$SCRIPT_NAME] $SETTINGS_DIR does not exist and could not be created" 1
        fi

        echo "[$SCRIPT_NAME] Setting up indexes for $COLLECTION_NAME collection"
        sed "s/COLLECTION_NAME/$COLLECTION_NAME/" "$DIR_NAME/../data/setup_mongo_indexes.js" | mongo

        if [[ $? -ne "0" ]]; then
            die "[$SCRIPT_NAME] Error setting up indexes for $COLLECTION_NAME collection" 1
        fi

        echo "[$SCRIPT_NAME] Importing $DATA_PACK to $COLLECTION_NAME collection"
        mongoimport --db probe --collection "$COLLECTION_NAME" --file "$DATA_PACK" --host=127.0.0.1

        if [[ $? -ne "0" ]]; then
            die "[$SCRIPT_NAME] Error importing $DATA_PACK to $COLLECTION_NAME collection" 1
        else
            echo "[$SCRIPT_NAME] Successfully imported $DATA_PACK to $COLLECTION_NAME collection"
            exit 0
        fi

    else
        die "[$SCRIPT_NAME] MongoDB is not installed. Please install mongod." 1 
    fi

else
    die "[$SCRIPT_NAME] This script is only supported on Linux and OSX platforms" 1
fi
