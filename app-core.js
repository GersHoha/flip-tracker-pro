/* Flip Tracker Pro — app core: state, business logic, render loop. No build step, no framework. */
(function(){
'use strict';
const L = window.FTP;

function esc(s){
  if(s==null) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
window.esc = esc;

class App {
  constructor(root){
    this.root = root;
    this.mq = window.matchMedia('(max-width: 820px)');
    this.maps = {}; this.rt = {}; this.geo = {}; this.handlers = [];
    this.state = {ready:false, mq:this.mq.matches, screen:'home', moneyTab:'pnl', plusOpen:false, moreOpen:false,
      detailId:null, sellD:null, splitD:null, edit:null, quick:'', quickNote:'', lookupNote:'', evalNote:'',
      evalD:{ask:'',target:'',address:'',miles:'',min:'',tolls:'0',low:'',exp:'',high:'',feePct:'0',days:'7',prep:''},
      runD:null, runNote:'', search:'', fStatus:'all', fCat:'all', sortBy:'newest',
      range:'3m', aCat:'all', pnlMode:'month', pnlCur:0, expD:{date:'',cat:'Packing supplies',desc:'',amount:''},
      payD:{date:'',platform:'Facebook Marketplace',amount:'',note:''}, tollD:{name:'',amount:''}, catInput:'',
      data:null, mapStatus:'off', tokenDraft:'', guideOpen:false, toast:'', importNote:''};
  }
  L(){ return window.FTP; }
  mount(){
    this.onMq = e => this.setState({mq:e.matches});
    this.mq.addEventListener('change', this.onMq);
    this.boot();
    this.render();
    this.checkShareLink();
    setTimeout(() => { if(this.state.mq !== this.mq.matches) this.setState({mq:this.mq.matches}); }, 50);
  }
  boot(){
    const L = this.L(); let data = null;
    try{ data = JSON.parse(localStorage.getItem('ftp:v1')); }catch(e){}
    if(!data || !data.settings){ data = L.SEED(); try{ localStorage.setItem('ftp:v1', JSON.stringify(data)); }catch(e){} }
    if(!data.opsDone) data.opsDone = {};
    this.state = Object.assign({}, this.state, {ready:true, data, tokenDraft:data.settings.mapToken||''});
    this.applyTheme();
    if(data.settings.mapToken) this.initMapKit(data.settings.mapToken);
  }
  // ——— state / render ———
  setState(update, cb){
    this.state = Object.assign({}, this.state, typeof update === 'function' ? update(this.state) : update);
    this.render();
    if(cb) cb();
  }
  save(mut){
    this.state = Object.assign({}, this.state, (() => {
      const data = JSON.parse(JSON.stringify(this.state.data));
      mut(data);
      try{ localStorage.setItem('ftp:v1', JSON.stringify(data)); }catch(e){}
      return {data};
    })());
    this.render();
  }
  h(fn){ this.handlers.push(fn); return this.handlers.length-1; }
  render(){
    // While the user is typing, defer the re-render until they pause — the input
    // already shows the typed value, and rebuilding the DOM per keystroke makes
    // the screen jump on iOS.
    if(this._typing){
      clearTimeout(this._rt);
      this._rt = setTimeout(() => this.render(), 350);
      return;
    }
    clearTimeout(this._rt);
    const active = document.activeElement;
    const bindKey = active && active.getAttribute && active.getAttribute('data-bind');
    const selStart = active && ('selectionStart' in active) ? active.selectionStart : null;
    const selEnd = active && ('selectionEnd' in active) ? active.selectionEnd : null;
    const scrollY = window.scrollY;
    const scrolls = {};
    this.root.querySelectorAll('[data-skey]').forEach(el => { if(el.scrollTop) scrolls[el.getAttribute('data-skey')] = el.scrollTop; });
    this.handlers = [];
    const R = this.renderVals();
    this.lastR = R;
    this.root.innerHTML = this.template(R);
    this.wire();
    Object.keys(scrolls).forEach(k => { const el = this.root.querySelector('[data-skey="'+k+'"]'); if(el) el.scrollTop = scrolls[k]; });
    if(bindKey){
      let el = null;
      try{ el = this.root.querySelector('[data-bind="'+CSS.escape(bindKey)+'"]'); }catch(e){}
      if(el){ el.focus({preventScroll:true}); if(selStart!=null && el.setSelectionRange){ try{ el.setSelectionRange(selStart, selEnd); }catch(e){} } }
    }
    window.scrollTo(0, scrollY);
    this.mountAllMaps();
  }
  wire(){
    this.root.querySelectorAll('[data-h]').forEach(el => {
      const idx = +el.getAttribute('data-h');
      const fn = this.handlers[idx];
      if(!fn) return;
      const tag = el.tagName;
      let evt = 'click';
      if(tag==='SELECT') evt = 'change';
      else if(tag==='INPUT') evt = (el.type==='checkbox'||el.type==='file') ? 'change' : 'input';
      else if(tag==='TEXTAREA') evt = 'input';
      const typing = evt==='input' && (tag==='TEXTAREA' || (tag==='INPUT' && el.type!=='date'));
      el.addEventListener(evt, ev => {
        if(typing) this._typing = true;
        try{ fn(ev); } finally { this._typing = false; }
      });
      if(typing) el.addEventListener('blur', () => { if(this._rt){ clearTimeout(this._rt); this._rt = null; this.render(); } });
    });
  }
  toastMsg(t){ clearTimeout(this._tt); this.setState({toast:t}); this._tt = setTimeout(()=>this.setState({toast:''}), 2000); }
  copyText(t){ const done = ()=>this.toastMsg('Copied to clipboard'); if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(done, ()=>this.fallbackCopy(t, done)); } else this.fallbackCopy(t, done); }
  fallbackCopy(t, done){ const ta = document.createElement('textarea'); ta.value = t; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); try{ document.execCommand('copy'); done(); }catch(e){ this.toastMsg('Copy failed — select manually'); } ta.remove(); }
  vd(){ const d = this.state.data; return d; }
  st(){ return this.state.data.settings; }
  isMobile(){ return this.state.mq; }
  applyTheme(){
    const light = this.st().theme === 'light';
    const de = document.documentElement.style;
    const V = {'--color-bg':'#f1f1f6','--color-surface':'#ffffff','--color-text':'#22242e','--color-divider':'color-mix(in srgb, #22242e 15%, transparent)','--color-accent':'#6d5fc4','--color-accent-2':'#7a70bd',
      '--color-neutral-100':'#292b31','--color-neutral-200':'#3f424d','--color-neutral-300':'#595d6c','--color-neutral-400':'#75798c','--color-neutral-600':'#b2b6ca','--color-neutral-700':'#cfd3e5','--color-neutral-800':'#e4e7f5','--color-neutral-900':'#e9ebf4',
      '--color-accent-100':'#2b2741','--color-accent-200':'#423a6a','--color-accent-300':'#5d5294','--color-accent-400':'#6d5fc4','--color-accent-600':'#b5abfc','--color-accent-700':'#d2cefd','--color-accent-800':'#e7e5fe','--color-accent-900':'#f5f4ff',
      '--color-accent-2-100':'#2b293a','--color-accent-2-800':'#e7e5fe','--color-accent-2-900':'#f5f4ff',
      '--shadow-sm':'0 0 0 1px #e2e3ec','--shadow-md':'0 0 0 1px #dcdde8, 0 6px 18px rgba(30,32,48,0.10)','--shadow-lg':'0 0 0 1px #d4d5e2, 0 16px 40px rgba(30,32,48,0.16)'};
    Object.keys(V).forEach(k => light ? de.setProperty(k, V[k]) : de.removeProperty(k));
    document.documentElement.style.background = light ? '#f1f1f6' : '#161826';
    Object.values(this.maps).forEach(m => { try{ m.colorScheme = light ? window.mapkit.Map.ColorSchemes.Light : window.mapkit.Map.ColorSchemes.Dark; }catch(e){} });
  }
  // ——— MapKit ———
  initMapKit(token){
    if(!token){ this.setState({mapStatus:'off'}); return; }
    this.setState({mapStatus:'loading'});
    const start = () => {
      try{
        window.mapkit.addEventListener('configuration-change', e => { if(e.status === 'Initialized') this.setState({mapStatus:'ready'}); });
        window.mapkit.addEventListener('error', () => this.setState({mapStatus:'error'}));
        window.mapkit.init({authorizationCallback: d => d(token)});
        setTimeout(()=>{ if(this.state.mapStatus==='loading' && window.mapkit.maps) this.setState({mapStatus:'ready'}); }, 1500);
      }catch(e){ this.setState({mapStatus:'error'}); }
    };
    if(window.mapkit && window.mapkit.init) start();
    else { const sc = document.createElement('script'); sc.src = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.js'; sc.crossOrigin = 'anonymous'; sc.onload = start; sc.onerror = () => this.setState({mapStatus:'error'}); document.head.appendChild(sc); }
  }
  mapReady(){ return this.state.mapStatus === 'ready' && window.mapkit; }
  // MapKit callbacks silently never fire when the token isn't actually accepted —
  // race every lookup against a timeout so the UI can't get stuck on "Looking up…".
  withTimeout(p, ms){
    return new Promise((res, rej) => {
      const t = setTimeout(() => { const e = new Error('timeout'); e.ftpTimeout = true; this.setState({mapStatus:'error'}); rej(e); }, ms);
      p.then(v => { clearTimeout(t); res(v); }, e => { clearTimeout(t); rej(e); });
    });
  }
  geocode(q){
    if(this.geo[q]) return Promise.resolve(this.geo[q]);
    return this.withTimeout(new Promise((res, rej) => { new window.mapkit.Geocoder({getsUserLocation:false}).lookup(q, (e, d) => {
      if(e || !d || !d.results || !d.results.length) return rej(e || new Error('No match'));
      const r = d.results[0]; const out = {lat:r.coordinate.latitude, lng:r.coordinate.longitude, formatted:r.formattedAddress}; this.geo[q] = out; res(out);
    }); }), 10000);
  }
  route(a, b){
    return this.withTimeout(new Promise((res, rej) => { new window.mapkit.Directions().route({origin:new window.mapkit.Coordinate(a.lat,a.lng), destination:new window.mapkit.Coordinate(b.lat,b.lng), transportType:window.mapkit.Directions.Transport.Automobile}, (e, d) => {
      if(e || !d || !d.routes || !d.routes.length) return rej(e || new Error('No route'));
      const r = d.routes[0]; res({miles:Math.round(r.distance/1609.34*10)/10, min:Math.round(r.expectedTravelTime/60), polyline:r.polyline});
    }); }), 10000);
  }
  refFn(key){ return key; }
  mountAllMaps(){
    ['detail','eval','run','home'].forEach(key => {
      const el = this.root.querySelector('[data-map="'+key+'"]');
      this.mountMap(key, el);
    });
  }
  mountMap(key, el){
    if(!el){ if(this.maps[key]){ try{this.maps[key].destroy()}catch(e){} delete this.maps[key]; } return; }
    if(!this.mapReady()) return;
    if(this.maps[key] && this.maps[key].element === el) { this.populateMap(key); return; }
    try{
      const light = this.st().theme === 'light';
      const m = new window.mapkit.Map(el, {colorScheme: light ? window.mapkit.Map.ColorSchemes.Light : window.mapkit.Map.ColorSchemes.Dark, showsMapTypeControl:false, showsZoomControl:false, isRotationEnabled:false});
      this.maps[key] = m; this.populateMap(key);
    }catch(e){}
  }
  populateMap(key){
    const m = this.maps[key]; if(!m || !window.mapkit) return;
    const mk = window.mapkit; const s = this.st();
    try{
      m.removeAnnotations(m.annotations); m.removeOverlays(m.overlays);
      const items = [];
      const homePin = new mk.MarkerAnnotation(new mk.Coordinate(s.homeCoords.lat, s.homeCoords.lng), {title:'Home', color:'#75798c', glyphText:'H'});
      items.push(homePin);
      const addDest = (c, title, glyph) => { if(c) items.push(new mk.MarkerAnnotation(new mk.Coordinate(c.lat, c.lng), {title, color:'#9184d9', glyphText:glyph||''})); };
      if(key === 'detail'){ const it = this.vd().items.find(x=>x.id===this.state.detailId); if(it && it.coords) addDest(it.coords, it.title); const r = this.rt['d'+this.state.detailId]; if(r && r.polyline) items.push(r.polyline); }
      if(key === 'eval'){ const c = this.state.evalD.coords; addDest(c, 'Pickup'); const r = this.rt.eval; if(r && r.polyline) items.push(r.polyline); }
      if(key === 'run'){ const rd = this.state.runD; if(rd && rd.stops) rd.stops.forEach((sp,i)=> addDest(sp.coords, sp.title, String(i+1))); (this.rt.runLegs||[]).forEach(p => { if(p) items.push(p); }); }
      const style = new mk.Style({strokeColor:'#9184d9', lineWidth:3, strokeOpacity:0.85});
      items.forEach(x => { if(x instanceof mk.PolylineOverlay) x.style = style; });
      m.showItems(items, {animate:false, padding:new mk.Padding(34,34,34,34)});
    }catch(e){}
  }
  // ——— navigation ———
  go(id){ return () => { this.setState({screen:id, plusOpen:false, moreOpen:false}); window.scrollTo(0,0); }; }
  navHref(addr){ return 'https://maps.apple.com/?daddr=' + encodeURIComponent(addr||''); }
  // ——— drafts ———
  dset(draft, k, kind){ return e => { const v = kind==='check' ? e.target.checked : e.target.value; this.setState(s => { const o = Object.assign({}, s[draft]); o[k] = v; const out = {}; out[draft] = o; return out; }); }; }
  sset(k, isNum){ return e => { const raw = e.target.value; this.save(d => { d.settings[k] = isNum ? (this.L().num(raw) ?? 0) : raw; }); }; }
  // ——— items ———
  blankEdit(){ const L = this.L(); return {id:null, title:'', cat:this.st().categories[0]||'Other', platform:'Facebook Marketplace', status:'watching', ask:'', target:'', purchasePrice:'', purchaseDate:L.todayISO(), pickupDate:'', address:'', miles:'', min:'', tolls:'', listPrice:'', listDate:'', soldPrice:'', soldDate:'', soldPlatform:'Facebook Marketplace', feePct:'0', delivered:false, delAddress:'', delMiles:'', delTolls:'', condition:'', notes:'', url:'', coords:null, listedOn:[]}; }
  openEdit(id, prefill){ return () => {
    let e = this.blankEdit();
    if(id){ const it = this.vd().items.find(x=>x.id===id); if(it){ e = Object.assign(e, {id:it.id, title:it.title, cat:it.cat, platform:it.platform||'Facebook Marketplace', status:it.status, ask:it.ask??'', target:it.target??'', purchasePrice:it.purchasePrice??'', purchaseDate:it.purchaseDate||'', pickupDate:it.pickupDate||'', address:it.pickupAddress||'', miles:(it.pickup&&it.pickup.miles!=null)?String(it.pickup.miles):'', min:(it.pickup&&it.pickup.min!=null)?String(it.pickup.min):'', tolls:(it.pickup&&it.pickup.tolls)?String(it.pickup.tolls):'', listPrice:it.listPrice??'', listDate:it.listDate||'', soldPrice:it.soldPrice??'', soldDate:it.soldDate||'', soldPlatform:it.soldPlatform||'Facebook Marketplace', feePct:String(it.feePct||0), delivered:!!it.delivered, delAddress:(it.delivery&&it.delivery.address)||'', delMiles:(it.delivery&&it.delivery.miles!=null)?String(it.delivery.miles):'', delTolls:(it.delivery&&it.delivery.tolls)?String(it.delivery.tolls):'', condition:it.condition||'', notes:it.notes||'', url:it.url||'', coords:it.coords||null, listedOn:(it.listedOn||[]).slice()}); } }
    if(prefill) e = Object.assign(e, prefill);
    this.setState({edit:e, detailId:null, quick:'', quickNote:'', lookupNote:''});
  }; }
  closeEdit(){ return () => this.setState({edit:null}); }
  // ——— share-link import: ?add=<listing text> and/or ?title=&ask=&addr=&url=&platform= ———
  checkShareLink(){
    try{
      const q = new URLSearchParams(location.search);
      const raw = q.get('add');
      const hasStruct = q.get('title') || q.get('ask') || q.get('addr');
      if(!raw && !hasStruct) return;
      history.replaceState(null, '', location.pathname);
      const L = this.L();
      const p = raw ? L.parseListing(raw) : {title:'', ask:null, address:'', platform:'', url:''};
      const pre = {status:'watching'};
      const title = q.get('title') || p.title; if(title) pre.title = title;
      const ask = L.num(q.get('ask')); if(ask!=null) pre.ask = String(ask); else if(p.ask!=null) pre.ask = String(p.ask);
      const addr = q.get('addr') || p.address; if(addr) pre.address = addr;
      const url2 = q.get('url') || p.url; if(url2) pre.url = url2;
      const plat = q.get('platform') || p.platform; if(plat) pre.platform = plat;
      this.openEdit(null, pre)();
      this.setState({quick: raw||'', quickNote:'Imported from link — review the fields and save.'});
    }catch(e){}
  }
  pasteQuick(){ return async () => {
    try{
      const t = await navigator.clipboard.readText();
      if(!t || !t.trim()){ this.toastMsg('Clipboard is empty'); return; }
      this.setState({quick:t}, () => this.parseQuick()());
    }catch(e){ this.toastMsg('Paste not allowed — long-press the box and paste instead'); }
  }; }
  parseQuick(){ return () => { const L = this.L(); const p = L.parseListing(this.state.quick); if(!p.title && p.ask==null && !p.address){ this.setState({quickNote:'Couldn’t parse anything — fill the fields below manually.'}); return; }
    this.setState(s => ({edit:Object.assign({}, s.edit, {title:p.title||s.edit.title, ask:p.ask!=null?String(p.ask):s.edit.ask, address:p.address||s.edit.address, platform:p.platform||s.edit.platform, url:p.url||s.edit.url, status:'watching'}), quickNote:'Parsed: '+[p.title?'title':null, p.ask!=null?'price':null, p.address?'location':null].filter(Boolean).join(', ')+'. Review below.'}));
  }; }
  lookupEdit(){ return async () => {
    const e = this.state.edit; if(!e.address){ this.setState({lookupNote:'Enter a pickup address first.'}); return; }
    if(!this.mapReady()){ this.setState({lookupNote:'No MapKit token — enter miles manually, or add a token in Settings.'}); return; }
    this.setState({lookupNote:'Looking up route…'});
    try{ const c = await this.geocode(e.address); const r = await this.route(this.st().homeCoords, c);
      this.setState(s => ({edit:Object.assign({}, s.edit, {coords:{lat:c.lat,lng:c.lng}, miles:String(r.miles), min:String(r.min)}), lookupNote:'Route found: '+r.miles+' mi · '+r.min+' min one-way ('+c.formatted+')'}));
    }catch(err){ this.setState({lookupNote: err && err.ftpTimeout ? 'Route lookup timed out — your MapKit token may be invalid (check Settings). Enter miles manually meanwhile.' : 'Couldn’t geocode that address — check it or enter miles manually.'}); }
  }; }
  saveItem(){ return () => {
    const L = this.L(); const e = this.state.edit; if(!e.title.trim()){ this.toastMsg('Give it a title'); return; }
    this.save(d => {
      const n = L.num;
      const base = {title:e.title.trim(), cat:e.cat, platform:e.platform, status:e.status, ask:n(e.ask), target:n(e.target), purchasePrice:n(e.purchasePrice), purchaseDate:e.purchaseDate||null, pickupDate:e.pickupDate||null, pickupAddress:e.address.trim(), coords:e.coords, condition:e.condition, notes:e.notes, url:e.url, listPrice:n(e.listPrice), listDate:e.listDate||null, soldPrice:n(e.soldPrice), soldDate:e.soldDate||null, soldPlatform:e.soldPlatform, feeMode:'pct', feePct:n(e.feePct)||0, delivered:e.delivered, listedOn:e.listedOn};
      const ex = e.id ? d.items.find(x=>x.id===e.id) : null;
      const pickup = Object.assign({}, ex ? ex.pickup : null, {miles:n(e.miles), min:n(e.min), tolls:n(e.tolls)||0});
      // keep a run's or lot's allocated trip share unless the user changed the miles themselves
      const exMiles = (ex && ex.pickup && ex.pickup.miles!=null) ? ex.pickup.miles : null;
      if(ex && ex.pickup && (ex.pickup.runId || ex.pickup.alloc!=null) && n(e.miles)===exMiles){ if(ex.pickup.runId) pickup.runId = ex.pickup.runId; pickup.alloc = ex.pickup.alloc; pickup.rtMiles = ex.pickup.rtMiles; if(n(e.min)==null && ex.pickup.min!=null) pickup.min = ex.pickup.min; } else { delete pickup.runId; delete pickup.alloc; delete pickup.rtMiles; }
      base.pickup = pickup;
      base.delivery = e.delivered ? {address:e.delAddress, miles:n(e.delMiles), min:null, tolls:n(e.delTolls)||0} : null;
      if(e.status!=='watching' && !base.purchaseDate) base.purchaseDate = L.todayISO();
      if((e.status==='listed'||e.status==='sold') && !base.listDate) base.listDate = L.todayISO();
      if(e.status==='sold' && !base.soldDate) base.soldDate = L.todayISO();
      if(ex) Object.assign(ex, base);
      else d.items.unshift(Object.assign({id:L.uid(), createdAt:L.todayISO()}, base));
    });
    this.setState({edit:null}); this.toastMsg(e.id ? 'Item updated' : 'Item added');
  }; }
  delItem(id){ return () => {
    const it = this.vd().items.find(x=>x.id===id);
    const msg = (it&&it.isLot) ? 'Delete this lot record? Its parts stay as separate items.' : 'Delete this item? This can’t be undone.';
    if(!confirm(msg)) return;
    this.save(d => { d.items = d.items.filter(x=>x.id!==id); d.items.forEach(x => { if(x.lotId===id) delete x.lotId; }); });
    this.setState({detailId:null}); this.toastMsg('Item deleted');
  }; }
  openDetail(id){ return () => { this.setState({detailId:id, sellD:null}); if(this.mapReady()){ const it = this.vd().items.find(x=>x.id===id); if(it && it.coords && !this.rt['d'+id]){ this.route(this.st().homeCoords, it.coords).then(r => { this.rt['d'+id] = r; this.populateMap('detail'); this.render(); }).catch(()=>{}); } } }; }
  advance(id){ return () => {
    const L = this.L(); const it = this.vd().items.find(x=>x.id===id); if(!it || it.isLot) return;
    if(it.status==='watching'){ this.save(d => { const x = d.items.find(y=>y.id===id); x.status='purchased'; if(x.purchasePrice==null) x.purchasePrice = x.target!=null?x.target:x.ask; if(!x.purchaseDate) x.purchaseDate = L.todayISO(); }); this.toastMsg('Marked purchased'); }
    else if(it.status==='purchased'){ if(it.listPrice==null){ this.openEdit(id, {status:'listed', listDate:L.todayISO()})(); this.toastMsg('Set a listing price, then save'); return; } this.save(d => { const x = d.items.find(y=>y.id===id); x.status='listed'; if(!x.listDate) x.listDate = L.todayISO(); }); this.toastMsg('Marked listed'); }
    else if(it.status==='listed'){ this.setState({sellD:{price:it.listPrice!=null?String(it.listPrice):'', date:L.todayISO(), platform:it.listedOn[0]||it.platform||'Facebook Marketplace', feePct:String(it.feePct||0), delivered:false, delAddress:'', delMiles:'', delTolls:''}}); }
  }; }
  confirmSell(){ return () => {
    const L = this.L(); const sd = this.state.sellD; const id = this.state.detailId; const price = L.num(sd.price);
    if(price==null){ this.toastMsg('Enter the sold price'); return; }
    this.save(d => { const x = d.items.find(y=>y.id===id); if(!x) return; x.status='sold'; x.soldPrice=price; x.soldDate=sd.date||L.todayISO(); x.soldPlatform=sd.platform; x.feePct=L.num(sd.feePct)||0; x.delivered=sd.delivered; x.delivery = sd.delivered ? {address:sd.delAddress, miles:L.num(sd.delMiles), tolls:L.num(sd.delTolls)||0} : null; });
    this.setState({sellD:null}); this.toastMsg('Sold — nice flip!');
  }; }
  toggleListed(id, plat){ return () => this.save(d => { const x = d.items.find(y=>y.id===id); if(!x) return; x.listedOn = x.listedOn||[]; const i = x.listedOn.indexOf(plat); if(i>=0) x.listedOn.splice(i,1); else x.listedOn.push(plat); }); }
  renew(id){ return () => { this.save(d => { const x = d.items.find(y=>y.id===id); if(x) x.renewedDate = this.L().todayISO(); }); this.toastMsg('Renewal logged'); }; }
  reprice(id){ return () => { this.save(d => { const x = d.items.find(y=>y.id===id); if(x && x.listPrice!=null) x.listPrice = Math.round(x.listPrice*0.9); }); this.toastMsg('Repriced −10%'); }; }
  toggleOps(key){ return () => this.save(d => { const t = this.L().todayISO(); if(!d.opsDone) d.opsDone={}; const day = d.opsDone[t] || []; const i = day.indexOf(key); if(i>=0) day.splice(i,1); else day.push(key); d.opsDone = {}; d.opsDone[t] = day; }); }
  // ——— lot split (part out one purchase into several listings) ———
  openSplit(id){ return () => {
    const it = this.vd().items.find(x=>x.id===id); if(!it) return;
    const total = it.purchasePrice||0;
    const a = Math.floor(total/2*100)/100; const b = Math.round((total-a)*100)/100;
    this.setState({splitD:{parentId:id, parts:[{title:'',cost:String(a)},{title:'',cost:String(b)}]}, sellD:null});
  }; }
  cancelSplit(){ return () => this.setState({splitD:null}); }
  splitSetPart(i,k){ return e => this.setState(s => { const parts = s.splitD.parts.map(p=>Object.assign({},p)); parts[i][k] = e.target.value; return {splitD:Object.assign({}, s.splitD, {parts})}; }); }
  splitAddPart(){ return () => this.setState(s => ({splitD:Object.assign({}, s.splitD, {parts:s.splitD.parts.concat({title:'',cost:'0'})})})); }
  splitDelPart(i){ return () => this.setState(s => ({splitD:Object.assign({}, s.splitD, {parts:s.splitD.parts.filter((p,j)=>j!==i)})})); }
  splitEven(){ return () => this.setState(s => {
    const it = this.vd().items.find(x=>x.id===s.splitD.parentId); const total = (it&&it.purchasePrice)||0;
    const n = s.splitD.parts.length; const per = Math.floor(total/n*100)/100;
    const parts = s.splitD.parts.map((p,i)=>Object.assign({},p,{cost:String(i===n-1 ? Math.round((total-per*(n-1))*100)/100 : per)}));
    return {splitD:Object.assign({}, s.splitD, {parts})};
  }); }
  confirmSplit(){ return () => {
    const L = this.L(); const s = this.st(); const sd = this.state.splitD;
    const parent = this.vd().items.find(x=>x.id===sd.parentId); if(!parent) return;
    const parts = sd.parts.map(p=>({title:p.title.trim(), cost:L.num(p.cost)||0})).filter(p=>p.title);
    if(parts.length<2){ this.toastMsg('Name at least two parts'); return; }
    const totalCost = parts.reduce((a,p)=>a+p.cost,0); const orig = parent.purchasePrice||0;
    if(Math.abs(totalCost-orig)>0.02){ this.toastMsg('Part costs must add up to '+L.money(orig)); return; }
    const pt = L.pickupTrip(parent, s); const tripTotal = pt?pt.total:0; const rt = pt?pt.rtMiles:0; const min = (pt&&pt.min)?pt.min:0;
    const shares = parts.map(p => totalCost>0 ? p.cost/totalCost : 1/parts.length);
    this.save(d => {
      const px = d.items.find(x=>x.id===parent.id); if(!px) return;
      const idx = d.items.indexOf(px);
      const kids = parts.map((p,i)=>({id:L.uid(), createdAt:L.todayISO(), lotId:px.id, title:p.title, cat:px.cat, platform:px.platform, status:'purchased', ask:null, target:null, purchasePrice:p.cost, purchaseDate:px.purchaseDate, pickupAddress:px.pickupAddress, coords:px.coords, condition:'', notes:'', url:px.url||'', feeMode:'pct', feePct:0, listedOn:[], listPrice:null, listDate:null, soldPrice:null, soldDate:null, soldPlatform:null, delivered:false, delivery:null,
        pickup:{alloc:Math.round(shares[i]*tripTotal*100)/100, rtMiles:Math.round(shares[i]*rt*10)/10, min:Math.round(shares[i]*min)}}));
      px.isLot = true; px.lotCost = px.purchasePrice; px.purchasePrice = null;
      d.items.splice(idx+1, 0, ...kids);
    });
    this.setState({splitD:null}); this.toastMsg('Split into '+parts.length+' listings — tracked under the lot');
  }; }
  // ——— evaluator ———
  lookupEval(){ return async () => {
    const ev = this.state.evalD; if(!ev.address){ this.setState({evalNote:'Enter a pickup address first.'}); return; }
    if(!this.mapReady()){ this.setState({evalNote:'No MapKit token — enter miles manually, or add a token in Settings.'}); return; }
    this.setState({evalNote:'Looking up route…'});
    try{ const c = await this.geocode(ev.address); const r = await this.route(this.st().homeCoords, c); this.rt.eval = r;
      this.setState(s => ({evalD:Object.assign({}, s.evalD, {coords:{lat:c.lat,lng:c.lng}, miles:String(r.miles), min:String(r.min)}), evalNote:'Route: '+r.miles+' mi · '+r.min+' min one-way'}), ()=>this.populateMap('eval'));
    }catch(err){ this.setState({evalNote: err && err.ftpTimeout ? 'Route lookup timed out — your MapKit token may be invalid (check Settings).' : 'Couldn’t geocode that address.'}); }
  }; }
  evalCalc(){
    const L = this.L(); const s = this.st(); const ev = this.state.evalD; const n = L.num;
    const buy = n(ev.target)!=null ? n(ev.target) : n(ev.ask);
    const miles = n(ev.miles); const trip = miles!=null ? L.tripCost(miles, s, n(ev.tolls)||0) : null;
    const feeP = (n(ev.feePct)||0)/100; const prep = n(ev.prep)!=null?n(ev.prep):s.prepMin; const driveMin = n(ev.min)!=null?n(ev.min):(miles!=null?L.estMin(miles):null);
    const mk = v => { if(v==null || buy==null) return null; const net = v*(1-feeP) - buy - (trip?trip.total:0); const inv = buy + (trip?trip.total:0); return {net, roi: inv>0? net/inv*100 : null}; };
    const low = mk(n(ev.low)), exp = mk(n(ev.exp)), high = mk(n(ev.high));
    const hours = driveMin!=null ? (driveMin*2 + prep)/60 : null;
    const hourly = (exp && hours && hours>0) ? exp.net/hours : null;
    let verdict = null;
    if(exp){ verdict = exp.net >= 75 && (exp.roi||0) >= 40 ? 'green' : exp.net >= 25 ? 'yellow' : 'red'; }
    return {buy, trip, low, exp, high, hourly, verdict, hours, driveMin, prep};
  }
  evalConvert(){ return () => {
    const ev = this.state.evalD;
    this.openEdit(null, {title:'', status:'watching', ask:ev.ask, target:ev.target, address:ev.address, miles:ev.miles, min:ev.min, tolls:ev.tolls, listPrice:ev.exp, feePct:ev.feePct, coords:ev.coords||null})();
    this.toastMsg('Carried into a new item — add a title');
  }; }
  evalClear(){ return () => { this.rt.eval = null; this.setState({evalD:{ask:'',target:'',address:'',miles:'',min:'',tolls:'0',low:'',exp:'',high:'',feePct:'0',days:'7',prep:'',coords:null}, evalNote:''}); }; }
  applyToll(draft){ return e => { const id = e.target.value; if(!id) return; const p = this.vd().tollPresets.find(t=>t.id===id); if(!p) return; const o = {}; o[draft] = Object.assign({}, this.state[draft], {tolls:String(p.amount)}); this.setState(o); this.toastMsg(p.name+' applied'); e.target.value=''; }; }
  applyTollEdit(){ return e => { const id = e.target.value; if(!id) return; const p = this.vd().tollPresets.find(t=>t.id===id); if(!p) return; this.setState(s=>({edit:Object.assign({},s.edit,{tolls:String(p.amount)})})); e.target.value=''; }; }
  // ——— runs ———
  newRun(){ return () => this.setState({screen:'runs', runD:{name:'Sourcing run '+this.L().fmtDate(this.L().todayISO()), ids:[], split:'prop', tolls:'0', stops:null, legs:null, totalMiles:null, totalMin:null}, runNote:'', plusOpen:false, moreOpen:false}); }
  cancelRun(){ return () => { this.rt.runLegs = null; this.setState({runD:null}); }; }
  toggleRunItem(id){ return () => this.setState(s => { const ids = s.runD.ids.slice(); const i = ids.indexOf(id); if(i>=0) ids.splice(i,1); else ids.push(id); return {runD:Object.assign({}, s.runD, {ids, stops:null, legs:null})}; }); }
  optimizeRun(){ return async () => {
    const L = this.L(); const s = this.st(); const rd = this.state.runD;
    const items = this.vd().items.filter(x => rd.ids.includes(x.id));
    if(items.length < 2){ this.setState({runNote:'Pick at least two stops.'}); return; }
    const withC = items.filter(x=>x.coords), noC = items.filter(x=>!x.coords);
    const ordered = L.nnOrder(s.homeCoords, withC.map(x=>({id:x.id, title:x.title, addr:x.pickupAddress, coords:x.coords, own:x.pickup&&x.pickup.miles}))).concat(noC.map(x=>({id:x.id, title:x.title, addr:x.pickupAddress, coords:null, own:x.pickup&&x.pickup.miles})));
    let pts = [s.homeCoords].concat(ordered.map(o=>o.coords).filter(Boolean)); pts.push(s.homeCoords);
    const legs = []; let tm = 0;
    for(let i=0;i<pts.length-1;i++){ const mi = L.estMiles(pts[i], pts[i+1]) || 0; legs.push({miles:mi}); tm += mi; }
    let note = 'Nearest-neighbor order, straight-line estimate ×1.28.';
    this.setState({runD:Object.assign({}, rd, {stops:ordered, legs, totalMiles:Math.round(tm*10)/10, totalMin:L.estMin(tm)}), runNote:note}, ()=>this.populateMap('run'));
    if(this.mapReady() && ordered.every(o=>o.coords)){
      try{
        const real = []; const polys = []; let rm = 0, rmin = 0;
        for(let i=0;i<pts.length-1;i++){ const r = await this.route(pts[i], pts[i+1]); real.push({miles:r.miles}); polys.push(r.polyline); rm += r.miles; rmin += r.min; }
        this.rt.runLegs = polys;
        this.setState(st => ({runD:Object.assign({}, st.runD, {legs:real, totalMiles:Math.round(rm*10)/10, totalMin:rmin}), runNote:'MapKit driving route — leg-by-leg directions.'}), ()=>this.populateMap('run'));
      }catch(e){}
    }
  }; }
  runShares(rd, items){
    const L = this.L();
    const w = items.map(x => (x.pickup && x.pickup.miles) || (x.coords ? L.estMiles(this.st().homeCoords, x.coords) : null) || 1);
    const tot = w.reduce((a,b)=>a+b,0);
    return items.map((x,i) => rd.split==='even' ? 1/items.length : w[i]/tot);
  }
  saveRun(complete){ return () => {
    const L = this.L(); const s = this.st(); const rd = this.state.runD;
    if(!rd.stops){ this.setState({runNote:'Tap "Order the stops" first.'}); return; }
    const items = rd.stops.map(o => this.vd().items.find(x=>x.id===o.id)).filter(Boolean);
    const tolls = L.num(rd.tolls)||0;
    const gas = rd.totalMiles/(s.mpg||23)*(s.gasPrice||4); const wear = rd.totalMiles*(s.wearRate||0);
    const totalCost = Math.round((gas+wear+tolls)*100)/100;
    const shares = this.runShares(rd, items);
    const run = {id:L.uid(), name:rd.name||'Sourcing run', date:L.todayISO(), status: complete?'done':'planned', itemIds:items.map(x=>x.id), stops:rd.stops.map(o=>o.addr), destSummary:rd.stops.map(o=>o.addr&&o.addr.split(',')[0]).filter(Boolean).join(' → '), totalMiles:rd.totalMiles, totalMin:rd.totalMin, tolls, split:rd.split, totalCost};
    this.save(d => {
      d.runs.unshift(run);
      if(complete) items.forEach((x,i) => { const dx = d.items.find(y=>y.id===x.id); if(!dx) return;
        if(dx.status==='watching'){ dx.status='purchased'; if(dx.purchasePrice==null) dx.purchasePrice = dx.target!=null?dx.target:dx.ask; if(!dx.purchaseDate) dx.purchaseDate = L.todayISO(); }
        dx.pickup = Object.assign({}, dx.pickup, {runId:run.id, alloc:Math.round(shares[i]*totalCost*100)/100, rtMiles:Math.round(shares[i]*rd.totalMiles*10)/10, min:Math.round(shares[i]*(rd.totalMin||0))});
      });
    });
    this.rt.runLegs = null; this.setState({runD:null}); this.toastMsg(complete ? 'Run completed — costs split & mileage logged' : 'Run saved');
  }; }
  completeRun(id){ return () => {
    const L = this.L();
    this.save(d => { const r = d.runs.find(x=>x.id===id); if(!r || r.status==='done') return; r.status='done'; r.date = L.todayISO();
      const items = r.itemIds.map(i=>d.items.find(y=>y.id===i)).filter(Boolean);
      const w = items.map(x => (x.pickup && x.pickup.miles) || 1); const tot = w.reduce((a,b)=>a+b,0);
      items.forEach((dx,i) => { const share = r.split==='even' ? 1/items.length : w[i]/tot;
        if(dx.status==='watching'){ dx.status='purchased'; if(dx.purchasePrice==null) dx.purchasePrice = dx.target!=null?dx.target:dx.ask; if(!dx.purchaseDate) dx.purchaseDate = L.todayISO(); }
        dx.pickup = Object.assign({}, dx.pickup, {runId:r.id, alloc:Math.round(share*r.totalCost*100)/100, rtMiles:Math.round(share*r.totalMiles*10)/10, min:Math.round(share*(r.totalMin||0))}); });
    });
    this.toastMsg('Run completed — costs split & mileage logged');
  }; }
  delRun(id){ return () => { if(!confirm('Delete this run? Items keep their own trip data; split costs are removed.')) return;
    this.save(d => { d.runs = d.runs.filter(x=>x.id!==id); d.items.forEach(x => { if(x.pickup && x.pickup.runId===id){ delete x.pickup.runId; delete x.pickup.alloc; delete x.pickup.rtMiles; } }); });
  }; }
  // ——— money ———
  pnlRange(){
    const L = this.L(); const now = new Date(); const m = this.state.pnlMode; const c = this.state.pnlCur;
    if(m==='month'){ const d = new Date(now.getFullYear(), now.getMonth()+c, 1); const k = L.iso(d).slice(0,7); return {r:L.monthRange(k), label:['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()]+' '+d.getFullYear()}; }
    if(m==='quarter'){ const qAbs = Math.floor(now.getMonth()/3) + c; const y = now.getFullYear() + Math.floor(qAbs/4); const q = ((qAbs%4)+4)%4; return {r:L.quarterRange(y, q+1), label:'Q'+(q+1)+' '+y}; }
    const y = now.getFullYear()+c; return {r:[y+'-01-01', y+'-12-31'], label:String(y)};
  }
  addExpense(){ return () => { const L = this.L(); const e = this.state.expD; const amt = L.num(e.amount); if(!e.desc.trim() || amt==null){ this.toastMsg('Description and amount required'); return; }
    this.save(d => d.expenses.unshift({id:L.uid(), date:e.date||L.todayISO(), cat:e.cat, desc:e.desc.trim(), amount:amt}));
    this.setState({expD:{date:'',cat:this.state.expD.cat,desc:'',amount:''}}); this.toastMsg('Expense logged'); }; }
  delExpense(id){ return () => this.save(d => { d.expenses = d.expenses.filter(x=>x.id!==id); }); }
  addPayout(){ return () => { const L = this.L(); const p = this.state.payD; const amt = L.num(p.amount); if(amt==null){ this.toastMsg('Enter an amount'); return; }
    this.save(d => d.payouts.unshift({id:L.uid(), date:p.date||L.todayISO(), platform:p.platform, amount:amt, note:p.note}));
    this.setState({payD:{date:'',platform:this.state.payD.platform,amount:'',note:''}}); this.toastMsg('Payout recorded'); }; }
  delPayout(id){ return () => this.save(d => { d.payouts = d.payouts.filter(x=>x.id!==id); }); }
  exportCSV(kind){ return () => {
    const L = this.L(); const d = this.vd(); const s = this.st();
    if(kind==='items'){ const rows = [['Title','Category','Status','Platform','Purchase $','Purchase date','Sold $','Sold date','Fees $','Trip cost $','Net profit $','ROI %','Days listed','Pickup address','RT miles']];
      d.items.forEach(it => { const ec = L.itemEcon(it, s); rows.push([it.title, it.cat, it.status, it.platform, it.purchasePrice, it.purchaseDate, it.soldPrice, it.soldDate, ec.fees?ec.fees.toFixed(2):'', ec.tripTotal?ec.tripTotal.toFixed(2):'', ec.net!=null?ec.net.toFixed(2):'', ec.roi!=null?ec.roi.toFixed(1):'', ec.daysListed, it.pickupAddress, ec.tripMiles?ec.tripMiles.toFixed(1):'']); });
      L.download('flip-tracker-items.csv', L.toCSV(rows), 'text/csv'); }
    if(kind==='mileage'){ const rows = [['Date','Business purpose','Destination','Round-trip miles','Actual vehicle cost $','Standard deduction $ @ '+s.stdRate.toFixed(2)]];
      let tm=0, tc=0; L.mileageLog(d, s).forEach(r => { tm+=r.rtMiles; tc+=r.cost; rows.push([r.date, r.purpose, r.dest, r.rtMiles.toFixed(1), r.cost.toFixed(2), (r.rtMiles*s.stdRate).toFixed(2)]); });
      rows.push(['TOTAL','','',tm.toFixed(1),tc.toFixed(2),(tm*s.stdRate).toFixed(2)]);
      L.download('flip-tracker-mileage-log.csv', L.toCSV(rows), 'text/csv'); }
    if(kind==='expenses'){ const rows = [['Date','Category','Description','Amount $']]; d.expenses.forEach(e => rows.push([e.date, e.cat, e.desc, e.amount.toFixed(2)])); L.download('flip-tracker-expenses.csv', L.toCSV(rows), 'text/csv'); }
    if(kind==='pnl'){ const pr = this.pnlRange(); const p = L.rangePnl(d, s, pr.r[0], pr.r[1]);
      const rows = [['Flip Tracker Pro — P&L', pr.label], ['Gross sales', p.gross.toFixed(2)], ['Cost of goods sold', (-p.cogs).toFixed(2)], ['Platform fees', (-p.fees).toFixed(2)], ['Vehicle costs (actual)', (-p.vehicle).toFixed(2)], ['Other business expenses', (-p.other).toFixed(2)], ['Net profit', p.net.toFixed(2)], ['Items sold', p.units], ['Business miles', p.miles.toFixed(1)]];
      L.download('flip-tracker-pnl-'+pr.label.replace(/\s/g,'-').toLowerCase()+'.csv', L.toCSV(rows), 'text/csv'); }
    if(kind==='json'){ L.download('flip-tracker-backup.json', JSON.stringify(this.state.data, null, 1), 'application/json'); }
    this.toastMsg('Export started');
  }; }
  importJSON(){ return e => { const f = e.target.files && e.target.files[0]; if(!f) return; const rd = new FileReader();
    rd.onload = () => { try{ const j = JSON.parse(rd.result); if(!j.items || !j.settings) throw new Error('bad'); localStorage.setItem('ftp:v1', JSON.stringify(j)); this.setState({data:j, importNote:'Backup restored — '+j.items.length+' items.'}, ()=>this.applyTheme()); }catch(err){ this.setState({importNote:'That file didn’t look like a Flip Tracker backup.'}); } };
    rd.readAsText(f); e.target.value=''; }; }
  // ——— settings ———
  saveToken(){ return () => { const t = this.state.tokenDraft.trim(); this.save(d => { d.settings.mapToken = t; }); if(t) this.initMapKit(t); else this.setState({mapStatus:'off'}); this.toastMsg(t?'Token saved — connecting…':'Token cleared'); }; }
  homeLookup(){ return async () => { if(!this.mapReady()){ this.toastMsg('Add a MapKit token first'); return; }
    try{ const c = await this.geocode(this.st().homeAddress); this.save(d => { d.settings.homeCoords = {lat:c.lat, lng:c.lng}; }); this.toastMsg('Home base geocoded: '+c.formatted); this.populateMap('home'); }catch(e){ this.toastMsg('Couldn’t geocode that address'); } }; }
  addToll(){ return () => { const L = this.L(); const t = this.state.tollD; const amt = L.num(t.amount); if(!t.name.trim() || amt==null){ this.toastMsg('Name and amount required'); return; }
    this.save(d => d.tollPresets.push({id:L.uid(), name:t.name.trim(), amount:amt})); this.setState({tollD:{name:'',amount:''}}); }; }
  delToll(id){ return () => this.save(d => { d.tollPresets = d.tollPresets.filter(x=>x.id!==id); }); }
  addCat(){ return () => { const c = this.state.catInput.trim(); if(!c) return; this.save(d => { if(!d.settings.categories.includes(c)) d.settings.categories.push(c); }); this.setState({catInput:''}); }; }
  delCat(c){ return () => this.save(d => { d.settings.categories = d.settings.categories.filter(x=>x!==c); }); }
  setTheme(v){ return () => { this.save(d => { d.settings.theme = v; }); setTimeout(()=>this.applyTheme(), 0); }; }
  clearDemo(){ return () => { if(!confirm('Remove all demo records? Your own entries stay.')) return; this.save(d => { ['items','runs','expenses','payouts','templates','tollPresets'].forEach(k => { d[k] = (d[k]||[]).filter(x=>!x.demo); }); }); this.toastMsg('Demo data cleared'); }; }
  resetAll(){ return () => { if(!confirm('Reset EVERYTHING to a fresh demo state?')) return; const data = this.L().SEED(); localStorage.setItem('ftp:v1', JSON.stringify(data)); this.setState({data, tokenDraft:data.settings.mapToken||''}, ()=>this.applyTheme()); this.toastMsg('Reset to demo state'); }; }
  addTpl(){ return () => this.save(d => d.templates.push({id:this.L().uid(), name:'New template', body:''})); }
  delTpl(id){ return () => this.save(d => { d.templates = d.templates.filter(x=>x.id!==id); }); }
  tplSet(id, k){ return e => { const v = e.target.value; this.save(d => { const t = d.templates.find(x=>x.id===id); if(t) t[k] = v; }); }; }
  feeSet(i, k){ return e => { const v = e.target.value; this.save(d => { const f = d.settings.feePresets[i]; if(f) f[k] = k==='pct' ? (this.L().num(v)||0) : v; }); }; }
  addFee(){ return () => this.save(d => d.settings.feePresets.push({name:'New platform', pct:10})); }
  delFee(i){ return () => this.save(d => { d.settings.feePresets.splice(i,1); }); }
  // ——— helpers ———
  catIcon(c){ return {'Electronics':'ph ph-cpu','Fitness equipment':'ph ph-barbell','Furniture':'ph ph-armchair','Auto parts':'ph ph-car-profile','Tools':'ph ph-wrench'}[c] || 'ph ph-package'; }
  statusCls(st){ return {watching:'tag tag-neutral', purchased:'tag tag-accent-2', listed:'tag tag-outline', sold:'tag tag-accent'}[st]; }
  statusLabel(st){ return {watching:'Watching', purchased:'Purchased', listed:'Listed', sold:'Sold'}[st]; }
  itemDate(it){ return it.soldDate || it.listDate || it.purchaseDate || it.createdAt || ''; }
  GOOD(){ return 'oklch(0.74 0.13 155)'; } WARN(){ return 'oklch(0.78 0.12 85)'; } BAD(){ return 'oklch(0.68 0.14 25)'; }
  fld(label, val, set, type, ph, w){ return {label, val:val==null?'':String(val), set, type:type||'text', ph:ph||'', w:w||'46%'}; }
  // ——— template helpers ———
  fieldHTML(f){
    return '<div class="field" style="flex:1 1 '+f.w+'"><label>'+esc(f.label)+'</label><input class="input" type="'+f.type+'" placeholder="'+esc(f.ph)+'" value="'+esc(f.val)+'"'+(f.bind?' data-bind="'+esc(f.bind)+'"':'')+' data-h="'+this.h(f.set)+'"></div>';
  }
  selectHTML(opts, current, onChange, extraAttrs){
    return '<select class="input" '+(extraAttrs||'')+' data-h="'+this.h(onChange)+'">'+opts.map(o=>'<option value="'+esc(o.v)+'"'+(String(o.v)===String(current)?' selected':'')+'>'+esc(o.label)+'</option>').join('')+'</select>';
  }
  btnH(fn, label, opts){
    opts = opts||{};
    return '<button type="button" class="'+(opts.cls||'')+'" data-h="'+this.h(fn)+'"'+(opts.attrs||'')+'>'+(opts.html||esc(label))+'</button>';
  }
}
window.App = App;
})();
