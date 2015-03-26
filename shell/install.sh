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
#      REVISION: 0.0.2
#=======================================================================

PROJECT_NAME="Probe Request Collector's Kit"
POST_INSTALL_EXAMPLE_CMD="cd ../node
    sudo node server.js --interface=<device_name>"
DEPENDENCIES="nodejs@v0.12 tshark git" # this var is only printed to screen, not used for install

# https://learn.bevry.me/node/install
function install_node() {

    if [[ $OS == "Linux" ]]; then

        echo "[install.sh] Updating Nodejs deb source to v0.12.x."
        curl -sL https://deb.nodesource.com/setup_0.12 | bash -
        install_package "nodejs"

    elif [[ $OS == "Darwin" ]]; then

        # Install nvm if not installed
        if ! nvm -v &> /dev/null; then

            if ! git -v &> /dev/null; then

                echo "[install.sh] Installing git..."
                install_package "git"
            fi

            echo "[install.sh] Installing Node Version Manager (nvm)..."
            git clone git://github.com/creationix/nvm.git ~/.nvm
            printf "\n# NVM\nif [ -s ~/.nvm/nvm.sh ]; then\n\tNVM_DIR=~/.nvm\n\tsource ~/.nvm/nvm.sh\nfi" >> ~/.profile
            export NVM_DIR=~/.nvm
            source ~/.nvm/nvm.sh
        fi

        echo "[install.sh] Installing nodejs v0.12 using nvm..."
        nvm install v0.12.0

        if [[ ! $? ]]; then
            echo "[install.sh] ERROR: nvm failed to nodejs v0.12. Please manually install nodejs v0.12."
            exit 1;
        fi

        nvm alias default 0.12
        nvm use 0.12
    fi
}

function install_homebrew() {

    echo "[install.sh] Installing homebrew..."
    if ruby -v &> /dev/null; then
        ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
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
                exit 1;
    		fi

        elif [[ $OS == "Darwin" ]]; then

            if brew -v &> /dev/null; then
                for PKG in $PACKAGE
                do
                    echo "[install.sh] Installing '$PKG' with homebrew"
                    brew install "$PKG"
                    if [ "$?" != "0" ]; then
                        echo "[install.sh] ERROR: could not 'brew install $PKG', install failed."
                        exit 1;
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
    echo "[install.sh] This script must be run as root:" #1>&2
    echo "    sudo ./install.sh"
    exit 1
fi

#Must be linux
OS=$(uname);
if [[ $OS != "Linux" ]] || [[ $OS != "Darwin" ]]; then
	 echo "[install.sh] $PROJECT_NAME is only supported on GNU/Linux and OSX systems."
	 exit 1
fi

echo "$PROJECT_NAME requires the following dependencies:"
echo "	$DEPENDENCIES"
echo -n "[install.sh] Would you like to install them now? (Y/n):"
read PKG_SURE
if [[ $PKG_SURE != "Y" ]] || [[ $PKG_SURE != "y" ]] || [[ $PKG_SURE != "" ]] ; then
    echo "[install.sh] Not installing dependencies '$DEPENDENCIES', exiting install process."
    exit 0;
fi

if [[ $OS == "Darwin" ]]; then
  if xcode-select -v &> /dev/null; then
    # if xcode command line tools are not installed
    if ! xcode-select -p &> /dev/null; then
      echo "[install.sh] Installing xcode command line tools..."
      xcode-select --install
    fi
  else
    echo "[install.sh] \"xcode-select\" is not installed. Please install Xcode from the App store."
    exit 1
  fi
fi

if node -v &> /dev/null ; then

	CURRENT_NODE_VERSION=$(node --version | cut -c1-5);
	if [[ "$CURRENT_NODE_VERSION" == "v0.12" ]]; then
		echo "[install.sh] Current Nodejs version $CURRENT_NODE_VERSION supported. Not installing Nodejs."
	else
		echo "[install.sh] $PROJECT_NAME requires Nodejs version v0.12"
		echo "[install.sh] You currently have Nodejs version $CURRENT_NODE_VERSION installed."
		echo "[install.sh] Would you like to uprade to Nodejs version v0.12 now? (Y/n):"
		read NODE_SURE;
		if [[ "$NODE_SURE" != "Y" ]] || [[ "$NODE_SURE" != "y" ]] || [[ "$NODE_SURE" != "" ]]; then
			echo "[install.sh] Aborting install process. Please install Nodejs v0.12 and other dependencies yourself."
			exit 0;
		fi
        install_node
	fi
else

  if [[ $OS == "Darwin" ]]; then
      if ! brew -v &> /dev/null; then
          install_homebrew
      fi
  fi

  echo "[install.sh] Nodejs is not installed, installing Nodejs..."
  install_node
fi

# install the rest of the dependencies now that
# package managers and nodejs v0.12 are definately installed
install_package "tshark git"

echo "[install.sh] $PROJECT_NAME was installed successfully!"
echo "[install.sh] Run the following command(s) to get started:"
echo "    $POST_INSTALL_EXAMPLE_CMD"
exit 0
