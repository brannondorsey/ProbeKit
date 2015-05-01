#!/bin/bash
#=======================================================================
#
#          FILE:  download_homebrew.sh
#
#         USAGE:  ./download_homebrew.sh
#
#       OPTIONS:  ./download_homebrew.sh
#  REQUIREMENTS:  ---
#         NOTES:  ---
#        AUTHOR: Brannon Dorsey, <brannon@brannondorsey.com>
#       COMPANY:  ---
#       CREATED: 05.01.2015
#      REVISION: 0.0.1
#=======================================================================

ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
