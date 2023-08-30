<style lang="less" scoped>

</style>
<template>
  <input
    class="complex-input-file"
    ref="file"
    type="file"
    :accept="accept"
    :multiple="multiple"
    :disabled="disabled"
    :placeholder="placeholder"
    @change="onChange"
  />
</template>

<script lang="ts">
import { notice } from 'complex-plugin'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'InputFile',
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
    max: {
      type: Number,
      required: false,
      default: 0
    },
    min: {
      type: Number,
      required: false,
      default: 0
    },
    append: {
      type: Boolean,
      required: false,
      default: true
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
    size: { // MB
      type: Number,
      required: false,
      default: 0
    }
  },
  methods: {
    checkAccept(file: File, accept: string) {
      let isAccept = false
      if (accept) {
        const fileType = file.type
        const namelist = file.name.split('.')
        const fileName = ('.' + namelist[namelist.length - 1]).toLowerCase()
        const acceptList = accept.split(',')
        for (let n in acceptList) {
          let acceptItem = acceptList[n]
          if (acceptItem) {
            if (acceptItem.indexOf('.') === 0) { // 文件后缀形式判断
              if (acceptItem === fileName) {
                isAccept = true
                break
              }
            } else { // 文件type判断=暂时只支持image/*...类型
              if (acceptItem === fileType) {
                isAccept = true
                break
              } else if (fileType && acceptItem.indexOf('*') > -1) {
                acceptItem = acceptItem.split('*').join('')
                if (fileType.indexOf(acceptItem) > -1) {
                  isAccept = true
                  break
                }
              }
            }
          }
        }
      } else {
        isAccept = true
      }
      return isAccept
    },
    check(file: File) {
      let next = true
      const isAccept = this.checkAccept(file, this.accept)
      if (!isAccept) {
        next = false
        notice.showMsg( `文件格式不匹配!`, 'error')
      } else if (this.size) {
        const currentSize = file.size / 1024 / 1024
        if (currentSize > this.size) {
          next = false
          notice.showMsg( `文件大小不能大于${this.size}MB!`, 'error')
        }
      }
      return next
    },
    onChange(e: Event) {
      const fileList = (e.target as unknown as { file: File[] }).file
      if (fileList.length > 0) {
        if (!this.multiple) {
          const file = fileList[0]
          const next = this.check(file)
          if (next) {
            this.$emit('change', file)
          }
        } else {
          const currentFileList = []
          let currentNum = fileList.length
          if (this.max && currentNum > this.max) {
            currentNum = this.max
          }
          for (let n = 0; n < currentNum; n++) {
            const file = fileList[n]
            const next = this.check(file)
            if (next) {
              currentFileList.push(file)
            }
          }
          if (currentFileList.length > 0 && currentFileList.length !== currentNum) {
            // 存在不合格数据
            if (this.append) {
              this.$emit('change', currentFileList)
            }
          } else {
            this.$emit('change', currentFileList)
          }
        }
      }
      (e.target as any).value = ''
    }
  }
})
</script>
