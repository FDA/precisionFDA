type DiscussionAttachment = {
  id: number
  uid: string
  type: 'App' | 'UserFile' | 'Folder' | 'Asset' | 'Job' | 'Comparison'
  name: string
  link: string
}

export { DiscussionAttachment }
