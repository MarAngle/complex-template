import { AttributesData, DefaultEdit } from "complex-data-next"
import { FormItemPayloadType } from "../mod/FormItem"
import { DefaultEditTypeDict } from "complex-data-next/src/mod/DefaultEdit"
import EventData from "./EventData"
import { mergeAttributes } from "./index"

const showLogs = {
  init: false,
  model: true
}

const modelFuncDict = {
  valueInit: function (itemAttributes: AttributesData, formData: Record<PropertyKey, any>, prop: PropertyKey) {
    if (showLogs.init) { console.log(itemAttributes, formData, prop) }
    itemAttributes.props.value = formData[prop]
  },
  checkInit: function (itemAttributes: AttributesData, formData: Record<PropertyKey, any>, prop: PropertyKey) {
    if (showLogs.init) { console.log(itemAttributes, formData, prop) }
    itemAttributes.props.checked = formData[prop]
  },
  input: function (formdata: Record<PropertyKey, any>, prop: PropertyKey, args: any[]) {
    if (showLogs.model) { console.log(formdata, prop, args) }
    formdata[prop] = args[0].target.value
  },
  select: function (formdata: Record<PropertyKey, any>, prop: PropertyKey, args: any[]) {
    if (showLogs.model) { console.log(formdata, prop, args) }
    formdata[prop] = args[0]
  },
  change: function (formdata: Record<PropertyKey, any>, prop: PropertyKey, args: any[]) {
    if (showLogs.model) { console.log(formdata, prop, args) }
    formdata[prop] = args[0]
  }
}
type modelFuncDictType = typeof modelFuncDict

interface dictItemType {
  init: false | modelFuncDictType['checkInit'] | modelFuncDictType['valueInit']
  on?: {
    input?: modelFuncDictType['input']
    change?: modelFuncDictType['change']
    select?: modelFuncDictType['select']
  },
  format: (edit: DefaultEdit<DefaultEditTypeDict>, payload: FormItemPayloadType) => AttributesData
}

const bindEvent = function(dictItem: dictItemType, itemAttributes: AttributesData, edit: DefaultEdit<DefaultEditTypeDict>, payload: FormItemPayloadType) {
  const formData = payload.form.data
  const onData = dictItem.on
  if (dictItem.init) {
    dictItem.init(itemAttributes, formData, edit.prop)
  }

  const eventData = new EventData()
  // 加载双向绑定逻辑
  for (const funcName in onData) {
    eventData.add(funcName, payload.target, edit.prop, function (...args: any[]) {
      onData[funcName as 'input' | 'change' | 'select']!(formData, edit.prop, args)
    })
  }
  // 加载单独设置的事件监控,false仅生成函数不做回调
  for (const funcName in edit.$on) {
    eventData.add(funcName, payload.target, edit.prop, edit.$on[funcName] ? function (...args: any[]) {
      args.push(payload)
      edit.$on[funcName](...args)
    } : false)
  }
  // 添加可能存在的需要触发emit事件的函数
  // if (edit.eventTriggerList) {
  //   for (let i = 0; i < edit.eventTriggerList.length; i++) {
  //     let funcName = edit.eventTriggerList[i]
  //     eventData.add(funcName, payload.target, edit.prop, false)
  //   }
  // }
  // // 加载需要的独立触发的规则检查
  // if (edit.autoTrigger) {
  //   for (let i = 0; i < edit.autoTrigger.length; i++) {
  //     let funcName = edit.autoTrigger[i]
  //     eventData.add(funcName, payload.target, edit.prop, function () {
  //       payload.target.triggerRuleCheck(payload.prop)
  //     })
  //   }
  // }
  itemAttributes.on = eventData.getData()
}

const dict = {
  $input: {
    init: modelFuncDict.valueInit,
    on: {
      input: modelFuncDict.input
    },
    format(edit: DefaultEdit<'input'>, payload: FormItemPayloadType) {
      const itemAttributes = new AttributesData({
        props: {
          type: edit.$option.type,
          allowClear: !edit.$option.hideClear,
          maxLength: edit.$option.maxLength,
          disabled: edit.disabled.getData(payload.type),
          placeholder: edit.placeholder!.getData(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
  $inputNumber: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEdit<'inputNumber'>, payload: FormItemPayloadType) {
      const itemAttributes = new AttributesData({
        props: {
          min: edit.$option.min,
          max: edit.$option.max,
          precision: edit.$option.precision,
          step: edit.$option.step,
          disabled: edit.disabled.getData(payload.type),
          placeholder: edit.placeholder!.getData(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
  $textArea: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEdit<'textArea'>, payload: FormItemPayloadType) {
      const itemAttributes = new AttributesData({
        props: {
          maxLength: edit.$option.maxLength,
          autoSize: edit.$option.autoSize,
          allowClear: !edit.$option.hideClear,
          disabled: edit.disabled.getData(payload.type),
          placeholder: edit.placeholder!.getData(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
  $switch: {
    init: modelFuncDict.checkInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEdit<'switch'>, payload: FormItemPayloadType) {
      const itemAttributes = new AttributesData({
        props: {
          disabled: edit.disabled.getData(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
  $select: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEdit<'select'>, payload: FormItemPayloadType) {
      const itemAttributes = new AttributesData({
        props: {
          mode: edit.multiple ? 'multiple' : 'default',
          showSearch: false,
          showArrow: !edit.$option.hideArrow,
          allowClear: !edit.$option.hideClear,
          dropdownMatchSelectWidth: edit.$option.autoWidth,
          notFoundContent: edit.$option.noDataContent,
          disabled: edit.disabled.getData(payload.type),
          placeholder: edit.placeholder!.getData(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
  $cascader: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEdit<'cascader'>, payload: FormItemPayloadType) {
      const itemAttributes = new AttributesData({
        props: {
          options: edit.$option.list,
          showArrow: !edit.$option.hideArrow,
          allowClear: !edit.$option.hideClear,
          disabled: edit.disabled.getData(payload.type),
          placeholder: edit.placeholder!.getData(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
  $date: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEdit<'date'>, payload: FormItemPayloadType) {
      const itemAttributes = new AttributesData({
        props: {
          disabled: edit.disabled.getData(payload.type),
          placeholder: edit.placeholder!.getData(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
  $dateRange: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEdit<'dateRange'>, payload: FormItemPayloadType) {
      const itemAttributes = new AttributesData({
        props: {
          disabled: edit.disabled.getData(payload.type),
          placeholder: edit.placeholder!.getData(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
  $file: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEdit<'file'>, payload: FormItemPayloadType) {
      let layout = edit.$option.layout
      if (layout == 'auto') {
        if (payload.target.layout == 'inline') {
          layout = 'end'
        } else {
          layout = 'bottom'
        }
      }
      const itemAttributes = new AttributesData({
        props: {
          accept: edit.$option.accept,
          multiple: edit.multiple,
          multipleAppend: edit.$option.multipleAppend,
          maxNum: edit.$option.max,
          minNum: edit.$option.min,
          maxSize: edit.$option.size,
          upload: edit.$option.upload,
          fileUpload: edit.$option.fileUpload,
          layout: layout,
          disabled: edit.disabled.getData(payload.type),
          placeholder: edit.placeholder!.getData(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
  $button: {
    init: false,
    on: {},
    format(edit: DefaultEdit<'button'>, payload: FormItemPayloadType) {
      const itemAttributes = new AttributesData({
        props: {
          loading: edit.$option.loading,
          type: edit.$option.type,
          icon: edit.$option.icon,
          disabled: edit.disabled.getData(payload.type),
          placeholder: edit.placeholder!.getData(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
  $text: {
    init: false,
    on: {},
    format(edit: DefaultEdit<'text'>, payload: FormItemPayloadType) {
      const itemAttributes = new AttributesData({
        props: {
          disabled: edit.disabled.getData(payload.type)
        },
        style: {
          ...edit.$option.style
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
  $customize: {
    init: false,
    on: {},
    format(edit: DefaultEdit<'customize'>, payload: FormItemPayloadType) {
      const itemAttributes = new AttributesData({
        props: {
          ...edit.$option,
          disabled: edit.disabled.getData(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
  $slot: {
    init: false,
    on: {},
    format(edit: DefaultEdit<'slot'>, payload: FormItemPayloadType) {
      const itemAttributes = new AttributesData({
        props: {
          ...edit.$option,
          disabled: edit.disabled.getData(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttributes, edit, payload)
      mergeAttributes(itemAttributes, edit.$local.target)
      return itemAttributes
    }
  },
}

type dictType = typeof dict

export const getAttributes = function<T extends DefaultEditTypeDict>(type: T, edit: DefaultEdit<T>, payload: FormItemPayloadType) {
  const prop = ('$' + type) as keyof dictType
  const attributesData = dict[prop].format(edit as any, payload)
  return attributesData
}
