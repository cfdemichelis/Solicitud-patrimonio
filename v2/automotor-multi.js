(()=>{
  const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

  function esSelectAutomotor(sel){
    if(!sel||sel.dataset.autoMulti==='1') return false;
    const textos=[...sel.options].map(o=>norm(o.textContent));
    const tieneAceite=textos.some(t=>t.includes('aceite'));
    const tieneFiltro=textos.some(t=>t.includes('filtro'));
    if(!tieneAceite||!tieneFiltro) return false;
    const contexto=norm((sel.closest('form,section,.card,.panel,main')||sel.parentElement)?.textContent||'');
    return contexto.includes('automotor')||textos.some(t=>t.includes('vtv'))||textos.some(t=>t.includes('cedula'));
  }

  function asegurarCss(){
    if(document.querySelector('#autoMultiStyles')) return;
    const s=document.createElement('style');
    s.id='autoMultiStyles';
    s.textContent=`
      .auto-multi-original{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}
      .auto-multi-box{margin-top:8px;padding:12px;border:1px solid #dce3ea;border-radius:12px;background:#f8fafc}
      .auto-multi-title{font-weight:750;margin-bottom:4px}.auto-multi-help{font-size:13px;color:#687383;margin-bottom:10px}
      .auto-multi-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
      .auto-multi-option{display:flex;align-items:flex-start;gap:9px;padding:10px;border:1px solid #dce3ea;border-radius:10px;background:#fff;cursor:pointer;line-height:1.25}
      .auto-multi-option input{margin-top:2px;transform:scale(1.15)}
      .auto-multi-option:has(input:checked){border-color:#102033;box-shadow:0 0 0 1px #102033;background:#f2f6fa}
      @media(max-width:620px){.auto-multi-grid{grid-template-columns:1fr}.auto-multi-option{padding:12px}}
    `;
    document.head.appendChild(s);
  }

  function opcionesValidas(sel){
    return [...sel.options].filter(o=>o.value&&norm(o.textContent).trim()&&!/seleccion|elegir|opcion/.test(norm(o.textContent)));
  }

  function valorCombinado(sel,values,labels){
    let opt=sel.querySelector('option[data-auto-combinada="1"]');
    if(values.length<=1){
      if(opt) opt.remove();
      sel.value=values[0]||'';
      return;
    }
    if(!opt){opt=document.createElement('option');opt.dataset.autoCombinada='1';sel.appendChild(opt);}
    opt.value=values.join('+');
    opt.textContent=labels.join(' + ');
    opt.selected=true;
    sel.value=opt.value;
  }

  function mejorar(sel){
    if(!esSelectAutomotor(sel)) return;
    asegurarCss();
    sel.dataset.autoMulti='1';
    sel.classList.add('auto-multi-original');

    const box=document.createElement('div');
    box.className='auto-multi-box';
    box.innerHTML='<div class="auto-multi-title">Trabajo solicitado</div><div class="auto-multi-help">Podés elegir una o varias opciones.</div><div class="auto-multi-grid"></div>';
    const grid=box.querySelector('.auto-multi-grid');
    const opts=opcionesValidas(sel);

    opts.forEach(o=>{
      const label=document.createElement('label');
      label.className='auto-multi-option';
      const ck=document.createElement('input');
      ck.type='checkbox';
      ck.value=o.value;
      ck.dataset.label=o.textContent.trim();
      if(sel.value===o.value) ck.checked=true;
      const span=document.createElement('span');
      span.textContent=o.textContent.trim();
      label.append(ck,span);
      grid.appendChild(label);
    });
    sel.insertAdjacentElement('afterend',box);

    function seleccion(){
      const cks=[...box.querySelectorAll('input[type="checkbox"]:checked')];
      return {values:cks.map(c=>c.value),labels:cks.map(c=>c.dataset.label)};
    }

    function sincronizar(disparar=true,preferida=''){
      const {values,labels}=seleccion();
      if(disparar&&values.length){
        let primaria=preferida&&values.includes(preferida)?preferida:values[values.length-1];
        const especial=values.find(v=>/repar|otro|extrav/i.test(v));
        if(especial) primaria=especial;
        sel.value=primaria;
        sel.dispatchEvent(new Event('change',{bubbles:true}));
      }
      valorCombinado(sel,values,labels);
    }

    box.addEventListener('change',e=>{
      if(e.target.matches('input[type="checkbox"]')) sincronizar(true,e.target.value);
    });

    const form=sel.closest('form');
    if(form){
      form.addEventListener('submit',()=>sincronizar(false),true);
      form.addEventListener('click',e=>{if(e.target.closest('button[type="submit"],input[type="submit"]')) sincronizar(false);},true);
    }
  }

  function revisar(){document.querySelectorAll('select').forEach(mejorar);}
  const ob=new MutationObserver(()=>setTimeout(revisar,0));
  ob.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',revisar);
  setInterval(revisar,900);
  revisar();
})();