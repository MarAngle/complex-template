<style lang='less' scoped>
.AutoTextHeight{
  margin: 0;
  width: 100%;
  word-wrap: break-word;
  word-break: break-all;
  &.auto{
    overflow: hidden;
    &.isAuto{
      cursor: pointer;
    }
  }
  .AutoTextHeightText{
    display: inline-block;
    width: 100%;
  }
}
</style>
<template>
  <p
    ref="main"
    class="AutoTextHeight"
    :style="style"
    :class="{ auto: auto, isAuto: isEllipsis }"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <a-tooltip v-bind="tipOption" >
      <span class="AutoTextHeightText" ref="text" >{{ showText }}</span>
    </a-tooltip>
  </p>
</template>

<script>
export default {
  name: 'AutoTextHeight',
  data () {
    return {
      isEllipsis: false,
      isCount: false,
      showText: ''
    }
  },
  computed: {
    tipOption () {
      let option
      if (this.isEllipsis) {
        if (typeof this.tip == 'object') {
          option = this.tip
        } else {
          option = {
            placement: this.tip || 'top'
          }
        }
        if (!option.title) {
          option.title = this.text
        }
      } else {
        option = {}
      }
      return option
    },
    style() {
      let data = {
        fontSize: this.fontSize + 'px',
        lineHeight: this.height + 'px'
      }
      if (this.auto) {
        data.maxHeight = this.maxHeight + 'px'
      }
      return data
    },
    maxHeight() {
      return this.height * this.line
    }
  },
  props: {
    text: {
      required: false,
      default: ''
    },
    auto: {
      type: Boolean,
      required: false,
      default: true
    },
    tip: {
      type: [String, Object],
      required: false
    },
    height: {
      type: Number,
      required: false,
      default: 32
    },
    fontSize: {
      type: Number,
      required: false,
      default: 14
    },
    line: {
      type: Number,
      required: false,
      default: 2
    }
  },
  watch: {
    text: function() {
      this.autoStart()
    },
    auto: function() {
      this.autoStart()
    }
  },
  mounted () {
    this.autoStart()
  },
  methods: {
    autoStart() {
      this.showText = this.text
      this.isEllipsis = false
      if (this.auto) {
        this.startCount()
      } else {
        this.stopCount()
      }
    },
    stopCount() {
      this.isCount = false
    },
    startCount() {
      // 不在计算中进行计算，否则的话不错任何操作，之前的回调自会再nextTick中去重新触发
      if (!this.isCount) {
        this.isCount = true
        this.doCount()
      }
    },
    reCountText(step) {
      if (!this.isEllipsis) {
        this.showText += '...'
        this.isEllipsis = true
      }
      this.showText = this.showText.substring(0, this.showText.length - step - 3)
      this.showText += '...'
    },
    doCount() {
      this.$nextTick(() => {
        if (this.isCount) {
          let mainHeight = this.maxHeight
          let currentHeight = this.$refs['text'].offsetHeight
          if (currentHeight > mainHeight) {
            // 高于当前数据时
            let step = (currentHeight - mainHeight) / this.height
            step = Math.floor(step)
            if (step < 1) {
              step = 1
            }
            this.reCountText(step)
            this.doCount()
          } else {
            this.stopCount()
          }
        }
      })
    }
  }
}
</script>
