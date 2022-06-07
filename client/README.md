# PFDA Client App
This is the main webapp for the PFDA project.


Just some of the libraries used.
- typescript
- react
- styled-components
- webpack
- storybook
- react-query
- react-hook-form


## DEV Installation
1. `yarn install`
2. `yarn start:dev`
3. open `https://localhost:4000`


## Storybook
1. `yarn storybook`

# Remote API Server
A development instance of the PFDA application runs here [https://precisionfda-dev.dnanexus.com](https://precisionfda-dev.dnanexus.com) (behind VPN). All API requests that fall under `/logout /return_from_login /login /api /assets /admin` will get proxied to the remote API.

To start developing:
1. `yarn install`
2. edit `webpack.development.config.js` and set the TARGET variable to the remote server `https://precisionfda-dev.dnanexus.com`.
3. `yarn start:dev`
4. open `https://localhost:4000`
5. login
6. The redirect address is incorrect and needs to be manually change in the URL from `https://localhost/return_from_login?code=`, `https://localhost:4000/return_from_login?code=`
7. The next redirect is incorrect and needs to be manually changed in the URL from `https://localhost/`, `https://localhost:4000/`