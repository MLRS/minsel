#!/bin/sh

LOCALDIR=web/
REMOTEDIR=/var/www/resources/minsel/
FLAGS="--recursive --compress --verbose --exclude=server-config.js --exclude=.DS_Store --exclude=.git --exclude=node_modules --log-file=push.log"

echo "Push"
if [ "$1" = "-wet" ]; then
  echo "(For real)"
  rsync           $FLAGS $LOCALDIR mlrs.research.um.edu.mt:$REMOTEDIR
else
  echo "(Dry-run)"
  rsync --dry-run $FLAGS $LOCALDIR mlrs.research.um.edu.mt:$REMOTEDIR
  echo
  echo "### This was just a dry-run. To push for real, use the flag '-wet' ###"
fi
