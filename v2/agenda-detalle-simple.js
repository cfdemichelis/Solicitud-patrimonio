(()=>{
  const datos={};
  const items=[
    ['Gazebos',['Gazebos','Gacebos']],['Sillas',['Sillas']],['Mesas',['Mesas']],['Manteles',['Manteles','Mantel']],
    ['Tablones',['Tablones','Tablón']],['Caballetes',['Caballetes']],['Pava eléctrica',['Pava eléctrica']],
    ['Alargue',['Alargue']],['Zapatilla eléctrica',['Zapatilla eléctrica']],['Bidones de agua',['Bidones de agua']],
    ['Dispenser',['Dispenser']],['Té',['Té']],['Mate cocido',['Mate cocido']],['Café',['Café']],['Azúcar',['Azúcar']],
    ['Removedores',['Removedores','Removedor']],['Edulcorante',['Edulcorante']],['Vasos térmicos',['Vasos térmicos']],
    ['Vasos telgopor',['Vasos telgopor']],['Vasos plásticos',['Vasos plásticos']],['Precintos',['Precintos']],
    ['Alambre',['Alambre']],['Herramientas',['Herramientas']],['Moledora',['Moledora']],['Agujereadora',['Agujereadora']],
    ['Hidrolavadora',['Hidrolavadora']],['Aspiradora',['Aspiradora']]
  ];
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
    for(const [etiqueta,variantes] of items){
      let cantidad=null;
      for(const nombre of variantes){
        const p=nombre.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        const re=new RegExp(`${p}\\s*[:x-]?\\s*(\\d+)`,'i');
        const m=t.match(re);
        if(m && Number(m[1])>0){cantidad=Number(m[1]);break;}
      }
      if(cantidad!==null) encontrados.push({nombre:etiqueta,cantidad});
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
    let h='';
    if(elems.length){
      h+='<div class="agenda-pedido"><div class="agenda-pedido-titulo">Pedido</div><ul class="agenda-pedido-list">';
      h+=elems.map(x=>`<li><span>${esc(x.nombre)}:</span><strong>${x.cantidad}</strong></li>`).join('');
      h+='</ul></div>';
    }
    if(desc) h+=`<div class="agenda-pedido-detalle"><strong>Detalle:</strong> ${esc(desc)}</div>`;
    return h;
  }

  function estilo(){
    if(document.getElementById('agendaListaStyle'))return;
    const s=document.createElement('style');s.id='agendaListaStyle';s.textContent=`
      .agenda-pedido{margin:9px 0 6px;border-left:3px solid #dce3ea;padding-left:10px}
      .agenda-pedido-titulo{font-size:13px;font-weight:800;color:#687383;text-transform:uppercase;letter-spacing:.03em;margin-bottom:5px}
      .agenda-pedido-list{margin:0;padding:0;list-style:none;display:grid;gap:3px;font-size:14px;line-height:1.35;max-width:320px}
      .agenda-pedido-list li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:baseline;color:#263445;padding:1px 0}
      .agenda-pedido-list li span{font-weight:600}.agenda-pedido-list li strong{color:#102033;font-size:15px;text-align:right}
      .agenda-pedido-detalle{margin:6px 0 4px;font-size:14px;line-height:1.35;color:#263445}
      .agenda-pedido-detalle strong{color:#102033}
      .agenda-item{padding-top:13px!important;padding-bottom:13px!important}
    `;document.head.appendChild(s);
  }

  function mostrar(){
    estilo();
    document.querySelectorAll('.agenda-item').forEach(i=>{
      i.querySelector('.agenda-detalle')?.remove();
      i.querySelector('.agenda-pedido')?.remove();
      i.querySelector('.agenda-pedido-detalle')?.remove();
      const c=((i.querySelector('.agenda-code')?.textContent||'').split('·')[0]||'').trim();
      const t=datos[c]; if(!t)return;
      const html=crearLista(t); if(!html)return;
      const wrap=document.createElement('div');wrap.innerHTML=html;
      const meta=i.querySelector('.agenda-meta');
      [...wrap.children].forEach(el=>meta?meta.before(el):i.appendChild(el));
    });
  }

  new MutationObserver(()=>{leer();mostrar()}).observe(document.documentElement,{childList:true,subtree:true});
  leer();mostrar();
})();