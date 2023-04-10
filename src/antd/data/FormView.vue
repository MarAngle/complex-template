<style scoped>


</style>
<template>
  <a-form v-if="layout == 'inline'" v-bind="currentFormOption" >
    <form-item
      v-for="(val, index) in list.data"
      :key="val.prop"
      v-bind="formatItem(val, index)"
    />
  </a-form>
  <a-form v-else v-bind="currentFormOption" >
    <a-row v-bind="layoutOption"  >
      <a-col v-for="(val, index) in list.data" :key="val.prop" v-bind="formatGrid(val)" >
        <form-item
          v-bind="formatItem(val, index)"
        />
      </a-col>
    </a-row>
  </a-form>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { mergeData } from "complex-utils"
import { DefaultEdit, ObserveList } from "complex-data"
import FormItem from '../mod/FormItem'
import config from '../config'

type FormType = {
  ref: any,
  data: Record<string, any>
}

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
      type: Object as PropType<FormType>,
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
    formOption: { // form-model-view设置项
      type: Object,
      required: false,
      default: null
    },
  },
  computed: {
    currentFormOption() {
      // formOption格式化
      const defaultFormOption = {
        model: this.form.data,
        layout: this.layout,
        labelAlign: this.labelAlign
      }
      const currentFormOption = mergeData(defaultFormOption, this.formOption)
      currentFormOption.ref = 'form'
      return currentFormOption
    }
  },
  mounted () {
    //
  },
  methods: {
    formatGrid(data: DefaultEdit) {
      return data.layout
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
