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
import { defineComponent } from "vue"
import { DictionaryData, DictionaryList, ObserveList } from "complex-data-next"
import FormView from "./FormView.vue"
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
      form: AntdForm
    } = {
      type: '',
      edit: '',
      data: undefined,
      mainList: [],
      pageList: null,
      form: new AntdForm()
    }
    return data
  },
  props: {
    dictionary: {
      type: DictionaryList,
      required: true
    },
    format: {
      type: Function,
      required: false
    }
  },
  computed: {
    formProps() {
      const data = {
        form: this.form,
        list: this.pageList!,
        type: this.edit,
        onEvent: this.onEvent,
        onEventEnd: this.onEventEnd
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
        form: this.form.getData(),
        list: this.mainList
      }
    }
  },
  methods: {
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
        this.form.clearValidate()
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
        this.form.setData(res.data)
        this.pageList!.setData(this.form.getData())
      })
    },
    handle(cb: validateCbType) {
      this.form.validate().then(() => {
        const postdata = this.dictionary.$buildEditData(this.form.getData(), this.mainList, this.type)
        cb(postdata, this.data, this.type)
      })
    },
  }
})
</script>
