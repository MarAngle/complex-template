import dayjs, { Dayjs } from 'dayjs'
import { date } from 'complex-plugin'
import { SearchData } from "complex-data"
import DefaultEditDate from "complex-data/src/dictionary/DefaultEditDate"
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
  if ((other as Dayjs).isBefore(target as Dayjs)) {
    return 'before'
  } else if ((other as Dayjs).isSame(target as Dayjs)) {
    return 'same'
  } else {
    return 'after'
  }
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

DefaultEditDate.$edit = function(value, format) {
  return value !== undefined ? dayjs(value, format) : value
}

DefaultEditDate.$post = function(value, format) {
  return value !== undefined ? (value as Dayjs).format(format) : value
}
