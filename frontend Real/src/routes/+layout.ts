import { authStore } from "$lib/stores/authStore";
import { redirect } from "@sveltejs/kit";
import { browser } from "$app/environment";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ url }) => {
  if (browser) {
    const token = localStorage.getItem("token");
    const isAuthRoute =
      url.pathname === "/login" || url.pathname === "/register";

    if (token && isAuthRoute) {
      throw redirect(307, "/");
    }
  }
};