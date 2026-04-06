import { Navigate } from "react-router-dom";
import { getAuth } from "../../lib/auth";
import ImportLayout from "./ImportLayout";
import UploadScreen from "./UploadScreen";

export default function ImportFlow() {
  const auth = getAuth();

  // Not authenticated — redirect to registration/2FA
  if (!auth) {
    return <Navigate to="/" replace />;
  }

  return (
    <ImportLayout>
      <UploadScreen token={auth.token} yachtName={auth.yachtName} />
    </ImportLayout>
  );
}
