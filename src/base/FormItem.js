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
    acascader: {
      func: {},
      option: function(itemOption, item, payload) {
        itemOption.props = {
          options: item.edit.option.options,
          allowClear: item.edit.option.allowClear,
          autoFocus: item.edit.option.autoFocus,
          changeOnSelect: item.edit.option.changeOnSelect,
          displayRender: item.edit.option.displayRender,
          expandTrigger: item.edit.option.expandTrigger,
          fieldNames: item.edit.option.fieldNames,
          getPopupContainer: item.edit.option.getPopupContainer,
          notFoundContent: item.edit.option.notFoundContent,
          popupClassName: item.edit.option.popupClassName,
          popupStyle: item.edit.option.popupStyle,
          popupPlacement: item.edit.option.popupPlacement,
          popupVisible: item.edit.option.popupVisible,
          showSearch: item.edit.option.showSearch,
          size: item.edit.option.size,
          suffixIcon: item.edit.option.suffixIcon,
          loadData: item.edit.option.loadData,
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
  name: 'FormItem',
  props: {
    data: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String,
      required: true
    },
    auto: {
      type: Object,
      required: true
    },
    mainlist: {
      type: Array,
      required: true
    },
    form: { // form数据{ data, num }
      type: Object,
      required: true
    },
    type: { // formType
      type: String,
      required: true
    },
    layout: { // 表单布局	'horizontal'|'vertical'|'inline'
      type: String,
      required: true
    },
    target: { // FormView实例
      type: Object,
      required: true
    }
  },
  methods: {
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
        typeItem = this.renderItem(item, mainSlot, payload)
      }
      if (item.edit.tips.props.title) {
        return this.$createElement('a-tooltip', { ...item.edit.tips }, [ typeItem ])
      } else {
        return typeItem
      }
    },
    /**
     * typeItem模板:数据绑定模板
     * @param {*} item 数据
     * @param {*} mainSlot 主要插槽
     * @param {*} payload 插槽数据
     * @returns {VNode}
     */
    renderItem(item, mainSlot, payload) {
      let tag
      let itemOption = {
        on: {}
      }
      let children
      let renderItem = null
      let typeFormatData = typeFormat.getData(item.edit.type)
      itemOption = typeFormatData.option(itemOption, item, payload)
      const className = utils.countClass(config.FormView.className, 'item', 'content')
      utils.addClass(itemOption, className)
      utils.autoSetWidthOption(itemOption, item.edit.width)
      // 考虑一个默认的值，inline模式下和其他模式下的默认值，避免出现问题
      if (mainSlot && item.edit.slot.type == 'model') {
        renderItem = mainSlot({
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
          const className = utils.countClass(config.FormView.className, 'item', 'content', 'select', 'pagination')
          utils.addClass(paginationAreaOption, className)
          let pagination = this.$createElement(PaginationView, paginationOption)
          itemOption.props.dropdownRender = (menuNode, props) => {
            return this.$createElement('div', [
              this.$createElement('div', [ menuNode ]),
              this.$createElement('div', paginationAreaOption, [ pagination ])
            ])
          }
        }
      } else if (item.edit.type == 'cascader') {
        tag = 'a-cascader'
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
        renderItem = this.$createElement(tag, itemOption, children)
      }
      return renderItem
    }
  },
  /**
   * 主要模板
   * @param {*} h createElement
   * @returns {VNode}
   */
  render(h) {
    let render = null
    // 插槽传递的值
    let payload = {
      prop: this.data.prop,
      type: this.type,
      item: this.data,
      index: this.index,
      form: this.form,
      formData: this.form.data,
      list: this.mainlist,
      target: this.target
    }
    // 获取主要插槽，存在插槽会根据type在指定位置替换
    let mainSlot = this.target.$scopedSlots[this.data.edit.slot.name]
    if (this.data.edit.slot.type != 'main') {
      // 非主要替换模式下构建主要参数
      let itemClass = utils.countClass(config.FormView.className, 'item')
      let typeClass = utils.countClass(itemClass, this.data.edit.type)
      let classList = [itemClass, typeClass]
      if (this.data.edit.option.multiple) {
        let multipleClass = utils.countClass(typeClass, 'multiple')
        classList.push(multipleClass)
      }
      if (this.auto.item.auto) {
        classList.push(utils.countClass(itemClass, 'auto'))
      }
      let mainOption = {
        class: classList,
        style: {},
        props: {
          prop: this.data.prop,
          label: this.data.label,
          colon: this.data.edit.colon,
          rules: this.data.edit.rules.getData(payload.type)
        }
      }
      if (this.layout != 'inline' && this.data.layout.type == 'grid') {
        if (_func.getType(this.data.layout.label) == 'object') {
          mainOption.props.labelCol = this.data.layout.label
        } else {
          mainOption.props.labelCol = {
            span: this.data.layout.label
          }
        }
        if (_func.getType(this.data.layout.content) == 'object') {
          mainOption.props.wrapperCol = this.data.layout.content
        } else {
          mainOption.props.wrapperCol = {
            span: this.data.layout.content
          }
        }
      }
      if (this.target.$scopedSlots[this.data.edit.slot.label]) {
        // 存在label插槽则替换label
        mainOption.props.label = this.target.$scopedSlots[this.data.edit.slot.label]({
          ...payload
        })
      }
      mainOption = _func.mergeData(mainOption, this.data.edit.localOption.main)
      // 首先根据mainwidth设置宽度，在width模式下再进行layout的全局数据赋值，权重比由小到大
      utils.autoSetWidthOption(mainOption, this.data.mainwidth)
      if (this.data.layout.type == 'width') {
        utils.autoSetWidthOption(mainOption, this.data.layout.width)
      }
      // 设置自动zindex
      if (this.auto.zIndex.act && mainOption.style.zIndex === undefined) {
        let zIndex = this.auto.zIndex.num + this.mainlist.length - 1
        if (this.auto.zIndex.act == 'up') {
          zIndex = zIndex + this.index
        } else {
          zIndex = zIndex - this.index
        }
        mainOption.style.zIndex = zIndex
      }
      // 获取tips插槽
      render = h('a-form-model-item', mainOption, [ this.renderTip(this.data, mainSlot, payload) ])
    } else if (mainSlot) {
      // 主要模式下替换
      render = mainSlot({
        ...payload
      })
    } else {
      console.error(`${this.data.prop}/${this.data.name}需要设置插槽!`)
    }
    if (this.layout === 'inline') {
      return render
    } else {
      let gridType = _func.getType(this.data.layout.grid)
      let gridOption
      if (gridType != 'object') {
        gridOption = {
          props: {
            span: this.data.layout.grid
          }
        }
      } else {
        gridOption = { ...this.data.layout.grid }
      }
      return h('a-col', gridOption, [
        render
      ])
    }
  }
}
