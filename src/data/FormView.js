import _func from 'complex-func'
import config from '../../config'
import utils from '../utils'
import EventData from '../build/EventData'
import PaginationView from './../mod/PaginationView'
import UploadFile from './../mod/UploadFile'

let showLogs = {
  init: false,
  model: false
}

// 双向绑定函数列表
const modelFuncList = {
  valueInit: function (itemOption, formData, prop) {
    if (showLogs.init) { console.log(itemOption, formData, prop) }
    itemOption.props.value = formData[prop]
  },
  checkInit: function (itemOption, formData, prop) {
    if (showLogs.init) { console.log(itemOption, formData, prop) }
    itemOption.props.checked = formData[prop]
  },
  input: function (formdata, prop, args) {
    if (showLogs.model) { console.log(formdata, prop, args) }
    formdata[prop] = args[0].target.value
  },
  select: function (formdata, prop, args) {
    if (showLogs.model) { console.log(formdata, prop, args) }
    formdata[prop] = args[0]
  },
  change: function (formdata, prop, args) {
    if (showLogs.model) { console.log(formdata, prop, args) }
    formdata[prop] = args[0]
  }
}

// 类型格式化
let typeFormat = {
  base: {
    func: {
      init: modelFuncList.valueInit,
      data: {
        change: modelFuncList.change
      }
    },
    option: function(itemOption, item, payload) {
      return itemOption
    }
  },
  data: {
    ainput: {
      func: {
        data: {
          input: modelFuncList.input
        }
      },
      option: function(itemOption, item, payload) {
        itemOption.props = {
          type: item.edit.option.type,
          allowClear: !item.edit.option.hideClear,
          maxLength: item.edit.option.maxLength,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    },
    ainputNumber: {
      func: {},
      option: function(itemOption, item, payload) {
        itemOption.props = {
          min: item.edit.option.min,
          max: item.edit.option.max,
          precision: item.edit.option.precision,
          step: item.edit.option.step,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    },
    aswitch: {
      func: {
        init: modelFuncList.checkInit
      },
      option: function(itemOption, item, payload) {
        itemOption.props = {
          disabled: item.edit.disabled.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    },
    aselect: {
      func: {},
      option: function(itemOption, item, payload) {
        itemOption.props = {
          mode: item.edit.option.mode,
          showSearch: item.edit.option.search.show,
          showArrow: !item.edit.option.hideArrow,
          allowClear: !item.edit.option.hideClear,
          dropdownMatchSelectWidth: item.edit.option.autoWidth,
          notFoundContent: item.edit.option.noDataContent,
          filterOption: item.edit.option.filterOption,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    },
    adate: {
      func: {},
      option: function(itemOption, item, payload) {
        itemOption.props = {
          format: item.edit.option.format,
          showTime: item.edit.option.showTime,
          disabledDate: item.edit.option.disabledDate,
          disabledTime: item.edit.option.disabledTime,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        utils.formatMoment(itemOption.props, ['value', 'defaultValue'], [itemOption.props.formatedit, itemOption.props.formatedit])
        if (itemOption.props.showTime) {
          utils.formatMoment(itemOption.props.showTime, ['defaultValue', 'defaultOpenValue'], [itemOption.props.showTime.format, itemOption.props.showTime.format])
        }
        return itemOption
      }
    },
    adateRange: {
      func: {},
      option: function(itemOption, item, payload) {
        itemOption.props = {
          format: item.edit.option.format,
          showTime: item.edit.option.showTime,
          separator: item.edit.option.separator,
          disabledDate: item.edit.option.disabledDate,
          disabledTime: item.edit.option.disabledTime,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        utils.formatMoment(itemOption.props, ['value', 'defaultValue'], [itemOption.props.formatedit, itemOption.props.formatedit], true)
        if (itemOption.props.showTime) {
          utils.formatMoment(itemOption.props.showTime, ['defaultValue', 'defaultOpenValue'], [itemOption.props.showTime.format, itemOption.props.showTime.format], true)
        }
        return itemOption
      }
    },
    afile: {
      func: {},
      option: function(itemOption, item, payload) {
        let layout = item.edit.option.layout
        if (layout == 'auto') {
          if (this.layout == 'inline') {
            layout = 'end'
          } else {
            layout = 'bottom'
          }
        }
        itemOption.props = {
          accept: item.edit.option.accept,
          multiple: item.edit.option.multiple,
          multipleAppend: item.edit.option.multipleAppend,
          maxNum: item.edit.option.maxNum,
          minNum: item.edit.option.minNum,
          maxSize: item.edit.option.maxSize,
          upload: item.edit.option.upload,
          fileUpload: item.edit.option.fileUpload,
          layout: layout,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    },
    abutton: {
      func: {
        init: false,
        data: {}
      },
      option: function(itemOption, item, payload) {
        itemOption.props = {
          loading: item.edit.option.loading,
          type: item.edit.option.type,
          icon: item.edit.option.icon,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    },
    aslot: {
      func: {
        init: false,
        data: {}
      },
      option: function(itemOption, item, payload) {
        itemOption.props = {
          ...item.edit.option,
          disabled: item.edit.disabled.getData(payload.type)
        }
        typeFormat.buildFunc(this, itemOption, item, payload)
        itemOption = _func.mergeData(itemOption, item.edit.localOption.item)
        return itemOption
      }
    }
  }
}

/**
 * 加载类型格式化数据
 */
typeFormat.init = function() {
  for (let n in this.data) {
    let item = this.data[n]
    if (!item.option) {
      item.option = this.base.option
    }
    if (!item.func) {
      item.func = {}
    }
    if (item.func.init === undefined) {
      item.func.init = this.base.func.init
    }
    if (!item.func.data) {
      item.func.data = {}
      for (let i in this.base.func.data) {
        item.func.data[i] = this.base.func.data[i]
      }
    }
  }
}

/**
 * 获取类型格式化func数据
 * @param {string} type 类型
 * @returns {object}
 */
typeFormat.getFunc = function(type) {
  let typeName = 'a' + type
  if (this.data[typeName]) {
    return this.data[typeName].func
  } else {
    return this.base.func
  }
}
/**
 * 获取类型格式化数据
 * @param {string} type 类型
 * @returns {object}
 */
typeFormat.getData = function(type) {
  let typeName = 'a' + type
  if (this.data[typeName]) {
    return this.data[typeName]
  } else {
    return this.base
  }
}
/**
 * 根据item.edit.on创建onEvent
 * @param {object} typeData 对应的类型格式化数据对象
 * @param {object} itemOption Vue的数据对象
 * @param {object} item pitem数据对象
 * @param {object} payload 回调的统一payload
 */
typeFormat.buildFunc = function(typeData, itemOption, item, payload) {
  let formData = payload.formData
  let funcData = typeData.func
  if (funcData.init) {
    funcData.init(itemOption, formData, item.prop)
  }
  let onEvent = new EventData()
  // 加载双向绑定逻辑
  for (let funcName in funcData.data) {
    onEvent.add(funcName, payload.target, item.prop, function (...args) {
      funcData.data[funcName](formData, item.prop, args)
    })
  }
  // 加载单独设置的事件监控,false仅生成函数不做回调
  for (let funcName in item.edit.on) {
    onEvent.add(funcName, payload.target, item.prop, item.edit.on[funcName] ? function (...args) {
      args.push(payload)
      item.edit.on[funcName](...args)
    } : false)
  }
  // 添加可能存在的需要触发emit事件的函数
  if (item.edit.eventTriggerList) {
    for (let i in item.edit.eventTriggerList) {
      let funcName = item.edit.eventTriggerList[i]
      onEvent.add(funcName, payload.target, item.prop, false)
    }
  }
  // 加载需要的独立触发的规则检查
  if (item.edit.autoTrigger) {
    for (let i in item.edit.autoTrigger) {
      let funcName = item.edit.autoTrigger[i]
      onEvent.add(funcName, payload.target, item.prop, function () {
        payload.target.triggerRuleCheck(payload.prop)
      })
    }
  }
  itemOption.on = onEvent.getData()
}

typeFormat.init()

export default {
  name: 'FormView',
  props: {
    type: { // formType
      type: String,
      required: true
    },
    layout: { // 表单布局	'horizontal'|'vertical'|'inline'
      type: String,
      required: false,
      default: function() {
        return config.FormView.layout
      }
    },
    layoutOption: { // layout != inline时的a-row的参数设置项
      type: Object,
      required: false,
      default: function() {
        return config.FormView.layoutOption
      }
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String,
      required: false,
      default: function() {
        return config.FormView.labelAlign
      }
    },
    checkOnRuleChange: { // 是否在 rules 属性改变后立即触发一次验证
      type: Boolean,
      required: false,
      default: function() {
        return config.FormView.checkOnRuleChange
      }
    },
    checkOnInit: { // 是否在加载时进行检查
      type: Boolean,
      required: false,
      default: function() {
        return config.FormView.checkOnInit
      }
    },
    clearCheckOnInit: { // 是否在加载时不检查情况下清除检查结果
      type: Boolean,
      required: false,
      default: function() {
        return config.FormView.clearCheckOnInit
      }
    },
    form: { // form数据{ data, num }
      type: Object,
      required: true
    },
    formOption: { // form-model-view设置项
      type: Object,
      required: false,
      default: null
    },
    mainlist: { // pitem列表
      type: Array,
      required: true
    },
    footMenu: { // 底部菜单
      type: Array,
      required: false
    },
    auto: {
      type: Object,
      required: false,
      default: null
    }
  },
  computed: {
    currentAuto() {
      let currentAuto = this._func.setDataByDefault(this.auto, config.FormView.auto)
      if (currentAuto.foot.type == 'auto') {
        currentAuto.foot.type = this.layout == 'inline' ? 'single' : 'multiple'
      }
      return currentAuto
    },
    currentFormOption() {
      // formOption格式化
      let defaultFormOption = {
        props: {
          model: this.form.data,
          layout: this.layout,
          labelAlign: this.labelAlign,
          validateOnRuleChange: this.checkOnRuleChange
        }
      }
      let currentFormOption = _func.mergeData(defaultFormOption, this.formOption)
      currentFormOption.ref = config.FormView.ref
      return currentFormOption
    },
    currentFootMenu() {
      // 底部菜单的VNode
      let currentFootMenuOption = this.currentAuto.foot
      let currentFootMenu
      let menuList = this.footMenu
      if (menuList && menuList.length > 0) {
        let size = menuList.length
        let list = []
        for (let i = 0; i < size; i++) {
          let menuItem = menuList[i]
          const parentOption = menuItem.parentOption
          let mainSlot
          if (menuItem.slot) {
            mainSlot = this.$scopedSlots[menuItem.slot]
          }
          if (currentFootMenuOption.data == 'props') {
            // 传值不存在时说明此时使用简单数据传值，所有传值默认传递到props中=>
            menuItem = {
              props: {
                ...menuItem
              }
            }
          }
          const itemClass = this.countClassName('foot', currentFootMenuOption.type, 'menu', 'item')
          utils.addClass(menuItem, itemClass)
          if (!menuItem.on) {
            menuItem.on = {}
          }
          if (!menuItem.on.click) {
            menuItem.on.click = () => {
              this.$emit('menu', menuItem.props.act, {
                form: this.form,
                formData: this.form.data,
                list: this.mainlist,
                type: this.type,
                target: this
              })
            }
          }
          if (currentFootMenuOption.type == 'single') {
            // 单独模式
            let button
            if (!mainSlot) {
              button = this.$createElement('a-button', menuItem, [ menuItem.props.name ])
            } else {
              button = mainSlot({
                data: menuItem,
                index: i
              })
            }
            let mainOption = _func.mergeData(currentFootMenuOption.option, parentOption)
            const mainClass = this.countClassName('foot', currentFootMenuOption.type, 'menu')
            utils.addClass(mainOption, mainClass)
            list.push(this.$createElement('a-form-model-item', mainOption, [ button ]))
          } else {
            // 共享模式
            let button
            if (!mainSlot) {
              button = this.$createElement('a-button', menuItem, [ menuItem.props.name ])
            } else {
              button = mainSlot({
                data: menuItem,
                index: i
              })
            }
            list.push(button)
          }
        }
        let footMenu
        if (currentFootMenuOption.type == 'single') {
          // 单独模式
          footMenu = list
        } else {
          // 共享模式
          let mainOption = currentFootMenuOption.option
          const mainClass = this.countClassName('foot', currentFootMenuOption.type, 'menu')
          utils.addClass(mainOption, mainClass)
          footMenu = this.$createElement('a-form-model-item', currentFootMenuOption.option, list)
        }
        if (this.layout === 'inline') {
          currentFootMenu = footMenu
        } else {
          currentFootMenu = this.$createElement('a-col', currentFootMenuOption.layout, [
            footMenu
          ])
        }
      }
      return currentFootMenu
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setFormRef(this.checkOnInit, this.clearCheckOnInit)
    })
  },
  methods: {
    countClassNameByLayout(...args) {
      return this.countClassName(this.layout, ...args)
    },
    countClassName(...args) {
      return utils.countClass(config.FormView.className, ...args)
    },
    /**
     * 设置form的ref
     * @param {*} check 是否进行规则检查
     * @param {*} clear 在不进行规则检查的基础上是否清除规则检查
     */
    setFormRef(check, clear) {
      this.form.ref = this.$refs[config.FormView.ref]
      if (check) {
        this.triggerRuleCheck()
      } else if (clear) {
        this.clearRuleCheck()
      }
    },
    /**
     * 清除指定检查
     * @param {*} prop 需要清除检查的属性值
     */
    clearRuleCheck(prop) {
      if (this.form.ref) {
        this.form.ref.clearValidate(prop)
      }
    },
    /**
     * 重置检查
     */
    resetRuleCheck() {
      if (this.form.ref) {
        this.form.ref.resetFields()
      }
    },
    /**
     * 触发检查
     * @param {*} [prop] 需要触发检查的属性值
     */
    triggerRuleCheck(prop) {
      if (this.form.ref) {
        if (prop) {
          this.form.ref.validateField(prop)
        } else {
          this.form.ref.validate()
        }
      }
    },
    /**
     * 构建列表模板
     * @returns {VNode}
     */
    renderFormList() {
      const renderFormList = this.mainlist.map((item, index) => {
        return this.renderItem(item, index)
      })
      if (this.currentFootMenu) {
        renderFormList.push(this.currentFootMenu)
      }
      return renderFormList
    },
    /**
     * 构建forviewItem模板
     * @param {*} item 数据
     * @param {*} index index
     * @returns {VNode}
     */
    renderItem(item, index) {
      let renderItem = null
      // 插槽传递的值
      let payload = {
        form: this.form,
        formData: this.form.data,
        prop: item.prop,
        item: item,
        list: this.mainlist,
        type: this.type,
        index: index,
        target: this
      }
      // 获取主要插槽，存在插槽会根据type在指定位置替换
      let mainSlot = this.$scopedSlots[item.edit.slot.name]
      if (item.edit.slot.type != 'main') {
        // 非主要替换模式下构建主要参数
        let itemClass = this.countClassName('item')
        let typeClass = utils.countClass(itemClass, item.edit.type)
        let classList = [itemClass, typeClass]
        if (item.edit.option.multiple) {
          let multipleClass = utils.countClass(typeClass, 'multiple')
          classList.push(multipleClass)
        }
        let mainOption = {
          class: classList,
          style: {},
          props: {
            prop: item.prop,
            label: item.label,
            colon: item.edit.colon,
            rules: item.edit.rules.getData(payload.type)
          }
        }
        if (this.layout != 'inline' && item.layout.type == 'grid') {
          if (_func.getType(item.layout.label) == 'object') {
            mainOption.props.labelCol = item.layout.label
          } else {
            mainOption.props.labelCol = {
              span: item.layout.label
            }
          }
          if (_func.getType(item.layout.content) == 'object') {
            mainOption.props.wrapperCol = item.layout.content
          } else {
            mainOption.props.wrapperCol = {
              span: item.layout.content
            }
          }
        }
        if (this.$scopedSlots[item.edit.slot.label]) {
          // 存在label插槽则替换label
          mainOption.props.label = this.$scopedSlots[item.edit.slot.label]({
            ...payload
          })
        }
        mainOption = _func.mergeData(mainOption, item.edit.localOption.main)
        // 首先根据mainwidth设置宽度，在width模式下再进行layout的全局数据赋值，权重比由小到大
        this.autoSetWidthOption(mainOption, item.mainwidth)
        if (item.layout.type == 'width') {
          this.autoSetWidthOption(mainOption, item.layout.width)
        }
        // 设置自动zindex
        if (this.currentAuto.zIndex.act && mainOption.style.zIndex === undefined) {
          let zIndex = this.currentAuto.zIndex.num + this.mainlist.length - 1
          if (this.currentAuto.zIndex.act == 'up') {
            zIndex = zIndex + index
          } else {
            zIndex = zIndex - index
          }
          mainOption.style.zIndex = zIndex
        }
        // 获取tips插槽
        renderItem = this.$createElement('a-form-model-item', mainOption, [ this.renderTip(item, mainSlot, payload) ])
      } else if (mainSlot) {
        // 主要模式下替换
        renderItem = mainSlot({
          ...payload
        })
      } else {
        console.error(`${item.prop}/${item.name}需要设置插槽!`)
      }
      if (this.layout === 'inline') {
        return renderItem
      } else {
        let gridType = _func.getType(item.layout.grid)
        let gridOption
        if (gridType != 'object') {
          gridOption = {
            props: {
              span: item.layout.grid
            }
          }
        } else {
          gridOption = { ...item.layout.grid }
        }
        return this.$createElement('a-col', gridOption, [
          renderItem
        ])
      }
    },
    /**
     * tips模板
     * @param {object} item 数据
     * @param {*} mainSlot 主要插槽
     * @param {object} payload 插槽数据
     * @returns {VNode}
     */
    renderTip(item, mainSlot, payload) {
      let typeItem = null
      // auto/item模式下替换内部数据，此时保存外部的tips
      if (mainSlot && (item.edit.slot.type == 'auto' || item.edit.slot.type == 'item')) {
        typeItem = mainSlot({
          ...payload
        })
      } else {
        typeItem = this.renderTypeItem(item, mainSlot, payload)
      }
      if (item.edit.tips.props.title) {
        return this.$createElement('a-tooltip', { ...item.edit.tips }, [ typeItem ])
      } else {
        return typeItem
      }
    },
    /**
     * typeItem宽度设置
     * @param {object} option 主要的option
     * @param {*} widthList 宽度数据列表
     */
    autoSetWidthOption(option, ...widthList) {
      for (let i = 0; i < widthList.length; i++) {
        const width = widthList[i]
        if (width) {
          if (!option.style) {
            option.style = {}
          }
          if (!option.style.width) {
            if (_func.getType(width) == 'number') {
              option.style.width = width + 'px'
            } else if (width) {
              option.style.width = width
            }
          }
          return true
        }
      }
    },
    /**
     * typeItem模板:数据绑定模板
     * @param {*} item 数据
     * @param {*} mainSlot 主要插槽
     * @param {*} payload 插槽数据
     * @returns {VNode}
     */
    renderTypeItem(item, mainSlot, payload) {
      let tag
      let itemOption = {
        on: {}
      }
      let children
      let renderTypeItem = null
      let typeFormatData = typeFormat.getData(item.edit.type)
      itemOption = typeFormatData.option(itemOption, item, payload)
      const className = this.countClassNameByLayout('item', 'content')
      utils.addClass(itemOption, className)
      this.autoSetWidthOption(itemOption, item.edit.width)
      // 考虑一个默认的值，inline模式下和其他模式下的默认值，避免出现问题
      if (mainSlot && item.edit.slot.type == 'model') {
        renderTypeItem = mainSlot({
          ...payload,
          option: itemOption
        })
      } else if (item.edit.type == 'input') {
        tag = 'a-input'
      } else if (item.edit.type == 'inputNumber') {
        tag = 'a-input-number'
      } else if (item.edit.type == 'switch') {
        tag = 'a-switch'
      } else if (item.edit.type == 'select') {
        tag = 'a-select'
        // 设置字典
        let dict = {
          key: item.edit.option.optionValue || 'value',
          value: item.edit.option.optionValue || 'value',
          label: item.edit.option.optionLabel || 'label',
          disabled: item.edit.option.optionDisabled || 'disabled'
        }
        children = item.edit.option.list.map((itemData, indexData) => {
          let optionOption = {
            props: {
              key: itemData[dict.key],
              value: itemData[dict.value],
              disabled: itemData[dict.disabled] || false
            }
          }
          optionOption = _func.mergeData(optionOption, item.edit.localOption.option)
          return this.$createElement('a-select-option', optionOption, [ itemData[dict.label] ])
        })
        if (item.edit.pagination) {
          // 分页器相关设置
          let paginationOption = {
            props: {
              data: item.edit.pagination,
              option: {
                props: {
                  simple: true
                }
              },
              mainOption: {
                props: {}
              }
            },
            on: {
              change: function (...args) {
                item.edit.func.page(...args)
              }
            }
          }
          paginationOption = _func.mergeData(paginationOption, item.edit.localOption.pagination)
          let paginationAreaOption = config.FormView.select.paginationAreaOption
          paginationAreaOption = _func.mergeData(paginationAreaOption, item.edit.localOption.paginationArea)
          const className = this.countClassName('item', 'content', 'select', 'pagination')
          utils.addClass(paginationAreaOption, className)
          let pagination = this.$createElement(PaginationView, paginationOption)
          itemOption.props.dropdownRender = (menuNode, props) => {
            return this.$createElement('div', [
              this.$createElement('div', [ menuNode ]),
              this.$createElement('div', paginationAreaOption, [ pagination ])
            ])
          }
        }
      } else if (item.edit.type == 'date') {
        tag = 'a-date-picker'
      } else if (item.edit.type == 'dateRange') {
        tag = 'a-range-picker'
      } else if (item.edit.type == 'file') {
        tag = UploadFile
      } else if (item.edit.type == 'button') {
        tag = 'a-button'
        children = [ item.edit.option.name.getData(payload.type) ]
      } else if (item.edit.type == 'slot') {
        console.error(`${item.prop}未定义slot`)
      }
      if (tag) {
        renderTypeItem = this.$createElement(tag, itemOption, children)
      }
      return renderTypeItem
    }
  },
  /**
   * 主要模板
   * @param {*} h createElement
   * @returns {VNode}
   */
  render(h) {
    let renderFormList = this.renderFormList()
    let renderForm
    if (this.layout == 'inline') {
      renderForm = h('a-form-model', this.currentFormOption, renderFormList)
    } else {
      // 非inline模式下加载栅格布局
      renderForm = h('a-form-model', this.currentFormOption, [
        h('a-row', { ...this.layoutOption }, renderFormList)
      ])
    }
    let render = h('div', {
      class: config.FormView.className
    }, [ renderForm ])
    return render
  }
}
