<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let showModal = false;
  let roomName = "";
  let imageFile: File | null = null;
  let error = "";
  let previewUrl: string | null = null;

  function handleImageChange(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      imageFile = target.files[0];
      previewUrl = URL.createObjectURL(target.files[0]);
    }
  }

  async function handleSubmit() {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("name", roomName);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch("http://localhost:3000/api/rooms", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถสร้างห้องได้");
      }

      const newRoom = await response.json();
      dispatch("roomCreated", newRoom);
      roomName = "";
      imageFile = null;
      previewUrl = null;
      showModal = false;
    } catch (e) {
      if (e instanceof Error) {
        error = e.message;
      }
    }
  }
</script>

<div class="modal" class:modal-open={showModal}>
  <div class="modal-box">
    <h3 class="font-bold text-lg">สร้างห้องแชทใหม่</h3>
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
        <button type="submit" class="btn btn-primary">สร้างห้อง</button>
      </div>
    </form>
  </div>
</div>