/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import overview from '../images/overview.png'
import workbench from '../images/workbench.png'
import boxes1 from '../images/boxes1.png'
import boxes2 from '../images/boxes2.png'
import boxesnew1 from '../images/boxes_new1.png'
import boxesnew2 from '../images/boxes_new2.png'
import news1 from '../images/news1.png'
import news2 from '../images/news2.png'
import participants1 from '../images/participants1.png'
import participants2 from '../images/participants2.png'
import expert1 from '../images/expert1.png'
import expert2 from '../images/expert2.png'
import expert3 from '../images/expert3.png'

import { DocBody } from '../styles'
import { useScrollToHash } from '../../../hooks/useScrollToHash'

export const SiteCustomization = () => {
  useScrollToHash()
  return(
  <DocBody>
    <h1>Site Customization</h1>

    <p>
      The precisionFDA site has many areas for publishing content. These include
      the Expert Spotlight, News, Community Participants, and Get Started areas.
      These areas allow for new content to become readily available when
      relevant. The Site Customization Workbench allows precisionFDA admins to
      add a new piece of content, preview how it will look, and then publish it
      to the full precisionFDA site.
    </p>

    <h2 id="customization-overview">
      The Overview Page and Site Customization Workbench
    </h2>

    <p>
      The overview page contains important links and boxes that can direct users
      to useful pages throughout the site. To begin editing the overview page,
      click on your name in the upper right hand corner and then go to “Admin
      Dashboard”.
    </p>

    <img
      width="100%"
      src={overview}
      alt="Overview screen user options with highlighted Admin Dashboard"
    />

    <p>From there, click on the button “Site Customization Workbench”.</p>

    <img
      width="100%"
      src={workbench}
      alt="Highlighted Site Customization Workbench tab on admin dashboard"
    />

    <p>
      This will take you to a page that allows you to modify the Get Started
      boxes, the News, and the Participants pages.
    </p>

    <img width="100%" src={boxes1} alt="Get Started Boxes page" />

    <h2 id="customization-boxes">Get Started Boxes</h2>

    <p>
      Get started boxes are displayed on the overview page and provide users
      with quick links to features and documentation for those features on the
      platform. To create a Get Started box, click the box that says “New box”
      in the site customization workbench page.
    </p>

    <img
      width="100%"
      src={boxes2}
      alt="Highlighted New box button to create new Get Started Box page"
    />

    <p>
      From this link, you can specify a title, description, url, and
      documentation url for a given feature on the site.
    </p>

    <img
      width="100%"
      src={boxesnew1}
      alt="Create a new Get Started Box page with highlighted Public checkbox"
    />

    <p>
      If you’re ready to display your Get Started box on the Overview page,
      check the box marked “Public” before pressing “Create Get started box”. If
      you would like to first test your Get Started box, then leave this box
      unselected. If the Get Started box is set to private mode, then once it
      has been created it will appear on your admin dashboard in the Get Started
      boxes area under “Private.”
    </p>

    <img
      width="100%"
      src={boxesnew2}
      alt="Get Started Boxes page with Public and highlighted Private box"
    />

    <p>
      If you need to edit either your public or private Get Started boxes, click
      the “paper and pencil” icon next to the box’s name. This can be useful for
      modifying the viewership setting on the Get Started box. If a Get Started
      box is no longer necessary, one can remove it by clicking the small “trash
      can” icon beside the box’s name.
    </p>

    <h2 id="customization-news">News</h2>

    <p>
      The overview page also displays current and relevant news articles that
      are of interest to the community of users. To create a news article on
      precisionFDA, select the “New article” button under the news tab in the
      site customization workbench.
    </p>

    <img
      width="100%"
      src={news1}
      alt="News page with highlighted New Article button"
    />

    <p>
      From here, you can specify the name of the article as it would appear on
      precisionFDA, the date the article is to be posted, a link to the article,
      a content summary of the article, and, optionally, a link to a video
      associated with the article. If you’re ready to make the article visible
      on the overview page, check the “Published” box and click “Create News
      Item”. If the Published box is left unchecked, the article will only be
      visible to you within your personal Site Customization Workbench.
    </p>

    <img
      width="100%"
      src={news2}
      alt="Create a news item page with Title,Date,Link,Content and Video fields"
    />

    <h2 id="customization-participants">Participants</h2>

    <p>
      Another customizable feature within the Site Customization Workbench is
      the participants. The participants may be individuals or organizations who
      collaborate with precisionFDA. These participants will be displayed on the
      homepage. Under the participants tab, click on the button called “New
      participant”.
    </p>

    <img
      width="100%"
      src={participants1}
      alt="Participants page with highlighted New Participant button"
    />

    <p>
      From here you can specify the title of the participant and an associated
      image to upload from your local computer.
    </p>

    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
    <img
      width="100%"
      src={participants2}
      alt="Create a new participant page with Title and Image fields"
    />

    <h2 id="customization-expert">The Expert Spotlight</h2>

    <p>
      The expert spotlight highlights a precisionFDA user as an expert in the
      field of genomics, bioinformatics, biomedical informatics, or precision
      medicine. The customization page on precisionFDA allows you to create an
      Expert Spotlight page by clicking the “Experts” button and then clicking
      “Create a new expert”. From here, you can identify the expert by their
      username, select an image for the post on their local computer, type out
      the expert’s preferred name, and create a biographical entry.
    </p>

    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
    <img
      width="100%"
      src={expert1}
      alt="Create a new Expert of the Month page with Username, Image, Preferred name, About fields"
    />

    <p>
      Now that the expert user for the post has been selected, a blog post for
      this highlighted expert can be created by filling out the blog sections,
      which include a title for the blogpost, the text displayed within the
      blogpost, and a preview to display on the front page of the Experts
      section.
    </p>

    <img
      width="100%"
      src={expert2}
      alt="Blog section with Blog title,Blog and Blog preview fields"
    />

    <p>
      Lastly, the visibility mode of the post can be set to either “Private” or
      “Public.” The Private setting allows you to test out how the post will
      appear on the precisionFDA site. The Public setting is for the finalized
      publication of the post.
    </p>

    <img
      width="100%"
      src={expert3}
      alt="Public and Private Blog visibility options"
    />

    <p>
      To test the appearance of your post privately or go public with it, click
      the “Create Expert” button.
    </p>
  </DocBody>
)
  }