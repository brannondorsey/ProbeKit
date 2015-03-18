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
#        AUTHOR: Brannon Dorsey, brannon@brannondorsey.com)
#       COMPANY:  ---
#       CREATED: 03.17.2015
#      REVISION: 0.0.1
#=======================================================================

scriptfile="$(readlink -f $0)"
CURRENT_DIR="$(dirname ${scriptfile})"
PROJECT_NAME="This project"
POST_INSTALL_EXAMPLE_CMD="cd ../node
    sudo node server.js --interface=wlan0"

#Must be root
if [[ $EUID -ne 0 ]]; then
    echo "[install.sh] This script must be run as root:" #1>&2
    echo "    sudo ./install.sh"
    exit 0
fi

#Must be linux
OS=$(uname -o);
if [[ $OS != "GNU/Linux" ]]; then
	echo "[install.sh] $PROJECT_NAME is only supported on GNU/Linux systems."
	exit 0
fi

#Update node deb file for v0.12
if which node &> /dev/null; then
	CURRENT_NODE_VERSION=$(node --version | cut -c1-5);
	if [[ "$CURRENT_NODE_VERSION" = "v0.12" ]]; then
		echo "[install.sh] Current Nodejs version $CURRENT_NODE_VERSION supported."

	else
		echo "[install.sh] $PROJECT_NAME requires Nodejs version v0.12.x."
		echo "[install.sh] You currently have Nodejs version $CURRENT_NODE_VERSION installed."
		echo "[install.sh] Would you like to uprade to Nodejs version v0.12 now? (Y/n):"
		read NODESURE;
		if [[ "$NODESURE" != "Y" || "$NODESURE" != "y" || "$NODESURE" != "" ]]; then
			echo "[install.sh] Aborting install process. Please install Nodejs v0.12 yourself."
			exit 0;
		else
			echo "[install.sh] Updating Nodejs deb source to v0.12.x."
			curl -sL https://deb.nodesource.com/setup_0.12 | bash -
		fi
	fi
fi

#install dependencies
#TODO missing anything in $DEPENDENCIES?
# Modified Script by martedì at http://www.mirkopagliai.it/bash-scripting-check-for-and-install-missing-dependencies/
PKGSTOINSTALL="nodejs tshark"

# If some dependencies are missing, asks if user wants to install
if [[ "$PKGSTOINSTALL" != "" ]]; then
	
	echo "$PROJECT_NAME requires the following dependencies:"
	echo "	$PKGSTOINSTALL"
	echo -n "[install.sh] Would you like to install them now? (Y/n):"
	read PKGSURE

	# If user want to install missing dependencies
	if [[ $PKGSURE = "Y" || $PKGSURE = "y" || $PKGSURE = "" ]] ; then
		# Debian, Ubuntu and derivatives (with apt-get)
		if which apt-get &> /dev/null; then
			for PKG in $PKGSTOINSTALL
			do
				echo "[install.sh] Installing '$PKG'"
			    apt-get install "$PKG"
			    if [ "$?" != "0" ]; then
			    	echo "[install.sh] ERROR: could not 'apt-get install $PKG', install failed."
			    	exit 1;
			    fi
			done
		# # Mandriva (with urpmi)
		# elif which urpmi &> /dev/null; then
		# 	urpmi "$PKGSTOINSTALL"
		# # Fedora and CentOS (with yum)
		# elif which yum &> /dev/null; then
		# 	yum install "$PKGSTOINSTALL"
		# # ArchLinux (with pacman)
		# elif which pacman &> /dev/null; then
		# 	pacman -Sy "$PKGSTOINSTALL"
		# # Else, if no package manager has been found
		else
			# Set $NOPKGMANAGER
			NOPKGMANAGER=TRUE
			echo "[install.sh] ERROR: No package manager found. Please, manually install:"
			echo "	$PKGSTOINSTALL"
		fi
	else
		echo "[install.sh] Not installing dependencies '$PKGSTOINSTALL', exiting install process"
		exit 0;
	fi
fi

echo "[install.sh] $PROJECT_NAME was installed successfully!"
echo "[install.sh] Run the following command(s) to get started:"
echo "    $POST_INSTALL_EXAMPLE_CMD"
exit 0