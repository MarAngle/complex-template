<style scoped>

</style>
<template>
  <div class="complex-edit-form">
    <ComplexFormView
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
import { DictionaryItem, DictionaryList, PageList } from "complex-data"
import { objectAny } from "complex-func/src/ts"

type dataType = null | objectAny

type cbType = (postData: objectAny, targetData: dataType) => any

export default defineComponent({
  name: `ComplexEditForm`,
  data () {
    const data: {
      type: string,
      edit: string,
      data: dataType,
      mainList: DictionaryItem[],
      pageList: null | PageList,
      form: {
        ref: any,
        data: objectAny
      }
    } = {
      type: '',
      edit: '',
      data: null,
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
      this.mainList = this.dictionary.$getList(this.type)
      const pageList = this.dictionary.$buildPageList(this.type, this.mainList, {
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
      console.log(this.PageList)
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
