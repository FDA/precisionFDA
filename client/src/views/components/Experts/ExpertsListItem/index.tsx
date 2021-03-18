import React, { Component } from 'react'
import classNames from 'classnames/bind'

import { IExpert } from '../../../shapes/ExpertShape'
import Button from '../../Button'
import { Link } from 'react-router-dom'
import './style.sass'

import { format } from 'date-fns'


enum ExpertsListItemType {
  BlogEntry, // Used in /experts as the main list
  BlogEntrySmall,  // Used in landing page on the side bar
  QuestionsAndAnswers, // Used in /experts in the side bar
}


type ExpertsListItemProps = {
  expert: IExpert,
  type: ExpertsListItemType,
  userIsAdmin: boolean,
}


class ExpertsListItem extends Component<ExpertsListItemProps> {
  renderBlogEntry() {
    const expert = this.props.expert
    const userIsAdmin = this.props.userIsAdmin
    const classes = classNames('experts-list-item')
    return (
      <div className={classes}>
        <div className="experts-list-item__left-column">
          <img className="expert-image img-circle" src={expert.image} />
        </div>
        <div className="experts-list-item__right-column experts-item-content">
          <h1>{expert.blogTitle}</h1>
          <div>
            <span className="expert-name">{expert.title}</span>
            <span className="expert-date">{format(expert.createdAt, 'MMM dd, yyyy')}</span>
          </div>
          <p>{expert.blog}</p>
          <div className="pull-left">
            <Button className="" size="md" type="default" onClick={() => window.location.assign(`/experts/${expert.id}`)}>Expert Q&amp;A</Button>
            <Link to={`/experts/${expert.id}`} className="btn-borderless">About This Expert</Link>
            <a href={`/experts/${expert.id}/blog`}>Read Expert Blog Post &#x2197;</a> 
          </div>
          {userIsAdmin && (
            <div className="pull-right">
              <Button className="" size="md" type="default" onClick={() => window.location.assign(`/experts/${expert.id}/edit`)}><span className="fa fa-pencil"></span> Edit Expert</Button>
              <Button className="" size="md" type="default" onClick={() => window.location.assign(`/experts/${expert.id}/dashboard`)}><span className="fa fa-dashboard fa-fw"></span> Dashboard</Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  renderBlogEntrySmall() {
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

  renderQuestionsAndAnswers() {
    const expert = this.props.expert
    const classes = classNames('experts-list-item-small')
    return (
      <div className={classes}>
        <div className="experts-list-item-small__left-column">
          <img className="expert-image" src={expert.image} />
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

  render() {
    switch (this.props.type) {
      case ExpertsListItemType.BlogEntry:
        return this.renderBlogEntry()
      case ExpertsListItemType.BlogEntrySmall:
        return this.renderBlogEntrySmall()
      case ExpertsListItemType.QuestionsAndAnswers:
        return this.renderQuestionsAndAnswers()
    }
  }
}


export {
  ExpertsListItem,
  ExpertsListItemType,
}

export default ExpertsListItem
