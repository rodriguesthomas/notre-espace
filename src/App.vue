<script setup>
import Photo from './components/Photo.vue';
import Notes from './components/Notes.vue';
import Calendrier from './components/Calendrier.vue';
import CalendrierJour from './components/CalendrierJour.vue';
import Message from './components/Message.vue';
</script>

<template>
  <div class="header-cal">
    <CalendrierJour />
  </div>
  <div class="center-box">
    <div class="left-box">
      <Notes />
      <Calendrier />
    </div>
    <Photo />
    <div class="right-box">
      
      <Message />
    </div>
  </div>
</template>

<style scoped>
.header-cal {
  background-color: blue;
  height: 300px;
}

.center-box {
  background-color: blue;
  height: 300px;
  display : 
}

.left-box {
  background-color: green;
  height: 300px;
}

.left-box {
  background-color: green;
  height: 300px;
}

</style>
