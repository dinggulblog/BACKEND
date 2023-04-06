import sse from 'better-sse';
import { Configuration, OpenAIApi } from 'openai';

const defaultParameters = {
  model: 'text-davinci-003',
  n: 1,
  max_tokens: 2048,
  temperature: 0.3,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0
}

class OpenAIHandler {
  #configuration;
  #openai;

  constructor() {
    this.#configuration = new Configuration({ organization: process.env.OPENAI_ORG_ID, apiKey: process.env.OPENAI_API_KEY });
    this.#openai = new OpenAIApi(this.#configuration);
    this._sessions = new Map();
  }

  async createSession(req, res, payload, callback) {
    try {
      const session = await sse.createSession(req, res);

      callback.onSuccess({})
    } catch (error) {
      callback.onError(error);
    }
  }

  async createCompletion(req, res, payload, callback) {
    try {
      const { prompt } = req.query;

      const session = await sse.createSession(req, res);

      if (!session.isConnected) throw new Error('네트워크 에러가 발생하였습니다. 잠시 후 다시 시도해 주세요.');

      const { data } = await this.#openai.createCompletion({
        ...defaultParameters,
        stream: true,
        prompt: `
          Write blog posts in markdown format.
          Write the theme of your blog as ${decodeURI(prompt)}.
          Highlight, bold, or italicize important words or sentences.
          Please make the entire blog less than 15 ~ 20 minutes long.
          The audience of the article is 20-40 years old.
          Add a summary of the article at the beginning of the blog post.
          Add a paragraph topic starting with an ### tag on the first line of each paragraph.
        `
      }, {
        timeout: 1000 * 60 * 2,
        responseType: 'stream'
      });

      data.on('data', text => {
        const lines = text.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          const message = line.replace(/^data: /, '');
          if (message === '[DONE]') {
            session.push('DONE', 'error');
            return;
          }
          try {
            const { choices } = JSON.parse(message);
            session.push(choices[0].text);
          } catch (err) {
            return callback.onError(err);
          }
        }
      });

      data.on('close', () => {
        callback.onSuccess('')
      });
      data.on('error', (err) => {
        callback.onError(err);
      });
    } catch (error) {
      callback.onError(error);
    }
  }
}

export default OpenAIHandler;
