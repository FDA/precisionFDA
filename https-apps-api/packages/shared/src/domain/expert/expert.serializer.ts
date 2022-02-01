import { wrap } from "@mikro-orm/core";
import { Expert } from "..";

export interface Meta {
  _prefname: string;
  _about: string;
  _blog: string;
  _blog_title: string;
  _challenge: string;
  _image_id: string;
}

export const serializeExpert = async (expert: Expert) => {
  const answeredQuestionCount = await expert.getAnsweredQuestionsCount();
  const ignoredQuestionCount = await expert.getIgnoredQuestionsCount();
  const openQuestionCount = await expert.getOpenQuestionsCount();
  // NOTE(samuel) workaround as we aren't using json columns, loaded fields from query builder remain string
  // Therefore needs to be manually parsed and transformed
  console.log('parsing metadata')
  const parsedMeta = JSON.parse(expert.meta as any as string);
  // Note(samuel) this is a workaround hack to serve metadata in correct format
  console.log('metadata parsed')
  return wrap(expert).assign({
    meta:{
      about: parsedMeta?._about,
      blog: parsedMeta?._blog,
      blogTitle: parsedMeta?._blog_title,
      blogPreview: parsedMeta?._challenge,
      totalQuestionCount: answeredQuestionCount + ignoredQuestionCount + openQuestionCount,
      totalAnswerCount: answeredQuestionCount
    }
  });
}