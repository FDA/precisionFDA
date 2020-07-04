import * as C from '../constants'


const getOrder = (prevType, type, dir) => {
  if (prevType !== type || dir === null) {
    return { type, direction: C.SORT_ASC }
  } else if (dir === C.SORT_ASC) {
    return { type, direction: C.SORT_DESC }
  } else {
    return { type: null, direction: null }
  }
}

const isCheckedAllCheckboxes = (items = []) => {
  if (!items.length) return false

  let checkedAll = true
  for (let i = 0; i < items.length; i++) {
    if (!items[i].isChecked) {
      checkedAll = false
      break
    }
  }
  return checkedAll
}

const getModalKey = (action) => {
  switch (action) {
    case C.SPACE_FILES_ACTIONS.COPY:
      return 'copyModal'
    default:
      return 'actionModal'
  }
}

export {
  getOrder,
  isCheckedAllCheckboxes,
  getModalKey,
}
