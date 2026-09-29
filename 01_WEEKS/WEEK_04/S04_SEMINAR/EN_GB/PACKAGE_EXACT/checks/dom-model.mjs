
// Derived, bounded DOM stand-in. Multiple listeners are retained. This is not a browser.
export class Element {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.className='';this.textContent='';this.parent=null;this.listeners=new Map();this.attributes={};this.classList={add:n=>{this.className=[...new Set([...this.className.split(/\s+/).filter(Boolean),n])].join(' ')}};}
 append(...children){for(const c of children){c.parent=this;this.children.push(c);}}
 replaceChildren(...children){for(const c of this.children)c.parent=null;this.children=[];this.append(...children);}
 setAttribute(n,v){this.attributes[n]=String(v);}
 addEventListener(t,fn){if(!this.listeners.has(t))this.listeners.set(t,new Set());this.listeners.get(t).add(fn);}
 removeEventListener(t,fn){this.listeners.get(t)?.delete(fn);}
 closest(q){let n=this;while(n){if(q==='[data-action]'&&n.dataset.action)return n;if(q==='[data-task-id]'&&n.dataset.taskId)return n;n=n.parent;}return null;}
 emit(t,data={}){const e={target:this,currentTarget:this,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...data};for(const fn of [...(this.listeners.get(t)||[])])fn(e);return e;}
 count(){return [...this.listeners.values()].reduce((a,s)=>a+s.size,0);}
}
export const document={createElement:t=>new Element(t)};
export function roots(){const form=new Element('form'),list=new Element('ul');form.elements={title:{value:''}};form.resets=0;form.reset=()=>{form.resets++;form.elements.title.value='';};return{form,list};}
