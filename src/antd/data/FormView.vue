<style scoped>


</style>
<template>
  <Form v-if="layout == 'inline'" v-bind="currentFormProps" class="complex-form complex-form-inline" >
    <form-item
      v-for="(val, index) in list.data"
      :key="val.prop"
      v-bind="formatItem(val, index)"
    />
  </Form>
  <Form v-else v-bind="currentFormProps" class="complex-form complex-form-horizontal" >
    <a-row v-bind="layoutOption"  >
      <a-col v-for="(val, index) in list.data" :key="val.prop" v-bind="getGrid(val)" >
        <form-item
          v-bind="formatItem(val, index)"
        />
      </a-col>
    </a-row>
  </Form>
</template>

<script lang="ts">
import { Form } from "ant-design-vue"
import { defineComponent, PropType } from "vue"
import { mergeData } from "complex-utils"
import { DefaultEdit, ObserveList } from "complex-data-next"
import FormItem from '../mod/FormItem'
import config from '../config'
import { ComplexFormData } from "../../base/data/EditForm.vue"

export default defineComponent({
  name: 'ComplexFormView',
  components: {
    Form,
    FormItem
  },
  data () {
    return {}
  },
  props: {
    form: {
      type: Object as PropType<ComplexFormData>,
      required: true
    },
    list: {
      type: Object as PropType<ObserveList>,
      required: true
    },
    type: {
      type: String,
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
    layoutOption: { // layout != inline时的a-row的参数设置项
      type: Object,
      required: false,
      default: () => {
        return config.FormView.layoutOption
      }
    },
    formProps: { // form-model-view设置项
      type: Object,
      required: false,
      default: null
    },
  },
  computed: {
    currentFormProps() {
      // formProps格式化
      const formProps = {
        model: this.form.data,
        layout: this.layout,
        labelAlign: this.labelAlign
      }
      const currentFormProps = mergeData(formProps, this.formProps)
      currentFormProps.ref = 'form'
      return currentFormProps
    }
  },
  mounted () {
    //
    this.form.setRef(this.$refs['form'])
  },
  methods: {
    getGrid(data: DefaultEdit) {
      const ditem = data.$getParent()!
      return ditem.$getLayout(this.type).grid
    },
    formatItem(data: DefaultEdit, index: number) {
      return {
        data: data,
        index: index,
        list: this.list,
        form: this.form,
        type: this.type,
        target: this
      }
    }
  }
})
</script>
