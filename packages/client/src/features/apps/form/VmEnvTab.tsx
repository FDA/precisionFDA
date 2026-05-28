import { ErrorMessage } from '@hookform/error-message'
import { type KeyboardEventHandler, type ReactNode, useRef } from 'react'
import { type Control, Controller, type FieldErrors, type UseFormTrigger } from 'react-hook-form'
import { Link } from 'react-router'
import { Checkbox } from '@/components/CheckboxNext'
import { FieldGroup, FieldLabelRow, InputError, SelectFieldLabel } from '@/components/form/form.styles'
import { ArrowLeftIcon } from '@/components/icons/ArrowLeftIcon'
import { CrossIcon } from '@/components/icons/PlusIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ExternalLink from '../../../components/Controls/ExternalLink'
import { useAssetAttachModal } from '../../actionModals/useAssetAttachModal'
import type { CreateAppForm } from '../apps.types'
import { InstanceTypeSelect } from './InstanceTypeSelect'
import { FormFields, Help } from './apps-form.styles'

const SectionLabelRow = ({
  label,
  htmlFor,
  learnMoreHref,
}: {
  label: string
  htmlFor?: string
  learnMoreHref?: string
}) => (
  <div className="flex items-end justify-between gap-3">
    <label htmlFor={htmlFor} className="text-sm font-semibold text-(--c-text-700)">
      {label}
    </label>
    {learnMoreHref && (
      <a
        href={learnMoreHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary underline-offset-2 hover:underline"
      >
        Learn more
      </a>
    )}
  </div>
)

const Tip = ({ children }: { children: ReactNode }) => (
  <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
)

const InfoTip = ({ children }: { children: ReactNode }) => (
  <Tip>
    <span className="font-semibold text-(--c-text-700)">TIP: </span>
    {children}
  </Tip>
)

const AssetSelect = ({
  onChange,
  value,
}: {
  onChange: (a: CreateAppForm['ordered_assets']) => void
  value: CreateAppForm['ordered_assets']
}) => {
  const { modalComp, setShowModal } = useAssetAttachModal(value, onChange)

  return (
    <div className="flex max-w-125 flex-col gap-1.5">
      <SectionLabelRow label="Assets" learnMoreHref="/docs/guides/assets#creating-new-assets" />
      <div className="rounded-md border border-(--c-layout-border-200) bg-tertiary-muted p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="outline" className="min-w-45" onClick={() => setShowModal(true)}>
            Manage App Assets
          </Button>
          <Link
            to="/home/assets"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-primary underline-offset-2 hover:underline"
          >
            Manage your Assets
            <ArrowLeftIcon right height={12} />
          </Link>
        </div>
        {modalComp}
        {value.length > 0 && (
          <ul className="mt-3 flex flex-col divide-y divide-(--c-layout-border-200)/60 rounded-md border border-(--c-layout-border-200) bg-background">
            {value.map(item => (
              <li key={item.uid} className="px-3 py-2 text-sm">
                <Link
                  to={`/home/assets/${item.uid}`}
                  target="_blank"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const UbuntuPackageSelect = ({ onChange, value }: { onChange: (p: string[]) => void; value: string[] }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const addItem = () => {
    if (!inputRef?.current?.value) return
    const inputVal = inputRef.current.value
    if (value.includes(inputVal)) return
    onChange([...value, inputVal])
    inputRef.current.value = ''
  }

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addItem()
    }
  }

  const handleDeleteClick = (index: number) => {
    const newVals = value.filter((_, i) => i !== index)
    onChange(newVals)
  }

  return (
    <div className="flex max-w-125 flex-col gap-1.5">
      <SectionLabelRow label="Ubuntu Packages" htmlFor="ubuntu-package-input" />
      <div className="rounded-md border border-(--c-layout-border-200) bg-tertiary-muted p-3">
        <div className="flex max-w-100 items-stretch">
          <Input
            id="ubuntu-package-input"
            ref={inputRef}
            placeholder="Package name"
            onKeyDown={handleKeyDown}
            className="rounded-r-none border-r-0 focus-visible:z-10"
          />
          <Button type="button" onClick={addItem} className="rounded-l-none">
            Add
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          <span className="font-semibold text-(--c-text-700)">TIP: </span>
          Find packages within the distribution using{' '}
          <ExternalLink to="https://packages.ubuntu.com/">Ubuntu Package Search</ExternalLink>
        </p>
        {value.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {value.map((item, i) => (
              <li
                key={item}
                className="inline-flex items-center gap-1.5 rounded-md border border-(--c-layout-border-200) bg-background px-2 py-1 text-xs"
              >
                <span className="font-mono">{item}</span>
                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  onClick={() => handleDeleteClick(i)}
                  className="inline-flex size-4 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <CrossIcon height={10} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export const VmEnvTab = ({
  control,
  errors,
  trigger,
}: {
  control: Control<CreateAppForm>
  errors: FieldErrors<CreateAppForm>
  trigger: UseFormTrigger<CreateAppForm>
}) => {
  return (
    <FormFields>
      <Help>
        <span>Need help?</span>
        <a target="_blank" href="/docs/guides/creating-apps#vm-environment" rel="noopener">
          {' '}
          Learn more about the virtual machine environment
        </a>
      </Help>

      <FieldGroup>
        <Controller
          name="internet_access"
          control={control}
          render={({ field }) => (
            <FieldLabelRow>
              <Checkbox {...field} checked={field.value} />
              Enable Internet Access
            </FieldLabelRow>
          )}
        />
        <InfoTip>The precisionFDA CLI is only available when internet access is enabled</InfoTip>
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="instance_type"
          control={control}
          render={({ field }) => (
            <SelectFieldLabel htmlFor="instance_type" className="w-fit self-start">
              Instance Type
              <InstanceTypeSelect
                id="instance_type"
                field={field}
                onValueChange={() => queueMicrotask(() => void trigger('instance_type'))}
              />
            </SelectFieldLabel>
          )}
        />
        <ErrorMessage
          errors={errors}
          name="instance_type"
          render={({ message }) => <InputError>{message}</InputError>}
        />
        <a
          href="/docs/guides/creating-apps#available-instance-types"
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-xs text-primary underline-offset-2 hover:underline"
        >
          See full list of instance types
        </a>
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="ordered_assets"
          control={control}
          render={({ field }) => <AssetSelect onChange={field.onChange} value={field.value} />}
        />
      </FieldGroup>

      <FieldGroup>
        <Controller
          name="packages"
          control={control}
          render={({ field }) => <UbuntuPackageSelect onChange={field.onChange} value={field.value as string[]} />}
        />
      </FieldGroup>
    </FormFields>
  )
}
