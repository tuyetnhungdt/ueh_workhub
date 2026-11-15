
import { buildItems } from './src/modules/seedItems.js';
const items = buildItems('p1');
console.log('Total items in p1:', items.length);
const sessions = items.filter(x => x.module === 'sessions');
console.log('Sessions in p1:', sessions.length);
console.log(sessions);
