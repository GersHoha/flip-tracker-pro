/* Flip Tracker Pro — data layer, pure business logic, demo seed. Classic script: window.FTP */
(function(){
const D = 864e5;
const today = () => new Date();
const iso = d => { const x = new Date(d); return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0'); };
const daysAgo = n => iso(Date.now() - n*D);
const todayISO = () => iso(Date.now());
const uid = () => Math.random().toString(36).slice(2,9);
const money = (n, dec) => { if (n==null || isNaN(n)) return '—'; const neg = n < -0.004; const v = Math.abs(n); const s = '$' + v.toLocaleString('en-US',{minimumFractionDigits:dec==null?2:dec, maximumFractionDigits:dec==null?2:dec}); return neg ? '−'+s : s; };
const money0 = n => money(n, 0);
const fmtDate = s => { if(!s) return '—'; const [y,m,d] = s.split('-').map(Number); return m+'/'+d+'/'+String(y).slice(2); };
const monthKey = s => s ? s.slice(0,7) : '';
const monthLabel = k => { const [y,m] = k.split('-').map(Number); return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]+' ’'+String(y).slice(2); };
const daysBetween = (a,b) => Math.max(0, Math.round((new Date(b||todayISO()) - new Date(a))/D));
const clamp = (n,a,b) => Math.min(b, Math.max(a,n));
const num = v => { const n = parseFloat(String(v==null?'':v).replace(/[$,\s]/g,'')); return isNaN(n) ? null : n; };

// — geo —
const HAV = (a,b) => { if(!a||!b) return null; const R=3958.8, r=x=>x*Math.PI/180; const dLa=r(b.lat-a.lat), dLo=r(b.lng-a.lng); const h=Math.sin(dLa/2)**2 + Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dLo/2)**2; return 2*R*Math.asin(Math.sqrt(h)); };
const ROAD = 1.28; // straight-line → road-miles estimate factor
const estMiles = (a,b) => { const h = HAV(a,b); return h==null ? null : Math.round(h*ROAD*10)/10; };
const estMin = mi => mi==null ? null : Math.round(mi/0.52); // ~31 mph suburban average
// nearest-neighbor stop ordering, start+end at home
const nnOrder = (home, stops) => { const left = stops.slice(); const order = []; let cur = home; while(left.length){ let bi=0, bd=Infinity; left.forEach((s,i)=>{ const d = HAV(cur, s.coords); if(d<bd){bd=d;bi=i;} }); order.push(left[bi]); cur = left[bi].coords; left.splice(bi,1);} return order; };

// — trip cost —
const tripCost = (oneWayMiles, s, tolls) => { if(oneWayMiles==null) return null; const rt = oneWayMiles*2; const gas = rt/(s.mpg||23)*(s.gasPrice||4); const wear = rt*(s.wearRate||0); const t = tolls||0; return {rtMiles: rt, gas, wear, tolls: t, total: gas+wear+t}; };
const haulAmt = it => it.pickup ? ((it.pickup.rental||0) + (it.pickup.rentalGas||0)) : 0;
const pickupTrip = (it, s) => {
  const haul = haulAmt(it);
  if(it.pickup && it.pickup.alloc!=null) return {rtMiles: it.pickup.rtMiles||0, gas:0, wear:0, tolls:0, rental: it.pickup.rental||0, rentalGas: it.pickup.rentalGas||0, total: it.pickup.alloc + haul, alloc:true, min: it.pickup.min};
  if(it.pickup && it.pickup.miles!=null) { const c = tripCost(it.pickup.miles, s, it.pickup.tolls); c.min = it.pickup.min; c.est = !!it.pickup.est; c.rental = it.pickup.rental||0; c.rentalGas = it.pickup.rentalGas||0; c.total += haul; return c; }
  if(haul>0) return {rtMiles:0, gas:0, wear:0, tolls:0, rental: it.pickup.rental||0, rentalGas: it.pickup.rentalGas||0, total: haul};
  return null;
};
const deliveryTrip = (it, s) => (it.delivered && it.delivery && it.delivery.miles!=null) ? tripCost(it.delivery.miles, s, it.delivery.tolls) : null;
const feeAmt = it => { if(it.soldPrice==null) return 0; return it.feeMode==='flat' ? (it.feeFlat||0) : (it.soldPrice*(it.feePct||0)/100); };

const repairsTotal = it => (it.repairs||[]).reduce((a,r)=>a+(r.amount||0),0);
const itemEcon = (it, s) => {
  const pt = pickupTrip(it, s), dt = deliveryTrip(it, s);
  const tripTotal = (pt?pt.total:0) + (dt?dt.total:0);
  const tripMiles = (pt?pt.rtMiles:0) + (dt?dt.rtMiles:0);
  const repairs = repairsTotal(it);
  const cost = it.purchasePrice!=null ? it.purchasePrice : null;
  const invested = cost!=null ? cost + tripTotal + repairs : null;
  const fees = feeAmt(it);
  const net = (it.status==='sold' && it.soldPrice!=null && invested!=null) ? it.soldPrice - fees - invested : null;
  const roi = (net!=null && invested>0) ? net/invested*100 : null;
  const daysListed = it.listDate ? daysBetween(it.listDate, it.status==='sold'?it.soldDate:null) : null;
  const daysToSell = (it.status==='sold' && it.purchaseDate && it.soldDate) ? daysBetween(it.purchaseDate, it.soldDate) : null;
  // projected profit for unsold, from listPrice
  const proj = (it.status!=='sold' && it.listPrice!=null && invested!=null) ? it.listPrice*(1-(it.feePct||0)/100) - invested : null;
  return {pt, dt, tripTotal, tripMiles, repairs, invested, fees, net, roi, daysListed, daysToSell, proj};
};

// — mileage log (derived) —
const mileageLog = (data, s) => {
  const rows = [];
  (data.items||[]).forEach(it => {
    if(['purchased','listed','sold'].includes(it.status) && it.pickup && it.pickup.miles!=null && !it.pickup.runId){
      const c = tripCost(it.pickup.miles, s, it.pickup.tolls);
      rows.push({date: it.purchaseDate||it.createdAt, purpose:'Pickup — '+it.title, dest: it.pickupAddress||'—', rtMiles: c.rtMiles, cost: c.total});
    }
    if(it.status==='sold' && it.delivered && it.delivery && it.delivery.miles!=null){
      const c = tripCost(it.delivery.miles, s, it.delivery.tolls);
      rows.push({date: it.soldDate, purpose:'Delivery — '+it.title, dest: it.delivery.address||'—', rtMiles: c.rtMiles, cost: c.total});
    }
  });
  (data.runs||[]).forEach(r => { if(r.status==='done') rows.push({date: r.date, purpose:'Sourcing run — '+r.name+' ('+r.itemIds.length+' stops)', dest: r.destSummary||'Multi-stop loop', rtMiles: r.totalMiles, cost: r.totalCost}); });
  return rows.sort((a,b)=> (a.date<b.date?1:-1));
};

// — P&L for a date range (inclusive ISO strings) —
const rangePnl = (data, s, from, to) => {
  const inR = d => d && d>=from && d<=to;
  let gross=0, cogs=0, fees=0, units=0;
  (data.items||[]).forEach(it => { if(it.status==='sold' && inR(it.soldDate)){ gross += it.soldPrice||0; cogs += it.purchasePrice||0; fees += feeAmt(it); units++; } });
  let vehicle=0, miles=0;
  mileageLog(data, s).forEach(r => { if(inR(r.date)){ vehicle += r.cost; miles += r.rtMiles; } });
  // truck/U-Haul rentals: incurred at pickup, deducted separately from own-vehicle costs
  let rental=0;
  (data.items||[]).forEach(it => { if(['purchased','listed','sold'].includes(it.status) && haulAmt(it)>0 && inR(it.purchaseDate||it.createdAt)) rental += haulAmt(it); });
  // repairs/refurb: deducted when incurred (per dated entry)
  let repairs=0;
  (data.items||[]).forEach(it => { if(['purchased','listed','sold'].includes(it.status)) (it.repairs||[]).forEach(r => { if(inR(r.date)) repairs += r.amount||0; }); });
  let other=0; const byCat={};
  (data.expenses||[]).forEach(e => { if(inR(e.date)){ other += e.amount||0; byCat[e.cat]=(byCat[e.cat]||0)+(e.amount||0); } });
  const net = gross - cogs - fees - vehicle - rental - repairs - other;
  return {gross, cogs, fees, vehicle, rental, repairs, other, net, units, miles, byCat};
};
const monthRange = k => { const [y,m]=k.split('-').map(Number); const last = new Date(y, m, 0).getDate(); return [k+'-01', k+'-'+String(last).padStart(2,'0')]; };
const quarterRange = (y,q) => [ [y+'-01-01',y+'-03-31'], [y+'-04-01',y+'-06-30'], [y+'-07-01',y+'-09-30'], [y+'-10-01',y+'-12-31'] ][q-1];

// — quick-add listing parser —
const parseListing = raw => {
  const out = {title:'', ask:null, address:'', platform:'', url:''};
  if(!raw) return out;
  const um = raw.match(/https?:\/\/\S+/); if(um){ out.url = um[0]; if(/facebook\.com|fb\.com/.test(um[0])) out.platform='Facebook Marketplace'; if(/craigslist/.test(um[0])) out.platform='Craigslist'; if(/offerup/.test(um[0])) out.platform='OfferUp'; }
  const text = raw.replace(/https?:\/\/\S+/g,' ');
  const pm = text.match(/\$\s?([\d,]+(?:\.\d{2})?)/); if(pm) out.ask = num(pm[1]);
  const lm = text.match(/(?:in|Location:?)\s+([A-Z][A-Za-z.\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)/); if(lm) out.address = lm[1].trim();
  const skip = /^(marketplace|\$|listed|posted|save|share|message|send|see more|details|condition|about this|location)/i;
  const lines = text.split(/\n+/).map(l=>l.trim()).filter(l=>l.length>2 && !skip.test(l) && !/^\$?[\d,.]+$/.test(l));
  if(lines.length){ out.title = lines.reduce((a,b)=> (b.length>a.length && b.length<90) ? b : a, lines[0]).replace(/\s*[-–]\s*\$[\d,]+.*/,'').slice(0,80); }
  if(!out.platform && /marketplace/i.test(raw)) out.platform='Facebook Marketplace';
  return out;
};

// — Maps-link parser: pull coordinates + address out of a shared Apple/Google Maps link (or bare "lat, lng") —
const parseMapsLink = raw => {
  if(!raw) return null;
  const t = String(raw).trim();
  let dec = t; try{ dec = decodeURIComponent(t); }catch(e){}
  const both = t + '\n' + dec;
  const pick = (re, src) => { const m = src.match(re); if(!m) return null; const lat = parseFloat(m[1]), lng = parseFloat(m[2]); if(isNaN(lat)||isNaN(lng)||Math.abs(lat)>90||Math.abs(lng)>180||(lat===0&&lng===0)) return null; return {lat, lng}; };
  const coords = pick(/[?&](?:s?ll|coordinate|center)=(-?\d{1,2}\.\d+)(?:%2C|,)\s*(-?\d{1,3}\.\d+)/i, t)
    || pick(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/, both)
    || pick(/!3d(-?\d{1,2}\.\d+)!4d(-?\d{1,3}\.\d+)/, both)
    || pick(/[?&](?:q|daddr|destination)=(-?\d{1,2}\.\d+)(?:%2C|,)(-?\d{1,3}\.\d+)/i, t)
    || (!/https?:/i.test(t) ? pick(/^(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)$/, t) : null);
  let address = '';
  const q = k => { const m = t.match(new RegExp('[?&]'+k+'=([^&#]+)','i')); if(!m) return ''; try{ return decodeURIComponent(m[1].replace(/\+/g,' ')).trim(); }catch(e){ return m[1].replace(/\+/g,' ').trim(); } };
  address = q('address') || q('daddr') || q('name');
  if(!address){ const qq = q('q'); if(qq && !/^-?\d/.test(qq)) address = qq; }
  if(!address){ const m = t.match(/\/maps\/place\/([^\/@?]+)/i); if(m){ try{ address = decodeURIComponent(m[1].replace(/\+/g,' ')); }catch(e){ address = m[1].replace(/\+/g,' '); } } }
  const shortLink = /maps\.app\.goo\.gl|goo\.gl\/maps/i.test(t) && !coords;
  if(!coords && !address && !shortLink) return null;
  return {coords, address, shortLink};
};

// — CSV / download —
const csvCell = v => { const s = v==null?'':String(v); return /[",\n]/.test(s) ? '"'+s.replace(/"/g,'""')+'"' : s; };
const toCSV = rows => rows.map(r => r.map(csvCell).join(',')).join('\r\n');
const download = (name, content, mime) => { const b = new Blob([content], {type: mime||'text/plain'}); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();}, 400); };

// — constants —
const PLATFORMS = ['Facebook Marketplace','Craigslist','OfferUp','eBay','Other'];
const STATUS = [ {id:'watching', label:'Watching'}, {id:'purchased', label:'Purchased'}, {id:'listed', label:'Listed'}, {id:'sold', label:'Sold'} ];
const EXP_CATS = ['Packing supplies','Storage','Tools','Cleaning','Phone/Internet %','Other'];

const DEFAULT_SETTINGS = {
  goal: 10000, homeAddress: 'Ambler, PA 19002', homeCoords: {lat:40.1546, lng:-75.2216},
  vehicle: '2022 BMW X3 M40i', mpg: 23, gasPrice: 4.19, fuel: 'Premium', wearRate: 0.10,
  stdRate: 0.70, setAside: 27.5, agingDays: 30, renewDays: 7, prepMin: 30,
  mapToken: '', theme: 'dark',
  feePresets: [ {name:'Facebook — local pickup', pct:0}, {name:'Facebook — shipped', pct:5}, {name:'OfferUp — local', pct:0}, {name:'OfferUp — shipped', pct:12.9}, {name:'eBay', pct:13.25}, {name:'Craigslist', pct:0} ],
  categories: ['Electronics','Fitness equipment','Furniture','Auto parts','Tools','Other']
};

const C = {amb:{lat:40.1546,lng:-75.2216}, doy:{lat:40.310,lng:-75.130}, kop:{lat:40.089,lng:-75.396}, ch:{lat:40.077,lng:-75.208}, lan:{lat:40.2415,lng:-75.2838}, bb:{lat:40.152,lng:-75.266}, wg:{lat:40.144,lng:-75.116}, nor:{lat:40.1215,lng:-75.3399}, con:{lat:40.079,lng:-75.301}, hor:{lat:40.178,lng:-75.128}, war:{lat:40.249,lng:-75.134}, fw:{lat:40.135,lng:-75.209}};

const DEMO = () => {
  const I = (o) => Object.assign({id: uid(), demo: true, feeMode:'pct', feePct:0, listedOn:[], createdAt: o.purchaseDate||o.listDate||todayISO(), condition:'', notes:'', url:''}, o);
  const items = [
    I({title:'Sole F80 treadmill', cat:'Fitness equipment', platform:'Facebook Marketplace', status:'sold', purchasePrice:300, purchaseDate:daysAgo(84), pickupAddress:'Doylestown, PA', coords:C.doy, pickup:{miles:12.5, min:22}, listPrice:800, listDate:daysAgo(82), listedOn:['Facebook Marketplace','OfferUp'], soldPrice:750, soldDate:daysAgo(76), soldPlatform:'Facebook Marketplace', condition:'Barely used, folds fine'}),
    I({title:'Kenwood KR-7600 receiver', cat:'Electronics', platform:'Craigslist', status:'sold', purchasePrice:85, purchaseDate:daysAgo(78), pickupAddress:'Willow Grove, PA', coords:C.wg, pickup:{miles:5.6, min:13}, listPrice:280, listDate:daysAgo(76), listedOn:['eBay'], soldPrice:260, soldDate:daysAgo(66), soldPlatform:'eBay', feePct:13.25, condition:'Serviced, new lamps'}),
    I({title:'Cannondale Topstone 2 (M)', cat:'Fitness equipment', platform:'Facebook Marketplace', status:'sold', purchasePrice:900, purchaseDate:daysAgo(45), pickupAddress:'King of Prussia, PA', coords:C.kop, pickup:{miles:12, min:20}, listPrice:1550, listDate:daysAgo(43), listedOn:['Facebook Marketplace'], soldPrice:1500, soldDate:daysAgo(36), soldPlatform:'Facebook Marketplace', condition:'GRX 400, tubeless ready'}),
    I({title:'Herman Miller Aeron (B)', cat:'Furniture', platform:'Craigslist', status:'sold', purchasePrice:180, purchaseDate:daysAgo(41), pickupAddress:'Conshohocken, PA', coords:C.con, pickup:{miles:8.8, min:17}, listPrice:600, listDate:daysAgo(40), listedOn:['Facebook Marketplace','Craigslist'], soldPrice:560, soldDate:daysAgo(33), soldPlatform:'Facebook Marketplace', condition:'Fully loaded, posturefit'}),
    I({title:'Peloton Bike+', cat:'Fitness equipment', platform:'Facebook Marketplace', status:'sold', purchasePrice:450, purchaseDate:daysAgo(40), pickupAddress:'Doylestown, PA', coords:C.doy, pickup:{miles:12.5, min:22, tolls:0}, listPrice:895, listDate:daysAgo(38), listedOn:['Facebook Marketplace','OfferUp'], soldPrice:825, soldDate:daysAgo(25), soldPlatform:'Facebook Marketplace', condition:'Gen 2 seat post, wiped'}),
    I({title:'EGO Z6 zero-turn mower', cat:'Other', platform:'Facebook Marketplace', status:'sold', purchasePrice:1200, purchaseDate:daysAgo(16), pickupAddress:'Warrington, PA', coords:C.war, pickup:{miles:8.9, min:16}, listPrice:2300, listDate:daysAgo(14), listedOn:['Facebook Marketplace'], soldPrice:2190, soldDate:daysAgo(9), soldPlatform:'Facebook Marketplace', condition:'56V, 2 batteries, 11 hrs'}),
    I({title:'Onewheel GT', cat:'Electronics', platform:'OfferUp', status:'sold', purchasePrice:620, purchaseDate:daysAgo(22), pickupAddress:'Horsham, PA', coords:C.hor, pickup:{miles:5.8, min:12}, listPrice:1150, listDate:daysAgo(20), listedOn:['eBay','Facebook Marketplace'], soldPrice:1100, soldDate:daysAgo(7), soldPlatform:'eBay', feePct:13.25, condition:'Treaded tire, fangs'}),
    I({title:'Weber Genesis E-325s', cat:'Other', platform:'Craigslist', status:'sold', purchasePrice:140, purchaseDate:daysAgo(19), pickupAddress:'Blue Bell, PA', coords:C.bb, pickup:{miles:4.4, min:11}, listPrice:400, listDate:daysAgo(18), listedOn:['Facebook Marketplace','Craigslist'], soldPrice:370, soldDate:daysAgo(11), soldPlatform:'Facebook Marketplace', delivered:true, delivery:{address:'Fort Washington, PA', miles:3.4, min:9}, condition:'New flavorizer bars'}),
    I({title:'Ryobi 10" sliding miter saw', cat:'Tools', platform:'Facebook Marketplace', status:'sold', purchasePrice:60, purchaseDate:daysAgo(18), pickupAddress:'Lansdale, PA', coords:C.lan, pickup:{miles:6.2, min:14, runId:'run1', alloc:5.9, rtMiles:13.1}, listPrice:160, listDate:daysAgo(17), listedOn:['Facebook Marketplace'], soldPrice:150, soldDate:daysAgo(13), soldPlatform:'Facebook Marketplace'}),
    I({title:'DeWalt 20V 5-tool combo', cat:'Tools', platform:'Facebook Marketplace', status:'listed', purchasePrice:145, purchaseDate:daysAgo(15), pickupAddress:'Norristown, PA', coords:C.nor, pickup:{miles:8.5, min:18}, listPrice:260, listDate:daysAgo(13), listedOn:['Facebook Marketplace','OfferUp'], condition:'Batteries hold charge'}),
    I({title:'Rogue squat rack + 300lb plates', cat:'Fitness equipment', platform:'OfferUp', status:'listed', purchasePrice:200, purchaseDate:daysAgo(40), pickupAddress:'Warrington, PA', coords:C.war, pickup:{miles:8.9, min:16, runId:'run1', alloc:8.4, rtMiles:18.6}, listPrice:420, listDate:daysAgo(38), listedOn:['Facebook Marketplace','OfferUp','Craigslist'], condition:'Surface rust on plates'}),
    I({title:'West Elm mid-century dresser', cat:'Furniture', platform:'Facebook Marketplace', status:'purchased', purchasePrice:220, purchaseDate:daysAgo(1), pickupAddress:'Chestnut Hill, Philadelphia, PA', coords:C.ch, pickup:{miles:6.8, min:16}, pickupDate: todayISO(), condition:'One drawer slide needs a screw'}),
    I({title:'BMW E46 Style 68 wheels', cat:'Auto parts', platform:'Facebook Marketplace', status:'purchased', purchasePrice:380, purchaseDate:daysAgo(2), pickupAddress:'Willow Grove, PA', coords:C.wg, pickup:{miles:5.6, min:13}, condition:'Staggered set, tires 60%'}),
    I({title:'PS5 Slim + 2 controllers', cat:'Electronics', platform:'OfferUp', status:'watching', ask:340, target:290, pickupAddress:'Horsham, PA', coords:C.hor, pickup:{miles:5.8, min:12, est:true}, listDate:null, notes:'Seller says moving Friday — negotiable'}),
    I({title:'Toro 21" Power Clear snow blower', cat:'Other', platform:'Facebook Marketplace', status:'watching', ask:120, target:90, pickupAddress:'Lansdale, PA', coords:C.lan, pickup:{miles:6.2, min:14, est:true}, notes:'Off-season steal, resell in Nov'}),
    I({title:'iPhone 15 Pro Max 256GB', cat:'Electronics', platform:'Facebook Marketplace', status:'sold', purchasePrice:480, purchaseDate:daysAgo(6), pickupAddress:'King of Prussia, PA', coords:C.kop, pickup:{miles:12, min:20}, listPrice:780, listDate:daysAgo(5), listedOn:['eBay'], soldPrice:760, soldDate:daysAgo(2), soldPlatform:'eBay', feePct:13.25, condition:'92% battery, unlocked'})
  ];
  const runs = [ {id:'run1', demo:true, name:'North loop', date:daysAgo(18), status:'done', itemIds:[items[8].id, items[10].id], stops:['Lansdale, PA','Warrington, PA'], destSummary:'Lansdale → Warrington', totalMiles:31.7, totalMin:58, tolls:0, split:'prop', totalCost:14.3} ];
  const expenses = [
    {id:uid(), demo:true, date:daysAgo(26), cat:'Storage', desc:'10×10 unit — CubeSmart', amount:85},
    {id:uid(), demo:true, date:daysAgo(24), cat:'Packing supplies', desc:'Boxes, tape, bubble wrap', amount:18.42},
    {id:uid(), demo:true, date:daysAgo(30), cat:'Cleaning', desc:'Magic erasers, degreaser', amount:12.99},
    {id:uid(), demo:true, date:daysAgo(26), cat:'Phone/Internet %', desc:'30% of phone plan', amount:27}
  ];
  const payouts = [
    {id:uid(), demo:true, date:daysAgo(23), platform:'Facebook Marketplace', amount:825, note:'Peloton'},
    {id:uid(), demo:true, date:daysAgo(5), platform:'eBay', amount:948.55, note:'Onewheel, after fees'},
    {id:uid(), demo:true, date:daysAgo(8), platform:'Facebook Marketplace', amount:2190, note:'EGO mower'}
  ];
  const templates = [
    {id:uid(), demo:true, name:'Pickup confirmation', body:'Hi! Confirming pickup today at {time}. I’ll be in a white BMW X3 — cash in hand, won’t need more than 5 minutes. See you then!'},
    {id:uid(), demo:true, name:'Polite lowball counter', body:'Thanks for the offer! I’m firm closer to {price} given what these sell for — but I can do {counter} if you can pick up today. Fair?'},
    {id:uid(), demo:true, name:'Is this available — reply', body:'Yes, it’s available! First person here with cash takes it. I’m near {area} and flexible after 5pm today or anytime this weekend.'},
    {id:uid(), demo:true, name:'Bundle offer', body:'If you’re interested, I also have {item2} listed — happy to do both for {bundle} and knock a bit off for one trip.'},
    {id:uid(), demo:true, name:'Relist announcement', body:'Back up and priced to move — {item} now {price}. First come, first served; can hold with a small deposit.'}
  ];
  const tollPresets = [ {id:uid(), demo:true, name:'PA Turnpike Mid-County RT', amount:7.60}, {id:uid(), demo:true, name:'NE Extension — Lansdale RT', amount:5.20} ];
  return {items, runs, expenses, payouts, templates, tollPresets};
};

const BLANK = () => ({items:[], runs:[], expenses:[], payouts:[], templates: DEMO().templates.map(t=>({...t, demo:false})), tollPresets:[], opsDone:{}});
const SEED = () => Object.assign({settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), opsDone:{}}, DEMO());

window.FTP = {uid, iso, daysAgo, todayISO, money, money0, fmtDate, monthKey, monthLabel, daysBetween, clamp, num, HAV, estMiles, estMin, nnOrder, tripCost, pickupTrip, deliveryTrip, feeAmt, itemEcon, mileageLog, rangePnl, monthRange, quarterRange, parseListing, parseMapsLink, repairsTotal, toCSV, download, PLATFORMS, STATUS, EXP_CATS, DEFAULT_SETTINGS, DEMO, SEED, BLANK};
})();
