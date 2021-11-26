<style scoped>
.complex-auto-text{
  display: inline-block;
  width: 100%;
  margin: 0;
  word-wrap: break-word;
  word-break: break-all;
}
.complex-auto-text-auto{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.complex-auto-text-is-auto{
  cursor: pointer;
}

</style>
<template>
  <a-tooltip v-bind="tipOption" >
    <p ref="main" class="complex-auto-text" :class="{ 'complex-auto-text-auto': auto, 'complex-auto-text-is-auto': isEllipsis }" v-bind="$attrs" v-on="$listeners" >
      <span ref="size" >{{ text }}</span>
    </p>
  </a-tooltip>
</template>

<script>
import _func from 'complex-func'

export default {
  name: 'AutoText',
  data () {
    return {
      isEllipsis: false
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
    recount: {
      required: false,
      default: 0
    },
    tip: {
      type: [String, Object, Boolean],
      required: false
    }
  },
  watch: {
    text: function() {
      this.autoWidth()
    },
    recount: function() {
      this.autoWidth()
    }
  },
  mounted () {
    this.autoWidth()
  },
  methods: {
    autoWidth() {
      this.$nextTick(() => {
        let mainWidth = this.$refs['main'].offsetWidth
        let currentWith = this.$refs['size'].offsetWidth
        if (mainWidth < currentWith) {
          this.isEllipsis = true
        } else {
          this.isEllipsis = false
        }
      })
    }
  }
}
</script>
