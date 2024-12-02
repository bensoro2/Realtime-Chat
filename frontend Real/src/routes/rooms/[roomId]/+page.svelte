<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { page } from "$app/stores";
  import { io } from "socket.io-client";
  import { authStore } from "$lib/stores/authStore";
  import { goto } from "$app/navigation";

  const roomId = $page.params.roomId;
  let messages: any[] = [];
  let newMessage = "";
  let socket: any;
  let room: any = null;
  let error: string | null = null;
  let showErrorModal = false;

  onMount(async () => {
    try {
      const token = localStorage.getItem("token");
      const roomResponse = await fetch(`http://localhost:3000/api/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!roomResponse.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลห้องได้");
      }
      
      room = await roomResponse.json();

      const messagesResponse = await fetch(`http://localhost:3000/api/rooms/${roomId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!messagesResponse.ok) {
        throw new Error("ไม่สามารถโหลดประวัติข้อความได้");
      }
      
      messages = await messagesResponse.json();

      socket = io("http://localhost:3000");
      socket.emit("joinRoom", roomId);

      socket.on("newMessage", (message: any) => {
        messages = [...messages, message];
      });

    } catch (e: unknown) {
      if (e instanceof Error) {
        error = e.message;
      } else {
        error = "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      }
      showErrorModal = true;
      console.error("Error:", e);
    }
  });

  function closeErrorModal() {
    showErrorModal = false;
    goto('/rooms'); // กลับไปหน้ารายการห้อง
  }

  onDestroy(() => {
    if (socket) {
      socket.emit("leaveRoom", roomId);
      socket.disconnect();
    }
  });

  async function sendMessage() {
    if (!newMessage.trim() || !socket || !$authStore.user) return;

    const message = {
      text: newMessage,
      userId: $authStore.user._id,
      username: $authStore.user.username,
      roomId: roomId,
      createdAt: new Date()
    };

    socket.emit("message", { roomId, message });
    newMessage = "";
  }

  function isOwnMessage(message: any) {
    return message.userId === $authStore.user?._id;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<div class="container mx-auto p-4">
  {#if error && showErrorModal}
    <div class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">เกิดข้อผิดพลาด</h3>
        <p class="py-4">{error}</p>
        <div class="modal-action">
          <button class="btn" on:click={closeErrorModal}>กลับไปหน้ารายการห้อง</button>
        </div>
      </div>
    </div>
  {:else if room}
    <!-- ส่วนแสดงรายละเอียดห้อง -->
    <div class="bg-base-100 shadow-lg rounded-lg p-4 mb-4">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">{room.name}</h1>
          <div class="text-sm opacity-75 mt-1">
            <p>ไอดีห้อง: {room._id}</p>
            <p>สร้างเมื่อ: {formatDate(room.createdAt)}</p>
          </div>
        </div>
        <div class="badge badge-primary">{room.members.length} สมาชิก</div>
      </div>
    </div>

    <!-- ส่วนแชท -->
    <div class="flex flex-col h-[70vh]">
      <div class="flex-1 bg-base-200 rounded-lg p-4 mb-4 overflow-y-auto">
        {#each messages as message}
          <div class="chat {isOwnMessage(message) ? 'chat-end' : 'chat-start'} mb-2">
            <div class="chat-header">
              {message.username}
              <time class="text-xs opacity-50 ml-1">
                {new Date(message.createdAt).toLocaleTimeString('th-TH')}
              </time>
            </div>
            <div class="chat-bubble {isOwnMessage(message) ? 'chat-bubble-primary' : ''}">{message.text}</div>
          </div>
        {/each}
      </div>
      
      <form on:submit|preventDefault={sendMessage} class="flex gap-2">
        <input
          type="text"
          bind:value={newMessage}
          placeholder="พิมพ์ข้อความ..."
          class="input input-bordered flex-1"
        />
        <button type="submit" class="btn btn-primary">ส่ง</button>
      </form>
    </div>
  {:else}
    <div class="flex justify-center items-center h-[80vh]">
      <span class="loading loading-spinner loading-lg"></span>
    </div>
  {/if}
</div>