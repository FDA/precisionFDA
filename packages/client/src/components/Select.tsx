import type { GroupBase, Props as ReactSelectProps, SelectInstance } from 'react-select'
import ReactSelect from 'react-select'
import type { CreatableProps } from 'react-select/creatable'
import ReactCreatableSelect from 'react-select/creatable'
import { cn } from '@/utils/cn'
import styles from './Select.module.css'

const CLASS_NAMES = {
  indicatorsContainer: () => styles.indicatorsContainer,
  valueContainer: () => styles.valueContainer,
  singleValue: () => styles.singleValue,
  control: ({ isDisabled }: { isDisabled: boolean }) =>
    cn(styles.control, isDisabled && styles.controlDisabled),
  menu: () => styles.menu,
  option: ({ isSelected }: { isSelected: boolean }) =>
    cn(styles.option, isSelected && styles.optionSelected),
  menuList: () => styles.listbox,
  multiValue: () => styles.multiValue,
  multiValueLabel: () => styles.multiValueLabel,
} as const

export function Select<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  className,
  ref,
  ...props
}: ReactSelectProps<Option, IsMulti, Group> & {
  ref?: React.Ref<SelectInstance<Option, IsMulti, Group>>
}) {
  return (
    <ReactSelect
      ref={ref}
      className={cn(styles.container, className)}
      classNames={CLASS_NAMES as ReactSelectProps<Option, IsMulti, Group>['classNames']}
      {...props}
    />
  )
}

export function CreatableSelect<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  className,
  ref,
  ...props
}: CreatableProps<Option, IsMulti, Group> & {
  ref?: React.Ref<SelectInstance<Option, IsMulti, Group>>
}) {
  return (
    <ReactCreatableSelect
      ref={ref}
      className={cn(styles.container, className)}
      classNames={CLASS_NAMES as CreatableProps<Option, IsMulti, Group>['classNames']}
      {...props}
    />
  )
}

