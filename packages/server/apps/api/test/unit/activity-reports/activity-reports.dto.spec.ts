import { plainToInstance } from 'class-transformer'
import { validateSync } from 'class-validator'
import { expect } from 'chai'
import {
  ActivityReportMetricParamsDTO,
  ActivityReportQueryDTO,
} from '../../../src/activity-reports/activity-reports.dto'

describe('activity-reports.dto', () => {
  context('ActivityReportQueryDTO', () => {
    it('transforms valid date strings into Date objects', () => {
      const dto = plainToInstance(ActivityReportQueryDTO, {
        dateFrom: '2026-04-01T00:00:00.000Z',
        dateTo: '2026-04-01T12:00:00.000Z',
      })

      const errors = validateSync(dto)

      expect(errors).to.have.length(0)
      expect(dto.dateFrom).to.be.instanceOf(Date)
      expect(dto.dateTo).to.be.instanceOf(Date)
      expect(dto.dateFrom?.toISOString()).to.equal('2026-04-01T00:00:00.000Z')
      expect(dto.dateTo?.toISOString()).to.equal('2026-04-01T12:00:00.000Z')
    })

    it('maps invalid dates to undefined so controller fallback can apply', () => {
      const dto = plainToInstance(ActivityReportQueryDTO, {
        dateFrom: 'not-a-date',
        dateTo: 'bad-date',
      })

      const errors = validateSync(dto)

      expect(errors).to.have.length(0)
      expect(dto.dateFrom).to.equal(undefined)
      expect(dto.dateTo).to.equal(undefined)
    })
  })

  context('ActivityReportMetricParamsDTO', () => {
    it('rejects unsupported metric type', () => {
      const dto = plainToInstance(ActivityReportMetricParamsDTO, {
        metricType: 'invalidMetric',
      })

      const errors = validateSync(dto)

      expect(errors).to.have.length(1)
      expect(errors[0].property).to.equal('metricType')
    })
  })
})
