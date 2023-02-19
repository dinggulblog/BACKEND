import { checkSchema } from 'express-validator';
import OpenAISchema from './schema/openai.js';

const createCompletionRules = [
  checkSchema(OpenAISchema.COMPLETION_VALIDATION_SCHEMA(), ['query'])
];

export default {
  createCompletionRules
};
