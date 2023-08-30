import { SearchData } from 'complex-data-next'
import { ComplexAutoIndex, ComplexHighText, ComplexInputFile, ComplexShowValue } from "./index";
import './src/antd/style/index.less';
import AutoModal from "./src/antd/data/AutoModal.vue";
import AutoText from "./src/antd/data/AutoText.vue";
import ImportFile from "./src/antd/data/ImportFile.vue";
import FormView from "./src/antd/data/FormView";
import EditForm from "./src/antd/data/EditForm.vue";
import TableView from "./src/antd/data/TableView";
import AntdForm from "./src/antd/class/AntdForm";

SearchData.setForm(AntdForm)

export {
  ComplexAutoIndex,
  ComplexHighText,
  ComplexInputFile,
  ComplexShowValue
}

export const ComplexAutoModal = AutoModal
export const ComplexAutoText = AutoText
export const ComplexImportFile = ImportFile
export const ComplexFormView = FormView
export const ComplexEditForm = EditForm
export const ComplexTableView = TableView
