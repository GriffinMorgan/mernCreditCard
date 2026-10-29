const appDb = db.getSiblingDB("creditcardapp");

//Clean
["users", "cards", "transactions"].forEach(name => appDb.getCollection(name).drop());

//User Collection
appDb.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "username", "email", "passwordHash", "createdAt"],
      properties: {
        username: { bsonType: "string", minLength: 3, maxLength: 30 },
        email: { bsonType: "string" },
        //bcrypt hashes are always 60 chars and start with $2a$, $2b$ or $2y$
        passwordHash: { bsonType: "string", pattern: "^\\$2[aby]\\$\\d{2}\\$.{53}$" }
      }
    }
  }
});

//Add Users
//passwords are stored as bcrypt hashes (cost 12), never plaintext.
//username alice -> AliceDemo#2026
//username brian -> BrianDemo#2026
//username carla -> CarlaDemo#2026
const userResult = appDb.users.insertMany([
  {
    firstName: "Alice", lastName: "Nguyen", username: "alice", email: "alice.nguyen@example.com", phone: "407-555-0101",
    passwordHash: "$2b$12$OLTn.VzWoQwcJ7m9oIUaN.Qut2kX.7wVd1lXGOTXkq/PALDB0zDoO",
    passwordUpdatedAt: new Date("2026-01-15"), lastLoginAt: null,
    createdAt: new Date("2026-01-15")
  },
  {
    firstName: "Brian", lastName: "Carter", username: "brian", email: "brian.carter@example.com", phone: "407-555-0102",
    passwordHash: "$2b$12$a.2vrfJSY9qSu0bbM53yF.0fRPfgSrBTYQLi8HtNPVzNkyuYxJ2ue",
    passwordUpdatedAt: new Date("2026-02-03"), lastLoginAt: null,
    createdAt: new Date("2026-02-03")
  },
  {
    firstName: "Carla", lastName: "Mendez", username: "carla", email: "carla.mendez@example.com", phone: "407-555-0103",
    passwordHash: "$2b$12$gB9SJjNQG.cTL0/lIHzFE.JGlZiRvgFc7W1f1.AW/pyEaHEhGyD8C",
    passwordUpdatedAt: new Date("2026-03-21"), lastLoginAt: null,
    createdAt: new Date("2026-03-21")
  }
]);

//ID's
const aliceId = userResult.insertedIds[0];
const brianId = userResult.insertedIds[1];
const carlaId = userResult.insertedIds[2];

//Cards
//Only store the last 4 digits of the card
const cardResult = appDb.cards.insertMany([
  { userId: aliceId, cardName: "Everyday Cash", network: "Visa", last4: "4821", creditLimit: 5000,  currentBalance: 1250.75, apr: 19.99, expirationDate: "09/2029", status: "active" },
  { userId: aliceId, cardName: "Travel Rewards", network: "Mastercard", last4: "9034", creditLimit: 10000, currentBalance: 320.10,  apr: 22.49, expirationDate: "04/2028", status: "active" },
  { userId: brianId, cardName: "Student Starter", network: "Visa", last4: "1177", creditLimit: 1500,  currentBalance: 890.00,  apr: 24.99, expirationDate: "11/2027", status: "active" },
  { userId: carlaId, cardName: "Platinum", network: "Amex", last4: "3005", creditLimit: 15000, currentBalance: 0.00,    apr: 17.99, expirationDate: "02/2030", status: "frozen" }
]);

const everydayCashId = cardResult.insertedIds[0];
const travelRewardsId = cardResult.insertedIds[1];
const studentStarterId = cardResult.insertedIds[2];
const platinumId = cardResult.insertedIds[3];

//Transactions
appDb.transactions.insertMany([
  { cardId: everydayCashId, userId: aliceId, merchant: "Publix", category: "Groceries", amount: 86.42, transactionDate: new Date("2026-10-02"), status: "posted" },
  { cardId: everydayCashId, userId: aliceId, merchant: "Shell", category: "Gas", amount: 45.10,  transactionDate: new Date("2026-10-05"), status: "posted" },
  { cardId: travelRewardsId, userId: aliceId, merchant: "Delta Airlines", category: "Travel", amount: 312.00, transactionDate: new Date("2026-10-08"), status: "posted" },
  { cardId: studentStarterId, userId: brianId, merchant: "Amazon", category: "Shopping", amount: 59.99,  transactionDate: new Date("2026-10-10"), status: "pending" },
  { cardId: studentStarterId, userId: brianId, merchant: "Chipotle", category: "Dining", amount: 13.75,  transactionDate: new Date("2026-10-12"), status: "posted" },
  { cardId: platinumId, userId: carlaId, merchant: "Netflix", category: "Entertainment", amount: 15.49,  transactionDate: new Date("2026-10-15"), status: "declined" }
]);

//Indexes for the foreign keys and unique email
appDb.users.createIndex({ email: 1 }, { unique: true });
//Unique username, case-insensitive so "Alice" and "alice" can't both exist
appDb.users.createIndex({ username: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
appDb.cards.createIndex({ userId: 1 });
appDb.transactions.createIndex({ cardId: 1 });
appDb.transactions.createIndex({ userId: 1 });

print("Collections: " + appDb.getCollectionNames().join(", "));
print("users: " + appDb.users.countDocuments() + " | cards: " + appDb.cards.countDocuments() + " | transactions: " + appDb.transactions.countDocuments());
