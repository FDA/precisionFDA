import Bull from 'bull'

// todo: add settings
const myTestQueue = new Bull('todo-name')

const addToQueue = async data => {
  console.log('adding a task to queue', data)
  const job = await myTestQueue.add(data)
  return job
}

export { myTestQueue, addToQueue }
