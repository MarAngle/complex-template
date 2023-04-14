import { AttributesData } from "complex-data-next";

export const mergeAttributes = function(targetData: AttributesData, originData: AttributesData) {
  for (const key in originData.props) {
    targetData.props[key] = originData.props[key]
  }
  for (const key in originData.on) {
    targetData.on[key] = originData.on[key]
  }
  for (const key in originData.style) {
    targetData.style[key] = originData.style[key]
  }
  targetData.class.forEach(classItem => {
    if (targetData.class.indexOf(classItem) == -1) {
      targetData.class.push(classItem)
    }
  })
  targetData.id.forEach(idItem => {
    if (targetData.id.indexOf(idItem) == -1) {
      targetData.id.push(idItem)
    }
  })
}

export const parseAttributes = function(attributesData: AttributesData) {
  return {
    id: attributesData.id,
    class: attributesData.class,
    ...attributesData.style,
    ...attributesData.props
  }
}

