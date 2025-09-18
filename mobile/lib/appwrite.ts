import { Client, Account, Databases } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("68cc345f0012792efe03");

export const account = new Account(client);
export const databases = new Databases(client);

export default client;
