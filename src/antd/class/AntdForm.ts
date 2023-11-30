import { BaseForm } from 'complex-data'

class AntdForm extends BaseForm{
  clearValidate(...args: any[]) {
    if (this.ref) {
      this.ref.clearValidate(...args)
    }
  }
  validate(...args: any[]) {
    if (this.ref) {
      return this.ref.validate() as Promise<unknown>
    } else {
      return Promise.reject({ status: 'fail', code: 'no ref' })
    }
  }
}

export default AntdForm
