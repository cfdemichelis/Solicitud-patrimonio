(()=>{
  const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();

  function esSelectorLogistica(sel){
    const txt=[...sel.options].map(o=>norm(o.textContent));
    return txt.some(t=>t.includes('pedido de elementos')) && txt.some(t=>t.includes('traslado de cosas'));
  }

  function opcionMovilidad(sel){
    return [...sel.options].find(o=>{
      const t=norm(o.textContent);
      return t.includes('traslado de elementos de logistica') || t.includes('movilidad de personal');
    });
  }

  function setLabel(id,text){
    const el=document.getElementById(id); if(!el) return;
    const lab=el.closest('label'); if(!lab) return;
    const node=[...lab.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
    if(node) node.textContent=text;
  }

  function prepararFormulario(sel){
    const actual=sel.options[sel.selectedIndex];
    if(!actual||norm(actual.textContent)!=='movilidad de personal') return;
    const form=(document.querySelector('#lr')||document.querySelector('#lugarRetiro'))?.closest('form');
    if(!form||form.dataset.movilidadPreparada==='1') return;
    form.dataset.movilidadPreparada='1';

    setLabel('lr','Lugar de salida');
    setLabel('dr','Dirección de salida');
    setLabel('fre','Fecha de salida');
    setLabel('hre','Hora de salida');
    setLabel('lugar','Lugar de destino');
    setLabel('dir','Dirección de destino');
    setLabel('fen','Fecha de llegada');
    setLabel('hen','Hora estimada de llegada');
    setLabel('desc','Detalle del traslado / observaciones');

    const desc=document.getElementById('desc');
    if(!document.getElementById('movilidadPersonalExtra')){
      const bloque=document.createElement('div');
      bloque.id='movilidadPersonalExtra';
      bloque.className='full movilidad-personal-box';
      bloque.innerHTML=`
        <h3 style="margin:0 0 8px">Personal a trasladar</h3>
        <div class="grid">
          <label>Tipo de personal
            <select id="tipoPersonalMovilidad" required>
              <option value="propio">Personal propio</option>
              <option value="otra_area">Personal de otra área</option>
              <option value="mixto">Personal mixto</option>
            </select>
          </label>
          <label>Cantidad de personas
            <input id="cantidadPersonasMovilidad" type="number" min="1" required>
          </label>
          <label>Área / dependencia del personal
            <input id="areaPersonalMovilidad" type="text" required>
          </label>
          <label>Responsable o referencia del grupo (opcional)
            <input id="referenciaPersonalMovilidad" type="text">
          </label>
        </div>`;
      const descLabel=desc?.closest('label');
      if(descLabel) descLabel.parentNode.insertBefore(bloque,descLabel); else form.appendChild(bloque);
    }

    form.addEventListener('submit',()=>{
      const t=document.getElementById('tipoPersonalMovilidad');
      const c=document.getElementById('cantidadPersonasMovilidad');
      const a=document.getElementById('areaPersonalMovilidad');
      const r=document.getElementById('referenciaPersonalMovilidad');
      if(!desc||!t||!c||!a) return;
      let detalle=desc.value||'';
      if(desc.dataset.movilidadEstructurada==='1'){
        const ix=detalle.indexOf('\n\nDetalle: ');
        if(ix>=0) detalle=detalle.slice(ix+11);
      }
      const tipoTexto=t.options[t.selectedIndex]?.textContent||'';
      desc.value=`Movilidad de personal\nTipo: ${tipoTexto}\nCantidad de personas: ${c.value}\nÁrea / dependencia: ${a.value}${r?.value?`\nResponsable / referencia: ${r.value}`:''}\n\nDetalle: ${detalle}`;
      desc.dataset.movilidadEstructurada='1';
    },true);
  }

  function detectar(){
    for(const sel of document.querySelectorAll('select')){
      if(!esSelectorLogistica(sel)) continue;
      const opt=opcionMovilidad(sel); if(!opt) continue;
      opt.textContent='Movilidad de personal';
      sel.addEventListener('change',()=>setTimeout(()=>prepararFormulario(sel),0),{once:false});
      return true;
    }
    return false;
  }

  // Observa sólo hasta que el selector de Logística exista; después se desconecta.
  if(!detectar()){
    const obs=new MutationObserver(()=>{
      if(detectar()) obs.disconnect();
    });
    obs.observe(document.documentElement,{childList:true,subtree:true});
  }
})();