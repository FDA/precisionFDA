import React, { FunctionComponent } from 'react'


interface IChallengeResults {
  challenge: any,
}

export const ChallengeResults : FunctionComponent<IChallengeResults> = ({ challenge }) => {
  if (!challenge || !challenge.meta || !challenge.meta.regions) {
    return <div></div>
  }

  let resultsContent = ''

  // challenge.meta contains the body/content of the challenge details
  // This is structured as a dict as such:
  // { 'regions' : {
  //     'intro': "This is the introduction section of a challenge",
  //     'results': "Populated by challenge admin for the results section",
  //     'results-details': "The results area is separated into two sections",
  // }}
  //
  // Here, we combine the 'results' and 'results-details' sections
  //
  Object.keys(challenge.meta.regions).forEach(function(key) {
    const value = challenge.meta.regions[key]
    if (key.startsWith('results')) {
      resultsContent += value
    }
  })

  return (
    <div className="challenge-details-content" dangerouslySetInnerHTML={{ __html: resultsContent }}></div>
  )
}

export default ChallengeResults
