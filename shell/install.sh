#!/bin/bash
#=======================================================================
#
#          FILE:  install.sh
#
#         USAGE:  ./install.sh
#
#       OPTIONS:  ./install.sh
#  REQUIREMENTS:  ---
#         NOTES:  ---
#        AUTHOR: Brannon Dorsey, <brannon@brannondorsey.com>
#       COMPANY:  ---
#       CREATED: 03.17.2015
#      REVISION: 0.0.3
#=======================================================================

PROJECT_NAME="Probe Kit™"
POST_INSTALL_EXAMPLE_CMD="cd ../node
    sudo node server.js --interface=<device_name>"
DEPENDENCIES="wireshark mongodb git" # this var is only printed to screen, not used for install
DIR_NAME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

function install_homebrew() {

    echo "[install.sh] Installing homebrew..."
    if ruby -v &> /dev/null; then
        ( su $(logname) -c "$(prinf %q "$DIR_NAME/download_homebrew.sh")" )
    else
        echo "[install.sh] \"ruby\" is not installed. Please manually install ruby and try again."
        exit 1
    fi
}

# assumes apt-get or homebrew is installed
function install_package() {

    if [[ -n $1 ]]; then

        local PACKAGE=$1

        if [[ $OS == "Linux" ]]; then

    		# Debian, Ubuntu and derivatives (with apt-get)
    		if apt-get -v &> /dev/null; then
    			for PKG in $PACKAGE
    			do
    				echo "[install.sh] Installing '$PKG' with apt-get"
    			    apt-get install "$PKG"
    			    if [[ ! $? ]]; then
    			    	echo "[install.sh] ERROR: could not 'apt-get install $PKG', install failed."
    			    	exit 1;
    			    fi
    			done
    		# # Mandriva (with urpmi)
    		# elif which urpmi &> /dev/null; then
    		# 	urpmi "$DEPENDENCIES"
    		# # Fedora and CentOS (with yum)
    		# elif which yum &> /dev/null; then
    		# 	yum install "$DEPENDENCIES"
    		# # ArchLinux (with pacman)
    		# elif which pacman &> /dev/null; then
    		# 	pacman -Sy "$DEPENDENCIES"
    		# # Else, if no package manager has been found
    		else
    			echo "[install.sh] ERROR: No package manager found. Please, manually install:"
    			echo "	$PACKAGE"
                exit 1
    		fi

        elif [[ $OS == "Darwin" ]]; then

            if brew -v &> /dev/null; then
                for PKG in $PACKAGE
                do
                    echo "[install.sh] Installing '$PKG' with homebrew"
                    # use subshell because homebrew refuses to `brew install` unless it is
                    # owned by root: https://github.com/Homebrew/homebrew/issues/9953
                    ( su $(logname) -c "brew install $PKG" )
                    if [[ ! $?  ]]; then
                        echo "[install.sh] ERROR: could not 'brew install $PKG', install failed."
                        exit 1
                    fi
                done
            else
                echo "[install.sh] ERROR: No package manager found. Please, manually install:"
    			echo "	$PACKAGE"
                exit 1;
            fi
        fi
    fi
}

#Must be root
if [[ $EUID -ne 0 ]]; then
    echo "[install.sh] This script must be run as root:"
    echo "    sudo ./install.sh"
    exit 1
fi

# check internet connectivity
# wget -q --tries=10 --timeout=20 --spider http://google.com
# if [[ "$?" -ne "0" ]]; then
#     echo "[install.sh] You are not connected to the internet. Aborting install."
#     exit 1
# fi

#Must be linux
OS=$(uname);
if [[ $OS == "Linux" ]] || [[ $OS == "Darwin" ]]; then

    echo "$PROJECT_NAME requires the following dependencies:"
    echo "	$DEPENDENCIES"
    echo -n "[install.sh] Would you like to install them now? (Y/n):"
    read PKG_SURE
    if [[ $PKG_SURE == "Y" || $PKG_SURE == "y" || $PKG_SURE == "" ]] ; then

        if [[ $OS == "Darwin" ]]; then
            if ! brew -v &> /dev/null; then
                install_homebrew
            fi
        fi

        install_package "wireshark git mongodb"

        # create mongodb database folder
        mkdir -p /data/db
        
        bash "$DIR_NAME/generate_settings.sh"
        bash "$DIR_NAME/setup_capture_privileges.sh"

        echo ""
        echo "[install.sh] $PROJECT_NAME was installed successfully! You may now open $PROJECT_NAME."
        # echo "[install.sh] Run the following command(s) to get started:"
        # echo "    $POST_INSTALL_EXAMPLE_CMD"
        exit 0
    else
        echo "[install.sh] Not installing dependencies '$DEPENDENCIES', exiting install process."
        exit 0
    fi

else
    echo "[install.sh] $PROJECT_NAME is only supported on GNU/Linux and OSX systems."
    exit 1
fi
