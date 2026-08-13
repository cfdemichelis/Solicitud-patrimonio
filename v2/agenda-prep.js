(()=>{
  const tocados=new WeakSet();
  function abrirParaLectura(){
    document.querySelectorAll('#tasks .request').forEach(req=>{
      if(tocados.has(req)) return;
      tocados.add(req);
      const det=req.matches('details')?req:req.closest('details');
      if(!det) return;
      const estabaAbierto=det.open;
      det.open=true;
      setTimeout(()=>{ if(!estabaAbierto && det.isConnected) det.open=false; },1800);
    });
  }
  const obs=new MutationObserver(abrirParaLectura);
  obs.observe(document.documentElement,{childList:true,subtree:true});
  abrirParaLectura();
})();