import React from 'react'
import { Link } from 'react-router-dom'

import Icon from '../../components/Icon'
import '../../components/Space/Activation/style.sass'
import DefaultLayout from '../../layouts/DefaultLayout'
import Button from '../../components/Button'


const SpaceLockedPage = () => (
  <DefaultLayout>
    <div className="space-activation">
      <div className="activation">
        <div className="activation__info">
          <Icon cssClasses="activation__icon" icon="fa-lock" />
          <div className="activation__label">
            <div className="activation__big">
              The space is locked.
            </div>
          </div>
        </div>
        <Link to="/spaces">
          <Button size="lg" type="primary">To Spaces List</Button>
        </Link>
      </div>
    </div>
  </DefaultLayout>
)

export default SpaceLockedPage
