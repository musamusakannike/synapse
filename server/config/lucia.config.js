import { Lucia } from "lucia";
import mongooseAdapter from "@lucia-auth/adapter-mongoose";
import User from "../models/user.model";

export const lucia = new Lucia(
  mongooseAdapter(User),
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
