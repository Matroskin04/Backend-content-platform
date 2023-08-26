import {
  BlogOutputModel,
  BlogOutputModelMongo,
} from '../../../blogger-blogs/api/models/output/blog.output.model';
import { ObjectId } from 'mongodb';

export type BlogPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogOutputType>;
};

export type BlogOutputType = BlogOutputModel;

export type BannedBlogsIdType = Array<{
  _id: ObjectId;
}>;
