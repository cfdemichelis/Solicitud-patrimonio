(()=>{
  const datos={};
  const items=['Gazebos','Sillas','Mesas','Tablón','Tablones','Caballetes','Pava eléctrica','Alargue','Zapatilla eléctrica','Bidones de agua','Dispenser','Té','Mate cocido','Café','Azúcar','Removedores','Removedor','Edulcorante','Vasos térmicos','Vasos telgopor','Vasos plásticos','Precintos','Alambre','Herramientas','Moledora','Agujereadora','Hidrolavadora','Aspiradora'];
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const limpiar=s=>String(s||'').replace(/\s+/g,' ').trim();

  function leer(){
    document.querySelectorAll('.request').forEach(r=>{
      const c=(r.querySelector('.request-code')?.textContent||'').trim();
      if(c) datos[c]=limpiar(r.textContent||'');
    });
  }

  function extraerElementos(t){
    const encontrados=[];
    for(const nombre of items){
      const p=nombre.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      const re=new RegExp(`${p}\\s*[:x-]?\\s*(\\d+)`,'i');
      const m=t.match(re);
      if(m && Number(m[1])>0){
        const etiqueta=nombre.toLowerCase();
        if(!encontrados.some(x=>x.toLowerCase().includes(etiqueta))) encontrados.push(`${m[1]} ${nombre.toLowerCase()}`);
      }
    }
    return encontrados;
  }

  function extraerDescripcion(t){
    const pats=[
      /(?:Descripción|Detalle|Observaciones)\s*:?\s*(.+?)(?=\s+(?:Estado|Prioridad|Entrega|Retiro|Fecha|Solicitante|Tel[eé]fono|Email|Responsable)\b|$)/i,
      /(?:Trabajo solicitado|Reparación)\s*:?\s*(.+?)(?=\s+(?:Estado|Prioridad|Fecha|Solicitante|Tel[eé]fono|Email)\b|$)/i
    ];
    for(const p of pats){
      const m=t.match(p); if(m){const s=limpiar(m[1]);if(s && s.length>2)return s.slice(0,180)}
    }
    return '';
  }

  function crearLista(t){
    const elems=extraerElementos(t);
    const desc=extraerDescripcion(t);
    if(!elems.length && !desc) return '';
    let h='<ul class="agenda-pedido-list">';
    if(elems.length) h+=`<li><strong>Pedido:</strong> ${esc(elems.join(' · '))}</li>`;
    if(desc) h+=`<li><strong>Detalle:</strong> ${esc(desc)}</li>`;
    return h+'</ul>';
  }

  function estilo(){
    if(document.getElementById('agendaListaStyle'))return;
    const s=document.createElement('style');s.id='agendaListaStyle';s.textContent=`
      .agenda-pedido-list{margin:7px 0 4px;padding:0;list-style:none;display:grid;gap:4px;font-size:14px;line-height:1.35}
      .agenda-pedido-list li{position:relative;padding-left:15px;color:#263445}
      .agenda-pedido-list li:before{content:'•';position:absolute;left:2px;font-weight:800}
      .agenda-pedido-list strong{color:#102033}
      .agenda-item{padding-top:13px!important;padding-bottom:13px!important}
    `;document.head.appendChild(s);
  }

  function mostrar(){
    estilo();
    document.querySelectorAll('.agenda-item').forEach(i=>{
      i.querySelector('.agenda-detalle')?.remove();
      if(i.querySelector('.agenda-pedido-list'))return;
      const c=((i.querySelector('.agenda-code')?.textContent||'').split('·')[0]||'').trim();
      const t=datos[c]; if(!t)return;
      const html=crearLista(t); if(!html)return;
      const wrap=document.createElement('div');wrap.innerHTML=html;
      const lista=wrap.firstElementChild;
      i.querySelector('.agenda-meta')?.before(lista);
    });
  }

  new MutationObserver(()=>{leer();mostrar()}).observe(document.documentElement,{childList:true,subtree:true});
  leer();mostrar();
})();