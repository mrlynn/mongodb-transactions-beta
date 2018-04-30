#!/bin/sh
#MONGODB_BIN=/usr/local/bin
MONGODB_BIN=/usr/local/bin/mongodb-osx-x86_64-3.7.7/bin
DATA_DIR=./data/beta

echo "This beta test requires MongoDB > 3.7"
echo "Client Version: \c:"
mongo --version | grep -i "Shell version"
echo "Server Version: \c"
mongod --version | grep "db version"

# Clean up any old environment
killall mongod && sleep 3
rm -rf $DATA_DIR/env/r0 $DATA_DIR/env/r1 $DATA_DIR/env/r2

# Create DB file & log directories for each replica
mkdir -p $DATA_DIR/env/r0/log $DATA_DIR/env/r1/log $DATA_DIR/env/r2/log

# Start the 3 MongoDB replicas then just wait for a few secs for servers to start
$MONGODB_BIN/mongod --replSet TestRS --port 27000 --dbpath $DATA_DIR/env/r0 --fork --logpath $DATA_DIR/env/r0/log/mongod.log
$MONGODB_BIN/mongod --replSet TestRS --port 27001 --dbpath $DATA_DIR/env/r1 --fork --logpath $DATA_DIR/env/r1/log/mongod.log
$MONGODB_BIN/mongod --replSet TestRS --port 27002 --dbpath $DATA_DIR/env/r2 --fork --logpath $DATA_DIR/env/r2/log/mongod.log
sleep 3

# Connect to first replica with Mongo Shell and configre the Replica Set containing the 3 replicas
$MONGODB_BIN/mongo --port 27000 <<EOF
    rs.initiate({_id: "TestRS", members: [
        {_id: 0, host: "localhost:27000"},
        {_id: 1, host: "localhost:27001"},
        {_id: 2, host: "localhost:27002"}
    ], settings: {electionTimeoutMillis: 2000}});
EOF

echo
echo "Mongo Shell command to connect to replica set:"
echo
echo "$MONGODB_BIN/mongo mongodb://localhost:27000,localhost:27001,localhost:27002/?replicaSet=TestRS"
echo
