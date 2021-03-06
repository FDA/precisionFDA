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

const isExpandedAllItems = (items = []) => {
  if (!items.length) return false

  let expandedAll = true
  for (let i = 0; i < items.length; i++) {
    if (!items[i].isExpanded) {
      expandedAll = false
      break
    }
  }
  return expandedAll
}

const getModalKey = (action) => {
  switch (action) {
    case C.SPACE_FILES_ACTIONS.COPY:
      return 'copyModal'
    default:
      return 'actionModal'
  }
}

const convertSecondsToDhms = (seconds) => {
  if (isNaN(seconds)) return 'N/A'
  seconds = Number(seconds)

  const d = Math.floor(seconds / (3600*24))
  const h = Math.floor(seconds % (3600*24) / 3600)
  const m = Math.floor(seconds % 3600 / 60)
  const s = Math.floor(seconds % 60)
  
  const dDisplay = d > 0 ? d + (d == 1 ? ' day ' : ' days ') : ''
  const hDisplay = h > 0 ? h + (h == 1 ? ' hour ' : ' hours ') : ''
  const mDisplay = m > 0 ? m + (m == 1 ? ' minute ' : ' minutes ') : ''
  const sDisplay = s > 0 ? s + (s == 1 ? ' second' : ' seconds') : ''

  return dDisplay + hDisplay + mDisplay + sDisplay
}

export {
  getOrder,
  isCheckedAllCheckboxes,
  getModalKey,
  isExpandedAllItems,
  convertSecondsToDhms,
}
