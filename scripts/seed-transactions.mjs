// Seed the Appwrite `transactions` table with sample rows.
// Run with:  node --env-file=.env scripts/seed-transactions.mjs
// Adds any missing columns the app relies on, then inserts sample rows
// that reference the bank rows already in the `bank` table.

import { Client, TablesDB, ID } from "node-appwrite";

const env = (k) => (process.env[k] ?? "").trim();

const client = new Client()
  .setEndpoint(env("NEXT_PUBLIC_APPWRITE_ENDPOINT"))
  .setProject(env("NEXT_PUBLIC_APPWRITE_PROJECT"))
  .setKey(env("APPWRITE_SECRET"));

const db = new TablesDB(client);
const databaseId = env("APPWRITE_DATABASE_ID");
const tableId = env("APPWRITE_TRANSACTIONS_COLLECTION_ID");
const bankTableId = env("APPWRITE_BANK_COLLECTIONS_ID");

// Columns the app reads/writes (see lib/actions/transactions.actions.ts and bank.actions.ts).
const wantedColumns = [
  { key: "amount", kind: "float", required: true },
  { key: "senderBankId", kind: "string", size: 255, required: true },
  { key: "receiverBankId", kind: "string", size: 255, required: true },
  { key: "senderId", kind: "string", size: 255, required: false },
  { key: "receiverId", kind: "string", size: 255, required: false },
  { key: "email", kind: "string", size: 255, required: false },
];

async function ensureColumns() {
  const table = await db.getTable({ databaseId, tableId });
  const existing = new Map(table.columns.map((c) => [c.key, c]));

  for (const col of wantedColumns) {
    if (existing.has(col.key)) continue;
    console.log(`+ adding column ${col.key} (${col.kind})`);
    if (col.kind === "float") {
      await db.createFloatColumn({ databaseId, tableId, key: col.key, required: col.required });
    } else {
      await db.createStringColumn({ databaseId, tableId, key: col.key, size: col.size, required: col.required });
    }
  }

  // The app derives `type` (debit/credit) from senderBankId/receiverBankId at
  // read time and never writes it, so it must not be required.
  if (existing.get("type")?.required) {
    console.log("~ making column `type` optional");
    await db.updateBooleanColumn({ databaseId, tableId, key: "type", required: false, xdefault: null });
  }

  // Column creation is asynchronous; wait until every column is available.
  for (let i = 0; i < 30; i++) {
    const t = await db.getTable({ databaseId, tableId });
    const pending = t.columns.filter((c) => c.status !== "available");
    if (pending.length === 0) return;
    console.log(`  waiting for columns: ${pending.map((c) => c.key).join(", ")}`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error("Columns did not become available in time");
}

const daysAgo = (n, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
};

// getTransactionStatus() in lib/utils.ts: newer than 2 days => "Processing", else "Success".
const statusFor = (date) => (date > daysAgo(2) ? "Processing" : "Success");

function buildRows(banks) {
  const [a, b] = banks;
  const rows = [
    { name: "Rent payment",          amount: 1450.00, from: a, to: b, days: 0,  channel: "online",   category: "Transfer" },
    { name: "Dinner split",          amount: 42.75,   from: b, to: a, days: 1,  channel: "online",   category: "Food and Drink" },
    { name: "Freelance invoice #204",amount: 850.00,  from: b, to: a, days: 3,  channel: "online",   category: "Payment" },
    { name: "Grocery reimbursement", amount: 63.20,   from: a, to: b, days: 4,  channel: "in store", category: "Food and Drink" },
    { name: "Concert tickets",       amount: 120.00,  from: a, to: b, days: 6,  channel: "online",   category: "Entertainment" },
    { name: "Utilities share",       amount: 88.40,   from: b, to: a, days: 9,  channel: "online",   category: "Transfer" },
    { name: "Car repair loan",       amount: 300.00,  from: a, to: b, days: 14, channel: "in store", category: "Payment" },
    { name: "Birthday gift",         amount: 50.00,   from: b, to: a, days: 21, channel: "online",   category: "Transfer" },
  ];

  return rows.map((r) => {
    const date = daysAgo(r.days, 9 + (r.days % 8));
    return {
      name: r.name,
      amount: r.amount,
      status: statusFor(date),
      channel: r.channel,
      category: r.category,
      date: date.toISOString(),
      senderId: r.from.userId,
      senderBankId: r.from.$id,
      receiverId: r.to.userId,
      receiverBankId: r.to.$id,
      email: "sample@example.com",
    };
  });
}

async function main() {
  const force = process.argv.includes("--force");

  await ensureColumns();

  const existing = await db.listRows({ databaseId, tableId });
  if (existing.total > 0 && !force) {
    console.log(`Table already has ${existing.total} row(s). Re-run with --force to add more.`);
    return;
  }

  const banks = await db.listRows({ databaseId, tableId: bankTableId });
  if (banks.rows.length < 2) {
    throw new Error("Need at least two rows in the bank table to seed transfers between them.");
  }

  const rows = buildRows(banks.rows);
  for (const data of rows) {
    const row = await db.createRow({ databaseId, tableId, rowId: ID.unique(), data });
    console.log(`+ ${row.$id}  ${data.name.padEnd(24)} ${String(data.amount).padStart(8)}  ${data.status.padEnd(10)} ${data.date.slice(0, 10)}`);
  }
  console.log(`\nInserted ${rows.length} rows.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
