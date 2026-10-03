import base from '../vite.config.js';
export default {...base,test:{...base.test,include:['s08_checks/*.check.jsx'],testTimeout:2000}};
