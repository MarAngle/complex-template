<style scoped>
.auto-spin{
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.55);
}
.auto-spin>.ant-spin{
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
<template>
  <div class="auto-spin" v-if="spinning" >
    <a-spin :spinning="spinning" ></a-spin>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AutoSpin',
  props: {
    spinning: {
      type: Boolean,
      required: false,
      default: true
    }
  }
})
</script>
