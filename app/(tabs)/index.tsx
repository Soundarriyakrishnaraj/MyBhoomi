import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();

  const [officerId, setOfficerId] = useState("OFFICER001");
  const [password, setPassword] = useState("MyBhoomi@123");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    console.log("SIGN IN BUTTON PRESSED");
    console.log("Officer ID:", officerId);

    const validOfficers = [
      "OFFICER001",
      "OFFICER002",
      "OFFICER003",
      "OFFICER004",
      "OFFICER005",
    ];

    if (!officerId.trim() || !password.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter Officer ID and Password.",
      );
      return;
    }

    if (
      validOfficers.includes(officerId.trim().toUpperCase()) &&
      password === "MyBhoomi@123"
    ) {
      console.log("LOGIN SUCCESS");
      router.replace("/dashboard");
    } else {
      console.log("LOGIN FAILED");

      Alert.alert(
        "Invalid Login",
        "Please check your Officer ID and password.",
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* LOGO */}
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>⌂</Text>
        </View>

        <Text style={styles.logoText}>MyBhoomi</Text>

        <Text style={styles.logoSubtitle}>DIGITAL LAND RECORD SYSTEM</Text>

        <View style={styles.divider} />

        <Text style={styles.description}>
          Secure platform for digitizing, validating
          {"\n"}and managing land records.
        </Text>
      </View>

      {/* LOGIN CARD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Officer Login</Text>

        <Text style={styles.cardSubtitle}>Authorized personnel only</Text>

        {/* OFFICER ID */}
        <Text style={styles.label}>OFFICER ID</Text>

        <TextInput
          value={officerId}
          onChangeText={setOfficerId}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder="Enter Officer ID"
          placeholderTextColor="#999"
          style={styles.input}
        />

        {/* PASSWORD */}
        <Text style={styles.label}>PASSWORD</Text>

        <View style={styles.passwordContainer}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Enter Password"
            placeholderTextColor="#999"
            style={styles.passwordInput}
          />

          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeText}>{showPassword ? "◉" : "◌"}</Text>
          </Pressable>
        </View>

        {/* SIGN IN */}
        <Pressable
          onPress={handleSignIn}
          style={({ pressed }) => [
            styles.signInButton,
            pressed && styles.signInButtonPressed,
          ]}
        >
          <Text style={styles.signInText}>SIGN IN</Text>
        </Pressable>

        {/* FORGOT PASSWORD */}
        <Pressable
          onPress={() =>
            Alert.alert(
              "Password Assistance",
              "Please contact the system administrator to reset your officer password.",
            )
          }
        >
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </Pressable>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.secureText}>🔒 SECURE GOVERNMENT PORTAL</Text>

        <Text style={styles.version}>MyBhoomi • Version 1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F2",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  logoSection: {
    alignItems: "center",
    marginBottom: 26,
  },

  logoCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#075900",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  logoIcon: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "600",
  },

  logoText: {
    fontSize: 34,
    fontWeight: "800",
    color: "#075900",
    letterSpacing: -1,
  },

  logoSubtitle: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
    color: "#405638",
  },

  divider: {
    width: 42,
    height: 3,
    backgroundColor: "#7A1515",
    marginTop: 12,
    marginBottom: 12,
  },

  description: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: "#667060",
  },

  card: {
    width: "100%",
    maxWidth: 405,
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,

    elevation: 5,
  },

  cardTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: "#123B09",
  },

  cardSubtitle: {
    fontSize: 12,
    color: "#7A8175",
    marginTop: 5,
    marginBottom: 24,
  },

  label: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#214812",
    marginBottom: 7,
    marginTop: 8,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D4D8D0",
    borderRadius: 3,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#243020",
    backgroundColor: "#FEFEFD",
  },

  passwordContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: "#D4D8D0",
    borderRadius: 3,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEFEFD",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#243020",
  },

  eyeButton: {
    width: 45,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  eyeText: {
    fontSize: 20,
    color: "#555",
  },

  signInButton: {
    height: 51,
    marginTop: 19,
    backgroundColor: "#075900",
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  signInButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },

  signInText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
  },

  forgotPassword: {
    textAlign: "center",
    color: "#8B1111",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 17,
  },

  footer: {
    alignItems: "center",
    marginTop: 24,
  },

  secureText: {
    fontSize: 10,
    color: "#51604C",
    letterSpacing: 1.2,
    fontWeight: "600",
  },

  version: {
    fontSize: 10,
    color: "#9A9F96",
    marginTop: 7,
  },
});
