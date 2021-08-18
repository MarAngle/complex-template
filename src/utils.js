import _func from 'complex-func'

let utils = {
  countClass: function(...args) {
    return args.join('-')
  },
  addClass: function(option, className) {
    if (!option.class) {
      option.class = className
    } else {
      if (_func.getType(option.class) === 'array') {
        if (option.class.indexOf(className) == -1) {
          option.class.push(className)
        }
      } else {
        if (option.class !== className) {
          option.class = [option.class, className]
        }
      }
    }
  }
}

export default utils
