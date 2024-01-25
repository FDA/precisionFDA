import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { get } from 'lodash'
import React, { useMemo } from 'react'
import { FieldErrors, useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'
import * as Yup from 'yup'
import { Button, ButtonSolidBlue, ButtonText } from '../../components/Button'
import { FieldGroup } from '../../components/form/styles'
import { CrossIcon } from '../../components/icons/PlusIcon'
import '../../utils/yupValidators'
import { ModalHeaderTop, ModalNext } from '../modal/ModalNext'
import { ButtonRow, Footer, ModalScroll } from '../modal/styles'
import { useModal } from '../modal/useModal'
import { InputTextS } from '../apps/form/Fields'
import { PropertiesResource, ServerScope } from '../home/types'
import { RequestResponse } from './useFeatureMutation'

const StyledForm = styled.form`
  min-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`
const StyledFieldGroup = styled(FieldGroup)`
  padding: 16px 8px 16px 24px;
`
const StyledButtonText = styled(ButtonText)`
  justify-self: flex-start;
`
const StyledFooter = styled(Footer)`
  justify-content: space-between;
`
const NoProperties = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
`

const FieldWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const Remove = styled.div`
  width: 30px;
  height: 30px;
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border-radius: 50%;
`

type Properties = {
  [key: string]: string
}

type FormInputs = {
  props: {
    key: string
    value: string
  }[]
}

const schema = Yup.object().shape({
  props: Yup.array()
    .unique('key', 'Name must be unique')
    .of(
      Yup.object().shape({
        key: Yup.string().required('Name is required'),
        value: Yup.string().nullable(),
      }),
    )
    .default([{ key: '', value: '' }]),
})

async function editPropertiesRequest({
  id,
  type,
  properties,
}: {
  id: number
  type: PropertiesResource
  properties: Properties
}) {
  return axios
    .post<RequestResponse>('/api/set_properties', {
      item_id: id,
      type,
      properties,
    })
    .then(d => d.data)
}

function getError(errors: FieldErrors<FormInputs>, key: string) {
  let message = ''
  let isError = false
  const e = get(errors, key)
  if (e) {
    message = e['message']
    isError = true
  }
  return { message, isError }
}

const EditPropertiesForm = ({
  type,
  onSuccess,
  id,
  name,
  scope,
  setShowModal,
  properties,
}: {
  type: PropertiesResource
  id: number
  name: string
  scope: ServerScope
  properties: Properties
  onSuccess?: (res: any) => void
  setShowModal: (show: boolean) => void
}) => {
  const queryClient = useQueryClient()
  const propertiesArr = Object.entries(properties).map(([key, value]) => ({
    key,
    value,
  }))
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      props: propertiesArr.length ? propertiesArr : [],
    },
  })

  const { fields, append, remove } = useFieldArray<FormInputs>({
    name: 'props',
    control,
  })

  const mutation = useMutation({
    mutationKey: ['edit-resource-properties', type],
    mutationFn: (newProperties: Properties) =>
      editPropertiesRequest({ id, type, properties: newProperties }),
    onSuccess: res => {
      if (onSuccess) onSuccess(res)
      if (setShowModal) setShowModal(false)
      toast.success(`${name} properties updated`)
      // users can only edit properties for a space's item inside that space
      queryClient.invalidateQueries(['edit-resource-properties', type, scope])
    },
    onError: () => {
      toast.error(`An error occurred while editing ${name} properties`)
    },
  })

  const onSubmit = async (d: FormInputs) => {
    const newProperties = d.props.filter(prop => prop.key.length)
    await mutation.mutateAsync(
      newProperties.reduce(
        (acc, curr: { key: string; value: string }) => ({
          ...acc,
          [curr.key]: curr.value,
        }),
        {},
      ),
    )
  }

  const handleAppendProperty = (e: any) => {
    e.preventDefault()
    append({ key: '', value: '' })
  }

  return (
    <>
      <StyledForm
        id="edit-properties-form"
        onSubmit={e => {
          e.stopPropagation()
          handleSubmit(onSubmit)(e)
        }}
      >
        <ModalScroll>
          <StyledFieldGroup>
            {fields.length === 0 && (
              <NoProperties>
                No properties have been added{' '}
                <StyledButtonText onClick={handleAppendProperty}>
                  Add a property
                </StyledButtonText>
              </NoProperties>
            )}
            {fields.map((field, index) => {
              const { isError, message } = getError(
                errors,
                `props.${index}.key`,
              )
              return (
                <FieldWrapper key={field.id}>
                  <InputTextS
                    autoComplete="off"
                    {...register(`props.${index}.key`)}
                    data-tip
                    data-for={`props.${index}.key`}
                    disabled={mutation.isLoading}
                    $isError={isError}
                  />
                  {isError && (
                    <ReactTooltip
                      id={`props.${index}.key`}
                      data-id={`props.${index}.key`}
                      place="top"
                      effect="solid"
                    >
                      {message}
                    </ReactTooltip>
                  )}
                  <InputTextS
                    autoComplete="off"
                    {...register(`props.${index}.value`)}
                    disabled={mutation.isLoading}
                  />
                  <Remove onClick={() => remove(index)}>
                    <CrossIcon />
                  </Remove>
                </FieldWrapper>
              )
            })}
          </StyledFieldGroup>
        </ModalScroll>
      </StyledForm>
      <StyledFooter>
        {fields.length > 0 ? (
          <StyledButtonText onClick={handleAppendProperty}>
            Add another property
          </StyledButtonText>
        ) : (
          <div />
        )}
        <ButtonRow>
          <Button
            type="button"
            onClick={() => setShowModal(false)}
            disabled={mutation.isLoading}
          >
            Cancel
          </Button>
          <ButtonSolidBlue
            type="submit"
            form="edit-properties-form"
            disabled={mutation.isLoading || Object.keys(errors).length > 0}
          >
            Edit Properties
          </ButtonSolidBlue>
        </ButtonRow>
      </StyledFooter>
    </>
  )
}

export function useEditPropertiesModal<
  T extends {
    id: number
    name: string
    properties: Properties
    scope: ServerScope
    featured: boolean
  },
>({
  type,
  selected,
  onSuccess,
}: {
  type: PropertiesResource
  selected: T
  onSuccess?: (res: any) => void
}) {
  const { isShown, setShowModal } = useModal()
  const mSelected = useMemo(() => selected, [isShown])

  const modalComp = isShown && (
    <ModalNext
      id="edit-properties-modal"
      data-testid={`modal-${type}-edit-properties`}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Edit properties for ${mSelected?.name}`}
        hide={() => setShowModal(false)}
      />
      {selected?.properties && (
        <EditPropertiesForm
          type={type}
          name={selected.name}
          onSuccess={onSuccess}
          id={selected.id}
          scope={selected.scope}
          setShowModal={setShowModal}
          properties={selected.properties}
        />
      )}
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
