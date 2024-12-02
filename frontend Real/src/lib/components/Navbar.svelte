<script lang="ts">
  import { authStore } from "$lib/stores/authStore";
  import { onMount } from 'svelte';
  import { browser } from "$app/environment";
  
  let isLoading = true;
  
  onMount(async () => {
    if (browser) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch('http://localhost:3000/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const userData = await response.json();
          authStore.set({ isAuthenticated: true, user: userData });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          authStore.set({ isAuthenticated: false, user: null });
        }
      } else {
        authStore.set({ isAuthenticated: false, user: null });
      }
    }
    isLoading = false;
  });
  
  function handleLogout() {
    authStore.logout();
    window.location.href = '/login';
  }
</script>

<div class="navbar bg-base-100 shadow-lg">
  <div class="navbar-start">
    <div class="dropdown">
      <label tabindex="0" class="btn btn-ghost lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      </label>
      <ul tabindex="0" class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        <li><a href="/">หน้าแรก</a></li>
        {#if $authStore.isAuthenticated}
          <li><a href="/rooms">ห้องแชท</a></li>
        {/if}
      </ul>
    </div>
    <a href="/" class="btn btn-ghost normal-case text-xl">CHAT APP</a>
  </div>
  
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal px-1">
      <li><a href="/">หน้าแรก</a></li>
      {#if $authStore.isAuthenticated}
        <li><a href="/rooms">ห้องแชท</a></li>
      {/if}
    </ul>
  </div>
  
  <div class="navbar-end">
    {#if $authStore.isAuthenticated}
      <span class="mr-4">สวัสดี, {$authStore.user?.username}</span>
      <button on:click={handleLogout} class="btn btn-error">ออกจากระบบ</button>
    {:else if !isLoading}
      <a href="/login" class="btn btn-primary mr-2">เข้าสู่ระบบ</a>
      <a href="/register" class="btn">สมัครสมาชิก</a>
    {/if}
  </div>
</div>