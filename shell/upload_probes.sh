# HOSTNAME=${1-}
curl -i -X POST --data-urlencode "data@$HOME/.probekit/probes.csv" http://10.41.254.133:4444/upload/