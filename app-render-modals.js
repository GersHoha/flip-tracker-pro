/* Flip Tracker Pro — Item detail modal, Add/Edit item modal. */
(function(){
'use strict';

App.prototype.tplDetail = function(R){
  let out = '<div data-h="'+this.h(R.d_close)+'" style="position:fixed;inset:0;z-index:60;background:color-mix(in srgb, var(--color-neutral-900) 55%, transparent);display:flex;align-items:'+R.sh_align+';justify-content:center;padding:'+R.sh_pad+';animation:ftpFade .15s ease-out">';
  out += '<div data-h="'+this.h(e=>e.stopPropagation())+'" data-skey="detailmodal" style="width:min(680px,100%);max-height:92dvh;overflow:auto;background:var(--color-bg);border:1px solid var(--color-divider);border-radius:'+R.sh_rad+';box-shadow:var(--shadow-lg);padding:var(--space-6) var(--space-6) calc(var(--space-8) + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:var(--space-3);animation:ftpUp .22s ease-out" class="ftp-scroll">';
  out += '<div style="display:flex;align-items:flex-start;gap:10px"><div style="flex:1;min-width:0"><h4 style="margin:0;font-size:19px">'+esc(R.d_title)+'</h4><div style="display:flex;align-items:center;gap:8px;margin-top:5px;flex-wrap:wrap"><span class="'+R.d_statusCls+'" style="font-size:10px">'+esc(R.d_statusLabel)+'</span><span class="text-muted" style="font-size:11.5px">'+esc(R.d_meta)+'</span></div></div><button type="button" class="btn btn-icon btn-secondary" data-h="'+this.h(R.d_close)+'" aria-label="Close" style="flex:none"><i class="ph ph-x"></i></button></div>';
  out += '<div style="display:flex;gap:8px;flex-wrap:wrap">'
    + (R.d_hasAddr ? '<a class="btn btn-primary" href="'+esc(R.d_navHref)+'" target="_blank" rel="noopener"><i class="ph ph-navigation-arrow"></i>Navigate</a>' : '')
    + (R.d_canAdv ? '<button type="button" class="btn btn-primary" data-h="'+this.h(R.d_advance)+'"><i class="ph ph-arrow-right"></i>'+esc(R.d_advLabel)+'</button>' : '')
    + (R.d_splitShow ? '<button type="button" class="btn btn-secondary" data-h="'+this.h(R.d_split)+'"><i class="ph ph-arrows-split"></i>Split into parts</button>' : '')
    + (R.d_combineShow ? '<button type="button" class="btn btn-secondary" data-h="'+this.h(R.d_combine)+'"><i class="ph ph-arrows-merge"></i>Combine with…</button>' : '')
    + '<button type="button" class="btn btn-secondary" data-h="'+this.h(R.d_edit)+'"><i class="ph ph-pencil-simple"></i>Edit</button>'
    + '<button type="button" class="btn btn-icon btn-secondary" data-h="'+this.h(R.d_del)+'" aria-label="Delete item" style="margin-left:auto"><i class="ph ph-trash"></i></button>'
    + '</div>';
  if(R.d_hasLotParent) out += '<button type="button" class="btn btn-ghost" data-h="'+this.h(R.d_lotParent.open)+'" style="align-self:flex-start;font-size:12px"><i class="ph ph-stack"></i>Part of lot: '+esc(R.d_lotParent.title)+'</button>';
  if(R.d_hasBundleParent) out += '<div class="card" style="flex-direction:row;align-items:center;gap:10px;background:var(--color-accent-900)"><i class="ph ph-arrows-merge" style="font-size:16px;color:var(--color-accent)"></i><span style="flex:1;font-size:12.5px">This item was combined into a bundle — its cost now lives there.</span><button type="button" class="btn btn-ghost" data-h="'+this.h(R.d_bundleParent.open)+'" style="font-size:12px">'+esc(R.d_bundleParent.title)+'</button></div>';
  if(R.d_showStepper) out += '<div style="display:flex;align-items:center;gap:4px;padding:2px 0">'
    + R.d_steps.map(sp=>'<div style="display:flex;align-items:center;gap:5px;flex:1;min-width:0"><div style="width:19px;height:19px;flex:none;border-radius:50%;border:1.5px solid '+sp.bd+';background:'+sp.bg+';display:grid;place-items:center">'+(sp.done?'<i class="ph ph-check" style="font-size:10px;color:var(--color-accent-200)"></i>':'')+'</div><span style="font-size:10.5px;color:'+sp.fg+';white-space:nowrap">'+esc(sp.label)+'</span><div style="flex:1;height:1px;background:var(--color-divider);min-width:6px"></div></div>').join('')
    + '</div>';
  if(R.d_splitOpen){
    out += '<div class="card elev-md" style="gap:var(--space-2)"><span class="card-kicker">Split into parts</span>'
      + '<p class="text-muted" style="margin:0;font-size:11.5px">Each part becomes its own listing, carrying its share of the purchase price and trip cost. '+esc(R.sp_tripLine)+'</p>';
    R.sp_parts.forEach(p => {
      out += '<div style="display:flex;gap:8px;align-items:center">'
        + '<input class="input" placeholder="Part name — e.g. Dumbbells" value="'+esc(p.title)+'" data-bind="'+esc(p.bindT)+'" data-h="'+this.h(p.setTitle)+'">'
        + '<input class="input" type="number" placeholder="0" style="flex:0 0 92px" value="'+esc(p.cost)+'" data-bind="'+esc(p.bindC)+'" data-h="'+this.h(p.setCost)+'">'
        + (p.canDel ? '<button type="button" class="btn btn-icon btn-ghost" data-h="'+this.h(p.del)+'" aria-label="Remove part" style="width:28px;height:28px;flex:none"><i class="ph ph-x" style="font-size:13px"></i></button>' : '<span style="width:28px;flex:none"></span>')
        + '</div>';
    });
    out += '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">'
      + '<button type="button" class="btn btn-ghost" data-h="'+this.h(R.sp_add)+'" style="font-size:12.5px"><i class="ph ph-plus"></i>Add part</button>'
      + '<button type="button" class="btn btn-ghost" data-h="'+this.h(R.sp_even)+'" style="font-size:12.5px"><i class="ph ph-equals"></i>Split cost evenly</button>'
      + '<span style="margin-left:auto;font-size:11.5px;color:'+(R.sp_sumOk?'var(--color-accent-300)':this.WARN())+'">'+esc(R.sp_sumLine)+'</span>'
      + '</div>'
      + '<div style="display:flex;gap:8px"><button type="button" class="btn btn-primary" data-h="'+this.h(R.sp_confirm)+'"><i class="ph ph-arrows-split"></i>Create the parts</button><button type="button" class="btn btn-ghost" data-h="'+this.h(R.sp_cancel)+'">Cancel</button></div>'
      + '</div>';
  }
  if(R.d_bundleOpen){
    out += '<div class="card elev-md" style="gap:var(--space-2)"><span class="card-kicker">Combine into a bundle</span>'
      + '<p class="text-muted" style="margin:0;font-size:11.5px">The picked items merge into one sellable bundle carrying all their costs — purchase shares, trip costs, repairs. Unbundle any time to get them back.</p>'
      + '<div class="field"><label>Bundle name</label><input class="input" placeholder="'+esc(R.b_namePh)+'" value="'+esc(R.b_name)+'" data-bind="bundleD.name" data-h="'+this.h(R.b_setName)+'"></div>';
    if(R.b_noCands) out += '<p class="text-muted" style="font-size:12px;margin:0">Nothing else in inventory to combine with.</p>';
    out += '<div data-skey="bundlecands" style="display:flex;flex-direction:column;gap:6px;max-height:240px;overflow:auto" class="ftp-scroll">';
    R.b_cands.forEach(c => {
      out += '<button type="button" data-h="'+this.h(c.toggle)+'" style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:transparent;border:1px solid '+c.bd+';border-radius:var(--radius-md);cursor:pointer;color:inherit;text-align:left"><i class="'+c.icon+'" style="font-size:17px;color:'+c.fg+';flex:none"></i><span style="flex:1;min-width:0"><span style="display:block;font-size:13px;overflow-wrap:anywhere">'+esc(c.title)+'</span><span class="text-muted" style="display:block;font-size:10.5px">'+esc(c.sub)+'</span></span><span class="'+c.statusCls+'" style="font-size:10px;flex:none">'+esc(c.statusLabel)+'</span></button>';
    });
    out += '</div>'
      + '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button type="button" class="btn btn-primary" data-h="'+this.h(R.b_confirm)+'"><i class="ph ph-arrows-merge"></i>Create bundle</button><button type="button" class="btn btn-ghost" data-h="'+this.h(R.b_cancel)+'">Cancel</button><span class="text-muted" style="margin-left:auto;font-size:11.5px">'+esc(R.b_count)+'</span></div>'
      + '</div>';
  }
  if(R.d_isBundle){
    out += '<div class="card elev-sm" style="gap:var(--space-1)"><div style="display:flex;justify-content:space-between;align-items:center"><span class="card-kicker">Contains</span><button type="button" class="btn btn-ghost" data-h="'+this.h(R.d_unbundle)+'" style="font-size:12px"><i class="ph ph-arrows-split"></i>Unbundle</button></div>';
    R.d_bundleParts.forEach(p => {
      out += '<button type="button" data-h="'+this.h(p.open)+'" style="display:flex;align-items:center;gap:10px;padding:7px 4px;background:none;border:none;cursor:pointer;color:inherit;text-align:left;border-radius:var(--radius-sm)" class="ftp-hover-tint">'
        + '<span style="flex:1;min-width:0;font-size:13px;overflow-wrap:anywhere">'+esc(p.title)+'</span>'
        + '<span style="flex:none;text-align:right"><span style="display:block;font-size:13px;font-weight:500">'+esc(p.cost)+'</span><span class="text-muted" style="display:block;font-size:10px">'+esc(p.sub)+'</span></span>'
        + '</button>';
    });
    out += '</div>';
  }
  if(R.d_repShow){
    out += '<div class="card elev-sm" style="gap:var(--space-2)"><div style="display:flex;justify-content:space-between;align-items:baseline"><span class="card-kicker">Repairs &amp; refurb</span>'+(R.d_repHasAny?'<span style="font-size:12.5px;font-weight:500">'+esc(R.d_repTotal)+'</span>':'')+'</div>';
    R.d_repairs.forEach(r => {
      out += '<div style="display:flex;align-items:center;gap:10px;padding:2px 0;font-size:13px"><span class="text-muted" style="flex:none;width:52px;font-size:11.5px">'+esc(r.date)+'</span><span style="flex:1;min-width:0">'+esc(r.desc)+'</span><span style="font-weight:500">'+esc(r.amt)+'</span><button type="button" class="btn btn-icon btn-ghost" data-h="'+this.h(r.del)+'" aria-label="Delete repair" style="width:28px;height:28px"><i class="ph ph-x" style="font-size:13px"></i></button></div>';
    });
    out += '<div style="display:flex;gap:8px"><input class="input" placeholder="New wheels, cleaning, paint…" value="'+esc(R.d_repDesc)+'" data-bind="repD.desc" data-h="'+this.h(R.d_repSetDesc)+'"><input class="input" type="number" placeholder="25" style="flex:0 0 84px" value="'+esc(R.d_repAmt)+'" data-bind="repD.amount" data-h="'+this.h(R.d_repSetAmt)+'"><button type="button" class="btn btn-primary" data-h="'+this.h(R.d_repAdd)+'" style="flex:none">Add</button></div>'
      + '</div>';
  }
  if(R.d_isLot){
    out += '<div class="card elev-sm" style="gap:var(--space-3)"><span class="card-kicker">Lot performance</span>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">'
      + R.d_lotStats.map(x=>'<div><div class="text-muted" style="font-size:10.5px;letter-spacing:.06em;text-transform:uppercase">'+esc(x.k)+'</div><div style="font-size:19px;font-weight:500;margin-top:2px;color:'+(x.tone||'inherit')+'">'+esc(x.v)+'</div><div class="text-muted" style="font-size:11px">'+esc(x.sub)+'</div></div>').join('')
      + '</div></div>';
    out += '<div class="card elev-sm" style="gap:var(--space-1)"><span class="card-kicker" style="margin-bottom:4px">Parts</span>';
    R.d_lotParts.forEach(p => {
      out += '<button type="button" data-h="'+this.h(p.open)+'" style="display:flex;align-items:center;gap:10px;padding:7px 4px;background:none;border:none;cursor:pointer;color:inherit;text-align:left;border-radius:var(--radius-sm)" class="ftp-hover-tint">'
        + '<span style="flex:1;min-width:0;font-size:13px;overflow-wrap:anywhere">'+esc(p.title)+'</span>'
        + '<span class="'+p.statusCls+'" style="font-size:10px;flex:none">'+esc(p.statusLabel)+'</span>'
        + '<span style="flex:none;text-align:right"><span style="display:block;font-size:13px;font-weight:500;color:'+p.tone+'">'+esc(p.right)+'</span><span class="text-muted" style="display:block;font-size:10px">'+esc(p.sub2)+'</span></span>'
        + '</button>';
    });
    out += '</div>';
  }
  if(R.d_sellOpen){
    out += '<div class="card elev-md" style="gap:var(--space-2)"><span class="card-kicker">Mark sold</span>'
      + '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.d_sRows.map(f=>this.fieldHTML(f)).join('')
      + '<div class="field" style="flex:1 1 46%"><label>Sold on</label>'+this.selectHTML(R.d_sPlats, R.d_sPlat, R.d_sSetPlat)+'</div>'
      + '<div class="field" style="flex:1 1 20%"><label>Fee %</label><input class="input" type="number" value="'+esc(R.d_sFee)+'" data-bind="sellD.feePct" data-h="'+this.h(R.d_sSetFee)+'"></div>'
      + '<div class="field" style="flex:1 1 26%"><label>Fee preset</label>'+this.selectHTML(R.d_sFeeOpts, '', R.d_sApplyFee)+'</div>'
      + '</div>'
      + '<label class="radio" style="font-size:13px"><input type="checkbox" '+(R.d_sDelivered?'checked':'')+' data-h="'+this.h(R.d_sSetDelivered)+'" style="position:static;opacity:1;width:15px;height:15px;accent-color:var(--color-accent)">I delivered it (adds a second trip)</label>';
    if(R.d_sDelivered) out += '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.d_sDelRows.map(f=>this.fieldHTML(f)).join('')+'</div>';
    out += '<div style="display:flex;gap:8px"><button type="button" class="btn btn-primary" data-h="'+this.h(R.d_confirmSell)+'"><i class="ph ph-seal-check"></i>Confirm sale</button><button type="button" class="btn btn-ghost" data-h="'+this.h(R.d_sCancel)+'">Cancel</button></div>';
    out += '</div>';
  }
  out += '<div class="card elev-sm" style="gap:2px"><span class="card-kicker" style="margin-bottom:4px">Economics</span>'
    + R.d_money.map(x=>'<div style="padding:3px 0"><div style="display:flex;justify-content:space-between;gap:12px;font-size:13px"><span class="text-muted">'+esc(x.k)+'</span><span>'+esc(x.v)+'</span></div><div class="text-muted" style="font-size:10.5px;text-align:right">'+esc(x.sub)+'</div></div>').join('');
  if(R.d_hasNet) out += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-top:1px solid var(--color-divider);padding-top:9px;margin-top:5px"><span style="font-size:13px">'+esc(R.d_netLabel)+'</span><span style="text-align:right"><span style="font-size:21px;font-weight:500;color:'+R.d_netTone+'">'+esc(R.d_net)+'</span><span class="text-muted" style="font-size:11px;display:block">'+esc(R.d_roi)+'</span></span></div>';
  out += '</div>';
  if(R.d_hasTrip){
    out += '<div class="card elev-sm" style="gap:2px"><span class="card-kicker" style="margin-bottom:4px">Trip cost breakdown</span>'
      + R.d_trip.map(x=>'<div style="display:flex;justify-content:space-between;gap:12px;font-size:13px;padding:2.5px 0"><span class="text-muted">'+esc(x.k)+'</span><span>'+esc(x.v)+'</span></div>').join('');
    if(R.d_hasDel) out += R.d_delTrip.map(x=>'<div style="display:flex;justify-content:space-between;gap:12px;font-size:13px;padding:2.5px 0;border-top:1px solid var(--color-divider)"><span class="text-muted">'+esc(x.k)+'</span><span>'+esc(x.v)+'</span></div>').join('');
    out += '<div class="text-muted" style="font-size:10.5px;margin-top:4px">'+esc(R.d_tripNote)+'</div></div>';
  }
  if(R.d_mapOn) out += '<div data-map="detail" style="height:200px;border-radius:var(--radius-md);overflow:hidden;flex:none"></div>';
  out += '<p class="text-muted" style="margin:0;font-size:11px">'+esc(R.d_mapNote)+'</p>';
  if(R.d_mkShow) out += '<div style="display:flex;align-items:center;gap:8px;font-size:12px"><span style="color:var(--color-accent-300)">'+esc(R.d_mkLine)+'</span><button type="button" class="btn btn-ghost" data-h="'+this.h(R.d_mkApply)+'" style="font-size:12px">Use this</button></div>';
  if(R.d_showChecklist){
    out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Cross-listing checklist</span><div style="display:flex;flex-wrap:wrap;gap:6px">'
      + R.d_checklist.map(p=>'<button type="button" data-h="'+this.h(p.toggle)+'" class="btn" style="font-size:12px;padding:5px 10px;border:1px solid '+p.bd+';color:'+p.fg+'"><i class="'+p.icon+'" style="font-size:14px"></i>'+esc(p.name)+'<span class="text-muted" style="font-size:10px">'+esc(p.fee)+'</span></button>').join('')
      + '</div></div>';
  }
  out += '<div style="display:flex;gap:8px;flex-wrap:wrap">'
    + (R.d_renewShow ? '<button type="button" class="btn btn-secondary" data-h="'+this.h(R.d_renew)+'" style="font-size:12.5px"><i class="ph ph-arrows-clockwise"></i>'+esc(R.d_renewLabel)+'</button>' : '')
    + (R.d_repriceShow ? '<button type="button" class="btn btn-secondary" data-h="'+this.h(R.d_reprice)+'" style="font-size:12.5px"><i class="ph ph-trend-down"></i>'+esc(R.d_repriceLabel)+'</button>' : '')
    + '</div>';
  if(R.d_hasNotes) out += '<p class="text-muted" style="margin:0;font-size:12.5px;line-height:1.5">'+esc(R.d_notes)+'</p>';
  if(R.d_hasUrl) out += '<a href="'+esc(R.d_url)+'" target="_blank" rel="noopener" style="font-size:12px;color:var(--color-accent)">Original listing <i class="ph ph-arrow-up-right" style="font-size:11px"></i></a>';
  out += '</div></div>';
  return out;
};

App.prototype.tplEdit = function(R){
  let out = '<div data-h="'+this.h(R.e_close)+'" style="position:fixed;inset:0;z-index:65;background:color-mix(in srgb, var(--color-neutral-900) 55%, transparent);display:flex;align-items:'+R.sh_align+';justify-content:center;padding:'+R.sh_pad+';animation:ftpFade .15s ease-out">';
  out += '<div data-h="'+this.h(e=>e.stopPropagation())+'" data-skey="editmodal" style="width:min(640px,100%);max-height:92dvh;overflow:auto;background:var(--color-bg);border:1px solid var(--color-divider);border-radius:'+R.sh_rad+';box-shadow:var(--shadow-lg);padding:var(--space-6) var(--space-6) calc(var(--space-8) + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:var(--space-3);animation:ftpUp .22s ease-out" class="ftp-scroll">';
  out += '<div style="display:flex;align-items:center;gap:10px"><h4 style="margin:0;font-size:19px;flex:1">'+esc(R.e_heading)+'</h4><button type="button" class="btn btn-icon btn-secondary" data-h="'+this.h(R.e_close)+'" aria-label="Close"><i class="ph ph-x"></i></button></div>';
  if(R.e_showQuick){
    out += '<div class="card elev-sm" style="gap:var(--space-2);background:var(--color-accent-900)"><span class="card-kicker">Quick add — paste a listing</span>'
      + '<textarea class="input" style="min-height:64px;font-size:12px" placeholder="Paste a copied Facebook Marketplace listing (URL or text) — title, price and town get parsed out." data-bind="quick" data-h="'+this.h(R.e_setQuick)+'">'+esc(R.e_quick)+'</textarea>'
      + '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><button type="button" class="btn btn-primary" data-h="'+this.h(R.e_pasteQuick)+'" style="font-size:12.5px"><i class="ph ph-clipboard-text"></i>Paste &amp; parse</button><button type="button" class="btn btn-ghost" data-h="'+this.h(R.e_parseQuick)+'" style="font-size:12.5px"><i class="ph ph-magic-wand"></i>Parse it</button>'+(R.e_hasQuickNote?'<span style="font-size:11.5px;color:var(--color-accent-300)">'+esc(R.e_quickNote)+'</span>':'')+'</div>'
      + '</div>';
  }
  out += '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'
    + R.e_rowsTop.map(f=>this.fieldHTML(f)).join('')
    + '<div class="field" style="flex:1 1 30%"><label>Category</label>'+this.selectHTML(R.e_cats, R.e_cat, R.e_setCat)+'</div>'
    + '<div class="field" style="flex:1 1 30%"><label>Source platform</label>'+this.selectHTML(R.e_plats, R.e_plat, R.e_setPlat)+'</div>'
    + '<div class="field" style="flex:1 1 30%"><label>Status</label>'+this.selectHTML(R.e_statuses, R.e_status, R.e_setStatus)+'</div>'
    + '</div>';
  if(R.e_isWatch) out += '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.e_rowsWatch.map(f=>this.fieldHTML(f)).join('')+'</div>';
  if(R.e_showBuy) out += '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.e_rowsBuy.map(f=>this.fieldHTML(f)).join('')+'</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Pickup trip</span>'
    + '<div class="field"><label>Pickup address — or a pasted Apple/Google Maps link</label><div style="display:flex;gap:8px"><input class="input" placeholder="437 Main St, Doylestown, PA" value="'+esc(R.e_addr)+'" data-bind="edit.address" data-h="'+this.h(R.e_setAddr)+'"><button type="button" class="btn btn-primary" data-h="'+this.h(R.e_lookup)+'" style="flex:none"><i class="ph ph-map-pin"></i>Find route</button></div></div>'
    + '<button type="button" class="btn btn-ghost" data-h="'+this.h(R.e_pasteMaps)+'" style="align-self:flex-start;font-size:12px"><i class="ph ph-link"></i>Paste Maps link from clipboard</button>'
    + (R.e_hasLookupNote ? '<p style="margin:0;font-size:11.5px;color:var(--color-accent-300)">'+esc(R.e_lookupNote)+'</p>' : '')
    + '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.e_rowsTrip.map(f=>this.fieldHTML(f)).join('')
    + '<div class="field" style="flex:1 1 30%"><label>Toll presets</label>'+this.selectHTML(R.e_tollOpts, '', R.e_applyToll)+'</div></div>'
    + '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.e_rowsHaul.map(f=>this.fieldHTML(f)).join('')+'</div>'
    + '<p class="text-muted" style="margin:0;font-size:10.5px">Needed a truck? Rental + its fuel count into this item’s cost and get their own P&amp;L line — they stay out of your own-vehicle mileage log.</p>'
    + '</div>';
  if(R.e_showSell){
    out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Listing &amp; sale</span>'
      + '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.e_rowsList.map(f=>this.fieldHTML(f)).join('')+'</div>'
      + '<div><label style="font-size:12px;color:color-mix(in srgb, var(--color-text) 70%, transparent)">Listed on</label><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:5px">'
      + R.e_listedOn.map(p=>'<button type="button" data-h="'+this.h(p.toggle)+'" class="btn" style="font-size:12px;padding:4px 10px;border:1px solid '+p.bd+';color:'+p.fg+'">'+esc(p.name)+'</button>').join('')
      + '</div></div>';
    if(R.e_isSold){
      out += '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.e_rowsSold.map(f=>this.fieldHTML(f)).join('')
        + '<div class="field" style="flex:1 1 46%"><label>Sold on</label>'+this.selectHTML(R.e_plats, R.e_soldPlat, R.e_setSoldPlat)+'</div></div>'
        + '<label class="radio" style="font-size:13px"><input type="checkbox" '+(R.e_delivered?'checked':'')+' data-h="'+this.h(R.e_setDelivered)+'" style="position:static;opacity:1;width:15px;height:15px;accent-color:var(--color-accent)">I delivered it (second trip)</label>';
      if(R.e_delivered) out += '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.e_rowsDel.map(f=>this.fieldHTML(f)).join('')+'</div>';
    }
    out += '</div>';
  }
  out += '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.e_rowsNotes.map(f=>this.fieldHTML(f)).join('')+'</div>';
  out += '<div style="display:flex;gap:8px;position:sticky;bottom:0;background:var(--color-bg);padding:10px 0 2px;border-top:1px solid var(--color-divider)"><button type="button" class="btn btn-primary" data-h="'+this.h(R.e_save)+'" style="flex:1"><i class="ph ph-check"></i>Save item</button><button type="button" class="btn btn-ghost" data-h="'+this.h(R.e_close)+'">Cancel</button></div>';
  out += '</div></div>';
  return out;
};
})();
