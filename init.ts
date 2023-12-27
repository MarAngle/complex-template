import dayjs, { Dayjs } from 'dayjs'
import { SearchData } from "complex-data"
import DefaultEditDate from "complex-data/src/dictionary/DefaultEditDate"
import AntdFormValue from "./src/class/AntdFormValue"
import './src/style/index.css'

SearchData.$form = AntdFormValue

// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

DefaultEditDate.$edit = function(value, format) {
  return value !== undefined ? dayjs(value, format) : value
}

DefaultEditDate.$post = function(value, format) {
  return value !== undefined ? (value as Dayjs).format(format) : value
}
