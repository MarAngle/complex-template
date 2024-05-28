import AutoText from "./src/AutoText.vue"
import ButtonView from "./src/ButtonView"
import SimpleTableView from "./src/SimpleTableView"
import TableView from "./src/TableView"
import ModalView from "./src/ModalView"
import InfoView from "./src/InfoView"
import InfoArea from "./src/InfoArea"
import EditView from "./src/EditView"
import EditArea from "./src/EditArea"
import SearchArea from "./src/SearchArea"
import QuickList from "./src/QuickList"
import QuickPanel from "./src/QuickPanel"
import config from "./config"

export const ComplexAutoText = AutoText
export const ComplexButtonView = ButtonView
export const ComplexSimpleTableView = SimpleTableView
export const ComplexTableView = TableView
export const ComplexModalView = ModalView
export const ComplexInfoView = InfoView
export const ComplexInfoArea = InfoArea
export const ComplexEditView = EditView
export const ComplexEditArea = EditArea
export const ComplexSearchArea = SearchArea
export const ComplexQuickList = QuickList
export const ComplexQuickPanel = QuickPanel

export const initStyle = function() {
  config.initStyle()
}
