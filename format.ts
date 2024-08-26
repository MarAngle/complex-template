import dayjs, { Dayjs } from 'dayjs'
import { AttrsValue } from "complex-data"
import { AttrsValueInitOption } from 'complex-data/src/lib/AttrsValue'
import { StatusValue } from 'complex-data/src/module/StatusData'
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import InputEdit from "complex-data/src/dictionary/InputEdit"
import InputNumberEdit from "complex-data/src/dictionary/InputNumberEdit"
import TextAreaEdit from "complex-data/src/dictionary/TextAreaEdit"
import SwitchEdit from "complex-data/src/dictionary/SwitchEdit"
import SelectEdit from "complex-data/src/dictionary/SelectEdit"
import DateEdit from "complex-data/src/dictionary/DateEdit"
import DateRangeEdit from "complex-data/src/dictionary/DateRangeEdit"
import FileEdit from "complex-data/src/dictionary/FileEdit"
import CustomEdit from "complex-data/src/dictionary/CustomEdit"
import FormEdit from 'complex-data/src/dictionary/FormEdit'
import SimpleDateEdit from 'complex-data/src/dictionary/SimpleDateEdit'
import { AutoItemPayloadType } from './src/dictionary/AutoItem'
import ListEdit from 'complex-data/src/dictionary/ListEdit'

const init = function (itemAttrs: AttrsValue, targetProp: PropertyKey, formData: Record<PropertyKey, unknown>, prop: PropertyKey) {
  itemAttrs.props[targetProp] = formData[prop]
}

const createInit = function(targetProp: PropertyKey) {
  return function (itemAttrs: AttrsValue, formData: Record<PropertyKey, unknown>, prop: PropertyKey) {
    init(itemAttrs, targetProp, formData, prop)
  }
}

const modelFuncDict = {
  valueInit: createInit('value'),
  checkInit: createInit('checked'),
  input: function (formdata: Record<PropertyKey, unknown>, prop: PropertyKey, args: unknown[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formdata[prop] = (args[0] as any).target.value
  },
  select: function (formdata: Record<PropertyKey, unknown>, prop: PropertyKey, args: unknown[]) {
    formdata[prop] = args[0]
  },
  change: function (formdata: Record<PropertyKey, unknown>, prop: PropertyKey, args: unknown[]) {
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
  format: (edit: DictionaryEditMod, payload: AutoItemPayloadType<'edit'>) => AttrsValue
}

const bindEvent = function(dictItem: dictItemType, itemAttrs: AttrsValue, edit: DictionaryEditMod, payload: AutoItemPayloadType<'edit'>) {
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
    format(edit: InputEdit, payload: AutoItemPayloadType<'edit'>) {
      const itemAttrs = new AttrsValue({
        props: {
          type: edit.$option.type,
          allowClear: !edit.$option.hideClear,
          maxLength: edit.$option.size,
          disabled: payload.disabled || edit.disabled,
          placeholder: edit.placeholder ? edit.placeholder : undefined
        },
        on: {
          pressEnter(_e: Event) {
            payload.parent.triggerEnter(edit.$prop, payload)
          }
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
    format(edit: InputNumberEdit, payload: AutoItemPayloadType<'edit'>) {
      const itemAttrs = new AttrsValue({
        props: {
          min: edit.$option.min,
          max: edit.$option.max,
          precision: edit.$option.precision,
          step: edit.$option.step,
          disabled: payload.disabled || edit.disabled,
          placeholder: edit.placeholder ? edit.placeholder : undefined
        },
        on: {
          pressEnter(_e: Event) {
            payload.parent.triggerEnter(edit.$prop, payload)
          }
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
    format(edit: TextAreaEdit, payload: AutoItemPayloadType<'edit'>) {
      const itemAttrs = new AttrsValue({
        props: {
          maxLength: edit.$option.size,
          autoSize: edit.$option.autoSize,
          allowClear: !edit.$option.hideClear,
          disabled: payload.disabled || edit.disabled,
          placeholder: edit.placeholder ? edit.placeholder : undefined
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
    format(edit: SwitchEdit, payload: AutoItemPayloadType<'edit'>) {
      const itemAttrs = new AttrsValue({
        props: {
          disabled: payload.disabled || edit.disabled
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
    format(edit: SelectEdit, payload: AutoItemPayloadType<'edit'>) {
      let isLoading = edit.$load ? edit.getLoad() === StatusValue.ing : false
      const search = edit.$search
      const on: AttrsValueInitOption['on'] = {}
      if (search) {
        if (isLoading && search.operate) {
          isLoading = false
        }
        on.search = function(value: string) {
          edit.$searchData(value)
        }
        // 关闭会自动触发search value = ''事件，因此reload=false不进行实现
        // if (search.reload) {
        //   on.dropdownVisibleChange = function(open: boolean) {
        //     // reload模式下打开自动清空
        //     if (open) {
        //       search!.value = undefined
        //       edit.$clearData()
        //     }
        //   }
        // }
      }
      const itemAttrs = new AttrsValue({
        props: {
          mode: edit.multiple ? 'multiple' : 'default',
          options: edit.$select.getList(),
          open: (edit.$option as any).open,
          showSearch: !!search,
          searchValue: search?.value,
          showArrow: !edit.$option.hideArrow,
          notFoundContent: edit.$option.notFoundContent,
          filterOption: false,
          allowClear: !edit.$option.hideClear,
          dropdownMatchSelectWidth: edit.$option.autoWidth,
          disabled: payload.disabled || edit.disabled || isLoading,
          placeholder: edit.placeholder ? edit.placeholder : undefined
        },
        on: on
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
    format(edit: SelectEdit<PropertyKey>, payload: AutoItemPayloadType<'edit'>) {
      const isLoading = edit.$load ? edit.getLoad() === StatusValue.ing : false
      const itemAttrs = new AttrsValue({
        props: {
          options: edit.$select.getCascaderList(),
          showArrow: !edit.$option.hideArrow,
          allowClear: !edit.$option.hideClear,
          disabled: payload.disabled || edit.disabled || isLoading,
          placeholder: edit.placeholder ? edit.placeholder : undefined
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
    format(edit: DateEdit, payload: AutoItemPayloadType<'edit'>) {
      const showTime = edit.$option.time ? {
        format: edit.$option.time.showFormat,
        defaultValue: dayjs(edit.$option.time.defaultValue, edit.$option.time.format)
      } : false
      const itemAttrs = new AttrsValue({
        props: {
          disabled: payload.disabled || edit.disabled,
          placeholder: edit.placeholder ? edit.placeholder : undefined,
          format: edit.$option.showFormat,
          allowClear: !edit.$option.hideClear,
          showTime: showTime,
          defaultPickerValue: dayjs('00:00:00', 'HH:mm:ss'),
          disabledDate: edit.$option.disabledDate
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
    format(edit: DateRangeEdit, payload: AutoItemPayloadType<'edit'>) {
      const showTime = edit.$option.time ? {
        format: edit.$option.time.showFormat,
        defaultValue: [dayjs(edit.$option.time!.defaultValue, edit.$option.time.format), dayjs(edit.$option.time!.defaultEndValue, edit.$option.time.format)]
      } : false
      const itemAttrs = new AttrsValue({
        props: {
          disabled: payload.disabled || edit.disabled,
          placeholder: [edit.placeholder, edit.endPlaceholder],
          format: edit.$option.showFormat,
          allowClear: !edit.$option.hideClear,
          separator: edit.$option.separator,
          showTime: showTime,
          disabledDate: edit.$option.disabledDate
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      if (edit.$option.rangeLimit) {
        itemAttrs.pushEvent('calendarChange', function(dates: [Dayjs, Dayjs] | [string, string], dateStrings: [string, string], info: { range: 'start' | 'end' }, _payload: AutoItemPayloadType<'edit'>) {
          if (dates && dates[0] && dates[1]) {
            // 获取结束时间距离开始时间的时间间隔，毫秒
            const offset = SimpleDateEdit.$compareDate(dates[0], dates[1])
            const rangeLimit = edit.$option.rangeLimit! * 1000
            if (offset > rangeLimit) {
              // 当大于限制值时
              if (info.range === 'start') {
                dates.splice(0, 1)
                dateStrings.splice(0, 1)
              } else if (info.range === 'end') {
                dates.splice(1, 1)
                dateStrings.splice(1, 1)
              }
            }
          }
        }, 'before')
      }
      return itemAttrs
    }
  },
  $file: {
    init: modelFuncDict.valueInit,
    on: {
      select: modelFuncDict.select
    },
    format(edit: FileEdit<boolean>, payload: AutoItemPayloadType<'edit'>) {
      let layout = edit.$option.layout
      if (layout == 'auto') {
        if (!payload.parent.gridParse) {
          layout = 'end'
        } else {
          layout = 'bottom'
        }
      }
      const buttonOption = { ...edit.$option.button } || {}
      if (buttonOption.name == undefined) {
        buttonOption.name = edit.$name
      }
      const itemAttrs = new AttrsValue({
        props: {
          accept: edit.$option.accept,
          maxSize: edit.$option.size,
          button: buttonOption,
          multiple: (edit as FileEdit<true>).$option.multiple,
          complex: edit.$option.complex,
          upload: edit.$option.upload,
          layout: layout,
          disabled: payload.disabled || edit.disabled
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $custom: {
    init: false,
    on: {},
    format(edit: CustomEdit, payload: AutoItemPayloadType<'edit'>) {
      const itemAttrs = new AttrsValue({
        props: {
          ...edit.$option,
          disabled: payload.disabled || edit.disabled
        }
      })
      const self = {
        init: false,
        on: {}
      } as dictItemType
      if (edit.$model.init) {
        self.init = createInit(edit.$model.init)
      }
      if (edit.$model.change) {
        if (edit.$model.change === 'input') {
          self.on!.input = modelFuncDict.input
        } else if (edit.$model.change === 'select') {
          self.on!.select = modelFuncDict.select
        } else if (edit.$model.change === 'change') {
          self.on!.change = modelFuncDict.change
        }
      }
      bindEvent(self as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $form: {
    init: false,
    on: {},
    format(edit: FormEdit, payload: AutoItemPayloadType<'edit'>) {
      const itemAttrs = new AttrsValue({
        props: {
          list: edit.$runtime.observeList,
          form: edit.$runtime.form,
          type: edit.$runtime.type,
          gridParse: edit.$option.gridParse === false ? undefined : (edit.$option.gridParse || edit.$runtime.gridParse),
          menu: edit.$option.menu,
          disabled: payload.disabled || edit.disabled
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  },
  $list: {
    init: modelFuncDict.valueInit,
    on: {
      change: modelFuncDict.change
    },
    format(edit: ListEdit, payload: AutoItemPayloadType<'edit'>) {
      const itemAttrs = new AttrsValue({
        props: {
          dictionary: edit.$runtime.dictionary,
          dictionaryList: edit.$runtime.dictionaryList,
          list: edit.$runtime.observeList,
          type: edit.$runtime.type,
          build: edit.$option.build,
          delete: edit.$option.delete,
          index: edit.$option.index,
          id: edit.$option.id,
          tableProps: edit.$option.tableProps
        }
      })
      bindEvent(this as dictItemType, itemAttrs, edit, payload)
      return itemAttrs
    }
  }
}

export const parseEditAttrs = function (edit: DictionaryEditMod, payload: AutoItemPayloadType<'edit'>) {
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
  } else if (edit.type === 'custom') {
    return dict.$custom.format(edit, payload)
  } else if (edit.type === 'form') {
    return dict.$form.format(edit, payload)
  } else if (edit.type === 'list') {
    return dict.$list.format(edit, payload)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error(`[${(edit as any).type}]:FormItem类型匹配失败，请检查代码`)
  }
}
