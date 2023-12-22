import dayjs, { Dayjs } from 'dayjs'
import { SearchData } from "complex-data"
import DefaultEditDate from "complex-data/src/dictionary/DefaultEditDate"
import AntdFormValue from "./src/class/AntdFormValue"
import AutoText from "./src/AutoText.vue"
import ButtonView from "./src/ButtonView"
import SimpleTableView from "./src/SimpleTableView"
import TableView from "./src/TableView"
import ModalView from "./src/ModalView"
import FormView from "./src/FormView"
import EditView from "./src/EditView"
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

export const ComplexAutoText = AutoText
export const ComplexButtonView = ButtonView
export const ComplexSimpleTableView = SimpleTableView
export const ComplexTableView = TableView
export const ComplexModalView = ModalView
export const ComplexFormView = FormView
export const ComplexEditView = EditView
