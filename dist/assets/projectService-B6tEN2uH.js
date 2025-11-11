import{a as t}from"./index--2Lk4t6e.js";const s="/projects",o={getAll:async e=>(await t.get(s,{params:e})).data,getById:async e=>(await t.get(`${s}/${e}`)).data,create:async e=>(await t.post(s,e)).data,update:async(e,a)=>(await t.put(`${s}/${e}`,a)).data,delete:async e=>{await t.delete(`${s}/${e}`)}};export{o as p};
//# sourceMappingURL=projectService-B6tEN2uH.js.map
