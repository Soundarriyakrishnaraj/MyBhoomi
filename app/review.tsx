import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ExtractedData = {
  owner_name?: string | null;
  survey_number?: string | null;
  khata_number?: string | null;
  area?: string | number | null;
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

type Confidence = Record<string, number>;

type ValidationIssue = {
  field?: string;
  severity?: string;
  message?: string;
};

type Validation = {
  overall_status?: string;
  issues?: ValidationIssue[];
};

export default function ReviewScreen() {
  const params = useLocalSearchParams();

  const extractedData = useMemo<ExtractedData>(() => {
    try {
      if (!params.extractedData) return {};

      const value =
        typeof params.extractedData === "string"
          ? params.extractedData
          : params.extractedData[0];

      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.log("Could not parse extractedData:", error);
      return {};
    }
  }, [params.extractedData]);

  const confidence = useMemo<Confidence>(() => {
    try {
      if (!params.confidence) return {};

      const value =
        typeof params.confidence === "string"
          ? params.confidence
          : params.confidence[0];

      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.log("Could not parse confidence:", error);
      return {};
    }
  }, [params.confidence]);

  const validation = useMemo<Validation>(() => {
    try {
      if (!params.validation) return {};

      const value =
        typeof params.validation === "string"
          ? params.validation
          : params.validation[0];

      return value ? JSON.parse(value) : {};
    } catch (error) {
      console.log("Could not parse validation:", error);
      return {};
    }
  }, [params.validation]);

  // Editable fields
  const [ownerName, setOwnerName] = useState(
    String(extractedData.owner_name ?? ""),
  );

  const [surveyNumber, setSurveyNumber] = useState(
    String(extractedData.survey_number ?? ""),
  );

  const [khataNumber, setKhataNumber] = useState(
    String(extractedData.khata_number ?? ""),
  );

  const [area, setArea] = useState(String(extractedData.area ?? ""));

  const [village, setVillage] = useState(String(extractedData.village ?? ""));

  const [district, setDistrict] = useState(
    String(extractedData.district ?? ""),
  );

  const unit = String(extractedData.unit ?? "acres").toUpperCase();

  const issues = validation.issues ?? [];

  const getConfidence = (field: string) => {
    const value = Number(confidence[field] ?? 0);
    return Number.isFinite(value) ? value : 0;
  };

  const hasIssue = (field: string) => {
    return issues.some((issue) => issue.field === field);
  };

  const overallStatus = validation.overall_status ?? "review_recommended";

  const highConfidenceCount = [
    "owner_name",
    "survey_number",
    "khata_number",
    "area",
    "village",
    "district",
  ].filter((field) => getConfidence(field) >= 90).length;

  const reviewCount = [
    "owner_name",
    "survey_number",
    "khata_number",
    "area",
    "village",
    "district",
  ].filter((field) => getConfidence(field) < 90).length;

  const handleVerify = () => {
    if (!ownerName.trim()) {
      alert("Please enter the owner name before verifying.");
      return;
    }

    if (!surveyNumber.trim()) {
      alert("Please enter the survey number before verifying.");
      return;
    }

    if (!area.trim()) {
      alert("Please enter the land area before verifying.");
      return;
    }

    if (!village.trim()) {
      alert("Please enter the village before verifying.");
      return;
    }

    if (!district.trim()) {
      alert("Please enter the district before verifying.");
      return;
    }

    // Build the final officer-reviewed record.
    const verifiedData = {
      ...extractedData,
      owner_name: ownerName.trim(),
      survey_number: surveyNumber.trim(),
      khata_number: khataNumber.trim() || null,
      area: area.trim(),
      village: village.trim(),
      district: district.trim(),
    };

    console.log("Officer approved record:", verifiedData);

    router.replace({
      pathname: "/verified",
      params: {
        filename:
          typeof params.filename === "string" ? params.filename : "Land Record",

        extractedData: JSON.stringify(verifiedData),

        confidence: JSON.stringify(confidence),

        validation: JSON.stringify(validation),

        rawText: typeof params.rawText === "string" ? params.rawText : "",

        record_id: typeof params.record_id === "string" ? params.record_id : "",
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>Review Record</Text>
            <Text style={styles.subtitle}>OFFICER VERIFICATION</Text>
          </View>
        </View>

        {/* INTRO */}
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Verify Extracted Information</Text>

          <Text style={styles.introText}>
            Review the information extracted by AI. Check the highlighted fields
            against the original document before approving the record.
          </Text>
        </View>

        {/* STATUS */}
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Text style={styles.statusIconText}>!</Text>
          </View>

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>
              {overallStatus === "validated"
                ? "Verification Ready"
                : "Verification Required"}
            </Text>

            <Text style={styles.statusText}>
              {reviewCount > 0
                ? `${reviewCount} field${
                    reviewCount > 1 ? "s" : ""
                  } has lower AI confidence and requires your attention.`
                : "Review the extracted information before approving the record."}
            </Text>
          </View>
        </View>

        {/* RECORD INFORMATION */}
        <Text style={styles.sectionTitle}>Extracted Land Information</Text>

        {/* OWNER */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>OWNER NAME</Text>

          <TextInput
            style={styles.input}
            value={ownerName}
            onChangeText={setOwnerName}
            placeholder="Owner name"
            placeholderTextColor="#8B9485"
          />

          <ConfidenceBadge
            value={getConfidence("owner_name")}
            needsReview={hasIssue("owner_name")}
          />
        </View>

        {/* SURVEY NUMBER */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>SURVEY NUMBER</Text>

          <TextInput
            style={styles.input}
            value={surveyNumber}
            onChangeText={setSurveyNumber}
            placeholder="Survey number"
            placeholderTextColor="#8B9485"
          />

          <ConfidenceBadge
            value={getConfidence("survey_number")}
            needsReview={hasIssue("survey_number")}
          />
        </View>

        {/* KHATA NUMBER */}
        <View
          style={
            hasIssue("khata_number") ? styles.reviewCard : styles.fieldCard
          }
        >
          <View style={styles.reviewHeader}>
            <Text style={styles.fieldLabel}>KHATA NUMBER</Text>

            {hasIssue("khata_number") && (
              <View style={styles.reviewBadge}>
                <Text style={styles.reviewBadgeText}>⚠ REVIEW</Text>
              </View>
            )}
          </View>

          <TextInput
            style={
              hasIssue("khata_number") ? styles.editableInput : styles.input
            }
            value={khataNumber}
            onChangeText={setKhataNumber}
            placeholder="Not detected"
            placeholderTextColor="#8B9485"
          />

          <ConfidenceBadge
            value={getConfidence("khata_number")}
            needsReview={hasIssue("khata_number")}
          />

          {hasIssue("khata_number") && (
            <Text style={styles.helpText}>
              {issues.find((issue) => issue.field === "khata_number")
                ?.message ??
                "Khata number was not detected. Verify it against the original document."}
            </Text>
          )}
        </View>

        {/* LAND AREA */}
        <View
          style={
            getConfidence("area") < 90 || hasIssue("area")
              ? styles.reviewCard
              : styles.fieldCard
          }
        >
          <View style={styles.reviewHeader}>
            <Text style={styles.fieldLabel}>LAND AREA</Text>

            {(getConfidence("area") < 90 || hasIssue("area")) && (
              <View style={styles.reviewBadge}>
                <Text style={styles.reviewBadgeText}>⚠ REVIEW</Text>
              </View>
            )}
          </View>

          <View>
            <TextInput
              style={styles.editableInput}
              value={area}
              onChangeText={setArea}
              keyboardType="decimal-pad"
              placeholder="Enter land area"
              placeholderTextColor="#8B9485"
            />

            <Text style={styles.unitText}>{unit}</Text>
          </View>

          <ConfidenceBadge
            value={getConfidence("area")}
            needsReview={getConfidence("area") < 90 || hasIssue("area")}
          />

          <Text style={styles.helpText}>
            Compare this value with the original land document and correct it if
            necessary.
          </Text>
        </View>

        {/* VILLAGE */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>VILLAGE</Text>

          <TextInput
            style={styles.input}
            value={village}
            onChangeText={setVillage}
            placeholder="Village"
            placeholderTextColor="#8B9485"
          />

          <ConfidenceBadge
            value={getConfidence("village")}
            needsReview={hasIssue("village")}
          />
        </View>

        {/* DISTRICT */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>DISTRICT</Text>

          <TextInput
            style={styles.input}
            value={district}
            onChangeText={setDistrict}
            placeholder="District"
            placeholderTextColor="#8B9485"
          />

          <ConfidenceBadge
            value={getConfidence("district")}
            needsReview={hasIssue("district")}
          />
        </View>

        {/* EXTRA INFORMATION */}
        <Text style={styles.sectionTitle}>
          Additional Extracted Information
        </Text>

        <View style={styles.additionalCard}>
          <InfoRow label="TEHSIL / TALUK" value={extractedData.tehsil} />

          <InfoRow label="STATE" value={extractedData.state} />

          <InfoRow label="LAND TYPE" value={extractedData.land_type} />

          <InfoRow label="RECORD NUMBER" value={extractedData.record_number} />

          <InfoRow
            label="ASSESSMENT NUMBER"
            value={extractedData.assessment_number}
          />

          <InfoRow label="DOCUMENT DATE" value={extractedData.document_date} />
        </View>

        {/* SUMMARY */}
        <Text style={styles.sectionTitle}>Verification Summary</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Fields extracted</Text>

              <Text style={styles.summaryDescription}>
                Total information identified by AI
              </Text>
            </View>

            <Text style={styles.summaryNumber}>6</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>High confidence</Text>

              <Text style={styles.summaryDescription}>
                Fields with confidence of 90% or above
              </Text>
            </View>

            <Text style={styles.successNumber}>{highConfidenceCount}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Requires review</Text>

              <Text style={styles.summaryDescription}>
                Fields requiring officer attention
              </Text>
            </View>

            <Text style={styles.warningNumber}>{reviewCount}</Text>
          </View>
        </View>

        {/* VERIFY BUTTON */}
        <Pressable
          style={({ pressed }) => [
            styles.verifyButton,
            pressed && styles.pressed,
          ]}
          onPress={handleVerify}
        >
          <Text style={styles.verifyButtonText}>✓ APPROVE & VERIFY RECORD</Text>
        </Pressable>

        {/* BACK */}
        <Pressable
          style={({ pressed }) => [
            styles.backBottomButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBottomText}>BACK TO EXTRACTION</Text>
        </Pressable>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerIcon}>🔒</Text>

          <Text style={styles.footerText}>
            Verified records are securely added to the digital land-record
            repository.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------
   CONFIDENCE BADGE
------------------------------------------------------- */

function ConfidenceBadge({
  value,
  needsReview,
}: {
  value: number;
  needsReview?: boolean;
}) {
  if (needsReview || value < 90) {
    return (
      <View style={styles.confidenceRow}>
        <Text style={styles.confidenceLabel}>AI Confidence</Text>

        <View style={styles.mediumBadge}>
          <Text style={styles.mediumBadgeText}>
            {value}% • NEEDS VERIFICATION
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.confidenceRow}>
      <Text style={styles.confidenceLabel}>AI Confidence</Text>

      <View style={styles.highBadge}>
        <Text style={styles.highBadgeText}>{value}% • HIGH</Text>
      </View>
    </View>
  );
}

/* -------------------------------------------------------
   ADDITIONAL INFO ROW
------------------------------------------------------- */

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>{String(value)}</Text>
    </View>
  );
}

/* -------------------------------------------------------
   STYLES
------------------------------------------------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F5EF",
  },

  container: {
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D5DACF",
    justifyContent: "center",
    alignItems: "center",
  },

  backArrow: {
    fontSize: 31,
    color: "#0D3D01",
    marginTop: -4,
  },

  headerText: {
    marginLeft: 14,
  },

  title: {
    fontSize: 23,
    fontWeight: "800",
    color: "#0D3D01",
  },

  subtitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#74806D",
    marginTop: 4,
  },

  intro: {
    marginBottom: 20,
  },

  introTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#18320D",
  },

  introText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#697565",
    marginTop: 7,
  },

  statusCard: {
    backgroundColor: "#F1EEDB",
    borderLeftWidth: 4,
    borderLeftColor: "#A77A20",
    borderRadius: 4,
    padding: 15,
    flexDirection: "row",
    marginBottom: 25,
  },

  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#A77A20",
    justifyContent: "center",
    alignItems: "center",
  },

  statusIconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  statusContent: {
    flex: 1,
    marginLeft: 11,
  },

  statusTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#674B0C",
  },

  statusText: {
    fontSize: 11,
    lineHeight: 17,
    color: "#786A48",
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#18320D",
    marginBottom: 12,
  },

  fieldCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DED5",
    borderRadius: 5,
    padding: 15,
    marginBottom: 11,
  },

  fieldLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#788271",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E1E5DE",
    borderRadius: 4,
    backgroundColor: "#F8F9F6",
    paddingHorizontal: 13,
    fontSize: 15,
    fontWeight: "600",
    color: "#273522",
    marginTop: 8,
  },

  confidenceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 9,
  },

  confidenceLabel: {
    fontSize: 10,
    color: "#8A9384",
  },

  highBadge: {
    backgroundColor: "#E5EFE2",
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 7,
  },

  highBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#37622D",
  },

  reviewCard: {
    backgroundColor: "#FFFDF7",
    borderWidth: 1.5,
    borderColor: "#C9A95A",
    borderRadius: 5,
    padding: 15,
    marginBottom: 11,
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  reviewBadge: {
    backgroundColor: "#F4EACF",
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },

  reviewBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#866316",
  },

  editableInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: "#A77A20",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    paddingRight: 70,
    fontSize: 16,
    fontWeight: "700",
    color: "#26351E",
    marginTop: 9,
  },

  unitText: {
    position: "absolute",
    right: 13,
    top: 26,
    fontSize: 10,
    fontWeight: "800",
    color: "#858C7D",
  },

  mediumBadge: {
    backgroundColor: "#F4EACF",
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 7,
  },

  mediumBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#866316",
  },

  helpText: {
    fontSize: 10,
    lineHeight: 15,
    color: "#887753",
    marginTop: 8,
  },

  additionalCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DED5",
    borderRadius: 5,
    padding: 15,
    marginBottom: 22,
  },

  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EAE4",
  },

  infoLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: "#788271",
  },

  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#273522",
    marginTop: 4,
  },

  summaryCard: {
    backgroundColor: "#E8EEE3",
    borderRadius: 5,
    padding: 16,
    marginBottom: 22,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },

  summaryLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#314329",
  },

  summaryDescription: {
    fontSize: 9,
    color: "#788271",
    marginTop: 3,
  },

  summaryNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#263B20",
  },

  successNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#3B7033",
  },

  warningNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#A77A20",
  },

  separator: {
    height: 1,
    backgroundColor: "#D2DACC",
    marginVertical: 5,
  },

  verifyButton: {
    height: 53,
    backgroundColor: "#0D3D01",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },

  verifyButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  backBottomButton: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BFC8B8",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  backBottomText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: "#0D3D01",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10,
  },

  footerIcon: {
    fontSize: 11,
  },

  footerText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
    color: "#899187",
    textAlign: "center",
    marginLeft: 5,
  },

  pressed: {
    opacity: 0.7,
  },
});
