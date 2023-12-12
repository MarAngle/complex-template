import { FormInstance } from "ant-design-vue"
import { FormValue } from "complex-data"

class AntdFormValue extends FormValue{
  declare ref: FormInstance
  clearValidate(...args: Parameters<FormInstance['clearValidate']>) {
    if (this.ref) {
      this.ref.clearValidate(...args)
    }
  }
  validate(...args: Parameters<FormInstance['validate']>) {
    if (this.ref) {
      return this.ref.validate(...args)
    } else {
      return Promise.reject({ status: 'fail', code: 'no ref' })
    }
  }
}

export default AntdFormValue
