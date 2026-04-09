//
// Allocate a certain size to test if it can be done.
//
function alloc(size: number): number[] {
  const numbers = size / 8
  const arr: number[] = []
  arr.length = numbers
  for (let i = 0; i < numbers; i++) {
    arr[i] = i
  }
  return arr
}

//
// Keep allocations referenced so they aren't garbage collected.
//
const allocations: unknown[] = []

//
// Allocate memory until hitting the heap limit.
//
export const testHeapMemoryAllocationError: () => void = () => {
  console.log('Start testHeapMemoryAllocationError')

  const mu = process.memoryUsage()
  console.log(mu)
  const gbStart = mu.heapUsed / 1024 / 1024 / 1024
  console.log(`Start ${Math.round(gbStart * 100) / 100} GB`)

  const allocationStep = 100 * 1024

  while (true) {
    // Allocate memory.
    const allocation = alloc(allocationStep)

    // Allocate and keep a reference so the allocated memory isn't garbage collected.
    allocations.push(allocation)

    // Check how much memory is now allocated.
    const mu = process.memoryUsage()
    const mbNow = mu.heapUsed / 1024 / 1024 / 1024
    //console.log(`Total allocated       ${Math.round(mbNow * 100) / 100} GB`)
    console.log(`Allocated since start ${Math.round((mbNow - gbStart) * 100) / 100} GB`)
  }
}
