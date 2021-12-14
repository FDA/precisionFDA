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
import { DropdownMenu } from '../../../DropdownMenu'
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

  // In progress
  // eslint-disable-next-line no-unused-vars
  // const [optionsVersions, setOptionsVersions] = useState([]) // for updated options for versions Select
  const [fileNameSelected, setFileNameSelected] = useState('Select')
  // const [versionNameSelected, setVersionNameSelected] = useState('Select')

  const [retypedPassword, setRetypedPassword] = useState('')
  const refFilesSelection = useRef(null)
  // const refInstancesSelection = useRef(null) // instance Select should be added
  // const refVersionsSelection = useRef(null)

  const history = useHistory()
  // in progress
  // eslint-disable-next-line no-unused-vars
  // let filteredOptions

  useLayoutEffect(() => {
    fetchAccessibleFiles()
    // filterOptions() // for Select options updates (for hiding)
  }, [])

  // for Select
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
  const setEngineVersion = (version) => {
    setFormDataInput({ ...formDataInput, engineVersion: version }) // for Dropdown
  }

  //  for Select
  // const setEngineVersionSelect = (version) => {
  //   setVersionNameSelected(version)
  //   if (version) {
  //     setFormDataInput({ ...formDataInput, engineVersion: version.value })
  //   } else {
  //     setFormDataInput({ ...formDataInput, engineVersion: '' })
  //     setVersionNameSelected('')
  //   }
  // }

  const checkDisabledInstances = () => { return !(formDataInput.engine) }
  const hideForPG = () => {
    return formDataInput.engine === HOME_DATABASE_ENGINE_TYPES['PostgreSQL']
  }
  const hideForMysql = () => {
    return formDataInput.engine === HOME_DATABASE_ENGINE_TYPES['MySQL']
  }

  const availableInstances = [
    {
      text: HOME_DATABASE_LABELS['db_std1_x1'],
      hide: hideForPG(),
      isDisabled: checkDisabledInstances(),
      onClick: () => setInstance(HOME_DATABASE_INSTANCES.DB_STD1_X1),
    },
    {
      text: HOME_DATABASE_LABELS['db_std1_x2'],
      isDisabled: checkDisabledInstances(),
      onClick: () => setInstance(HOME_DATABASE_INSTANCES.DB_STD1_X2),
    },
    {
      text: HOME_DATABASE_LABELS['db_mem1_x2'],
      isDisabled: checkDisabledInstances(),
      onClick: () => setInstance(HOME_DATABASE_INSTANCES.DB_MEM1_X2),
    },
    {
      text: HOME_DATABASE_LABELS['db_mem1_x4'],
      isDisabled: checkDisabledInstances(),
      onClick: () => setInstance(HOME_DATABASE_INSTANCES.DB_MEM1_X4),
    },
    {
      text: HOME_DATABASE_LABELS['db_mem1_x8'],
      isDisabled: checkDisabledInstances(),
      onClick: () => setInstance(HOME_DATABASE_INSTANCES.DB_MEM1_X8),
    },
    {
      text: HOME_DATABASE_LABELS['db_mem1_x16'],
      isDisabled: checkDisabledInstances(),
      onClick: () => setInstance(HOME_DATABASE_INSTANCES.DB_MEM1_X16),
    },
    {
      text: HOME_DATABASE_LABELS['db_mem1_x32'],
      isDisabled: checkDisabledInstances(),
      onClick: () => setInstance(HOME_DATABASE_INSTANCES.DB_MEM1_X32),
    },
    {
      text: HOME_DATABASE_LABELS['db_mem1_x48'],
      isDisabled: checkDisabledInstances(),
      onClick: () => setInstance(HOME_DATABASE_INSTANCES.DB_MEM1_X48),
    },
    {
      text: HOME_DATABASE_LABELS['db_mem1_x64'],
      isDisabled: checkDisabledInstances(),
      onClick: () => setInstance(HOME_DATABASE_INSTANCES.DB_MEM1_X64),
    },
    {
      text: HOME_DATABASE_LABELS['db_mem1_x96'],
      hide: hideForMysql(),
      isDisabled: checkDisabledInstances(),
      onClick: () => setInstance(HOME_DATABASE_INSTANCES.DB_MEM1_X96),
    },
  ]

  const hideMysqlVersions = () => {
    return formDataInput.engine === HOME_DATABASE_ENGINE_TYPES['PostgreSQL']
  }

  const hidePgVersions = () => {
    return formDataInput.engine === HOME_DATABASE_ENGINE_TYPES['MySQL']
  }

  const restrictedPgInstances = [
    HOME_DATABASE_INSTANCES.DB_STD1_X2,
    HOME_DATABASE_INSTANCES.DB_MEM1_X2,
    HOME_DATABASE_INSTANCES.DB_MEM1_X4,
    HOME_DATABASE_INSTANCES.DB_MEM1_X8,
    HOME_DATABASE_INSTANCES.DB_MEM1_X16,
    HOME_DATABASE_INSTANCES.DB_MEM1_X48,
    HOME_DATABASE_INSTANCES.DB_MEM1_X96,
  ]

  const hidePgVersionsForSomeInstances = () => {
    return restrictedPgInstances.includes(formDataInput.dxInstanceClass)
  }

  const checkDisabledVersions = () => {
    return !(formDataInput.dxInstanceClass && formDataInput.engine)
  }

  const availableVersions = [
    {
      text: HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_5_7_12,
      hide: hideMysqlVersions(),
      isDisabled: checkDisabledVersions(),
      onClick: () => setEngineVersion(HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_5_7_12),
    },
    {
      text: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_16,
      hide: hidePgVersions() || hidePgVersionsForSomeInstances(),
      isDisabled: checkDisabledVersions(),
      onClick: () => setEngineVersion(HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_16),
    },
    {
      text: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_17,
      hide: hidePgVersions() || hidePgVersionsForSomeInstances(),
      isDisabled: checkDisabledVersions(),
      onClick: () => setEngineVersion(HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_17),
    },
    {
      text: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_18,
      hide: hidePgVersions() || hidePgVersionsForSomeInstances(),
      isDisabled: checkDisabledVersions(),
      onClick: () => setEngineVersion(HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_18),
    },
    {
      text: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_19,
      hide: hidePgVersions() || hidePgVersionsForSomeInstances(),
      isDisabled: checkDisabledVersions(),
      onClick: () => setEngineVersion(HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_19),
    },
    {
      text: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_11,
      hide: hidePgVersions(),
      isDisabled: checkDisabledVersions(),
      onClick: () => setEngineVersion(HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_11),
    },
    {
      text: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_12,
      hide: hidePgVersions(),
      isDisabled: checkDisabledVersions(),
      onClick: () => setEngineVersion(HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_12),
    },
    {
      text: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_13,
      hide: hidePgVersions(),
      isDisabled: checkDisabledVersions(),
      onClick: () => setEngineVersion(HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_13),
    },
    {
      text: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_14,
      hide: hidePgVersions(),
      isDisabled: checkDisabledVersions(),
      onClick: () => setEngineVersion(HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_14),
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

  let titleInstance = 'Select...'
  if (formDataInput.dxInstanceClass) { titleInstance = HOME_DATABASE_LABELS[formDataInput.dxInstanceClass] }

  let titleVersion = 'Select...'
  if (formDataInput.engineVersion) { titleVersion = formDataInput.engineVersion }

  const createClickHandler = () => {
    if (checkPasswords()) { onCreateClick(formDataInput) }
  }

  const setEngine = (e) => {
    // refVersionsSelection.current.select.clearValue() setVersionNameSelected
    // setVersionNameSelected('') // for Select
    const { currentTarget } = e
    setFormDataInput({ ...formDataInput, [currentTarget.name]: currentTarget.value, dxInstanceClass: '', engineVersion: '' })
  }

  const setInstance = (instance) => {
    setFormDataInput({ ...formDataInput, dxInstanceClass: instance, engineVersion: '' })
  }

  // options for Selects
  // const versionOptions = [
  //   {
  //     value: HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_5_7_12,
  //     label: HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_5_7_12,
  //     hide: hideMysqlVersions(),  // does not work
  //     // isSelected: hideMysqlVersions(), // does not work
  //     isDisabled: checkDisabledVersions(),
  //     onClick: () => setEngineVersionSelect(HOME_DATABASE_MYSQL_INSTANCE_VERSIONS.V_5_7_12),
  //   },
  //   {
  //     value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_16,
  //     label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_16,
  //     hide: hidePgVersions() || hidePgVersionsForSomeInstances(),  // does not work
  //     // isSelected: hidePgVersions() || hidePgVersionsForSomeInstances(),
  //     // isOptionDisabled: hidePgVersions() || hidePgVersionsForSomeInstances(),
  //     isDisabled: checkDisabledVersions(),
  //     onClick: () => setEngineVersionSelect(HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_9_6_16),
  //   },
  //   {
  //     value: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_11,
  //     label: HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_11,
  //     hide: hidePgVersions(), // does not work
  //     isDisabled: checkDisabledVersions(),
  //     onClick: () => setEngineVersionSelect(HOME_DATABASE_POSTGRESQL_INSTANCE_VERSIONS.V_10_11),
  //   },
  // ]

  // for Select options updates
  // const filterOptions = () => {
  //   filteredOptions = availableVersionsSelect.filter(option => option.hide === false)
  //   // setOptionsVersions(availableVersionsSelect.filter(option => option.hide === false)) // filteredOptions)
  // }

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

  const clearSelectionsValues = () => {
    refFilesSelection.current.select.clearValue()     // clear files Select
    // refVersionsSelection.current.select.clearValue()  // clear versions Select
    // instance Select should be added
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
                <DropdownMenu
                  title={titleInstance}
                  page='create'
                  options={availableInstances}
                />
              </div>
            </div>

            <div className="form-group__inLine-group">
              <label className="control-label">Version (required):</label>
              <div className="group_selection">
                <DropdownMenu
                  page='create'
                  title={titleVersion}
                  options={availableVersions}
                />
                {/*<Select*/}
                {/*  ref={refVersionsSelection}*/}
                {/*  name={versionNameSelected}*/}
                {/*  isSearchable={false}*/}
                {/*  options={versionOptions}*/}
                {/*  onChange={setEngineVersionSelect}*/}
                {/*  defaultValue={{ label: 'Select...', value: 0 }}*/}
                {/*  hideSelectedOptions={true}*/}
                {/*  // styles={colourStyles}*/}
                {/*  // className="file-selection"*/}
                {/*/>*/}
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
