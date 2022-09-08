<style scoped>
.complex-form-view-inline{}
.complex-form-view-horizontal{}
.complex-form-view-vertical{}
</style>
<template>
  <div class="complex-form-view" :class="'complex-form-view' + layout" >
    <a-form
      ref="form"
      :model="form.data"
      :layout="layout"
    >
      <template v-if="layout == 'inline'" >
        <FormItem
          v-for="(val, index) in list.data"
          :key="val.prop"
          :data="val"
          :index="index"
          :layout="layout"
          :type="type"
          :target="this"
        />
      </template>
      <a-row v-else v-bind="layoutOption" >
        <a-col
          v-for="(val, index) in list.data"
          :key="val.prop"
          v-bind="getItemGrid(val)"
        >
          <FormItem
            :data="val"
            :index="index"
            :layout="layout"
            :type="type"
            :target="this"
          />
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script lang="ts">
import { PageList } from "complex-data";
import { objectAny } from "complex-data/ts";
import { defineComponent, PropType } from "vue";
import FormItem from "./../mod/FormItem.vue";
import config from '../config'
import $func from "complex-func";

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
      type: Object as PropType<objectAny>,
      required: true
    },
    list: {
      type: Object as PropType<PageList>,
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
  },
  mounted() {
    this.setFormRef()
  },
  methods: {
    /**
     * 设置form的ref
     * @param {*} check 是否进行规则检查
     * @param {*} clear 在不进行规则检查的基础上是否清除规则检查
     */
    setFormRef() {
      // eslint-disable-next-line vue/no-mutating-props
      this.form.ref = this.$refs.form
    },
    getItemGrid(data: any) {
      console.log(data)
      const gridType = $func.getType(data.layout.grid)
      let gridOption
      if (gridType != 'object') {
        gridOption = {
          span: data.layout.grid
        }
      } else {
        gridOption = { ...data.layout.grid }
      }
      return gridOption
    }
  }
})
</script>
