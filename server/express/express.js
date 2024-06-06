import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { addMessage, runConversation } from '../gpt/gpt.js';
import createProjectAndDeploy from '../vercel/vercel.js';

export default async function connectExpressApp() {
  const app = express();

  const ALLOWED_ORIGINS = [
    'https://us-central1-landingpage-designer.cloudfunctions.net/listenToRequests',
    'https://landingpage-designer.web.app',
    'https://landingpage-designer.firebaseapp.com',
    'http://localhost:3000',
    'http://localhost:4200',
  ];

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(
    cors({
      origin: ALLOWED_ORIGINS,
    })
  );

  // handling CORS
  app.use((req, res, next) => {
    let origin = req.headers.origin;
    let usedOrigin =
      ALLOWED_ORIGINS.indexOf(origin) >= 0 ? origin : ALLOWED_ORIGINS[0];

    res.header('Transfer-Encoding', 'chunked');
    res.header('Access-Control-Allow-Origin', usedOrigin);
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });

  // route for handling prompts
  app.post('/api/prompt/initial', async (req, res) => {
    const stream = await runConversation(req.body.prompt, null, true);
    let completeResponse = ''; // Initialize an accumulator for the response

    for await (const part of stream) {
      // here express will stream the response
      const content = part.choices[0]?.delta.content || '';
      res.write(content);
      completeResponse += content;
    }
    res.end();
    addMessage(completeResponse, 'assistant');
    // here express sends the closing/done/end signal for the stream consumer
  });

  // route for handling refinement prompts
  app.post('/api/prompt/refinement', async (req, res) => {
    const response = await runConversation(
      req.body.refinementPrompt,
      req.body.code,
      req.body.considerWholeDoc
    );
    addMessage(response.choices[0].message.content, 'assistant');
    res.send(response.choices[0].message.content);
  });

  // route for handling deploy requests
  app.post('/api/deploy', async (req, res) => {
    const { code, userId, fileName } = req.body;
    const deploymentData = await createProjectAndDeploy(code, userId, fileName);
    res.json(deploymentData);
  });

  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });

  return app;
}
