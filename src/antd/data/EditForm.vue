<style scoped>

</style>
<template>
  <div class="complex-edit-form">
    <FormView
      v-if="pageList"
      v-bind="formProps"
    >
    </FormView>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue"
import { DictionaryData, DictionaryList, MenuData, ObserveList } from "complex-data"
import FormView from "./FormView"
import AntdForm from "../class/AntdForm"

type dataType = undefined | Record<PropertyKey, any>

export type validateCbType = (postData: Record<PropertyKey, any>, targetData: dataType, type: string) => any

export default defineComponent({
  name: `ComplexEditForm`,
  components: {
    FormView
  },
  data () {
    const data: {
      type: string,
      edit: string,
      data: dataType,
      mainList: DictionaryData[],
      pageList: null | ObserveList,
      localForm: AntdForm
    } = {
      type: '',
      edit: '',
      data: undefined,
      mainList: [],
      pageList: null,
      localForm: new AntdForm()
    }
    return data
  },
  props: {
    dictionary: {
      type: Object as PropType<DictionaryList>,
      required: true
    },
    menu: {
      type: Object as PropType<MenuData[]>,
      required: false
    },
    form: {
      type: Object as PropType<AntdForm>,
      required: false
    },
    format: {
      type: Function,
      required: false
    },
    observe: {
      type: Boolean,
      required: false,
      default: true
    },
    layout: { // 表单布局'horizontal'|'vertical'|'inline'
      type: String,
      required: false
    },
    layoutOption: { // layout != inline时的a-row的参数设置项
      type: Object,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    },
    loading: {
      type: Boolean,
      required: false
    },
  },
  computed: {
    currentForm() {
      return this.form || this.localForm
    },
    formProps() {
      const data = {
        form: this.currentForm,
        list: this.pageList!,
        type: this.edit,
        menu: this.menu,
        layout: this.layout,
        disabled: this.disabled,
        layoutOption: this.layoutOption,
        onEvent: this.onEvent,
        onEventEnd: this.onEventEnd,
        onMenu: this.onMenu
      }
      if (this.format) {
        this.format(data)
      }
      return data
    },
    eventPayload() {
      return {
        target: this,
        type: this.type,
        edit: this.edit,
        originData: this.data,
        form: this.currentForm.getData(),
        list: this.mainList
      }
    }
  },
  methods: {
    onMenu(prop: string, item: MenuData, index: number, payload: any) {
      this.$emit('menu', prop, item, index, payload)
    },
    onEvent(prop: string, name: string, ...args: any[]) {
      this.$emit('event', this.eventPayload, prop, name, ...args)
    },
    onEventEnd(prop: string, name: string, ...args: any[]) {
      this.$emit('eventEnd', this.eventPayload, prop, name, ...args)
    },
    show(type: string, edit: string, data: dataType = undefined) {
      this.type = type
      this.edit = edit
      this.data = data
      this.initData()
      this.$nextTick(() => {
        this.currentForm.clearValidate()
      })
    },
    initPageList() {
      this.mainList = this.dictionary.$getList(this.type)
      const pageList = this.dictionary.$buildObserveList(this.type, this.mainList, {
        mod: this.edit
      })
      this.pageList = pageList
    },
    initData() {
      this.initPageList()
      const $buildFormDataArgs: Parameters<DictionaryList['$buildFormData']> = [this.mainList, this.type]
      if (this.edit === 'change') {
        $buildFormDataArgs.push(this.data)
      }
      this.dictionary.$buildFormData(...$buildFormDataArgs).then((res: any) => {
        this.currentForm.setData(res.data)
        if (this.observe) {
          this.pageList!.setData(this.currentForm.getData(), this.type)
        }
      })
    },
    handle(cb: validateCbType) {
      this.currentForm.validate().then(() => {
        const postdata = this.dictionary.$buildEditData(this.currentForm.getData(), this.mainList, this.type)
        cb(postdata, this.data, this.type)
      })
    },
  }
})
</script>
