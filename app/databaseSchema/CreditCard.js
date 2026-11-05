const appDb = db.getSiblingDB("creditcardapp");

//Reset
["users", "cardProducts", "cards", "transactions"].forEach(name => appDb.getCollection(name).drop());

//(Category List) Transactions and card reward rates MUST use these exact
const CATEGORIES = ["Groceries", "Gas", "Dining", "Travel", "Shopping", "Entertainment", "Utilities", "Other"];

appDb.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["firstName", "lastName", "username", "email", "role", "passwordHash", "createdAt"],
      properties: {
        username: { bsonType: "string", minLength: 3, maxLength: 30 },
        email: { bsonType: "string" },
        role: { enum: ["user", "company", "admin"] },
        //bcrypt hashes are always 60 chars and start with $2a$, $2b$ or $2y$
        passwordHash: { bsonType: "string", pattern: "^\\$2[aby]\\$\\d{2}\\$.{53}$" }
      }
    }
  }
});

appDb.createCollection("cardProducts", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "network", "annualFee", "baseRate", "categoryRates"],
      properties: {
        annualFee: { bsonType: "number", minimum: 0 },
        baseRate: { bsonType: "number", minimum: 0, maximum: 1 }
      }
    }
  }
});

appDb.createCollection("cards", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId", "cardProductId", "last4", "status"],
      properties: {
        userId: { bsonType: "objectId" },
        cardProductId: { bsonType: "objectId" },
        status: { enum: ["active", "frozen", "closed"] }
      }
    }
  }
});

appDb.createCollection("transactions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cardId", "userId", "merchant", "category", "amount", "transactionDate", "status"],
      properties: {
        category: { enum: CATEGORIES },
        amount: { bsonType: "number", minimum: 0 },
        status: { enum: ["posted", "pending", "declined"] }
      }
    }
  }
});

//User
//Passwords are stored as bcrypt hashes (cost 12)
//Had Claude generate these for testing
// Demo logins (dev only):
//   alice   -> AliceDemo#2026    (role: user)
//   brian   -> BrianDemo#2026    (role: user)
//   carla   -> CarlaDemo#2026    (role: user)
//   daniel  -> DanielDemo#2026   (role: user)
//   casey   -> CompanyDemo#2026  (role: company)
//   admin   -> AdminDemo#2026    (role: admin)
const userResult = appDb.users.insertMany([
  {
    firstName: "Alice", lastName: "Nguyen", username: "alice", email: "alice.nguyen@example.com", phone: "407-555-0101",
    role: "user",
    passwordHash: "$2b$12$OLTn.VzWoQwcJ7m9oIUaN.Qut2kX.7wVd1lXGOTXkq/PALDB0zDoO",
    passwordUpdatedAt: new Date("2026-01-15"), lastLoginAt: null,
    createdAt: new Date("2026-01-15")
  },
  {
    firstName: "Brian", lastName: "Carter", username: "brian", email: "brian.carter@example.com", phone: "407-555-0102",
    role: "user",
    passwordHash: "$2b$12$a.2vrfJSY9qSu0bbM53yF.0fRPfgSrBTYQLi8HtNPVzNkyuYxJ2ue",
    passwordUpdatedAt: new Date("2026-02-03"), lastLoginAt: null,
    createdAt: new Date("2026-02-03")
  },
  {
    firstName: "Carla", lastName: "Mendez", username: "carla", email: "carla.mendez@example.com", phone: "407-555-0103",
    role: "user",
    passwordHash: "$2b$12$gB9SJjNQG.cTL0/lIHzFE.JGlZiRvgFc7W1f1.AW/pyEaHEhGyD8C",
    passwordUpdatedAt: new Date("2026-03-21"), lastLoginAt: null,
    createdAt: new Date("2026-03-21")
  },
  {
    firstName: "Daniel", lastName: "Nguyen", username: "daniel", email: "daniel.nguyen@example.com", phone: "407-555-0104",
    role: "user",
    passwordHash: "$2b$12$UJ01tkuL4qwjXjVs6lIHoOm9mpRcP3/I1Uddgp1p5wWZVhp27jMQa",
    passwordUpdatedAt: new Date("2026-04-02"), lastLoginAt: null,
    createdAt: new Date("2026-04-02")
  },
  {
    firstName: "Casey", lastName: "Rivera", username: "casey", email: "casey.rivera@example.com", phone: "407-555-0105",
    role: "company",
    passwordHash: "$2b$12$4z3Beb.fB2b5vSwhp1qVnu.h3eEpKEkrVCcCIVqirvb8859iLIo3e",
    passwordUpdatedAt: new Date("2026-01-05"), lastLoginAt: null,
    createdAt: new Date("2026-01-05")
  },
  {
    firstName: "Admin", lastName: "User", username: "admin", email: "admin@example.com", phone: "407-555-0106",
    role: "admin",
    passwordHash: "$2b$12$NQnF3jT1ZaItAQyfADeZE.IpgAInKtmnVC9K/P87mMAT0QDu2IP2e",
    passwordUpdatedAt: new Date("2026-01-05"), lastLoginAt: null,
    createdAt: new Date("2026-01-05")
  }
]);

const aliceId  = userResult.insertedIds[0];
const brianId  = userResult.insertedIds[1];
const carlaId  = userResult.insertedIds[2];
const danielId = userResult.insertedIds[3];

//Card Projects (Company)
//Rates are decimals (0.03 = 3% back). 
//Any category not listed in categoryRates earns baseRate. 
//Cards the demo users do NOT own (Dining Plus, Flat 2% Cash) exist so the recommendation feature has something to suggest.
const productResult = appDb.cardProducts.insertMany([
  { name: "Everyday Cash",  network: "Visa", annualFee: 0, baseRate: 0.01, categoryRates: { Groceries: 0.03, Gas: 0.03 } },
  { name: "Travel Rewards", network: "Mastercard", annualFee: 95, baseRate: 0.015, categoryRates: { Travel: 0.04, Dining: 0.03 } },
  { name: "Student Starter", network: "Visa", annualFee: 0, baseRate: 0.01, categoryRates: { Dining: 0.02, Shopping: 0.02 } },
  { name: "Platinum", network: "Amex", annualFee: 695, baseRate: 0.01, categoryRates: { Travel: 0.05, Dining: 0.02 } },
  { name: "Dining Plus", network: "Visa", annualFee: 0, baseRate: 0.01, categoryRates: { Dining: 0.05, Entertainment: 0.03 } },
  { name: "Flat 2% Cash", network: "Mastercard", annualFee: 0, baseRate: 0.02, categoryRates: {} }
]);

const products = {
  everydayCash:{ id: productResult.insertedIds[0], baseRate: 0.01, rates: { Groceries: 0.03, Gas: 0.03 } },
  travelRewards:{ id: productResult.insertedIds[1], baseRate: 0.015, rates: { Travel: 0.04, Dining: 0.03 } },
  studentStarter:{ id: productResult.insertedIds[2], baseRate: 0.01, rates: { Dining: 0.02, Shopping: 0.02 } },
  platinum: { id: productResult.insertedIds[3], baseRate: 0.01, rates: { Travel: 0.05, Dining: 0.02 } }
};

//Cards (User) -> Have to link to a company card
//Only the last 4 digits of the card are stored.
//cardName/network are copied from the product
//The product is the source of truth. currentBalance is a seed value, not computed from the transactions below.
const cardDefs = [
  { key: "aliceEveryday", userId: aliceId,  product: products.everydayCash, cardName: "Everyday Cash", network: "Visa", last4: "4821", creditLimit: 5000, currentBalance: 1250.75, apr: 19.99, expirationDate: "09/2029", status: "active" },
  { key: "aliceTravel", userId: aliceId,  product: products.travelRewards, cardName: "Travel Rewards", network: "Mastercard", last4: "9034", creditLimit: 10000, currentBalance: 320.10, apr: 22.49, expirationDate: "04/2028", status: "active" },
  { key: "brianStudent", userId: brianId,  product: products.studentStarter, cardName: "Student Starter", network: "Visa", last4: "1177", creditLimit: 1500, currentBalance: 890.00, apr: 24.99, expirationDate: "11/2027", status: "active" },
  { key: "carlaPlatinum", userId: carlaId,  product: products.platinum, cardName: "Platinum", network: "Amex", last4: "3005", creditLimit: 15000, currentBalance: 0.00, apr: 17.99, expirationDate: "02/2030", status: "frozen" },
  { key: "danielStudent", userId: danielId, product: products.studentStarter, cardName: "Student Starter", network: "Visa", last4: "2290", creditLimit: 1000, currentBalance: 160.00, apr: 24.99, expirationDate: "06/2028", status: "active" }
];

const cardResult = appDb.cards.insertMany(
  cardDefs.map(c => ({
    userId: c.userId,
    cardProductId: c.product.id,
    cardName: c.cardName,
    network: c.network,
    last4: c.last4,
    creditLimit: c.creditLimit,
    currentBalance: c.currentBalance,
    apr: c.apr,
    expirationDate: c.expirationDate,
    status: c.status
  }))
);

const cards = {};
cardDefs.forEach((c, i) => { cards[c.key] = { id: cardResult.insertedIds[i], userId: c.userId, product: c.product }; });

//Transactions
//rewardRate / rewardsEarned are saved at write time so dashboards don't have to recompute them. 
// Declined transactions earn nothing.
// Alice's data is deliberately set up to trigger "wrong card" findings: (For Testing)
// Dining on Everyday Cash (1%) when Travel Rewards earns 3%
// Groceries/Gas on Travel Rewards (1.5%) when Everyday Cash earns 3%
const round2 = n => Math.round(n * 100) / 100;

function tx(cardKey, merchant, category, amount, date, status) {
  const card = cards[cardKey];
  const rate = card.product.rates[category] !== undefined ? card.product.rates[category] : card.product.baseRate;
  return {
    cardId: card.id,
    userId: card.userId,
    merchant: merchant,
    category: category,
    amount: amount,
    transactionDate: new Date(date),
    status: status || "posted",
    rewardRate: rate,
    rewardsEarned: status === "declined" ? 0 : round2(amount * rate)
  };
}

//Had claude generate test data
appDb.transactions.insertMany([
  // Alice, September
  tx("aliceTravel",   "Delta Airlines",  "Travel",        198.00, "2026-09-14"),
  tx("aliceEveryday", "Shell",           "Gas",            42.60, "2026-09-21"),
  tx("aliceEveryday", "Publix",          "Groceries",      92.17, "2026-09-28"),
  // Alice, October
  tx("aliceEveryday", "Publix",          "Groceries",      86.42, "2026-10-02"),
  tx("aliceEveryday", "Shell",           "Gas",            45.10, "2026-10-05"),
  tx("aliceTravel",   "Delta Airlines",  "Travel",        312.00, "2026-10-08"),
  tx("aliceEveryday", "Olive Garden",    "Dining",         64.30, "2026-10-09"),
  tx("aliceTravel",   "Whole Foods",     "Groceries",     112.55, "2026-10-11"),
  tx("aliceEveryday", "Netflix",         "Entertainment",  15.49, "2026-10-12"),
  tx("aliceEveryday", "Chipotle",        "Dining",         18.20, "2026-10-14"),
  tx("aliceTravel",   "Uber Eats",       "Dining",         32.75, "2026-10-15"),
  tx("aliceEveryday", "Costco",          "Groceries",     143.88, "2026-10-18"),
  tx("aliceTravel",   "Marriott",        "Travel",        289.00, "2026-10-20"),
  tx("aliceEveryday", "Duke Energy",     "Utilities",     118.40, "2026-10-22"),
  tx("aliceEveryday", "Target",          "Shopping",       76.19, "2026-10-25"),
  tx("aliceTravel",   "Chevron",         "Gas",            51.30, "2026-10-27"),

  // Brian
  tx("brianStudent",  "Amazon",          "Shopping",       34.50, "2026-09-30"),
  tx("brianStudent",  "Amazon",          "Shopping",       59.99, "2026-10-10", "pending"),
  tx("brianStudent",  "Chipotle",        "Dining",         13.75, "2026-10-12"),
  tx("brianStudent",  "Publix",          "Groceries",      47.62, "2026-10-14"),
  tx("brianStudent",  "Spotify",         "Entertainment",  11.99, "2026-10-16"),
  tx("brianStudent",  "Starbucks",       "Dining",          6.85, "2026-10-19"),
  tx("brianStudent",  "Shell",           "Gas",            38.40, "2026-10-23"),
  tx("brianStudent",  "Walmart",         "Groceries",      71.05, "2026-10-26"),

  // Carla (card was active in September, frozen since)
  tx("carlaPlatinum", "Delta Airlines",  "Travel",        540.00, "2026-09-10"),
  tx("carlaPlatinum", "Nobu",            "Dining",        186.40, "2026-09-18"),
  tx("carlaPlatinum", "Hilton",          "Travel",        420.00, "2026-09-25"),
  tx("carlaPlatinum", "Netflix",         "Entertainment",  15.49, "2026-10-15", "declined"),

  // Daniel
  tx("danielStudent", "Chipotle",        "Dining",         11.25, "2026-10-13"),
  tx("danielStudent", "Steam",           "Entertainment",  29.99, "2026-10-17"),
  tx("danielStudent", "Amazon",          "Shopping",       22.40, "2026-10-21"),
  tx("danielStudent", "Shell",           "Gas",            27.80, "2026-10-24"),
  tx("danielStudent", "Starbucks",       "Dining",          5.95, "2026-10-28")
]);

//Indexes
appDb.users.createIndex({ email: 1 }, { unique: true });
//Unique username, case-insensitive so "Alice" and "alice" can't both exist
appDb.users.createIndex({ username: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
appDb.users.createIndex({ role: 1 });

appDb.cardProducts.createIndex({ name: 1 }, { unique: true });

appDb.cards.createIndex({ userId: 1 });
appDb.cards.createIndex({ cardProductId: 1 });

appDb.transactions.createIndex({ cardId: 1 });
appDb.transactions.createIndex({ userId: 1, transactionDate: -1 });  //user dashboards
appDb.transactions.createIndex({ transactionDate: 1 });              //company day/week/month totals

print("Collections: " + appDb.getCollectionNames().join(", "));
print("users: " + appDb.users.countDocuments() + " | cardProducts: " + appDb.cardProducts.countDocuments() + " | cards: " + appDb.cards.countDocuments() + " | transactions: " + appDb.transactions.countDocuments());
