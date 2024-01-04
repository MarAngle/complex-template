import AutoText from "./src/AutoText.vue"
import ButtonView from "./src/ButtonView"
import SimpleTableView from "./src/SimpleTableView"
import TableView from "./src/TableView"
import ModalView from "./src/ModalView"
import FormView from "./src/FormView"
import EditView from "./src/EditView"
import ListView from "./src/ListView"
import config from "./config"

export const ComplexAutoText = AutoText
export const ComplexButtonView = ButtonView
export const ComplexSimpleTableView = SimpleTableView
export const ComplexTableView = TableView
export const ComplexModalView = ModalView
export const ComplexFormView = FormView
export const ComplexEditView = EditView
export const ComplexListView = ListView

export const initStyle = function() {
  config.initStyle()
}
