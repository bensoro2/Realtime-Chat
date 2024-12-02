<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/stores/authStore";
  import CreateRoomModal from "$lib/components/CreateRoomModal.svelte";
  import EditRoomModal from "$lib/components/EditRoomModal.svelte";
  
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
  let showCreateModal = false;
  let showEditModal = false;
  let selectedRoom: Room | null = null;

  // เพิ่มฟังก์ชันกรองห้องตาม role
  function filterRoomsByRole(rooms: Room[]) {
    const user = $authStore.user as User | undefined;
    if (user?.role === 'admin') {
      return rooms; // admin เห็นทุกห้อง
    } else {
      return rooms.filter(room => room.owner._id === user?._id);
    }
  }

  // แก้ไขฟังก์ชัน canManageRoom ให้ admin จัดการได้ทุกห้อง
  function canManageRoom(room: Room) {
    const user = $authStore.user as User | undefined;
    return user?.role === 'admin' || room.owner._id === user?._id;
  }

  // เพิ่มฟังก์ชัน handleEdit
  function handleEdit(room: Room) {
    selectedRoom = room;
    showEditModal = true;
  }

  // เพิ่มฟังก์ชัน handleDelete 
  async function handleDelete(roomId: string) {
    if (!confirm("คุณต้องการลบห้องนี้ใช่หรือไม่?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("กรุณาเข้าสู่ระบบ");

      const response = await fetch(`http://localhost:3000/api/rooms/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "ไม่สามารถลบห้องได้");
      }
      
      rooms = rooms.filter(room => room._id !== roomId);
    } catch (e: unknown) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      }
    }
  }

  async function loadRooms() {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("กรุณาเข้าสู่ระบบ");

      const response = await fetch("http://localhost:3000/api/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("ไม่สามารถโหลดรายการห้องได้");
      
      const allRooms = await response.json();
      rooms = filterRoomsByRole(allRooms);
    } catch (e: unknown) {
      if (e instanceof Error) {
        error = e.message;
      }
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    loadRooms();
  });
</script>

<div class="container mx-auto p-4">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">
      {#if ($authStore.user as User)?.role === 'admin'}
        จัดการห้องแชททั้งหมด
      {:else}
        จัดการห้องแชทของฉัน
      {/if}
    </h1>
    <button class="btn btn-primary" on:click={() => (showCreateModal = true)}>
      สร้างห้องใหม่
    </button>
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
      <p>
        {#if ($authStore.user as User)?.role === 'admin'}
          ยังไม่มีห้องแชทในระบบ
        {:else}
          คุณยังไม่มีห้องแชท
        {/if}
      </p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <p>เจ้าของ: {room.owner.username}</p>
            <p>สมาชิก: {room.members.length} คน</p>
            <p class="text-sm opacity-70">
              สร้างเมื่อ: {new Date(room.createdAt).toLocaleDateString('th-TH')}
            </p>
            {#if canManageRoom(room)}
              <div class="card-actions justify-end">
                <button class="btn btn-warning btn-sm" on:click={() => handleEdit(room)}>
                  แก้ไข
                </button>
                <button class="btn btn-error btn-sm" on:click={() => handleDelete(room._id)}>
                  ลบ
                </button>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<CreateRoomModal
  bind:showModal={showCreateModal}
  on:roomCreated={(event) => {
    const newRoom = event.detail;
    rooms = filterRoomsByRole([...rooms, newRoom]);
    showCreateModal = false;
  }}
/>

<EditRoomModal
  bind:showModal={showEditModal}
  bind:room={selectedRoom}
  on:roomUpdated={(event) => {
    const updatedRoom = event.detail;
    rooms = rooms.map(r => r._id === updatedRoom._id ? updatedRoom : r);
    showEditModal = false;
  }}
/>