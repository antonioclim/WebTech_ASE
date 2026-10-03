import base from '../vite.config.js';
export default {...base,test:{...base.test,include:['s09_checks/*.check.jsx']}};
