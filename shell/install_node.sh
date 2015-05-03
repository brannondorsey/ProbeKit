#!/bin/bash
#=======================================================================
#
#          FILE:  install_node.sh
#
#         USAGE:  ./install_node.sh
#
#       OPTIONS:  ./install_node.sh
#  REQUIREMENTS:  ---
#         NOTES:  ---
#        AUTHOR: Brannon Dorsey, <brannon@brannondorsey.com>
#       COMPANY:  ---
#       CREATED: 04.30.2015
#      REVISION: 0.0.1
#=======================================================================


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

OS=$(uname)

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
        if [[ "$NODE_SURE" == "Y" || "$NODE_SURE" == "y" || "$NODE_SURE" == "" ]]; then
            install_node
        else
            echo "[install.sh] Aborting install process. Please install Nodejs v0.12 and other dependencies yourself."
            exit 0;
        fi

    fi
else
    echo "[install.sh] Nodejs is not installed, installing Nodejs..."
    install_node
fi