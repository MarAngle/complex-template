<style lang="less" scoped>

</style>
<template>
  <input
    class="complex-input-file"
    ref="file"
    type="file"
    :multiple="multiple"
    :disabled="disabled"
    :placeholder="placeholder"
    :accept="accept"
    @change="onChange"
  />
</template>

<script>
import _func from 'complex-func'

export default {
  name: 'InputFile',
  data () {
    return {
    }
  },
  props: {
    accept: {
      type: String,
      required: false,
      default: ''
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    maxNum: {
      type: [Number],
      required: false,
      default: 0
    },
    minNum: {
      type: [Number],
      required: false,
      default: 0
    },
    multipleAppend: {
      type: Boolean,
      required: false,
      default: false
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false
    },
    placeholder: {
      type: String,
      required: false,
      default: ''
    },
    maxSize: { // MB
      type: Number,
      required: false,
      default: 0
    }
  },
  mounted() {
  },
  methods: {
    checkFileAccept(file, accept) {
      let fg = false
      if (accept) {
        let fileType = file.type
        let namelist = file.name.split('.')
        let fileName = ('.' + namelist[namelist.length - 1]).toLowerCase()
        let acceptList = accept.split(',')
        for (let n in acceptList) {
          let acceptItem = acceptList[n]
          if (acceptItem) {
            if (acceptItem.indexOf('.') == 0) { // 文件后缀形式判断
              if (acceptItem == fileName) {
                fg = true
                break
              }
            } else { // 文件type判断=暂时只支持image/*...类型
              if (acceptItem == fileType) {
                fg = true
                break
              } else if (fileType && acceptItem.indexOf('*') > -1) {
                acceptItem = acceptItem.split('*').join('')
                if (fileType.indexOf(acceptItem) > -1) {
                  fg = true
                  break
                }
              }
            }
          }
        }
      } else {
        fg = true
      }
      return fg
    },
    onChange(e) {
      let originfilelist = e.target.files
      if (originfilelist.length > 0) {
        if (!this.multiple) {
          let file = originfilelist[0]
          let next = this.check(file)
          if (next.act) {
            this.$emit('change', file)
          }
        } else {
          let filelist = []
          let currentNum = originfilelist.length
          if (this.maxNum && currentNum > this.maxNum) {
            currentNum = this.maxNum
          }
          for (let n = 0; n < currentNum; n++) {
            let file = originfilelist[n]
            let next = this.check(file)
            if (next.act) {
              filelist.push(file)
            }
          }
          if (filelist.length > 0 && filelist.length != currentNum) {
            // 存在不合格数据
            if (this.multipleAppend) {
              this.$emit('change', filelist)
            }
          } else {
            this.$emit('change', filelist)
          }
        }
        e.target.value = ''
      }
    },
    check(file) {
      let next = {
        act: true,
        msg: ''
      }
      let isAccept = this.checkFileAccept(file, this.accept)
      if (!isAccept) {
        next.act = false
        next.msg = `文件格式不匹配!`
      } else if (this.maxSize) {
        let fileSize = file.size / 1024 / 1024
        if (fileSize > this.maxSize) {
          next.act = false
          next.msg = `文件大小不能大于${this.maxSize}MB!`
        }
      }
      if (!next.act) {
        _func.showmsg(next.msg, 'error')
      }
      return next
    }
  }
}
</script>
