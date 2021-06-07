<style lang='less' scoped>
.AutoMenu{
  &.menuShow{
    position: relative;
    padding-right: 100px;
    overflow: hidden;
  }
  .menu{
    cursor: pointer;
    position: absolute;
    top: 0;
    right: 0;
    text-align: center;
    P{
      margin: 0;
      .icon{
        margin-right: 5px;
      }
    }
  }
}
</style>
<template>
  <div ref="mainContent" class="AutoMenu" :class="{ menuShow: menu.show }" :style="currentMainStyle">
    <slot ref="content"></slot>
    <div v-show="menu.show" class="menu" :style="currentMenuStyle" @click="toggleOpen" >
      <div>
        <p>
          <a-icon class="icon" :type="currentMenuOption.icon" />
          <span>{{ currentMenuOption.text }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import _func from 'complex-func'

export default {
  name: 'AutoMenu',
  props: {
    height: {
      type: Number,
      required: true
    },
    defaultOpen: {
      type: Boolean,
      required: false
    },
    menuStyle: {
      type: Object,
      required: false,
      default: null
    },
    closeOption: {
      type: Object,
      required: false,
      default: null
    },
    openOption: {
      type: Object,
      required: false,
      default: null
    }
  },
  data() {
    return {
      page: _func.page,
      menu: {
        show: false,
        open: this.defaultOpen
      }
    }
  },
  computed: {
    currentMainStyle: function() {
      let currentMainStyle = {}
      if (this.menu.show && !this.menu.open) {
        currentMainStyle.height = this.height + 'px'
      }
      return currentMainStyle
    },
    currentMenuStyle: function() {
      let currentMenuStyle = {
        width: '70px'
      }
      if (this.menu.show) {
        currentMenuStyle.height = this.height + 'px'
        currentMenuStyle.lineHeight = this.height + 'px'
        if (this.menuStyle) {
          for (let n in this.menuStyle) {
            currentMenuStyle[n] = this.menuStyle[n]
          }
        }
      }
      return currentMenuStyle
    },
    currentCloseOption: function() {
      let currentCloseOption = {
        icon: 'down',
        text: '打开',
        style: {}
      }
      if (this.closeOption) {
        for (let n in this.closeOption) {
          currentCloseOption[n] = this.closeOption[n]
        }
      }
      return currentCloseOption
    },
    currentOpenOption: function() {
      let currentOpenOption = {
        icon: 'up',
        text: '关闭',
        style: {}
      }
      if (this.openOption) {
        for (let n in this.openOption) {
          currentOpenOption[n] = this.openOption[n]
        }
      }
      return currentOpenOption
    },
    currentMenuOption() {
      if (this.menu.open) {
        return this.currentOpenOption
      } else {
        return this.currentCloseOption
      }
    }
  },
  watch: {
    'page.recount.main': function() {
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
        let currentHeight = this.$refs.mainContent.clientHeight
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
