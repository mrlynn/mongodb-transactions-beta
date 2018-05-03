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
