const { generateText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');

async function test() {
    try {
        const google = createGoogleGenerativeAI({
            apiKey: "AIzaSyB-guQny7wM_rk3FKWWpAR24WT68iG2dMQ"
        });
        const { text } = await generateText({
            model: google('gemini-1.5-flash'),
            prompt: 'say hello'
        });
        console.log(text);
    } catch (e) {
        console.error(e.message);
    }
}
test();
