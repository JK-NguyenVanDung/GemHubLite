import { Screen } from "@/src/components/ui";
import { CaptureReview } from "@/src/features/camera/components/CaptureReview";

export default function CapturePreviewScreen() {
  return (
    <Screen testID="capture-preview-screen" contentStyle={{ padding: 0, gap: 0 }}>
      <CaptureReview />
    </Screen>
  );
}
