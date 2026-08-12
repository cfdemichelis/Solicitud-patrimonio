(()=>{
  function setLabel(id,text){
    const el=document.getElementById(id); if(!el) return;
    const lab=el.closest('label'); if(!lab) return;
    const node=[...lab.childNodes].find(n=>n.nodeType===3&&n.textContent.trim());
    if(node) node.textContent=text;
  }

  function prepararSelector(){
    document.querySelectorAll('select').forEach(sel=>{
      const opt=[...sel.options].find(o=>o.value==='traslado_logistica'||o.value==='movilidad_personal');
      const tienePedido=[...sel.options].some(o=>o.value==='pedido_elementos');
      const tieneTraslado=[...sel.options].some(o=>o.value==='traslado');
      if(!opt||!tienePedido||!tieneTraslado) return;
      opt.value='movilidad_personal';
      opt.textContent='Movilidad de personal';
      sel.dataset.logisticaTipo='1';
    });
  }

  function prepararFormulario(){
    const tipo=[...document.querySelectorAll('select[data-logistica-tipo="1"]')].find(s=>s.value==='movilidad_personal');
    if(!tipo) return;
    const form=document.querySelector('#lr')?.closest('form');
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
    const bloque=document.createElement('div');
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
      </div>
    `;
    const descLabel=desc?.closest('label');
    if(descLabel) descLabel.parentNode.insertBefore(bloque,descLabel);

    form.addEventListener('submit',()=>{
      const t=document.getElementById('tipoPersonalMovilidad');
      const c=document.getElementById('cantidadPersonasMovilidad');
      const a=document.getElementById('areaPersonalMovilidad');
      const r=document.getElementById('referenciaPersonalMovilidad');
      if(!desc||!t||!c||!a) return;
      let detalle=desc.value;
      if(desc.dataset.movilidadEstructurada==='1'){
        const ix=detalle.indexOf('\n\nDetalle: ');
        if(ix>=0) detalle=detalle.slice(ix+11);
      }
      const tipoTexto=t.options[t.selectedIndex]?.textContent||'';
      desc.value=`Movilidad de personal\nTipo: ${tipoTexto}\nCantidad de personas: ${c.value}\nÁrea / dependencia: ${a.value}${r?.value?`\nResponsable / referencia: ${r.value}`:''}\n\nDetalle: ${detalle}`;
      desc.dataset.movilidadEstructurada='1';
    },true);
  }

  function revisar(){prepararSelector();prepararFormulario();}
  const ob=new MutationObserver(()=>setTimeout(revisar,0));
  ob.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('change',e=>{if(e.target.matches('select[data-logistica-tipo="1"]'))setTimeout(revisar,0)});
  setInterval(revisar,800);
  revisar();
})();