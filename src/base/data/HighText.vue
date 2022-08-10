<template>
  <span class="complex-high-text">
    <span v-for="(val,key) in list" :key="key" class="complex-high-text-item" :class="{ 'complex-high-text-item-is-high': val.high }" :style="val.high ? highStyle : defaultStyle" >{{ val.data }}</span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import $func from 'complex-func'

export default defineComponent({
  name: 'ComplexHighText',
  data () {
    const list: {
      data: string,
      high: boolean
    }[] = []
    return {
      list: list
    }
  },
  props: {
    data: {
      required: true
    },
    target: {
      type: String,
      required: true
    },
    defaultStyle: {
      type: Object,
      required: false,
      default: function() {
        return {}
      }
    },
    highStyle: {
      type: Object,
      required: false,
      default: function() {
        return {
          color: '#FF4D4F'
        }
      }
    },
    limitNum: {
      type: [Number, Boolean],
      required: false,
      default: false
    },
    limitCase: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  // watch: {
  //   'data': {
  //     immediate: true,
  //     handler: function(val) {
  //       this.initList(val)
  //     }
  //   }
  // },
  methods: {
    initList(data?: any) {
      this.list = []
      if (data) {
        const origindata: string = data.toString()
        const findList = $func.findTargetInStr(data, this.target, {
          limitNum: this.limitNum,
          case: this.limitCase
        })
        const indexList = this.getHighIndex(findList, this.target.length)
        const list = origindata.split('')
        for (let n = 0; n < list.length; n++) {
          this.list.push({
            data: list[n],
            high: indexList.indexOf(n) > -1
          })
        }
      }
    },
    getHighIndex(startList: number[], size: number) {
      const list = []
      for (let i = 0; i < startList.length; i++) {
        for (let n = 0; n < size; n++) {
          list.push(startList[i] + n)
        }
      }
      return list
    }
  }
})
</script>
