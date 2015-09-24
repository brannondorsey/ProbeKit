BASEDIR=$(dirname $0)

"$BASEDIR/../node server -i wlan1" &
sleep 30
firefox --new-tab http://localhost:3000/habitat/japan.html
