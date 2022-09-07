import React from 'react'
import { ButtonSolidBlue, Button } from '../../../components/Button'
import Dropdown from '../../../components/Dropdown'
import { AngleDownIcon } from '../../../components/icons/AngleDownIcon'
import Icon from '../Icon'
import { Divider, StyledItem, StyledMenu, StyledMessageItem } from './styles'

interface IItemOption {
  text: string,
  icon?: string,
  title: string,
  isDisabled: boolean,
  onClick: () => void,
  link: string,
  method: string,
  hide: boolean,
}

export const Item = ({ option }: {option: IItemOption}) => {
  const { text, icon, isDisabled, onClick, link, method, hide } = option
  if (hide) return null

  const handler = () => {
    if (!isDisabled && typeof onClick === 'function') onClick()
  }

  if (link && !isDisabled) {
    return (
      <StyledItem>
        <a style={{ padding: 0 }} href={link} data-method={method}>
          {icon && <Icon icon={icon} />}&nbsp;
          {text}
        </a>
      </StyledItem>
    )
  }

  return (
    <StyledItem isDisabled={isDisabled} onClick={handler}>
      {icon && <Icon icon={icon} />}&nbsp;
      {text}
    </StyledItem>
  )
}

interface IDropdownMenu {
  icon: string,
  title: string,
  page: string,
  options: any[],
  className: string,
  message: string,
}

export const DropdownMenu = ({ icon, title, page, options = [], message = '' }: IDropdownMenu) => {
  const list = options.map((e: any, i: any) => {
    return <Item option={e} key={i} />
  })

  if (message) list.unshift(
    <React.Fragment key='message'>
      <StyledMessageItem>{message}</StyledMessageItem>
      <Divider />
    </React.Fragment>,
  )

  let showButton
  if (page === 'create') {
    showButton =
      (childProps) => (
        <Button {...childProps}>
          <span>{title}</span>&nbsp;
          <AngleDownIcon />
        </Button>
      )
  } else {
    showButton =
      (childProps) => (
        <ButtonSolidBlue {...childProps}>
          <span>{title}</span>&nbsp;
          <AngleDownIcon />
        </ButtonSolidBlue>
      )
  }

  return (
    <Dropdown trigger="click" content={
      <StyledMenu>
        {list}
      </StyledMenu>
    }>
      {showButton}
    </Dropdown>
  )
}
