import { AttrsValue } from "complex-data"
import { DictionaryEditMod } from "complex-data/src/dictionary/DictionaryValue"
import { getEnv } from "complex-utils"
import { FormItemPayloadType } from "./src/components/AutoFormItem"
import DefaultEditInput from "complex-data/src/dictionary/DefaultEditInput"
import DefaultEditInputNumber from "complex-data/src/dictionary/DefaultEditInputNumber"
import DefaultEditTextArea from "complex-data/src/dictionary/DefaultEditTextArea"
import DefaultEditSwitch from "complex-data/src/dictionary/DefaultEditSwitch"
import DefaultEditSelect from "complex-data/src/dictionary/DefaultEditSelect"
import DefaultEditCascader from "complex-data/src/dictionary/DefaultEditCascader"
import DefaultEditFile from "complex-data/src/dictionary/DefaultEditFile"
import DefaultEditButton from "complex-data/src/dictionary/DefaultEditButton"
import DefaultEditButtonGroup from "complex-data/src/dictionary/DefaultEditButtonGroup"
import DefaultEditContent from "complex-data/src/dictionary/DefaultEditContent"
import DefaultEditCustom from "complex-data/src/dictionary/DefaultEditCustom"

const showLogs = {
  init: true,
  model: true
}

if (getEnv('real') === 'production') {
  // 生产环境隐藏log
  showLogs.init = false
  showLogs.model = false
}

const modelFuncDict = {
  valueInit: function (itemAttrs: AttrsValue, formData: Record<PropertyKey, unknown>, prop: PropertyKey) {
    if (showLogs.init) { console.log(itemAttrs, formData, prop) }
    itemAttrs.props.value = formData[prop]
  },
  checkInit: function (itemAttrs: AttrsValue, formData: Record<PropertyKey, unknown>, prop: PropertyKey) {
    if (showLogs.init) { console.log(itemAttrs, formData, prop) }
    itemAttrs.props.checked = formData[prop]
  },
  input: function (formdata: Record<PropertyKey, unknown>, prop: PropertyKey, args: unknown[]) {
    if (showLogs.model) { console.log(formdata, prop, args) }
    formdata[prop] = (args[0] as any).target.value
  },
  select: function (formdata: Record<PropertyKey, unknown>, prop: PropertyKey, args: unknown[]) {
    if (showLogs.model) { console.log(formdata, prop, args) }
    formdata[prop] = args[0]
  },
  change: function (formdata: Record<PropertyKey, unknown>, prop: PropertyKey, args: unknown[]) {
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
  format: (edit: DictionaryEditMod, payload: FormItemPayloadType) => AttrsValue
}

const bindEvent = function(dictItem: dictItemType, itemAttrs: AttrsValue, edit: DictionaryEditMod, payload: FormItemPayloadType) {
  const formData = payload.form.data
  const onData = dictItem.on
  if (dictItem.init) {
    dictItem.init(itemAttrs, formData, edit.$prop)
  }

  const eventData = new EventData()
  // 加载双向绑定逻辑
  for (const funcName in onData) {
    eventData.add(funcName, payload.target, edit.$prop, function (...args: any[]) {
      onData[funcName as 'input' | 'change' | 'select']!(formData, edit.$prop, args)
    })
  }
  // 加载单独设置的事件监控,false仅生成函数不做回调
  for (const funcName in edit.$on) {
    eventData.add(funcName, payload.target, edit.$prop, edit.$on[funcName] ? function (...args: any[]) {
      args.push(payload)
      edit.$on[funcName](...args)
    } : false)
  }
  itemAttrs.on = eventData.getData()
}

const dict = {
  $input: {
    init: modelFuncDict.valueInit,
    on: {
      input: modelFuncDict.input
    },
    format(edit: DefaultEditInput, payload: FormItemPayloadType) {
      const itemAttrs = new AttrsValue({
        props: {
          type: edit.$option.type,
          allowClear: !edit.$option.hideClear,
          maxLength: edit.$option.size,
          disabled: payload.disabled || edit.disabled.getValue(payload.type),
          placeholder: edit.placeholder ? edit.placeholder.getValue(payload.type) : undefined
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $inputNumber: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEditInputNumber, payload: FormItemPayloadType) {
      const itemAttrs = new AttrsValue({
        props: {
          min: edit.$option.min,
          max: edit.$option.max,
          precision: edit.$option.precision,
          step: edit.$option.step,
          disabled: payload.disabled || edit.disabled.getValue(payload.type),
          placeholder: edit.placeholder ? edit.placeholder.getValue(payload.type) : undefined
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $textArea: {
    init: modelFuncDict.valueInit,
    on: {
      input: modelFuncDict.input
    },
    format(edit: DefaultEditTextArea, payload: FormItemPayloadType) {
      const itemAttrs = new AttrsValue({
        props: {
          maxLength: edit.$option.size,
          autoSize: edit.$option.autoSize,
          allowClear: !edit.$option.hideClear,
          disabled: payload.disabled || edit.disabled.getValue(payload.type),
          placeholder: edit.placeholder ? edit.placeholder.getValue(payload.type) : undefined
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $switch: {
    init: modelFuncDict.checkInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEditSwitch, payload: FormItemPayloadType) {
      const itemAttrs = new AttrsValue({
        props: {
          disabled: payload.disabled || edit.disabled.getValue(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $select: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEditSelect, payload: FormItemPayloadType) {
      const itemAttrs = new AttrsValue({
        props: {
          mode: edit.multiple ? 'multiple' : 'default',
          showSearch: false,
          showArrow: !edit.$option.hideArrow,
          allowClear: !edit.$option.hideClear,
          dropdownMatchSelectWidth: edit.$option.autoWidth,
          notFoundContent: edit.$option.emptyOptionContent,
          disabled: payload.disabled || edit.disabled.getValue(payload.type),
          placeholder: edit.placeholder ? edit.placeholder.getValue(payload.type) : undefined
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $cascader: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEditCascader, payload: FormItemPayloadType) {
      const itemAttrs = new AttrsValue({
        props: {
          options: edit.$option.list,
          showArrow: !edit.$option.hideArrow,
          allowClear: !edit.$option.hideClear,
          disabled: payload.disabled || edit.disabled.getValue(payload.type),
          placeholder: edit.placeholder ? edit.placeholder.getValue(payload.type) : undefined
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $date: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEditDate, payload: FormItemPayloadType) {
      const showTime = edit.$option.time ? {
        format: edit.$option.time.show,
        defaultValue: edit.$option.time.defaultValue
      } : false
      const itemAttrs = new AttrsValue({
        props: {
          disabled: payload.disabled || edit.disabled.getValue(payload.type),
          placeholder: edit.placeholder ? edit.placeholder.getValue(payload.type) : undefined,
          format: edit.$option.show,
          allowClear: !edit.$option.hideClear,
          showTime: showTime,
          disabledDate: edit.$option.disabledDate,
          disabledTime: edit.$option.disabledTime
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $dateRange: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEditDateRange, payload: FormItemPayloadType) {
      const showTime = edit.$option.time ? {
        format: (edit.$option.time as any).show,
        defaultValue: (edit.$option.time as any).defaultValue
      } : false
      const itemAttrs = new AttrsValue({
        props: {
          disabled: payload.disabled || edit.disabled.getValue(payload.type),
          placeholder: edit.placeholder ? edit.placeholder.getValue(payload.type) : undefined,
          format: edit.$option.show,
          allowClear: !edit.$option.hideClear,
          separator: edit.$option.separator,
          showTime: showTime,
          disabledDate: edit.$option.disabledDate,
          disabledTime: edit.$option.disabledTime
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $file: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: DefaultEditFile, payload: FormItemPayloadType) {
      let layout = edit.$option.layout
      if (layout == 'auto') {
        if (payload.target.layout == 'inline') {
          layout = 'end'
        } else {
          layout = 'bottom'
        }
      }
      const itemAttrs = new AttrsValue({
        props: {
          accept: edit.$option.accept,
          multiple: edit.multiple,
          multipleAppend: edit.$option.multipleAppend,
          maxNum: edit.$option.max,
          minNum: edit.$option.min,
          maxSize: edit.$option.size,
          upload: edit.$option.upload,
          layout: layout,
          disabled: payload.disabled || edit.disabled.getValue(payload.type),
          placeholder: edit.placeholder ? edit.placeholder.getValue(payload.type) : undefined
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $button: {
    init: false,
    on: {},
    format(edit: DefaultEditButton, payload: FormItemPayloadType) {
      const itemAttrs = new AttrsValue({
        props: {
          loading: payload.loading || edit.$option.loading,
          type: edit.$option.type,
          icon: edit.$option.icon,
          disabled: payload.disabled || edit.disabled.getValue(payload.type),
          placeholder: edit.placeholder ? edit.placeholder.getValue(payload.type) : undefined
        },
        on: {
          click: edit.$option.click
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $buttonGroup: {
    init: false,
    on: {},
    format(edit: DefaultEditButtonGroup, payload: FormItemPayloadType) {
      const itemAttrs = new AttrsValue({
        props: {
          loading: payload.loading,
          disabled: payload.disabled || edit.disabled.getValue(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $content: {
    init: false,
    on: {},
    format(edit: DefaultEditContent, payload: FormItemPayloadType) {
      const itemAttrs = new AttrsValue({
        props: {
          disabled: payload.disabled || edit.disabled.getValue(payload.type)
        },
        style: {
          ...edit.$option.style
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $customize: {
    init: false,
    on: {},
    format(edit: DefaultEditCustom, payload: FormItemPayloadType) {
      const itemAttrs = new AttrsValue({
        props: {
          ...edit.$option,
          disabled: payload.disabled || edit.disabled.getValue(payload.type)
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  }
}
type dictType = typeof dict

export const parseEditAttrs = function (edit: DictionaryEditMod, payload: FormItemPayloadType): AttrsValue {
  const prop = ('$' + edit.type) as keyof dictType
  const attrs = dict[prop].format(edit, payload)
  return attrs
}
