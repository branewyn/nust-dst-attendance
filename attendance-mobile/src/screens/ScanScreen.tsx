import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../navigation/AppNavigator";
import { getCurrentPosition } from "../utils/geo";

export default function ScanScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => setHasPermission(status === "granted"));
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const pos = await getCurrentPosition();
      // Peek at the QR token to check challenge_required
      const [payloadB64] = data.split(".");
      let challengeRequired = false;
      try {
        const payload = JSON.parse(atob(payloadB64));
        challengeRequired = !!payload.challenge_required;
      } catch { /* ignore parse errors */ }

      if (challengeRequired) {
        navigation.replace("Challenge", { qrToken: data, latitude: pos.latitude, longitude: pos.longitude });
      } else {
        navigation.replace("Challenge", { qrToken: data, latitude: pos.latitude, longitude: pos.longitude, skipChallenge: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to get location";
      Alert.alert("Location Error", msg, [{ text: "OK", onPress: () => setScanned(false) }]);
    }
  };

  if (hasPermission === null) return <View style={s.centered}><Text>Requesting camera permission…</Text></View>;
  if (!hasPermission) return <View style={s.centered}><Text style={{ color: "#ef4444" }}>Camera permission denied.</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} type={CameraType.back} onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} barCodeScannerSettings={{ barCodeTypes: ["qr"] }}>
        <View style={s.overlay}>
          <View style={s.viewfinder} />
          <Text style={s.hint}>Point the camera at the QR code</Text>
          {scanned && (
            <TouchableOpacity style={s.resetBtn} onPress={() => setScanned(false)}>
              <Text style={{ color: "#fff" }}>Tap to scan again</Text>
            </TouchableOpacity>
          )}
        </View>
      </Camera>
    </View>
  );
}

const s = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,.45)" },
  viewfinder: { width: 240, height: 240, borderWidth: 2, borderColor: "#fff", borderRadius: 16, marginBottom: 24 },
  hint: { color: "#fff", fontSize: 14 },
  resetBtn: { marginTop: 20, padding: 12, backgroundColor: "#1a3a5c", borderRadius: 8 },
});
