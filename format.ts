import dayjs from 'dayjs'
import { getEnv } from "complex-utils"
import { AttrsValue } from "complex-data"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import DefaultEditInput from "complex-data/src/dictionary/DefaultEditInput"
import DefaultEditInputNumber from "complex-data/src/dictionary/DefaultEditInputNumber"
import DefaultEditTextArea from "complex-data/src/dictionary/DefaultEditTextArea"
import DefaultEditSwitch from "complex-data/src/dictionary/DefaultEditSwitch"
import DefaultEditSelect from "complex-data/src/dictionary/DefaultEditSelect"
import DefaultEditCascader from "complex-data/src/dictionary/DefaultEditCascader"
import DefaultEditFile from "complex-data/src/dictionary/DefaultEditFile"
import DefaultEditDateRange from "complex-data/src/dictionary/DefaultEditDateRange"
import DefaultEditDate from "complex-data/src/dictionary/DefaultEditDate"
import DefaultEditButton from "complex-data/src/dictionary/DefaultEditButton"
import DefaultEditButtonGroup from "complex-data/src/dictionary/DefaultEditButtonGroup"
import DefaultEditContent from "complex-data/src/dictionary/DefaultEditContent"
import DefaultEditCustom from "complex-data/src/dictionary/DefaultEditCustom"
import { FormItemPayloadType } from "./src/components/AutoFormItem"

const showLogs = {
  init: false,
  model: false
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const formData = payload.targetData
  const onData = dictItem.on
  if (dictItem.init) {
    dictItem.init(itemAttrs, formData, edit.$prop)
  }
  // 加载双向绑定逻辑
  for (const funcName in onData) {
    itemAttrs.pushEvent(funcName, (...args) => {
      onData[funcName as 'input' | 'change' | 'select']!(formData, edit.$prop, args)
    }, 'before')
  }
  // 加载单独设置的事件监控
  for (const funcName in edit.$on) {
    itemAttrs.pushEvent(funcName, (...args) => {
      args.push(payload)
      edit.$on[funcName](...args)
    })
  }
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
          options: edit.$option.list,
          showSearch: false,
          showArrow: !edit.$option.hideArrow,
          allowClear: !edit.$option.hideClear,
          dropdownMatchSelectWidth: edit.$option.autoWidth,
          notFoundContent: edit.$option.emptyOptionContent,
          fieldNames: { value: edit.$option.optionValue, label: edit.$option.optionLabel },
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
          fieldNames: { value: edit.$option.optionValue, label: edit.$option.optionLabel, children: edit.$option.optionChildren },
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
        format: edit.$option.time.showFormat,
        defaultValue: dayjs(edit.$option.time.defaultValue, edit.$option.time.format)
      } : false
      const itemAttrs = new AttrsValue({
        props: {
          disabled: payload.disabled || edit.disabled.getValue(payload.type),
          placeholder: edit.placeholder ? edit.placeholder.getValue(payload.type) : undefined,
          format: edit.$option.showFormat,
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
        format: edit.$option.time.showFormat,
        defaultValue: edit.$option.time.defaultValue.map(timeValueStr => {
          return dayjs(timeValueStr, edit.$option.time!.format)
        })
      } : false
      const itemAttrs = new AttrsValue({
        props: {
          disabled: payload.disabled || edit.disabled.getValue(payload.type),
          placeholder: edit.placeholder ? edit.placeholder.getValue(payload.type) : undefined,
          format: edit.$option.showFormat,
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
      const option = {
        ...edit.$option
      }
      if (!option.name) {
        option.name = edit.$name.getValue(payload.type)
      }
      if (payload.loading) {
        option.loading = true
      } else if (option.loading && typeof option.loading === 'function') {
        option.loading = option.loading(payload)
      }
      if (payload.disabled || edit.disabled.getValue(payload.type)) {
        option.disabled = true
      } else if (option.disabled && typeof option.disabled === 'function') {
        option.disabled = option.disabled(payload)
      }
      option.click = bindButtonClick(edit.$prop, edit.$option, payload)
      const itemAttrs = new AttrsValue({
        props: {
          data: option
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
  $custom: {
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

export const bindButtonClick = function(prop: string, option: DefaultEditButton['$option'], payload: FormItemPayloadType) {
  return function() {
    payload.target.$emit('menu', prop, payload)
    if(option.click) {
      return option.click(payload)
    }
  }
}

export const parseEditAttrs = function (edit: DictionaryEditMod, payload: FormItemPayloadType) {
  if (edit.type === 'input') {
    return dict.$input.format(edit, payload)
  } else if (edit.type === 'inputNumber') {
    return dict.$inputNumber.format(edit, payload)
  } else if (edit.type === 'textArea') {
    return dict.$textArea.format(edit, payload)
  } else if (edit.type === 'switch') {
    return dict.$switch.format(edit, payload)
  } else if (edit.type === 'select') {
    return dict.$select.format(edit, payload)
  } else if (edit.type === 'cascader') {
    return dict.$cascader.format(edit, payload)
  } else if (edit.type === 'date') {
    return dict.$date.format(edit, payload)
  } else if (edit.type === 'dateRange') {
    return dict.$dateRange.format(edit, payload)
  } else if (edit.type === 'file') {
    return dict.$file.format(edit, payload)
  } else if (edit.type === 'button') {
    return dict.$button.format(edit, payload)
  } else if (edit.type === 'buttonGroup') {
    return dict.$buttonGroup.format(edit, payload)
  } else if (edit.type === 'content') {
    return dict.$content.format(edit, payload)
  } else if (edit.type === 'custom') {
    return dict.$custom.format(edit, payload)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error(`[${(edit as any).type}]:FormItem类型匹配失败，请检查代码`)
  }
}
