# this is a hook where you can put cusom bash scripts that
# are run inside of install.sh. This script is run right after
# all other install processes have run but before the install.sh
# script finishes (see install.sh to see exactly where)
# This script is gauranteed to have sudo privileges

# download and install mappacks/datapacks

DIR_NAME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCRIPT_NAME=$(basename $0)
SETTINGS_DIR="$HOME/.probekit"

function download() {
    
    local CITY_NAME=$1
    local MAPPACK_FILENAME=$2
    local DATAPACK_FILENAME=$3
    local COLLECTION_NAME=$4

    echo "[$SCRIPT_NAME] downloading $CITY_NAME map pack"
    
    local DOWNLOAD_CMD="curl -L $(printf %q "$GITHUB_RELEASE_URL/$MAPPACK_FILENAME") -o $(printf %q "$SETTINGS_DIR/maps/tiles/$MAPPACK_FILENAME")"
    
    if [[ $(whoami) == "root" ]]; then
        ( su $(logname) -c "$DOWNLOAD_CMD")
    else
        $DOWNLOAD_CMD
    fi

    echo "[$SCRIPT_NAME] installing $CITY_NAME map pack"
    unzip -q "$SETTINGS_DIR/maps/tiles/$MAPPACK_FILENAME" -d "$SETTINGS_DIR/maps/tiles"
    rm "$SETTINGS_DIR/maps/tiles/$MAPPACK_FILENAME"

    DOWNLOAD_CMD="curl -L $(printf %q "$GITHUB_RELEASE_URL/$DATAPACK_FILENAME") -o $(printf %q "$SETTINGS_DIR/$DATAPACK_FILENAME")"

    echo "[$SCRIPT_NAME] downloading $CITY_NAME data pack"
    
    if [[ $(whoami) == "root" ]]; then
        ( su $(logname) -c "$DOWNLOAD_CMD" )
    else
        $DOWNLOAD_CMD
    fi

    echo "[$SCRIPT_NAME] installing Chicago data pack"
    unzip -q "$SETTINGS_DIR/$DATAPACK_FILENAME" -d "$SETTINGS_DIR"
    "$DIR_NAME/../import_datapack.sh" "$SETTINGS_DIR/$COLLECTION_NAME.json" "$COLLECTION_NAME"
    rm "$SETTINGS_DIR/$COLLECTION_NAME.json" "$SETTINGS_DIR/$DATAPACK_FILENAME"
}

echo -n "[install.sh] Would you like to install the map/data packs? (Y/n):"
read PACK_SURE
if [[ $PACK_SURE == "Y" || $PACK_SURE == "y" || $PACK_SURE == "" ]] ; then

    GITHUB_RELEASE_URL="https://github.com/brannondorsey/ProbeKit/releases/download/v0.2.0"

    FILE_SIZE_CHICAGO="115M"
    FILE_SIZE_MIAMI="105M"
    FILE_SIZE_NYC="360M"
    FILE_SIZE_LONDON="293M"
    FILE_SIZE_INDIANAPOLIS="72M"
    FILE_SIZE_TOKYO="581M"
    FILE_SIZE_BERLIN="277M"
    FILE_SIZE_FUKUOKA="45M"

    MAPPACK_FILENAME_CHICAGO="mappack_chicago_41.8781_-87.6297_16km_zoom_0-17.zip"
    MAPPACK_FILENAME_MIAMI="mappack_miami_25.7818_-80.2551_25km_zoom_0-17.zip"
    MAPPACK_FILENAME_NYC="mappack_nyc_40.7265_-73.9946_30km_zoom_0-17.zip"
    MAPPACK_FILENAME_LONDON="mappack_london_51.5066_-0.1280_20km_zoom_0-17.zip"
    MAPPACK_FILENAME_INDIANAPOLIS="mappack_indianapolis_39.7684_-86.1580_18km_zoom_0-17.zip"
    MAPPACK_FILENAME_TOKYO="mappack_tokyo_35.6894_139.6917_40km_zoom_0-17.zip"
    MAPPACK_FILENAME_BERLIN="mappack_berlin_52.5182_13.4019_20km.zip"
    MAPPACK_FILENAME_FUKUOKA="mappack_fukuoka_33.6245_130.4358_20km.zip"

    DATAPACK_FILENAME_CHICAGO="datapack_chicago_2015-4-19.zip"
    DATAPACK_FILENAME_MIAMI="datapack_miami_2015-4-19.zip"
    DATAPACK_FILENAME_NYC="datapack_nyc_2015-9-14.zip"
    DATAPACK_FILENAME_LONDON="datapack_london_2015-9-17.zip"
    DATAPACK_FILENAME_INDIANAPOLIS="datapack_indianapolis_2015-9-14.zip"
    DATAPACK_FILENAME_TOKYO="datapack_tokyo_2015-9-14.zip"
    DATAPACK_FILENAME_BERLIN="datapack_berlin_2015-9-24.zip"
    DATAPACK_FILENAME_FUKUOKA="datapack_fukuoka_2015-9-24.zip"

    echo "[$SCRIPT_NAME] Available data packs:"
    echo "Seperate multiple selections with spaces, e.g. \"1 3 4\""
    echo "  (0) Download all [1.85G]"
    echo "  (1) Berlin, DE [$FILE_SIZE_BERLIN]"
    echo "  (2) Chicago, IL, USA [$FILE_SIZE_CHICAGO]"
    echo "  (3) Fukuoka, JP [$FILE_SIZE_FUKUOKA]"
    echo "  (4) Indianapolis, IN, USA [$FILE_SIZE_INDIANAPOLIS]"
    echo "  (5) London, UK [$FILE_SIZE_LONDON]"
    echo "  (6) Miami, FL, USA [$FILE_SIZE_MIAMI]"
    echo "  (7) New York, NY, USA, [$FILE_SIZE_NYC]"    
    echo "  (8) Tokyo, JP [$FILE_SIZE_TOKYO]"
    echo ""
    echo -n "Selection: "
    
    # make if not exist
    mkdir -p $SETTINGS_DIR

    read -a PACK_SELECTION

    for SELECTION in ${PACK_SELECTION[@]}; do
        
        if [[ $SELECTION == "0" ]]; then

            # download all
            download "Berlin" $MAPPACK_FILENAME_BERLIN $DATAPACK_FILENAME_BERLIN "wigleBerlin"
            download "Chicago" $MAPPACK_FILENAME_CHICAGO $DATAPACK_FILENAME_CHICAGO "wigleChicago"
            download "Fukuoka" $MAPPACK_FILENAME_FUKUOKA $DATAPACK_FILENAME_FUKUOKA "wigleFukuoka"
            download "Indianapolis" $MAPPACK_FILENAME_INDIANAPOLIS $DATAPACK_FILENAME_INDIANAPOLIS "wigleIndianapolis"
            download "London" $MAPPACK_FILENAME_LONDON $DATAPACK_FILENAME_LONDON "wigleLondon"
            download "Miami" $MAPPACK_FILENAME_MIAMI $DATAPACK_FILENAME_MIAMI "wigleMiami"
            download "New York" $MAPPACK_FILENAME_NYC $DATAPACK_FILENAME_NYC "wigleNyc"
            download "Tokyo" $MAPPACK_FILENAME_TOKYO $DATAPACK_FILENAME_TOKYO "wigleTokyo"

        elif [[ $SELECTION == "1" ]]; then
            download "Berlin" $MAPPACK_FILENAME_BERLIN $DATAPACK_FILENAME_BERLIN "wigleBerlin"
        elif [[ $SELECTION == "2" ]]; then
            download "Chicago" $MAPPACK_FILENAME_CHICAGO $DATAPACK_FILENAME_CHICAGO "wigleChicago"
        elif [[ $SELECTION == "3" ]]; then
            download "Fukuoka" $MAPPACK_FILENAME_FUKUOKA $DATAPACK_FILENAME_FUKUOKA "wigleFukuoka"
        elif [[ $SELECTION == "4" ]]; then
            download "Indianapolis" $MAPPACK_FILENAME_INDIANAPOLIS $DATAPACK_FILENAME_INDIANAPOLIS "wigleIndianapolis"
        elif [[ $SELECTION == "5" ]]; then
            download "London" $MAPPACK_FILENAME_LONDON $DATAPACK_FILENAME_LONDON "wigleLondon"
        elif [[ $SELECTION == "6" ]]; then
            download "Miami" $MAPPACK_FILENAME_MIAMI $DATAPACK_FILENAME_MIAMI "wigleMiami"
        elif [[ $SELECTION == "7" ]]; then
            download "New York" $MAPPACK_FILENAME_NYC $DATAPACK_FILENAME_NYC "wigleNyc"
        elif [[ $SELECTION == "8" ]]; then
            download "Tokyo" $MAPPACK_FILENAME_TOKYO $DATAPACK_FILENAME_TOKYO "wigleTokyo"
        fi     
    done
fi