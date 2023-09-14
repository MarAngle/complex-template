<style scoped>

</style>
<template>
  <div class="complex-search-form">
    <FormView
      v-bind="formProps"
    >
    </FormView>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue"
import { MenuData, SearchData } from "complex-data-next"
import FormView from "./FormView"

export default defineComponent({
  name: `ComplexSearchForm`,
  components: {
    FormView
  },
  data () {
    return {}
  },
  props: {
    search: {
      type: Object as PropType<SearchData>,
      required: true
    },
    type: {
      type: String,
      required: false,
      default: 'search'
    },
    defaultData: {
      type: Object,
      required: false
    },
    layout: { // 表单布局'horizontal'|'vertical'|'inline'
      type: String,
      required: false,
      default: 'inline'
    },
    layoutOption: { // layout != inline时的a-row的参数设置项
      type: Object,
      required: false
    },
  },
  computed: {
    target() {
      return this.search.$data[this.type]
    },
    dictionaryList() {
      return this.target.list.data.map(item => {
        return item.$parent!
      })
    },
    formProps() {
      const data = {
        form: this.target.form,
        list: this.target.list,
        type: this.type,
        menu: this.search.menu.list,
        layout: this.layout,
        layoutOption: this.layoutOption,
        onEvent: this.onEvent,
        onEventEnd: this.onEventEnd,
        onMenu: this.onMenu
      }
      return data
    },
    eventPayload() {
      return {
        target: this,
        type: this.type,
        form: this.target.form.getData(),
        list: this.dictionaryList
      }
    }
  },
  mounted() {
    if (this.defaultData) {
      this.setDefaultData(this.defaultData)
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
    setDefaultData(defaultData: Record<PropertyKey, any>, clearValidate = true) {
      this.search.setForm(defaultData, { modName: this.type, sync: true }).finally(() => {
        if (clearValidate) {
          this.$nextTick(() => {
            this.target.form.clearValidate()
          })
        }
      })
    },
    show(defaultData?: Record<PropertyKey, any>) {
      if (defaultData) {
        this.setDefaultData(defaultData)
      } else {
        this.$nextTick(() => {
          this.target.form.clearValidate()
        })
      }
    }
  }
})
</script>
