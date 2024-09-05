import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import React, { FormEvent, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Button } from '../../components/Button'
import { Checkbox } from '../../components/CheckboxNext'
import { FieldGroup, FieldLabelRow } from '../../components/form/styles'
import { Loader } from '../../components/Loader'
import { Radio } from '../../components/Radio'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll, StyledForm } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { SpaceReportFormat, SpaceReportFormatToOptionsMap } from './space-report.types'
import { createReport } from './space-reports.api'

const StyledLabel = styled.label`
  margin-bottom: 0;
`

const StyledRadio = styled(Radio)`
  margin-top: 0 !important;
`

export function useGenerateSpaceReportModal({ scope, onClose }: { scope: string; onClose?: () => void }) {
  const { isShown, setShowModal } = useModal()

  const [reportFormat, setReportFormat] = useState<SpaceReportFormat>('HTML')
  const [options, setOptions] = useState<SpaceReportFormatToOptionsMap[SpaceReportFormat]>()

  const close = () => {
    if (onClose) onClose()
    setShowModal(false)
  }

  const mutation = useMutation({
    mutationKey: ['generate-space-report'],
    mutationFn: () => createReport(scope, reportFormat, options),
    onSuccess: async () => {
      close()
    },
    onError: (e: AxiosError<{ error: { message: string } }>) => {
      toast.error(e?.response?.data?.error?.message ?? 'Error creating space report')
    },
  })

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    mutation.mutate()
  }

  useEffect(() => {
    setOptions(undefined)
  }, [reportFormat])

  const modalComp = (
    <ModalNext id="space-report-generate-modal" isShown={isShown} hide={() => close()}>
      <ModalHeaderTop disableClose={false} headerText="Generate space report" hide={() => setShowModal(false)} />
      <ModalScroll>
        <StyledForm id="generate-space-report-form" onSubmit={e => handleSubmit(e)}>
          <FieldGroup>
            <label>Select format</label>
            <FieldLabelRow>
              <StyledRadio
                id="newSpaceReportHtmlFormat"
                name="reportFormat"
                value="HTML"
                checked={reportFormat === 'HTML'}
                onChange={() => setReportFormat('HTML')}
              />
              <StyledLabel htmlFor="newSpaceReportHtmlFormat">HTML</StyledLabel>
              |
              <StyledRadio
                id="newSpaceReportJsonFormat"
                name="reportFormat"
                value="JSON"
                checked={reportFormat === 'JSON'}
                onChange={() => setReportFormat('JSON')}
              />
              <StyledLabel htmlFor="newSpaceReportJsonFormat">JSON</StyledLabel>
            </FieldLabelRow>
          </FieldGroup>
          {reportFormat === 'JSON' && (
            <FieldGroup>
              <label>Options</label>
              <FieldLabelRow>
                <Checkbox id="newSpaceReportOptionsPrettyPrint" checked={options?.prettyPrint ?? false} onChange={e => setOptions({ prettyPrint: e.target.checked })} />
                <StyledLabel htmlFor="newSpaceReportOptionsPrettyPrint">Pretty print</StyledLabel>
              </FieldLabelRow>
            </FieldGroup>
          )}
        </StyledForm>
      </ModalScroll>
      <Footer>
        <ButtonRow>
          {mutation.isPending && <Loader />}
          <Button onClick={() => close()}>Cancel</Button>
          <Button data-variant="primary" type="submit" form="generate-space-report-form" disabled={mutation.isPending}>
            Generate
          </Button>
        </ButtonRow>
      </Footer>
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
