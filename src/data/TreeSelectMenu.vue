<style lang='less' scoped >
p{
  margin: 0;
}
.TreeSelectMenu-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .TreeSelectMenu-titleitem {
    cursor: pointer;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    &:last-child {
      justify-content: flex-end;
    }
    .TreeSelectMenu-title-check {
      margin-right: 5px;
    }
    .TreeSelectMenu-title-select {
      &.selected{
        color: #01dcea;
      }
    }
  }
}
</style>
<template>
  <div :style="{ marginLeft: indent * depth + indentUnit }" class="TreeSelectMenu">
    <div class="TreeSelectMenu-title">
      <div class="TreeSelectMenu-titleitem">
        <div class="TreeSelectMenu-title-check">
          <a-checkbox
            :checked="checked"
            :indeterminate="indeterminate"
            @change="onCheck"
          ></a-checkbox>
        </div>
        <div class="TreeSelectMenu-title-select" :class="{ selected: selected }" @click="onSelect">
          <p>{{ data[name] }}</p>
        </div>
      </div>
      <div class="TreeSelectMenu-titleitem">
        <div class="TreeSelectMenu-title-expand" v-if="hasChild" :class="{ expanded: selected }" @click="onExpand">
          <a-icon :type=" expanded ? 'minus' : 'plus'" />
        </div>
      </div>
    </div>
    <template v-if="hasChild">
      <div v-show="expanded" class="TreeSelectMenu-Children">
        <TreeSelectMenu
          v-for="(val, key) in data[children]"
          :key="key"
          :data="val"
          :check="check"
          :select="select"
          :expand="expand"
          :option="option"
          :id="id"
          :name="name"
          :parentId="parentId"
          :children="children"
          :indent="indent"
          :indentUnit="indentUnit"
          :depth="depth + 1"
          @event="onEvent"
        ></TreeSelectMenu>
      </div>
    </template>
  </div>
</template>
<script>
export default {
  name: 'TreeSelectMenu',
  data() {
    return {
      indeterminate: false
    }
  },
  mounted() {
    this.pageLoad()
  },
  computed: {
    checked: function() {
      return this.isChoice(this.data, 'check')
    },
    selected: function() {
      return this.isChoice(this.data, 'select')
    },
    expanded: function() {
      return this.isChoice(this.data, 'expand')
    },
    hasChild: function() {
      return this.data[this.children] && this.data[this.children].length > 0
    }
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    check: {
      type: Array,
      required: true
    },
    select: {
      type: Array,
      required: true
    },
    expand: {
      type: Array,
      required: true
    },
    option: {
      type: Object,
      required: true
    },
    id: {
      type: String,
      required: false,
      default: 'id'
    },
    name: {
      type: String,
      required: false,
      default: 'name'
    },
    parentId: {
      type: String,
      required: false,
      default: 'parentId'
    },
    children: {
      type: String,
      required: false,
      default: 'children'
    },
    depth: {
      type: Number,
      required: false,
      default: 0
    },
    indent: {
      type: Number,
      required: false,
      default: 10
    },
    indentUnit: {
      type: String,
      required: false,
      default: 'px'
    }
  },
  methods: {
    onCheck() {
      let act = this.checked
      let prop = 'check'
      this.onNext(this.data, act, prop)
      this.$emit('event', prop, this[prop], {
        current: !act,
        target: this.data
      })
    },
    onSelect() {
      let act = this.selected
      let prop = 'select'
      this.onNext(this.data, act, prop)
      this.$emit('event', prop, this[prop], {
        current: !act,
        target: this.data
      })
    },
    onExpand() {
      let act = this.expanded
      let prop = 'expand'
      this.onNext(this.data, act, prop)
      this.$emit('event', prop, this[prop], {
        current: !act,
        target: this.data
      })
    },
    getOption(prop) {
      return this.option[prop] || {}
    },
    onEvent(prop, list, { current, target }) {
      let option = this.getOption(prop)
      if (option.parent) {
        if (prop == 'check') {
          let childrenList = this.data[this.children]
          let childrenSizeNum = childrenList.length
          let childrenChoiceNum = 0
          for (let n = 0; n < childrenSizeNum; n++) {
            let childrenItem = childrenList[n]
            if (this.isChoice(childrenItem, prop)) {
              childrenChoiceNum++
            }
          }
          // 选择操作
          if (current) {
            // 选择数量和总数一致，则确定选择
            if (childrenSizeNum == childrenChoiceNum) {
              this.indeterminate = false
              if (!this.checked) {
                this.pushItem(this.data, prop, option)
              }
            } else {
              // 不一致则肯定存在选择，但是不全选
              this.indeterminate = true
              if (this.checked) {
                this.delItem(this.data, prop)
              }
            }
          } else {
            // 取消选择操作
            // 未选择数量为0，确认未选择
            if (childrenChoiceNum == 0) {
              this.indeterminate = false
              if (this.checked) {
                this.delItem(this.data, prop)
              }
            } else {
            // 未选择数量不为为0，确认存在选择但是未全部选择
              this.indeterminate = true
              if (this.checked) {
                this.delItem(this.data, prop)
              }
            }
          }
        }
      }
    },
    onNext(item, current, prop) {
      let option = this.getOption(prop)
      if (!current) {
        if (!this.isChoice(item, prop)) {
          this.pushItem(item, prop, option)
        }
      } else {
        if (this.isChoice(item, prop)) {
          this.delItem(item, prop)
        }
      }
      if (option.child) {
        let childrenList = item[this.children]
        if (childrenList && childrenList.length > 0) {
          for (let n = 0; n < childrenList.length; n++) {
            let childrenItem = childrenList[n]
            this.onNext(childrenItem, current, prop)
          }
        }
      }
    },
    pushItem(item, prop, option) {
      let itemId = item[this.id]
      this[prop].push(itemId)
      if (!option.multiple && this[prop].length > 1) {
        this[prop].splice(0, this[prop].length - 1)
      }
    },
    delItem(item, prop) {
      let itemId = item[this.id]
      let index = this[prop].indexOf(itemId)
      if (index > -1) {
        this[prop].splice(index, 1)
      }
    },
    isChoice(item, prop) {
      return this[prop].indexOf(item[this.id]) > -1
    },
    pageLoad() {}
  }
}
</script>
