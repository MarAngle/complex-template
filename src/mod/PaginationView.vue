<style lang='less' scoped>
.PaginationView{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  .PaginationViewLine{
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
    class="PaginationView"
    v-bind="currentMainOption.props"
  >
    <div class="PaginationViewLine">
      <slot
        :data="data"
        :page="data.data.page.current"
        :size="data.data.size.current"
        :total="data.data.page.total"
        :totalNum="data.data.num.total"
      ></slot>
    </div>
    <div class="PaginationViewLine">
      <div class="PaginationViewLineItem">
        <slot
          name="front"
          :data="data"
          :page="data.data.page.current"
          :size="data.data.size.current"
          :total="data.data.page.total"
          :totalNum="data.data.num.total"
        ></slot>
      </div>
      <div class="PaginationViewLineItem">
        <a-pagination
          v-bind="currentOption.props"
          @change="onChange"
          @showSizeChange="onSizeChange"
        />
      </div>
      <div class="PaginationViewLineItem">
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
      return {}
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
    methods: {
      onChange(current) {
        this.data.setPage(current)
        this.$emit('change', 'page', current)
      },
      onSizeChange(current, size) {
        this.data.setSize({
          page: current,
          size: size
        })
        this.$emit('change', 'size', {
          page: current,
          size: size
        })
      }
    }
  }
</script>
