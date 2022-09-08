<style scoped>
.complex-form-item{

}
</style>
<template>
  <a-form-item v-bind="currentProps" >
    
  </a-form-item>
</template>

<script lang="ts">
import $func from "complex-func"
import { defineComponent, PropType } from "vue"
import { editType } from "../implement"

export default defineComponent({
  name: 'ComplexFormItem',
  data () {
    return {}
  },
  props: {
    data: {
      type: Object as PropType<editType>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    layout: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    target: {
      type: Object,
      required: true
    }
  },
  computed: {
    currentProps() {
      let currentProps: any = {
        prop: this.data.prop,
        label: this.data.label,
        colon: this.data.edit.colon,
        rules: this.data.edit.$rules.getData(this.type)
      }
      if (this.layout != 'inline' && this.data.layout.type == 'grid') {
        if ($func.getType(this.data.layout.label) == 'object') {
          currentProps.labelCol = this.data.layout.label
        } else {
          currentProps.labelCol = {
            span: this.data.layout.label
          }
        }
        if ($func.getType(this.data.layout.content) == 'object') {
          currentProps.wrapperCol = this.data.layout.content
        } else {
          currentProps.wrapperCol = {
            span: this.data.layout.content
          }
        }
      }
      currentProps = $func.mergeData(currentProps, this.data.edit.$localOption.main)
      return currentProps
    }
  },
  mounted() {
    //
  },
  methods: {
  }
})
</script>
