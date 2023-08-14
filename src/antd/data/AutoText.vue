<style scoped>
.complex-auto-text{
  display: block;
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
  <Tooltip v-bind="tipOption" >
    <p ref="main" class="complex-auto-text" :class="{ 'complex-auto-text-auto': auto, 'complex-auto-text-is-auto': isEllipsis }" >
      <span ref="size" >{{ text }}</span>
    </p>
  </Tooltip>
</template>

<script lang="ts">
import { Tooltip } from "ant-design-vue"
import { defineComponent } from "vue"

export default defineComponent({
  name: 'ComplexAutoText',
  components: {
    Tooltip
  },
  data () {
    return {
      isEllipsis: false
    }
  },
  computed: {
    tipOption () {
      let option
      if (this.isEllipsis && this.tip !== false) {
        if (typeof this.tip === 'object') {
          option = {
            title: this.tip.getData ? this.tip.getData(this.text) : this.tip.data,
            placement: this.tip.location,
            ...this.tip.localOption
          }
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
      type: [String, Boolean, Object],
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
        const mainWidth = (this.$refs as any).main.offsetWidth
        const currentWith = (this.$refs as any).size.offsetWidth
        if (mainWidth < currentWith) {
          this.isEllipsis = true
        } else {
          this.isEllipsis = false
        }
      })
    }
  }
})
</script>
