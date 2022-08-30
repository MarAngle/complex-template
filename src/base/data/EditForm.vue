<style scoped>

</style>
<template>
  <div class="complex-edit-form">
    <ComplexFormView
      :form="form"
      :mainlist="mainlist"
      :type="edit"
      @event="onEvent"
      @eventEnd="onEventEnd"
    >
    </ComplexFormView>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { DictionaryItem, DictionaryList, PageList } from "complex-data"
import { objectAny } from "complex-func/src/ts"

type dataType = null | objectAny

type cbType = (postData: objectAny, targetData: dataType) => any

export default defineComponent({
  name: `EditForm`,
  data () {
    const data: {
      type: string,
      edit: string,
      data: dataType,
      list: DictionaryItem[],
      pageList: null | PageList,
      form: {
        ref: any,
        data: objectAny
      }
    } = {
      type: '',
      edit: '',
      data: null,
      list: [],
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
        list: this.list
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
    show(type: string, edit: string, data: dataType = null) {
      this.type = type
      this.edit = edit
      this.data = data
      this.initData()
      this.$nextTick(() => {
        this.form.ref.clearValidate()
      })
    },
    initPageList() {
      this.list = this.dictionary.$getList(this.type)
      const pageList = this.dictionary.$buildPageList(this.type, this.list, {
        mod: this.edit
      })
      this.pageList = pageList
    },
    initData() {
      this.initPageList()
      if (this.edit == 'change') {
        this.form.data = this.dictionary.$buildFormData(this.list, this.type, this.data)
      } else if (this.edit == 'build') {
        this.form.data = this.dictionary.$buildFormData(this.list, this.type)
      }
      this.pageList!.setData(this.form.data)
    },
    handle(cb: cbType) {
      this.form.ref.validate((valid: any) => {
        if (valid) {
          const postdata = this.dictionary.$buildEditData(this.form.data, this.list, this.type)
          cb(postdata, this.data)
        }
      })
    },
  }
})
</script>
