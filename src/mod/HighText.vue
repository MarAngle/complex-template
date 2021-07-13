<style scoped>

</style>
<template>
  <span class="HighText">
    <span v-for="(val,key) in list" :key="key" :class="{ isHigh: val.high, HighTextItem: true }" :style="val.high ? highStyle : defaultStyle" >{{ val.data }}</span>
  </span>
</template>

<script>

export default {
  name: 'HighText',
  data () {
    return {
      list: []
    }
  },
  props: {
    data: {
      required: true
    },
    target: {
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
  watch: {
    'data': {
      immediate: true,
      handler: function(val) {
        this.initList(val)
      }
    }
  },
  methods: {
    initList(data) {
      this.list = []
      if (data) {
        let origindata = data.toString()
        let findList = this._func.findTargetInStr(data, this.target, {
          limit: this.limitNum,
          case: this.limitCase
        })
        let indexList = this.getHighIndex(findList, this.target.length)
        let list = origindata.split('')
        for (let n = 0; n < list.length; n++) {
          this.list.push({
            data: list[n],
            high: indexList.indexOf(n) > -1
          })
        }
      }
    },
    getHighIndex(startList, size) {
      let list = []
      for (let i = 0; i < startList.length; i++) {
        for (let n = 0; n < size; n++) {
          list.push(startList[i] + n)
        }
      }
      return list
    }
  }
}
</script>
