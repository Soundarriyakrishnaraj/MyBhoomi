import { router } from "expo-router";
import React from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function DashboardScreen() {
  const handleLogout = () => {
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>MyBhoomi</Text>
            <Text style={styles.headerSubtitle}>
              Digital Land Record System
            </Text>
          </View>

          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>

        {/* WELCOME */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome, Officer! 👋</Text>

          <Text style={styles.welcomeText}>
            Here's your land-record digitization overview.
          </Text>
        </View>

        {/* UPLOAD DOCUMENT */}
        <Pressable
          style={({ pressed }) => [
            styles.uploadCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/upload")}
        >
          <View style={styles.uploadIcon}>
            <Text style={styles.uploadIconText}>+</Text>
          </View>

          <View style={styles.uploadContent}>
            <Text style={styles.uploadTitle}>Upload Land Document</Text>

            <Text style={styles.uploadDescription}>
              Start AI-powered digitization of a scanned land record.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>

        {/* OVERVIEW */}
        <Text style={styles.sectionTitle}>Overview</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1,248</Text>
            <Text style={styles.statLabel}>Processed</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>936</Text>
            <Text style={styles.statLabel}>Verified</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>84</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>28</Text>
            <Text style={styles.statLabel}>Needs Review</Text>
          </View>
        </View>

        {/* RECENT RECORDS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Records</Text>

          <Pressable>
            <Text style={styles.viewAll}>View All</Text>
          </Pressable>
        </View>

        {/* RECORD 1 */}
        <View style={styles.recordCard}>
          <View style={styles.recordInfo}>
            <Text style={styles.recordTitle}>Survey No. 124/2A</Text>

            <Text style={styles.recordSubtitle}>Rampur • 2.47 acres</Text>
          </View>

          <View style={styles.statusVerified}>
            <Text style={styles.statusVerifiedText}>✓ Verified</Text>
          </View>
        </View>

        {/* RECORD 2 */}
        <View style={styles.recordCard}>
          <View style={styles.recordInfo}>
            <Text style={styles.recordTitle}>Survey No. 87/1</Text>

            <Text style={styles.recordSubtitle}>Lakshmipur • 1.82 acres</Text>
          </View>

          <View style={styles.statusReview}>
            <Text style={styles.statusReviewText}>⚠ Review</Text>
          </View>
        </View>

        {/* RECORD 3 */}
        <View style={styles.recordCard}>
          <View style={styles.recordInfo}>
            <Text style={styles.recordTitle}>Survey No. 201/3</Text>

            <Text style={styles.recordSubtitle}>Rampur • 3.15 acres</Text>
          </View>

          <View style={styles.statusVerified}>
            <Text style={styles.statusVerifiedText}>✓ Verified</Text>
          </View>
        </View>

        {/* AI STATUS */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.statusDot} />

            <Text style={styles.infoTitle}>AI Processing Ready</Text>
          </View>

          <Text style={styles.infoText}>
            Document processing, field extraction and verification tools are
            ready.
          </Text>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          MyBhoomi • Secure Government Portal • v1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* =========================
     PAGE
  ========================= */

  safeArea: {
    flex: 1,
    backgroundColor: "#F4F4F2",
  },

  container: {
    padding: 20,
    paddingBottom: 35,
  },

  /* =========================
     HEADER
  ========================= */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  appName: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0D3D01",
    letterSpacing: 0.2,
  },

  headerSubtitle: {
    fontSize: 11,
    color: "#6C7765",
    marginTop: 3,
  },

  logoutButton: {
    borderWidth: 1,
    borderColor: "#D5D9D0",
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },

  logoutText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#5A160E",
    letterSpacing: 0.3,
  },

  /* =========================
     WELCOME
  ========================= */

  welcomeSection: {
    marginBottom: 22,
  },

  welcomeTitle: {
    fontSize: 25,
    fontWeight: "700",
    color: "#1B320B",
  },

  welcomeText: {
    fontSize: 13,
    color: "#6C7765",
    marginTop: 6,
  },

  /* =========================
     UPLOAD CARD
  ========================= */

  uploadCard: {
    backgroundColor: "#0D3D01",
    borderRadius: 4,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  pressed: {
    opacity: 0.85,
  },

  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  uploadIconText: {
    fontSize: 29,
    color: "#0D3D01",
    fontWeight: "400",
    marginTop: -2,
  },

  uploadContent: {
    flex: 1,
    marginLeft: 14,
  },

  uploadTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  uploadDescription: {
    fontSize: 12,
    color: "#D9E3D2",
    marginTop: 4,
    lineHeight: 17,
  },

  arrow: {
    fontSize: 27,
    color: "#FFFFFF",
    marginLeft: 8,
  },

  /* =========================
     SECTION
  ========================= */

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1B320B",
    marginBottom: 12,
  },

  /* =========================
     STATISTICS
  ========================= */

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    padding: 18,

    borderWidth: 1,
    borderColor: "#E0E2DA",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },

  statNumber: {
    fontSize: 25,
    fontWeight: "800",
    color: "#0D3D01",
  },

  statLabel: {
    fontSize: 12,
    color: "#727B6D",
    marginTop: 4,
  },

  /* =========================
     RECENT RECORDS
  ========================= */

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 17,
    marginBottom: 12,
  },

  viewAll: {
    color: "#5A160E",
    fontSize: 12,
    fontWeight: "700",
  },

  recordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    padding: 16,
    marginBottom: 10,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#E0E2DA",
  },

  recordInfo: {
    flex: 1,
  },

  recordTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#26351E",
  },

  recordSubtitle: {
    fontSize: 12,
    color: "#7A8275",
    marginTop: 4,
  },

  /* =========================
     VERIFIED
  ========================= */

  statusVerified: {
    backgroundColor: "#E5EDE1",
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 9,
  },

  statusVerifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#3C5630",
  },

  /* =========================
     REVIEW
  ========================= */

  statusReview: {
    backgroundColor: "#F5E9D9",
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 9,
  },

  statusReviewText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9A6418",
  },

  /* =========================
     AI STATUS
  ========================= */

  infoCard: {
    backgroundColor: "#E9EEE4",
    borderRadius: 4,
    padding: 17,
    marginTop: 18,
    borderLeftWidth: 4,
    borderLeftColor: "#0D3D01",
  },

  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3C5630",
    marginRight: 8,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1B320B",
  },

  infoText: {
    fontSize: 12,
    color: "#65705E",
    lineHeight: 18,
    marginTop: 6,
  },

  /* =========================
     FOOTER
  ========================= */

  footer: {
    textAlign: "center",
    fontSize: 10,
    color: "#9AA095",
    marginTop: 25,
  },
});
