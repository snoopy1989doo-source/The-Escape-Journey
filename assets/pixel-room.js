/* Original, code-drawn pixel world. All art shares a 360 x 270 grid.
   Actors use foot anchors, timed routes and a shared depth-sorted draw list. */
class PixelRoom {
  constructor(app) {
    this.app = app;
    this.surface = document.createElement('canvas');
    this.surface.width = 360; this.surface.height = 270;
    this.ctx = this.surface.getContext('2d');
    this.time = 0;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.labels = ['','จดรายจ่าย · ค่อย ๆ ปลดหนี้','อ่านหนังสือ · สะสมเงินสำรอง','วางแผนเทรด · บันทึกผล','ดูแลสวน · ใช้ชีวิตอิสระ'];
  }
  rect(x,y,w,h,c) {
    this.ctx.fillStyle=c;
    this.ctx.fillRect(Math.round(x),Math.round(y),w,h);
  }
  box(x,y,w,h,fill,edge='#382e35') {
    this.rect(x,y,w,h,edge); this.rect(x+2,y+2,w-4,h-4,fill);
    this.rect(x+2,y+2,w-4,1,'#ffffff22');
  }
  text(str,x,y,color='#f8dfac',size=7) {
    this.ctx.fillStyle=color; this.ctx.font=`${size}px monospace`;
    this.ctx.fillText(str,Math.round(x),Math.round(y));
  }
  plant(x,y,large=false) {
    const r=this.rect.bind(this), s=large?2:1;
    r(x-5,y-8,10,9,'#814e43'); r(x-6,y-9,12,3,'#cc8a59');
    r(x-1,y-21*s,2,13*s,'#557145');
    r(x-9*s,y-20*s,9*s,5*s,'#49694b'); r(x+1,y-25*s,8*s,6*s,'#658c50');
    r(x-6*s,y-29*s,6*s,8*s,'#7b9b53'); r(x+2,y-17*s,7*s,4*s,'#91ae60');
  }
  window(x,y,night) {
    this.box(x,y,61,54,'#a77750');
    this.rect(x+5,y+4,51,43,night?'#354d68':'#8acac5');
    this.rect(x+9,y+10,10,2,night?'#d9d7b0':'#e9f0d4');
    this.rect(x+36,y+17,14,3,night?'#b4c6ae':'#f4f0d5');
    for(let i=0;i<7;i++) this.rect(x+5+i*7,y+33-(i%3)*4,7,14+(i%3)*4,night?'#263e4d':'#699c78');
    this.rect(x+28,y+3,3,44,'#795645'); this.rect(x+4,y+25,53,3,'#795645');
    this.rect(x-3,y+49,67,5,'#c59160');
    this.rect(x-3,y-3,67,4,'#553e38');
    this.rect(x-2,y+1,7,42,night?'#726b80':'#ba785c');
    this.rect(x+57,y+1,6,42,night?'#726b80':'#ba785c');
  }
  shelf(x,y,stage) {
    this.box(x,y,41,61,'#79563f');
    for(let row=0;row<3;row++) {
      this.rect(x+4,y+5+row*17,33,13,'#4d3f39');
      for(let col=0;col<6;col++) {
        const h=8+(col*3+row)%5;
        this.rect(x+5+col*5,y+18+row*17-h,4,h,['#b66c56','#ddbf7e','#718b78','#7e839c'][ (col+row)%4]);
        this.rect(x+6+col*5,y+20+row*17-h,2,1,'#e6cea0');
      }
      this.rect(x+3,y+19+row*17,35,2,'#b08454');
    }
    if(stage>1) this.plant(x+21,y-1);
  }
  bed(x,y) {
    this.box(x,y,57,60,'#a47951');
    this.rect(x+4,y+5,49,48,'#eee0b2');
    this.box(x+7,y+8,20,12,'#ffefd2','#c8b891');
    this.rect(x+4,y+24,49,29,this.stage===1?'#7e8990':'#719489');
    for(let i=0;i<5;i++) this.rect(x+5+i*10,y+25,1,26,'#c2d0ae55');
    this.rect(x+4,y+28,49,2,'#b1bbaa');
    this.rect(x,y+53,57,7,'#6b4c40');
    this.rect(x+3,y+60,5,4,'#382e35'); this.rect(x+49,y+60,5,4,'#382e35');
  }
  desk() {
    const r=this.rect.bind(this), x=144,y=137;
    r(x+3,y+20,5,15,'#513e36'); r(x+64,y+20,5,15,'#513e36');
    this.box(x,y,74,24,this.stage===3?'#a77750':'#b18657');
    r(x+3,y+18,68,4,'#79513d'); r(x+31,y+20,12,1,'#d8b075');
    if(this.stage===1) {
      r(151,142,15,10,'#e6d4ad'); r(153,144,10,1,'#a78776'); r(153,147,8,1,'#a78776');
      this.box(198,139,8,10,'#bf7353'); r(198,139,8,2,'#f0d4a1');
      for(let i=0;i<2;i++) r(200+i*3+Math.sin(this.time*2+i),135-(this.time*6+i*5)%10,1,3,'#eee0bd88');
    } else if(this.stage===2) {
      this.box(169,141,24,12,'#f1dba7','#755646'); r(181,143,1,8,'#ba9971');
      for(let i=0;i<3;i++) {r(172,144+i*2,6,1,'#b0906c');r(184,144+i*2,6,1,'#b0906c');}
      this.box(199,141,7,7,'#6e9581');
    } else {
      r(163,141,37,7,'#3b414b');
      for(let i=0;i<9;i++) r(165+i*4,143,2,1,'#94b5a7');
      r(205,142,4,5,'#cad4bf');
    }
  }
  monitor(x,y,w=32) {
    this.box(x,y,w,25,'#233c46','#30313b');
    this.rect(x+w/2-2,y+25,4,4,'#424653'); this.rect(x+w/2-7,y+28,14,2,'#55565e');
    for(let i=0;i<6;i++) {
      const h=3+(i*7)%10;
      this.rect(x+5+i*4,y+19-h,2,h,i%3===0?'#d78b76':'#82bd91');
      this.rect(x+5+i*4,y+16-h,1,h+5,i%3===0?'#d78b76':'#82bd91');
    }
    this.rect(x+4,y+4,w-8,1,'#7ba3a0');
  }
  indoor() {
    const r=this.rect.bind(this), night=this.stage===3;
    r(0,0,360,270,night?'#262d40':'#39313a');
    this.box(12,20,336,234,'#926946');
    r(18,26,324,86,night?'#77788a':this.stage===1?'#b4a181':'#dac69b');
    for(let y=31;y<110;y+=14) for(let x=21;x<339;x+=26) {
      r(x+(y%3)*2,y,14,1,night?'#838496':'#eee0b033');
    }
    r(18,106,324,9,'#694d40'); r(18,106,324,2,'#c09463');
    for(let y=115;y<249;y+=12) {
      r(18,y,324,1,'#60473c'); r(18,y+1,324,1,'#b2855633');
      for(let x=18+(y%24?0:24);x<340;x+=48) {
        r(x,y,1,12,'#71503d'); r(x+8,y+6,17,1,'#c1966044');
      }
    }
    this.box(29,49,35,61,'#825c46'); this.box(34,55,25,47,'#996c4d','#624a40');
    r(53,81,3,3,'#edc580');
    this.window(86,39,night || this.stage===1);
    // A small dream board survives each room upgrade.
    this.box(169,45,59,40,'#96684e'); r(174,50,22,28,'#e4ce9e');
    r(179,62,12,10,'#a77759'); r(181,59,8,3,'#98564d'); r(183,67,4,5,'#5c6462');
    r(201,52,21,14,'#a5b7a1');r(204,58,15,5,'#627987');r(207,55,9,3,'#627987');
    r(204,63,3,2,'#40363c');r(215,63,3,2,'#40363c');
    r(203,72,15,1,'#ecdcb3');r(205,75,11,1,'#ecdcb3');
    this.box(250,42,15,17,'#f2d9a6'); r(257,46,1,7,'#704e43');r(257,52,4,1,'#704e43');
    if(this.stage>1) { this.shelf(285,59,this.stage); this.plant(264,110); }
    else {this.box(292,91,29,23,'#a47d55');r(305,93,3,19,'#d2ac72');}
    if(this.stage===3) {this.monitor(150,91);this.monitor(187,91);}
    if(this.stage===2) {
      this.ctx.fillStyle='#f9dc8430';this.ctx.beginPath();this.ctx.moveTo(90,94);this.ctx.lineTo(142,94);this.ctx.lineTo(196,220);this.ctx.lineTo(114,220);this.ctx.fill();
    }
    this.box(123,174,117,52,this.stage===1?'#9e7562':night?'#777992':'#7e9b88','#634a40');
    this.box(128,179,107,42,this.stage===1?'#ac846d':night?'#898aa0':'#93ae93',this.stage===1?'#c49c78':'#b4c5a0');
    for(let x=137;x<233;x+=12) r(x,197,4,4,'#e0c79688');
    for(let x=130;x<238;x+=5) {r(x,172,2,2,'#cdb088');r(x,226,2,2,'#cdb088');}
    for(let x=133;x<233;x+=9) {r(x,183,3,2,'#dfc7a066');r(x,216,3,2,'#dfc7a066');}
    // Stool and small everyday objects give the room a lived-in scale.
    this.box(172,127,20,15,'#8b6350');r(175,142,3,7,'#60453c');r(187,142,3,7,'#60453c');
    this.box(97,131,18,20,'#a37b54');r(99,147,14,2,'#73503e');r(104,150,4,1,'#e2c08b');
    r(104,118,3,12,'#665442');r(98,114,15,8,'#e4be79');r(101,111,9,3,'#f1d69b');
    this.box(280,181,20,14,'#b17e59');r(282,183,16,2,'#dfb782');r(284,186,2,6,'#855e47');r(293,186,2,6,'#855e47');
    if(this.stage===1) {r(235,94,8,11,'#e5d2aa');r(237,97,4,1,'#af8d71');r(237,100,4,1,'#af8d71');}
    if(this.stage>1) {this.box(235,70,26,20,'#8eaa88','#745542');r(242,76,11,7,'#dec17c');r(245,73,5,4,'#ddc27c');}
    this.box(287,213,35,17,'#aaa184','#665846');r(292,216,25,9,'#797965');
    this.box(44,220,25,9,'#73858a');r(47,222,19,3,'#afd0c2');
    if(this.stage===1) for(let i=0;i<11;i++) {
      const y=45+(this.time*28+i*9)%39;
      if(y<81) r(96+(i*13)%42,y,1,3,'#bacbd488');
    }
    if(this.stage===3) {
      r(151+Math.floor(this.time*2)%23,97,2,2,'#d8ecb1');
      r(242,32,78,3,'#e2b17b');r(247,35,68,2,'#e2b17b33');
    }
  }
  tree(x,y) {
    const r=this.rect.bind(this);r(x-3,y-16,7,22,'#816342');r(x+1,y-12,2,16,'#b48a51');
    r(x-20,y-43,39,25,'#3d6753');r(x-15,y-54,29,39,'#4e8055');
    r(x-9,y-60,18,40,'#6a965c');r(x-15,y-43,11,14,'#7fa25d');
    r(x+5,y-48,10,10,'#8bad62');r(x-10,y-30,7,3,'#9dbb70');
    r(x-18,y-19,36,3,'#365c4b');
  }
  garden() {
    const r=this.rect.bind(this);r(0,0,360,270,'#91c8bd');
    r(0,35,360,235,'#749556');
    for(let i=0;i<160;i++) {
      const x=(i*67)%360,y=42+(i*43)%221;
      r(x,y,3,1,i%2?'#a9b86c':'#5d874f');
    }
    r(30,166,205,28,'#c7b086');r(204,168,30,102,'#c7b086');
    for(let i=0;i<32;i++) r(34+(i*31)%194,170+(i*7)%19,6,2,'#d9c59c');
    for(let i=0;i<15;i++) r(209+(i*7)%19,198+i*5,5,1,'#a78d70');
    // Cottage, porch and accessible front path.
    this.box(37,62,149,99,'#e3c795');
    r(31,48,161,20,'#69474c');r(38,37,147,15,'#a05e51');r(47,27,129,13,'#bc7358');
    for(let y=32;y<65;y+=7) for(let x=42;x<183;x+=16) r(x,y,12,1,'#d89568');
    r(154,23,12,21,'#866457');r(152,20,16,5,'#b49b78');
    this.window(49,79,false);this.box(126,89,30,65,'#8b6750');
    this.box(132,95,18,22,'#9bc4b1');r(146,128,3,3,'#f2da8e');
    r(32,155,159,8,'#846449');r(36,163,151,5,'#b69565');
    this.plant(172,154);this.plant(45,156);
    this.box(252,130,67,36,'#bcb99c');r(249,137,73,20,'#73979c');
    r(266,126,33,13,'#64828c');r(270,128,25,9,'#b7d7c8');
    r(256,160,10,6,'#414650');r(302,160,10,6,'#414650');r(254,144,5,4,'#f2dfa9');
    for(let x=239;x<340;x+=12) {r(x,185,4,18,'#e0cf9b');r(x,183,4,2,'#f0dfaf');}
    r(237,190,106,3,'#bdab7c');
    this.box(39,209,85,37,'#816448');
    for(let row=0;row<3;row++) for(let col=0;col<7;col++) {
      const x=46+col*11,y=216+row*10;
      r(x,y,7,2,'#a5814e');r(x+3,y-4,1,6,'#5f873e');r(x,y-3,7,2,'#91ab59');
      if(row===0) r(x+2,y-5,3,3,'#d9aa5a');
    }
    this.tree(23,91);this.tree(330,104);this.tree(291,81);
    for(let i=0;i<17;i++) {const x=246+(i*19)%93,y=214+(i*13)%43;r(x,y,1,4,'#496c48');r(x-1,y,3,2,i%2?'#e6c888':'#d99aa0');}
    const drift=this.reduced.matches?0:Math.sin(this.time)*2;
    r(278+drift,223,3,2,'#edd6ab');r(283+drift,222,3,2,'#edd6ab');
  }
  reset(stage) {
    const changingStage=this.stage!==undefined;
    this.stage=stage; this.time=0;
    const outside=stage===4;
    // Routes are explicit walkable corridors; work and rest keep the last foot position.
    this.routes={
      melo: outside?[[154,190,7,'relax'],[180,190,0,'walk'],[180,237,0,'walk'],[135,237,8,'water'],[180,237,0,'walk'],[180,190,0,'walk']]:[[182,137,10,'work'],[236,137,0,'walk'],[251,183,5,'pause'],[236,137,0,'walk']],
      kungfu:outside?[[111,187,5,'rest'],[168,187,3,'idle'],[168,204,3,'idle']]:[[85,205,5,'rest'],[112,205,1,'idle'],[112,236,0,'walk'],[254,236,4,'idle'],[112,236,0,'walk'],[112,205,0,'walk']],
      oleang:outside?[[250,230,9,'sleep'],[242,205,4,'idle']]:[[304,225,13,'sleep'],[271,225,4,'idle']]
    };
    this.actors=Object.keys(this.routes).map(name=>({name,x:this.routes[name][0][0],y:this.routes[name][0][1],index:0,wait:this.routes[name][0][2],action:this.routes[name][0][3],facing:1,step:0}));
    if(changingStage) for(const n of Object.values(this.app.npc)) {n.manualAction=null;n.manualTimer=0;}
    this.syncAnchors();
  }
  ensureStage() {
    if(this.stage!==this.app.currentStage || !this.actors) this.reset(this.app.currentStage);
  }
  syncAnchors() {
    for(const a of this.actors) {
      this.app.npc[a.name].x=a.x*2;
      this.app.npc[a.name].y=(a.y-(a.name==='melo'?20:8))*2;
    }
  }
  update(dt) {
    for(const a of this.actors) {
      const npc=this.app.npc[a.name];
      npc.manualTimer=Math.max(0,npc.manualTimer-dt*60);
      if(!npc.manualTimer) npc.manualAction=null;
      if(npc.manualAction) {a.action='happy';continue;}
      const route=this.routes[a.name];
      if(this.reduced.matches) {
        // Freeze in place; a stopped walker is not working at a distant desk.
        a.action=a.wait>0?route[a.index][3]:'idle';continue;
      }
      let remaining=dt;
      // Carry unused frame time across waits and waypoints for the same pace at
      // 30, 60 and 120 Hz. The bound also protects against a malformed route.
      for(let transitions=0;remaining>0 && transitions<route.length*2;transitions++) {
        if(a.wait>0) {
          const elapsed=Math.min(a.wait,remaining);
          a.wait-=elapsed;remaining-=elapsed;a.action=route[a.index][3];
          if(remaining<=0) break;
        }
        const target=route[(a.index+1)%route.length];
        const dx=target[0]-a.x,dy=target[1]-a.y,d=Math.hypot(dx,dy),speed=a.name==='melo'?19:15;
        if(Math.abs(dx)>.1)a.facing=Math.sign(dx);
        const distance=Math.min(d,remaining*speed);
        a.step+=distance;
        if(d<=remaining*speed) {
          a.x=target[0];a.y=target[1];remaining-=d/speed;
          a.index=(a.index+1)%route.length;a.wait=target[2];a.action=target[3];
        } else {
          a.x+=dx/d*distance;a.y+=dy/d*distance;a.action='walk';remaining=0;
        }
      }
    }
  }
  human(a) {
    const r=this.rect.bind(this),walk=a.action==='walk',beat=Math.floor(a.step/3)%4;
    const bob=walk && beat%2?1:0;
    const x=Math.round(a.x),y=Math.round(a.y)-bob;
    r(x-8,y-2,17,3,'#382e3544');
    const leg=walk?(beat<2?2:-2):0;
    r(x-6,y-9,5,8+leg,'#3b4550');r(x+2,y-9,5,8-leg,'#465361');
    r(x-7,y-2+leg,6,3,'#302c35');r(x+2,y-2-leg,7,3,'#302c35');
    this.box(x-9,y-23,19,15,'#343039','#292931');
    r(x-6,y-21,12,2,'#bf704d');r(x-3,y-18,6,2,'#e3ad60');r(x-1,y-16,2,3,'#e3ad60');
    const raised=a.action==='happy', work=a.action==='work';
    r(x-12,y-(raised?30:21),4,raised?9:10,'#c99061');
    r(x+10,y-(raised?30:21),4,raised?9:10,'#e3ad77');
    r(x-8,y-37,17,15,'#c88e62');r(x-6,y-35,13,11,'#ecb983');
    r(x-9,y-40,19,7,'#292b32');r(x-11,y-37,5,9,'#292b32');r(x+7,y-37,5,8,'#292b32');
    for(let i=0;i<5;i++) {r(x-9+i*4,y-42+(i%2),4,4,'#292b32');r(x-7+i*3,y-38,2,2,'#4b4040');}
    const blink=!this.reduced.matches && this.time%5<.12;
    r(x-4,y-30,2,blink?1:2,'#342e33');r(x+4,y-30,2,blink?1:2,'#342e33');
    r(x-2,y-25,6,2,'#78503f');r(x,y-25,2,1,'#e2aa74');
    if(work) {
      const hand=this.reduced.matches?0:Math.floor(this.time*3)%2;
      r(x-10,y-4+hand,5,3,'#e7b17c');r(x+6,y-4-hand,5,3,'#e7b17c');
    }
    if(a.action==='water') {
      this.box(x-20,y-15,9,7,'#8ba5a4');r(x-24,y-12,5,2,'#b6cebd');
      if(!this.reduced.matches) for(let i=0;i<3;i++) r(x-27-i*3,y-9+(this.time*12+i*2)%9,1,2,'#c9e7cb');
    }
    if(a.action==='relax') {this.box(x+10,y-19,5,6,'#e2d5ad');r(x+15,y-18,2,3,'#b5bca0');}
  }
  cat(a) {
    const r=this.rect.bind(this),orange=a.name==='kungfu',fur=orange?'#d89146':'#858379',light=orange?'#f0b95e':'#aaa794',stripe=orange?'#9c5f3b':'#555e5c';
    const x=Math.round(a.x),y=Math.round(a.y),sleep=['sleep','rest'].includes(a.action);
    r(x-12,y-1,25,3,'#382e3544');
    if(sleep) {
      r(x-11,y-8,22,8,fur);r(x-8,y-11,16,9,light);r(x+4,y-9,9,7,fur);
      r(x+5,y-12,3,4,fur);r(x+10,y-11,3,3,fur);r(x+6,y-5,2,1,stripe);r(x+10,y-5,2,1,stripe);
      r(x-7,y-8,2,6,stripe);r(x-2,y-10,2,5,stripe);r(x+5,y-2,7,2,'#e8d9b8');
      this.text('z',x+15,y-14-(this.reduced.matches?0:Math.floor(this.time%3)*2),'#eee0b7');
    } else {
      const step=a.action==='walk'?(Math.floor(a.step/3)%2)*2:0;
      this.ctx.save();this.ctx.translate(x,y);this.ctx.scale(a.facing,1);
      r(-9,-10,18,8,fur);r(-7,-12,14,6,light);
      r(-8,-3,3,3-step,fur);r(3,-3-step,3,3+step,fur);
      r(-8,-1-step,4,2,'#f2dfbb');r(4,-1,4,2,'#f2dfbb');
      r(3,-18,12,11,light);r(3,-21,4,5,fur);r(12,-21,3,5,fur);
      r(4,-20,2,2,'#dca593');r(12,-20,2,2,'#dca593');
      r(6,-14,2,2,'#38433b');r(12,-14,2,2,'#38433b');r(9,-11,2,1,'#bb7f6f');
      r(7,-9,6,2,'#f4e2bf');r(-5,-11,2,6,stripe);r(0,-11,2,5,stripe);r(8,-18,2,3,stripe);
      const tail=this.reduced.matches?0:Math.round(Math.sin(this.time*3));
      r(-13,-14+tail,4,9,fur);r(-15,-17+tail,4,4,light);r(-15,-17+tail,3,2,'#eeddbb');
      this.ctx.restore();
    }
    if(a.action==='happy') this.text('♥',x-3,y-27,'#e6a0a0',10);
  }
  render(dt) {
    this.ensureStage();
    dt=Number.isFinite(dt)?Math.max(0,Math.min(dt,.05)):0;
    this.time+=this.reduced.matches?0:dt;this.update(dt);
    if(this.stage===4) this.garden();else this.indoor();
    const drawables=this.actors.map(a=>({y:a.y,draw:()=>a.name==='melo'?this.human(a):this.cat(a)}));
    if(this.stage!==4) {
      drawables.push({y:158,draw:()=>this.desk()},{y:188,draw:()=>this.bed(32,122)});
      if(this.stage>1)drawables.push({y:197,draw:()=>this.plant(317,197,true)});
    }
    drawables.sort((a,b)=>a.y-b.y).forEach(item=>item.draw());
    this.syncAnchors();
    const ctx=this.app.ctx;
    ctx.imageSmoothingEnabled=false;ctx.drawImage(this.surface,0,0,720,540);
    const status=document.getElementById('roomActivity');
    const me=this.actors[0];
    const activity={walk:'เดินพักสายตา',water:'รดน้ำแปลงผัก',relax:'จิบกาแฟหน้าบ้าน',happy:'ส่งกำลังใจให้คุณ',pause:'พักสายตา'};
    const label=activity[me.action] || this.labels[this.stage];
    if(status && status.textContent!==label) status.textContent=label;
  }
  interact(x,y) {
    // A tap may arrive before requestAnimationFrame, including after a stage
    // button. Resolve the current scene before hit testing or spawning hearts.
    this.ensureStage();
    for(const a of [...this.actors].sort((a,b)=>b.y-a.y)) {
      if(Math.abs(x/2-a.x)<=16 && y/2>=a.y-(a.name==='melo'?44:25) && y/2<=a.y+5) {
        if(a.name==='melo')this.app.interactMelo();else if(a.name==='kungfu')this.app.petKungfu();else this.app.petOleang();
        return;
      }
    }
    const px=x/2,py=y/2;
    const hotspots=this.stage===4?[
      [37,27,149,141,'บ้านในฝัน — รางวัลของวินัยและความพร้อมทางการเงิน'],
      [249,126,73,40,'รถคันแรก — เป้าหมายที่สร้างจากเงินออมและกระแสเงินสด'],
      [39,209,110,37,'สวนเล็ก ๆ — มีเวลาดูแลชีวิตในแบบที่เลือกเอง']
    ]:[
      [169,45,59,40,'เป้าหมายบ้านและรถ — ค่อย ๆ สร้างทีละก้าว'],
      [144,91,74,70,this.labels[this.stage]],
      ...(this.stage>1?[[285,59,41,61,'คลังความรู้ — อ่าน วางแผน และบันทึกอย่างสม่ำเสมอ']]:[])
    ];
    for(const [hx,hy,w,h,label] of hotspots) if(px>=hx&&px<=hx+w&&py>=hy&&py<=hy+h) {
      this.app.sound.playBlip();this.app.showSpeechBubble(label);return;
    }
    this.app.showSpeechBubble(this.labels[this.stage]+' — แตะต๋องหรือแมวทั้งสองเพื่อทักทาย');
  }
}
window.PixelRoom = PixelRoom;
