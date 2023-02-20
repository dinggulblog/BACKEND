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
  }

  async createCompletion(req, res, callback) {
    try {
      const { prompt } = req.query;

      const session = await sse.createSession(req, res);
      const { data } = await this.#openai.createCompletion({
        ...defaultParameters,
        stream: true,
        prompt: `
          Write blog posts in markdown format.
          Write the theme of your blog as ${encodeURI(prompt)}.
          Highlight, bold, or italicize important words or sentences.
          Please make the entire blog less than 10 minutes long.
          The audience of the article is 20-40 years old.
          Add a summary of the article at the beginning of the blog post.
          Add a paragraph topic starting with an h3 tag on the first line of each paragraph.
        `
      }, {
        timeout: 1000 * 60 * 2,
        responseType: 'stream'
      });

      data.on('data', text => {
        const lines = text.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          const message = line.replace(/^data: /, '');
          if (message === '[DONE]') return;
          try {
            const parsed = JSON.parse(message);
            session.push(parsed.choices[0].text);
          } catch (err) {
            console.log(err)
            throw err;
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
      console.log('Catch!', error)
      callback.onError(error);
    }
  }


}

export default OpenAIHandler;
