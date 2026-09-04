import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";

export default function ProcessingScreen() {
  const params = useLocalSearchParams();

  const [progress, setProgress] = useState(0);
  const [processingComplete, setProcessingComplete] = useState(false);

  const steps = [
    "Preparing document",
    "Enhancing document image",
    "Recognizing text",
    "Extracting land-record fields",
    "Validating information",
  ];

  const currentStep = Math.min(Math.floor(progress / 20), steps.length - 1);

  useEffect(() => {
    /*
     * The actual AI processing has already happened
     * in upload.tsx before navigating to this screen.
     *
     * This screen provides a short visual processing
     * animation while the extracted result is prepared.
     */

    let progressValue = 0;

    const timer = setInterval(() => {
      progressValue += 5;

      setProgress(progressValue);

      if (progressValue >= 100) {
        clearInterval(timer);

        setProcessingComplete(true);

        setTimeout(() => {
          /*
           * Pass all backend data to the Extracted screen.
           */
          router.replace({
            pathname: "/extracted",
            params: {
              filename: params.filename || "land_record.pdf",

              extractedData: params.extractedData || "",

              confidence: params.confidence || "",

              validation: params.validation || "",

              rawText: params.rawText || "",
            },
          });
        }, 700);
      }
    }, 100);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* =================================================
            BRAND
        ================================================= */}

        <Text style={styles.brand}>MyBhoomi</Text>

        {/* =================================================
            TITLE
        ================================================= */}

        <Text style={styles.title}>AI Document Processing</Text>

        <Text style={styles.subtitle}>
          Our AI is analyzing the uploaded land record.
        </Text>

        {/* =================================================
            AI PROCESSING CIRCLE
        ================================================= */}

        <View style={styles.aiCircle}>
          {!processingComplete ? (
            <ActivityIndicator size="large" color="#0D3D01" />
          ) : (
            <Text style={styles.completeIcon}>✓</Text>
          )}

          <Text style={styles.percent}>{progress}%</Text>
        </View>

        {/* =================================================
            CURRENT ACTION
        ================================================= */}

        <Text style={styles.currentStep}>
          {processingComplete ? "Processing complete" : steps[currentStep]}
        </Text>

        {/* =================================================
            PROGRESS BAR
        ================================================= */}

        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.progressText}>{progress}% completed</Text>

        {/* =================================================
            PROCESSING STEPS
        ================================================= */}

        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>Processing Steps</Text>

          {steps.map((step, index) => {
            const completed = progress >= (index + 1) * 20;

            const active = currentStep === index && !processingComplete;

            return (
              <View key={step} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepCircle,

                    completed && styles.completedCircle,

                    active && styles.activeCircle,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,

                      completed && styles.completedNumber,
                    ]}
                  >
                    {completed ? "✓" : index + 1}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.stepText,

                    active && styles.activeText,

                    completed && styles.completedText,
                  ]}
                >
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        {/* =================================================
            INFORMATION
        ================================================= */}

        <View style={styles.infoCard}>
          <View style={styles.infoDot} />

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>AI-Powered Analysis</Text>

            <Text style={styles.infoText}>
              Text recognition, field extraction and validation are being
              performed automatically.
            </Text>
          </View>
        </View>

        {/* =================================================
            SECURITY
        ================================================= */}

        <Text style={styles.security}>
          🔒 Your document is being processed securely
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F4F2",
  },

  container: {
    flex: 1,
    padding: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  /* BRAND */

  brand: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0D3D01",
    marginBottom: 18,
  },

  /* TITLE */

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1B320B",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#70796A",
    textAlign: "center",
    marginTop: 8,
    maxWidth: 310,
  },

  /* AI CIRCLE */

  aiCircle: {
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: "#E8EEE4",
    borderWidth: 2,
    borderColor: "#C7D2C0",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
  },

  percent: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0D3D01",
    marginTop: 8,
  },

  completeIcon: {
    fontSize: 42,
    fontWeight: "800",
    color: "#0D3D01",
  },

  /* CURRENT STEP */

  currentStep: {
    fontSize: 14,
    fontWeight: "700",
    color: "#34432D",
    marginTop: 20,
  },

  /* PROGRESS */

  progressBackground: {
    width: "100%",
    height: 7,
    backgroundColor: "#DDE3D9",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 15,
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#0D3D01",
    borderRadius: 4,
  },

  progressText: {
    fontSize: 10,
    color: "#8A9284",
    marginTop: 6,
  },

  /* STEPS */

  stepsCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 17,
    marginTop: 22,
    borderWidth: 1,
    borderColor: "#E0E4DC",
  },

  stepsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#26351E",
    marginBottom: 15,
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  stepCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "#EDF0EB",
    justifyContent: "center",
    alignItems: "center",
  },

  activeCircle: {
    borderWidth: 2,
    borderColor: "#0D3D01",
  },

  completedCircle: {
    backgroundColor: "#0D3D01",
  },

  stepNumber: {
    fontSize: 10,
    fontWeight: "800",
    color: "#7C8578",
  },

  completedNumber: {
    color: "#FFFFFF",
  },

  stepText: {
    fontSize: 12,
    color: "#7B8477",
    marginLeft: 12,
  },

  activeText: {
    color: "#0D3D01",
    fontWeight: "700",
  },

  completedText: {
    color: "#3F5037",
  },

  /* INFO */

  infoCard: {
    width: "100%",
    backgroundColor: "#E9EEE4",
    borderLeftWidth: 4,
    borderLeftColor: "#0D3D01",
    borderRadius: 4,
    padding: 14,
    marginTop: 15,
    flexDirection: "row",
  },

  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3C5630",
    marginTop: 4,
  },

  infoContent: {
    flex: 1,
    marginLeft: 9,
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1B320B",
  },

  infoText: {
    fontSize: 10,
    lineHeight: 16,
    color: "#687261",
    marginTop: 4,
  },

  /* SECURITY */

  security: {
    fontSize: 10,
    color: "#899187",
    marginTop: 17,
  },
});
