/* Flip Tracker Pro — view-model builders (per screen). Attached to App.prototype. */
(function(){
'use strict';

App.prototype.renderVals = function(){
    const mobile = this.isMobile(); const desktop = !mobile;
    const S = this.state; const shell = {ready:S.ready, mobile, desktop, mainPad: mobile?'14px 14px 130px':'30px 34px 60px', toast:S.toast, hasToast:!!S.toast};
    const NAVDEF = [['home','ph ph-house','Home'],['items','ph ph-package','Items'],['evaluate','ph ph-scales','Evaluate'],['runs','ph ph-path','Runs'],['money','ph ph-bank','Money'],['analytics','ph ph-chart-line-up','Analytics'],['toolkit','ph ph-chats-circle','Toolkit'],['settings','ph ph-gear-six','Settings']];
    const TITLES = {home:'Flip Tracker Pro', items:'Items', evaluate:'Deal evaluator', runs:'Sourcing runs', money:'Tax & accounting', analytics:'Analytics', toolkit:'Toolkit', settings:'Settings'};
    const fillIcon = ic => ic.replace(/^ph /, 'ph-fill ');
    shell.sideNav = NAVDEF.map(n => ({icon:S.screen===n[0]?fillIcon(n[1]):n[1], label:n[2], go:this.go(n[0]), bg:S.screen===n[0]?'color-mix(in srgb, var(--color-accent) 13%, transparent)':'transparent', fg:S.screen===n[0]?'var(--color-accent)':'inherit'}));
    const tab = id => { const n = NAVDEF.find(x=>x[0]===id); const on = S.screen===id; return {icon:on?fillIcon(n[1]):n[1], label:n[2], go:this.go(id), fg:on?'var(--color-accent)':'color-mix(in srgb, var(--color-text) 62%, transparent)'}; };
    shell.tabNavL = [tab('home'), tab('items')];
    const moreOn = ['evaluate','toolkit','analytics','settings'].includes(S.screen);
    shell.tabNavR = [tab('money'), {icon:(moreOn||S.screen==='runs')?'ph-fill ph-dots-three-circle':'ph ph-dots-three-circle', label:'More', go:()=>this.setState({moreOpen:true}), fg:(moreOn||S.screen==='runs')?'var(--color-accent)':'color-mix(in srgb, var(--color-text) 62%, transparent)'}];
    shell.openPlus = ()=>this.setState({plusOpen:true});
    shell.closeSheets = ()=>this.setState({plusOpen:false, moreOpen:false});
    shell.plusOpen = S.plusOpen; shell.moreOpen = S.moreOpen;
    shell.goSettings = this.go('settings');
    shell.screenTitle = TITLES[S.screen]||'Flip Tracker Pro';
    ['home','items','evaluate','runs','money','analytics','toolkit','settings'].forEach(k => shell['scr_'+k] = S.screen===k);
    if(!S.ready){ return Object.assign(shell, {brandSub:'', themeIcon:'ph ph-moon', themeLabel:'Theme', themeToggle:()=>{}, ops:[], h_stats:[], h_tiles:[], h_recent:[]}); }
    const L = this.L(); const s = this.st(); const d = this.vd(); const M = L.money, M0 = L.money0; const T = L.todayISO();
    shell.themeToggle = this.setTheme(s.theme==='light'?'dark':'light');
    shell.themeIcon = s.theme==='light' ? 'ph ph-moon' : 'ph ph-sun'; shell.themeLabel = s.theme==='light' ? 'Dark mode' : 'Light mode';
    shell.brandSub = M0(s.goal)+' / month';
    shell.moreNav = [['evaluate','ph ph-scales','Deal evaluator','Run the numbers before you buy'],['runs','ph ph-path','Sourcing runs','Multi-stop pickup loops'],['analytics','ph ph-chart-line-up','Analytics','Scaling & category scorecard'],['toolkit','ph ph-chats-circle','Toolkit','Templates & cross-listing'],['settings','ph ph-gear-six','Settings','Vehicle, maps, taxes, data']].map(n => ({icon:n[1], label:n[2], sub:n[3], go:this.go(n[0])}));
    shell.plusNav = [['ph ph-clipboard-text','Quick add from listing','Paste a Marketplace listing', ()=>{ this.openEdit(null)(); this.setState({plusOpen:false}); }],['ph ph-scales','Evaluate a deal','Profit check before buying', ()=>{ this.setState({screen:'evaluate', plusOpen:false}); }],['ph ph-plus-circle','Add item manually','Full item form', ()=>{ this.openEdit(null)(); this.setState({plusOpen:false}); }],['ph ph-path','New sourcing run','Batch pickups into one loop', this.newRun()],['ph ph-receipt','Log an expense','Supplies, storage, tools…', ()=>{ this.setState({screen:'money', moneyTab:'expenses', plusOpen:false}); }]].map(n => ({icon:n[0], label:n[1], sub:n[2], go:n[3]}));
    const econ = it => L.itemEcon(it, s);
    // ——— home ———
    const now = new Date(); const dim = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate(); const dom = now.getDate();
    const mk = L.iso(now).slice(0,7); const mr = L.monthRange(mk); const mp = L.rangePnl(d, s, mr[0], mr[1]);
    const pct = s.goal>0 ? Math.max(0, mp.net)/s.goal*100 : 0; const expPct = dom/dim*100;
    shell.h_monthLabel = ['January','February','March','April','May','June','July','August','September','October','November','December'][now.getMonth()];
    shell.h_paceNet = M0(mp.net); shell.h_goal = M0(s.goal); shell.h_pacePct = Math.round(pct);
    shell.h_paceW = Math.min(100, pct).toFixed(1)+'%'; shell.h_expW = expPct.toFixed(1)+'%';
    shell.h_daysLeft = dim-dom;
    const remaining = Math.max(0, s.goal-mp.net); shell.h_perDay = dim-dom>0 ? M0(remaining/(dim-dom)) : M0(remaining);
    const onPace = pct >= expPct;
    shell.h_paceMsg = onPace ? 'On pace — keep feeding the pipeline' : 'Behind pace — time to list & flip harder';
    shell.h_paceColor = onPace ? 'var(--color-accent-300)' : 'var(--color-neutral-400)';
    const opsDone = (S.data.opsDone && S.data.opsDone[T]) || [];
    const ops = [];
    d.items.filter(it => it.status==='purchased' && it.pickupDate===T).forEach(it => ops.push({key:'pk'+it.id, label:'Pickup: '+it.title, sub:(it.pickupAddress||'')+((it.pickup&&it.pickup.miles)?' · '+it.pickup.miles+' mi':''), hasNav:!!it.pickupAddress, href:this.navHref(it.pickupAddress), hasOpen:false}));
    d.items.filter(it => it.status==='listed' && (it.listedOn||[]).includes('Facebook Marketplace') && L.daysBetween(it.renewedDate||it.listDate, T) >= s.renewDays).forEach(it => ops.push({key:'rn'+it.id, label:'Renew FB listing: '+it.title, sub:L.daysBetween(it.renewedDate||it.listDate, T)+' days since last renewal', hasOpen:true, open:this.openDetail(it.id)}));
    d.items.filter(it => it.status==='listed' && econ(it).daysListed >= s.agingDays).forEach(it => ops.push({key:'rp'+it.id, label:'Reprice: '+it.title, sub:'Listed '+econ(it).daysListed+' days — consider '+M0((it.listPrice||0)*0.9), hasOpen:true, open:this.openDetail(it.id)}));
    ops.push({key:'msg', label:'Answer new marketplace messages', sub:'Facebook · OfferUp · Craigslist', hasNav:false, hasOpen:false});
    shell.ops = ops.map(o => { const done = opsDone.includes(o.key); return Object.assign(o, {done, toggle:this.toggleOps(o.key), deco:done?'line-through':'none', cbd:done?'var(--color-accent)':'var(--color-divider)', cbg:done?'var(--color-accent-800)':'transparent'}); });
    shell.h_opsEmpty = ops.length===0; shell.h_opsCount = ops.filter(o=>!o.done).length+' open';
    const unsold = d.items.filter(it => ['purchased','listed'].includes(it.status));
    const tied = unsold.reduce((a,it) => a + (econ(it).invested||0), 0);
    const listedVal = d.items.filter(it=>it.status==='listed').reduce((a,it)=>a+(it.listPrice||0),0);
    shell.h_stats = [
      {label:'Capital tied up', value:M0(tied), sub:unsold.length+' unsold items'},
      {label:'Listed value', value:M0(listedVal), sub:d.items.filter(i=>i.status==='listed').length+' active listings'},
      {label:'Miles this month', value:mp.miles.toFixed(0), sub:M(mp.vehicle)+' vehicle cost'},
      {label:'Fees this month', value:M(mp.fees), sub:mp.units+' items sold'}
    ];
    shell.h_tiles = [
      {icon:'ph ph-scales', label:'Evaluate a deal', sub:'Before you drive', go:this.go('evaluate')},
      {icon:'ph ph-clipboard-text', label:'Quick add', sub:'Paste a listing', go:()=>{this.openEdit(null)();}},
      {icon:'ph ph-path', label:'New sourcing run', sub:'Batch your pickups', go:this.newRun()},
      {icon:'ph ph-bank', label:'Tax center', sub:'P&L & mileage log', go:this.go('money')}
    ];
    const events = [];
    d.items.forEach(it => { const ec = econ(it);
      if(it.soldDate) events.push({dt:it.soldDate, icon:'ph ph-seal-check', title:'Sold '+it.title, sub:L.fmtDate(it.soldDate)+' · '+(it.soldPlatform||''), amt:(ec.net!=null?(ec.net>=0?'+':'')+M0(ec.net):''), tone:ec.net>=0?'var(--color-accent-300)':'var(--color-neutral-400)', open:this.openDetail(it.id)});
      else if(it.listDate) events.push({dt:it.listDate, icon:'ph ph-storefront', title:'Listed '+it.title, sub:L.fmtDate(it.listDate)+' · asking '+M0(it.listPrice), amt:'', tone:'inherit', open:this.openDetail(it.id)});
      else if(it.purchaseDate) events.push({dt:it.purchaseDate, icon:'ph ph-handshake', title:'Bought '+it.title, sub:L.fmtDate(it.purchaseDate)+' · '+M0(it.purchasePrice), amt:'', tone:'inherit', open:this.openDetail(it.id)});
    });
    shell.h_recent = events.sort((a,b)=>a.dt<b.dt?1:-1).slice(0,5);
    const R = Object.assign(shell, this.vItems(L,s,d,econ), this.vDetail(L,s,d,econ), this.vEdit(L,s,d), this.vEval(L,s,d), this.vRuns(L,s,d,econ), this.vMoney(L,s,d,econ), this.vAnalytics(L,s,d,econ), this.vToolkit(L,s,d), this.vSettings(L,s,d));
    R.ev_hide = !R.ev_show; R.r_noDraft = !R.r_hasDraft; R.a_noAlerts = !R.a_hasAging && !R.a_hasRenews; R.a_goodTone = this.GOOD();
    if(R.a_aging) R.a_aging.forEach(g => { g.tone = this.WARN(); });
    R.sh_align = mobile ? 'flex-end' : 'center'; R.sh_rad = mobile ? '16px 16px 0 0' : 'var(--radius-lg)'; R.sh_pad = mobile ? '0' : 'var(--space-6)';
    return R;
};

App.prototype.vItems = function(L,s,d,econ){
    const S = this.state, M0 = L.money0, out = {};
    out.it_search = S.search; out.it_setSearch = e=>this.setState({search:e.target.value});
    out.it_statusChips = [['all','All'],['watching','Watching'],['purchased','Purchased'],['listed','Listed'],['sold','Sold']].map(c => ({label:c[1], set:()=>this.setState({fStatus:c[0]}), bd:S.fStatus===c[0]?'var(--color-accent)':'var(--color-divider)', fg:S.fStatus===c[0]?'var(--color-accent)':'inherit'}));
    out.it_cat = S.fCat; out.it_setCat = e=>this.setState({fCat:e.target.value});
    out.it_cats = [{v:'all',label:'All categories'}].concat(s.categories.map(c=>({v:c,label:c})));
    out.it_sort = S.sortBy; out.it_setSort = e=>this.setState({sortBy:e.target.value});
    out.it_sorts = [{v:'newest',label:'Newest first'},{v:'profit',label:'Highest profit'},{v:'days',label:'Longest listed'},{v:'title',label:'Title A–Z'}];
    const q = S.search.trim().toLowerCase();
    let rows = d.items.filter(it => (S.fStatus==='all'||it.status===S.fStatus) && (S.fCat==='all'||it.cat===S.fCat) && (!q || (it.title+' '+(it.pickupAddress||'')+' '+(it.notes||'')).toLowerCase().includes(q)));
    if(S.sortBy==='title') rows = rows.slice().sort((a,b)=>a.title.localeCompare(b.title));
    else if(S.sortBy==='profit') rows = rows.slice().sort((a,b)=>{ const va = econ(a), vb = econ(b); const na = va.net!=null?va.net:(va.proj!=null?va.proj:-1e9), nb = vb.net!=null?vb.net:(vb.proj!=null?vb.proj:-1e9); return nb-na; });
    else if(S.sortBy==='days') rows = rows.slice().sort((a,b)=>(econ(b).daysListed||0)-(econ(a).daysListed||0));
    else rows = rows.slice().sort((a,b)=>this.itemDate(b).localeCompare(this.itemDate(a)));
    const lotKids = {}; d.items.forEach(x => { if(x.lotId){ (lotKids[x.lotId] = lotKids[x.lotId]||[]).push(x); } });
    out.it_rows = rows.map(it => { const ec = econ(it); let r1='', r2='', tone='inherit';
      if(it.isLot){ const kids = lotKids[it.id]||[]; const soldN = kids.filter(k=>k.status==='sold').length; r1 = M0(it.lotCost); r2 = soldN+'/'+kids.length+' parts sold';
        return {id:it.id, open:this.openDetail(it.id), icon:'ph ph-stack', title:it.title, statusLabel:'Lot', statusCls:'tag tag-accent-2', meta:[it.cat, it.platform, L.fmtDate(this.itemDate(it))].filter(Boolean).join(' · '), r1, r2, tone}; }
      if(it.status==='sold'){ r1 = (ec.net>=0?'+':'')+M0(ec.net); tone = ec.net>=0?this.GOOD():this.BAD(); r2 = 'sold '+M0(it.soldPrice); }
      else if(it.status==='listed'){ r1 = M0(it.listPrice); r2 = (ec.proj!=null?'proj '+(ec.proj>=0?'+':'')+M0(ec.proj)+' · ':'')+(ec.daysListed!=null?ec.daysListed+'d listed':''); }
      else if(it.status==='purchased'){ r1 = M0(it.purchasePrice); r2 = ec.invested!=null?'in '+M0(ec.invested):''; }
      else { r1 = it.ask!=null?'ask '+M0(it.ask):''; r2 = it.target!=null?'target '+M0(it.target):''; }
      return {id:it.id, open:this.openDetail(it.id), icon:this.catIcon(it.cat), title:it.title, statusLabel:this.statusLabel(it.status), statusCls:this.statusCls(it.status), meta:[it.cat, it.platform, L.fmtDate(this.itemDate(it))].filter(Boolean).join(' · '), r1, r2, tone};
    });
    out.it_count = rows.length + (rows.length===1?' item':' items'); out.it_empty = rows.length===0;
    out.it_emptyMsg = d.items.length===0 ? 'No items yet — tap Add item or paste a listing.' : 'Nothing matches these filters.';
    out.it_add = this.openEdit(null);
    return out;
};

App.prototype.vDetail = function(L,s,d,econ){
    const S = this.state, M = L.money, M0 = L.money0;
    const it = S.detailId ? d.items.find(x=>x.id===S.detailId) : null;
    if(!it) return {d_open:false};
    const ec = econ(it); const out = {d_open:true};
    out.d_close = ()=>this.setState({detailId:null, sellD:null, splitD:null});
    out.d_title = it.title; out.d_statusLabel = it.isLot ? 'Lot' : this.statusLabel(it.status); out.d_statusCls = it.isLot ? 'tag tag-accent-2' : this.statusCls(it.status);
    out.d_meta = [it.cat, it.platform, it.condition].filter(Boolean).join(' · ');
    out.d_hasUrl = !!it.url; out.d_url = it.url;
    out.d_hasAddr = !!it.pickupAddress; out.d_addr = it.pickupAddress||''; out.d_navHref = this.navHref(it.pickupAddress);
    const rowsM = [];
    if(it.isLot){ rowsM.push({k:'Lot purchase price', v:M(it.lotCost), sub:L.fmtDate(it.purchaseDate)}); }
    else if(it.status==='watching'){ if(it.ask!=null) rowsM.push({k:'Asking price', v:M0(it.ask)}); if(it.target!=null) rowsM.push({k:'Target price', v:M0(it.target)}); }
    else { rowsM.push({k:'Purchase price', v:M(it.purchasePrice), sub:L.fmtDate(it.purchaseDate)}); }
    if(ec.tripTotal>0) rowsM.push({k:'Trip costs', v:'−'+M(ec.tripTotal)});
    if(it.status==='listed'||it.status==='sold'){ rowsM.push({k:'Listed at', v:M0(it.listPrice), sub:(it.listDate?L.fmtDate(it.listDate)+' · ':'')+(ec.daysListed!=null?ec.daysListed+' days':'')}); }
    if(it.status==='sold'){ rowsM.push({k:'Sold price', v:M(it.soldPrice), sub:L.fmtDate(it.soldDate)+' · '+(it.soldPlatform||'')}); if(ec.fees>0) rowsM.push({k:'Platform fees ('+(it.feePct||0)+'%)', v:'−'+M(ec.fees)}); }
    out.d_money = rowsM;
    out.d_hasNet = ec.net!=null || ec.proj!=null;
    out.d_netLabel = ec.net!=null?'Net profit':'Projected net';
    const nv = ec.net!=null?ec.net:ec.proj;
    out.d_net = nv!=null?(nv>=0?'+':'')+M(nv):'—'; out.d_netTone = nv>=0?this.GOOD():this.BAD();
    out.d_roi = ec.roi!=null?ec.roi.toFixed(0)+'% ROI':(ec.invested!=null?M0(ec.invested)+' invested':'');
    const pt = ec.pt; out.d_hasTrip = !!pt;
    if(pt){
      const haul = (pt.rental||0) + (pt.rentalGas||0);
      let rowsT;
      if(pt.alloc) rowsT = [{k:'Allocated share of run', v:M(pt.total - haul)},{k:'Round-trip miles (share)', v:pt.rtMiles.toFixed(1)+' mi'}];
      else if(pt.rtMiles>0) rowsT = [{k:'Round-trip miles', v:pt.rtMiles.toFixed(1)+' mi'+(pt.min?' · ~'+pt.min*2+' min':'')},{k:'Gas ('+s.mpg+' MPG @ '+M(s.gasPrice)+')', v:M(pt.gas)},{k:'Wear & tear ('+M(s.wearRate)+'/mi)', v:M(pt.wear)},{k:'Tolls', v:M(pt.tolls)}];
      else rowsT = [];
      if(pt.rental>0) rowsT.push({k:'Truck/U-Haul rental', v:M(pt.rental)});
      if(pt.rentalGas>0) rowsT.push({k:'Rental fuel', v:M(pt.rentalGas)});
      rowsT.push({k:'Trip total', v:M(pt.total), strong:true});
      out.d_trip = rowsT;
      out.d_tripNote = pt.alloc ? 'Cost split from a sourcing run' : pt.est ? 'Estimated straight-line ×1.28 — verify with a route lookup' : (pt.rtMiles>0 ? 'From entered/looked-up route' : 'Rental haul — no own-vehicle miles logged'); }
    const dt = ec.dt; out.d_hasDel = !!dt;
    if(dt) out.d_delTrip = [{k:'Delivery round-trip', v:dt.rtMiles.toFixed(1)+' mi'},{k:'Delivery cost', v:M(dt.total)}];
    out.d_mapOn = this.mapReady() && !!it.coords;
    out.d_mapNote = this.state.mapStatus==='ready' ? (it.coords?'':'No geocoded pin — tap Edit and use “Find route”.') : this.state.mapStatus==='error' ? 'MapKit token was rejected — check Settings.' : 'Add your MapKit JS token in Settings to see the live route here.';
    const r = this.rt['d'+it.id];
    out.d_mkShow = !!r && (!it.pickup || it.pickup.miles==null || it.pickup.est);
    if(r){ out.d_mkLine = 'Apple route: '+r.miles+' mi · '+r.min+' min one-way'; out.d_mkApply = ()=>{ this.save(dd=>{ const x = dd.items.find(y=>y.id===it.id); if(x){ x.pickup = Object.assign({}, x.pickup, {miles:r.miles, min:r.min}); delete x.pickup.est; } }); this.toastMsg('Route applied'); }; }
    const ORDER = ['watching','purchased','listed','sold']; const cur = ORDER.indexOf(it.status);
    out.d_showStepper = !it.isLot;
    out.d_steps = ORDER.map((k,i) => ({label:this.statusLabel(k), on:i===cur, done:i<cur, fg:i<=cur?'var(--color-accent)':'color-mix(in srgb, var(--color-text) 40%, transparent)', bd:i<=cur?'var(--color-accent)':'var(--color-divider)', bg:i<cur?'var(--color-accent-800)':'transparent'}));
    out.d_canAdv = it.status!=='sold' && !S.sellD && !it.isLot;
    // ——— lot rollup (parent) ———
    out.d_isLot = !!it.isLot;
    if(it.isLot){
      const kids = d.items.filter(x=>x.lotId===it.id);
      const kecs = kids.map(k=>({k, e:econ(k)}));
      const soldN = kecs.filter(x=>x.k.status==='sold').length;
      const outlay = (it.lotCost||0) + ec.tripTotal;
      const recovered = kecs.filter(x=>x.k.status==='sold').reduce((a,x)=>a+((x.k.soldPrice||0)-x.e.fees),0);
      const lotNet = recovered - outlay;
      out.d_lotStats = [
        {k:'Lot outlay', v:M(outlay), sub:'purchase + trip'},
        {k:'Recovered so far', v:M(recovered), sub:soldN+' of '+kids.length+' parts sold, after fees'},
        {k:'Lot net', v:(lotNet>=0?'+':'')+M(lotNet), tone:lotNet>=0?this.GOOD():this.BAD(), sub:lotNet>=0?'past break-even':'to break even: sell '+M(-lotNet)+' more'},
        {k:'Listed value remaining', v:M(kecs.filter(x=>x.k.status!=='sold').reduce((a,x)=>a+(x.k.listPrice||0),0)), sub:(kids.length-soldN)+' parts unsold'}
      ];
      out.d_lotParts = kecs.map(x => { const k = x.k, e2 = x.e; let right='', tone='inherit', sub2='';
        if(k.status==='sold'){ right = (e2.net>=0?'+':'')+M0(e2.net); tone = e2.net>=0?this.GOOD():this.BAD(); sub2 = 'sold '+M0(k.soldPrice); }
        else if(k.status==='listed'){ right = M0(k.listPrice); sub2 = e2.daysListed!=null ? e2.daysListed+'d listed' : ''; }
        else { right = M0(k.purchasePrice); sub2 = 'allocated cost'; }
        return {title:k.title, statusLabel:this.statusLabel(k.status), statusCls:this.statusCls(k.status), right, tone, sub2, open:this.openDetail(k.id)}; });
    }
    // ——— lot child link ———
    const lotParent = it.lotId ? d.items.find(x=>x.id===it.lotId) : null;
    out.d_hasLotParent = !!lotParent;
    if(lotParent) out.d_lotParent = {title:lotParent.title, open:this.openDetail(lotParent.id)};
    // ——— split editor ———
    out.d_splitShow = it.status==='purchased' && !it.isLot && !S.sellD && !(S.splitD && S.splitD.parentId===it.id);
    out.d_split = this.openSplit(it.id);
    const spd = S.splitD; out.d_splitOpen = !!spd && spd.parentId===it.id;
    if(out.d_splitOpen){
      out.sp_parts = spd.parts.map((p,i)=>({title:p.title, cost:p.cost, setTitle:this.splitSetPart(i,'title'), setCost:this.splitSetPart(i,'cost'), del:this.splitDelPart(i), bindT:'splitD.'+i+'.title', bindC:'splitD.'+i+'.cost', canDel:spd.parts.length>2}));
      out.sp_add = this.splitAddPart(); out.sp_even = this.splitEven(); out.sp_confirm = this.confirmSplit(); out.sp_cancel = this.cancelSplit();
      const sum = spd.parts.reduce((a,p)=>a+(L.num(p.cost)||0),0);
      out.sp_sumLine = 'Allocated '+M(sum)+' of '+M(it.purchasePrice||0);
      out.sp_sumOk = Math.abs(sum-(it.purchasePrice||0))<=0.02;
      out.sp_tripLine = ec.pt ? 'The '+M(ec.pt.total)+' trip cost splits in the same proportions.' : 'No trip cost recorded on this purchase.';
    }
    out.d_advLabel = {watching:'Mark purchased', purchased:'Mark listed', listed:'Mark sold…'}[it.status]||'';
    out.d_advance = this.advance(it.id);
    const sd = S.sellD; out.d_sellOpen = !!sd;
    if(sd){ const sset = k=>this.dset('sellD',k);
      out.d_sRows = [Object.assign(this.fld('Sold price $', sd.price, sset('price'), 'number','825','46%'),{bind:'sellD.price'}), Object.assign(this.fld('Sold date', sd.date, sset('date'), 'date','','46%'),{bind:'sellD.date'})];
      out.d_sPlat = sd.platform; out.d_sSetPlat = sset('platform'); out.d_sPlats = L.PLATFORMS.map(p=>({v:p,label:p}));
      out.d_sFee = sd.feePct; out.d_sSetFee = sset('feePct');
      out.d_sFeeOpts = [{v:'',label:'Fee preset…'}].concat(s.feePresets.map((f,i)=>({v:String(f.pct), label:f.name+' — '+f.pct+'%'})));
      out.d_sApplyFee = e=>{ if(e.target.value!=='') this.setState(st=>({sellD:Object.assign({},st.sellD,{feePct:e.target.value})})); e.target.value=''; };
      out.d_sDelivered = sd.delivered; out.d_sSetDelivered = this.dset('sellD','delivered','check');
      out.d_sDelRows = [Object.assign(this.fld('Buyer address', sd.delAddress, sset('delAddress'), 'text','City, ST','100%'),{bind:'sellD.delAddress'}), Object.assign(this.fld('One-way miles', sd.delMiles, sset('delMiles'), 'number','6.5','30%'),{bind:'sellD.delMiles'}), Object.assign(this.fld('Tolls $', sd.delTolls, sset('delTolls'), 'number','0','30%'),{bind:'sellD.delTolls'})];
      out.d_confirmSell = this.confirmSell(); out.d_sCancel = ()=>this.setState({sellD:null});
    }
    out.d_checklist = ['Facebook Marketplace','OfferUp','eBay','Craigslist'].map(p => { const fp = s.feePresets.find(f=>f.name.toLowerCase().startsWith(p.split(' ')[0].toLowerCase())); const on = (it.listedOn||[]).includes(p);
      return {name:p, on, toggle:this.toggleListed(it.id,p), fee: fp?(fp.pct+'% fees'):'', bd:on?'var(--color-accent)':'var(--color-divider)', fg:on?'var(--color-accent)':'inherit', icon:on?'ph-fill ph-check-square':'ph ph-square'}; });
    out.d_showChecklist = (it.status==='purchased'||it.status==='listed') && !it.isLot;
    out.d_renewShow = it.status==='listed' && (it.listedOn||[]).includes('Facebook Marketplace');
    out.d_renewLabel = 'Log FB renewal'+(it.renewedDate?' (last '+L.fmtDate(it.renewedDate)+')':'');
    out.d_renew = this.renew(it.id);
    out.d_repriceShow = it.status==='listed' && ec.daysListed>=s.agingDays && it.listPrice!=null;
    out.d_repriceLabel = 'Reprice to '+M0((it.listPrice||0)*0.9); out.d_reprice = this.reprice(it.id);
    out.d_hasNotes = !!(it.notes||it.condition); out.d_notes = [it.condition, it.notes].filter(Boolean).join(' — ');
    out.d_edit = this.openEdit(it.id); out.d_del = this.delItem(it.id);
    return out;
};

App.prototype.vEdit = function(L,s,d){
    const S = this.state; const e = S.edit;
    if(!e) return {e_open:false};
    const eset = k=>this.dset('edit',k); const out = {e_open:true};
    const B = (f, bind) => Object.assign(f, {bind});
    out.e_heading = e.id ? 'Edit item' : 'Add item';
    out.e_close = this.closeEdit(); out.e_save = this.saveItem();
    out.e_showQuick = !e.id;
    out.e_quick = S.quick; out.e_setQuick = ev=>this.setState({quick:ev.target.value});
    out.e_parseQuick = this.parseQuick(); out.e_pasteQuick = this.pasteQuick(); out.e_quickNote = S.quickNote; out.e_hasQuickNote = !!S.quickNote;
    out.e_rowsTop = [B(this.fld('Title', e.title, eset('title'), 'text', 'Peloton Bike+', '100%'),'edit.title')];
    out.e_cat = e.cat; out.e_setCat = eset('cat'); out.e_cats = s.categories.map(c=>({v:c,label:c}));
    out.e_plat = e.platform; out.e_setPlat = eset('platform'); out.e_plats = L.PLATFORMS.map(p=>({v:p,label:p}));
    out.e_status = e.status; out.e_setStatus = eset('status'); out.e_statuses = ['watching','purchased','listed','sold'].map(v=>({v, label:this.statusLabel(v)}));
    out.e_isWatch = e.status==='watching'; out.e_showBuy = e.status!=='watching';
    out.e_rowsWatch = [B(this.fld('Asking price $', e.ask, eset('ask'), 'number','340','46%'),'edit.ask'), B(this.fld('Target price $', e.target, eset('target'), 'number','290','46%'),'edit.target')];
    out.e_rowsBuy = [B(this.fld('Purchase price $', e.purchasePrice, eset('purchasePrice'), 'number','450','30%'),'edit.purchasePrice'), B(this.fld('Purchase date', e.purchaseDate, eset('purchaseDate'), 'date','','30%'),'edit.purchaseDate'), B(this.fld('Pickup scheduled', e.pickupDate, eset('pickupDate'), 'date','','30%'),'edit.pickupDate')];
    out.e_addr = e.address; out.e_setAddr = eset('address');
    out.e_lookup = this.lookupEdit(); out.e_pasteMaps = this.pasteMaps('edit'); out.e_lookupNote = S.lookupNote; out.e_hasLookupNote = !!S.lookupNote;
    out.e_rowsTrip = [B(this.fld('One-way miles', e.miles, eset('miles'), 'number','12.5','30%'),'edit.miles'), B(this.fld('Drive min (1-way)', e.min, eset('min'), 'number','22','30%'),'edit.min'), B(this.fld('Tolls $ (RT)', e.tolls, eset('tolls'), 'number','0','30%'),'edit.tolls')];
    out.e_tollOpts = [{v:'',label:'Toll preset…'}].concat(this.vd().tollPresets.map(t=>({v:t.id, label:t.name+' — '+L.money(t.amount)})));
    out.e_applyToll = this.applyTollEdit();
    out.e_rowsHaul = [B(this.fld('Truck/U-Haul rental $', e.rental, eset('rental'), 'number','0','46%'),'edit.rental'), B(this.fld('Rental fuel $', e.rentalGas, eset('rentalGas'), 'number','0','46%'),'edit.rentalGas')];
    out.e_showSell = e.status==='listed'||e.status==='sold';
    out.e_rowsList = [B(this.fld('Listing price $', e.listPrice, eset('listPrice'), 'number','895','46%'),'edit.listPrice'), B(this.fld('Listing date', e.listDate, eset('listDate'), 'date','','46%'),'edit.listDate')];
    out.e_listedOn = ['Facebook Marketplace','OfferUp','eBay','Craigslist'].map(p => { const on = (e.listedOn||[]).includes(p);
      return {name:p.replace(' Marketplace',''), on, bd:on?'var(--color-accent)':'var(--color-divider)', fg:on?'var(--color-accent)':'inherit', toggle:()=>this.setState(st => { const lo = st.edit.listedOn.slice(); const i = lo.indexOf(p); if(i>=0) lo.splice(i,1); else lo.push(p); return {edit:Object.assign({}, st.edit, {listedOn:lo})}; })}; });
    out.e_isSold = e.status==='sold';
    out.e_rowsSold = [B(this.fld('Sold price $', e.soldPrice, eset('soldPrice'), 'number','825','30%'),'edit.soldPrice'), B(this.fld('Sold date', e.soldDate, eset('soldDate'), 'date','','30%'),'edit.soldDate'), B(this.fld('Fee %', e.feePct, eset('feePct'), 'number','0','30%'),'edit.feePct')];
    out.e_soldPlat = e.soldPlatform; out.e_setSoldPlat = eset('soldPlatform');
    out.e_delivered = e.delivered; out.e_setDelivered = this.dset('edit','delivered','check');
    out.e_rowsDel = [B(this.fld('Buyer address', e.delAddress, eset('delAddress'), 'text','City, ST','100%'),'edit.delAddress'), B(this.fld('One-way miles', e.delMiles, eset('delMiles'), 'number','5','46%'),'edit.delMiles'), B(this.fld('Tolls $ (RT)', e.delTolls, eset('delTolls'), 'number','0','46%'),'edit.delTolls')];
    out.e_rowsNotes = [B(this.fld('Condition', e.condition, eset('condition'), 'text','Works, light scratches','100%'),'edit.condition'), B(this.fld('Notes', e.notes, eset('notes'), 'text','Seller flexible after 5pm','100%'),'edit.notes'), B(this.fld('Listing URL', e.url, eset('url'), 'text','https://…','100%'),'edit.url')];
    return out;
};

App.prototype.vEval = function(L,s,d){
    const S = this.state; const ev = S.evalD; const evset = k=>this.dset('evalD',k);
    const M = L.money, M0 = L.money0; const out = {};
    const B = (f, bind) => Object.assign(f, {bind});
    out.ev_rowsPrice = [B(this.fld('Asking price $', ev.ask, evset('ask'), 'number','200','46%'),'evalD.ask'), B(this.fld('I can negotiate to $', ev.target, evset('target'), 'number','160','46%'),'evalD.target')];
    out.ev_addr = ev.address; out.ev_setAddr = evset('address');
    out.ev_lookup = this.lookupEval(); out.ev_pasteMaps = this.pasteMaps('eval'); out.ev_note = S.evalNote; out.ev_hasNote = !!S.evalNote;
    out.ev_rowsTrip = [B(this.fld('One-way miles', ev.miles, evset('miles'), 'number','9','30%'),'evalD.miles'), B(this.fld('Drive min (1-way)', ev.min, evset('min'), 'number','16','30%'),'evalD.min'), B(this.fld('Tolls $ (RT)', ev.tolls, evset('tolls'), 'number','0','30%'),'evalD.tolls')];
    out.ev_tollOpts = [{v:'',label:'Toll preset…'}].concat(this.vd().tollPresets.map(t=>({v:t.id, label:t.name+' — '+M(t.amount)})));
    out.ev_applyToll = this.applyToll('evalD');
    out.ev_rowsResale = [B(this.fld('Resale low $', ev.low, evset('low'), 'number','350','30%'),'evalD.low'), B(this.fld('Expected $', ev.exp, evset('exp'), 'number','420','30%'),'evalD.exp'), B(this.fld('High $', ev.high, evset('high'), 'number','480','30%'),'evalD.high')];
    out.ev_rowsMisc = [B(this.fld('Platform fee %', ev.feePct, evset('feePct'), 'number','0','30%'),'evalD.feePct'), B(this.fld('Days to sell (est)', ev.days, evset('days'), 'number','7','30%'),'evalD.days'), B(this.fld('Prep minutes', ev.prep, evset('prep'), 'number', String(s.prepMin), '30%'),'evalD.prep')];
    out.ev_feeOpts = [{v:'',label:'Fee preset…'}].concat(s.feePresets.map(f=>({v:String(f.pct), label:f.name+' — '+f.pct+'%'})));
    out.ev_applyFee = e=>{ if(e.target.value!=='') this.setState(st=>({evalD:Object.assign({},st.evalD,{feePct:e.target.value})})); e.target.value=''; };
    const c = this.evalCalc();
    out.ev_show = !!c.exp;
    out.ev_placeholder = 'Enter a buy price and an expected resale to see the verdict.';
    if(c.exp){
      const tones = {green:this.GOOD(), yellow:this.WARN(), red:this.BAD()};
      out.ev_verdictColor = tones[c.verdict];
      out.ev_verdictIcon = {green:'ph-fill ph-seal-check', yellow:'ph-fill ph-warning', red:'ph-fill ph-x-circle'}[c.verdict];
      out.ev_verdictLabel = {green:'Strong deal — worth the drive', yellow:'Thin margin — negotiate harder', red:'Likely loss — skip it'}[c.verdict];
      out.ev_buyLine = 'Buying at '+M0(c.buy)+(c.trip?' + '+M(c.trip.total)+' trip':'')+(c.hours?' · '+c.hours.toFixed(1)+' hrs all-in':'');
      out.ev_cards = [{lab:'Low', o:c.low},{lab:'Expected', o:c.exp},{lab:'High', o:c.high}].map(x => ({label:x.lab, net:x.o?(x.o.net>=0?'+':'')+M0(x.o.net):'—', roi:x.o&&x.o.roi!=null?x.o.roi.toFixed(0)+'% ROI':'', tone:x.o?(x.o.net>=75?this.GOOD():x.o.net>=25?this.WARN():this.BAD()):'inherit', big:x.lab==='Expected'}));
      out.ev_hourly = c.hourly!=null ? M(c.hourly)+'/hr' : '—';
      out.ev_hourlySub = c.driveMin!=null ? (c.driveMin*2)+' min drive + '+c.prep+' min prep' : 'add miles or minutes for hourly rate';
      out.ev_tripLine = c.trip ? c.trip.rtMiles.toFixed(1)+' mi RT · gas '+M(c.trip.gas)+' · wear '+M(c.trip.wear)+' · tolls '+M(c.trip.tolls) : 'No trip cost yet — add an address or miles';
    }
    out.ev_convert = this.evalConvert(); out.ev_clear = this.evalClear();
    out.ev_mapOn = this.mapReady() && !!ev.coords;
    out.ev_mapNote = this.state.mapStatus==='ready' ? 'Look up an address to plot the route.' : 'Add your MapKit JS token in Settings for live routing — manual miles work fine meanwhile.';
    return out;
};

App.prototype.vRuns = function(L,s,d,econ){
    const S = this.state; const M = L.money, M0 = L.money0; const out = {};
    out.r_new = this.newRun(); const rd = S.runD; out.r_hasDraft = !!rd;
    out.r_list = d.runs.map(r => ({name:r.name, date:L.fmtDate(r.date), sub:(r.destSummary||'')+' · '+r.itemIds.length+' stops', miles:(r.totalMiles!=null?r.totalMiles.toFixed(1):'?')+' mi', cost:M(r.totalCost), statusLabel:r.status==='done'?'Completed':'Planned', statusCls:r.status==='done'?'tag tag-accent':'tag tag-outline', canComplete:r.status!=='done', complete:this.completeRun(r.id), del:this.delRun(r.id)}));
    out.r_empty = d.runs.length===0 && !rd;
    if(rd){
      out.r_name = rd.name; out.r_setName = this.dset('runD','name');
      const cands = d.items.filter(it => ['watching','purchased'].includes(it.status));
      out.r_cands = cands.map(it => { const on = rd.ids.includes(it.id); return {id:it.id, title:it.title, on, toggle:this.toggleRunItem(it.id), sub:[it.pickupAddress, (it.pickup&&it.pickup.miles)?it.pickup.miles+' mi':null].filter(Boolean).join(' · '), statusLabel:this.statusLabel(it.status), statusCls:this.statusCls(it.status), bd:on?'var(--color-accent)':'var(--color-divider)', icon:on?'ph-fill ph-check-square':'ph ph-square', fg:on?'var(--color-accent)':'inherit'}; });
      out.r_noCands = cands.length===0;
      out.r_selCount = rd.ids.length+' selected';
      out.r_splits = [{label:'Split by distance', on:rd.split==='prop', set:()=>this.setState(st=>({runD:Object.assign({},st.runD,{split:'prop'})}))},{label:'Even split', on:rd.split==='even', set:()=>this.setState(st=>({runD:Object.assign({},st.runD,{split:'even'})}))}].map(x=>Object.assign(x,{bd:x.on?'var(--color-accent)':'var(--color-divider)', fg:x.on?'var(--color-accent)':'inherit'}));
      out.r_tolls = rd.tolls; out.r_setTolls = this.dset('runD','tolls');
      out.r_tollOpts = [{v:'',label:'Toll preset…'}].concat(this.vd().tollPresets.map(t=>({v:t.id, label:t.name+' — '+M(t.amount)})));
      out.r_applyToll = this.applyToll('runD');
      out.r_opt = this.optimizeRun(); out.r_note = S.runNote; out.r_hasNote = !!S.runNote;
      out.r_hasPlan = !!rd.stops;
      if(rd.stops){
        out.r_stops = rd.stops.map((o,i) => ({n:String(i+1), title:o.title, addr:o.addr||'—', leg:(rd.legs && rd.legs[i])?rd.legs[i].miles.toFixed(1)+' mi':'', href:this.navHref(o.addr), hasAddr:!!o.addr}));
        out.r_legHome = (rd.legs && rd.legs.length>rd.stops.length && rd.legs[rd.legs.length-1]) ? rd.legs[rd.legs.length-1].miles.toFixed(1)+' mi back home' : '';
        const tolls = L.num(rd.tolls)||0; const gas = rd.totalMiles/(s.mpg||23)*(s.gasPrice||4); const wear = rd.totalMiles*(s.wearRate||0); const total = gas+wear+tolls;
        out.r_totMiles = rd.totalMiles.toFixed(1)+' mi'; out.r_totMin = rd.totalMin!=null ? Math.round(rd.totalMin)+' min' : '—';
        out.r_costLine = 'gas '+M(gas)+' · wear '+M(wear)+' · tolls '+M(tolls);
        out.r_totCost = M(total);
        const items = rd.stops.map(o=>d.items.find(x=>x.id===o.id)).filter(Boolean);
        const shares = this.runShares(rd, items);
        out.r_shares = items.map((x,i) => ({title:x.title, pct:(shares[i]*100).toFixed(0)+'%', amt:M(shares[i]*total)}));
      }
      out.r_save = this.saveRun(false); out.r_done = this.saveRun(true); out.r_cancel = this.cancelRun();
      out.r_mapOn = this.mapReady() && rd.stops && rd.stops.some(o=>o.coords);
      out.r_mapNote = this.state.mapStatus==='ready' ? 'Order the stops to plot the loop.' : 'No MapKit token — using straight-line estimates. Add a token in Settings for true driving legs.';
    }
    return out;
};

App.prototype.vMoney = function(L,s,d,econ){
    const S = this.state; const M = L.money, M0 = L.money0; const out = {};
    out.m_tabs = [['pnl','P&L'],['mileage','Mileage'],['expenses','Expenses'],['taxes','Taxes'],['payouts','Payouts'],['export','Export']].map(t => ({label:t[1], on:S.moneyTab===t[0], set:()=>this.setState({moneyTab:t[0]}), bd:S.moneyTab===t[0]?'var(--color-accent)':'transparent', fg:S.moneyTab===t[0]?'var(--color-accent)':'inherit'}));
    ['pnl','mileage','expenses','taxes','payouts','export'].forEach(k => out['mt_'+k] = S.moneyTab===k);
    const pr = this.pnlRange(); const p = L.rangePnl(d, s, pr.r[0], pr.r[1]);
    out.m_label = pr.label;
    out.m_prev = ()=>this.setState({pnlCur:S.pnlCur-1}); out.m_next = ()=>this.setState({pnlCur:Math.min(0,S.pnlCur+1)});
    out.m_modeSegs = [['month','Month'],['quarter','Quarter'],['year','Year']].map(x => ({label:x[1], on:S.pnlMode===x[0], set:()=>this.setState({pnlMode:x[0], pnlCur:0}), bd:S.pnlMode===x[0]?'var(--color-accent)':'var(--color-divider)', fg:S.pnlMode===x[0]?'var(--color-accent)':'inherit'}));
    out.m_rows = [
      {k:'Gross sales', v:M(p.gross), sub:'Schedule C · Part I, line 1 — reconcile vs 1099-K'},
      {k:'Cost of goods sold', v:'−'+M(p.cogs), sub:'Part III — purchase prices of items sold'},
      {k:'Platform fees', v:'−'+M(p.fees), sub:'Line 10 — commissions & fees'},
      {k:'Vehicle costs (actual)', v:'−'+M(p.vehicle), sub:'Line 9 — gas + wear + tolls, '+p.miles.toFixed(0)+' mi'},
      {k:'Truck & equipment rental', v:'−'+M(p.rental||0), sub:'Line 20a — U-Haul & rentals at pickup'},
      {k:'Other business expenses', v:'−'+M(p.other), sub:'Part V — supplies, storage, phone %'}
    ];
    out.m_net = (p.net>=0?'+':'')+M(p.net); out.m_netTone = p.net>=0?this.GOOD():this.BAD();
    out.m_unitLine = p.units+' items sold · '+p.miles.toFixed(0)+' business miles';
    out.m_stdAlt = 'Standard-mileage alternative: '+M(p.miles*s.stdRate)+' ('+p.miles.toFixed(0)+' mi × '+M(s.stdRate)+')';
    out.m_pnlCSV = this.exportCSV('pnl');
    const log = L.mileageLog(d, s);
    let tm=0, tc=0; log.forEach(r=>{tm+=r.rtMiles; tc+=r.cost;});
    out.m_mileRows = log.slice(0,80).map(r => ({date:L.fmtDate(r.date), purpose:r.purpose, dest:r.dest, miles:r.rtMiles.toFixed(1), cost:M(r.cost)}));
    out.m_mileEmpty = log.length===0;
    const std = tm*s.stdRate;
    out.m_methodCards = [
      {label:'Actual vehicle costs', value:M(tc), sub:'gas + wear + tolls, as logged', best:tc>=std},
      {label:'Standard mileage', value:M(std), sub:tm.toFixed(1)+' mi × '+M(s.stdRate)+'/mi', best:std>tc}
    ].map(x=>Object.assign(x, {bd:x.best?'var(--color-accent)':'var(--color-divider)', tag:x.best?'Better deduction':''}));
    out.m_mileCSV = this.exportCSV('mileage');
    out.m_expRows = d.expenses.slice().sort((a,b)=>b.date<a.date?-1:1).map(e => ({date:L.fmtDate(e.date), cat:e.cat, desc:e.desc, amt:M(e.amount), del:this.delExpense(e.id)}));
    out.m_expEmpty = d.expenses.length===0;
    out.m_expTotal = M(d.expenses.reduce((a,e)=>a+e.amount,0));
    const ed = S.expD; const es = k=>this.dset('expD',k);
    out.m_eRows = [Object.assign(this.fld('Date', ed.date, es('date'), 'date','','30%'),{bind:'expD.date'}), Object.assign(this.fld('Amount $', ed.amount, es('amount'), 'number','12.99','30%'),{bind:'expD.amount'})];
    out.m_eDesc = ed.desc; out.m_eSetDesc = es('desc');
    out.m_eCat = ed.cat; out.m_eSetCat = es('cat'); out.m_eCats = L.EXP_CATS.map(c=>({v:c,label:c}));
    out.m_addExp = this.addExpense();
    const Y = new Date().getFullYear(); const curQ = Math.floor(new Date().getMonth()/3)+1;
    out.m_qRows = [1,2,3,4].map(q => { const r = L.quarterRange(Y,q); const net = L.rangePnl(d,s,r[0],r[1]).net; const res = net>0?net*s.setAside/100:0;
      return {q:'Q'+q, label:['Jan–Mar','Apr–Jun','Jul–Sep','Oct–Dec'][q-1], net:M(net), reserve:M(res), cur:q===curQ, bd:q===curQ?'var(--color-accent)':'var(--color-divider)', tag:q===curQ?'current':''}; });
    const yr = L.rangePnl(d,s,Y+'-01-01',Y+'-12-31');
    out.m_ytdNet = M(yr.net); out.m_ytdReserve = M(yr.net>0?yr.net*s.setAside/100:0);
    out.m_setAside = s.setAside+'%';
    out.m_taxNote = 'Set-aside is configurable in Settings. Estimates only — confirm with your accountant.';
    out.m_payRows = d.payouts.slice().sort((a,b)=>b.date<a.date?-1:1).map(pp => ({date:L.fmtDate(pp.date), platform:pp.platform, amt:M(pp.amount), note:pp.note||'', del:this.delPayout(pp.id)}));
    out.m_payEmpty = d.payouts.length===0;
    const pd = S.payD; const ps = k=>this.dset('payD',k);
    out.m_pRows = [Object.assign(this.fld('Date', pd.date, ps('date'), 'date','','30%'),{bind:'payD.date'}), Object.assign(this.fld('Amount $', pd.amount, ps('amount'), 'number','825','30%'),{bind:'payD.amount'}), Object.assign(this.fld('Note', pd.note, ps('note'), 'text','which items','30%'),{bind:'payD.note'})];
    out.m_pPlat = pd.platform; out.m_pSetPlat = ps('platform'); out.m_pPlats = L.PLATFORMS.map(x=>({v:x,label:x}));
    out.m_addPay = this.addPayout();
    const plats = {}; d.items.forEach(it => { if(it.status==='sold' && it.soldDate && it.soldDate>=Y+'-01-01'){ plats[it.soldPlatform||'Other'] = (plats[it.soldPlatform||'Other']||0) + (it.soldPrice||0); } });
    out.m_recon = Object.keys(plats).map(k => { const paid = d.payouts.filter(x=>x.platform===k).reduce((a,b)=>a+b.amount,0); const delta = paid-plats[k];
      return {platform:k, gross:M(plats[k]), paid:M(paid), delta:(delta>=0?'+':'')+M(delta), tone:Math.abs(delta)<1?this.GOOD():this.WARN(), sub:Math.abs(delta)<1?'reconciled':'gross sales vs payouts — fees & pending explain gaps'}; });
    out.m_reconEmpty = out.m_recon.length===0;
    out.m_exports = [
      {icon:'ph ph-package', label:'Items CSV', sub:'Every item with full economics', run:this.exportCSV('items')},
      {icon:'ph ph-road-horizon', label:'IRS mileage log CSV', sub:'Date, purpose, destination, miles', run:this.exportCSV('mileage')},
      {icon:'ph ph-receipt', label:'Expenses CSV', sub:'Categorized business expenses', run:this.exportCSV('expenses')},
      {icon:'ph ph-bank', label:'P&L CSV — '+pr.label, sub:'Current period statement', run:this.exportCSV('pnl')},
      {icon:'ph ph-download-simple', label:'Full backup (JSON)', sub:'Everything — restore via Import', run:this.exportCSV('json')},
      {icon:'ph ph-printer', label:'Print this page', sub:'Browser print → save as PDF', run:()=>window.print()}
    ];
    out.m_import = this.importJSON(); out.m_importNote = S.importNote; out.m_hasImportNote = !!S.importNote;
    return out;
};

App.prototype.vAnalytics = function(L,s,d,econ){
    const S = this.state; const M = L.money, M0 = L.money0; const T = L.todayISO(); const out = {};
    out.a_ranges = [['month','This month'],['3m','90 days'],['ytd','YTD'],['all','All time']].map(x => ({label:x[1], on:S.range===x[0], set:()=>this.setState({range:x[0]}), bd:S.range===x[0]?'var(--color-accent)':'var(--color-divider)', fg:S.range===x[0]?'var(--color-accent)':'inherit'}));
    out.a_cat = S.aCat; out.a_setCat = e=>this.setState({aCat:e.target.value});
    out.a_cats = [{v:'all',label:'All categories'}].concat(s.categories.map(c=>({v:c,label:c})));
    const Y = new Date().getFullYear();
    const range = S.range==='month' ? L.monthRange(T.slice(0,7)) : S.range==='3m' ? [L.daysAgo(90), T] : S.range==='ytd' ? [Y+'-01-01', T] : ['2000-01-01', T];
    const catOk = it => S.aCat==='all' || it.cat===S.aCat;
    const sold = d.items.filter(it => it.status==='sold' && it.soldDate && catOk(it));
    const soldR = sold.filter(it => it.soldDate>=range[0] && it.soldDate<=range[1]);
    const nets = soldR.map(it=>econ(it).net||0);
    const netSum = nets.reduce((a,b)=>a+b,0);
    const rev = soldR.reduce((a,it)=>a+(it.soldPrice||0),0);
    const rois = soldR.map(it=>econ(it).roi).filter(x=>x!=null);
    const dts = soldR.map(it=>econ(it).daysToSell).filter(x=>x!=null);
    const hrs = soldR.map(it => { const ec = econ(it); const pmin = (ec.pt&&ec.pt.min?ec.pt.min*2:0)+s.prepMin; return pmin>0?{net:ec.net||0, h:pmin/60}:null; }).filter(Boolean);
    const perHr = hrs.length ? hrs.reduce((a,x)=>a+x.net,0)/hrs.reduce((a,x)=>a+x.h,0) : null;
    out.a_cards = [
      {label:'Net profit', value:(netSum>=0?'+':'')+M0(netSum), sub:soldR.length+' flips in range'},
      {label:'Revenue', value:M0(rev), sub:'gross sales'},
      {label:'Avg ROI', value:rois.length?(rois.reduce((a,b)=>a+b,0)/rois.length).toFixed(0)+'%':'—', sub:'per flip'},
      {label:'Profit / hour', value:perHr!=null?M0(perHr):'—', sub:'drive + prep time'}
    ];
    const months = []; const nowD = new Date();
    for(let i=5;i>=0;i--){ const dd = new Date(nowD.getFullYear(), nowD.getMonth()-i, 1); months.push(L.iso(dd).slice(0,7)); }
    const byM = {}; sold.forEach(it => { const k = it.soldDate.slice(0,7); byM[k] = (byM[k]||0) + (econ(it).net||0); });
    const vals = months.map(k => byM[k]||0); const maxV = Math.max(100, ...vals.map(Math.abs));
    out.a_bars = months.map((k,i) => ({label:L.monthLabel(k), val:M0(vals[i]), hPct:(Math.abs(vals[i])/maxV*100).toFixed(1)+'%', bg:vals[i]>=0?'linear-gradient(180deg, var(--color-accent), var(--color-accent-700))':'var(--color-neutral-700)', cur:i===5}));
    let acc = 0; const cum = vals.map(v => acc += v); const cmax = Math.max(100, ...cum.map(Math.abs));
    out.a_line = cum.map((v,i) => (i*(100/5)).toFixed(1)+','+(38-(v/cmax*34)).toFixed(1)).join(' ');
    out.a_lineLast = M0(acc)+' cumulative';
    const cats = s.categories.filter(c => d.items.some(it=>it.cat===c));
    out.a_catRows = cats.map(c => { const its = d.items.filter(it=>it.cat===c); const sc = its.filter(it=>it.status==='sold');
      const n = sc.map(it=>econ(it).net||0); const avgNet = n.length?n.reduce((a,b)=>a+b,0)/n.length:null;
      const r = sc.map(it=>econ(it).roi).filter(x=>x!=null); const avgRoi = r.length?r.reduce((a,b)=>a+b,0)/r.length:null;
      const unsold = its.filter(it=>['listed','purchased'].includes(it.status)).length;
      const thru = (sc.length+unsold)>0 ? sc.length/(sc.length+unsold)*100 : null;
      const h = sc.map(it => { const ec = econ(it); const pm = (ec.pt&&ec.pt.min?ec.pt.min*2:0)+s.prepMin; return {net:ec.net||0, h:pm/60}; });
      const ph = h.length ? h.reduce((a,x)=>a+x.net,0)/h.reduce((a,x)=>a+x.h,0) : null;
      return {cat:c, flips:sc.length+' sold', avgNet:avgNet!=null?M0(avgNet):'—', roi:avgRoi!=null?avgRoi.toFixed(0)+'%':'—', thru:thru!=null?thru.toFixed(0)+'%':'—', perHr:ph!=null?M0(ph):'—', _s:avgNet||-1e9};
    }).sort((a,b)=>b._s-a._s);
    const unsoldItems = d.items.filter(it=>['purchased','listed'].includes(it.status) && catOk(it));
    const tied = unsoldItems.reduce((a,it)=>a+(econ(it).invested||0),0);
    const turns = sold.map(it=>econ(it).daysToSell).filter(x=>x!=null);
    const avgTurn = turns.length ? turns.reduce((a,b)=>a+b,0)/turns.length : null;
    out.a_capital = [
      {label:'Cash tied up', value:M0(tied), sub:unsoldItems.length+' unsold items'},
      {label:'Avg inventory turn', value:avgTurn!=null?avgTurn.toFixed(0)+' days':'—', sub:'purchase → sold'},
      {label:'Capital cycles / month', value:avgTurn?(30/avgTurn).toFixed(1)+'×':'—', sub:'higher = faster compounding'},
      {label:'Avg days to sell', value:dts.length?(dts.reduce((a,b)=>a+b,0)/dts.length).toFixed(0)+' days':'—', sub:'listed → sold, in range'}
    ];
    out.a_aging = d.items.filter(it => it.status==='listed' && econ(it).daysListed>=s.agingDays && catOk(it)).map(it => ({title:it.title, days:econ(it).daysListed+' days listed', price:M0(it.listPrice), suggest:'try '+M0((it.listPrice||0)*0.9), open:this.openDetail(it.id)}));
    out.a_renews = d.items.filter(it => it.status==='listed' && (it.listedOn||[]).includes('Facebook Marketplace') && L.daysBetween(it.renewedDate||it.listDate, T)>=s.renewDays && catOk(it)).map(it => ({title:it.title, days:L.daysBetween(it.renewedDate||it.listDate, T)+' days since renewal', open:this.openDetail(it.id)}));
    out.a_hasAging = out.a_aging.length>0; out.a_hasRenews = out.a_renews.length>0;
    out.a_agingNote = 'Flagged after '+s.agingDays+' days listed · FB renewals every '+s.renewDays+' days (Settings)';
    const byNet = sold.filter(it=>it.soldDate>=range[0]&&it.soldDate<=range[1]).slice().sort((a,b)=>(econ(b).net||0)-(econ(a).net||0));
    out.a_hasBW = byNet.length>0;
    if(byNet.length){ const b = byNet[0], w = byNet[byNet.length-1]; const be = econ(b), we = econ(w);
      out.a_best = {title:b.title, amt:'+'+M0(be.net), sub:(be.roi!=null?be.roi.toFixed(0)+'% ROI · ':'')+(be.daysToSell!=null?be.daysToSell+' days':'')};
      out.a_worst = {title:w.title, amt:(we.net>=0?'+':'')+M0(we.net), sub:(we.roi!=null?we.roi.toFixed(0)+'% ROI · ':'')+(we.daysToSell!=null?we.daysToSell+' days':''), tone:we.net>=0?'inherit':this.BAD()};
    }
    const trips = L.mileageLog(d,s).filter(r=>r.date>=range[0]&&r.date<=range[1]);
    out.a_totals = [
      {label:'Invested (range)', value:M0(soldR.reduce((a,it)=>a+(econ(it).invested||0),0)+ (S.range==='all'?tied:0))},
      {label:'Total miles', value:trips.reduce((a,r)=>a+r.rtMiles,0).toFixed(0)+' mi'},
      {label:'Vehicle spend', value:M(trips.reduce((a,r)=>a+r.cost,0))},
      {label:'Fees paid', value:M(soldR.reduce((a,it)=>a+econ(it).fees,0))}
    ];
    return out;
};

App.prototype.vToolkit = function(L,s,d){
    const out = {};
    out.t_tpls = this.state.data.templates.map(t => ({id:t.id, name:t.name, body:t.body, setName:this.tplSet(t.id,'name'), setBody:this.tplSet(t.id,'body'), copy:()=>this.copyText(t.body), del:this.delTpl(t.id)}));
    out.t_add = this.addTpl();
    out.t_fees = s.feePresets.map((f,i) => ({name:f.name, pct:String(f.pct), setName:this.feeSet(i,'name'), setPct:this.feeSet(i,'pct'), del:this.delFee(i)}));
    out.t_addFee = this.addFee();
    return out;
};

App.prototype.vSettings = function(L,s,d){
    const S = this.state; const M = L.money; const out = {};
    out.s_homeAddr = s.homeAddress; out.s_setHomeAddr = this.sset('homeAddress');
    out.s_homeLookup = this.homeLookup();
    out.s_homeSub = 'Geocoded at '+s.homeCoords.lat.toFixed(4)+', '+s.homeCoords.lng.toFixed(4)+' — every trip starts and ends here.';
    out.s_mapOn = this.mapReady();
    out.s_vRows = [Object.assign(this.fld('Vehicle', s.vehicle, this.sset('vehicle'), 'text','','100%'),{bind:'settings.vehicle'}), Object.assign(this.fld('MPG (combined)', s.mpg, this.sset('mpg', true), 'number','23','30%'),{bind:'settings.mpg'}), Object.assign(this.fld('Gas $ / gallon', s.gasPrice, this.sset('gasPrice', true), 'number','4.19','30%'),{bind:'settings.gasPrice'}), Object.assign(this.fld('Wear & tear $ / mi', s.wearRate, this.sset('wearRate', true), 'number','0.10','30%'),{bind:'settings.wearRate'})];
    out.s_gRows = [Object.assign(this.fld('Monthly profit goal $', s.goal, this.sset('goal', true), 'number','10000','46%'),{bind:'settings.goal'}), Object.assign(this.fld('Std mileage rate $ / mi', s.stdRate, this.sset('stdRate', true), 'number','0.70','46%'),{bind:'settings.stdRate'}), Object.assign(this.fld('Tax set-aside %', s.setAside, this.sset('setAside', true), 'number','27.5','46%'),{bind:'settings.setAside'}), Object.assign(this.fld('Default prep minutes', s.prepMin, this.sset('prepMin', true), 'number','30','46%'),{bind:'settings.prepMin'})];
    out.s_oRows = [Object.assign(this.fld('Reprice alert after (days listed)', s.agingDays, this.sset('agingDays', true), 'number','30','46%'),{bind:'settings.agingDays'}), Object.assign(this.fld('FB renewal reminder every (days)', s.renewDays, this.sset('renewDays', true), 'number','7','46%'),{bind:'settings.renewDays'})];
    out.s_token = S.tokenDraft; out.s_setToken = e=>this.setState({tokenDraft:e.target.value});
    out.s_saveToken = this.saveToken();
    const ms = S.mapStatus;
    out.s_mapStatus = {off:'No token — manual distance entry', loading:'Connecting to Apple…', ready:'MapKit connected — live geocoding & routes', error:'Token rejected — check origin restrictions & expiry'}[ms];
    out.s_mapDot = {off:'var(--color-neutral-500)', loading:this.WARN(), ready:this.GOOD(), error:this.BAD()}[ms];
    out.s_guideOpen = S.guideOpen; out.s_toggleGuide = ()=>this.setState({guideOpen:!S.guideOpen});
    out.s_guideChev = S.guideOpen?'ph ph-caret-up':'ph ph-caret-down';
    out.s_tolls = this.vd().tollPresets.map(t => ({name:t.name, amt:M(t.amount), del:this.delToll(t.id)}));
    out.s_tollName = S.tollD.name; out.s_setTollName = this.dset('tollD','name');
    out.s_tollAmt = S.tollD.amount; out.s_setTollAmt = this.dset('tollD','amount');
    out.s_addToll = this.addToll();
    out.s_cats = s.categories.map(c => ({name:c, del:this.delCat(c)}));
    out.s_catInput = S.catInput; out.s_setCatInput = e=>this.setState({catInput:e.target.value});
    out.s_addCat = this.addCat();
    out.s_themes = [['dark','Dark'],['light','Light']].map(x => ({label:x[1], on:s.theme===x[0], set:this.setTheme(x[0]), bd:s.theme===x[0]?'var(--color-accent)':'var(--color-divider)', fg:s.theme===x[0]?'var(--color-accent)':'inherit'}));
    out.s_backup = this.exportCSV('json'); out.s_itemsCSV = this.exportCSV('items');
    out.s_import = this.importJSON(); out.s_importNote = S.importNote; out.s_hasImportNote = !!S.importNote;
    out.s_clearDemo = this.clearDemo(); out.s_resetAll = this.resetAll();
    return out;
};
})();
