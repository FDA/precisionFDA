import { mount } from 'enzyme'

import UserContent from './index'


describe('UserContent', () => {
  it('generates anchors correctly when user is not logged in', () => {
    const testHtml = `
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <p>Some test goes here, whatever that may be</p>
      <p>Another paragraph, another not-a-heading</p>
      <h2>Finally, another heading</h2>
    `

    const userContent = new UserContent(testHtml, false)
    expect(userContent.anchors).toEqual([
      { tag: 'h1', content: 'Heading 1', anchorId: '1__Heading_1' },
      { tag: 'h2', content: 'Heading 2', anchorId: '2__Heading_2' },
      { tag: 'h2', content: 'Finally, another heading', anchorId: '3__Finally%2C_another_hea' },
    ])

    const contentWrapper = mount(userContent.createDisplayElement())

    for (const anchor in userContent.anchors) {
      expect(contentWrapper.find('#'+anchor.anchorId).exists())
    }
  })

  it('handles very long headings gracefully', () => {
    const testHtml = `
      <h1>Heading 1 that is really quite long and one wonders if the writer of this content can be more succinct</h1>
      <h2>Heading 2 that is equally if not even more long, and one starts to wonder if the writer is doing it deliberately</h2>
    `

    const userContent = new UserContent(testHtml, false)
    expect(userContent.anchors).toEqual([
      { tag: 'h1',
        content: 'Heading 1 that is really quite long and one wonders if the writer of this content can be more succinct',
        anchorId: '1__Heading_1_that_is_re' },
      { tag: 'h2',
        content: 'Heading 2 that is equally if not even more long, and one starts to wonder if the writer is doing it deliberately',
        anchorId: '2__Heading_2_that_is_eq' },
    ])
  })

  it('handles HTML tags in headings gracefully', () => {
    const testHtml = `
      <h1><a href="https://nowhere">Heading</a> 1</h1>
      <h2>Heading <a href="https://somewhere">2</a></h2>
    `

    const userContent = new UserContent(testHtml, false)
    expect(userContent.anchors).toEqual([
      { tag: 'h1', content: 'Heading 1', anchorId: '1__Heading_1' },
      { tag: 'h2', content: 'Heading 2', anchorId: '2__Heading_2' },
    ])
  })
})
