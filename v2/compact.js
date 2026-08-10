(()=>{
  const FINALIZADOS = new Set(['finalizada','cancelada']);

  function textoEstado(card){
    const sel = card.querySelector('.estado');
    return sel ? sel.value : '';
  }

  function resumenCard(card){
    const codigo = card.querySelector('.task-code')?.textContent?.trim() || 'Solicitud';
    const chips = [...card.querySelectorAll('.task-badges .chip')].map(x=>x.textContent.trim());
    const estadoSel = card.querySelector('.estado');
    const estado = estadoSel ? estadoSel.options[estadoSel.selectedIndex]?.text : '';
    const prioridadSel = card.querySelector('.prio');
    const prioridad = prioridadSel ? prioridadSel.options[prioridadSel.selectedIndex]?.text : '';
    const meta = [chips[0], chips[1], estado, prioridad].filter(Boolean).join(' · ');
    const summary = document.createElement('summary');
    summary.className = 'pedido-resumen';
    summary.innerHTML = `<span class="pedido-codigo">${codigo}</span><span class="pedido-meta">${meta}</span><span class="pedido-flecha">⌄</span>`;
    return summary;
  }

  function prepararCard(card){
    if(card.closest('details.pedido-desplegable')) return card.closest('details.pedido-desplegable');
    const d = document.createElement('details');
    d.className = 'pedido-desplegable';
    const s = resumenCard(card);
    card.parentNode.insertBefore(d, card);
    d.appendChild(s);
    d.appendChild(card);
    return d;
  }

  function prepararPanel(){
    const tasks = document.querySelector('#tasks');
    if(!tasks || tasks.dataset.compactoProcesando === '1') return;
    const cards = [...tasks.querySelectorAll(':scope > .task, :scope > details.pedido-desplegable > .task')];
    if(!cards.length) return;

    tasks.dataset.compactoProcesando = '1';

    let activos = tasks.querySelector('.grupo-activos');
    let cerrados = tasks.querySelector('.grupo-cerrados');

    if(!activos){
      activos = document.createElement('section');
      activos.className = 'grupo-pedidos grupo-activos';
      activos.innerHTML = '<div class="grupo-titulo"><h3>Pendientes / En curso</h3><span class="contador-activos"></span></div><div class="lista-activos"></div>';
    }
    if(!cerrados){
      cerrados = document.createElement('details');
      cerrados.className = 'grupo-pedidos grupo-cerrados';
      cerrados.innerHTML = '<summary class="grupo-titulo"><h3>Finalizados / Cancelados</h3><span class="contador-cerrados"></span></summary><div class="lista-cerrados"></div>';
    }

    const listaA = activos.querySelector('.lista-activos');
    const listaC = cerrados.querySelector('.lista-cerrados');
    listaA.innerHTML = '';
    listaC.innerHTML = '';

    cards.forEach(card=>{
      const d = prepararCard(card);
      const estado = textoEstado(card);
      (FINALIZADOS.has(estado) ? listaC : listaA).appendChild(d);
    });

    [...tasks.children].forEach(ch=>{
      if(ch!==activos && ch!==cerrados && !ch.matches('.task,details.pedido-desplegable')) ch.remove();
    });
    tasks.innerHTML = '';
    tasks.appendChild(activos);
    tasks.appendChild(cerrados);

    const na = listaA.querySelectorAll('details.pedido-desplegable').length;
    const nc = listaC.querySelectorAll('details.pedido-desplegable').length;
    activos.querySelector('.contador-activos').textContent = `${na} pedido${na===1?'':'s'}`;
    cerrados.querySelector('.contador-cerrados').textContent = `${nc} pedido${nc===1?'':'s'}`;

    if(!na) listaA.innerHTML = '<p class="sin-pedidos">No hay pedidos pendientes.</p>';
    if(!nc) listaC.innerHTML = '<p class="sin-pedidos">No hay pedidos finalizados.</p>';

    delete tasks.dataset.compactoProcesando;
  }

  const css = document.createElement('style');
  css.textContent = `
    #tasks{display:block!important}
    .grupo-pedidos{margin-top:18px}
    .grupo-titulo{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 9px;padding:2px 2px}
    .grupo-titulo h3{margin:0;font-size:18px}
    .grupo-titulo span{font-size:13px;color:#667085;font-weight:700}
    details.grupo-cerrados>summary{cursor:pointer;list-style:none;border-top:1px solid #dde3e9;padding-top:16px}
    details.grupo-cerrados>summary::-webkit-details-marker{display:none}
    .pedido-desplegable{border:1px solid #dce3ea;border-radius:12px;background:#fff;margin:8px 0;overflow:hidden}
    .pedido-resumen{list-style:none;cursor:pointer;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:14px 15px}
    .pedido-resumen::-webkit-details-marker{display:none}
    .pedido-codigo{font-weight:800;font-size:16px;white-space:nowrap}
    .pedido-meta{font-size:13px;color:#667085;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .pedido-flecha{font-size:22px;line-height:1;transition:transform .15s}
    .pedido-desplegable[open]>.pedido-resumen .pedido-flecha{transform:rotate(180deg)}
    .pedido-desplegable>.task{border:0!important;border-top:1px solid #edf0f3!important;border-radius:0!important;margin:0!important}
    .pedido-desplegable>.task>.task-head{display:none!important}
    .sin-pedidos{color:#667085;padding:10px 4px}
    @media(max-width:700px){
      .pedido-resumen{grid-template-columns:1fr auto;grid-template-areas:'codigo flecha' 'meta flecha';gap:3px 8px;padding:13px}
      .pedido-codigo{grid-area:codigo}
      .pedido-meta{grid-area:meta;white-space:normal}
      .pedido-flecha{grid-area:flecha}
    }
  `;
  document.head.appendChild(css);

  const obs = new MutationObserver(()=>setTimeout(prepararPanel,0));
  obs.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('change',e=>{if(e.target.matches('.estado')) setTimeout(prepararPanel,250)});
  setInterval(prepararPanel,1200);
})();