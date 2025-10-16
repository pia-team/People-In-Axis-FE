import{d as t}from"./index-CjnpFxxd.js";const s="/projects",o={getAll:async e=>(await t.get(s,{params:e})).data,getById:async e=>(await t.get(`${s}/${e}`)).data,create:async e=>(await t.post(s,e)).data,update:async(e,a)=>(await t.put(`${s}/${e}`,a)).data,delete:async e=>{await t.delete(`${s}/${e}`)}};export{o as p};
//# sourceMappingURL=projectService-4GD31wfU.js.map
