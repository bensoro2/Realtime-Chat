<!-- C:\Users\kanda\OneDrive\Desktop\RealTime Chat\frontend Real\src\routes\+page.svelte -->

<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/stores/authStore";
  import { get } from "svelte/store";
  
  interface User {
    _id: string;
    username: string;
    email: string;
    role: 'member' | 'admin';
  }

  interface Room {
    _id: string;
    name: string;
    owner: {
      _id: string;
      username: string;
    };
    members: Array<{
      _id: string;
      username: string;
    }>;
    imageUrl?: string;
    createdAt: string;
  }

  let rooms: Room[] = [];
  let isLoading = true;
  let error: string | null = null;

  // แก้ไขฟังก์ชัน isMember ให้รองรับกรณีไม่ได้ login
  function isMember(room: Room) {
    const authState = get(authStore);
    if (!authState.isAuthenticated) return false;
    return room.members.some(member => member._id === authState.user?._id);
  }

  async function joinRoom(roomId: string) {
    // เช็คว่า login แล้วหรือยัง
    if (!get(authStore).isAuthenticated) {
      goto('/login');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบ");
      }

      const room = rooms.find(r => r._id === roomId);
      if (!room) {
        throw new Error("ไม่พบห้องที่ต้องการ");
      }

      // ถ้าเป็นสมาชิกแล้ว ให้เข้าห้องได้เลย
      if (isMember(room)) {
        goto(`/rooms/${roomId}`);
        return;
      }

      // ส่ง request เข้าร่วมห้อง
      const response = await fetch(`http://localhost:3000/api/rooms/${roomId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "ไม่สามารถเข้าร่วมห้องได้");
      }

      // หลังจากเข้าร่วมสำเร็จ ให้ไปที่หน้าแชท
      goto(`/rooms/${roomId}`);
    } catch (e: unknown) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      }
      console.error("Join room error:", e);
    }
  }

  onMount(async () => {
    try {
      // แก้ไขการเรียก API ให้ไม่ต้องใช้ token
      const response = await fetch("http://localhost:3000/api/rooms/public");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "ไม่สามารถโหลดรายการห้องได้");
      }
      
      rooms = await response.json();
    } catch (e: unknown) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      }
      console.error("Error fetching rooms:", e);
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="container mx-auto">
  <div class="flex justify-between items-center p-4">
    <h1 class="text-2xl font-bold">ห้องแชททั้งหมด</h1>
  </div>

  {#if isLoading}
    <div class="flex justify-center">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {:else if error}
    <div class="alert alert-error">
      <span>{error}</span>
    </div>
  {:else if rooms.length === 0}
    <div class="text-center py-8">
      <p>ยังไม่มีห้องแชท</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {#each rooms as room}
        <div class="card bg-base-100 shadow-xl">
          {#if room.imageUrl}
            <figure>
              <img
                src={`http://localhost:3000${room.imageUrl}`}
                alt={room.name}
                class="w-full h-48 object-cover"
              />
            </figure>
          {:else}
            <div class="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span class="text-gray-400">ไม่มีรูปภาพ</span>
            </div>
          {/if}

          <div class="card-body">
            <h2 class="card-title">{room.name}</h2>
            <p>เจ้าของห้อง: {room.owner.username}</p>
            <p>สมาชิก: {room.members.length} คน</p>
            <div class="card-actions justify-end">
              <button
                class="btn btn-primary"
                on:click={() => joinRoom(room._id)}
              >
                {#if !$authStore.isAuthenticated}
                  เข้าสู่ระบบเพื่อเข้าร่วม
                {:else if isMember(room)}
                  เข้าห้องแชท
                {:else}
                  เข้าร่วมแชท
                {/if}
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>