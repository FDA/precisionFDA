import React from 'react'
import { useScrollToHash } from '../../../hooks/useScrollToHash'
import { DocBody, VideoWrapper } from '../styles'
import { videos } from '../videos'

export const VideoTutorials = () => {
  useScrollToHash()
  return (
    <DocBody>
      <h1>Video Tutorials</h1>

      {videos.map(video => (
        <React.Fragment key={video.url}>
          <h2>{video.title}</h2>
          <VideoWrapper>
            <iframe
              title={video.title}
              width="600"
              height="300"
              src={video.url}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </VideoWrapper>
        </React.Fragment>
      ))}
    </DocBody>
  )
}
