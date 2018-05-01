const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const expect = require('chai').expect;
const MongoNetworkError = mongodb.MongoNetworkError;

const testContext = {};
describe('Beta Examples (transactions)', function() {
  before(function() {
    testContext.url = 'mongodb://localhost:27017/test?replicaSet=rs0';
    return MongoClient.connect(testContext.url)
    .then(client =>
      client.db('test').createCollection('shipment')
        .then(() => client.db('test').createCollection('inventory'))
        .then(() => client.db('test').collection('inventory').insertOne({ sku: 'abc123', qty: 500 }))
        .then(() => client.close())
    );
  });

  afterEach(() => testContext.client.close());
  beforeEach(function() {
    testContext.client = new MongoClient(testContext.url);
    return testContext.client.connect();
  });

  it('example with explicit start, commit, and abort (promises)', function() {
    const client = testContext.client;

    // Start Beta Transaction Example 1 (promises)
    const db = client.db('test');
    const promise = client.withSession(session => {
      session.startTransaction();

      return db
        .collection('inventory')
        .updateOne({ sku: 'abc123' }, { $inc: { qty: -100 } }, { session })
        .then(() =>
          db.collection('shipment').insertOne({ sku: 'abc123', qty: 100 }, { session })
        )
        .then(() => session.commitTransaction())
        .catch(err => {
          if (err) console.dir(err);
          session.abortTransaction();
        });
    });
    // End Beta Transaction Example 1 (promises)

    return promise.then(() => client.close());
  });

  it('example with explicit start, commit, and abort (async-await)', async function() {
    const client = testContext.client;

    // Start Beta Transaction Example 1 (async-await)
    const db = client.db('test');
    const promise = client.withSession(
      session =>
        async function() {
          session.startTransaction();

          try {
            await db
              .collection('inventory')
              .updateOne({ sku: 'abc123' }, { $inc: { qty: -100 } }, { session });
            await db.collection('shipment').insertOne({ sku: 'abc123', qty: 100 }, { session });
          } catch (err) {
            if (err) console.dir(err);
            session.abortTransaction();
            throw err;
          }

          await session.commitTransaction();
        }
    );
    // End Beta Transaction Example 1 (async-await)

    return promise.then(() => client.close());
  });

  it('example with write concern override (promises)', function() {
    const client = testContext.client;

    // Start Beta Transaction Example 2 (promises)
    // In the following block, the following write concerns are used:
    // the updateOne and insertOne operations uses w = 1, the transaction commit/abort uses w = "majority".
    // Only abort and commit respect the writeConcern. Uncommitted writes are not replicated.

    const db = client.db('test');
    const promise = client.withSession(session => {
      session.startTransaction({ writeConcern: { w: 'majority' } });

      return db
        .collection('inventory')
        .updateOne({ sku: 'abc123' }, { $inc: { qty: -100 } }, { session })
        .then(() =>
          // The write concern specified here will be ignored
          db
            .collection('shipment')
            .insertOne({ sku: 'abc123', qty: 100 }, { session, writeConcern: { w: 1 } })
        )
        .then(() => session.commitTransaction())
        .catch(err => {
          if (err) console.dir(err);
          session.abortTransaction();
        });
    });
    // End Beta Transaction Example 2 (promises)

    return promise.then(() => client.close());
  });

  it('example with write concern override (async-await)', function() {
    const client = testContext.client;

    // Start Beta Transaction Example 2 (async-await)
    // In the following block, the following write concerns are used:
    // the updateOne and insertOne operations uses w = 1, the transaction commit/abort uses w = "majority".
    // Only abort and commit respect the writeConcern. Uncommitted writes are not replicated.

    const db = client.db('test');
    const promise = client.withSession(
      session =>
        async function() {
          session.startTransaction({ writeConcern: { w: 'majority' } });

          try {
            await db
              .collection('inventory')
              .updateOne({ sku: 'abc123' }, { $inc: { qty: -100 } }, { session });
            await db
              .collection('shipment')
              .insertOne({ sku: 'abc123', qty: 100 }, { session, writeConcern: { w: 1 } });
          } catch (err) {
            if (err) console.dir(err);
            session.abortTransaction();
            throw err;
          }

          await session.commitTransaction();
        }
    );
    // End Beta Transaction Example 2 (async-await)

    return promise.then(() => client.close());
  });

  it('example with retryability (promises)', function() {
    const client = testContext.client;

    // Start Beta Transaction Example 3 (promises)
    function runShipmentTransaction(db, session) {
      session.startTransaction();
      return db
        .collection('inventory')
        .updateOne({ sku: 'abc123' }, { $inc: { qty: -100 } }, { session })
        .then(() =>
          // The write concern specified here will be ignored
          db
            .collection('shipment')
            .insertOne({ sku: 'abc123', qty: 100 }, { session, writeConcern: { w: 1 } })
        )
        .then(() => session.commitTransaction())
        .catch(err => {
          if (err) console.dir(err);
          session.abortTransaction();
        });
    }

    const db = client.db('test');
    const promise = client.withSession(session => {
      return runShipmentTransaction(db, session).catch(err => {
        if (err instanceof MongoNetworkError || [112, 244, 251].includes(err.code)) {
          return runShipmentTransaction(db, session);
        }

        // otherwise rethrow
        throw err;
      });
    });
    // End Beta Transaction Example 3 (promises)

    return promise.then(() => client.close());
  });

  it('example with retryability (async-await)', function() {
    const client = testContext.client;

    // Start Beta Transaction Example 3 (async-await)
    async function runShipmentTransaction(db, session) {
      session.startTransaction({ writeConcern: { w: 'majority' } });

      try {
        await db
          .collection('inventory')
          .updateOne({ sku: 'abc123' }, { $inc: { qty: -100 } }, { session });

        await db
          .collection('shipment')
          .insertOne({ sku: 'abc123', qty: 100 }, { session, writeConcern: { w: 1 } });
      } catch (err) {
        session.abortTransaction();
        throw err;
      }

      await session.commitTransaction();
    }

    const db = client.db('test');
    const promise = client.withSession(
      session =>
        async function() {
          try {
            await runShipmentTransaction(db, session);
          } catch (err) {
            if (err instanceof MongoNetworkError || [112, 244, 251].includes(err.code)) {
              await runShipmentTransaction(db, session);
            } else {
              throw err;
            }
          }
        }
      );
    // End Beta Transaction Example 3 (async-await)

    return promise.then(() => client.close());
  });
});