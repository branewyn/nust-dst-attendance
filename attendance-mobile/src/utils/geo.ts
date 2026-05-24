import * as Location from "expo-location";

export interface GeoPosition {
  latitude: number;
  longitude: number;
}

/**
 * Request foreground location permission and return current position.
 * Throws if permission is denied (caller should block the scan flow).
 */
export async function getCurrentPosition(): Promise<GeoPosition> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Location permission is required to mark attendance.");
  }
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
}

export async function hasLocationPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === "granted";
}
