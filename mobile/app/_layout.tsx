 import { Stack } from "expo-router";
 import React from "react";

 export default function RootLayout() {
   return (
     <Stack
       screenOptions={{
         headerStyle: { backgroundColor: "#fff" },
         headerTitleStyle: { fontWeight: "600" },
         headerShown: false
       }}
     />
   );
 }
