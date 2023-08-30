<style lang="less" scoped>
.complex-import-file{
  .complex-input-file{
    display: none;
  }
}

</style>
<template>
  <div class="complex-import-file">
    <InputFile
      ref="file"
      :accept="accept"
      :multiple="multiple"
      :max="max"
      :min="min"
      :append="append"
      :disabled="disabled"
      :placeholder="placeholder"
      :size="size"
      @change="onChange"
    />
    <Button type="primary" :loading="loading || isImport" :disabled="disabled || isImport" @click="onImport">{{ name }}</Button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import InputFile from "../../base/data/InputFile.vue"
import { Button } from "ant-design-vue";

export default defineComponent({
  name: 'ComplexImportFile',
  components: {
    InputFile,
    Button
  },
  props: {
    name: {
      type: String,
      required: false,
      default: '上传'
    },
    upload: {
      type: Function,
      required: true
    },
    loading: {
      type: Boolean,
      required: false,
      default: false
    },
    accept: {
      type: String,
      required: false,
      default: ''
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    max: {
      type: Number,
      required: false,
      default: 0
    },
    min: {
      type: Number,
      required: false,
      default: 0
    },
    append: {
      type: Boolean,
      required: false,
      default: true
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    placeholder: {
      type: String,
      required: false,
      default: ''
    },
    size: { // MB
      type: Number,
      required: false,
      default: 0
    }
  },
  data () {
    return {
      isImport: false
    }
  },
  methods: {
    onImport() {
      if (!this.disabled) {
        console.log(this.$refs['file']);
        (this.$refs['file'] as any).$el.click()
      }
    },
    onChange(file: File) {
      this.isImport = true
      this.upload(file).finally(() => {
        this.isImport = false
      })
    }
  }
})
</script>
