HOSTNAME=${1-localhost}
curl -i -X POST --data-urlencode "data@$HOME/.probekit/probes.csv" http://$HOSTNAME:4444/upload/