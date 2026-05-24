import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp, RouteProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../navigation/AppNavigator";
import * as attendanceApi from "../api/attendance.api";

type ChallengeRoute = RouteProp<MainStackParamList, "Challenge">;

export default function ChallengeScreen() {
  const route = useRoute<ChallengeRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { qrToken, latitude, longitude, skipChallenge } = route.params;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (skipChallenge) submit("");
  }, []);

  const submit = async (challengeResponse: string) => {
    setLoading(true);
    try {
      const result = await attendanceApi.captureAttendance({
        qr_token: qrToken,
        challenge_response: challengeResponse || undefined,
        latitude,
        longitude,
      });
      const flagNote = result.flagged ? `\n\nNote: ${result.flag_reason}` : "";
      Alert.alert("Attendance Recorded", result.message + flagNote, [
        { text: "OK", onPress: () => navigation.navigate("Home") },
      ]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Failed to record attendance";
      Alert.alert("Error", msg, [{ text: "OK", onPress: () => navigation.navigate("Home") }]);
    } finally {
      setLoading(false);
    }
  };

  if (skipChallenge || loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color="#1a3a5c" />
        <Text style={{ marginTop: 16, color: "#555" }}>Recording attendance…</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Challenge Code</Text>
      <Text style={s.subtitle}>Enter the challenge code provided by your lecturer</Text>
      <TextInput style={s.input} value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="e.g. BLUE42" />
      <TouchableOpacity style={s.button} onPress={() => submit(code)} disabled={!code.trim()}>
        <Text style={s.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0f4f8" },
  container: { flex: 1, justifyContent: "center", padding: 28, backgroundColor: "#f0f4f8" },
  title: { fontSize: 22, fontWeight: "700", color: "#1a3a5c", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#555", marginBottom: 32 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 14, backgroundColor: "#fff", fontSize: 18, textAlign: "center", letterSpacing: 4, marginBottom: 20 },
  button: { backgroundColor: "#1a3a5c", borderRadius: 8, padding: 15, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
