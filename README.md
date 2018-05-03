## MongoDB BETA Transactions Testing

This repository was assembled to help you participate in the `MongoDB BETA Transactions` program.

## How do I use this?

* Read the [Docs](https://docs-beta-transactions.mongodb.com/)
* Join the [Google Group](https://groups.google.com/forum/#!topic/mongodb-txnbeta/ML8jxxvnRKM)
* Clone this repository.
* Download / install MongoDB Version 3.7.7
  * [OSX Server](https://fastdl.mongodb.org/osx/mongodb-osx-ssl-x86_64-3.7.7.tgz)
  * [Windows Server](https://www.mongodb.com/dr/fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-ssl-3.7.7-signed.msi/download)
  * ... There are more links [here](https://groups.google.com/forum/#!topic/mongodb-txnbeta/ML8jxxvnRKM)
* Once you've cloned this repo, View and tailor the [generate.sh](https://github.com/mrlynn/mdb-transactions-beta/blob/master/generate.sh) script variables that dictate where your MongoDB Binaries and where the Data should live.
* Now that `generate.sh` is tailored, go ahead and run it.  Make sure you see output similar to the following:

```
$ sh generate.sh
This beta test requires MongoDB > 3.7
Client Version: MongoDB shell version v3.7.7
Server Version: db version v3.7.7
2018-05-03T07:05:44.831-0400 I CONTROL  [main] Automatically disabling TLS 1.0, to force-enable TLS 1.0 specify --sslDisabledProtocols 'none'
about to fork child process, waiting until server is ready for connections.
forked process: 4550
child process started successfully, parent exiting
2018-05-03T07:05:45.633-0400 I CONTROL  [main] Automatically disabling TLS 1.0, to force-enable TLS 1.0 specify --sslDisabledProtocols 'none'
about to fork child process, waiting until server is ready for connections.
forked process: 4553
child process started successfully, parent exiting
2018-05-03T07:05:46.450-0400 I CONTROL  [main] Automatically disabling TLS 1.0, to force-enable TLS 1.0 specify --sslDisabledProtocols 'none'
about to fork child process, waiting until server is ready for connections.
forked process: 4556
child process started successfully, parent exiting
2018-05-03T07:05:50.600-0400 I NETWORK  [main] Secure Transport Initialized
MongoDB shell version v3.7.7
connecting to: mongodb://127.0.0.1:27000/
MongoDB server version: 3.7.7
{
	"ok" : 1,
	"operationTime" : Timestamp(1525345550, 1),
	"$clusterTime" : {
		"clusterTime" : Timestamp(1525345550, 1),
		"signature" : {
			"hash" : BinData(0,"AAAAAAAAAAAAAAAAAAAAAAAAAAA="),
			"keyId" : NumberLong(0)
		}
	}
}
bye

Mongo Shell command to connect to replica set:

/Users/mlynn/.mongodb/versions/mongodb-current/bin/mongo mongodb://localhost:27000,localhost:27001,localhost:27002/?replicaSet=rs0

```

The `generate.sh` script will perform a check on the versions of MongoDB Client and Server that you have installed.  If you do not have the appropriate versions installed, generate will exit and tell you about it.  If you have installed the appropriate versions - but it's still failing, check the PATH to ensure that the correct versions of the mongo shell and the mongod server are being executed.

You may need to modify your $PATH - or the $MONGODB_BIN variable to ensure that you're testing using the appropriate versions.

You should now have a replica set of 3 instances running locally on your machine.  To verify, you can use something like the following:

```
$ ps -ef | grep mongo
  502  6699     1   0  7:36AM ??         0:04.97 /Users/mlynn/.mongodb/versions/mongodb-current/bin/mongod --replSet rs0 --port 27000 --dbpath ./data/beta/env/r0 --fork --logpath ./data/beta/env/r0/log/mongod.log
  502  6703     1   0  7:36AM ??         0:04.67 /Users/mlynn/.mongodb/versions/mongodb-current/bin/mongod --replSet rs0 --port 27001 --dbpath ./data/beta/env/r1 --fork --logpath ./data/beta/env/r1/log/mongod.log
  502  6706     1   0  7:36AM ??         0:04.56 /Users/mlynn/.mongodb/versions/mongodb-current/bin/mongod --replSet rs0 --port 27002 --dbpath ./data/beta/env/r2 --fork --logpath ./data/beta/env/r2/log/mongod.log
  502  7249  2858   0  7:43AM ttys000    0:00.00 grep mongo
```

If you see something similar to the following, something has failed in the launching of your instances. 

```
$ ps -ef | grep mongod
  502  7288  2858   0  7:43AM ttys000    0:00.00 grep mongod
```



## NodeJS
* Ensure that you have all necessary [NodeJS](http://nodejs.org) requirements installed including npm
* Once you've cloned this repository, run `npm install` to install the necessary requirements found in `package.json`.
* If you modified the [generate.sh](https://github.com/mrlynn/mdb-transactions-beta/blob/master/generate.sh) script to change the ports for the test replica set and/or the location for the data - you will need to modify [generate.sh](https://github.com/mrlynn/mdb-transactions-beta/blob/master/beta_examples.js) to modify the function which establishes the connection to the test mongod instances.

Note line 8 below for references to specific port numbers - this will likely be line 15 in the beta_examples.js

```
 before(function() {
    //
    // You'll need to modify the next line with testContext.url to your specific mongodb environment.
    // If you want a quick way to spin up a simple replica set have a look at:
    // https://github.com/mrlynn/mdb-transactions-beta/blob/master/generate.sh
    // this script will render a simple replica set of three nodes running locally on ports 27000,27001,27002
    //
    testContext.url = 'mongodb://localhost:27000,localhost:27001,localhost:27002/test?replicaSet=rs0';
    return MongoClient.connect(testContext.url)
    .then(client =>
      client.db('test').createCollection('shipment')
        .then(() => client.db('test').createCollection('inventory'))
        .then(() => client.db('test').collection('inventory').insertOne({ sku: 'abc123', qty: 500 }))
        .then(() => client.close())
    );
  });
  ```


