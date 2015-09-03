# this is a hook where you can put cusom bash scripts that
# are run inside of install.sh. This script is run right after
# all other install processes have run but before the install.sh
# script finishes (see install.sh to see exactly where)
# This script is gauranteed to have sudo privileges

# download and install mappacks/datapacks

DIR_NAME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCRIPT_NAME=$(basename $0)
SETTINGS_DIR="$HOME/.probekit"

echo -n "[install.sh] Would you like to install the Chicago map/data packs? (Y/n):"
read PACK_SURE
if [[ $PACK_SURE == "Y" || $PACK_SURE == "y" || $PACK_SURE == "" ]] ; then

    MAPPACK_URL="https://github.com/brannondorsey/ProbeKit/releases/download/v0.2.0/mappack_chicago_41.8781_-87.6297_16km_zoom_0-17.zip"
    DATAPACK_URL="https://github.com/brannondorsey/ProbeKit/releases/download/v0.2.0/datapack_chicago_2015-4-19.zip"

    # make if not exist
    mkdir -p $SETTINGS_DIR

    echo "[$SCRIPT_NAME] downloading Chicago map pack"
    ( su $(logname) -c "curl -L $(printf %q "$MAPPACK_URL") -o $(printf %q "$SETTINGS_DIR/maps/tiles/mappack_chicago.zip")" )
    echo "[$SCRIPT_NAME] installing Chicago map pack"
    unzip -q "$SETTINGS_DIR/maps/tiles/mappack_chicago.zip" -d "$SETTINGS_DIR/maps/tiles"
    rm "$SETTINGS_DIR/maps/tiles/mappack_chicago.zip"

    echo "[$SCRIPT_NAME] downloading Chicago data pack"
    ( su $(logname) -c "curl -L $(printf %q "$DATAPACK_URL") -o $(printf %q "$SETTINGS_DIR/datapack_chicago_2015-4-19.zip")" )
    echo "[$SCRIPT_NAME] installing Chicago data pack"
    unzip -q "$SETTINGS_DIR/datapack_chicago_2015-4-19.zip" -d "$SETTINGS_DIR"
    "$DIR_NAME/../import_datapack.sh" "$SETTINGS_DIR/wigleChicago.json" "wigleChicago"
    rm "$SETTINGS_DIR/wigleChicago.json"

fi