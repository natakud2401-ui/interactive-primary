/* GitHub Pages export: download a portable report instead of a server request. */
(() => {
 const originalFetch=window.fetch.bind(window);
 window.fetch=async function(input,options){
  if(typeof input!=='string'||input!=='/api/submit')return originalFetch(input,options);
  const data=JSON.parse(options.body);
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const artwork=String(data.artwork??'');
  if(!/^[A-Za-z0-9+/]*={0,2}$/.test(artwork))return Response.json({error:'Не удалось подготовить рисунок'},{status:400});
  const content='<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Работа по ИЗО</title><style>body{font:18px/1.5 sans-serif;max-width:900px;margin:30px auto;padding:20px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit}img{max-width:100%;height:auto}</style><h1>Работа по ИЗО</h1><p>Ученик — '+escape(data.name)+'</p><pre>'+escape(data.summary)+'</pre><img alt="Рисунок ученика" src="data:image/png;base64,'+artwork+'"></html>';
  const url=URL.createObjectURL(new Blob([content],{type:'text/html;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;
  link.download='ИЗО_'+String(data.name||'Работа').replace(/[^a-zа-яё0-9_-]/gi,'_')+'.html';
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),10000);
  return Response.json({saved:true});
 };
})();
