<style scoped>

</style>
<template>
  <div class="complex-edit-form">
    <ComplexFormView
      v-if="pageList"
      :form="form"
      :list="pageList"
      :type="edit"
      @event="onEvent"
      @eventEnd="onEventEnd"
    >
    </ComplexFormView>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { DictionaryData, DictionaryList, ObserveList } from "complex-data-next"

type dataType = undefined | Record<PropertyKey, any>

export type validateCbType = (postData: Record<PropertyKey, any>, targetData: dataType) => any

export class ComplexFormData {
  ref: any
  data: Record<PropertyKey, any>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static clearValidate(target: ComplexFormData,...args: any[]) {
    console.warn('未定义ComplexFormData的clearValidate函数！')
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static validate(target: ComplexFormData, cb: () => any, ...args: any[]) {
    console.warn('未定义ComplexFormData的validate函数！')
  }
  constructor() {
    this.ref = null
    this.data = {}
  }
  setRef(ref: any) {
    this.ref = ref
  }
  setData(data: Record<PropertyKey, any>) {
    this.data = data
  }
  getRef() {
    return this.ref
  }
  getData() {
    return this.data
  }
  clearValidate(...args: any[]) {
    ComplexFormData.clearValidate(this, ...args)
  }
  validate(success: () => any, fail?: () => any, ...args: any[]) {
    ComplexFormData.validate(this, success, fail, ...args)
  }
}

export default defineComponent({
  name: `ComplexEditForm`,
  data () {
    const data: {
      type: string,
      edit: string,
      data: dataType,
      mainList: DictionaryData[],
      pageList: null | ObserveList,
      form: ComplexFormData
    } = {
      type: '',
      edit: '',
      data: undefined,
      mainList: [],
      pageList: null,
      form: new ComplexFormData()
    }
    return data
  },
  props: {
    dictionary: {
      type: DictionaryList,
      required: true
    }
  },
  computed: {
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
      if (this.edit == 'change') {
        $buildFormDataArgs.push(this.data)
      }
      this.dictionary.$buildFormData(...$buildFormDataArgs).then((res: any) => {
        this.form.setData(res.data)
        this.pageList!.setData(this.form.getData())
      })
    },
    handle(cb: validateCbType) {
      this.form.validate(() => {
        const postdata = this.dictionary.$buildEditData(this.form.getData(), this.mainList, this.type)
        cb(postdata, this.data)
      })
    },
  }
})
</script>
