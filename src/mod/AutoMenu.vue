<style lang='less' scoped>
.complex-auto-menu{
  &.complex-auto-menu-is-show{
    position: relative;
    overflow: hidden;
  }
  .complex-auto-menu-main{
    cursor: pointer;
    position: absolute;
    top: 0;
    text-align: center;
    P{
      margin: 0;
      .complex-auto-menu-main-icon{
        margin-right: 5px;
      }
    }
  }
}
</style>
<template>
  <div ref="complexAutoMenu" class="complex-auto-menu" :class="menu.show ? 'complex-auto-menu-is-show' : ''" :style="currentMainStyle">
    <slot ref="content"></slot>
    <div v-show="menu.show" class="complex-auto-menu-main" :style="currentMenuStyle" @click="toggleOpen" >
      <slot name="menu">
        <div>
          <p>
            <a-icon class="complex-auto-menu-main-icon" :type="currentMenuOption.icon" />
            <span>{{ currentMenuOption.text }}</span>
          </p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
import config from '../../config'

export default {
  name: 'AutoMenu',
  props: {
    height: {
      type: Number,
      required: true
    },
    auto: {
      type: Object,
      required: false,
      default: function() {
        return null
      }
    },
    recount: {
      type: Number,
      required: false,
      default: undefined
    },
    defaultOpen: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      menu: {
        show: false,
        open: this.defaultOpen
      }
    }
  },
  computed: {
    currentAuto() {
      let currentAuto = this._func.setDataByDefault(this.auto, config.AutoMenu.auto)
      return currentAuto
    },
    currentMainStyle: function() {
      let currentMainStyle = {}
      if (this.menu.show && !this.menu.open) {
        currentMainStyle.height = this.height + 'px'
      }
      if (this.menu.show) {
        let prop = 'padding-' + this.currentAuto.menu.location
        currentMainStyle[prop] = this.currentAuto.menu.width
      }
      return currentMainStyle
    },
    currentMenuStyle: function() {
      let currentMenuStyle = {
        width: this.currentAuto.menu.width,
        [this.currentAuto.menu.location]: 0
      }
      if (this.menu.show) {
        currentMenuStyle.height = this.height + 'px'
        currentMenuStyle.lineHeight = this.height + 'px'
        if (this.currentAuto.menu.style) {
          for (let n in this.currentAuto.menu.style) {
            currentMenuStyle[n] = this.this.currentAuto.menu.style[n]
          }
        }
      }
      return currentMenuStyle
    },
    currentMenuOption() {
      if (this.menu.open) {
        return this.currentAuto.open
      } else {
        return this.this.currentAuto.close
      }
    },
    currentRecount() {
      if (this.recount !== undefined) {
        return this.recount
      } else {
        return this._func.page.recount.data
      }
    }
  },
  watch: {
    'currentRecount': function() {
      this.checkHeight('resize')
    }
  },
  mounted() {
    // 重要，antd的布局在第一次加载时可能存在宽度的判断错误，如同左侧菜单栏不存在时的宽度一样，避免问题加载2次后在进行判断
    this.$nextTick(() => {
      this.checkHeight('mounted')
    })
  },
  methods: {
    checkHeight(from) {
      this.menu.show = false
      this.$nextTick(() => {
        let currentHeight = this.$refs.complexAutoMenu.clientHeight
        if (currentHeight > this.height) {
          this.menu.show = true
        }
      })
    },
    toggleOpen() {
      this.menu.open = !this.menu.open
      this.$emit('open', this.menu.open)
    }
  }
}
</script>
