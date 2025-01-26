import { goto } from "$app/navigation";
import { authStore } from "./stores/authStore";

const BASE_URL = "http://localhost:3000/api";

interface ApiResponse {
  error?: {
    message: string;
    code?: string;
  };
  data?: any;
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse> {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // ตรวจสอบ token errors
      if (
        response.status === 401 &&
        (data.code === "TOKEN_EXPIRED" || data.code === "TOKEN_REQUIRED")
      ) {
        // ลบ token และ user data
        localStorage.removeItem("token");
        authStore.set(null);

        // redirect ไปหน้า login
        await goto("/login");

        return {
          error: {
            message: data.error || "กรุณาเข้าสู่ระบบใหม่",
            code: data.code,
          },
        };
      }

      return {
        error: {
          message: data.error || "เกิดข้อผิดพลาด",
          code: data.code,
        },
      };
    }

    return { data };
  } catch (error) {
    return {
      error: {
        message: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
      },
    };
  }
}
