 import React, { useEffect, useState } from "react";
 import { ActivityIndicator, View, StyleSheet } from "react-native";
 import { useRouter } from "expo-router";
 import { getToken } from "../lib/auth";

 export default function Index() {
   const router = useRouter();
   const [checking, setChecking] = useState(true);

   useEffect(() => {
     (async () => {
       try {
         const token = await getToken();
         if (token) {
           router.replace("/(tabs)");
         } else {
           router.replace("/(auth)/sign-in");
         }
       } finally {
         setChecking(false);
       }
     })();
   }, [router]);

   return (
     <View style={styles.container}>
       {checking && <ActivityIndicator size="large" color="#2563EB" />}
     </View>
   );
 }

 const styles = StyleSheet.create({
   container: {
     flex: 1,
     alignItems: "center",
     justifyContent: "center",
     backgroundColor: "#fff",
   },
 });
