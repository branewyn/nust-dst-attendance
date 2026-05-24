import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "../navigation/AppNavigator";

export default function HomeScreen() {
  const { user, logoutFn } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  return (
    <View style={s.container}>
      <Text style={s.welcome}>Welcome,</Text>
      <Text style={s.name}>{user?.full_name}</Text>
      <Text style={s.number}>{user?.student_number}</Text>

      <TouchableOpacity style={s.scanBtn} onPress={() => navigation.navigate("Scan")}>
        <Text style={s.scanBtnText}>Scan QR Code</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.historyBtn} onPress={() => navigation.navigate("History")}>
        <Text style={s.historyBtnText}>View Attendance History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={s.logoutBtn} onPress={logoutFn}>
        <Text style={s.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 28, backgroundColor: "#f0f4f8", justifyContent: "center" },
  welcome: { fontSize: 18, color: "#555" },
  name: { fontSize: 26, fontWeight: "700", color: "#1a3a5c", marginBottom: 4 },
  number: { fontSize: 14, color: "#64748b", marginBottom: 48 },
  scanBtn: { backgroundColor: "#1a3a5c", borderRadius: 12, padding: 18, alignItems: "center", marginBottom: 16 },
  scanBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  historyBtn: { backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: "#1a3a5c" },
  historyBtnText: { color: "#1a3a5c", fontSize: 15, fontWeight: "600" },
  logoutBtn: { marginTop: 24, alignItems: "center" },
  logoutBtnText: { color: "#ef4444", fontSize: 14 },
});
