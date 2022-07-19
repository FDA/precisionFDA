import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames/bind'

import { IExpert } from '../../../../types/expert'
import Button from '../../Button'
import { format } from 'date-fns'
import { getSpacesIcon } from '../../../../helpers/spaces'
import Icon from '../../Icon'
import './style.sass'

type ExpertsListItemProps = {
  expert: IExpert
  userCanEdit: boolean
}

class ExpertsListItem extends Component<ExpertsListItemProps> {}

// ExpertsListItemBlogEntry - Used in /experts as the main list
class ExpertsListItemBlogEntry extends ExpertsListItem {
  render() {
    const expert = this.props.expert
    const userCanEdit = this.props.userCanEdit
    const classes = classNames('experts-list-item')
    return (
      <div className={classes}>
        <div className="experts-list-item__left-column">
          <img
            className="expert-image img-circle"
            src={expert.image}
            alt={`Profile icon for ${expert.title}'s blog`}
          />
        </div>
        <div className="experts-list-item__right-column experts-item-content">
          <h1>{expert.blogTitle}</h1>
          <div style={{ marginTop: '4px' }}>
            <span className="expert-name">{expert.title}</span>
            <span className="expert-date">
              {format(expert.createdAt, 'MMM dd, yyyy')}
            </span>
          </div>
          <p>{expert.blogPreview}</p>
          <div
            className="experts-list-item__buttons pull-left"
            style={{ marginTop: '6px' }}
          >
            <Button
              className=""
              size="md"
              type="default"
              onClick={() => window.location.assign(`/experts/${expert.id}/qa`)}
            >
              Expert Q&amp;A
            </Button>
            <Link to={`/experts/${expert.id}`}>
              <Icon icon={getSpacesIcon('experts')} fw />
              <span aria-label={`Click to view more information about ${expert.title}`}>About This Expert</span>
            </Link>
            <Link to={`/experts/${expert.id}/blog`}>
              <span aria-label={`Click to read ${expert.title}'s blog post`}>Read Expert Blog Post &#x2197;</span>
            </Link>
          </div>
          {userCanEdit && (
            <div className="btn-group pull-right" style={{ marginTop: '4px' }}>
              <a
                className="btn btn-default"
                href={`/experts/${expert.id}/edit`}
                aria-label={`Click here to Edit the Expert ${expert.id}`}
              >
                <span className="fa fa-pencil"></span> Edit Expert
              </a>
              <a
                className="btn btn-default"
                href={`/experts/${expert.id}/dashboard`}
                aria-label={`Click here to View ${expert.id}'s Dashboard`}
              >
                <span className="fa fa-dashboard fa-fw"></span> Dashboard
              </a>
            </div>
          )}
        </div>
      </div>
    )
  }
}

// ExpertsListItemBlogEntrySmall - Used in landing page on the side bar
class ExpertsListItemBlogEntrySmall extends ExpertsListItem {
  render() {
    const expert = this.props.expert
    const classes = classNames('experts-list-item-small')
    return (
      <div className={classes}>
        <div className="experts-list-item-small__left-column">
          <img
            className="expert-image img-circle"
            src={expert.image}
            alt={`Profile icon for ${expert.title}'s blog`}
          />
        </div>
        <div className="experts-list-item-small__right-column experts-item-content">
          <div className="expert-name">{expert.title}</div>
          <div className="expert-blog-title">{expert.blogTitle}</div>
          <div className="expert-date">
            {format(expert.createdAt, 'MMM dd, yyyy')}
          </div>
        </div>
      </div>
    )
  }
}

// ExpertsListItemQuestionsAndAnswers - Used in /experts in the side bar
class ExpertsListItemQuestionsAndAnswers extends ExpertsListItem {
  render() {
    const expert = this.props.expert
    const classes = classNames('experts-list-item-small')
    const showQuestionsCommentsCount =
      expert.totalAnswerCount > 0 || expert.totalCommentCount > 0
    return (
      <div className={classes}>
        <div className="experts-list-item-small__left-column">
          <img
            className="expert-image img-circle"
            src={expert.image}
            alt={`Profile icon for ${expert.title}'s blog`}
          />
        </div>
        <div className="experts-list-item-small__right-column experts-item-content">
          <div className="expert-name">
            <Link to={`/experts/${expert.id}`}>
              <span>{expert.title}</span>
            </Link>
          </div>
          {showQuestionsCommentsCount && (
            <div className="answers-comments-container">
              <div>
                <span>{expert.totalAnswerCount}</span>&nbsp;
                <span className="answers-comments">Answers</span>
              </div>
              <div>
                <span>{expert.totalCommentCount}</span>&nbsp;
                <span className="answers-comments">Comments</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

export {
  ExpertsListItem,
  ExpertsListItemBlogEntry,
  ExpertsListItemBlogEntrySmall,
  ExpertsListItemQuestionsAndAnswers,
}

export default ExpertsListItem
