
// 宽度计算工具
const widthCalculator = {
  data: {
    char: 14.01,
    number: 8,
    letter: 12.8,
    padding: 16
  },
  getWidth(char: number, number = 0, letter = 0, extra = 0) {
    // 添加误差
    const offset = (char + number + letter) > 4 ? 4 : 4
    return char * this.data.char + number * this.data.number + letter * this.data.letter + this.data.padding * 2 + offset + extra
  },
  mergeWidth(width: number, times: number) {
    return width - this.data.padding * 2 * (times - 1)
  }
}

export default widthCalculator
