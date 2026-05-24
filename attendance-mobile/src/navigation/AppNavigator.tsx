import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";

// Auth screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";

// Main screens
import HomeScreen from "../screens/HomeScreen";
import ScanScreen from "../screens/ScanScreen";
import ChallengeScreen from "../screens/ChallengeScreen";
import HistoryScreen from "../screens/HistoryScreen";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Scan: undefined;
  Challenge: { qrToken: string; latitude: number; longitude: number; skipChallenge?: boolean };
  History: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#1a3a5c" }, headerTintColor: "#fff" }}>
      <MainStack.Screen name="Home" component={HomeScreen} options={{ title: "NUST Attendance" }} />
      <MainStack.Screen name="Scan" component={ScanScreen} options={{ title: "Scan QR Code" }} />
      <MainStack.Screen name="Challenge" component={ChallengeScreen} options={{ title: "Challenge Code" }} />
      <MainStack.Screen name="History" component={HistoryScreen} options={{ title: "Attendance History" }} />
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
