import { FormInstance } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import { date } from 'complex-plugin'
import { FormValue } from "complex-data"
import DefaultEdit, { ruleOption } from 'complex-data/src/dictionary/DefaultEdit'
import SimpleDateEdit from "complex-data/src/dictionary/SimpleDateEdit"
import customParseFormat from "dayjs/plugin/customParseFormat"
import './src/style/index.css'

FormValue.clearValidate = function(formValue, ...args: Parameters<FormInstance['clearValidate']>) {
  if (formValue.ref) {
    (formValue.ref as FormInstance).clearValidate(...args)
  }
}
FormValue.validate = function(formValue, ...args: Parameters<FormInstance['validate']>) {
  if (formValue.ref) {
    return (formValue.ref as FormInstance).validate(...args)
  } else {
    return Promise.reject({ status: 'fail', code: 'no ref' })
  }
}

DefaultEdit.$parseRule = function(ruleValue: ruleOption, form: Record<PropertyKey, any>) {
  const currentRuleValue = { ...ruleValue } as any
  if (currentRuleValue.validator) {
    currentRuleValue.validator = function(rule: any, value: any, callback: any) {
      const res = ruleValue.validator!(value, form, rule, callback)
      if (typeof res === 'boolean') {
        return res ? Promise.resolve() : Promise.reject()
      } else {
        return res
      }
    }
  }
  return currentRuleValue
}

date.pushParse('dayjs', value => dayjs(value))

SimpleDateEdit.$parseDate = function(dateValue) {
  if (typeof dateValue.value === 'string') {
    return date.getData('dayjs', dateValue.value)
  } else {
    return dateValue.value
  }
}

SimpleDateEdit.$compareDate = function(target, other) {
  const otherTime = (other as Dayjs).valueOf()
  const targetTime = (target as Dayjs).valueOf()
  return otherTime - targetTime
}

dayjs.extend(customParseFormat)

SimpleDateEdit.$parse = function(value, format) {
  return value != undefined ? dayjs(value, format) : value
}

SimpleDateEdit.$collect = function(value, format) {
  return value != undefined ? (value as Dayjs).format(format) : value
}
