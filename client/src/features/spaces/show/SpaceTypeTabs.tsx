import React from 'react'
import { Link } from 'react-router-dom'
import { ISpace } from '../spaces.types'
import { Tab, Tabs } from './styles'


export const SpaceTypeTabs = ({ space }: { space: ISpace }) => (
    <Tabs>
      {space.private_space_id && (
        <>
          <Tab
            as={Link}
            to={`/spaces/${space.private_space_id}`}
            $isactive={undefined}
          >
            Private Area
          </Tab>
          <Tab
            as={Link}
            to={`/spaces/${space.id}`}
            $isactive="true"
          >
            Shared Area
          </Tab>
        </>
      )}
      {space.shared_space_id && (
        <>
          <Tab
            as={Link}
            to={`/spaces/${space.id}`}
            $isactive="true"
          >
            Private Area
          </Tab>
          <Tab
            as={Link}
            to={`/spaces/${space.shared_space_id}`}
            $isactive={undefined}
          >
            Shared Area
          </Tab>
        </>
      )}
      {space.type === 'review' && !space.shared_space_id && !space.private_space_id && (
        <Tab
          as={Link}
          to={`/spaces/${space.id}`}
          $isactive="true"
        >
          Shared Area
        </Tab>
      )}
      {space.type === 'private_type' && (
        <Tab
          as={Link}
          to={`/spaces/${space.id}`}
          $isactive="true"
        >
          Private Area
        </Tab>
      )}
      {space.type === 'groups' && (
        <Tab
          $isactive="true"
        >
          Shared Area
        </Tab>
      )}
    </Tabs>
  )
