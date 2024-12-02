<script lang="ts">
  import { authStore } from "$lib/stores/authStore";
  import { onMount } from "svelte";
  
  let email = '';
  let password = '';
  let error = '';
  let isLoading = true;

  onMount(() => {
    if ($authStore.isAuthenticated) {
      window.location.href = "/";
    }
    isLoading = false;
  });

  async function handleLogin() {
    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'เข้าสู่ระบบล้มเหลว');
      }

      localStorage.setItem("token", data.token);
      
      // ดึงข้อมูล profile หลังจาก login สำเร็จ
      const profileResponse = await fetch('http://localhost:3000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      const profileData = await profileResponse.json();
      
      authStore.login(profileData);
      window.location.href = "/";
    } catch (err: any) {
      error = err.message;
    }
  }
</script>

{#if !isLoading && !$authStore.isAuthenticated}
  <div class="min-h-screen flex items-center justify-center">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title justify-center mb-4">เข้าสู่ระบบ</h2>
        
        {#if error}
          <div class="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        {/if}

        <form on:submit|preventDefault={handleLogin} class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">อีเมล</span>
            </label>
            <input
              type="email"
              bind:value={email}
              placeholder="อีเมล"
              class="input input-bordered"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">รหัสผ่าน</span>
            </label>
            <input
              type="password"
              bind:value={password}
              placeholder="รหัสผ่าน"
              class="input input-bordered"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary w-full">เข้าสู่ระบบ</button>
        </form>

        <div class="divider">หรือ</div>
        
        <a href="/register" class="btn btn-outline w-full">
          สมัครสมาชิก
        </a>
      </div>
    </div>
  </div>
{/if}