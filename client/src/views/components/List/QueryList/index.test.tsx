import React from 'react'
import { shallow, mount } from 'enzyme'

import Loader from '../../Loader'
import { QueryList } from '.'

const getMockData = () => {
  const mockData: any[] = []
  for (let i=0; i<10; i++) {
    mockData.push({
      id: i,
      name: 'Name'+i,
      description: 'Blah '+i
    })
  }
  return mockData
}

const getMockQuerySuccess = () => {
  const status = 'success'
  const error = undefined
  const data = getMockData()
  return { status, error, data }
}

const listExtractor = (data: any) => {
  return data
}

const template = (item: any) => {
  return (
    <div key={item.id}>
      <h1>{item.name}</h1>
      <p>{item.description}</p>
    </div>
  )
}

describe('QueryList test', () => {
  it('should render', () => {
    const wrapper = shallow(<QueryList query={getMockQuerySuccess} listExtractor={listExtractor} template={template} />)

    expect(wrapper).toMatchSnapshot()
  })

  it('should show loader when isFetching and not show QueryList', () => {
    const query = () => {
      const status = 'loading'
      const error = undefined
      const data = getMockData()
      return { status, error, data }
    }
    const wrapper = mount(<QueryList query={query} listExtractor={listExtractor} template={template} />)

    expect(wrapper.find(Loader)).toHaveLength(1)
  })
})
