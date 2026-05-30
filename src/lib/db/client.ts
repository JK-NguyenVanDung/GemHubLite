import * as SQLite from "expo-sqlite";

import { SCHEMA_V1, SCHEMA_V2, SCHEMA_VERSION } from "./schema";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Returns one migrated SQLite connection shared by repositories for app lifetime. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = openAndMigrate();
  }

  return dbPromise;
}

async function openAndMigrate(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync("gemhub-lite.db");

  await db.execAsync("PRAGMA foreign_keys = ON;");

  const versionRow = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version;");
  const userVersion = versionRow?.user_version ?? 0;

  if (userVersion < 1) {
    await db.execAsync(SCHEMA_V1);
    await db.execAsync("PRAGMA user_version = 1;");
  }

  if (userVersion < 2) {
    await db.execAsync(SCHEMA_V2);
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION};`);
  }

  return db;
}
