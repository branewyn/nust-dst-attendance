import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen() {
  const { registerStudentFn } = useAuth();
  const [form, setForm] = useState({ full_name: "", student_number: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (form.password !== form.confirm) { Alert.alert("Error", "Passwords do not match"); return; }
    setLoading(true);
    try {
      await registerStudentFn({ full_name: form.full_name, student_number: form.student_number, email: form.email, password: form.password });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? "Registration failed";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.title}>NUST Attendance</Text>
        <Text style={s.subtitle}>Student Registration</Text>
        {[
          { label: "Full Name", field: "full_name", secure: false, keyboard: "default" as const },
          { label: "Student Number", field: "student_number", secure: false, keyboard: "default" as const },
          { label: "Email", field: "email", secure: false, keyboard: "email-address" as const },
          { label: "Password", field: "password", secure: true, keyboard: "default" as const },
          { label: "Confirm Password", field: "confirm", secure: true, keyboard: "default" as const },
        ].map(({ label, field, secure, keyboard }) => (
          <View key={field}>
            <Text style={s.label}>{label}</Text>
            <TextInput style={s.input} value={form[field as keyof typeof form]} onChangeText={set(field)}
              secureTextEntry={secure} keyboardType={keyboard} autoCapitalize="none" />
          </View>
        ))}
        <TouchableOpacity style={s.button} onPress={handleSubmit} disabled={loading}>
          <Text style={s.buttonText}>{loading ? "Registering…" : "Register"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 28, backgroundColor: "#f0f4f8" },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", color: "#1a3a5c", marginBottom: 4 },
  subtitle: { fontSize: 16, textAlign: "center", color: "#555", marginBottom: 32 },
  label: { fontSize: 13, color: "#333", marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 16, backgroundColor: "#fff", fontSize: 15 },
  button: { backgroundColor: "#1a3a5c", borderRadius: 8, padding: 15, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
