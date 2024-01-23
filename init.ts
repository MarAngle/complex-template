import { FormInstance } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import { date } from 'complex-plugin'
import { FormValue } from "complex-data"
import DefaultEditDate from "complex-data/src/dictionary/DefaultEditDate"
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

date.pushParse('dayjs', value => dayjs(value))

DefaultEditDate.$parseDate = function(dateValue) {
  if (typeof dateValue.value === 'string') {
    return date.getData('dayjs', dateValue.value)
  } else {
    return dateValue.value
  }
}

DefaultEditDate.$compareDate = function(target, other) {
  const otherUnix = (other as Dayjs).unix()
  const targetUnix = (target as Dayjs).unix()
  if (otherUnix < targetUnix) {
    return 'before'
  } else if (otherUnix > targetUnix) {
    return 'after'
  } else {
    return 'same'
  }
}

dayjs.extend(customParseFormat)

DefaultEditDate.$edit = function(value, format) {
  return value !== undefined ? dayjs(value, format) : value
}

DefaultEditDate.$post = function(value, format) {
  return value !== undefined ? (value as Dayjs).format(format) : value
}
