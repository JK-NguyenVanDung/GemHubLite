import * as ImagePicker from "expo-image-picker";
import { AppState, Platform } from "react-native";

const IOS_PERMISSION_SETTLE_MS = 650;
const ACTIVE_STATE_SETTLE_MS = 100;

let pickerOpen = false;

export async function launchSingleImageLibraryAsync() {
  if (pickerOpen) {
    return null;
  }

  pickerOpen = true;

  try {
    const permissionResult = await ensurePhotoLibraryPermission();
    if (!permissionResult.permission.granted) {
      throw new Error("Photo library access is required.");
    }

    if (permissionResult.requested) {
      await waitForActiveAppState();
      await delay(IOS_PERMISSION_SETTLE_MS);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      allowsEditing: Platform.OS === "ios",
      mediaTypes: ["images"],
      quality: 1,
    });

    return result.canceled ? null : result.assets[0] ?? null;
  } finally {
    pickerOpen = false;
  }
}

async function ensurePhotoLibraryPermission() {
  const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (existing.granted) {
    return { permission: existing, requested: false };
  }

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return { permission, requested: true };
}

async function waitForActiveAppState() {
  if (AppState.currentState === "active") {
    await delay(ACTIVE_STATE_SETTLE_MS);
    return;
  }

  await new Promise<void>((resolve) => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active") {
        return;
      }

      subscription.remove();
      setTimeout(resolve, ACTIVE_STATE_SETTLE_MS);
    });
  });
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
