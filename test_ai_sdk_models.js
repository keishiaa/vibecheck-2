const { generateText } = require('ai');
const { createGoogleGenerativeAI } = require('@ai-sdk/google');

async function test() {
    const google = createGoogleGenerativeAI({
        apiKey: "AIzaSyB-guQny7wM_rk3FKWWpAR24WT68iG2dMQ"
    });
    const models = ['gemini-1.5-pro-latest', 'gemini-pro', 'models/gemini-1.5-flash-latest'];
    for (const m of models) {
        try {
            console.log('testing', m);
            const { text } = await generateText({
                model: google(m),
                prompt: 'say hello'
            });
            console.log('SUCCESS for', m);
            break;
        } catch (e) {
            console.error('FAILED for', m, e.message);
        }
    }
}
test();
