const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('.nav');toggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation')});nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle?.setAttribute('aria-expanded','false')}));
const finder=document.getElementById('finder-submit');
finder?.addEventListener('click',()=>{
 const room=document.getElementById('finder-room').value;
 const goal=document.getElementById('finder-goal').value;
 const title=document.getElementById('finder-title');
 const copy=document.getElementById('finder-copy');
 const link=document.getElementById('finder-link');
 let result;
 if(goal==='dark'){result={name:'Linen-Look Blackout Drapery',text:'A room-darkening drapery option to investigate for bedrooms and media spaces. The retailer describes approximately 80% light blocking, not complete blackout.',href:'products/linen-look-blackout-curtains.html'};}
 else if(goal==='convenience'){result={name:'Motorized Belgian Linen Roman Shade',text:'A motorized Roman-shade format to explore when convenient adjustment matters, including for hard-to-reach windows. Confirm the exact motor and control options.',href:'products/motorized-roman-shade.html'};}
 else{result={name:'Natural Linen Roman Shade',text:'A soft-fold, fabric-led look to explore for a warm, tailored finish. Its retailer listing was marked sold out at the last recorded review, so check availability before planning around it.',href:'products/soft-fold-roman-shade.html'};}
 const roomName={living:'living room',bedroom:'bedroom',kitchen:'kitchen',office:'home office'}[room];
 title.textContent=result.name;copy.textContent=result.text+' Suggested space: '+roomName+'.';link.href=result.href;
});
