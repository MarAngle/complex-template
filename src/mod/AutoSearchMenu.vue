<style lang='less' scoped>
.complex-auto-search-menu{
  margin-top: 19px;
  /deep/.ant-form-inline{
    .ant-form-item{
      margin-bottom: 19px;
      &.ant-form-item-with-help{
        margin-bottom: 0;
      }
    }
  }
}
</style>
<template>
  <AutoMenu v-bind="$attrs" v-on="$listeners" class="complex-auto-search-menu">
    <slot ref="content"></slot>
  </AutoMenu>
</template>

<script>
import AutoMenu from './AutoMenu'

export default {
  name: 'AutoSearchMenu',
  components: {
    AutoMenu
  }
}
</script>
