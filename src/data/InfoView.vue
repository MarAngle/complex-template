<style lang='less' scoped >
.complex-info-view{
  padding: 10px 10px;
  p{
    margin: 0;
    line-height: 32px;
    padding: 4px 0;
  }
}
</style>
<template>
  <div class="complex-info-view">
    <div class="complex-info-view-list">
      <div class="complex-info-view-item" v-for="(val, index) in mainlist" :key="val.prop" >
        <a-row type="flex" v-if="val.layout.type == 'grid'">
          <a-col class="complex-info-view-item-label" v-bind="val.layout.label" >
            <slot :name="val.prop + '-label'" :data="val" :index="index" >
              <p>{{ val.label }}</p>
            </slot>
          </a-col>
          <a-col class="complex-info-view-item-content" v-bind="val.layout.content" >
            <slot :name="val.prop + '-content'" :data="val" :index="index" >
              <p>{{ val.data }}</p>
            </slot>
          </a-col>
        </a-row>
        <div v-else >
          <div class="complex-info-view-item-label" :style="{ width: val.layout.width }" >
            <slot :name="val.prop + '-label'" :data="val" :index="index" >
              <p>{{ val.label }}</p>
            </slot>
          </div>
          <div class="complex-info-view-item-content" >
            <slot :name="val.prop + '-content'" :data="val" :index="index" >
              <p>{{ val.data }}</p>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'InfoView',
  data() {
    return {
      mainlist: []
    }
  },
  props: {
    maindata: {
      type: Object,
      required: true
    },
    data: {
      type: Object,
      required: false
    },
    type: {
      type: String,
      required: false,
      default: 'info'
    }
  },
  computed: {
    currentData: function() {
      let currentData
      if (!this.data) {
        currentData = this.maindata.data.current
      } else {
        currentData = this.data
      }
      return currentData
    }
  },
  watch: {
    currentData: {
      immediate: true,
      deep: true,
      handler: function() {
        this.buildMainList()
      }
    }
  },
  mounted() {
    this.pageLoad()
  },
  methods: {
    buildMainList () {
      this.mainlist = this.maindata.getDictionaryPageList(this.type, {
        targetitem: this.currentData
      })
    },
    pageLoad() {
    }
  }
}
</script>
