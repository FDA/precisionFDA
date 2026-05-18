import { expect } from 'chai'
import { humanizeFileSize } from '@shared/utils/format'

describe('format utils', () => {
  describe('humanizeFileSize', () => {
    it('returns Bytes for empty values', () => {
      expect(humanizeFileSize(undefined)).to.equal('0 Bytes')
      expect(humanizeFileSize(null)).to.equal('0 Bytes')
      expect(humanizeFileSize(0)).to.equal('0 Bytes')
    })

    it('handles byte singular/plural', () => {
      expect(humanizeFileSize(1)).to.equal('1 Byte')
      expect(humanizeFileSize(512)).to.equal('512 Bytes')
    })

    it('uses compact 3-significant-figure formatting for higher units', () => {
      expect(humanizeFileSize(1024)).to.equal('1 KB')
      expect(humanizeFileSize(1536)).to.equal('1.5 KB')
      expect(humanizeFileSize(10_240)).to.equal('10 KB')
      expect(humanizeFileSize(1_572_864)).to.equal('1.5 MB')
      expect(humanizeFileSize(10_485_760)).to.equal('10 MB')
      expect(humanizeFileSize(1_073_741_824)).to.equal('1 GB')
    })
  })
})
