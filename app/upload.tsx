import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://127.0.0.1:8000";

export default function UploadScreen() {
  const router = useRouter();

  const [selectedFile, setSelectedFile] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Document picker error:", error);
      Alert.alert("Error", "Unable to select the document.");
    }
  };

  const uploadAndProcess = async () => {
    if (!selectedFile) {
      Alert.alert("Select Document", "Please select a land record first.");
      return;
    }

    setUploading(true);

    try {
      console.log("Uploading:", selectedFile.name);

      const formData = new FormData();

      if (Platform.OS === "web") {
        const response = await fetch(selectedFile.uri);

        if (!response.ok) {
          throw new Error("Unable to read selected file.");
        }

        const blob = await response.blob();

        formData.append(
          "file",
          new File([blob], selectedFile.name, {
            type: selectedFile.mimeType || "application/pdf",
          }),
        );
      } else {
        formData.append("file", {
          uri: selectedFile.uri,
          name: selectedFile.name,
          type: selectedFile.mimeType || "application/pdf",
        } as any);
      }

      console.log("Sending request to backend...");

      const response = await fetch(`${API_URL}/process-document`, {
        method: "POST",
        body: formData,
      });

      console.log("Backend status:", response.status);

      const responseText = await response.text();

      console.log("Backend response:", responseText);

      if (!response.ok) {
        throw new Error(`Backend error ${response.status}: ${responseText}`);
      }

      const data = JSON.parse(responseText);

      console.log("Processing successful:", data);

      // Make sure backend actually returned the expected data.
      if (!data.extracted_data) {
        throw new Error("Backend did not return extracted data.");
      }

      // Navigate to processing screen and pass the complete result.
      router.push({
        pathname: "/processing",
        params: {
          filename: data.filename || selectedFile.name,
          recordId: data.record_id || "",
          storagePath: data.storage_path || "",
          extractedData: JSON.stringify(data.extracted_data),
          confidence: JSON.stringify(data.confidence || {}),
          validation: JSON.stringify(data.validation || {}),
          rawText: data.raw_text || "",
        },
      });
    } catch (error: any) {
      console.error("Upload error:", error);

      Alert.alert(
        "Upload Failed",
        error?.message || "Unable to upload and process the document.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Land Record</Text>
        <Text style={styles.subtitle}>
          Upload a scanned PDF or land document for AI processing
        </Text>
      </View>

      <TouchableOpacity
        style={styles.dropZone}
        onPress={pickDocument}
        disabled={uploading}
      >
        <Text style={styles.icon}>📄</Text>

        {selectedFile ? (
          <>
            <Text style={styles.fileName}>{selectedFile.name}</Text>
            <Text style={styles.fileInfo}>
              Tap to select a different document
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.dropTitle}>Select Document</Text>
            <Text style={styles.dropText}>PDF, JPG or PNG</Text>
          </>
        )}
      </TouchableOpacity>

      {selectedFile && !uploading && (
        <TouchableOpacity
          style={styles.processButton}
          onPress={uploadAndProcess}
        >
          <Text style={styles.processButtonText}>Upload & Process</Text>
        </TouchableOpacity>
      )}

      {uploading && (
        <View style={styles.processingBox}>
          <ActivityIndicator size="large" color="#F4F4F2" />

          <Text style={styles.processingTitle}>Processing Document...</Text>

          <Text style={styles.processingText}>
            Uploading document and extracting land record fields.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F2",
    padding: 24,
  },

  header: {
    marginTop: 40,
    marginBottom: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0D3D01",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },

  dropZone: {
    borderWidth: 2,
    borderColor: "#0D3D01",
    borderStyle: "dashed",
    borderRadius: 18,
    padding: 40,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  icon: {
    fontSize: 48,
    marginBottom: 15,
  },

  dropTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0D3D01",
  },

  dropText: {
    marginTop: 8,
    color: "#777",
  },

  fileName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0D3D01",
    textAlign: "center",
  },

  fileInfo: {
    marginTop: 8,
    color: "#777",
  },

  processButton: {
    marginTop: 25,
    backgroundColor: "#0D3D01",
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
  },

  processButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  processingBox: {
    marginTop: 25,
    backgroundColor: "#0D3D01",
    borderRadius: 18,
    padding: 28,
    alignItems: "center",
  },

  processingTitle: {
    marginTop: 15,
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
  },

  processingText: {
    marginTop: 8,
    color: "#E8E8E8",
    textAlign: "center",
    lineHeight: 21,
  },
});
