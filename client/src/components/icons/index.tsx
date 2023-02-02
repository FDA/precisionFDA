import React from 'react'
import { AngleDownIcon } from './AngleDownIcon'
import { AreaChartIcon } from './AreaChartIcon'
import { ArrowIcon } from './ArrowIcon'
import { ArrowLeftIcon } from './ArrowLeftIcon'
import { ArrowUpRightFromSquareIcon } from './ArrowUpRightFromSquareIcon'
import { BoltIcon } from './BoltIcon'
import { BookIcon } from './BookIcon'
import { BullsEyeIcon } from './BullsEyeIcon'
import { CaretIcon } from './CaretIcon'
import { CaretUpIcon } from './CaretUpIcon'
import { CircleCheckIcon } from './CircleCheckIcon'
import { ChevronRightIcon } from './ChevronRightIcon'
import { CogsIcon } from './Cogs'
import { CommentIcon } from './CommentIcon'
import { CommentingIcon } from './CommentingIcon'
import { CubeIcon } from './CubeIcon'
import { DatabaseIcon } from './DatabaseIcon'
import { DownloadIcon } from './DownloadIcon'
import { FileArchiveIcon } from './FileArchive'
import { FileIcon } from './FileIcon'
import { FileZipIcon } from './FileZipIcon'
import { FolderIcon } from './FolderIcon'
import { FolderOpenIcon } from './FolderOpenIcon'
import { FortIcon } from './FortIcon'
import { GSRSIcon } from './GSRSIcon'
import { GlobeIcon } from './GlobeIcon'
import { HeartSolidIcon, HeartOutlineIcon } from './HeartIcon'
import { HistoryIcon } from './HistoryIcon'
import { HomeIcon } from './HomeIcon'
import { InfoCircleIcon } from './InfoCircleIcon'
import { LockIcon } from './LockIcon'
import { InstitutionIcon } from './InstitutionIcon'
import { ObjectGroupIcon } from './ObjectGroupIcon'
import { PlusIcon } from './PlusIcon'
import { ProfileIcon } from './ProfileIcon'
import { QuestionIcon } from './QuestionIcon'
import { StarIcon } from './StarIcon'
import { StickyNoteIcon } from './StickyNote'
import { Svg } from './Svg'
import { SyncIcon } from './SyncIcon'
import { TaskIcon } from './TaskIcon'
import { TrashIcon } from './TrashIcon'
import { TrophyIcon } from './TrophyIcon'

export const IconNames = {
'AngleDownIcon': AngleDownIcon,
'AreaChartIcon': AreaChartIcon,
'ArrowIcon': ArrowIcon,
'ArrowLeftIcon': ArrowLeftIcon,
'ArrowUpRightFromSquareIcon': ArrowUpRightFromSquareIcon,
'BoltIcon': BoltIcon,
'BookIcon': BookIcon,
'BullsEyeIcon': BullsEyeIcon,
'CaretIcon': CaretIcon,
'CaretUpIcon': CaretUpIcon,
'CircleCheckIcon': CircleCheckIcon,
'ChevronRightIcon': ChevronRightIcon,
'CogsIcon': CogsIcon,
'CommentIcon': CommentIcon,
'CommentingIcon': CommentingIcon,
'CubeIcon': CubeIcon,
'DatabaseIcon': DatabaseIcon,
'DownloadIcon': DownloadIcon,
'FileArchive': FileArchiveIcon,
'FileIcon': FileIcon,
'FileZipIcon': FileZipIcon,
'FolderIcon': FolderIcon,
'FolderOpenIcon': FolderOpenIcon,
'FortIcon': FortIcon,
'GlobeIcon': GlobeIcon,
'GSRSIcon': GSRSIcon,
'HeartSolidIcon': HeartSolidIcon,
'HeartOutlineIcon': HeartOutlineIcon,
'HistoryIcon': HistoryIcon,
'HomeIcon': HomeIcon,
'LockIcon': LockIcon,
'InfoCircleIcon': InfoCircleIcon,
'InstitutionIcon': InstitutionIcon,
'ObjectGroupIcon': ObjectGroupIcon,
'PlusIcon': PlusIcon,
'ProfileIcon': ProfileIcon,
'QuestionIcon': QuestionIcon,
'StarIcon': StarIcon,
'StickyNoteIcon': StickyNoteIcon,
'Svg': Svg,
'SyncIcon': SyncIcon,
'TaskIcon': TaskIcon,
'TrashIcon': TrashIcon,
'TrophyIcon': TrophyIcon,
}

export type IconType = keyof typeof IconNames

export const Icon = ({ name, ...props }: { name?: IconType, width?: number, height?: number }) => {
  // @ts-ignore
  const icon = IconNames[name]
  if (!icon) {
    throw new Error(`Icon with name ${name} does not exist`);
  }else{
    return icon as JSX.Element
  }
}
