export const mockDelay = (delay = 2000) => (
  new Promise((resolve) => {
    const T = setTimeout(() => {
      resolve()
      clearTimeout(T)
    }
    , delay)
  })
)

export const debounce = (inner, ms = 0) => {
  let timer = null
  let resolves = []

  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      let result = inner(...args)
      resolves.forEach(r => r(result))
      resolves = []
    }, ms)

    return new Promise(r => resolves.push(r))
  }
}

export const getQueryParam = (query, item) => (new URLSearchParams(query)).get(item)

export const createSequenceGenerator = () => {
  function *generator() {
    let index = 0

    while (true) {
      yield index++
    }
  }

  return generator()
}
