(function(g){'use strict';
 const pending=new Map();g.OPERATIONS_DATA={};
 /* 整合版：网址访问时照常 fetch JSON；双击（file://）时浏览器禁止 fetch 本地文件，改为插入同名 .js 数据脚本。 */
 function viaScript(id){
  return new Promise((resolve,reject)=>{
   const bag=g.__OPERATIONS_DATA_JS__=g.__OPERATIONS_DATA_JS__||{};
   if(bag[id])return resolve(bag[id]);
   const s=document.createElement('script');s.src='assets/operations/data/'+id+'.js?v=20261103-op1';
   s.onload=()=>{s.remove();bag[id]?resolve(bag[id]):reject(Error('资料文件不完整'));};
   s.onerror=()=>{s.remove();reject(Error('资料载入失败'));};
   document.head.appendChild(s);
  });
 }
 function viaFetch(id){
  return fetch('assets/operations/data/'+id+'.json?v=20261103-op1').then(r=>{if(!r.ok)throw Error('资料载入失败（'+r.status+'）');return r.json();});
 }
 function load(id){
  if(g.OPERATIONS_DATA[id])return Promise.resolve(g.OPERATIONS_DATA[id]);
  if(!g.OPERATIONS_CONTENT.some(c=>c.id===id))return Promise.reject(Error('未找到这个案例'));
  if(pending.has(id))return pending.get(id);
  const get=location.protocol==='file:'?viaScript(id):viaFetch(id).catch(()=>viaScript(id));
  const request=get.then(data=>{if(data.id!==id||!data.records.length)throw Error('资料文件不完整');g.OPERATIONS_DATA[id]=data;return data;}).catch(e=>{pending.delete(id);throw e;});
  pending.set(id,request);return request;
 }
 g.OperationsAssets={load};
})(window);
