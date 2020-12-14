import '@lwc/synthetic-shadow';
import { createElement } from 'lwc';
import App from 'ssm/app';

const app = createElement('ssm-app', { is: App });
// eslint-disable-next-line @lwc/lwc/no-document-query
document.querySelector('#main').appendChild(app);
