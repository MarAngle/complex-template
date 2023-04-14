<style scoped>


</style>
<template>
  <a-tooltip v-if="currentTip"></a-tooltip>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue"
import { mergeData } from "complex-utils"
import { ObserveList, DefaultEdit } from "complex-data-next"
import { ComplexFormData } from "../../base/data/EditForm.vue"

export default defineComponent({
  name: 'FormItemCom',
  data () {
    return {}
  },
  props: {
    data: {
      type: Object as PropType<DefaultEdit>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    list: {
      type: Object as PropType<ObserveList>,
      required: true
    },
    form: { // form数据{ data, num }
      type: Object as PropType<ComplexFormData>,
      required: true
    },
    type: { // formType
      type: String,
      required: true
    },
    target: { // FormView实例
      type: Object,
      required: true
    }
  },
  computed: {
    currentTip() {
      return this.data.tip.getData ? this.data.tip.getData(this.payload) : this.data.tip.data
    },
    payload() {
      return {
        prop: this.data.prop,
        type: this.type,
        data: this.data,
        index: this.index,
        form: this.form,
        list: this.list,
        target: this.target
      }
    }
  },
  mounted () {
    //
    this.form.setRef(this.$refs['form'])
  },
  methods: {
    formatGrid(data: DefaultEdit) {
      const ditem = data.$getParent()!
      return {
        span: ditem.$getLayout(this.type).grid
      }
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
