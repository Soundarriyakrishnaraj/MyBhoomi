import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ExtractedData = {
  owner_name?: string | null;
  survey_number?: string | null;
  khata_number?: string | null;
  area?: string | null;
  unit?: string | null;
  village?: string | null;
  tehsil?: string | null;
  district?: string | null;
  state?: string | null;
  land_type?: string | null;
  record_number?: string | null;
  assessment_number?: string | null;
  document_date?: string | null;
};

export default function VerifiedScreen() {
  const params = useLocalSearchParams<{
    filename?: string;
    extractedData?: string;
    confidence?: string;
    validation?: string;
    recordId?: string;
  }>();

  const extractedData: ExtractedData = useMemo(() => {
    try {
      if (!params.extractedData) {
        return {};
      }

      return JSON.parse(params.extractedData);
    } catch (error) {
      console.log("Error parsing extracted data:", error);
      return {};
    }
  }, [params.extractedData]);

  const displayValue = (value?: string | null) => {
    if (!value || !value.trim()) {
      return "Not available";
    }

    return value;
  };

  const formatArea = () => {
    const area = displayValue(extractedData.area);

    if (area === "Not available") {
      return area;
    }

    const unit = extractedData.unit
      ? extractedData.unit.charAt(0).toUpperCase() +
        extractedData.unit.slice(1)
      : "";

    return `${area}${unit ? ` ${unit}` : ""}`;
  };

  const handleDashboard = () => {
    router.replace("/dashboard");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* SUCCESS ICON */}
        <View style={styles.successCircle}>
          <Text style={styles.checkMark}>✓</Text>
        </View>

        {/* MAIN MESSAGE */}
        <Text style={styles.title}>Record Verified</Text>

        <Text style={styles.subtitle}>
          Land record successfully verified
        </Text>

        {/* DOCUMENT NAME */}
        {params.filename ? (
          <View style={styles.documentBadge}>
            <Text style={styles.documentBadgeText}>
              {params.filename}
            </Text>
          </View>
        ) : null}

        {/* VERIFICATION CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.greenDot} />

            <Text style={styles.cardTitle}>
              Verification Complete
            </Text>
          </View>

          <Text style={styles.cardText}>
            The extracted land-record information has been reviewed and
            approved by the officer.
          </Text>

          {/* OWNER */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Owner</Text>

            <Text style={styles.detailValue}>
              {displayValue(extractedData.owner_name)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* SURVEY NUMBER */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Survey Number</Text>

            <Text style={styles.detailValue}>
              {displayValue(extractedData.survey_number)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* KHATA NUMBER */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Khata Number</Text>

            <Text style={styles.detailValue}>
              {displayValue(extractedData.khata_number)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* LAND AREA */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Land Area</Text>

            <Text style={styles.detailValue}>
              {formatArea()}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* VILLAGE */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Village</Text>

            <Text style={styles.detailValue}>
              {displayValue(extractedData.village)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* TEHSIL */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tehsil / Taluk</Text>

            <Text style={styles.detailValue}>
              {displayValue(extractedData.tehsil)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* DISTRICT */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>District</Text>

            <Text style={styles.detailValue}>
              {displayValue(extractedData.district)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* STATE */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>State</Text>

            <Text style={styles.detailValue}>
              {displayValue(extractedData.state)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* LAND TYPE */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Land Type</Text>

            <Text style={styles.detailValue}>
              {displayValue(extractedData.land_type)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* RECORD NUMBER */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Record / Patta No.</Text>

            <Text style={styles.detailValue}>
              {displayValue(extractedData.record_number)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* ASSESSMENT NUMBER */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Assessment No.</Text>

            <Text style={styles.detailValue}>
              {displayValue(extractedData.assessment_number)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* DOCUMENT DATE */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Document Date</Text>

            <Text style={styles.detailValue}>
              {displayValue(extractedData.document_date)}
            </Text>
          </View>

          {/* VERIFIED BADGE */}
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedBadgeText}>
              ✓ VERIFIED RECORD
            </Text>
          </View>
        </View>

        {/* RECORD ID */}
        {params.recordId ? (
          <View style={styles.recordIdBox}>
            <Text style={styles.recordIdLabel}>
              DIGITAL RECORD ID
            </Text>

            <Text style={styles.recordIdValue}>
              {params.recordId}
            </Text>
          </View>
        ) : null}

        {/* REPOSITORY MESSAGE */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>🔒</Text>

          <Text style={styles.infoText}>
            This verified record is securely stored in the digital
            land-record repository.
          </Text>
        </View>

        {/* DASHBOARD BUTTON */}
        <Pressable
          style={({ pressed }) => [
            styles.dashboardButton,
            pressed && styles.pressed,
          ]}
          onPress={handleDashboard}
        >
          <Text style={styles.dashboardButtonText}>
            GO TO DASHBOARD
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F5EF",
  },

  container: {
    padding: 22,
    paddingBottom: 50,
    alignItems: "center",
  },

  /* SUCCESS */

  successCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#0D3D01",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  checkMark: {
    color: "#FFFFFF",
    fontSize: 45,
    fontWeight: "700",
  },

  /* TITLE */

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0D3D01",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    color: "#6F7869",
    marginTop: 7,
    textAlign: "center",
  },

  /* DOCUMENT */

  documentBadge: {
    backgroundColor: "#E8EEE3",
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginTop: 13,
    maxWidth: "90%",
  },

  documentBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#46613E",
    textAlign: "center",
  },

  /* CARD */

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DED5",
    borderRadius: 6,
    padding: 18,
    marginTop: 25,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  greenDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#3F7035",
    marginRight: 8,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1C3315",
  },

  cardText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#70796A",
    marginTop: 9,
    marginBottom: 14,
  },

  /* DETAILS */

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
  },

  detailLabel: {
    flex: 1,
    fontSize: 11,
    color: "#7D8578",
  },

  detailValue: {
    flex: 1.4,
    fontSize: 12,
    fontWeight: "700",
    color: "#293B24",
    textAlign: "right",
  },

  divider: {
    height: 1,
    backgroundColor: "#E7EAE4",
  },

  /* VERIFIED BADGE */

  verifiedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E6EFE2",
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 9,
    marginTop: 15,
  },

  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#37652E",
    letterSpacing: 0.5,
  },

  /* RECORD ID */

  recordIdBox: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DED5",
    borderRadius: 5,
    padding: 13,
    marginTop: 12,
  },

  recordIdLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#788271",
  },

  recordIdValue: {
    fontSize: 10,
    color: "#53604F",
    marginTop: 5,
  },

  /* INFORMATION */

  infoBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9EEE4",
    borderRadius: 5,
    padding: 13,
    marginTop: 15,
  },

  infoIcon: {
    fontSize: 12,
    marginRight: 8,
  },

  infoText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
    color: "#687261",
  },

  /* BUTTON */

  dashboardButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#0D3D01",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  dashboardButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  pressed: {
    opacity: 0.7,
  },
});