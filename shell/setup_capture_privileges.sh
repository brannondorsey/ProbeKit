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
#      REVISION: 0.0.2
#=======================================================================

OS=$(uname)
SCRIPT_NAME=$(basename $0)
DIR_NAME=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ISSUES_LINK="https://github.com/brannondorsey/ProbeKit/issues"

function osx_capture_privileges() {

    which tshark 2>/dev/null >/dev/null

    if [[ $? -ne 0 ]]; then
        echo "[$SCRIPT_NAME] Wireshark is not installed. Try running 'sudo ./install.sh' or install wireshark with:"
        echo "  brew install wireshark"
        exit 1
    fi

    # redirect to allow overwrite
    curl "https://bugs.wireshark.org/bugzilla/attachment.cgi?id=3373" > "$DIR_NAME/../data/ChmodBPF.tar.gz"
    
    if [[ $? -ne "0" ]] ; then
        echo "[$SCRIPT_NAME] Error downloading ChmodBPF.tar.gz with curl. Make sure that you are connected to the internet."
        exit 1
    fi

    tar zxf "$DIR_NAME/../data/ChmodBPF.tar.gz" --directory "$DIR_NAME/../data"
    open "$DIR_NAME/../data/ChmodBPF/Install ChmodBPF.app"
    echo "[$SCRIPT_NAME] Please enter your password in the \"Install Chmod\" app window"

    return 0
}

function linux_capture_privileges() {
    
    # check if wireshark is installed
    dpkg -s wireshark &>/dev/null

    if [[ $? -ne 0 ]]; then
        echo "[$SCRIPT_NAME] Wireshark is not installed. Try running 'sudo ./install.sh' or install wireshark with:"
        echo "  sudo apt-get install wireshark"
        exit 1;
    fi

    dpkg-reconfigure wireshark-common
    usermod -a -G wireshark $USER
    chown root:wireshark /usr/bin/dumpcap
    setcap cap_net_raw,cap_net_admin=eip /usr/bin/dumpcap
    getcap /usr/bin/dumpcap
    
    return 0
}

#Must be root
if [[ $EUID -ne 0 ]]; then
    echo "[$SCRIPT_NAME] This script must be run as root:"
    echo "    sudo ./$SCRIPT_NAME"
    exit 1
fi

if [[ $OS == "Linux" ]] || [[ $OS == "Darwin" ]]; then

    if [[ $OS == "Linux" ]]; then
        linux_capture_privileges
    else
        osx_capture_privileges
    fi

    if [[ $? -eq 0 ]]; then

        # echo "[$SCRIPT_NAME] Your capture privileges have been setup correctly."

        if [[ $OS == "Linux" ]]; then
            
            echo "A restart is required. Would you like to restart now? (Y/n):"
            read SURE;

            if [[ $SURE == "Y" ]] || [[ $SURE == "y" ]] || [[ $SURE == "" ]]; then
                reboot
            fi
        fi

    else # theoretically this should never be reached as errors should have already terminated script
        echo "[$SCRIPT_NAME] There was an error setting up your capture privileges. Check out $ISSUES_LINK\
        for more info or to submit a bug report."
        exit 1;
    fi

else
    echo "[$SCRIPT_NAME] This script is only supported on Linux and OSX platforms"
    exit 1
fi
