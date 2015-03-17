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
POST_INSTALL_EXAMPLE_CMD="cd ../node\n    sudo node server.js --interface=wlan0"

#Must be root
if [[ $EUID -ne 0 ]]; then
    echo "This script must be run as root:" #1>&2
    echo "    sudo ./install.sh"
    exit 0
fi

#Must be linux
OS=$(uname -o &> /dev/null);
if [[$OS != "GNU/Linux"]]; then
	echo "$PROJECT_NAME is only supported on GNU/Linux systems."
	exit 0
fi

#Update node deb file for v0.12
if [[which node &> /dev/null]]; then
	CURRENT_NODE_VERSION=$(node --version);
	if [[CURRENT_NODE_VERSION =~ "^v0\.12\.*"]]; then
		echo "Current Nodejs $CURRENT_NODE_VERSION supported."
	else
		echo "$PROJECT_NAME requires Nodejs version v0.12.x."
		echo "You currently have Nodejs version $CURRENT_NODE_VERSION installed."
		echo "Would you like to uprade to Nodejs version v0.12 now? (Y/n):"
		read NODESURE;
		if [$NODESURE != "Y" || $NODESURE != "y" || $NODESURE != ""]; then
			echo "Aborting install process. Please install Nodejs v0.12 yourself."
			exit 0;
		fi
	fi
fi

echo "Updating Nodejs deb source to v0.12.x."
curl -sL https://deb.nodesource.com/setup_0.12 | bash -

#install dependencies
#TODO missing anything in $DEPENDENCIES?
# Modified Script by martedì at http://www.mirkopagliai.it/bash-scripting-check-for-and-install-missing-dependencies/
PKGSTOINSTALL="tshark nodejs"
EXTRAPKGSTOINSTALL=""

# If some dependencies are missing, asks if user wants to install
if [ "$PKGSTOINSTALL" != "" ]; then
	
	echo "$PROJECT_NAME requires the following dependencies:"
	echo "	$PKGSTOINSTALL"
	echo -n "Would you like to install them now? (Y/n):"
	read PKGSURE

	if [ "$EXTRAPKGSTOINSTALL" != "" ]; then
		echo "$PROJECT_NAME supports the following addon dependencies:"
		echo "	$EXTRAPKGSTOINSTALL"
		echo -n "Would you like to install them now? (Y/n):"
		read EXTRAPKGSURE
	fi

	# If user want to install missing dependencies
	if [[ $PKGSURE = "Y" || $PKGSURE = "y" || $PKGSURE = "" || $EXTRAPKGSURE = "Y" || $EXTRAPKGSURE = "y" || $EXTRAPKGSURE = "" ]] ; then
		# Debian, Ubuntu and derivatives (with apt-get)
		if which apt-get &> /dev/null; then
			if [[ $PKGSURE = "Y" || $PKGSURE = "y" || $PKGSURE = "" ]]; then 
				apt-get install $PKGSTOINSTALL
			fi
			if [[ $EXTRAPKGSURE = "Y" || $EXTRAPKGSURE = "y" || $EXTRAPKGSURE = "" ]]; then
				apt-get install $PKGSTOINSTALL
			fi
		# OpenSuse (with zypper)
		#elif which zypper &> /dev/null; then
		#	zypper in $PKGSTOINSTALL
		# Mandriva (with urpmi)
		elif which urpmi &> /dev/null; then
			if [[ $PKGSURE = "Y" || $PKGSURE = "y" || $PKGSURE = "" ]]; then 
				urpmi $PKGSTOINSTALL
			fi
			if [[ $EXTRAPKGSURE = "Y" || $EXTRAPKGSURE = "y" || $EXTRAPKGSURE = "" ]]; then
				urpmi $PKGSTOINSTALL
			fi
		# Fedora and CentOS (with yum)
		elif which yum &> /dev/null; then
			if [[ $PKGSURE = "Y" || $PKGSURE = "y" || $PKGSURE = "" ]]; then 
				yum install $PKGSTOINSTALL
			fi
			if [[ $EXTRAPKGSURE = "Y" || $EXTRAPKGSURE = "y" || $EXTRAPKGSURE = "" ]]; then
				yum install $PKGSTOINSTALL
			fi
		# ArchLinux (with pacman)
		elif which pacman &> /dev/null; then
			if [[ $PKGSURE = "Y" || $PKGSURE = "y" || $PKGSURE = "" ]]; then 
				pacman -Sy $PKGSTOINSTALL
			fi
			if [[ $EXTRAPKGSURE = "Y" || $EXTRAPKGSURE = "y" || $EXTRAPKGSURE = "" ]]; then
				pacman -Sy $PKGSTOINSTALL
			fi
		# Else, if no package manager has been found
		else
			# Set $NOPKGMANAGER
			NOPKGMANAGER=TRUE
			echo "ERROR: No package manager found. Please, manually install:"
			echo "	$PKGSTOINSTALL"
			echo "and (optional):"
			echo "	$EXTRAPKGSTOINSTALL"
		fi
	fi
fi

echo "$PROJECT_NAME was installed successfully!"
echo "Run the following command(s) to get started:"
echo "    $POST_INSTALL_EXAMPLE_CMD"
exit 0