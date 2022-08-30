<style scoped>
.complex-form-view{

}
</style>
<template>
  <div class="complex-form-view" >
    <a-form
      :model="form.data"
      :layout="layout"
      @finish="onFinish"
      @finishFailed="onFinishFailed"
    >
      <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
        <a-button type="primary" html-type="submit">Submit</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"

export default defineComponent({
  name: 'ComplexFormView',
  data () {
    return {
      isEllipsis: false
    }
  },
  props: {
    form: {
      type: Object,
      required: true
    },
    layout: { // 表单布局	'horizontal'|'vertical'|'inline'
      type: String,
      required: false,
      default: 'horizontal'
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String,
      required: false,
      default: 'right'
    },
  },
})
</script>
