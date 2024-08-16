import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { get } from 'lodash'
import React, { useMemo } from 'react'
import { FieldErrors, useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { Tooltip } from 'react-tooltip'
import styled from 'styled-components'
import * as Yup from 'yup'
import { TransparentButton, Button } from '../../components/Button'
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
const StyledButtonText = styled(TransparentButton)`
  justify-self: flex-start;
  color: var(--primary-500);
  &:hover {
    color: var(--primary-400);
  }
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

const mergeAndUpdateProperties = (itemProperties: Properties, newPropertiesObject: Properties, commonPropertiesKeys: string[]): Properties => {
  const mergedProperties = { ...itemProperties, ...newPropertiesObject }
  commonPropertiesKeys.forEach(key => {
    if (!newPropertiesObject.hasOwnProperty(key) && commonPropertiesKeys.includes(key)) {
      delete mergedProperties[key]
    }
  })
  return mergedProperties
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
  selected,
  setShowModal,
  onSuccess,
}: {
  type: PropertiesResource
  selected: {
    id: number
    name: string
    properties: Properties
  }[]
  setShowModal: (show: boolean) => void
  onSuccess?: (res: any) => void

}) => {
  const commonProperties: Properties = selected.reduce<Properties>((acc, obj, idx) => {
    if (idx === 0) return { ...obj.properties }
    // For subsequent objects, retain only those properties that are common and have the same value
    Object.keys(acc).forEach(key => {
      if (acc[key] !== obj.properties[key]) {
        delete acc[key]
      }
    })
    return acc
  }, {})

  const propertiesArr = Object
    .entries(selected.length == 1 ? selected[0].properties : commonProperties)
    .map(([key, value]) => ({
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
    mutationFn: (payload: { id: number, properties: Properties }) => editPropertiesRequest({
      id: payload.id,
      type,
      properties: payload.properties,
    }),
  })

  const onSubmit = async (d: FormInputs) => {
    const newProperties = d.props.reduce((acc, { key, value }) => {
      if (key.length) acc[key] = value.trimEnd() // Only add properties with a non-empty key
      return acc
    }, {} as Properties)

    for (const item of selected) {
      const propertiesToUse = selected.length === 1 ? newProperties :
        mergeAndUpdateProperties(item.properties, newProperties, Object.keys(commonProperties))

      await mutation.mutateAsync({
        id: item.id,
        properties: propertiesToUse,
      })
    }

    onSuccess && onSuccess(mutation.data)
    setShowModal && setShowModal(false)
    toast.success('Properties updated')
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
                <FieldWrapper key={field.id} data-testid={`property-${index}`}>
                  <InputTextS
                    autoComplete="off"
                    {...register(`props.${index}.key`)}
                    data-tooltip-id={`props.${index}.key`}
                    data-tooltip-content={message}
                    disabled={mutation.isPending}
                    $isError={isError}
                  />
                  {isError && (
                    <Tooltip id={`props.${index}.key`} />
                  )}
                  <InputTextS
                    autoComplete="off"
                    {...register(`props.${index}.value`)}
                    disabled={mutation.isPending}
                  />
                  <Remove data-testid="property-remove" onClick={() => remove(index)}>
                    <CrossIcon/>
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
          <div/>
        )}
        <ButtonRow>
          <Button
            type="button"
            onClick={() => setShowModal(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            data-variant="primary"
            type="submit"
            form="edit-properties-form"
            disabled={mutation.isPending || Object.keys(errors).length > 0}
          >
            Edit Properties
          </Button>
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
  selected: T[]
  onSuccess?: (res: any) => void
}) {
  const { isShown, setShowModal } = useModal()
  const mSelected = useMemo(() => selected, [isShown])

  const modalComp = (
    <ModalNext
      id="edit-properties-modal"
      data-testid={`modal-${type}-edit-properties`}
      isShown={isShown}
      hide={() => setShowModal(false)}
    >
      <ModalHeaderTop
        disableClose={false}
        headerText={`Edit ${mSelected.length > 1 ? `common properties for ${mSelected.length} items` : `properties for ${mSelected[0]?.name}`}`}
        hide={() => setShowModal(false)}
      />

      <EditPropertiesForm
        type={type}
        onSuccess={onSuccess}
        setShowModal={setShowModal}
        selected={mSelected}
      />
    </ModalNext>
  )
  return {
    modalComp,
    setShowModal,
    isShown,
  }
}
