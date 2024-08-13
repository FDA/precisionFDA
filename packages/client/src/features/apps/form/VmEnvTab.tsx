import React, { useRef } from 'react'
import { Control, Controller } from 'react-hook-form'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import {
  TransparentButton, Button,
} from '../../../components/Button'
import ExternalLink from '../../../components/Controls/ExternalLink'
import {
  FieldGroup,
  FieldLabelRow,
  SelectFieldLabel,
} from '../../../components/form/styles'
import { ArrowLeftIcon } from '../../../components/icons/ArrowLeftIcon'
import { CrossIcon } from '../../../components/icons/PlusIcon'
import { Svg } from '../../../components/icons/Svg'
import { useAssetAttachModal } from '../../actionModals/useAssetAttachModal'
import { CreateAppForm } from '../apps.types'
import { InputTextS } from './Fields'
import { FormFields, Help } from './styles'
import { InstanceTypeSelect } from './InstanceTypeSelect'
import { Checkbox } from '../../../components/CheckboxNext'

const AssetList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  a {
    margin-left: 16px;
    line-height: 40px;
  }
`

const Box = styled.div`
  padding: 10px 10px;
  margin-bottom: -1px;
  background-color: var(--tertiary-70);
  border: 1px solid var(--c-layout-border-200);
  border-radius: 3px;
`

const Label = styled.label`
  font-size: 14px;
  line-height: 14px;
`

const Area = styled.div`
  max-width: 500px;
`
const LearnMoreLink = styled(Link)`
  font-size: 12px;
  max-width: fit-content;
`
const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
`

const AssetButtonRow = styled.div`
  ${Button} {
    width: 200px;
    justify-content: center;
  }
  display: flex;
  align-items: center;
  justify-content: space-between;
  a {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  ${Svg} {
    transform: rotate(180deg);
  }
`

const AssetSelect = ({
  onChange,
  value,
}: {
  onChange: (a: CreateAppForm['ordered_assets']) => void
  value: CreateAppForm['ordered_assets']
}) => {
  const { modalComp, setShowModal } = useAssetAttachModal(value, onChange)

  return (
    <Area>
      <LabelRow>
        <Label>Assets</Label>
        <LearnMoreLink to="/docs/creating-apps#dev-assets" target='_blank'>
          Learn More
        </LearnMoreLink>
      </LabelRow>
      <Box>
        <AssetButtonRow>
          <Button type="button" onClick={() => setShowModal(true)}>
            Attach Assets
          </Button>
          <Link to="/home/assets" target='_blank'>
            Manage your Assets <ArrowLeftIcon />
          </Link>
        </AssetButtonRow>
        {modalComp}
        {value.length > 0 && (
          <AssetList>
            {value.map(item => (
              <Link key={item.uid} to={`/home/assets/${item.uid}`} target="_blank">{item.name}</Link>
            ))}
          </AssetList>
        )}
      </Box>
    </Area>
  )
}

const PackagesInputRow = styled.div`
  display: flex;
  button {
    border-top-left-radius: 0px;
    border-bottom-left-radius: 0px;
  }
  input {
    max-width: 300px;
    border-right: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
`

const Tip = styled.div`
  color: #777777;
  text-align: left;
  font-size: 12px;
  margin-top: 4px;
`

const PackageRow = styled.div`
  display: flex;
  align-items: center;
`

const PackageList = styled.ul`
  list-style: none;
  button {
    margin-left: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const UbuntuPackageSelect = ({
  onChange,
  value,
}: {
  onChange: (p: CreateAppForm['packages']) => void
  value: CreateAppForm['packages']
}) => {
  const inputRef = useRef<HTMLInputElement>()

  const addItem = () => {
    if (!inputRef?.current?.value) return
    const inputVal = inputRef?.current?.value
    if (value.includes(inputVal)) return
    onChange([...value, inputVal])
    inputRef.current.value = ''
  }

  const handleDeleteClick = (index: number) => {
    const newVals = value.filter((_, i) => i !== index)
    onChange(newVals)
  }

  return (
    <Area>
      <Label>Ubuntu Packages</Label>
      <Box>
        <PackagesInputRow>
          <InputTextS ref={inputRef} placeholder="Package name" />
          <Button data-variant='primary' type="button" onClick={addItem}>
            Add
          </Button>
        </PackagesInputRow>
        <Tip>
          <b>TIP:</b> Find packages within the distribution using{' '}
          <ExternalLink to="http://packages.ubuntu.com/">
            Ubuntu Package Search
          </ExternalLink>
        </Tip>
        {value.length > 0 && (
          <PackageList>
            {value.map((item, i) => (
              <li key={item}>
                <PackageRow>
                  {item}
                  <TransparentButton
                    type="button"
                    onClick={() => handleDeleteClick(i)}
                  >
                    <CrossIcon height={12} />
                  </TransparentButton>
                </PackageRow>
              </li>
            ))}
          </PackageList>
        )}
      </Box>
    </Area>
  )
}

export const VmEnvTab = ({ control }: { control: Control<CreateAppForm>}) => {
  return (
    <FormFields>
      <Help>
        <span>Need help?</span>
        <Link target='_blank' to="/docs/creating-apps#dev-vm-env">
          {' '}
          Learn more about the virtual machine environment
        </Link>
      </Help>
      <FieldGroup>
        <Controller
          name="internet_access"
          control={control}
          render={({ field }) => (
            <FieldLabelRow>
              <Checkbox {...field} checked={field.value}  />
              Enable Internet Access
            </FieldLabelRow>
          )}
        />
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="instance_type"
          control={control}
          render={({ field }) => (
            <SelectFieldLabel>
              Instance Type
              <InstanceTypeSelect field={field} />
            </SelectFieldLabel>
          )}
        />
        <LearnMoreLink to="/docs/creating-apps#app-instance-types" target='_blank'>
          See full list
        </LearnMoreLink>
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="ordered_assets"
          control={control}
          render={({ field }) => (
            <AssetSelect onChange={field.onChange} value={field.value} />
          )}
        />
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="packages"
          control={control}
          render={({ field }) => (
            <UbuntuPackageSelect
              onChange={field.onChange}
              value={field.value}
            />
          )}
        />
      </FieldGroup>
    </FormFields>
  )
}
