/* Flip Tracker Pro — shell (nav/header/tabs), Home screen, Items screen. */
(function(){
'use strict';

App.prototype.template = function(R){
  if(!R.ready){
    return '<div style="display:flex;align-items:center;justify-content:center;min-height:100dvh;color:var(--color-text)">Loading…</div>';
  }
  let out = '<div style="display:flex;min-height:100dvh;background:var(--color-bg);color:var(--color-text);font-family:var(--font-body)">';
  if(R.desktop) out += this.tplSidebar(R);
  out += '<main style="flex:1;min-width:0;display:flex;flex-direction:column">';
  if(R.mobile) out += this.tplHeader(R);
  out += '<div style="width:100%;max-width:1140px;margin:0 auto;padding:'+R.mainPad+';display:flex;flex-direction:column;gap:var(--space-4)">';
  if(R.scr_home) out += this.tplHome(R);
  if(R.scr_items) out += this.tplItems(R);
  if(R.scr_evaluate) out += this.tplEvaluate(R);
  if(R.scr_runs) out += this.tplRuns(R);
  if(R.scr_money) out += this.tplMoney(R);
  if(R.scr_analytics) out += this.tplAnalytics(R);
  if(R.scr_toolkit) out += this.tplToolkit(R);
  if(R.scr_settings) out += this.tplSettings(R);
  out += '</div></main>';
  if(R.mobile) out += this.tplBottomNav(R);
  if(R.plusOpen) out += this.tplSheet('Add', R.plusNav, R);
  if(R.moreOpen) out += this.tplSheet('More', R.moreNav, R);
  if(R.d_open) out += this.tplDetail(R);
  if(R.e_open) out += this.tplEdit(R);
  if(R.hasToast) out += '<div style="position:fixed;left:50%;transform:translateX(-50%);bottom:calc(86px + env(safe-area-inset-bottom));z-index:95;background:var(--color-surface);box-shadow:var(--shadow-md);border-radius:99px;padding:8px 18px;font-size:12.5px;white-space:nowrap;animation:ftpUp .18s ease-out">'+esc(R.toast)+'</div>';
  out += '</div>';
  return out;
};

App.prototype.tplSidebar = function(R){
  let out = '<nav data-np="1" style="width:216px;flex:none;position:sticky;top:0;height:100dvh;display:flex;flex-direction:column;gap:2px;padding:var(--space-6) var(--space-3);border-right:1px solid var(--color-divider);overflow:auto" class="ftp-scroll">';
  out += '<div style="display:flex;align-items:center;gap:10px;padding:0 var(--space-2);margin-bottom:var(--space-6)">'
    + '<div style="width:30px;height:30px;flex:none;border:1px solid var(--color-accent);border-radius:9px;display:grid;place-items:center;color:var(--color-accent)"><i class="ph ph-arrows-clockwise" style="font-size:16px"></i></div>'
    + '<div><div style="font-size:14px;font-weight:600;line-height:1.15">Flip Tracker Pro</div><div class="text-muted" style="font-size:9.5px;letter-spacing:.09em;text-transform:uppercase">'+esc(R.brandSub)+'</div></div></div>';
  R.sideNav.forEach(n => {
    out += '<button type="button" data-h="'+this.h(n.go)+'" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--radius-md);border:none;cursor:pointer;font-size:13.5px;text-align:left;background:'+n.bg+';color:'+n.fg+'"><i class="'+n.icon+'" style="font-size:17px"></i>'+esc(n.label)+'</button>';
  });
  out += '<div style="flex:1"></div>';
  out += '<div class="card" style="gap:6px;padding:var(--space-3)"><span class="card-kicker">'+esc(R.h_monthLabel)+'</span><div style="font-size:19px;font-weight:500">'+esc(R.h_paceNet)+'</div><div style="position:relative;height:5px;border-radius:99px;background:var(--color-neutral-900);overflow:hidden"><div style="height:100%;width:'+R.h_paceW+';background:var(--color-accent);border-radius:99px"></div></div><div class="text-muted" style="font-size:10.5px">of '+esc(R.h_goal)+' goal</div></div>';
  out += '<button type="button" class="btn btn-secondary" data-h="'+this.h(R.themeToggle)+'" style="margin-top:var(--space-2);font-size:12.5px"><i class="'+R.themeIcon+'"></i>'+esc(R.themeLabel)+'</button>';
  out += '</nav>';
  return out;
};

App.prototype.tplHeader = function(R){
  return '<header data-np="1" style="position:sticky;top:0;z-index:30;display:flex;align-items:center;gap:10px;padding:calc(12px + env(safe-area-inset-top)) 14px 12px;background:color-mix(in srgb, var(--color-bg) 86%, transparent);backdrop-filter:blur(14px);border-bottom:1px solid var(--color-divider)">'
    + '<div style="width:26px;height:26px;flex:none;border:1px solid var(--color-accent);border-radius:8px;display:grid;place-items:center;color:var(--color-accent)"><i class="ph ph-arrows-clockwise" style="font-size:14px"></i></div>'
    + '<div style="font-size:16px;font-weight:600;flex:1">'+esc(R.screenTitle)+'</div>'
    + '<button type="button" class="btn btn-icon btn-secondary" data-h="'+this.h(R.themeToggle)+'" aria-label="Toggle theme"><i class="'+R.themeIcon+'" style="font-size:16px"></i></button>'
    + '<button type="button" class="btn btn-icon btn-secondary" data-h="'+this.h(R.goSettings)+'" aria-label="Settings"><i class="ph ph-gear-six" style="font-size:16px"></i></button>'
    + '</header>';
};

App.prototype.tplBottomNav = function(R){
  let out = '<div data-np="1" style="position:fixed;left:0;right:0;bottom:0;z-index:40;display:flex;align-items:stretch;background:color-mix(in srgb, var(--color-surface) 94%, transparent);backdrop-filter:blur(14px);border-top:1px solid var(--color-divider);padding:6px 4px calc(6px + env(safe-area-inset-bottom))">';
  R.tabNavL.forEach(n => { out += '<button type="button" data-h="'+this.h(n.go)+'" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0 4px;background:none;border:none;cursor:pointer;color:'+n.fg+';min-height:44px"><i class="'+n.icon+'" style="font-size:21px"></i><span style="font-size:9.5px;letter-spacing:.03em">'+esc(n.label)+'</span></button>'; });
  out += '<div style="flex:1;display:grid;place-items:center"><button type="button" data-h="'+this.h(R.openPlus)+'" aria-label="Add" style="width:48px;height:48px;border-radius:50%;border:1px solid var(--color-accent);color:var(--color-accent);background:var(--color-accent-900);display:grid;place-items:center;cursor:pointer;margin-top:-18px;box-shadow:var(--shadow-md)"><i class="ph ph-plus" style="font-size:22px"></i></button></div>';
  R.tabNavR.forEach(n => { out += '<button type="button" data-h="'+this.h(n.go)+'" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 0 4px;background:none;border:none;cursor:pointer;color:'+n.fg+';min-height:44px"><i class="'+n.icon+'" style="font-size:21px"></i><span style="font-size:9.5px;letter-spacing:.03em">'+esc(n.label)+'</span></button>'; });
  out += '</div>';
  return out;
};

App.prototype.tplSheet = function(title, nav, R){
  let out = '<div data-h="'+this.h(R.closeSheets)+'" style="position:fixed;inset:0;z-index:70;background:color-mix(in srgb, var(--color-neutral-900) 55%, transparent);display:flex;align-items:'+R.sh_align+';justify-content:center;padding:'+R.sh_pad+';animation:ftpFade .15s ease-out">';
  out += '<div data-h="'+this.h(e=>e.stopPropagation())+'" style="width:min(460px,100%);background:var(--color-surface);border-radius:'+R.sh_rad+';box-shadow:var(--shadow-lg);padding:var(--space-4) var(--space-4) calc(var(--space-4) + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:4px;animation:ftpUp .2s ease-out">';
  out += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span class="card-kicker">'+esc(title)+'</span><button type="button" class="btn btn-icon btn-secondary" data-h="'+this.h(R.closeSheets)+'" aria-label="Close"><i class="ph ph-x"></i></button></div>';
  nav.forEach(p => {
    out += '<button type="button" data-h="'+this.h(p.go)+'" style="display:flex;align-items:center;gap:12px;padding:11px 10px;background:none;border:none;border-radius:var(--radius-md);cursor:pointer;color:inherit;text-align:left;min-height:44px" class="ftp-hover-tint"><i class="'+p.icon+'" style="font-size:20px;color:var(--color-accent);flex:none"></i><span style="line-height:1.25"><span style="display:block;font-size:14px">'+esc(p.label)+'</span><span class="text-muted" style="display:block;font-size:11px">'+esc(p.sub)+'</span></span></button>';
  });
  out += '</div></div>';
  return out;
};

App.prototype.tplHome = function(R){
  let out = '<section data-screen-label="Dashboard" style="display:grid;gap:var(--space-4);grid-template-columns:repeat(auto-fit,minmax(290px,1fr))">';
  out += '<div class="card elev-sm" style="grid-column:1/-1;gap:var(--space-3);padding:var(--space-6)">'
    + '<div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px"><span class="card-kicker">'+esc(R.h_monthLabel)+' goal</span><span class="text-muted" style="font-size:11.5px">'+R.h_daysLeft+' days left in the month</span></div>'
    + '<div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap"><span style="font-size:38px;line-height:1;font-weight:500;letter-spacing:-.02em">'+esc(R.h_paceNet)+'</span><span class="text-muted" style="font-size:13.5px">of '+esc(R.h_goal)+' · '+R.h_pacePct+'%</span></div>'
    + '<div style="position:relative;height:8px;margin:2px 0"><div style="position:absolute;inset:0;border-radius:99px;background:var(--color-neutral-900);overflow:hidden"><div style="height:100%;width:'+R.h_paceW+';background:linear-gradient(90deg,var(--color-accent-700),var(--color-accent));border-radius:99px"></div></div><div style="position:absolute;top:-4px;bottom:-4px;left:'+R.h_expW+';width:2px;background:var(--color-neutral-400);border-radius:2px" title="Where you should be today"></div></div>'
    + '<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:12.5px"><span style="color:'+R.h_paceColor+'">'+esc(R.h_paceMsg)+'</span><span class="text-muted">'+esc(R.h_perDay)+'/day needed · marker = today’s pace</span></div>'
    + '</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><div style="display:flex;justify-content:space-between;align-items:center"><span class="card-kicker">Today’s ops</span><span class="text-muted" style="font-size:11px">'+esc(R.h_opsCount)+'</span></div>';
  if(R.h_opsEmpty) out += '<p class="text-muted" style="font-size:12.5px;margin:0">All clear — go find inventory.</p>';
  R.ops.forEach(o => {
    out += '<div style="display:flex;align-items:center;gap:10px;padding:6px 0">'
      + '<button type="button" data-h="'+this.h(o.toggle)+'" aria-label="Mark done" style="width:22px;height:22px;flex:none;border-radius:50%;cursor:pointer;padding:0;display:grid;place-items:center;border:1.5px solid '+o.cbd+';background:'+o.cbg+';color:var(--color-accent-100)">'+(o.done?'<i class="ph ph-check" style="font-size:12px"></i>':'')+'</button>'
      + '<div style="flex:1;min-width:0"><div style="font-size:13px;text-decoration:'+o.deco+';white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(o.label)+'</div><div class="text-muted" style="font-size:11px">'+esc(o.sub)+'</div></div>'
      + (o.hasNav ? '<a class="btn btn-ghost" href="'+esc(o.href)+'" target="_blank" rel="noopener" style="font-size:12px;flex:none"><i class="ph ph-navigation-arrow"></i>Go</a>' : '')
      + (o.hasOpen ? '<button type="button" class="btn btn-ghost" data-h="'+this.h(o.open)+'" style="font-size:12px;flex:none">View</button>' : '')
      + '</div>';
  });
  out += '</div>';
  out += '<div class="card elev-sm" style="gap:var(--space-3)"><span class="card-kicker">Business at a glance</span><div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)">';
  R.h_stats.forEach(st => { out += '<div><div class="text-muted" style="font-size:10.5px;letter-spacing:.06em;text-transform:uppercase">'+esc(st.label)+'</div><div style="font-size:19px;font-weight:500;margin-top:2px">'+esc(st.value)+'</div><div class="text-muted" style="font-size:11px">'+esc(st.sub)+'</div></div>'; });
  out += '</div></div>';
  out += '<div class="card elev-sm" style="gap:var(--space-2)"><span class="card-kicker">Quick actions</span><div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)">';
  R.h_tiles.forEach(t => { out += '<button type="button" class="btn btn-secondary" data-h="'+this.h(t.go)+'" style="justify-content:flex-start;gap:10px;padding:11px 12px"><i class="'+t.icon+'" style="font-size:18px;color:var(--color-accent)"></i><span style="text-align:left;line-height:1.2"><span style="display:block;font-size:13px">'+esc(t.label)+'</span><span class="text-muted" style="display:block;font-size:10.5px;font-weight:400">'+esc(t.sub)+'</span></span></button>'; });
  out += '</div></div>';
  out += '<div class="card elev-sm" style="grid-column:1/-1;gap:var(--space-1)"><span class="card-kicker" style="margin-bottom:4px">Recent activity</span>';
  R.h_recent.forEach(r => {
    out += '<button type="button" data-h="'+this.h(r.open)+'" style="display:flex;align-items:center;gap:10px;padding:7px 4px;background:none;border:none;cursor:pointer;color:inherit;text-align:left;border-radius:var(--radius-sm)" class="ftp-hover-tint">'
      + '<i class="'+r.icon+'" style="font-size:16px;color:var(--color-accent);flex:none"></i>'
      + '<span style="flex:1;min-width:0;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(r.title)+'<span class="text-muted" style="font-size:11.5px"> — '+esc(r.sub)+'</span></span>'
      + '<span style="flex:none;font-size:13px;font-weight:500;color:'+r.tone+'">'+esc(r.amt)+'</span></button>';
  });
  out += '</div>';
  out += '</section>';
  return out;
};

App.prototype.tplItems = function(R){
  let out = '<section data-screen-label="Items" style="display:flex;flex-direction:column;gap:var(--space-3)">';
  out += '<div style="display:flex;gap:var(--space-2);flex-wrap:wrap;align-items:center">'
    + '<div style="position:relative;flex:1 1 200px"><i class="ph ph-magnifying-glass" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:15px;color:var(--color-neutral-500)"></i><input class="input" style="padding-left:32px" placeholder="Search title, address, notes" value="'+esc(R.it_search)+'" data-bind="it.search" data-h="'+this.h(R.it_setSearch)+'"></div>'
    + this.selectHTML(R.it_cats, R.it_cat, R.it_setCat, 'style="flex:0 1 168px;width:auto"')
    + this.selectHTML(R.it_sorts, R.it_sort, R.it_setSort, 'style="flex:0 1 158px;width:auto"')
    + '<button type="button" class="btn btn-primary" data-h="'+this.h(R.it_add)+'"><i class="ph ph-plus"></i>Add item</button>'
    + '</div>';
  out += '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">';
  R.it_statusChips.forEach(ch => { out += '<button type="button" data-h="'+this.h(ch.set)+'" class="btn" style="font-size:12px;padding:4px 11px;border:1px solid '+ch.bd+';color:'+ch.fg+'">'+esc(ch.label)+'</button>'; });
  out += '<span class="text-muted" style="font-size:11.5px;margin-left:auto">'+esc(R.it_count)+'</span></div>';
  if(R.it_empty) out += '<div class="card" style="align-items:center;padding:var(--space-8)"><i class="ph ph-binoculars" style="font-size:26px;color:var(--color-neutral-600)"></i><p class="text-muted" style="font-size:13px;margin:0">'+esc(R.it_emptyMsg)+'</p></div>';
  out += '<div style="display:flex;flex-direction:column;gap:var(--space-2)">';
  R.it_rows.forEach(r => {
    out += '<button type="button" data-h="'+this.h(r.open)+'" style="display:flex;align-items:center;gap:12px;padding:11px 13px;background:var(--color-surface);border:none;border-radius:var(--radius-md);cursor:pointer;color:inherit;text-align:left;box-shadow:var(--shadow-sm)">'
      + '<div style="width:38px;height:38px;flex:none;border-radius:9px;background:var(--color-neutral-900);display:grid;place-items:center"><i class="'+r.icon+'" style="font-size:18px;color:var(--color-accent)"></i></div>'
      + '<div style="flex:1;min-width:0"><div style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(r.title)+'</div><div style="display:flex;align-items:center;gap:7px;margin-top:3px"><span class="'+r.statusCls+'" style="font-size:10px;padding:1.5px 8px">'+esc(r.statusLabel)+'</span><span class="text-muted" style="font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(r.meta)+'</span></div></div>'
      + '<div style="flex:none;text-align:right"><div style="font-size:14.5px;font-weight:500;color:'+r.tone+'">'+esc(r.r1)+'</div><div class="text-muted" style="font-size:10.5px">'+esc(r.r2)+'</div></div>'
      + '</button>';
  });
  out += '</div></section>';
  return out;
};
})();
