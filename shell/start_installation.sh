BASEDIR=$(dirname $0)

node "$BASEDIR/../node/server.js" -i wlan1 &
sleep 30
firefox --new-tab http://localhost:3000/habitat/japan.html >/dev/null 2>&1
