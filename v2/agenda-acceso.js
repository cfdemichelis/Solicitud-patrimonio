(()=>{
  const esAdmin=()=>[...document.querySelectorAll('h2')].some(h=>/Panel\s*·.*\(admin\)/i.test(h.textContent||''));
  const enAgenda=()=>[...document.querySelectorAll('.admin-pro-areahead h3,h3')].some(h=>/Agenda operativa/i.test(h.textContent||''));

  function abrirAgenda(){
    if(enAgenda()) return;
    const directo=document.querySelector('#adminAgenda');
    if(directo){ directo.click(); return; }
    const volver=document.querySelector('#adminBack');
    if(volver){
      volver.click();
      let intentos=0;
      const t=setInterval(()=>{
        const b=document.querySelector('#adminAgenda');
        if(b){clearInterval(t);b.click();return}
        if(++intentos>20)clearInterval(t);
      },100);
      return;
    }
    let intentos=0;
    const t=setInterval(()=>{
      const b=document.querySelector('#adminAgenda');
      if(b){clearInterval(t);b.click();return}
      if(++intentos>30)clearInterval(t);
    },100);
  }

  function ponerAcceso(){
    if(!esAdmin()||document.querySelector('#agendaAccesoDirecto')) return;
    const b=document.createElement('button');
    b.id='agendaAccesoDirecto';
    b.type='button';
    b.textContent='Agenda';
    b.setAttribute('aria-label','Abrir agenda operativa');
    b.onclick=()=>{location.hash='agenda';abrirAgenda()};
    document.body.appendChild(b);

    if(!document.querySelector('#agendaAccesoStyle')){
      const s=document.createElement('style');
      s.id='agendaAccesoStyle';
      s.textContent=`
        #agendaAccesoDirecto{position:fixed;right:14px;bottom:18px;z-index:9998;border:0;border-radius:999px;padding:12px 18px;background:#102033;color:#fff;font:700 15px system-ui;box-shadow:0 6px 20px rgba(0,0,0,.22);cursor:pointer}
        #agendaAccesoDirecto:active{transform:scale(.97)}
        @media(max-width:600px){#agendaAccesoDirecto{right:12px;bottom:14px;padding:11px 16px;font-size:14px}}
        @media print{#agendaAccesoDirecto{display:none!important}}
      `;
      document.head.appendChild(s);
    }
  }

  function revisar(){
    ponerAcceso();
    if(location.hash==='#agenda'&&esAdmin()&&!enAgenda()) abrirAgenda();
  }

  const ob=new MutationObserver(()=>setTimeout(revisar,0));
  ob.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('hashchange',revisar);
  setTimeout(revisar,200);
  setTimeout(revisar,900);
})();