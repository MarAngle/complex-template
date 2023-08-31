<style lang="less" scoped>
.complex-import-file{
  display: inline-block;
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
      @file="onChange"
    />
    <Button type="primary" :loading="loading || isImport" :disabled="disabled || isImport" @click="onImport">
      <template #icon>
        <slot name="icon" />
      </template>
      {{ name }}
    </Button>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue"
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
      type: Object as PropType<(file: File) => Promise<unknown>>,
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
