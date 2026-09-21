"use server";

import { ID, Query } from "node-appwrite";
import { createAdminClient } from "./appwrite";
import { parseStringify } from "../utils";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_TRANSACTIONS_COLLECTION_ID: TRANSACTION_COLLECTION_ID,
} = process.env;

export const createTransaction = async (transaction: CreateTransactionProps) => {
  try {
    const { tablesDB } = await createAdminClient();

    const newTransaction = await tablesDB.createRow({
      databaseId: DATABASE_ID!,
      tableId: TRANSACTION_COLLECTION_ID!,
      rowId: ID.unique(),
      data: {
        channel: 'online',
        category: 'Transfer',
        status: 'Processing',
        date: new Date().toISOString(),
        ...transaction,
        amount: Number(transaction.amount),
      },
    });

    return parseStringify(newTransaction);
  } catch (error) {
    console.log(error);
  }
}

export const getTransactionsByBankId = async ({bankId}: getTransactionsByBankIdProps) => {
  try {
    const { tablesDB } = await createAdminClient();

    const senderTransactions = await tablesDB.listRows({
      databaseId: DATABASE_ID!,
      tableId: TRANSACTION_COLLECTION_ID!,
      queries: [Query.equal('senderBankId', bankId)],
    });

    const receiverTransactions = await tablesDB.listRows({
      databaseId: DATABASE_ID!,
      tableId: TRANSACTION_COLLECTION_ID!,
      queries: [Query.equal('receiverBankId', bankId)],
    });

    const transactions = {
      total: senderTransactions.total + receiverTransactions.total,
      documents: [
        ...senderTransactions.rows, 
        ...receiverTransactions.rows,
      ]
    }

    return parseStringify(transactions);
  } catch (error) {
    console.log(error);
  }
}
