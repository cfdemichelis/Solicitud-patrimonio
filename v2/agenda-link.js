(()=>{
  function poner(){
    const panel=document.querySelector('.admin-pro-dashboard');
    if(!panel||panel.querySelector('#agendaLinkSeguro'))return;
    const historial=panel.querySelector('#adminHistory');
    const a=document.createElement('a');
    a.id='agendaLinkSeguro';
    a.href='./agenda.html?from=panel';
    a.textContent='Agenda operativa →';
    a.style.cssText='display:flex;justify-content:space-between;align-items:center;width:100%;box-sizing:border-box;margin-top:12px;padding:14px;border-radius:10px;background:#102033;color:#fff;text-decoration:none;font-weight:750';
    historial?historial.before(a):panel.appendChild(a);
  }
  const ob=new MutationObserver(()=>poner());
  ob.observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(poner,300);setTimeout(poner,1000);
})();