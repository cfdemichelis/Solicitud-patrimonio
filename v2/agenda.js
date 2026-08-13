(()=>{
  const registros=new Map();
  const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
  const ymd=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const parseYmd=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d)};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function datosRequest(n){
    const codigo=norm(n.querySelector('.request-code')?.textContent)||'Solicitud';
    const sub=norm(n.querySelector('.request-sub')?.textContent);
    const partes=sub.split('·').map(x=>x.trim()).filter(Boolean);
    const area=partes[0]||'';
    const tipo=partes[1]||'';
    const lugar=partes.slice(2).join(' · ');
    const estadoSel=n.querySelector('.estado');
    const estado=estadoSel?.options?.[estadoSel.selectedIndex]?.textContent?.trim()||estadoSel?.value||'';
    const texto=norm(n.innerText||n.textContent||'');
    return {codigo,area,tipo,lugar,estado,texto};
  }

  function capturar(){
    document.querySelectorAll('#tasks .request').forEach(n=>{
      const d=datosRequest(n); if(d.codigo) registros.set(d.codigo,d);
    });
    insertarBoton();
  }

  function movimientos(d){
    const out=[]; const t=d.texto;
    const add=(fecha,hora,mov)=>{if(fecha)out.push({...d,fecha,hora:hora||'',movimiento:mov})};
    const entrega=t.match(/Entrega\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?/i);
    const retiro=t.match(/Retiro(?:\s*\/\s*devoluci[oó]n)?\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?/i);
    if(entrega)add(entrega[1],entrega[2],'Entrega');
    if(retiro)add(retiro[1],retiro[2],'Retiro / devolución');
    if(!out.length){
      const f=t.match(/Fecha(?:\s+requerida|\s+relacionada|\s+de\s+entrega)?\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?/i)
        ||t.match(/(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?/);
      if(f)add(f[1],f[2],'Tarea');
    }
    return out;
  }

  function todos(){return [...registros.values()].flatMap(movimientos).sort((a,b)=>(a.fecha+a.hora).localeCompare(b.fecha+b.hora));}

  function rango(tipo){
    const h=new Date(); h.setHours(0,0,0,0);
    if(tipo==='hoy')return [ymd(h),ymd(h)];
    if(tipo==='manana'){const m=new Date(h);m.setDate(m.getDate()+1);return [ymd(m),ymd(m)]}
    const ini=new Date(h);const dow=(ini.getDay()+6)%7;ini.setDate(ini.getDate()-dow);
    const fin=new Date(ini);fin.setDate(fin.getDate()+6);return [ymd(ini),ymd(fin)];
  }

  function nombreFecha(s){return parseYmd(s).toLocaleDateString('es-AR',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});}
  function descargar(nombre,contenido,tipo){const b=new Blob([contenido],{type:tipo});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=nombre;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
  const csvVal=v=>`"${String(v??'').replaceAll('"','""')}"`;

  function exportarCSV(lista){
    const cab=['Fecha','Hora','Área','Código','Tipo','Movimiento','Lugar / destino','Estado'];
    const filas=lista.map(x=>[x.fecha,x.hora,x.area,x.codigo,x.tipo,x.movimiento,x.lugar,x.estado]);
    descargar(`agenda-patrimonio-${ymd(new Date())}.csv`,'\uFEFF'+[cab,...filas].map(r=>r.map(csvVal).join(';')).join('\r\n'),'text/csv;charset=utf-8');
  }

  function icsEsc(s){return String(s??'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n')}
  function exportarICS(lista){
    const lineas=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Patrimonio//Agenda Operativa//ES','CALSCALE:GREGORIAN'];
    lista.forEach((x,i)=>{
      const f=x.fecha.replaceAll('-',''); const hora=(x.hora||'').replace(':','');
      lineas.push('BEGIN:VEVENT',`UID:${icsEsc(x.codigo)}-${f}-${i}@patrimonio`);
      if(hora){lineas.push(`DTSTART:${f}T${hora}00`);const h=Number(hora.slice(0,2)),m=hora.slice(2);lineas.push(`DTEND:${f}T${String((h+1)%24).padStart(2,'0')}${m}00`)}else lineas.push(`DTSTART;VALUE=DATE:${f}`);
      lineas.push(`SUMMARY:${icsEsc(`${x.codigo} · ${x.area} · ${x.movimiento}`)}`,`DESCRIPTION:${icsEsc(`${x.tipo} · Estado: ${x.estado}`)}`);
      if(x.lugar)lineas.push(`LOCATION:${icsEsc(x.lugar)}`);
      lineas.push('END:VEVENT');
    });
    lineas.push('END:VCALENDAR');
    descargar(`agenda-patrimonio-${ymd(new Date())}.ics`,lineas.join('\r\n'),'text/calendar;charset=utf-8');
  }

  function css(){if(document.querySelector('#agendaStyles'))return;const s=document.createElement('style');s.id='agendaStyles';s.textContent=`
    .agenda-launch{margin-top:12px;width:100%;font-weight:750;background:#102033;color:white}
    .agenda-overlay{position:fixed;inset:0;background:rgba(16,32,51,.48);z-index:9999;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:18px}
    .agenda-modal{width:min(900px,100%);background:#fff;border-radius:18px;padding:18px;box-shadow:0 18px 55px rgba(0,0,0,.25)}
    .agenda-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.agenda-head h2{margin:0}.agenda-head p{margin:4px 0;color:#687383}
    .agenda-controls{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.agenda-controls button.active{background:#102033;color:#fff}.agenda-custom{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0 16px}.agenda-actions{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 18px}
    .agenda-day{margin:18px 0}.agenda-day h3{text-transform:capitalize;margin:0 0 8px;border-bottom:1px solid #e3e8ee;padding-bottom:7px}.agenda-item{display:grid;grid-template-columns:70px 1fr;gap:12px;padding:11px 4px;border-bottom:1px solid #edf0f3}.agenda-time{font-weight:800}.agenda-code{font-weight:800}.agenda-meta{color:#687383;font-size:13px;margin-top:3px}.agenda-empty{padding:22px;border:1px dashed #d6dde5;border-radius:12px;text-align:center;color:#687383}
    @media(max-width:650px){.agenda-overlay{padding:8px}.agenda-modal{padding:14px;border-radius:14px}.agenda-custom{grid-template-columns:1fr}.agenda-item{grid-template-columns:58px 1fr}.agenda-head{gap:8px}}
    @media print{body>*:not(.agenda-overlay){display:none!important}.agenda-overlay{position:static!important;background:none!important;padding:0!important}.agenda-modal{box-shadow:none!important;width:100%!important}.agenda-controls,.agenda-custom,.agenda-actions,.agenda-close{display:none!important}}
  `;document.head.appendChild(s)}

  function insertarBoton(){
    css(); const dash=document.querySelector('.admin-pro-dashboard'); if(!dash||dash.querySelector('.agenda-launch'))return;
    const b=document.createElement('button');b.className='agenda-launch';b.textContent='Agenda operativa';b.onclick=abrir;const hist=dash.querySelector('.admin-pro-history');hist?hist.before(b):dash.appendChild(b);
  }

  function abrir(){
    const [desde,hasta]=rango('semana');
    const ov=document.createElement('div');ov.className='agenda-overlay';ov.innerHTML=`<section class="agenda-modal"><div class="agenda-head"><div><h2>Agenda operativa</h2><p>Solicitudes ordenadas por fecha y hora</p></div><button class="agenda-close">✕</button></div><div class="agenda-controls"><button data-r="hoy">Hoy</button><button data-r="manana">Mañana</button><button data-r="semana" class="active">Esta semana</button></div><div class="agenda-custom"><label>Desde<input id="agendaDesde" type="date" value="${desde}"></label><label>Hasta<input id="agendaHasta" type="date" value="${hasta}"></label><label>Área<select id="agendaArea"><option value="">Todas</option>${[...new Set([...registros.values()].map(x=>x.area).filter(Boolean))].sort().map(a=>`<option>${esc(a)}</option>`).join('')}</select></label></div><div class="agenda-actions"><button id="agendaCsv">Exportar Excel / CSV</button><button id="agendaIcs">Agregar al calendario (.ics)</button><button id="agendaPrint">Imprimir / PDF</button></div><div id="agendaLista"></div></section>`;document.body.appendChild(ov);
    const render=()=>{const d=ov.querySelector('#agendaDesde').value,h=ov.querySelector('#agendaHasta').value,a=ov.querySelector('#agendaArea').value;const lista=todos().filter(x=>(!d||x.fecha>=d)&&(!h||x.fecha<=h)&&(!a||x.area===a));ov.dataset.lista=JSON.stringify(lista);const box=ov.querySelector('#agendaLista');if(!lista.length){box.innerHTML='<div class="agenda-empty">No hay movimientos para las fechas seleccionadas.</div>';return}const por={};lista.forEach(x=>(por[x.fecha]??=[]).push(x));box.innerHTML=Object.entries(por).map(([f,arr])=>`<section class="agenda-day"><h3>${esc(nombreFecha(f))}</h3>${arr.map(x=>`<div class="agenda-item"><div class="agenda-time">${esc(x.hora||'—')}</div><div><div class="agenda-code">${esc(x.codigo)} · ${esc(x.movimiento)}</div><div>${esc(x.area)} · ${esc(x.tipo)}${x.lugar?` · ${esc(x.lugar)}`:''}</div><div class="agenda-meta">Estado: ${esc(x.estado||'-')}</div></div></div>`).join('')}</section>`).join('')};
    ov.querySelector('.agenda-close').onclick=()=>ov.remove();ov.addEventListener('click',e=>{if(e.target===ov)ov.remove()});
    ov.querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ov.querySelectorAll('[data-r]').forEach(x=>x.classList.remove('active'));b.classList.add('active');const [d,h]=rango(b.dataset.r);ov.querySelector('#agendaDesde').value=d;ov.querySelector('#agendaHasta').value=h;render()});
    ov.querySelector('#agendaDesde').onchange=render;ov.querySelector('#agendaHasta').onchange=render;ov.querySelector('#agendaArea').onchange=render;
    const actual=()=>JSON.parse(ov.dataset.lista||'[]');ov.querySelector('#agendaCsv').onclick=()=>exportarCSV(actual());ov.querySelector('#agendaIcs').onclick=()=>exportarICS(actual());ov.querySelector('#agendaPrint').onclick=()=>window.print();render();
  }

  const ob=new MutationObserver(()=>setTimeout(capturar,0));ob.observe(document.documentElement,{childList:true,subtree:true});setInterval(capturar,1200);capturar();
})();