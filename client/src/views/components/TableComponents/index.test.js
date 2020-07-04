import React from 'react'
import { shallow } from 'enzyme'

import { Table, Tbody, Thead, Th } from '.'


const TestTable = () => (
  <Table>
    <Thead>
      <Th>Test1</Th>
      <Th>Test2</Th>
    </Thead>
    <Tbody>
      <tr>
        <td>1</td>
        <td>2</td>
      </tr>
    </Tbody>
  </Table>
)

describe('SpacesListPage test', () => {
  it('should render', () => {
    const component = shallow(<TestTable />)
    expect(component).toMatchSnapshot()
  })
})
