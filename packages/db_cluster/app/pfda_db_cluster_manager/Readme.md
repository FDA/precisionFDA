<!-- dx-header -->
# pfda_db_cluster_manager (DNAnexus Platform App)

pfda_db_cluster_manager

This is the source code for an app that runs on the DNAnexus Platform.
For more information about how to run or modify it, see
https://documentation.dnanexus.com/.


## Description
The app is used to synchronize the access data of users and their roles in the DBcluster based on the space memberships. Currently supports MySQL and PostgreSQL database engines.

### Input
The whole app input is encrypted. Before encryption it's structure is as follows:

```json
"encrypted_input_json": {
    "db_cluster_id": "dbcluster-xxxx",
    "db_cluster_admin_username": "<ADMIN_USERNAME>",
    "db_cluster_admin_password": "<GENERATED_ADMIN_PASSWORD>",
    "users_mapping": [
      {
        "username": "<username>",
        "psw": "<password>",
        "role": "viewer" || "contributor",
      },
    ],
  }
```

NOTE: DBcluster admin password is generated on backend and stored in the pfda database when DBcluster is created.
### Lifecycle
The app is run when:
* DBcluster first becomes `Available` after it's created
* DBcluster becomes `Available` after it's restarted
* Space membership is changed (invite, role change) - app run for each DBcluster in the space
 
### Roles
There are only two user roles available in the DBcluster:
* `viewer` - read-only role, should have only `SELECT` privileges on `public` schema.
* `contributor` - read and write role, should have almost all privileges (read/write) on `public` schema.

The pfda member roles are mapped as follows:
* `lead`, `contributor`, `admin` == `contributor` role in DBcluster
* `viewer` == `viewer`

If the user has `disabled` status, it won't be added or it will be removed from DBcluster.

### More info:
* Document - https://docs.google.com/document/d/1fDZQ1E1jGhC1jLVWP6UXkXvabfcMNpPtyDJ7RE-ZakU/edit?tab=t.0#heading=h.z4ncm8e5g8ii
* JIRA - https://jira.internal.dnanexus.com/browse/PFDA-4787

## Changelog

#### 0.0.1
* Initial release
