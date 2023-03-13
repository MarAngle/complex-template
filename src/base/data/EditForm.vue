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
import { DictionaryData, DictionaryList, PageList } from "complex-data"

type dataType = undefined | Record<PropertyKey, any>

type cbType = (postData: Record<PropertyKey, any>, targetData: dataType) => any

export default defineComponent({
  name: `ComplexEditForm`,
  data () {
    const data: {
      type: string,
      edit: string,
      data: dataType,
      mainList: DictionaryData[],
      pageList: null | PageList,
      form: {
        ref: any,
        data: Record<PropertyKey, any>
      }
    } = {
      type: '',
      edit: '',
      data: undefined,
      mainList: [],
      pageList: null,
      form: {
        ref: null,
        data: {}
      }
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
        form: this.form.data,
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
        this.form.ref.clearValidate()
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
      if (this.edit == 'change') {
        this.form.data = this.dictionary.$buildFormData(this.mainList, this.type, this.data)
      } else if (this.edit == 'build') {
        this.form.data = this.dictionary.$buildFormData(this.mainList, this.type)
      }
      this.pageList!.setData(this.form.data)
    },
    handle(cb: cbType) {
      this.form.ref.validate((valid: any) => {
        if (valid) {
          const postdata = this.dictionary.$buildEditData(this.form.data, this.mainList, this.type)
          cb(postdata, this.data)
        }
      })
    },
  }
})
</script>
