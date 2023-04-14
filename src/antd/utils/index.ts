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
  const data = {
    ...attributesData.style,
    ...attributesData.props
  }
  if (attributesData.id.length > 0) {
    data.id = attributesData.id
  }
  if (attributesData.class.length > 0) {
    data.class = attributesData.class
  }
  return data
}

