import { Client } from "@hiveio/dhive";

const SERVERS = [
    "https://api.deathwing.me",
    "https://api.hive.blog",
    "https://api.openhive.network",
  ];
  
export const client = new Client(SERVERS, {
  timeout: 3000,
  failoverThreshold: 3,
  consoleOnFailover: true,
})

export const getAccounts = async (usernames) =>
    await client.database.getAccounts(usernames);
  
export const getAccount = async (username) =>
    await getAccounts([username]).then((resp) => resp[0]);