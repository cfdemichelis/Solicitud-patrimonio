(()=>{
  const FINALIZADOS = new Set(['finalizada','cancelada']);
  const AREAS = [
    ['logistica','Logística'],
    ['mantenimiento','Mantenimiento'],
    ['automotor','Automotor'],
    ['almacen','Almacén'],
    ['servicios','Servicios'],
    ['limpieza','Limpieza'],
    ['personal','Personal'],
    ['bienes','Bienes']
  ];
  let areaActiva = null;

  const norm = s => String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');

  function estadoCard(card){ return card.querySelector('.estado')?.value || ''; }
  function prioridadCard(card){ return card.querySelector('.prio')?.value || ''; }
  function areaCard(card){
    const chip = card.querySelector('.task-badges .chip')?.textContent || '';
    return norm(chip);
  }
  function esAdmin(){
    const titulo = [...document.querySelectorAll('h2')].find(x=>/Panel\s*·/i.test(x.textContent||''));
    return /\(admin\)/i.test(titulo?.textContent||'');
  }

  function resumenCard(card){
    const codigo = card.querySelector('.task-code')?.textContent?.trim() || 'Solicitud';
    const chips = [...card.querySelectorAll('.task-badges .chip')].map(x=>x.textContent.trim());
    const estadoSel = card.querySelector('.estado');
    const estado = estadoSel ? estadoSel.options[estadoSel.selectedIndex]?.text : '';
    const prioridadSel = card.querySelector('.prio');
    const prioridad = prioridadSel ? prioridadSel.options[prioridadSel.selectedIndex]?.text : '';
    const meta = [chips[1], estado, prioridad].filter(Boolean).join(' · ');
    const summary = document.createElement('summary');
    summary.className = 'pedido-resumen';
    summary.innerHTML = `<span class="pedido-codigo">${codigo}</span><span class="pedido-meta">${meta}</span><span class="pedido-flecha">⌄</span>`;
    return summary;
  }

  function prepararCard(card){
    let d = card.closest('details.pedido-desplegable');
    if(!d){
      d = document.createElement('details');
      d.className = 'pedido-desplegable';
      card.parentNode?.insertBefore(d,card);
      d.appendChild(resumenCard(card));
      d.appendChild(card);
    }else{
      const old = d.querySelector(':scope > .pedido-resumen');
      const fresh = resumenCard(card);
      if(old) old.replaceWith(fresh); else d.prepend(fresh);
    }
    d.dataset.area = areaCard(card);
    d.dataset.estado = estadoCard(card);
    d.dataset.prioridad = prioridadCard(card);
    return d;
  }

  function grupoActivo(){
    const s=document.createElement('section');
    s.className='grupo-pedidos grupo-activos';
    s.innerHTML='<div class="grupo-titulo"><h3>Pendientes / En curso</h3><span class="contador-activos"></span></div><div class="lista-activos"></div>';
    return s;
  }
  function grupoCerrado(){
    const s=document.createElement('details');
    s.className='grupo-pedidos grupo-cerrados';
    s.innerHTML='<summary class="grupo-titulo"><h3>Finalizados / Cancelados</h3><span class="contador-cerrados"></span></summary><div class="lista-cerrados"></div>';
    return s;
  }

  function dashboardAdmin(cards){
    const activos = cards.filter(c=>!FINALIZADOS.has(estadoCard(c)));
    const enEjec = cards.filter(c=>estadoCard(c)==='en_ejecucion').length;
    const urgentes = activos.filter(c=>prioridadCard(c)==='urgente').length;
    const finalizados = cards.filter(c=>FINALIZADOS.has(estadoCard(c))).length;
    const nuevas = cards.filter(c=>estadoCard(c)==='nueva').length;

    const d=document.createElement('section');
    d.className='admin-dashboard';
    d.innerHTML=`
      <div class="admin-dashboard-head">
        <div><h3>Resumen general</h3><p>Vista de gestión por área</p></div>
        ${areaActiva?'<button class="volver-tablero">← Ver todas las áreas</button>':''}
      </div>
      <div class="stats-grid">
        <div class="stat"><span>Pendientes</span><strong>${activos.length}</strong><small>${nuevas} nuevas</small></div>
        <div class="stat"><span>En ejecución</span><strong>${enEjec}</strong><small>trabajos activos</small></div>
        <div class="stat stat-urgente"><span>Urgentes</span><strong>${urgentes}</strong><small>requieren atención</small></div>
        <div class="stat"><span>Finalizados</span><strong>${finalizados}</strong><small>historial</small></div>
      </div>
      <h3 class="areas-title">Áreas</h3>
      <div class="admin-areas">
        ${AREAS.map(([key,nombre])=>{
          const ac=activos.filter(c=>areaCard(c)===key);
          const urg=ac.filter(c=>prioridadCard(c)==='urgente').length;
          return `<button class="area-panel ${areaActiva===key?'seleccionada':''}" data-area="${key}">
            <span class="area-nombre">${nombre}</span>
            <strong>${ac.length}</strong>
            <span class="area-sub">${ac.length===1?'1 solicitud':ac.length+' solicitudes'}${urg?` · ${urg} urgente${urg===1?'':'s'}`:''}</span>
          </button>`;
        }).join('')}
      </div>
      ${areaActiva?`<div class="area-abierta"><span>Mostrando</span><strong>${AREAS.find(a=>a[0]===areaActiva)?.[1]||areaActiva}</strong></div>`:'<p class="admin-ayuda">Tocá un área para ver sus solicitudes.</p>'}
    `;
    return d;
  }

  function aplicarArea(tasks){
    const details=[...tasks.querySelectorAll('details.pedido-desplegable')];
    details.forEach(d=>d.style.display=(!areaActiva||d.dataset.area===areaActiva)?'':'none');
    const a=[...tasks.querySelectorAll('.lista-activos > details.pedido-desplegable')].filter(d=>d.style.display!=='none').length;
    const c=[...tasks.querySelectorAll('.lista-cerrados > details.pedido-desplegable')].filter(d=>d.style.display!=='none').length;
    const ca=tasks.querySelector('.contador-activos'); if(ca) ca.textContent=`${a} pedido${a===1?'':'s'}`;
    const cc=tasks.querySelector('.contador-cerrados'); if(cc) cc.textContent=`${c} pedido${c===1?'':'s'}`;
    tasks.classList.toggle('admin-overview',esAdmin()&&!areaActiva);
  }

  function enlazarDashboard(tasks){
    tasks.querySelectorAll('.area-panel').forEach(b=>b.addEventListener('click',()=>{
      areaActiva=b.dataset.area;
      tasks.dataset.compactSignature='';
      prepararPanel(true);
    }));
    tasks.querySelector('.volver-tablero')?.addEventListener('click',()=>{
      areaActiva=null;
      tasks.dataset.compactSignature='';
      prepararPanel(true);
    });
  }

  function prepararPanel(force=false){
    const tasks=document.querySelector('#tasks');
    if(!tasks||tasks.dataset.compactoProcesando==='1') return;
    const cards=[...tasks.querySelectorAll('.task')].filter(c=>c.closest('#tasks')===tasks);
    if(!cards.length) return;

    const admin=esAdmin();
    document.body.classList.toggle('admin-dashboard-mode',admin);
    const sig=cards.map(c=>`${c.dataset.task||''}:${estadoCard(c)}:${prioridadCard(c)}:${areaCard(c)}`).join('|')+`|admin:${admin}|area:${areaActiva||''}`;
    if(!force&&tasks.dataset.compactSignature===sig) return;
    tasks.dataset.compactoProcesando='1';

    const act=grupoActivo(), cer=grupoCerrado();
    const la=act.querySelector('.lista-activos'), lc=cer.querySelector('.lista-cerrados');
    cards.forEach(card=>{
      const det=prepararCard(card);
      (FINALIZADOS.has(estadoCard(card))?lc:la).appendChild(det);
    });

    tasks.innerHTML='';
    if(admin) tasks.appendChild(dashboardAdmin(cards));
    tasks.appendChild(act);tasks.appendChild(cer);

    if(!la.children.length) la.innerHTML='<p class="sin-pedidos">No hay pedidos pendientes.</p>';
    if(!lc.children.length) lc.innerHTML='<p class="sin-pedidos">No hay pedidos finalizados.</p>';

    aplicarArea(tasks);
    if(admin) enlazarDashboard(tasks);
    tasks.dataset.compactSignature=sig;
    delete tasks.dataset.compactoProcesando;
  }

  const css=document.createElement('style');
  css.textContent=`
    #tasks{display:block!important}
    .grupo-pedidos{margin-top:18px}
    .grupo-titulo{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 9px;padding:2px}
    .grupo-titulo h3{margin:0;font-size:18px}.grupo-titulo span{font-size:13px;color:#667085;font-weight:700}
    details.grupo-cerrados>summary{cursor:pointer;list-style:none;border-top:1px solid #dde3e9;padding-top:16px}
    details.grupo-cerrados>summary::-webkit-details-marker{display:none}
    .pedido-desplegable{border:1px solid #dce3ea;border-radius:12px;background:#fff;margin:8px 0;overflow:hidden}
    .pedido-resumen{list-style:none;cursor:pointer;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:14px 15px}
    .pedido-resumen::-webkit-details-marker{display:none}.pedido-codigo{font-weight:800;font-size:16px;white-space:nowrap}
    .pedido-meta{font-size:13px;color:#667085;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pedido-flecha{font-size:22px;line-height:1;transition:transform .15s}
    .pedido-desplegable[open]>.pedido-resumen .pedido-flecha{transform:rotate(180deg)}
    .pedido-desplegable>.task{border:0!important;border-top:1px solid #edf0f3!important;border-radius:0!important;margin:0!important}.pedido-desplegable>.task>.task-head{display:none!important}
    .sin-pedidos{color:#667085;padding:10px 4px}
    .admin-dashboard{margin:18px 0 22px}.admin-dashboard-head{display:flex;justify-content:space-between;align-items:center;gap:12px}.admin-dashboard-head h3{margin:0;font-size:21px}.admin-dashboard-head p{margin:3px 0 0;color:#667085}.volver-tablero{padding:9px 11px}
    .stats-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0 22px}.stat{border:1px solid #dce3ea;border-radius:14px;padding:14px;background:#f8fafc}.stat span{display:block;font-size:13px;color:#667085;font-weight:700}.stat strong{display:block;font-size:29px;line-height:1.1;margin:5px 0}.stat small{color:#7b8492}.stat-urgente strong{color:#a12828}
    .areas-title{margin:0 0 10px}.admin-areas{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.area-panel{text-align:left;min-height:110px;padding:14px;border:1px solid #dce3ea;border-radius:14px;background:#fff;display:flex;flex-direction:column;align-items:flex-start;justify-content:center}.area-panel:hover,.area-panel.seleccionada{border-color:#102033;box-shadow:0 0 0 1px #102033}.area-nombre{font-weight:750}.area-panel strong{font-size:26px;margin:4px 0}.area-sub{font-size:12px;color:#667085}.admin-ayuda{color:#667085;margin:12px 2px}.area-abierta{display:flex;gap:8px;align-items:center;margin-top:14px;padding:10px 12px;background:#eef3f8;border-radius:10px}.area-abierta span{color:#667085}
    .admin-overview>.grupo-pedidos{display:none}.admin-dashboard-mode #farea,.admin-dashboard-mode #fest{display:none!important}
    @media(max-width:800px){.stats-grid{grid-template-columns:repeat(2,1fr)}.admin-areas{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:700px){.pedido-resumen{grid-template-columns:1fr auto;grid-template-areas:'codigo flecha' 'meta flecha';gap:3px 8px;padding:13px}.pedido-codigo{grid-area:codigo}.pedido-meta{grid-area:meta;white-space:normal}.pedido-flecha{grid-area:flecha}.admin-dashboard-head{align-items:flex-start;flex-direction:column}.area-panel{min-height:100px}.stats-grid{gap:8px}.stat{padding:12px}.stat strong{font-size:25px}}
  `;
  document.head.appendChild(css);

  const obs=new MutationObserver(()=>setTimeout(()=>prepararPanel(false),0));
  obs.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('change',e=>{if(e.target.matches('.estado,.prio'))setTimeout(()=>prepararPanel(true),250)});
  setInterval(()=>prepararPanel(false),1200);
})();