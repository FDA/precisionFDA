import React, { Component } from 'react'
import classNames from 'classnames/bind'

import { IExpert } from '../../../../types/expert'
import Button from '../../Button'
import './style.sass'

import { format } from 'date-fns'


type ExpertsListItemProps = {
  expert: IExpert,
  userCanEdit: boolean,
}


class ExpertsListItem extends Component<ExpertsListItemProps> {
}

// ExpertsListItemBlogEntry - Used in /experts as the main list
class ExpertsListItemBlogEntry extends ExpertsListItem {
  render() {
    const expert = this.props.expert
    const userCanEdit = this.props.userCanEdit
    const classes = classNames('experts-list-item')
    return (
      <div className={classes}>
        <div className="experts-list-item__left-column">
          <img className="expert-image img-circle" src={expert.image} />
        </div>
        <div className="experts-list-item__right-column experts-item-content">
          <h1>{expert.blogTitle}</h1>
          <div style={{ marginTop: '4px' }}>
            <span className="expert-name">{expert.title}</span>
            <span className="expert-date">{format(expert.createdAt, 'MMM dd, yyyy')}</span>
          </div>
          <p>{expert.blogPreview}</p>
          <div className="experts-list-item__buttons pull-left" style={{ marginTop: '6px' }}>
            <Button className="" size="md" type="default" onClick={() => window.location.assign(`/experts/${expert.id}`)}>Expert Q&amp;A</Button>
            <a href={`/experts/${expert.id}`}>About This Expert</a>
            <a href={`/experts/${expert.id}/blog`}>Read Expert Blog Post &#x2197;</a> 
          </div>
          {userCanEdit && (
            <div className="btn-group pull-right" style={{ marginTop: '4px' }}>
              <a className="btn btn-default" href={`/experts/${expert.id}/edit`}><span className="fa fa-pencil"></span> Edit Expert</a>
              <a className="btn btn-default" href={`/experts/${expert.id}/dashboard`}><span className="fa fa-dashboard fa-fw"></span> Dashboard</a>
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
          <img className="expert-image img-circle" src={expert.image} />
        </div>
        <div className="experts-list-item-small__right-column experts-item-content">
          <div className="expert-name">{expert.title}</div>
          <div className="expert-blog-title">{expert.blogTitle}</div>
          <div className="expert-date">{format(expert.createdAt, 'MMM dd, yyyy')}</div>
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
    return (
      <div className={classes}>
        <div className="experts-list-item-small__left-column">
          <img className="expert-image img-circle" src={expert.image} />
        </div>
        <div className="experts-list-item-small__right-column experts-item-content">
          <div className="expert-name"><a href={`/experts/${expert.id}`}>{expert.title}</a></div>
          <div className="answers-comments-container">
            <div><span>{expert.totalAnswerCount}</span>&nbsp;<span className="answers-comments">Answers</span></div>
            <div><span>{expert.totalCommentCount}</span>&nbsp;<span className="answers-comments">Comments</span></div>
          </div>
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
