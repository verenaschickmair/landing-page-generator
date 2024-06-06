import { config } from 'dotenv';
import { PromptTemplate } from 'langchain/prompts';
import { OpenAI } from 'openai';
import {
  COMPONENTS,
  FUNDAMENTAL_PRACTICES,
  GUIDLINES,
} from '../assets/gpt_constants.js';

config();

let messages = [];
let instructionMessage = [];
let prompt_strategy = 'cot';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runConversation(
  prompt,
  code = null,
  considerWholeDoc = false
) {
  let formattedPrompt = prompt;
  let temperature = 0;
  let {
    name,
    description,
    colors,
    target_group,
    goals,
    creativity,
    additional_info,
    model,
  } = prompt;

  temperature = Number(creativity) * 0.01;
  console.log('TEMPERATURE', temperature);
  console.log('CREATIVITY', creativity);
  console.log(Number(creativity) < 50 ? 'COMPONENTS' : 'NO COMPONENTS');
  console.log(Number(creativity) < 50 ? 'UI LIBRARY' : 'NO UI LIBRARY');

  if (!model) {
    model = 'gpt-3.5-turbo';
  }
  console.log('MODEL', model);

  //CASE: INITIAL PROMPT
  if (!code) {
    // RESET MESSAGES
    messages = [];

    //CHAIN OF THOUGHTS PROMPTING
    if (prompt_strategy === 'cot') {
      console.log('COT');

      const first_chain = PromptTemplate.fromTemplate(
        `You are a talented web designer who needs help creating a clear and concise HTML UI using Tailwind CSS. The UI should be visually appealing and responsive.

        First step: Think about theorectical principles of landing pages.
        Take your time and think about what is important for landing pages in terms of design and marketing.

        Now, based on your findings, you are supposed to create a landing page based on the following data of a company/campaign:
        Company/Campaign name: {name}
        Description: {description}
        Brand colors: {colors}
        Goals: {goals}
        Target group: {target_group}
        Additional information for the landing page: {additional_info}

        Second step: Think about what could be suitable sections/components based on the data given and write them down.
        Also summarize the given data in a short way for yourself.`
      );

      formattedPrompt = await first_chain.format({
        name,
        description,
        colors: colors.join(', '),
        target_group,
        goals,
        additional_info,
      });

      messages = [...messages, { role: 'system', content: formattedPrompt }];

      const first_answer = await openai.chat.completions.create({
        model,
        temperature,
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      });

      instructionMessage = [
        { role: 'system', content: first_answer.choices[0].message.content },
      ];

      messages = [
        ...messages,
        {
          role: 'assistant',
          content: first_answer.choices[0].message.content,
        },
      ];

      console.log(first_answer.choices[0].message.content);

      const second_chain = PromptTemplate.fromTemplate(
        `Now, based on the components you have chosen, please follow these guidelines:
        {guidlines}

        You can also choose some of the following components:
        {components}

        Remeber this is a landing page for marketing purposes, so make sure to follow marketing best practices. Here are some more examples:
        {fundamentals}

        The code should be valid HTML, formatted for readability, and include the necessary CDN links.
        Start your output with <!DOCTYPE html> and end with </html>.
        And most important: DO NOT OUTPUT ANYTHING ELSE THAN THE HTML CODE! NO COMMENTS, NO EXTRA SPACES, NO EXTRA CHARACTERS, NO EXPLANATIONS!`
      );

      formattedPrompt = await second_chain.format({
        guidlines: GUIDLINES,
        fundamentals: FUNDAMENTAL_PRACTICES,
        components: Number(creativity) < 50 ? COMPONENTS : 'No examples.',
      });

      messages = [...messages, { role: 'system', content: formattedPrompt }];

      return await openai.chat.completions.create({
        model: model,
        temperature: temperature, //Between 0 and 0.1
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        stream: !!!code,
      });
    } else {
      // BIG PROMPTING
      console.log('BIG');

      const systemPrompt = PromptTemplate.fromTemplate(
        `You are a talented web designer who needs help creating a clear and concise HTML UI using Tailwind CSS. The UI should be visually appealing and responsive.

        You are supposed to create a landing page based on the following data of a company/campaign:
        Company/Campaign name: {name}
        Description: {description}
        Brand colors: {colors}
        Goals: {goals}
        Target group: {target_group}
        Additional information for the landing page: {additional_info}

        Now, think about what could be suitable sections/components for this landing page.
        You can also choose some of the following components:
        {components}

        Please follow these guidelines:
        {guidlines}

        Remember this is a landing page, so make sure to follow marketing best practices. Here are some examples:
        {fundamentals}

        The code should be valid HTML, formatted for readability, and include the necessary CDN links.
        Start your output with <!DOCTYPE html> and end with </html>.
        DO NOT OUTPUT ANYTHING ELSE THAN THE HTML CODE! NO COMMENTS, NO EXTRA SPACES, NO EXTRA CHARACTERS, NO EXPLANATIONS!`
      );

      formattedPrompt = await systemPrompt.format({
        name,
        description,
        colors: colors.join(', '),
        target_group,
        goals,
        additional_info,
        components: COMPONENTS,
        ui_library: Number(creativity) < 50 ? UI_LIBRARY : '',
        guidlines: GUIDLINES,
        fundamentals: FUNDAMENTAL_PRACTICES,
      });

      instructionMessage = [{ role: 'system', content: formattedPrompt }];
    }

    //CASE: REFINEMENT PROMPT FOR WHOLE CODE
  } else if (code && considerWholeDoc) {
    messages = [];
    model = 'gpt-4-1106-preview';

    const systemPrompt = PromptTemplate.fromTemplate(
      `You have been asked to create HTML code based on the user's specifications.

      A short summary about the landing page:
      {instruction}

      The user requested the following modification:
      {prompt}

      The code you need to modify is the following:
      {code}

      Change the code accordingly to the user's request. Please return the whole code.
      Remember that you are only supposed to use Tailwind CSS for styling. For color changes, use the color classes provided by Tailwind CSS (e.g. bg-red-500, text-blue-500, etc.)
      E.g. when the user asks for a light blue background, you should use the class bg-blue-100.
      If you need to modify the code, return the code and do not add other words or characters.`
    );

    formattedPrompt = await systemPrompt.format({
      code,
      prompt,
      instruction: instructionMessage.length
        ? instructionMessage.content
        : 'No summary available.',
    });

    //CASE: REFINEMENT PROMPT FOR PARTIAL CODE
  } else if (code && !considerWholeDoc) {
    messages = [];
    model = 'gpt-3.5-turbo';

    const systemPrompt = PromptTemplate.fromTemplate(
      `You have been asked to create HTML code based on the user's specifications.

      A short summary about the landing page:
      {instruction}

      The user requested the following modification:
      {prompt}

      The code section you need to modify is the following:
      {code}

      Change the code accordingly to the user's request. Please only modify the referred section.
      Remember that you are only supposed to use Tailwind CSS for styling. For color changes, use the color classes provided by Tailwind CSS (e.g. bg-red-500, text-blue-500, etc.)
      E.g. when the user asks for a light blue background, you should use the class bg-blue-100.
      If you need to modify the code, return the referred section with your modification and do not add other words or characters.`
    );

    formattedPrompt = await systemPrompt.format({
      code,
      prompt,
      instruction: instructionMessage.length
        ? instructionMessage.content
        : 'No summary available.',
    });

    //CASE: INVALID QUERY
  } else {
    throw new Error('Invalid query');
  }

  messages = [...messages, { role: 'system', content: formattedPrompt }];

  // The default temperature is .7
  // Generating code, need consistent results - use a temperature of 0, maybe .1
  return openai.chat.completions.create({
    model,
    temperature, //Between 0 and 1
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
    stream: !!!code,
  });
}

export async function addMessage(content, role) {
  messages.push({ role, content });
}
