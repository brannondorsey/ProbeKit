#!/bin/bash
#=======================================================================
#
#          FILE:  setup_capture_privileges.sh
#
#         USAGE:  setup_capture_privileges.sh
#
#       OPTIONS:  setup_capture_privileges.sh
#  REQUIREMENTS:  ---
#         NOTES:  ---
#        AUTHOR: Brannon Dorsey, <brannon@brannondorsey.com>
#       COMPANY:  ---
#       CREATED: 04.25.2015
#      REVISION: 0.0.1
#=======================================================================

OS=$(uname)
SCRIPT_NAME=$(basename $0)

#Must be root
if [[ $EUID -ne 0 ]]; then
    echo "[$SCRIPT_NAME] This script must be run as root:" #1>&2
    echo "    sudo ./$SCRIPT_NAME"
    exit 1
fi

if [[ $OS == "Linux" ]] || [[ $OS == "Darwin" ]]; then

    if [[ $OS == "Linux" ]]; then
        linux_capture_privileges();
    else
        osx_capture_privileges();
    fi
else
    echo "This script is only supported on Linux and OSX platforms";
    exit 1;
fi

function osx_capture_privileges() {

}

function linux_capture_privileges() {
    
    # check if wireshark is installed
    dpkg -s wireshark 2>/dev/null >/dev/null

    if [[ $? -ne 0 ]]; then
        echo "[$SCRIPT_NAME] Wireshark is not installed. Try running 'sudo ./install.sh' or install wireshark with:"
        echo "  sudo apt-get install wireshark"
        exit 1;
    fi

    dpkg-reconfigure wireshark-common 
    usermod -a -G wireshark $USER
    
    echo "[$SCRIPT_NAME] Your capture privileges have been setup correctly. Would you like to restart now? (Y/n):"
    read SURE;

    if [[ $SURE == "Y" ]] || [[ $SURE == "y" ]] || [[ $SURE == "" ]]; then
        gnome-session-quit --logout --no-prompt
    fi
}