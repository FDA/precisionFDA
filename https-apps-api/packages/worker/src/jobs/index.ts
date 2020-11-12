export const handler = async job => {
  // this will create a corresponding operation, create a context for it,
  // and run it safely, something like "base-operation"
  console.log('job is being processed', job.data)
  return await Promise.resolve({ yay: true })
}
