import { body } from 'express-validator';

const createCompletionRules = [
  body('prompt', 'OpenAI API를 사용하려면 텍스트를 5자 이상 입력해야 합니다.')
    .isLength({ min: 5, max: 1000 })
    .trim(),
  body('')
];

export default {
  createCompletionRules
}