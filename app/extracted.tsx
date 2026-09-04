import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// ============================================================
// TYPES
// ============================================================

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

type ConfidenceData = {
  [key: string]: number;
};

type ValidationIssue = {
  field: string;
  severity: "warning" | "error";
  message: string;
};

type ValidationData = {
  overall_status?: string;
  issues?: ValidationIssue[];
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function safeParseJSON<T>(
  value: string | string[] | undefined,
  fallback: T,
): T {
  try {
    if (!value) {
      return fallback;
    }

    const stringValue = Array.isArray(value) ? value[0] : value;

    return JSON.parse(stringValue);
  } catch (error) {
    console.log("JSON parse error:", error);
    return fallback;
  }
}

function displayValue(value?: string | null) {
  if (!value || value.trim() === "") {
    return "Not detected";
  }

  return value;
}

function formatConfidence(value?: number) {
  if (value === undefined || value === null) {
    return 0;
  }

  return Math.round(value);
}

function getConfidenceLabel(value?: number) {
  if (value === undefined || value === null || value === 0) {
    return "Not available";
  }

  if (value >= 90) {
    return "High confidence";
  }

  if (value >= 70) {
    return "Medium confidence";
  }

  return "Low confidence";
}

function getConfidenceColor(value?: number) {
  if (value === undefined || value === null || value === 0) {
    return "#777777";
  }

  if (value >= 90) {
    return "#166534";
  }

  if (value >= 70) {
    return "#A16207";
  }

  return "#B91C1C";
}

function getStatusText(status?: string) {
  switch (status) {
    case "validated":
      return "VALIDATED";

    case "review_recommended":
      return "REVIEW RECOMMENDED";

    case "needs_review":
      return "NEEDS REVIEW";

    default:
      return "REVIEW REQUIRED";
  }
}

// ============================================================
// FIELD COMPONENT
// ============================================================

function ExtractedField({
  label,
  value,
  confidence,
}: {
  label: string;
  value?: string | null;
  confidence?: number;
}) {
  const isMissing = !value || value.trim() === "" || value === "Not detected";

  const confidenceValue = formatConfidence(confidence);

  return (
    <View style={styles.fieldCard}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>

        <View
          style={[
            styles.confidenceBadge,
            {
              backgroundColor:
                confidenceValue >= 90
                  ? "#E8F5E9"
                  : confidenceValue >= 70
                    ? "#FFF4D6"
                    : "#FDECEC",
            },
          ]}
        >
          <Text
            style={[
              styles.confidenceText,
              {
                color: getConfidenceColor(confidenceValue),
              },
            ]}
          >
            {confidenceValue > 0 ? `${confidenceValue}%` : "N/A"}
          </Text>
        </View>
      </View>

      <Text style={[styles.fieldValue, isMissing && styles.missingValue]}>
        {displayValue(value)}
      </Text>

      <Text
        style={[
          styles.confidenceLabel,
          {
            color: getConfidenceColor(confidenceValue),
          },
        ]}
      >
        {getConfidenceLabel(confidenceValue)}
      </Text>

      {confidenceValue > 0 && confidenceValue < 80 && (
        <Text style={styles.verifyText}>⚠ Please verify this field</Text>
      )}

      {isMissing && (
        <Text style={styles.missingText}>⚠ This field was not detected</Text>
      )}
    </View>
  );
}

// ============================================================
// MAIN SCREEN
// ============================================================

export default function ExtractedScreen() {
  const params = useLocalSearchParams();

  // ----------------------------------------------------------
  // Read data returned from backend
  // ----------------------------------------------------------

  const extractedData = safeParseJSON<ExtractedData>(params.extractedData, {});

  const confidence = safeParseJSON<ConfidenceData>(params.confidence, {});

  const validation = safeParseJSON<ValidationData>(params.validation, {
    overall_status: "review_recommended",
    issues: [],
  });

  const filename =
    typeof params.filename === "string" ? params.filename : "Land Record";

  // ----------------------------------------------------------
  // Validation status
  // ----------------------------------------------------------

  const validationStatus = validation.overall_status || "review_recommended";

  const issues = validation.issues || [];

  const hasErrors = issues.some((issue) => issue.severity === "error");

  const hasWarnings = issues.some((issue) => issue.severity === "warning");

  // ----------------------------------------------------------
  // Continue to review
  // ----------------------------------------------------------

  const handleContinue = () => {
    router.replace({
      pathname: "/review",
      params: {
        filename,
        extractedData: JSON.stringify(extractedData),
        confidence: JSON.stringify(confidence),
        validation: JSON.stringify(validation),
        rawText: typeof params.rawText === "string" ? params.rawText : "",
      },
    });
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Extraction Results</Text>

            <Text style={styles.subtitle}>AI Land Record Analysis</Text>
          </View>
        </View>

        {/* ====================================================
            SUCCESS BANNER
        ==================================================== */}

        <View style={styles.successBanner}>
          <View style={styles.successIcon}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>

          <View style={styles.bannerTextContainer}>
            <Text style={styles.successTitle}>Extraction Complete</Text>

            <Text style={styles.successDescription}>
              AI successfully extracted key information from your document.
            </Text>
          </View>
        </View>

        {/* ====================================================
            DOCUMENT CARD
        ==================================================== */}

        <View style={styles.documentCard}>
          <Text style={styles.documentLabel}>DOCUMENT</Text>

          <Text style={styles.documentName}>{filename}</Text>

          <Text style={styles.documentStatus}>
            Processed successfully • AI extraction completed
          </Text>
        </View>

        {/* ====================================================
            EXTRACTION HEADER
        ==================================================== */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Extracted Information</Text>

          <View style={styles.aiBadge}>
            <Text style={styles.aiBadgeText}>AI EXTRACTED</Text>
          </View>
        </View>

        {/* ====================================================
            EXTRACTED FIELDS
        ==================================================== */}

        <ExtractedField
          label="OWNER NAME"
          value={extractedData.owner_name}
          confidence={confidence.owner_name}
        />

        <ExtractedField
          label="SURVEY NUMBER"
          value={extractedData.survey_number}
          confidence={confidence.survey_number}
        />

        <ExtractedField
          label="KHATA NUMBER"
          value={extractedData.khata_number}
          confidence={confidence.khata_number}
        />

        <ExtractedField
          label="LAND AREA"
          value={
            extractedData.area
              ? `${extractedData.area}${
                  extractedData.unit ? ` ${extractedData.unit}` : ""
                }`
              : null
          }
          confidence={confidence.area}
        />

        <ExtractedField
          label="VILLAGE"
          value={extractedData.village}
          confidence={confidence.village}
        />

        <ExtractedField
          label="TEHSIL / TALUK"
          value={extractedData.tehsil}
          confidence={confidence.tehsil}
        />

        <ExtractedField
          label="DISTRICT"
          value={extractedData.district}
          confidence={confidence.district}
        />

        <ExtractedField
          label="STATE"
          value={extractedData.state}
          confidence={confidence.state}
        />

        <ExtractedField
          label="LAND TYPE"
          value={extractedData.land_type}
          confidence={confidence.land_type}
        />

        <ExtractedField
          label="RECORD / PATTA NUMBER"
          value={extractedData.record_number}
          confidence={confidence.record_number}
        />

        <ExtractedField
          label="ASSESSMENT NUMBER"
          value={extractedData.assessment_number}
          confidence={confidence.assessment_number}
        />

        <ExtractedField
          label="DOCUMENT DATE"
          value={extractedData.document_date}
          confidence={confidence.document_date}
        />

        {/* ====================================================
            VALIDATION SECTION
        ==================================================== */}

        <View style={styles.validationSection}>
          <View style={styles.validationHeader}>
            <View>
              <Text style={styles.validationTitle}>Validation Report</Text>

              <Text style={styles.validationSubtitle}>
                Automated quality and consistency checks
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    validationStatus === "validated"
                      ? "#E8F5E9"
                      : validationStatus === "review_recommended"
                        ? "#FFF4D6"
                        : "#FDECEC",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      validationStatus === "validated"
                        ? "#166534"
                        : validationStatus === "review_recommended"
                          ? "#A16207"
                          : "#B91C1C",
                  },
                ]}
              >
                {getStatusText(validationStatus)}
              </Text>
            </View>
          </View>

          {/* ==================================================
              NO ISSUES
          ================================================== */}

          {issues.length === 0 && (
            <View style={styles.noIssuesCard}>
              <View style={styles.issueIconGreen}>
                <Text style={styles.issueIconText}>✓</Text>
              </View>

              <View style={styles.issueContent}>
                <Text style={styles.noIssueTitle}>
                  No validation issues detected
                </Text>

                <Text style={styles.noIssueText}>
                  All required fields passed the automated validation checks.
                </Text>
              </View>
            </View>
          )}

          {/* ==================================================
              VALIDATION ISSUES
          ================================================== */}

          {issues.map((issue, index) => (
            <View
              key={`${issue.field}-${index}`}
              style={[
                styles.issueCard,
                {
                  borderLeftColor:
                    issue.severity === "error" ? "#B91C1C" : "#D97706",
                },
              ]}
            >
              <View
                style={[
                  styles.issueIcon,
                  {
                    backgroundColor:
                      issue.severity === "error" ? "#FDECEC" : "#FFF4D6",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.issueIconText,
                    {
                      color: issue.severity === "error" ? "#B91C1C" : "#D97706",
                    },
                  ]}
                >
                  !
                </Text>
              </View>

              <View style={styles.issueContent}>
                <Text style={styles.issueField}>
                  {issue.field.replace(/_/g, " ").toUpperCase()}
                </Text>

                <Text style={styles.issueMessage}>{issue.message}</Text>

                <Text
                  style={[
                    styles.issueSeverity,
                    {
                      color: issue.severity === "error" ? "#B91C1C" : "#D97706",
                    },
                  ]}
                >
                  {issue.severity === "error" ? "ERROR" : "WARNING"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ====================================================
            HUMAN REVIEW INFORMATION
        ==================================================== */}

        <View style={styles.reviewInfoCard}>
          <View style={styles.reviewInfoIcon}>
            <Text style={styles.reviewInfoIconText}>👤</Text>
          </View>

          <View style={styles.reviewInfoContent}>
            <Text style={styles.reviewInfoTitle}>
              Human Verification Required
            </Text>

            <Text style={styles.reviewInfoText}>
              An authorized officer should review the extracted information
              before the record is marked as verified.
            </Text>
          </View>
        </View>

        {/* ====================================================
            CONTINUE BUTTON
        ==================================================== */}

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>
            Continue to Human Review
          </Text>

          <Text style={styles.continueArrow}>→</Text>
        </TouchableOpacity>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <Text style={styles.footerText}>
          AI extraction is an assistance tool. Final verification must be
          performed by an authorized officer.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F4F2",
  },

  container: {
    padding: 20,
    paddingBottom: 50,
  },

  // ----------------------------------------------------------
  // Header
  // ----------------------------------------------------------

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D9DED8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: "#0D3D01",
    marginTop: -3,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0D3D01",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B756A",
  },

  // ----------------------------------------------------------
  // Success Banner
  // ----------------------------------------------------------

  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF5E7",
    borderWidth: 1,
    borderColor: "#C8DFC2",
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },

  successIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#075E02",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  checkIcon: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
  },

  bannerTextContainer: {
    flex: 1,
  },

  successTitle: {
    color: "#0B4A07",
    fontSize: 15,
    fontWeight: "800",
  },

  successDescription: {
    color: "#4E674A",
    fontSize: 12,
    marginTop: 3,
  },

  // ----------------------------------------------------------
  // Document
  // ----------------------------------------------------------

  documentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDE1DC",
    padding: 16,
    marginBottom: 24,
  },

  documentLabel: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#788078",
  },

  documentName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#202620",
    marginTop: 5,
  },

  documentStatus: {
    fontSize: 11,
    color: "#788078",
    marginTop: 4,
  },

  // ----------------------------------------------------------
  // Section Header
  // ----------------------------------------------------------

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#163B0E",
  },

  aiBadge: {
    backgroundColor: "#E7F0E3",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 5,
  },

  aiBadgeText: {
    fontSize: 8,
    fontWeight: "800",
    color: "#426238",
    letterSpacing: 0.5,
  },

  // ----------------------------------------------------------
  // Field
  // ----------------------------------------------------------

  fieldCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE1DC",
    borderRadius: 9,
    padding: 15,
    marginBottom: 9,
  },

  fieldHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  fieldLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#6B756A",
    letterSpacing: 1.1,
  },

  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },

  confidenceText: {
    fontSize: 10,
    fontWeight: "800",
  },

  fieldValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1D251D",
    marginTop: 9,
  },

  missingValue: {
    color: "#8A8F89",
    fontStyle: "italic",
  },

  confidenceLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 5,
  },

  verifyText: {
    color: "#A16207",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 7,
  },

  missingText: {
    color: "#B91C1C",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 7,
  },

  // ----------------------------------------------------------
  // Validation
  // ----------------------------------------------------------

  validationSection: {
    marginTop: 16,
  },

  validationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  validationTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#163B0E",
  },

  validationSubtitle: {
    fontSize: 11,
    color: "#747C72",
    marginTop: 3,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: 145,
  },

  statusText: {
    fontSize: 8,
    fontWeight: "900",
    textAlign: "center",
  },

  // ----------------------------------------------------------
  // No issues
  // ----------------------------------------------------------

  noIssuesCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE1DC",
    borderRadius: 9,
    padding: 14,
  },

  issueIconGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  noIssueTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#245A20",
  },

  noIssueText: {
    fontSize: 11,
    color: "#687267",
    marginTop: 4,
  },

  // ----------------------------------------------------------
  // Issues
  // ----------------------------------------------------------

  issueCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E1DE",
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 13,
    marginBottom: 9,
  },

  issueIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  issueIconText: {
    fontSize: 17,
    fontWeight: "900",
  },

  issueContent: {
    flex: 1,
  },

  issueField: {
    fontSize: 9,
    fontWeight: "900",
    color: "#656C63",
    letterSpacing: 0.8,
  },

  issueMessage: {
    fontSize: 12,
    fontWeight: "600",
    color: "#292E29",
    marginTop: 4,
    lineHeight: 18,
  },

  issueSeverity: {
    fontSize: 9,
    fontWeight: "900",
    marginTop: 6,
  },

  // ----------------------------------------------------------
  // Human Review
  // ----------------------------------------------------------

  reviewInfoCard: {
    flexDirection: "row",
    backgroundColor: "#F8F3E9",
    borderWidth: 1,
    borderColor: "#E4D9C3",
    borderRadius: 9,
    padding: 15,
    marginTop: 18,
  },

  reviewInfoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E9DDC6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  reviewInfoIconText: {
    fontSize: 18,
  },

  reviewInfoContent: {
    flex: 1,
  },

  reviewInfoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#533F22",
  },

  reviewInfoText: {
    fontSize: 11,
    color: "#75664F",
    lineHeight: 17,
    marginTop: 4,
  },

  // ----------------------------------------------------------
  // Continue
  // ----------------------------------------------------------

  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D3D01",
    borderRadius: 9,
    paddingVertical: 16,
    marginTop: 18,
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  continueArrow: {
    color: "#FFFFFF",
    fontSize: 22,
    marginLeft: 10,
    marginTop: -2,
  },

  // ----------------------------------------------------------
  // Footer
  // ----------------------------------------------------------

  footerText: {
    textAlign: "center",
    color: "#7B8278",
    fontSize: 10,
    lineHeight: 15,
    marginTop: 14,
    paddingHorizontal: 20,
  },
});
