// C:\Users\kanda\OneDrive\Desktop\RealTime Chat\frontend Real\src\lib\stores\authStore.ts

import { writable } from "svelte/store";
import { browser } from "$app/environment";

type User = {
  _id: string;
  username: string;
  email: string;
  role: "member" | "admin";
};

function createAuthStore() {
  const { subscribe, set } = writable<{
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
  }>({
    isAuthenticated: false,
    user: null,
    isLoading: true, // เริ่มต้นเป็น true เพราะเรากำลังโหลดข้อมูล
  });

  async function initialize() {
    if (browser) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(
            "http://localhost:3000/api/users/profile",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.ok) {
            const user = await response.json();
            set({ isAuthenticated: true, user, isLoading: false });
          } else {
            localStorage.removeItem("token");
            set({ isAuthenticated: false, user: null, isLoading: false });
          }
        } catch (error) {
          localStorage.removeItem("token");
          set({ isAuthenticated: false, user: null, isLoading: false });
        }
      } else {
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } else {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  }

  initialize();

  return {
    subscribe,
    set,
    login: (user: User) => {
      set({ isAuthenticated: true, user, isLoading: false });
    },
    logout: () => {
      localStorage.removeItem("token");
      set({ isAuthenticated: false, user: null, isLoading: false });
    },
    initialize,
  };
}

export const authStore = createAuthStore();
