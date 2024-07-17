import React from 'react'
import styled from 'styled-components'
import {
    PageContainerMargin,
} from '../../components/Page/styles'
import { useAuthUser } from '../../features/auth/useAuthUser'
import NavigationBar from '../../components/NavigationBar/NavigationBar'
import PublicLayout from '../../layouts/PublicLayout'

const StyledSecurity = styled.div`
  line-height: 22px;
  padding-top: 32px;
  padding-bottom: 32px;
`

const Security = () => {
    const user = useAuthUser()
    return (
        <PublicLayout mainScroll>
            <NavigationBar
                title="Security of precisionFDA"
                subtitle=""
                user={user}
            />
            <PageContainerMargin>
                <StyledSecurity>
                    <h1>Security Statement</h1>
                    <p>Last modified: April 27, 2023</p>
                    <hr />
                    <p>
                        This Portal and Platform have a FISMA "Moderate" authorization to operate as granted by the FDA.
                        This FISMA moderate authorization is dependent on DNAnexus' FedRAMP "Moderate" authorization
                        to operate under the sponsorship of HHS as documented <a href="https://marketplace.fedramp.gov/products/FR1814557199" target="_blank">here</a>.
                        The FISMA Moderate authorization enables you and your collaborators to securely manage data
                        containing sensitive information such as PHI and PII within the constraints of any data use agreements.
                        <br/>
                        Be aware that trade secret and commercial confidential information such as
                        detailed product quality information (e.g. formulations with amounts) is risk-categorized
                        under FISMA as High and thus should NOT be managed by FDA staff or contractors on precisionFDA.
                        Always consult the relevant Security authorities for official guidance relevant to your use case.
                    </p>
                </StyledSecurity>
            </PageContainerMargin>
        </PublicLayout>
    )
}

export default Security
