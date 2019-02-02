#!/bin/sh

LOCALDIR=web/
# HOST=mlrs.research.um.edu.mt
# REMOTEDIR=/var/www/resources/minsel/
HOST=10.249.1.100
REMOTEDIR=/var/www/public_html/resources/minsel/
FLAGS="--recursive --checksum --compress --verbose --exclude-from=deploy-exclude.txt --log-file=deploy.log"

echo "Deploy Minsel"
if [ "$1" = "-wet" ]; then
  echo "(For real)"
  rsync           $FLAGS $LOCALDIR $HOST:$REMOTEDIR
  echo
  echo "### Remember you might need to run 'npm install' and 'pm2 restart minsel' on the server ###"
else
  echo "(Dry-run)"
  rsync --dry-run $FLAGS $LOCALDIR $HOST:$REMOTEDIR
  echo
  echo "### This was just a dry-run. To push for real, use the flag '-wet' ###"
fi
