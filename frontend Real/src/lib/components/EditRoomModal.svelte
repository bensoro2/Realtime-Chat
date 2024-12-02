<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let showModal = false;
  export let room: any;
  let roomName = "";
  let imageFile: File | null = null;
  let previewUrl = "";
  let error = "";

  $: if (room && showModal) {
    roomName = room.name;
    if (room.imageUrl) {
      previewUrl = `http://localhost:3000${room.imageUrl}`;
    }
  }

  function handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      imageFile = input.files[0];
      previewUrl = URL.createObjectURL(input.files[0]);
    }
  }

  async function handleSubmit() {
    try {
      const token = localStorage.getItem("token");
      
      const roomResponse = await fetch(`http://localhost:3000/api/rooms/${room._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: roomName })
      });

      if (!roomResponse.ok) {
        throw new Error("ไม่สามารถแก้ไขห้องได้");
      }

      let updatedRoom = await roomResponse.json();

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const imageResponse = await fetch(`http://localhost:3000/api/rooms/${room._id}/image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
        });

        if (!imageResponse.ok) {
          throw new Error("ไม่สามารถอัพโหลดรูปภาพได้");
        }

        updatedRoom = await imageResponse.json();
      }

      dispatch("roomUpdated", updatedRoom);
      showModal = false;
    } catch (e) {
      if (e instanceof Error) {
        error = e.message;
      }
    }
  }

  $: if (!showModal) {
    imageFile = null;
    error = "";
  }
</script>

<div class="modal" class:modal-open={showModal}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">แก้ไขห้องแชท</h3>
    <form on:submit|preventDefault={handleSubmit} class="py-4">
      <div class="form-control w-full mb-4">
        <label class="label">
          <span class="label-text">ชื่อห้อง</span>
        </label>
        <input
          type="text"
          bind:value={roomName}
          placeholder="ชื่อห้อง"
          class="input input-bordered w-full"
          required
        />
      </div>

      <div class="form-control w-full mb-4">
        <label class="label">
          <span class="label-text">รูปปกห้อง</span>
        </label>
        <input
          type="file"
          accept="image/*"
          on:change={handleImageChange}
          class="file-input file-input-bordered w-full"
        />
      </div>

      {#if previewUrl}
        <div class="w-full mb-4">
          <img src={previewUrl} alt="Preview" class="w-full h-48 object-cover rounded-lg" />
        </div>
      {/if}

      {#if error}
        <div class="text-error mt-2">{error}</div>
      {/if}

      <div class="modal-action">
        <button type="button" class="btn" on:click={() => (showModal = false)}>ยกเลิก</button>
        <button type="submit" class="btn btn-primary">บันทึก</button>
      </div>
    </form>
  </div>
</div> 