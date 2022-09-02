<style scoped>
.complex-form-view{

}
</style>
<template>
  <div class="complex-form-view" >
    <a-form
      ref="form"
      :model="form.data"
      :layout="layout"
    >
      <FormItem />
    </a-form>
  </div>
</template>

<script lang="ts">
import { PageList } from "complex-data";
import { objectAny } from "complex-data/ts";
import { defineComponent, PropType } from "vue";
import FormItem from "./../mod/FormItem.vue";

export default defineComponent({
  name: 'ComplexFormView',
  components: {
    FormItem: FormItem
  },
  data () {
    return {}
  },
  props: {
    form: {
      type: Object as PropType<objectAny>,
      required: true
    },
    list: {
      type: Object as PropType<PageList>,
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
  mounted() {
    this.setFormRef()
  },
  methods: {
    /**
     * 设置form的ref
     * @param {*} check 是否进行规则检查
     * @param {*} clear 在不进行规则检查的基础上是否清除规则检查
     */
    setFormRef() {
      // eslint-disable-next-line vue/no-mutating-props
      this.form.ref = this.$refs.form
    },
  }
})
</script>
