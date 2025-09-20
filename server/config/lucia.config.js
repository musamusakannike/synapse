import { Lucia } from "lucia";
import {mongoose} from "@lucia-auth/adapter-mongoose";
import User from "../models/user.model.js";

const adapter = mongoose(User);

export const lucia = new Lucia(
  adapter,
  {
    sessionCookie: {
      name: "session",
      expires: false,
      attributes: {
        secure: process.env.NODE_ENV === "production"
      }
    },
    getUserAttributes: (user) => {
      return {
        email: user.email
      };
    }
  }
);
