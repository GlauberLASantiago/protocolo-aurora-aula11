/* Progressive motion: no animation is required to read, decide or navigate. */
'use strict';
(function(root){
  const gsap=root.gsap, flip=root.Flip;
  const noop=()=>{};
  if(!gsap){root.AuroraMotion={beforeRender:noop,render:noop,capture:()=>null,beforeDialog:noop,dialog:noop,destroy:noop};return;}
  if(flip)gsap.registerPlugin(flip);
  const reduced=root.matchMedia?.('(prefers-reduced-motion: reduce)');
  const mobile=root.matchMedia?.('(max-width: 760px)');
  let viewContext=null, previous=null,disposed=false;
  const dialogs=new Map();
  const enabled=()=>Boolean(!disposed&&reduced&&!reduced.matches);
  const duration=()=>mobile?.matches?0.18:0.26;
  function settleView(){viewContext?.revert();viewContext=null;}
  function settleDialog(el){
    const record=dialogs.get(el);if(!record)return;
    record.context.revert();el.removeEventListener('close',record.close);dialogs.delete(el);
  }
  function settle(){settleView();for(const el of [...dialogs.keys()])settleDialog(el);}
  function guard(action){try{return action();}catch(error){settle();console.warn('Animação dispensada; o estado final continua disponível.',error);return null;}}
  function capture(scope,kind){
    settleView();
    if(!enabled()||!flip)return null;
    const selector=kind==='eap'?'.eap-col[data-flip-id], .eap-item[data-flip-id]':kind==='schedule'?'.schedule-chip[data-flip-id]':null;
    if(!selector)return null;
    return guard(()=>({kind,state:flip.getState(scope.querySelectorAll(selector)),selector}));
  }
  function render(scope,info){
    const last=previous;
    previous={screen:info.screen,room:info.room};
    if(!enabled())return;
    const changed=last&&(last.screen!==info.screen||(info.screen==='room'&&last.room!==info.room));
    const change=info.change||{};
    if(!changed&&change.type!=='feedback'&&!change.snapshot)return;
    guard(()=>{
      viewContext=gsap.context(noop,scope);
      viewContext.add(()=>{
        // A choice redraw does not replay the page entrance.
        if(changed){
          const page=scope.querySelector('.screen-enter');
          if(page)gsap.from(page,{y:7,opacity:0.72,duration:duration(),ease:'power1.out',clearProps:'transform,opacity'});
          if(last.screen==='room'&&info.screen==='room'&&last.room!==info.room){
            const bar=scope.querySelector('.progress-line span');
            if(bar)gsap.fromTo(bar,{scaleX:(last.room+1)/(info.room+1),transformOrigin:'left center'},
              {scaleX:1,duration:duration(),ease:'power1.out',clearProps:'transform,transformOrigin'});
          }
        }
        if(change.type==='feedback'){
          const panel=scope.querySelector('#decision-feedback');
          if(panel)gsap.from(panel,{y:7,opacity:0.65,duration:duration(),ease:'power1.out',clearProps:'transform,opacity'});
          if(change.newlyCompleted){
            const check=scope.querySelector(`[data-action="room"][data-room="${info.room}"] .nav-symbol`);
            if(check)gsap.from(check,{scale:0.82,opacity:0.6,duration:duration(),ease:'power1.out',clearProps:'transform,opacity'});
          }
        }
        const snapshot=change.snapshot;
        if(snapshot&&flip){
          const targets=scope.querySelectorAll(snapshot.selector);
          if(targets.length)flip.from(snapshot.state,{
            targets,duration:duration(),ease:'power1.inOut',nested:snapshot.kind==='eap',
            scale:true,prune:true,absolute:false,
            onEnter:elements=>gsap.from(elements,{y:5,opacity:0.6,duration:duration(),ease:'power1.out',clearProps:'transform,opacity'})
          });
        }
      });
    });
  }
  function dialog(el,wasOpen){
    if(!enabled())return;
    guard(()=>{
      const context=gsap.context(noop,el),close=()=>settleDialog(el);
      dialogs.set(el,{context,close});el.addEventListener('close',close,{once:true});
      context.add(()=>{
        // Switching library tabs never slides the entire document or delays controls.
        if(wasOpen){
          // The full guide can be long: animate the selected tab, not its text layer.
          const tab=el.querySelector('.library-tabs .active')||el.querySelector('.dialog-head');
          if(tab)gsap.from(tab,{opacity:0.75,duration:0.14,ease:'power1.out',clearProps:'opacity'});
        }else gsap.from(el,{y:5,opacity:0.75,duration:mobile?.matches?0.14:0.18,ease:'power1.out',clearProps:'transform,opacity'});
      });
    });
  }
  // Resize and preference changes settle at the final layout, without replaying.
  root.addEventListener('resize',settle,{passive:true});
  root.addEventListener('pagehide',settle);
  reduced?.addEventListener('change',settle);
  function destroy(){
    settle();root.removeEventListener('resize',settle);root.removeEventListener('pagehide',settle);
    reduced?.removeEventListener('change',settle);previous=null;disposed=true;
  }
  root.AuroraMotion={beforeRender:settleView,render,capture,beforeDialog:settleDialog,dialog,destroy};
})(globalThis);
