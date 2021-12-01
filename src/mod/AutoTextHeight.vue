<style lang='less' scoped>
.complex-auto-text-height{
  margin: 0;
  word-wrap: break-word;
  word-break: break-all;
  &.complex-auto-text-height-auto{
    overflow: hidden;
    &.complex-auto-text-height-is-auto{
      cursor: pointer;
    }
  }
  .complex-auto-text-height-text{
    display: inline-block;
    width: 100%;
  }
}
</style>
<template>
  <p
    ref="main"
    class="complex-auto-text-height"
    :style="style"
    :class="{ 'complex-auto-text-height-auto': auto, 'complex-auto-text-height-is-auto': isEllipsis }"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <a-tooltip v-bind="tipOption" >
      <span v-show="showText || emptyShow" class="complex-auto-text-height-text" ref="text" >{{ showText }}</span>
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
      if (this.isEllipsis && this.tip !== false) {
        if (typeof this.tip == 'object') {
          option = this.tip
        } else {
          option = {
            placement: this.tip || 'top'
          }
        }
        if (option.title === undefined) {
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
    recount: {
      required: false,
      default: 0
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
      default: 1
    },
    tip: {
      type: [String, Object, Boolean],
      required: false
    },
    auto: {
      type: Boolean,
      required: false,
      default: true
    },
    emptyShow: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  watch: {
    text: function() {
      this.initCount()
    },
    recount: function() {
      this.initCount()
    },
    auto: function() {
      this.initCount()
    }
  },
  mounted () {
    this.initCount()
  },
  methods: {
    initCount() {
      this.showText = this.text
      this.isEllipsis = false
      if (this.auto && this.showText) {
        this.startCount()
      } else {
        this.stopCount()
      }
    },
    stopCount() {
      this.isCount = false
    },
    startCount() {
      // 未计算时触发计算操作，计算过程中无需重新触发，之前的回调会在nextTick中重新触发
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
          let currentHeight = this.$refs['text'].offsetHeight
          if (this.showText && !currentHeight) {
            this.doCount()
          } else {
            let maxHeight = this.maxHeight
            if (currentHeight > maxHeight) {
              // 高于当前数据时
              let rate = Math.floor((currentHeight - maxHeight) / this.height)
              if (rate < 1) {
                rate = 1
              }
              this.reCountText(rate)
              this.doCount()
            } else {
              this.stopCount()
            }
          }
        }
      })
    }
  }
}
</script>
