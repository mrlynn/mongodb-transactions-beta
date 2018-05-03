#!/bin/sh
#
# Modify the MONGODB_BIN variable to point to the directory where you have MongoDB's binaries.
# This will likely be different if you're running this as part of a beta - testing pre-release software.
# Some common locations follow:
# MONGODB_BIN=/usr/local/bin
# MONGODB_BIN=/usr/local/bin/mongodb-osx-x86_64-3.7.7/bin
#
MONGODB_BIN=/Users/mlynn/.mongodb/versions/mongodb-current/bin
#
# Modify the DATA_DIR to point to the directory where you want the MongoDB data to reside
#
DATA_DIR=./data/beta

#
# Ports for replica sets
#
PORT1=27000
PORT2=27001
PORT3=27002
source ./.env 2> /dev/null
#
# This test requires a specific version of MongoDB
#
echo "This beta test requires MongoDB > 3.7"
echo "Client Version: \c:"
CLIENT_VERSION=$(${MONGODB_BIN}/mongo --version | grep version | head -1 | cut -d' ' -f4|cut -d'v' -f2)
echo $CLIENT_VERSION
CLIENT_MAJOR=$(echo $CLIENT_VERSION | cut -d. -f1)
CLIENT_MINOR=$(echo $CLIENT_VERSION | cut -d. -f2)
CLIENT_MICRO=$(echo $CLIENT_VERSION | cut -d. -f3)
if [ "$CLIENT_MAJOR" -lt "3" ]; then
  echo "Must have at least Major Version 3, Minor Version 7 and Micro Version 7 of mongod installed.";
  exit;
fi
if [ "$CLIENT_MINOR" -lt "7" ]; then
    echo "Must have at least version 3.7.7";
    exit
fi
echo "Server Version: \c"
SERVER_VERSION=$(${MONGODB_BIN}/mongod --version | grep version | head -1 | cut -d' ' -f3|cut -d'v' -f2)
echo $SERVER_VERSION
SERVER_MAJOR=$(echo $SERVER_VERSION | cut -d. -f1)
SERVER_MINOR=$(echo $SERVER_VERSION | cut -d. -f2)
SERVER_MICRO=$(echo $SERVER_VERSION | cut -d. -f3)
if [ "$SERVER_MAJOR" -lt "3" ]; then
  echo "Must have at least Major Version 3, Minor Version 7 and Micro Version 7 of mongod installed.";
  exit;
fi
if [ "$SERVER_MINOR" -lt "7" ]; then
    echo "Must have at least version 3.7.7";
    exit
fi

$MONGODB_BIN/mongod --version | grep "db version"

#
# Clean up any old environment
#
killall mongod && sleep 3
rm -rf $DATA_DIR/env/r0 $DATA_DIR/env/r1 $DATA_DIR/env/r2

#
# Create DB file & log directories for each replica
#
mkdir -p $DATA_DIR/env/r0/log $DATA_DIR/env/r1/log $DATA_DIR/env/r2/log

# Start the 3 MongoDB replicas then just wait for a few secs for servers to start
$MONGODB_BIN/mongod --replSet rs0 --port ${PORT1} --dbpath $DATA_DIR/env/r0 --fork --logpath $DATA_DIR/env/r0/log/mongod.log
$MONGODB_BIN/mongod --replSet rs0 --port ${PORT2} --dbpath $DATA_DIR/env/r1 --fork --logpath $DATA_DIR/env/r1/log/mongod.log
$MONGODB_BIN/mongod --replSet rs0 --port ${PORT3} --dbpath $DATA_DIR/env/r2 --fork --logpath $DATA_DIR/env/r2/log/mongod.log
sleep 3

# Connect to first replica with Mongo Shell and configre the Replica Set containing the 3 replicas
$MONGODB_BIN/mongo --port $PORT1 <<EOF
    rs.initiate({_id: "rs0", members: [
        {_id: 0, host: "localhost:${PORT1}"},
        {_id: 1, host: "localhost:${PORT2}"},
        {_id: 2, host: "localhost:${PORT3}"}
    ], settings: {electionTimeoutMillis: 2000}});
EOF

echo
echo "Mongo Shell command to connect to replica set:"
echo
echo "$MONGODB_BIN/mongo mongodb://localhost:${PORT1},localhost:${PORT2},localhost:${PORT3}/?replicaSet=rs0"
echo
