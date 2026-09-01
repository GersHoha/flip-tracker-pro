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
    + '<button type="button" class="btn btn-secondary" data-h="'+this.h(R.d_edit)+'"><i class="ph ph-pencil-simple"></i>Edit</button>'
    + '<button type="button" class="btn btn-icon btn-secondary" data-h="'+this.h(R.d_del)+'" aria-label="Delete item" style="margin-left:auto"><i class="ph ph-trash"></i></button>'
    + '</div>';
  out += '<div style="display:flex;align-items:center;gap:4px;padding:2px 0">'
    + R.d_steps.map(sp=>'<div style="display:flex;align-items:center;gap:5px;flex:1;min-width:0"><div style="width:19px;height:19px;flex:none;border-radius:50%;border:1.5px solid '+sp.bd+';background:'+sp.bg+';display:grid;place-items:center">'+(sp.done?'<i class="ph ph-check" style="font-size:10px;color:var(--color-accent-200)"></i>':'')+'</div><span style="font-size:10.5px;color:'+sp.fg+';white-space:nowrap">'+esc(sp.label)+'</span><div style="flex:1;height:1px;background:var(--color-divider);min-width:6px"></div></div>').join('')
    + '</div>';
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
      + '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><button type="button" class="btn btn-primary" data-h="'+this.h(R.e_parseQuick)+'" style="font-size:12.5px"><i class="ph ph-magic-wand"></i>Parse it</button>'+(R.e_hasQuickNote?'<span style="font-size:11.5px;color:var(--color-accent-300)">'+esc(R.e_quickNote)+'</span>':'')+'</div>'
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
    + '<div class="field"><label>Pickup address</label><div style="display:flex;gap:8px"><input class="input" placeholder="437 Main St, Doylestown, PA" value="'+esc(R.e_addr)+'" data-bind="edit.address" data-h="'+this.h(R.e_setAddr)+'"><button type="button" class="btn btn-primary" data-h="'+this.h(R.e_lookup)+'" style="flex:none"><i class="ph ph-map-pin"></i>Find route</button></div></div>'
    + (R.e_hasLookupNote ? '<p style="margin:0;font-size:11.5px;color:var(--color-accent-300)">'+esc(R.e_lookupNote)+'</p>' : '')
    + '<div style="display:flex;flex-wrap:wrap;gap:var(--space-2)">'+R.e_rowsTrip.map(f=>this.fieldHTML(f)).join('')
    + '<div class="field" style="flex:1 1 30%"><label>Toll presets</label>'+this.selectHTML(R.e_tollOpts, '', R.e_applyToll)+'</div></div>'
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
