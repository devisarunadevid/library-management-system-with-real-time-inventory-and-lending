import api from "./api";

// Send OTP
export async function forgotPassword(email) {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (err) {
    console.error("Forgot password error:", err.response?.data || err.message);
    throw err;
  }
}

// Verify OTP
export async function verifyOtp(email, otp) {
  try {
    console.log("Verifying with:", { email, otp });
    return api.post("/auth/verify-otp", { email, otp });
  } catch (err) {
    console.error("Verify OTP error:", err.response?.data || err.message);
    throw err;
  }
}

// Reset Password
export async function resetPassword(email, otp, newPassword) {
  try {
    const response = await api.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  } catch (err) {
    console.error("Reset password error:", err.response?.data || err.message);
    throw err;
  }
}
