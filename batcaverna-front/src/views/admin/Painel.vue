<script setup>
  import Navbar from "@/components/Navbar.vue";
</script>

<template>
  <Navbar/>

  <div class="container-sm shadow p-0">

    <nav class="navbar bg-body-secondary">
      <div class="container-fluid">
        <h3>Permuta de Aulas</h3>
      </div>
    </nav>

    <form class="row g-3 mt-3 mx-1">
      <div class="col-auto">
        <label for="siape" class="visually-hidden">Password</label>
        <input type="text" class="form-control" id="siape" placeholder="Digite seu siape">
      </div>
      <div class="col-auto">
        <button type="submit" class="btn btn-primary mb-3"><i class="fa-solid fa-magnifying-glass"></i></button>
      </div>
    </form>

  </div>

</template>

<style scoped>

</style>