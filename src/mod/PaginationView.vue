<style lang='less' scoped>
.complex-pagination-view{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  .complex-pagination-view-line{
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    &:last-child{
      justify-content: flex-end;
    }
  }
}
</style>
<template>
  <div
    class="complex-pagination-view"
    v-bind="currentMainOption.props"
  >
    <div class="complex-pagination-view-line">
      <slot
        :data="data"
        :page="data.data.page.current"
        :size="data.data.size.current"
        :total="data.data.page.total"
        :totalNum="data.data.num.total"
      ></slot>
    </div>
    <div class="complex-pagination-view-line">
      <div class="complex-pagination-view-line-item">
        <slot
          name="front"
          :data="data"
          :page="data.data.page.current"
          :size="data.data.size.current"
          :total="data.data.page.total"
          :totalNum="data.data.num.total"
        ></slot>
      </div>
      <div class="complex-pagination-view-line-item">
        <a-pagination
          v-bind="currentOption.props"
          @change="onChange"
          @showSizeChange="onSizeChange"
        />
      </div>
      <div class="complex-pagination-view-line-item">
        <slot
          name="end"
          :data="data"
          :page="data.data.page.current"
          :size="data.data.size.current"
          :total="data.data.page.total"
          :totalNum="data.data.num.total"
        ></slot>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'PaginationView',
  data () {
    return {
      life: undefined
    }
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    option: {
      type: Object,
      required: false,
      default: null
    },
    mainOption: {
      type: Object,
      required: false,
      default: null
    }
  },
  computed: {
    currentOption() {
      let currentOption = this.data.getOption()
      if (this.option) {
        for (let n in this.option) {
          if (!currentOption[n]) {
            currentOption[n] = {}
          }
          currentOption[n] = {
            ...currentOption[n],
            ...this.option[n]
          }
        }
      }
      currentOption.props.current = this.data.data.page.current
      currentOption.props.pageSize = this.data.data.size.current
      currentOption.props.pageSizeOptions = this.data.data.size.list
      currentOption.props.total = this.data.data.num.total
      return currentOption
    },
    currentMainOption() {
      let currentMainOption = {
        props: {
          style: {
            padding: '10px 0'
          }
        }
      }
      if (this.mainOption) {
        for (let n in this.mainOption) {
          currentMainOption.props[n] = {
            ...currentMainOption[n],
            ...this.mainOption[n]
          }
        }
      }
      return currentMainOption
    }
  },
  mounted() {
    this.onLife()
  },
  beforeDestroy() {
    this.offLife()
  },
  methods: {
    onLife() {
      this.life = this.data.onLife('change', {
        data: (instantiater, prop, page) => {
          this.$emit('change', prop, page)
        }
      })
    },
    offLife() {
      this.data.offLife('change', this.life)
    },
    onChange(page) {
      this.data.setPage(page)
    },
    onSizeChange(page, size) {
      this.data.setSizeAndPage({
        size: size,
        page: page
      })
    }
  }
}
</script>
