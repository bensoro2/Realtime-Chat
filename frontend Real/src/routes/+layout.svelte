<script>
  import "../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
</script>

<div class="min-h-screen flex flex-col bg-base-200">
  <Navbar />
  <main class="flex-grow container mx-auto px-4 py-8">
    <slot />
  </main>
  <footer class="footer footer-center p-4 bg-base-300 text-base-content">
    <div>
      <p>Copyright © 2024 - All rights reserved by CHAT APP</p>
    </div>
  </footer>
</div>