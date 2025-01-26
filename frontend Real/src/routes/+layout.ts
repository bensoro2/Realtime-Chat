import { authStore } from "$lib/stores/authStore";
import { redirect } from "@sveltejs/kit";
import { browser } from "$app/environment";
import type { LayoutLoad } from "./$types";

export const load = async ({ url }: Parameters<LayoutLoad>[0]) => {
  if (browser) {
    const token = localStorage.getItem("token");
    const isAuthRoute =
      url.pathname === "/login" || url.pathname === "/register";
    const isPublicRoute = url.pathname === "/";

    // ถ้าไม่มี token และไม่ได้อยู่ในหน้า login/register และไม่ใช่หน้าแรก
    if (!token && !isAuthRoute && !isPublicRoute) {
      throw redirect(307, "/login");
    }

    // ถ้ามี token และอยู่ในหน้า login/register
    if (token && isAuthRoute) {
      throw redirect(307, "/");
    }
  }
};
