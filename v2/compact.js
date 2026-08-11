(()=>{
const CLOSED=new Set(['finalizada','cancelada']);
const AREAS=[['logistica','Logística'],['mantenimiento','Mantenimiento'],['automotor','Automotor'],['almacen','Almacén'],['servicios','Servicios'],['limpieza','Limpieza'],['personal','Personal'],['bienes','Bienes']];
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const state=n=>n.querySelector('.estado')?.value||'';
const priority=n=>n.querySelector('.prio')?.value||'normal';
const code=n=>n.querySelector('.request-code')?.textContent?.trim()||'Solicitud';
const area=n=>norm((n.querySelector('.request-sub')?.textContent||'').split('·')[0].trim());
const isAdmin=()=>[...document.querySelectorAll('h2')].some(h=>/Panel\s*·.*\(admin\)/i.test(h.textContent||''));
function css(){
 if(document.querySelector('#adminDashboardStyles'))return;
 const s=document.createElement('style');s.id='adminDashboardStyles';s.textContent=`
 body.admin-pro #farea{display:none!important}
 .admin-pro-dashboard{margin:22px 0 4px}.admin-pro-head h3{margin:0;font-size:22px}.admin-pro-head p{margin:4px 0 0;color:#687383}
 .admin-pro-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:16px 0 24px}.admin-pro-stat{border:1px solid #dce3ea;border-radius:14px;background:#f7f9fb;padding:14px}.admin-pro-stat span{display:block;color:#687383;font-size:13px;font-weight:700}.admin-pro-stat strong{display:block;font-size:30px;line-height:1;margin:7px 0}.admin-pro-stat small{color:#7b8492}.admin-pro-stat.urgent strong{color:#a12626}
 .admin-pro-section{display:flex;justify-content:space-between;gap:10px;align-items:end;margin:0 0 10px}.admin-pro-section h3{margin:0}.admin-pro-section span{font-size:13px;color:#687383}
 .admin-pro-areas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.admin-pro-area{text-align:left;padding:16px;border:1px solid #dce3ea;border-radius:14px;background:#fff;min-height:105px}.admin-pro-area:active{transform:scale(.99)}.admin-pro-area-top{display:flex;justify-content:space-between;align-items:center;gap:10px}.admin-pro-area-top span{font-size:17px;font-weight:750}.admin-pro-area-top strong{font-size:28px}.admin-pro-area-meta{margin-top:8px;font-size:12px;line-height:1.4;color:#687383}
 .admin-pro-history{width:100%;margin-top:14px;display:flex;justify-content:space-between;align-items:center;font-weight:750;padding:14px}.admin-pro-areahead{display:flex;gap:12px;align-items:center;margin:20px 0 14px}.admin-pro-areahead h3{margin:0;font-size:22px}.admin-pro-areahead p{margin:3px 0 0;color:#687383}.admin-pro-group-title{display:flex;justify-content:space-between;align-items:center;margin:18px 0 10px}.admin-pro-group-title h3{margin:0}.admin-pro-count{background:#102033;color:#fff;border-radius:999px;min-width:34px;padding:6px 10px;text-align:center}.admin-pro-list{display:grid;gap:10px}.admin-pro-closed{margin-top:22px;border-top:2px solid #e4e8ed;padding-top:16px}.admin-pro-toggle{width:100%;display:flex;justify-content:space-between;font-weight:750}.admin-pro-empty{padding:18px;border:1px dashed #d6dde5;border-radius:12px;color:#687383;text-align:center}
 @media(max-width:700px){.admin-pro-stats{grid-template-columns:repeat(2,1fr);gap:8px}.admin-pro-stat{padding:12px}.admin-pro-stat strong{font-size:26px}.admin-pro-areas{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.admin-pro-area{padding:13px;min-height:96px}.admin-pro-area-top span{font-size:15px}.admin-pro-area-top strong{font-size:24px}.admin-pro-areahead{align-items:flex-start;flex-direction:column}}
 `;document.head.appendChild(s);
}
function prepare(){
 const tasks=document.querySelector('#tasks');
 if(!tasks||tasks.dataset.adminPro==='1'||!isAdmin())return;
 const nodes=[...tasks.querySelectorAll('.request')];if(!nodes.length)return;
 tasks.dataset.adminPro='1';document.body.classList.add('admin-pro');css();const f=document.querySelector('#farea');if(f)f.style.display='none';
 const items=nodes.map(node=>({node,area:area(node),state:state(node),priority:priority(node),code:code(node)}));nodes.forEach(n=>n.remove());
 const active=()=>items.filter(x=>!CLOSED.has(x.state));const closed=()=>items.filter(x=>CLOSED.has(x.state));const byArea=(key,closedFlag)=>items.filter(x=>x.area===key&&(closedFlag?CLOSED.has(x.state):!CLOSED.has(x.state)));
 function mountList(container,list,empty){container.innerHTML='';if(!list.length){container.innerHTML=`<div class="admin-pro-empty">${empty}</div>`;return}list.forEach(x=>container.appendChild(x.node));}
 function home(){
  const a=active(),c=closed(),nuevas=a.filter(x=>x.state==='nueva').length,ejec=a.filter(x=>x.state==='en_ejecucion').length,urg=a.filter(x=>x.priority==='urgente').length;
  const cards=AREAS.map(([key,name])=>{const l=byArea(key,false),u=l.filter(x=>x.priority==='urgente').length,w=l.filter(x=>x.state==='en_espera').length;return `<button class="admin-pro-area" data-area="${key}"><div class="admin-pro-area-top"><span>${name}</span><strong>${l.length}</strong></div><div class="admin-pro-area-meta">${l.length===1?'1 solicitud activa':l.length+' solicitudes activas'}${u?` · ${u} urgente${u===1?'':'s'}`:''}${w?` · ${w} en espera`:''}</div></button>`}).join('');
  tasks.innerHTML=`<section class="admin-pro-dashboard"><div class="admin-pro-head"><h3>Resumen general</h3><p>Vista de gestión por área</p></div><div class="admin-pro-stats"><div class="admin-pro-stat"><span>Pendientes</span><strong>${a.length}</strong><small>${nuevas} nuevas</small></div><div class="admin-pro-stat"><span>En ejecución</span><strong>${ejec}</strong><small>trabajos activos</small></div><div class="admin-pro-stat urgent"><span>Urgentes</span><strong>${urg}</strong><small>requieren atención</small></div><div class="admin-pro-stat"><span>Finalizados</span><strong>${c.length}</strong><small>historial</small></div></div><div class="admin-pro-section"><h3>Áreas</h3><span>Solicitudes activas</span></div><div class="admin-pro-areas">${cards}</div><button class="admin-pro-history" id="adminHistory"><span>Historial / Finalizados</span><strong>${c.length} →</strong></button></section>`;
  tasks.querySelectorAll('.admin-pro-area').forEach(b=>b.onclick=()=>areaView(b.dataset.area));tasks.querySelector('#adminHistory').onclick=history;
 }
 function areaView(key){
  const name=AREAS.find(a=>a[0]===key)?.[1]||key,a=byArea(key,false),c=byArea(key,true),urg=a.filter(x=>x.priority==='urgente').length;
  tasks.innerHTML=`<div class="admin-pro-areahead"><button id="adminBack">← Todas las áreas</button><div><h3>${name}</h3><p>${a.length} activas${urg?` · ${urg} urgente${urg===1?'':'s'}`:''}</p></div></div><div class="admin-pro-group-title"><h3>Pendientes / En curso</h3><span class="admin-pro-count">${a.length}</span></div><div id="adminActive" class="admin-pro-list"></div><div class="admin-pro-closed"><button id="adminClosedToggle" class="admin-pro-toggle"><span>Finalizados / Cancelados</span><span>${c.length} ▾</span></button><div id="adminClosed" class="admin-pro-list" hidden></div></div>`;
  tasks.querySelector('#adminBack').onclick=home;mountList(tasks.querySelector('#adminActive'),a,'No hay solicitudes pendientes en esta área.');const cl=tasks.querySelector('#adminClosed');mountList(cl,c,'No hay solicitudes finalizadas en esta área.');cl.hidden=true;tasks.querySelector('#adminClosedToggle').onclick=e=>{cl.hidden=!cl.hidden;e.currentTarget.lastElementChild.textContent=`${c.length} ${cl.hidden?'▾':'▴'}`};
 }
 function history(){const c=closed();tasks.innerHTML=`<div class="admin-pro-areahead"><button id="adminBack">← Tablero</button><div><h3>Historial / Finalizados</h3><p>${c.length} solicitudes cerradas</p></div></div><div id="adminHistoryList" class="admin-pro-list"></div>`;tasks.querySelector('#adminBack').onclick=home;mountList(tasks.querySelector('#adminHistoryList'),c,'Todavía no hay solicitudes cerradas.');}
 home();
}
const ob=new MutationObserver(()=>setTimeout(prepare,0));ob.observe(document.documentElement,{childList:true,subtree:true});setInterval(prepare,800);
})();