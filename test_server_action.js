import { getWeatherSummaryV2 } from './src/actions/weatherActions.js';

async function run() {
    console.log(await getWeatherSummaryV2('Test City', {}, false));
}
run();
