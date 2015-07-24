#!/bin/sh

LOCALDIR=web/
REMOTEDIR=/var/www/resources/minsel

echo "Push"
if [ "$1" = "-wet" ]; then
  echo "(For real)"
  rsync           --archive --compress --verbose --exclude=server-config.js --exclude=.git --exclude=node_modules --log-file=push.log $LOCALDIR linguist@mlrs.research.um.edu.mt:$REMOTEDIR
else
  echo "(Dry-run)"
  rsync --dry-run --archive --compress --verbose --exclude=server-config.js --exclude=.git --exclude=node_modules --log-file=push.log $LOCALDIR linguist@mlrs.research.um.edu.mt:$REMOTEDIR
  echo
  echo "### This was just a dry-run. To push for real, use the flag '-wet' ###"
fi
