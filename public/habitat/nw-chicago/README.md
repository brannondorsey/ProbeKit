# Probe Kit Habitat Installation #
## chicago version ##

### to run ###

`` ./node_modules/nw/bin/nw ``


### when making a new city nw installation change the following ###

`` package.json:5: update path ``

`` index.html:157: var CITY_LIST = ["chicago"] to new city ``

`` index.html:441: nw-chicago to new city ``

`` add public/habitat/nw-chicago/node_modules/ to .gitignore in root ``


### keyboard shortcuts ###

* Q: quit app
* W: toggle kiosk mode
* S: toggle status frame
* H: toggle hide/show mouse