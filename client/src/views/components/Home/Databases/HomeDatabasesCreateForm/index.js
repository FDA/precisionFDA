import React, { useLayoutEffect, useState, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Select from 'react-select'

import TextField from '../../../FormComponents/TextField'
import './style.sass'
import DatabaseTypeSwitch from '../../Databases/HomeDatabasesCreateForm/DatabaseTypeSwitch'
import {
  HOME_DATABASE_ENGINE_TYPES,
  HOME_DATABASE_MYSQL_INSTANCE_VERSIONS,
  HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS,
  HOME_DATABASE_LABELS,
  HOME_DATABASE_INSTANCES,
  HOME_DATABASE_PASSWORD,
} from '../../../../../constants'
import { ButtonSolidBlue, Button } from '../../../../../components/Button'
import { createDatabase } from '../../../../../actions/home'
import { fetchAccessibleFiles } from '../../../../../actions/spaces/files'
import { AccessibleFileShape } from '../../../../shapes/AccessibleObjectsShape'
import { spaceAccessibleFilesSelector } from '../../../../../reducers/spaces/space/selectors'
import { showAlertAboveAllWarning } from '../../../../../actions/alertNotifications'


const HomeNewDatabaseCreateForm = ({
  onCreateClick,
  errors,
  accessibleFiles = [],
  fetchAccessibleFiles,
  showPasswordAlert,
}) => {
  const [formDataInput, setFormDataInput] = useState(
    {
      name: '',
      description: '',
      engine: '', // database types: aurora-mysql, aurora-postgresql
      adminPassword: '',
      ddl_file_uid: '',
      dxInstanceClass: '',
      tags: [],
      engineVersion: '',
    },
  )

  const [fileNameSelected, setFileNameSelected] = useState('Select')
  const [versionNameSelected, setVersionNameSelected] = useState('Select')
  const [instanceNameSelected, setInstanceNameSelected] = useState('Select')
  const [retypedPassword, setRetypedPassword] = useState('')

  const refFilesSelection = useRef(null)
  const refInstancesSelection = useRef(null)
  const refVersionsSelection = useRef(null)

  const history = useHistory()

  useLayoutEffect(() => { fetchAccessibleFiles() }, [])

  // for files Select
  const filesOptions =  accessibleFiles.filter(file => file.scope !== 'public').map(file => ({
    value: file.name,
    label: file.name,
    uid: file.uid,
  }))

  const setNameOptionFile = (fileNameOptionSelected) => {
    if (fileNameOptionSelected) {
      setFormDataInput({ ...formDataInput, ddl_file_uid: fileNameOptionSelected.uid })
      setFileNameSelected(fileNameOptionSelected.value)
    } else {
      setFormDataInput({ ...formDataInput, ddl_file_uid: '' })
      setFileNameSelected('')
    }
  }

  const allowedTypes = [HOME_DATABASE_LABELS[HOME_DATABASE_ENGINE_TYPES['MySQL']], HOME_DATABASE_LABELS[HOME_DATABASE_ENGINE_TYPES['PostgreSQL']]]
  const setInstanceSelect = (instance) => {
    refVersionsSelection.current.select.clearValue() // clear version Select
    setInstanceNameSelected(instance)
    if (instance) {
      setFormDataInput({ ...formDataInput, dxInstanceClass: instance.value, engineVersion: '' })
      if (versionNameSelected) {
        setVersionNameSelected('')
      }
    } else {
      setFormDataInput({ ...formDataInput, dxInstanceClass: '', engineVersion: '' })
      setInstanceNameSelected('')
    }
  }

  const setVersionSelect = (version) => {
    setVersionNameSelected(version)
    if (version) {
      setFormDataInput({ ...formDataInput, engineVersion: version.value })
    } else {
      setFormDataInput({ ...formDataInput, engineVersion: '' })
      setVersionNameSelected('')
    }
  }

  const checkDisabledInstances = () => { return !(formDataInput.engine ) }

  const instancesOptions = [
    {
      value: HOME_DATABASE_INSTANCES.DB_STD1_X2,
      label: HOME_DATABASE_LABELS['db_std1_x2'],
      isDisabled: checkDisabledInstances(),
    },
    {
      value: HOME_DATABASE_INSTANCES.DB_MEM1_X2,
      label: HOME_DATABASE_LABELS['db_mem1_x2'],
      isDisabled: checkDisabledInstances(),
    },
    {
      value: HOME_DATABASE_INSTANCES.DB_MEM1_X4,
      label: HOME_DATABASE_LABELS['db_mem1_x4'],
      isDisabled: checkDisabledInstances(),
    },
    {
      value: HOME_DATABASE_INSTANCES.DB_MEM1_X8,
      label: HOME_DATABASE_LABELS['db_mem1_x8'],
      isDisabled: checkDisabledInstances(),
    },
    {
      value: HOME_DATABASE_INSTANCES.DB_MEM1_X16,
      label: HOME_DATABASE_LABELS['db_mem1_x16'],
      isDisabled: checkDisabledInstances(),
    },
    {
      value: HOME_DATABASE_INSTANCES.DB_MEM1_X32,
      label: HOME_DATABASE_LABELS['db_mem1_x32'],
      isDisabled: checkDisabledInstances(),
    },
    {
      value: HOME_DATABASE_INSTANCES.DB_MEM1_X48,
      label: HOME_DATABASE_LABELS['db_mem1_x48'],
      isDisabled: checkDisabledInstances(),
    },
    {
      value: HOME_DATABASE_INSTANCES.DB_MEM1_X64,
      label: HOME_DATABASE_LABELS['db_mem1_x64'],
      isDisabled: checkDisabledInstances(),
    },
  ]

  const hideMysqlVersions = () => { return formDataInput.engine === HOME_DATABASE_ENGINE_TYPES['PostgreSQL'] }
  const hidePgVersions = () => { return formDataInput.engine === HOME_DATABASE_ENGINE_TYPES['MySQL'] }

  const restrictedPgInstances = [
    HOME_DATABASE_INSTANCES.DB_STD1_X2,
    HOME_DATABASE_INSTANCES.DB_MEM1_X2,
    HOME_DATABASE_INSTANCES.DB_MEM1_X4,
    HOME_DATABASE_INSTANCES.DB_MEM1_X8,
    HOME_DATABASE_INSTANCES.DB_MEM1_X16,
    HOME_DATABASE_INSTANCES.DB_MEM1_X48,
  ]

  const hidePgVersionsForSomeInstances = () => { return restrictedPgInstances.includes(formDataInput.dxInstanceClass) }
  const checkDisabledVersions = () => { return !(formDataInput.dxInstanceClass && formDataInput.engine) }

  const versionsOptions = [
    {
      value: HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_5_7_12,
      label: HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_5_7_12,
      isDisabled: checkDisabledVersions() || hideMysqlVersions(),
    },
    {
      value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_16,
      label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_16,
      isDisabled: checkDisabledVersions() || hidePgVersions() || hidePgVersionsForSomeInstances(),
    },
    {
      value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_17,
      label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_17,
      isDisabled: checkDisabledVersions() || hidePgVersions() || hidePgVersionsForSomeInstances(),
    },
    {
      value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_18,
      label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_18,
      hide: hidePgVersions() || hidePgVersionsForSomeInstances(),
      isDisabled: checkDisabledVersions() || hidePgVersions() || hidePgVersionsForSomeInstances(),
    },
    {
      value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_19,
      label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_19,
      isDisabled: checkDisabledVersions() || hidePgVersions() || hidePgVersionsForSomeInstances(),
    },
    {
      value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_11,
      label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_11,
      isDisabled: checkDisabledVersions() || hidePgVersions(),
    },
    {
      value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_12,
      label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_12,
      isDisabled: checkDisabledVersions() || hidePgVersions(),
    },
    {
      value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_13,
      label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_13,
      isDisabled: checkDisabledVersions() || hidePgVersions(),
    },
    {
      value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_14,
      label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_14,
      isDisabled: checkDisabledVersions() || hidePgVersions(),
    },
  ]

  const disableOnPasswordInvalid = formDataInput.adminPassword === '' || retypedPassword === '' ||
    formDataInput.adminPassword.length < HOME_DATABASE_PASSWORD.MIN_LENGTH

  const disableCreateButton = formDataInput.name === '' || formDataInput.engine === '' ||
    formDataInput.dxInstanceClass === '' || formDataInput.engineVersion === '' ||
    disableOnPasswordInvalid

  const disableCancelButton = false

  const fieldChangeHandler = (e) => {
    const { currentTarget } = e
    setFormDataInput({ ...formDataInput, [currentTarget.name]: currentTarget.value }) }

  const resetDatabaseCreation = () => {
    clearSelectionsValues() // for all Selects
    setFormDataInput({
      name: '',
      description: '',
      engine: '',
      adminPassword: '',
      ddl_file_uid: '',
      dxInstanceClass: '',
      tags: [],
      engineVersion: '',
    })
    setFileNameSelected('')
    setRetypedPassword('')

    let state = { ...history.location.state }
    history.replace({ ...history.location, state })
  }

  const createClickHandler = () => {
    if (checkPasswords()) { onCreateClick(formDataInput) }
  }

  const setEngine = (e) => {
    refVersionsSelection.current.select.clearValue()
    setVersionNameSelected('') // for Select version
    refInstancesSelection.current.select.clearValue()
    setInstanceNameSelected('') // for Select instance
    const { currentTarget } = e
    setFormDataInput({
      ...formDataInput,
      [currentTarget.name]: currentTarget.value,
      dxInstanceClass: '',
      engineVersion: '',
    })
  }

  const typePassword = (e) => {
    const { currentTarget } = e
    setFormDataInput({ ...formDataInput, [currentTarget.name]: currentTarget.value })
  }
  const retypePassword = (e) => {
    const { currentTarget } = e
    setRetypedPassword(currentTarget.value)
  }
  const checkPasswords = () => {
    if (retypedPassword !== formDataInput.adminPassword) {
      setRetypedPassword('')
      setFormDataInput({ ...formDataInput, adminPassword: '' })
      showPasswordAlert()
      return false
    } else {
      return true
    }
  }

  // clear all Selects
  const clearSelectionsValues = () => {
    refFilesSelection.current.select.clearValue()
    refVersionsSelection.current.select.clearValue()
    refInstancesSelection.current.select.clearValue()
  }

  return (
    <div className='form new-database-form'>
      <div className='form new-database-form__container'>
        <div className="form-group">
          <TextField
            name="name"
            label="Name (required):"
            value={formDataInput.name}
            status={errors.name && 'error'}
            helpText={errors.name && errors.name[0]}
            onChange={fieldChangeHandler}
          />
          <TextField
            name="description"
            label="Description:"
            value={formDataInput.description}
            helpText={errors.description && errors.description[0]}
            status={errors.description && 'error'}
            onChange={fieldChangeHandler}
          />
          <div className="form-group__inLine-group">
            <label className="control-label">DB SQL file:</label>
            <div className="group_selection">
              <div className="file-selection">
                <Select
                  inputId = "select-input"
                  ref={refFilesSelection}
                  name={fileNameSelected}
                  isSearchable={true}
                  options={filesOptions}
                  defaultValue={{ label: 'Select...', value: 0 }}
                  onChange={setNameOptionFile}
                  className="file-selection"
                  isClearable={true}
                />
              </div>
            </div>
          </div>
          <hr/>
          <div className="password-input">
            <TextField
              name="adminPassword"
              type="password"
              label="DB admin password (required) "
              value={formDataInput.adminPassword}
              status={errors.adminPassword && 'error'}
              onChange={typePassword}
              helpText="This password must be at least 8 characters in length and is not changeable once set"
            />
            <TextField
              name="adminPasswordRetype"
              type="password"
              label="Retype DB admin password (required):"
              value={retypedPassword}
              onChange={retypePassword}
            />
          </div>
        </div>

        <div className="form-group__instance-group">
          <label className="control-label">Database type (required):</label>
          <div className="database-type-and-version-container">
            <div className="database-type-container">
              <div className="database-type-container__switch_container">
                {allowedTypes.map((type) => {
                  return (
                    <DatabaseTypeSwitch
                      key={type}
                      label={type}
                      name="engine"
                      checked={formDataInput.engine === HOME_DATABASE_ENGINE_TYPES[type]}
                      value={HOME_DATABASE_ENGINE_TYPES[type]}
                      onChange={setEngine}
                    />
                  )},
                )}
              </div>
            </div>

            <div className="form-group__inLine-group">
              <label className="control-label">Instance (required):</label>
              <div className="group_selection">
                <Select
                  ref={refInstancesSelection}
                  name={instanceNameSelected}
                  isSearchable={true}
                  options={instancesOptions}
                  onChange={setInstanceSelect}
                  defaultValue={{ label: 'Select...', value: 0 }}
                  hideSelectedOptions={true}
                  isClearable={true}
                />

              </div>
            </div>

            <div className="form-group__inLine-group">
              <label className="control-label">Version (required):</label>
              <div className="group_selection">
                <Select
                  ref={refVersionsSelection}
                  name={versionNameSelected}
                  isSearchable={true}
                  options={versionsOptions}
                  onChange={setVersionSelect}
                  defaultValue={{ label: 'Select...', value: 0 }}
                  hideSelectedOptions={true}
                  isClearable={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr/>
      <div className="form-group__inLine-group">
        <ButtonSolidBlue onClick={createClickHandler} disabled={disableCreateButton}>Create Database</ButtonSolidBlue>
        <div className="group_selection">
          <Button onClick={resetDatabaseCreation} disabled={disableCancelButton}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

HomeNewDatabaseCreateForm.propTypes = {
  accessibleFiles: PropTypes.arrayOf(PropTypes.exact(AccessibleFileShape)),
  fetchFiles: PropTypes.func,
  fetchAccessibleFiles: PropTypes.func,
  showPasswordAlert: PropTypes.func,
  currentTab: PropTypes.string,
  onCreateClick: PropTypes.func.isRequired,
  page: PropTypes.string,
  errors: PropTypes.object,
}

HomeNewDatabaseCreateForm.defaultProps = {
  errors: {},
  page: 'private',
}

const mapStateToProps = (state) => ({
  accessibleFiles: spaceAccessibleFilesSelector(state),
})

const mapDispatchToProps = (dispatch) => ({
  fetchAccessibleFiles: () => dispatch(fetchAccessibleFiles()),
  onCreateClick: (db_cluster) => { dispatch(createDatabase('/api/dbclusters', db_cluster)) },
  showPasswordAlert: () => dispatch(showAlertAboveAllWarning({ message: 'Passwords don\'t match' })),
})

export const HomeDatabasesCreateForm = connect(mapStateToProps, mapDispatchToProps)(HomeNewDatabaseCreateForm)
