/* Flip Tracker Pro — Evaluate, Runs, Money, Analytics, Toolkit, Settings screens. */
(function(){
'use strict';

App.prototype.tplEvaluate = function(R){
  let out = '<section data-screen-label="Deal evaluator" style="display:grid;gap:var(--space-4);grid-template-columns:repeat(auto-fit,minmax(320px,1fr));align-items:start">';
  out += '<div class="card elev-sm" style="gap:var(--space-3)"><span class="card-kicker">The deal</span>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.ev_rowsPrice.map(f=>this.fieldHTML(f)).join('')+'</div>';
  out += '<div class="field"><label>Pickup address</label><div style="display:flex;gap:8px"><input class="input" placeholder="437 Main St, Doylestown, PA" value="'+esc(R.ev_addr)+'" data-bind="evalD.address" data-h="'+this.h(R.ev_setAddr)+'"><button type="button" class="btn btn-primary" data-h="'+this.h(R.ev_lookup)+'" style="flex:none"><i class="ph ph-map-pin"></i>Route</button></div></div>';
  if(R.ev_hasNote) out += '<p style="margin:0;font-size:11.5px;color:var(--color-accent-300)">'+esc(R.ev_note)+'</p>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.ev_rowsTrip.map(f=>this.fieldHTML(f)).join('')
    + '<div class="field" style="flex:1 1 30%"><label>Toll presets</label>'+this.selectHTML(R.ev_tollOpts, '', R.ev_applyToll)+'</div></div>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.ev_rowsResale.map(f=>this.fieldHTML(f)).join('')+'</div>';
  out += '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.ev_rowsMisc.map(f=>this.fieldHTML(f)).join('')
    + '<div class="field" style="flex:1 1 30%"><label>Fee presets</label>'+this.selectHTML(R.ev_feeOpts, '', R.ev_applyFee)+'</div></div>';
  out += '</div>';
  out += '<div style="display:flex;flex-direction:column;gap:var(--space-4)">';
  if(R.ev_show){
    out += '<div class="card elev-md" style="gap:var(--space-3)">'
      + '<div style="display:flex;align-items:center;gap:10px"><i class="'+R.ev_verdictIcon+'" style="font-size:26px;color:'+R.ev_verdictColor+'"></i><div><div style="font-size:16px;font-weight:500;color:'+R.ev_verdictColor+'">'+esc(R.ev_verdictLabel)+'</div><div class="text-muted" style="font-size:11.5px">'+esc(R.ev_buyLine)+'</div></div></div>'
      + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2)">'
      + R.ev_cards.map(c=>'<div style="border:1px solid var(--color-divider);border-radius:var(--radius-md);padding:10px;text-align:center"><div class="text-muted" style="font-size:10px;letter-spacing:.07em;text-transform:uppercase">'+esc(c.label)+'</div><div style="font-size:19px;font-weight:500;margin-top:3px;color:'+c.tone+'">'+esc(c.net)+'</div><div class="text-muted" style="font-size:10.5px">'+esc(c.roi)+'</div></div>').join('')
      + '</div>'
      + '<div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;font-size:12.5px"><span>Effective rate: <strong style="font-weight:500">'+esc(R.ev_hourly)+'</strong></span><span class="text-muted">'+esc(R.ev_hourlySub)+'</span></div>'
      + '<p class="text-muted" style="margin:0;font-size:11.5px">'+esc(R.ev_tripLine)+'</p>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn-primary" data-h="'+this.h(R.ev_convert)+'"><i class="ph ph-arrow-right"></i>Track this as an item</button><button type="button" class="btn btn-ghost" data-h="'+this.h(R.ev_clear)+'">Clear</button></div>'
      + '</div>';
  }
  if(R.ev_hide) out += '<div class="card" style="align-items:center;padding:var(--space-8)"><i class="ph ph-scales" style="font-size:26px;color:var(--color-neutral-600)"></i><p class="text-muted" style="font-size:13px;margin:0;text-align:center">'+esc(R.ev_placeholder)+'</p></div>';
  if(R.ev_mapOn) out += '<div class="card elev-sm" style="padding:0;overflow:hidden"><div data-map="eval" style="height:220px"></div></div>';
  out += '<p class="text-muted" style="margin:0;font-size:11px">'+esc(R.ev_mapNote)+'</p>';
  out += '</div></section>';
  return out;
};

App.prototype.tplRuns = function(R){
  let out = '<section data-screen-label="Sourcing runs" style="display:flex;flex-direction:column;gap:var(--space-4)">';
  if(R.r_hasDraft){
    out += '<div class="card elev-md" style="gap:var(--space-3)">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><span class="card-kicker">Build a run</span><button type="button" class="btn btn-ghost" data-h="'+this.h(R.r_cancel)+'">Cancel</button></div>'
      + '<div class="field"><label>Run name</label><input class="input" value="'+esc(R.r_name)+'" data-bind="runD.name" data-h="'+this.h(R.r_setName)+'"></div>'
      + '<div><div style="display:flex;justify-content:space-between;align-items:baseline"><label style="font-size:12px;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Pick stops (Watching &amp; Purchased)</label><span class="text-muted" style="font-size:11px">'+esc(R.r_selCount)+'</span></div>';
    if(R.r_noCands) out += '<p class="text-muted" style="font-size:12px;margin:6px 0 0">Nothing to pick up — add Watching or Purchased items first.</p>';
    out += '<div style="display:flex;flex-direction:column;gap:6px;margin-top:6px;max-height:240px;overflow:auto" class="ftp-scroll">';
    R.r_cands.forEach(c => {
      out += '<button type="button" data-h="'+this.h(c.toggle)+'" style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:transparent;border:1px solid '+c.bd+';border-radius:var(--radius-md);cursor:pointer;color:inherit;text-align:left"><i class="'+c.icon+'" style="font-size:17px;color:'+c.fg+';flex:none"></i><span style="flex:1;min-width:0"><span style="display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(c.title)+'</span><span class="text-muted" style="display:block;font-size:10.5px">'+esc(c.sub)+'</span></span><span class="'+c.statusCls+'" style="font-size:10px;flex:none">'+esc(c.statusLabel)+'</span></button>';
    });
    out += '</div></div>';
    out += '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:flex-end">'
      + '<div class="field" style="flex:1 1 30%"><label>Cost split</label><div style="display:flex;gap:6px">'+R.r_splits.map(sp=>'<button type="button" data-h="'+this.h(sp.set)+'" class="btn" style="font-size:12px;padding:5px 10px;border:1px solid '+sp.bd+';color:'+sp.fg+'">'+esc(sp.label)+'</button>').join('')+'</div></div>'
      + '<div class="field" style="flex:1 1 20%"><label>Tolls $ (whole loop)</label><input class="input" type="number" value="'+esc(R.r_tolls)+'" data-bind="runD.tolls" data-h="'+this.h(R.r_setTolls)+'"></div>'
      + '<div class="field" style="flex:1 1 26%"><label>Toll presets</label>'+this.selectHTML(R.r_tollOpts, '', R.r_applyToll)+'</div>'
      + '<button type="button" class="btn btn-primary" data-h="'+this.h(R.r_opt)+'" style="flex:none"><i class="ph ph-path"></i>Order the stops</button>'
      + '</div>';
    if(R.r_hasNote) out += '<p style="margin:0;font-size:11.5px;color:var(--color-accent-300)">'+esc(R.r_note)+'</p>';
    if(R.r_hasPlan){
      out += '<div style="display:flex;flex-direction:column;gap:6px">';
      R.r_stops.forEach(sp => {
        out += '<div style="display:flex;align-items:center;gap:10px;padding:7px 0"><div style="width:22px;height:22px;flex:none;border-radius:50%;border:1px solid var(--color-accent);color:var(--color-accent);display:grid;place-items:center;font-size:11px">'+sp.n+'</div><div style="flex:1;min-width:0"><div style="font-size:13px">'+esc(sp.title)+'</div><div class="text-muted" style="font-size:10.5px">'+esc(sp.addr)+' · leg '+esc(sp.leg)+'</div></div>'
          + (sp.hasAddr ? '<a class="btn btn-ghost" href="'+esc(sp.href)+'" target="_blank" rel="noopener" style="font-size:12px"><i class="ph ph-navigation-arrow"></i>Navigate</a>' : '') + '</div>';
      });
      out += '<div class="text-muted" style="font-size:11px;padding-left:32px">'+esc(R.r_legHome)+'</div></div>';
      out += '<div style="display:flex;gap:var(--space-4);flex-wrap:wrap;border-top:1px solid var(--color-divider);padding-top:var(--space-3)">'
        + '<div><div class="text-muted" style="font-size:10px;text-transform:uppercase;letter-spacing:.07em">Loop</div><div style="font-size:17px;font-weight:500">'+esc(R.r_totMiles)+'</div></div>'
        + '<div><div class="text-muted" style="font-size:10px;text-transform:uppercase;letter-spacing:.07em">Drive time</div><div style="font-size:17px;font-weight:500">'+esc(R.r_totMin)+'</div></div>'
        + '<div><div class="text-muted" style="font-size:10px;text-transform:uppercase;letter-spacing:.07em">Trip cost</div><div style="font-size:17px;font-weight:500">'+esc(R.r_totCost)+'</div><div class="text-muted" style="font-size:10px">'+esc(R.r_costLine)+'</div></div>'
        + '</div>';
      out += '<div style="display:flex;flex-direction:column;gap:3px"><span class="text-muted" style="font-size:11px">Per-item cost split</span>'
        + R.r_shares.map(sh=>'<div style="display:flex;justify-content:space-between;font-size:12.5px"><span>'+esc(sh.title)+'</span><span class="text-muted">'+esc(sh.pct)+' · '+esc(sh.amt)+'</span></div>').join('')
        + '</div>';
      if(R.r_mapOn) out += '<div style="height:220px;border-radius:var(--radius-md);overflow:hidden"><div data-map="run" style="height:100%"></div></div>';
      out += '<p class="text-muted" style="margin:0;font-size:11px">'+esc(R.r_mapNote)+'</p>';
      out += '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn btn-primary" data-h="'+this.h(R.r_done)+'"><i class="ph ph-check-circle"></i>Save &amp; complete now</button><button type="button" class="btn btn-secondary" data-h="'+this.h(R.r_save)+'">Save for later</button></div>';
    }
    out += '</div>';
  }
  if(R.r_noDraft) out += '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><p class="text-muted" style="margin:0;font-size:12.5px">Batch several pickups into one optimized loop — the cost splits across items.</p><button type="button" class="btn btn-primary" data-h="'+this.h(R.r_new)+'" style="flex:none"><i class="ph ph-plus"></i>New run</button></div>';
  if(R.r_empty) out += '<div class="card" style="align-items:center;padding:var(--space-8)"><i class="ph ph-path" style="font-size:26px;color:var(--color-neutral-600)"></i><p class="text-muted" style="font-size:13px;margin:0">No runs yet — build your first loop.</p></div>';
  out += '<div style="display:flex;flex-direction:column;gap:var(--space-2)">';
  R.r_list.forEach(r => {
    out += '<div class="card elev-sm" style="flex-direction:row;align-items:center;gap:12px;flex-wrap:wrap">'
      + '<div style="flex:1;min-width:180px"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:14px">'+esc(r.name)+'</span><span class="'+r.statusCls+'" style="font-size:10px">'+esc(r.statusLabel)+'</span></div><div class="text-muted" style="font-size:11px;margin-top:2px">'+esc(r.date)+' · '+esc(r.sub)+'</div></div>'
      + '<div style="text-align:right"><div style="font-size:13.5px;font-weight:500">'+esc(r.miles)+'</div><div class="text-muted" style="font-size:10.5px">'+esc(r.cost)+'</div></div>'
      + '<div style="display:flex;gap:6px">'+(r.canComplete?'<button type="button" class="btn btn-primary" data-h="'+this.h(r.complete)+'" style="font-size:12px">Complete</button>':'')+'<button type="button" class="btn btn-icon btn-secondary" data-h="'+this.h(r.del)+'" aria-label="Delete run"><i class="ph ph-trash"></i></button></div>'
      + '</div>';
  });
  out += '</div></section>';
  return out;
};

App.prototype.tplMoney = function(R){
  let out = '<section data-screen-label="Tax and accounting" style="display:flex;flex-direction:column;gap:var(--space-4)">';
  out += '<div style="display:flex;gap:2px;overflow-x:auto;border-bottom:1px solid var(--color-divider)" data-np="1">'
    + R.m_tabs.map(t=>'<button type="button" data-h="'+this.h(t.set)+'" style="padding:9px 13px;background:none;border:none;border-bottom:2px solid '+t.bd+';color:'+t.fg+';font-size:13px;cursor:pointer;white-space:nowrap">'+esc(t.label)+'</button>').join('')
    + '</div>';
  if(R.mt_pnl){
    out += '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;align-items:center" data-np="1">'
      + R.m_modeSegs.map(sg=>'<button type="button" data-h="'+this.h(sg.set)+'" class="btn" style="font-size:12px;padding:4px 11px;border:1px solid '+sg.bd+';color:'+sg.fg+'">'+esc(sg.label)+'</button>').join('')
      + '<div style="margin-left:auto;display:flex;align-items:center;gap:6px"><button type="button" class="btn btn-icon btn-secondary" data-h="'+this.h(R.m_prev)+'" aria-label="Previous period"><i class="ph ph-caret-left"></i></button><span style="font-size:13.5px;min-width:110px;text-align:center">'+esc(R.m_label)+'</span><button type="button" class="btn btn-icon btn-secondary" data-h="'+this.h(R.m_next)+'" aria-label="Next period"><i class="ph ph-caret-right"></i></button></div>'
      + '</div>';
    out += '<div class="card elev-sm" style="gap:2px;max-width:640px"><span class="card-kicker" style="margin-bottom:6px">Profit &amp; loss — '+esc(R.m_label)+'</span>'
      + R.m_rows.map(x=>'<div style="padding:5px 0"><div style="display:flex;justify-content:space-between;gap:12px;font-size:13.5px"><span>'+esc(x.k)+'</span><span>'+esc(x.v)+'</span></div><div class="text-muted" style="font-size:10.5px">'+esc(x.sub)+'</div></div>').join('')
      + '<div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--color-divider);padding-top:10px;margin-top:6px"><span style="font-size:14px">Net profit</span><span style="font-size:24px;font-weight:500;color:'+R.m_netTone+'">'+esc(R.m_net)+'</span></div>'
      + '<div class="text-muted" style="font-size:11px">'+esc(R.m_unitLine)+'</div>'
      + '<div class="text-muted" style="font-size:11px">'+esc(R.m_stdAlt)+'</div>'
      + '<button type="button" class="btn btn-secondary" data-h="'+this.h(R.m_pnlCSV)+'" style="align-self:flex-start;margin-top:8px" data-np="1"><i class="ph ph-download-simple"></i>Export this P&amp;L (CSV)</button>'
      + '</div>';
  }
  if(R.mt_mileage){
    out += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--space-3);max-width:640px">'
      + R.m_methodCards.map(mc=>'<div style="border:1px solid '+mc.bd+';border-radius:var(--radius-md);padding:var(--space-3);background:var(--color-surface)"><div style="display:flex;justify-content:space-between;gap:8px"><span class="text-muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.07em">'+esc(mc.label)+'</span><span style="font-size:10px;color:var(--color-accent)">'+esc(mc.tag)+'</span></div><div style="font-size:22px;font-weight:500;margin-top:4px">'+esc(mc.value)+'</div><div class="text-muted" style="font-size:11px">'+esc(mc.sub)+'</div></div>').join('')
      + '</div>';
    out += '<p class="text-muted" style="margin:0;font-size:11.5px">Every pickup, delivery and completed run lands here automatically — date, business purpose, destination, round-trip miles. Choose the better deduction with your accountant.</p>';
    if(R.m_mileEmpty) out += '<p class="text-muted" style="font-size:12.5px">No trips logged yet.</p>';
    out += '<div style="overflow-x:auto" class="ftp-scroll"><table class="table" style="min-width:560px"><thead><tr><th>Date</th><th>Business purpose</th><th>Destination</th><th style="text-align:right">RT miles</th><th style="text-align:right">Cost</th></tr></thead><tbody>'
      + R.m_mileRows.map(r=>'<tr><td style="white-space:nowrap">'+esc(r.date)+'</td><td>'+esc(r.purpose)+'</td><td class="text-muted">'+esc(r.dest)+'</td><td style="text-align:right">'+esc(r.miles)+'</td><td style="text-align:right">'+esc(r.cost)+'</td></tr>').join('')
      + '</tbody></table></div>';
    out += '<button type="button" class="btn btn-secondary" data-h="'+this.h(R.m_mileCSV)+'" style="align-self:flex-start" data-np="1"><i class="ph ph-download-simple"></i>Export IRS mileage log (CSV)</button>';
  }
  if(R.mt_expenses){
    out += '<div class="card elev-sm" style="gap:var(--space-2);max-width:640px"><span class="card-kicker">Log an expense</span>'
      + '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'
      + '<div class="field" style="flex:1 1 30%"><label>Category</label>'+this.selectHTML(R.m_eCats, R.m_eCat, R.m_eSetCat)+'</div>'
      + R.m_eRows.map(f=>this.fieldHTML(f)).join('')
      + '<div class="field" style="flex:1 1 100%"><label>Description</label><div style="display:flex;gap:8px"><input class="input" placeholder="Boxes, tape, bubble wrap" value="'+esc(R.m_eDesc)+'" data-bind="expD.desc" data-h="'+this.h(R.m_eSetDesc)+'"><button type="button" class="btn btn-primary" data-h="'+this.h(R.m_addExp)+'" style="flex:none">Add</button></div></div>'
      + '</div></div>';
    if(R.m_expEmpty) out += '<p class="text-muted" style="font-size:12.5px">No expenses yet.</p>';
    out += '<div style="display:flex;flex-direction:column;gap:6px;max-width:640px">'
      + R.m_expRows.map(e=>'<div style="display:flex;align-items:center;gap:10px;padding:7px 0;font-size:13px"><span class="text-muted" style="flex:none;width:52px;font-size:11.5px">'+esc(e.date)+'</span><span style="flex:1;min-width:0">'+esc(e.desc)+'<span class="text-muted" style="font-size:11px"> · '+esc(e.cat)+'</span></span><span style="font-weight:500">'+esc(e.amt)+'</span><button type="button" class="btn btn-icon btn-ghost" data-h="'+this.h(e.del)+'" aria-label="Delete expense" style="width:28px;height:28px"><i class="ph ph-x" style="font-size:13px"></i></button></div>').join('')
      + '<div style="display:flex;justify-content:space-between;border-top:1px solid var(--color-divider);padding-top:8px;font-size:13px"><span class="text-muted">All logged expenses</span><span style="font-weight:500">'+esc(R.m_expTotal)+'</span></div>'
      + '</div>';
  }
  if(R.mt_taxes){
    out += '<p class="text-muted" style="margin:0;font-size:12.5px;max-width:640px">Setting aside <strong style="font-weight:500;color:var(--color-text)">'+esc(R.m_setAside)+'</strong> of net profit for federal + state + self-employment tax. '+esc(R.m_taxNote)+'</p>';
    out += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--space-3);max-width:840px">'
      + R.m_qRows.map(q=>'<div style="border:1px solid '+q.bd+';border-radius:var(--radius-md);padding:var(--space-3);background:var(--color-surface)"><div style="display:flex;justify-content:space-between"><span style="font-size:13px;font-weight:500">'+esc(q.q)+' <span class="text-muted" style="font-size:11px;font-weight:400">'+esc(q.label)+'</span></span><span style="font-size:10px;color:var(--color-accent)">'+esc(q.tag)+'</span></div><div style="display:flex;justify-content:space-between;margin-top:8px;font-size:12px"><span class="text-muted">Net profit</span><span>'+esc(q.net)+'</span></div><div style="display:flex;justify-content:space-between;margin-top:3px;font-size:12px"><span class="text-muted">Reserve</span><span style="font-weight:500;color:var(--color-accent-300)">'+esc(q.reserve)+'</span></div></div>').join('')
      + '</div>';
    out += '<div class="card" style="flex-direction:row;justify-content:space-between;align-items:baseline;max-width:640px"><span style="font-size:13px">Year to date: <span class="text-muted">net '+esc(R.m_ytdNet)+'</span></span><span style="font-size:15px;font-weight:500">reserve '+esc(R.m_ytdReserve)+'</span></div>';
  }
  if(R.mt_payouts){
    out += '<div class="card elev-sm" style="gap:var(--space-2);max-width:640px"><span class="card-kicker">Record a payout</span>'
      + '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:flex-end">'
      + '<div class="field" style="flex:1 1 30%"><label>Platform</label>'+this.selectHTML(R.m_pPlats, R.m_pPlat, R.m_pSetPlat)+'</div>'
      + R.m_pRows.map(f=>this.fieldHTML(f)).join('')
      + '<button type="button" class="btn btn-primary" data-h="'+this.h(R.m_addPay)+'">Add</button>'
      + '</div></div>';
    out += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:var(--space-3);max-width:840px">'
      + R.m_recon.map(rc=>'<div class="card elev-sm" style="gap:4px"><span style="font-size:13px;font-weight:500">'+esc(rc.platform)+'</span><div style="display:flex;justify-content:space-between;font-size:12px"><span class="text-muted">Gross sales (yr)</span><span>'+esc(rc.gross)+'</span></div><div style="display:flex;justify-content:space-between;font-size:12px"><span class="text-muted">Payouts recorded</span><span>'+esc(rc.paid)+'</span></div><div style="display:flex;justify-content:space-between;font-size:12px"><span class="text-muted">Delta vs 1099-K gross</span><span style="color:'+rc.tone+'">'+esc(rc.delta)+'</span></div><div class="text-muted" style="font-size:10.5px">'+esc(rc.sub)+'</div></div>').join('')
      + '</div>';
    if(R.m_payEmpty) out += '<p class="text-muted" style="font-size:12.5px">No payouts recorded yet.</p>';
    out += '<div style="display:flex;flex-direction:column;gap:2px;max-width:640px">'
      + R.m_payRows.map(p=>'<div style="display:flex;align-items:center;gap:10px;padding:7px 0;font-size:13px"><span class="text-muted" style="flex:none;width:52px;font-size:11.5px">'+esc(p.date)+'</span><span style="flex:1;min-width:0">'+esc(p.platform)+'<span class="text-muted" style="font-size:11px"> · '+esc(p.note)+'</span></span><span style="font-weight:500">'+esc(p.amt)+'</span><button type="button" class="btn btn-icon btn-ghost" data-h="'+this.h(p.del)+'" aria-label="Delete payout" style="width:28px;height:28px"><i class="ph ph-x" style="font-size:13px"></i></button></div>').join('')
      + '</div>';
  }
  if(R.mt_export){
    out += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:var(--space-2);max-width:840px">'
      + R.m_exports.map(x=>'<button type="button" class="btn btn-secondary" data-h="'+this.h(x.run)+'" style="justify-content:flex-start;gap:12px;padding:13px 14px"><i class="'+x.icon+'" style="font-size:19px;color:var(--color-accent)"></i><span style="text-align:left;line-height:1.25"><span style="display:block;font-size:13px">'+esc(x.label)+'</span><span class="text-muted" style="display:block;font-size:10.5px;font-weight:400">'+esc(x.sub)+'</span></span></button>').join('')
      + '<label class="btn btn-secondary" style="justify-content:flex-start;gap:12px;padding:13px 14px;cursor:pointer"><i class="ph ph-upload-simple" style="font-size:19px;color:var(--color-accent)"></i><span style="text-align:left;line-height:1.25"><span style="display:block;font-size:13px">Import backup (JSON)</span><span class="text-muted" style="display:block;font-size:10.5px;font-weight:400">Restores items, settings, everything</span></span><input type="file" accept="application/json,.json" data-h="'+this.h(R.m_import)+'" style="display:none"></label>'
      + '</div>';
    if(R.m_hasImportNote) out += '<p style="margin:0;font-size:12px;color:var(--color-accent-300)">'+esc(R.m_importNote)+'</p>';
  }
  out += '</section>';
  return out;
};

App.prototype.tplAnalytics = function(R){
  let out = '<section data-screen-label="Analytics" style="display:flex;flex-direction:column;gap:var(--space-4)">';
  out += '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">'
    + R.a_ranges.map(rg=>'<button type="button" data-h="'+this.h(rg.set)+'" class="btn" style="font-size:12px;padding:4px 11px;border:1px solid '+rg.bd+';color:'+rg.fg+'">'+esc(rg.label)+'</button>').join('')
    + '<div style="flex:0 1 180px;width:auto;margin-left:auto">'+this.selectHTML(R.a_cats, R.a_cat, R.a_setCat)+'</div>'
    + '</div>';
  out += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--space-3)">'
    + R.a_cards.map(c=>'<div class="card elev-sm" style="gap:2px"><span class="text-muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.07em">'+esc(c.label)+'</span><span style="font-size:22px;font-weight:500">'+esc(c.value)+'</span><span class="text-muted" style="font-size:11px">'+esc(c.sub)+'</span></div>').join('')
    + '</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-3)">'
    + '<div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px"><span class="card-kicker">Monthly net profit</span><span class="text-muted" style="font-size:11px">'+esc(R.a_lineLast)+'</span></div>'
    + '<div style="display:flex;align-items:flex-end;gap:10px;height:130px">'
    + R.a_bars.map(b=>'<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;height:100%;justify-content:flex-end"><div class="text-muted" style="font-size:10px">'+esc(b.val)+'</div><div style="width:100%;max-width:46px;height:'+b.hPct+';min-height:2px;border-radius:4px 4px 0 0;background:'+b.bg+'"></div><div class="text-muted" style="font-size:10px">'+esc(b.label)+'</div></div>').join('')
    + '</div>'
    + '<svg viewBox="0 0 100 40" preserveAspectRatio="none" style="width:100%;height:52px;display:block;overflow:visible"><polyline points="'+R.a_line+'" vector-effect="non-scaling-stroke" style="fill:none;stroke:var(--color-accent);stroke-width:1.6px"></polyline></svg>'
    + '<div class="text-muted" style="font-size:10.5px">Bars: item net profit by sold month · line: cumulative (before shared expenses)</div>'
    + '</div>';
  out += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--space-3)">'
    + R.a_capital.map(c=>'<div class="card elev-sm" style="gap:2px"><span class="text-muted" style="font-size:10.5px;text-transform:uppercase;letter-spacing:.07em">'+esc(c.label)+'</span><span style="font-size:22px;font-weight:500">'+esc(c.value)+'</span><span class="text-muted" style="font-size:11px">'+esc(c.sub)+'</span></div>').join('')
    + '</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Category scorecard</span>'
    + '<div style="overflow-x:auto" class="ftp-scroll"><table class="table" style="min-width:560px"><thead><tr><th>Category</th><th>Flips</th><th style="text-align:right">Avg net</th><th style="text-align:right">Avg ROI</th><th style="text-align:right">Sell-through</th><th style="text-align:right">$ / hour</th></tr></thead><tbody>'
    + R.a_catRows.map(r=>'<tr><td>'+esc(r.cat)+'</td><td class="text-muted">'+esc(r.flips)+'</td><td style="text-align:right">'+esc(r.avgNet)+'</td><td style="text-align:right">'+esc(r.roi)+'</td><td style="text-align:right">'+esc(r.thru)+'</td><td style="text-align:right">'+esc(r.perHr)+'</td></tr>').join('')
    + '</tbody></table></div>'
    + '<div class="text-muted" style="font-size:10.5px">Double down where avg net and $/hour are both high.</div>'
    + '</div>';
  out += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:var(--space-4);align-items:start">';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><span class="card-kicker">Inventory alerts</span><span class="text-muted" style="font-size:10px">'+esc(R.a_agingNote)+'</span></div>';
  if(R.a_noAlerts) out += '<p class="text-muted" style="font-size:12.5px;margin:0">Nothing aging, nothing due for renewal. Clean shelf.</p>';
  R.a_aging.forEach(g => { out += '<button type="button" data-h="'+this.h(g.open)+'" style="display:flex;align-items:center;gap:10px;padding:7px 4px;background:none;border:none;cursor:pointer;color:inherit;text-align:left;border-radius:var(--radius-sm)" class="ftp-hover-tint"><i class="ph ph-hourglass-medium" style="font-size:16px;color:'+g.tone+'"></i><span style="flex:1;min-width:0;font-size:13px">'+esc(g.title)+'<span class="text-muted" style="font-size:11px"> — '+esc(g.days)+'</span></span><span style="font-size:11.5px;color:var(--color-accent-300)">'+esc(g.suggest)+'</span></button>'; });
  R.a_renews.forEach(g => { out += '<button type="button" data-h="'+this.h(g.open)+'" style="display:flex;align-items:center;gap:10px;padding:7px 4px;background:none;border:none;cursor:pointer;color:inherit;text-align:left;border-radius:var(--radius-sm)" class="ftp-hover-tint"><i class="ph ph-arrows-clockwise" style="font-size:16px;color:var(--color-accent)"></i><span style="flex:1;min-width:0;font-size:13px">'+esc(g.title)+'<span class="text-muted" style="font-size:11px"> — '+esc(g.days)+'</span></span><span class="text-muted" style="font-size:11.5px">renew on FB</span></button>'; });
  out += '</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Best &amp; worst flips</span>';
  if(R.a_hasBW){
    out += '<div style="display:flex;justify-content:space-between;gap:10px;font-size:13px"><span style="min-width:0"><i class="ph ph-trophy" style="color:'+R.a_goodTone+';font-size:14px"></i> '+esc(R.a_best.title)+'<span class="text-muted" style="display:block;font-size:10.5px;padding-left:20px">'+esc(R.a_best.sub)+'</span></span><span style="font-weight:500;color:'+R.a_goodTone+'">'+esc(R.a_best.amt)+'</span></div>';
    out += '<div style="display:flex;justify-content:space-between;gap:10px;font-size:13px"><span style="min-width:0"><i class="ph ph-arrow-elbow-down-right" style="color:var(--color-neutral-500);font-size:14px"></i> '+esc(R.a_worst.title)+'<span class="text-muted" style="display:block;font-size:10.5px;padding-left:20px">'+esc(R.a_worst.sub)+'</span></span><span style="font-weight:500;color:'+(R.a_worst.tone||'inherit')+'">'+esc(R.a_worst.amt)+'</span></div>';
  }
  out += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);border-top:1px solid var(--color-divider);padding-top:var(--space-3)">'
    + R.a_totals.map(tt=>'<div><div class="text-muted" style="font-size:10px;text-transform:uppercase;letter-spacing:.07em">'+esc(tt.label)+'</div><div style="font-size:16px;font-weight:500;margin-top:2px">'+esc(tt.value)+'</div></div>').join('')
    + '</div></div>';
  out += '</div></section>';
  return out;
};

App.prototype.tplToolkit = function(R){
  let out = '<section data-screen-label="Toolkit" style="display:flex;flex-direction:column;gap:var(--space-4)">';
  out += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap"><p class="text-muted" style="margin:0;font-size:12.5px;max-width:560px">Facebook has no Marketplace API — so make the manual workflow fast: paste-parse intake, one-tap message templates, and a cross-listing routine per item.</p><button type="button" class="btn btn-secondary" data-h="'+this.h(R.t_add)+'" style="flex:none"><i class="ph ph-plus"></i>New template</button></div>';
  out += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:var(--space-3)">';
  R.t_tpls.forEach(t => {
    out += '<div class="card elev-sm" style="gap:var(--space-2)">'
      + '<div style="display:flex;gap:8px;align-items:center"><input class="input" style="font-weight:500;font-size:13.5px" value="'+esc(t.name)+'" data-bind="tpl.'+esc(t.id)+'.name" data-h="'+this.h(t.setName)+'"><button type="button" class="btn btn-icon btn-secondary" data-h="'+this.h(t.del)+'" aria-label="Delete template" style="flex:none"><i class="ph ph-trash"></i></button></div>'
      + '<textarea class="input" style="min-height:84px;font-size:12.5px;line-height:1.45" data-bind="tpl.'+esc(t.id)+'.body" data-h="'+this.h(t.setBody)+'">'+esc(t.body)+'</textarea>'
      + '<button type="button" class="btn btn-primary" data-h="'+this.h(t.copy)+'" style="align-self:flex-start;font-size:12.5px"><i class="ph ph-copy"></i>Copy</button>'
      + '</div>';
  });
  out += '</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2);max-width:640px"><span class="card-kicker">Platform fee presets</span><p class="text-muted" style="margin:0;font-size:11.5px">Used by the evaluator, mark-sold, and the cross-listing checklist.</p>';
  R.t_fees.forEach((f,i) => {
    out += '<div style="display:flex;gap:8px;align-items:center"><input class="input" value="'+esc(f.name)+'" data-bind="fee.'+i+'.name" data-h="'+this.h(f.setName)+'"><input class="input" type="number" style="flex:0 0 84px" value="'+esc(f.pct)+'" data-bind="fee.'+i+'.pct" data-h="'+this.h(f.setPct)+'"><span class="text-muted" style="font-size:12px">%</span><button type="button" class="btn btn-icon btn-ghost" data-h="'+this.h(f.del)+'" aria-label="Delete preset" style="flex:none;width:30px;height:30px"><i class="ph ph-x" style="font-size:13px"></i></button></div>';
  });
  out += '<button type="button" class="btn btn-ghost" data-h="'+this.h(R.t_addFee)+'" style="align-self:flex-start;font-size:12.5px"><i class="ph ph-plus"></i>Add platform</button></div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2);max-width:640px"><span class="card-kicker">The 60-second cross-listing routine</span><div style="font-size:13px;line-height:1.6" class="text-muted"><div>1 · Open the item → tick each platform in its checklist as you post.</div><div>2 · Copy the same photos &amp; title everywhere; fees auto-apply from presets.</div><div>3 · The dashboard reminds you to renew Facebook listings every cycle — renewed listings regain visibility.</div></div></div>';
  out += '</section>';
  return out;
};

App.prototype.tplSettings = function(R){
  let out = '<section data-screen-label="Settings" style="display:grid;gap:var(--space-4);grid-template-columns:repeat(auto-fit,minmax(300px,1fr));align-items:start">';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Home base</span>'
    + '<div class="field"><label>Address — every trip starts &amp; ends here</label><div style="display:flex;gap:8px"><input class="input" value="'+esc(R.s_homeAddr)+'" data-bind="settings.homeAddress" data-h="'+this.h(R.s_setHomeAddr)+'"><button type="button" class="btn btn-primary" data-h="'+this.h(R.s_homeLookup)+'" style="flex:none">Geocode</button></div></div>'
    + '<p class="text-muted" style="margin:0;font-size:11px">'+esc(R.s_homeSub)+'</p>'
    + (R.s_mapOn ? '<div data-map="home" style="height:150px;border-radius:var(--radius-md);overflow:hidden"></div>' : '')
    + '</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Vehicle &amp; trip costs</span>'
    + '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.s_vRows.map(f=>this.fieldHTML(f)).join('')+'</div>'
    + '<p class="text-muted" style="margin:0;font-size:11px">Trip gas cost = round-trip miles ÷ MPG × gas price, plus wear per mile and tolls.</p>'
    + '</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Apple Maps (MapKit JS)</span>'
    + '<div style="display:flex;align-items:center;gap:8px;font-size:12.5px"><span style="width:8px;height:8px;border-radius:50%;background:'+R.s_mapDot+';flex:none"></span>'+esc(R.s_mapStatus)+'</div>'
    + '<div class="field"><label>MapKit JS token (JWT)</label><textarea class="input" style="min-height:64px;font-size:11px;font-family:ui-monospace,Menlo,monospace" placeholder="eyJraWQiOi…" data-bind="tokenDraft" data-h="'+this.h(R.s_setToken)+'">'+esc(R.s_token)+'</textarea></div>'
    + '<div style="display:flex;gap:8px"><button type="button" class="btn btn-primary" data-h="'+this.h(R.s_saveToken)+'">Save token</button><button type="button" class="btn btn-ghost" data-h="'+this.h(R.s_toggleGuide)+'">Setup guide<i class="'+R.s_guideChev+'"></i></button></div>';
  if(R.s_guideOpen){
    out += '<div style="font-size:12px;line-height:1.65;color:color-mix(in srgb, var(--color-text) 78%, transparent)">'
      + '<div>1 · Join the Apple Developer Program at developer.apple.com ($99/yr).</div>'
      + '<div>2 · Certificates, Identifiers &amp; Profiles → Identifiers → register a <strong style="font-weight:500">Maps ID</strong>.</div>'
      + '<div>3 · Keys → create a key with <strong style="font-weight:500">MapKit JS</strong> checked, tied to that Maps ID.</div>'
      + '<div>4 · Account → Services → <strong style="font-weight:500">Maps tokens</strong> → mint a long-lived MapKit JS token. Restrict it to your domain, or leave the origin blank while testing.</div>'
      + '<div>5 · Paste it above. It’s stored only in this browser.</div>'
      + '<div class="text-muted" style="margin-top:6px">No token? Everything still works — you just type one-way miles yourself. MapKit JS directions can’t price or avoid tolls, so tolls are always your entry (use presets).</div>'
      + '</div>';
  }
  out += '</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Goal, taxes &amp; ops</span>'
    + '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.s_gRows.map(f=>this.fieldHTML(f)).join('')+'</div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.s_oRows.map(f=>this.fieldHTML(f)).join('')+'</div>'
    + '</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Named toll presets</span>'
    + R.s_tolls.map(t=>'<div style="display:flex;align-items:center;gap:8px;font-size:13px"><span style="flex:1">'+esc(t.name)+'</span><span style="font-weight:500">'+esc(t.amt)+'</span><button type="button" class="btn btn-icon btn-ghost" data-h="'+this.h(t.del)+'" aria-label="Delete toll preset" style="width:28px;height:28px"><i class="ph ph-x" style="font-size:13px"></i></button></div>').join('')
    + '<div style="display:flex;gap:8px"><input class="input" placeholder="PA Turnpike Mid-County RT" value="'+esc(R.s_tollName)+'" data-bind="tollD.name" data-h="'+this.h(R.s_setTollName)+'"><input class="input" type="number" placeholder="7.60" style="flex:0 0 84px" value="'+esc(R.s_tollAmt)+'" data-bind="tollD.amount" data-h="'+this.h(R.s_setTollAmt)+'"><button type="button" class="btn btn-primary" data-h="'+this.h(R.s_addToll)+'" style="flex:none">Add</button></div>'
    + '</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Categories</span>'
    + '<div style="display:flex;flex-wrap:wrap;gap:6px">'+R.s_cats.map(c=>'<span class="tag tag-neutral" style="gap:6px">'+esc(c.name)+'<button type="button" data-h="'+this.h(c.del)+'" aria-label="Remove category" style="background:none;border:none;color:inherit;cursor:pointer;padding:0;display:inline-flex"><i class="ph ph-x" style="font-size:11px"></i></button></span>').join('')+'</div>'
    + '<div style="display:flex;gap:8px"><input class="input" placeholder="New category" value="'+esc(R.s_catInput)+'" data-bind="catInput" data-h="'+this.h(R.s_setCatInput)+'"><button type="button" class="btn btn-primary" data-h="'+this.h(R.s_addCat)+'" style="flex:none">Add</button></div>'
    + '</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Appearance</span><div style="display:flex;gap:6px">'
    + R.s_themes.map(t=>'<button type="button" data-h="'+this.h(t.set)+'" class="btn" style="font-size:12px;padding:5px 14px;border:1px solid '+t.bd+';color:'+t.fg+'">'+esc(t.label)+'</button>').join('')
    + '</div></div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Data</span><div style="display:flex;flex-direction:column;gap:6px">'
    + '<button type="button" class="btn btn-secondary" data-h="'+this.h(R.s_backup)+'" style="justify-content:flex-start"><i class="ph ph-download-simple"></i>Export full backup (JSON)</button>'
    + '<button type="button" class="btn btn-secondary" data-h="'+this.h(R.s_itemsCSV)+'" style="justify-content:flex-start"><i class="ph ph-file-csv"></i>Export items (CSV)</button>'
    + '<label class="btn btn-secondary" style="justify-content:flex-start;cursor:pointer"><i class="ph ph-upload-simple"></i>Import backup (JSON)<input type="file" accept="application/json,.json" data-h="'+this.h(R.s_import)+'" style="display:none"></label>'
    + '<button type="button" class="btn btn-secondary" data-h="'+this.h(R.s_clearDemo)+'" style="justify-content:flex-start"><i class="ph ph-broom"></i>Clear demo data</button>'
    + '<button type="button" class="btn btn-ghost" data-h="'+this.h(R.s_resetAll)+'" style="justify-content:flex-start;color:var(--color-neutral-400)"><i class="ph ph-arrow-counter-clockwise"></i>Reset everything to demo</button>'
    + '</div>';
  if(R.s_hasImportNote) out += '<p style="margin:0;font-size:12px;color:var(--color-accent-300)">'+esc(R.s_importNote)+'</p>';
  out += '<p class="text-muted" style="margin:0;font-size:11px">Data lives in this browser (localStorage) and survives sessions. Back up before clearing site data.</p></div>';
  out += '</section>';
  return out;
};
})();
