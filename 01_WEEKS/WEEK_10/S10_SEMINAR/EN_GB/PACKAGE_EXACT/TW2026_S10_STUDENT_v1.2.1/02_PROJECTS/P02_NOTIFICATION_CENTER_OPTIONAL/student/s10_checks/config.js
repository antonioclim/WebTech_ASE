import base from '../vite.config.js';
export default {...base,test:{...base.test,include:['s10_checks/*.check.jsx']}};
