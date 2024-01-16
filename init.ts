import dayjs, { Dayjs } from 'dayjs'
import { date } from 'complex-plugin'
import { SearchData } from "complex-data"
import DefaultEditDate from "complex-data/src/dictionary/DefaultEditDate"
import customParseFormat from "dayjs/plugin/customParseFormat"
import AntdFormValue from "./src/class/AntdFormValue"
import './src/style/index.css'

SearchData.$form = AntdFormValue

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
