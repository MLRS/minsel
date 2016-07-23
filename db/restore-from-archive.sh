#!/bin/sh

if [ $# -eq 0 ]
then
    echo "Usage: ./restore-from-archive TGZ_ARCHIVE"
    exit 1
fi

# Extract to temp directory
tmp="tmp"
rm -rf "$tmp"
mkdir -p "$tmp"
tar xvzf "$1" --directory "$tmp"

# Load into database
host="localhost"
source=`find "$tmp" -type d -name minsel`

echo "Restoring from $1 to $host"
mongorestore --drop --host "$host" --db minsel "$source"
