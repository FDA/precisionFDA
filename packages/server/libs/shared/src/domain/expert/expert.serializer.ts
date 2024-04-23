import { wrap } from "@mikro-orm/core";
import { Expert } from '@shared/domain/expert/expert.entity'

export interface ExpertMeta {
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
  // Query builder has to be btw used, as query contains YEAR() - native mysql function
  //
  // Therefore needs to be manually parsed and transformed
  const parsedMeta = JSON.parse(expert.meta as any as string) as ExpertMeta;
  let title = parsedMeta?._prefname;
  if (!title) {
    title = (await expert.user.load()).fullName;
  }

  const serializedExpert = {
    ...wrap(expert).toJSON(),
    meta: {
      about: parsedMeta?._about,
      blog: parsedMeta?._blog,
      blogTitle: parsedMeta?._blog_title,
      blogPreview: parsedMeta?._challenge,
      title,
      totalQuestionCount: answeredQuestionCount + ignoredQuestionCount + openQuestionCount,
      totalAnswerCount: answeredQuestionCount,
    },
  }
  return serializedExpert
}
