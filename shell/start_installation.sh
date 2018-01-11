BASEDIR=$(dirname $0)

node "$BASEDIR/../node/server.js" -i wlan4 &
sleep 30
#firefox --new-tab http://localhost:3000/habitat/japan.html >/dev/null 2>&1
/home/bbmac/Desktop/ProbeKit/public/habitat/nw-nyc/node_modules/nw/bin/nw /home/bbmac/Desktop/ProbeKit/public/habitat/nw-la/ 