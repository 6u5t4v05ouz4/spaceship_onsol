import{n as T,a as pt}from"./main-b9f2b2fa.js";async function pe(n,t,e=null){var s,i,r,o;try{console.log("🔍 Verificando inicialização do usuário:",t);const{data:a,error:c}=await n.from("user_profiles").select("id").eq("google_email",t).maybeSingle();if(c)throw console.error("❌ Erro ao verificar perfil:",c),new Error("Failed to check user profile: "+c.message);if(a)return console.log("✅ Usuário já inicializado. Profile ID:",a.id),{success:!0,message:"User already initialized",profile_id:a.id};console.log("⚠️ Perfil não encontrado. Inicializando dados do usuário...");const h=((s=e==null?void 0:e.user_metadata)==null?void 0:s.name)||((i=e==null?void 0:e.user_metadata)==null?void 0:i.full_name)||t.split("@")[0],d=((r=e==null?void 0:e.user_metadata)==null?void 0:r.picture)||((o=e==null?void 0:e.user_metadata)==null?void 0:o.avatar_url)||null,f=(e==null?void 0:e.id)||null,{data:y,error:S}=await n.rpc("initialize_user_data",{p_google_email:t,p_display_name:h,p_avatar_url:d,p_auth_user_id:f});if(S)throw console.error("❌ Erro ao inicializar dados do usuário:",S),new Error("Failed to initialize user data: "+S.message);if(!y||y.length===0)throw console.error("❌ Nenhum resultado retornado da inicialização"),new Error("No result returned from initialization");const m=y[0];if(!m.success)throw console.error("❌ Falha na inicialização:",m.message),new Error("Initialization failed: "+m.message);return console.log("✅ Dados do usuário inicializados com sucesso!"),console.log("📊 IDs criados:",{profile_id:m.profile_id,settings_id:m.settings_id,stats_id:m.stats_id,wallet_id:m.wallet_id}),{success:!0,message:m.message,profile_id:m.profile_id,settings_id:m.settings_id,stats_id:m.stats_id,wallet_id:m.wallet_id}}catch(a){throw console.error("❌ Erro em ensureUserInitialized:",a),a}}const w=Object.create(null);w.open="0";w.close="1";w.ping="2";w.pong="3";w.message="4";w.upgrade="5";w.noop="6";const L=Object.create(null);Object.keys(w).forEach(n=>{L[w[n]]=n});const M={type:"error",data:"parser error"},tt=typeof Blob=="function"||typeof Blob<"u"&&Object.prototype.toString.call(Blob)==="[object BlobConstructor]",et=typeof ArrayBuffer=="function",st=n=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(n):n&&n.buffer instanceof ArrayBuffer,$=({type:n,data:t},e,s)=>tt&&t instanceof Blob?e?s(t):W(t,s):et&&(t instanceof ArrayBuffer||st(t))?e?s(t):W(new Blob([t]),s):s(w[n]+(t||"")),W=(n,t)=>{const e=new FileReader;return e.onload=function(){const s=e.result.split(",")[1];t("b"+(s||""))},e.readAsDataURL(n)};function J(n){return n instanceof Uint8Array?n:n instanceof ArrayBuffer?new Uint8Array(n):new Uint8Array(n.buffer,n.byteOffset,n.byteLength)}let I;function ft(n,t){if(tt&&n.data instanceof Blob)return n.data.arrayBuffer().then(J).then(t);if(et&&(n.data instanceof ArrayBuffer||st(n.data)))return t(J(n.data));$(n,!1,e=>{I||(I=new TextEncoder),t(I.encode(e))})}const j="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",E=typeof Uint8Array>"u"?[]:new Uint8Array(256);for(let n=0;n<j.length;n++)E[j.charCodeAt(n)]=n;const mt=n=>{let t=n.length*.75,e=n.length,s,i=0,r,o,a,c;n[n.length-1]==="="&&(t--,n[n.length-2]==="="&&t--);const h=new ArrayBuffer(t),d=new Uint8Array(h);for(s=0;s<e;s+=4)r=E[n.charCodeAt(s)],o=E[n.charCodeAt(s+1)],a=E[n.charCodeAt(s+2)],c=E[n.charCodeAt(s+3)],d[i++]=r<<2|o>>4,d[i++]=(o&15)<<4|a>>2,d[i++]=(a&3)<<6|c&63;return h},gt=typeof ArrayBuffer=="function",V=(n,t)=>{if(typeof n!="string")return{type:"message",data:nt(n,t)};const e=n.charAt(0);return e==="b"?{type:"message",data:yt(n.substring(1),t)}:L[e]?n.length>1?{type:L[e],data:n.substring(1)}:{type:L[e]}:M},yt=(n,t)=>{if(gt){const e=mt(n);return nt(e,t)}else return{base64:!0,data:n}},nt=(n,t)=>{switch(t){case"blob":return n instanceof Blob?n:new Blob([n]);case"arraybuffer":default:return n instanceof ArrayBuffer?n:n.buffer}},it=String.fromCharCode(30),vt=(n,t)=>{const e=n.length,s=new Array(e);let i=0;n.forEach((r,o)=>{$(r,!1,a=>{s[o]=a,++i===e&&t(s.join(it))})})},bt=(n,t)=>{const e=n.split(it),s=[];for(let i=0;i<e.length;i++){const r=V(e[i],t);if(s.push(r),r.type==="error")break}return s};function wt(){return new TransformStream({transform(n,t){ft(n,e=>{const s=e.length;let i;if(s<126)i=new Uint8Array(1),new DataView(i.buffer).setUint8(0,s);else if(s<65536){i=new Uint8Array(3);const r=new DataView(i.buffer);r.setUint8(0,126),r.setUint16(1,s)}else{i=new Uint8Array(9);const r=new DataView(i.buffer);r.setUint8(0,127),r.setBigUint64(1,BigInt(s))}n.data&&typeof n.data!="string"&&(i[0]|=128),t.enqueue(i),t.enqueue(e)})}})}let D;function A(n){return n.reduce((t,e)=>t+e.length,0)}function C(n,t){if(n[0].length===t)return n.shift();const e=new Uint8Array(t);let s=0;for(let i=0;i<t;i++)e[i]=n[0][s++],s===n[0].length&&(n.shift(),s=0);return n.length&&s<n[0].length&&(n[0]=n[0].slice(s)),e}function kt(n,t){D||(D=new TextDecoder);const e=[];let s=0,i=-1,r=!1;return new TransformStream({transform(o,a){for(e.push(o);;){if(s===0){if(A(e)<1)break;const c=C(e,1);r=(c[0]&128)===128,i=c[0]&127,i<126?s=3:i===126?s=1:s=2}else if(s===1){if(A(e)<2)break;const c=C(e,2);i=new DataView(c.buffer,c.byteOffset,c.length).getUint16(0),s=3}else if(s===2){if(A(e)<8)break;const c=C(e,8),h=new DataView(c.buffer,c.byteOffset,c.length),d=h.getUint32(0);if(d>Math.pow(2,53-32)-1){a.enqueue(M);break}i=d*Math.pow(2,32)+h.getUint32(4),s=3}else{if(A(e)<i)break;const c=C(e,i);a.enqueue(V(r?c:D.decode(c),t)),s=0}if(i===0||i>n){a.enqueue(M);break}}}})}const rt=4;function u(n){if(n)return _t(n)}function _t(n){for(var t in u.prototype)n[t]=u.prototype[t];return n}u.prototype.on=u.prototype.addEventListener=function(n,t){return this._callbacks=this._callbacks||{},(this._callbacks["$"+n]=this._callbacks["$"+n]||[]).push(t),this};u.prototype.once=function(n,t){function e(){this.off(n,e),t.apply(this,arguments)}return e.fn=t,this.on(n,e),this};u.prototype.off=u.prototype.removeListener=u.prototype.removeAllListeners=u.prototype.removeEventListener=function(n,t){if(this._callbacks=this._callbacks||{},arguments.length==0)return this._callbacks={},this;var e=this._callbacks["$"+n];if(!e)return this;if(arguments.length==1)return delete this._callbacks["$"+n],this;for(var s,i=0;i<e.length;i++)if(s=e[i],s===t||s.fn===t){e.splice(i,1);break}return e.length===0&&delete this._callbacks["$"+n],this};u.prototype.emit=function(n){this._callbacks=this._callbacks||{};for(var t=new Array(arguments.length-1),e=this._callbacks["$"+n],s=1;s<arguments.length;s++)t[s-1]=arguments[s];if(e){e=e.slice(0);for(var s=0,i=e.length;s<i;++s)e[s].apply(this,t)}return this};u.prototype.emitReserved=u.prototype.emit;u.prototype.listeners=function(n){return this._callbacks=this._callbacks||{},this._callbacks["$"+n]||[]};u.prototype.hasListeners=function(n){return!!this.listeners(n).length};const O=(()=>typeof Promise=="function"&&typeof Promise.resolve=="function"?t=>Promise.resolve().then(t):(t,e)=>e(t,0))(),g=(()=>typeof self<"u"?self:typeof window<"u"?window:Function("return this")())(),St="arraybuffer";function ot(n,...t){return t.reduce((e,s)=>(n.hasOwnProperty(s)&&(e[s]=n[s]),e),{})}const xt=g.setTimeout,Et=g.clearTimeout;function P(n,t){t.useNativeTimers?(n.setTimeoutFn=xt.bind(g),n.clearTimeoutFn=Et.bind(g)):(n.setTimeoutFn=g.setTimeout.bind(g),n.clearTimeoutFn=g.clearTimeout.bind(g))}const Tt=1.33;function At(n){return typeof n=="string"?Ct(n):Math.ceil((n.byteLength||n.size)*Tt)}function Ct(n){let t=0,e=0;for(let s=0,i=n.length;s<i;s++)t=n.charCodeAt(s),t<128?e+=1:t<2048?e+=2:t<55296||t>=57344?e+=3:(s++,e+=4);return e}function at(){return Date.now().toString(36).substring(3)+Math.random().toString(36).substring(2,5)}function Lt(n){let t="";for(let e in n)n.hasOwnProperty(e)&&(t.length&&(t+="&"),t+=encodeURIComponent(e)+"="+encodeURIComponent(n[e]));return t}function Bt(n){let t={},e=n.split("&");for(let s=0,i=e.length;s<i;s++){let r=e[s].split("=");t[decodeURIComponent(r[0])]=decodeURIComponent(r[1])}return t}class Rt extends Error{constructor(t,e,s){super(t),this.description=e,this.context=s,this.type="TransportError"}}class X extends u{constructor(t){super(),this.writable=!1,P(this,t),this.opts=t,this.query=t.query,this.socket=t.socket,this.supportsBinary=!t.forceBase64}onError(t,e,s){return super.emitReserved("error",new Rt(t,e,s)),this}open(){return this.readyState="opening",this.doOpen(),this}close(){return(this.readyState==="opening"||this.readyState==="open")&&(this.doClose(),this.onClose()),this}send(t){this.readyState==="open"&&this.write(t)}onOpen(){this.readyState="open",this.writable=!0,super.emitReserved("open")}onData(t){const e=V(t,this.socket.binaryType);this.onPacket(e)}onPacket(t){super.emitReserved("packet",t)}onClose(t){this.readyState="closed",super.emitReserved("close",t)}pause(t){}createUri(t,e={}){return t+"://"+this._hostname()+this._port()+this.opts.path+this._query(e)}_hostname(){const t=this.opts.hostname;return t.indexOf(":")===-1?t:"["+t+"]"}_port(){return this.opts.port&&(this.opts.secure&&+(this.opts.port!==443)||!this.opts.secure&&Number(this.opts.port)!==80)?":"+this.opts.port:""}_query(t){const e=Lt(t);return e.length?"?"+e:""}}class Nt extends X{constructor(){super(...arguments),this._polling=!1}get name(){return"polling"}doOpen(){this._poll()}pause(t){this.readyState="pausing";const e=()=>{this.readyState="paused",t()};if(this._polling||!this.writable){let s=0;this._polling&&(s++,this.once("pollComplete",function(){--s||e()})),this.writable||(s++,this.once("drain",function(){--s||e()}))}else e()}_poll(){this._polling=!0,this.doPoll(),this.emitReserved("poll")}onData(t){const e=s=>{if(this.readyState==="opening"&&s.type==="open"&&this.onOpen(),s.type==="close")return this.onClose({description:"transport closed by the server"}),!1;this.onPacket(s)};bt(t,this.socket.binaryType).forEach(e),this.readyState!=="closed"&&(this._polling=!1,this.emitReserved("pollComplete"),this.readyState==="open"&&this._poll())}doClose(){const t=()=>{this.write([{type:"close"}])};this.readyState==="open"?t():this.once("open",t)}write(t){this.writable=!1,vt(t,e=>{this.doWrite(e,()=>{this.writable=!0,this.emitReserved("drain")})})}uri(){const t=this.opts.secure?"https":"http",e=this.query||{};return this.opts.timestampRequests!==!1&&(e[this.opts.timestampParam]=at()),!this.supportsBinary&&!e.sid&&(e.b64=1),this.createUri(t,e)}}let ct=!1;try{ct=typeof XMLHttpRequest<"u"&&"withCredentials"in new XMLHttpRequest}catch{}const Ot=ct;function Pt(){}class It extends Nt{constructor(t){if(super(t),typeof location<"u"){const e=location.protocol==="https:";let s=location.port;s||(s=e?"443":"80"),this.xd=typeof location<"u"&&t.hostname!==location.hostname||s!==t.port}}doWrite(t,e){const s=this.request({method:"POST",data:t});s.on("success",e),s.on("error",(i,r)=>{this.onError("xhr post error",i,r)})}doPoll(){const t=this.request();t.on("data",this.onData.bind(this)),t.on("error",(e,s)=>{this.onError("xhr poll error",e,s)}),this.pollXhr=t}}class b extends u{constructor(t,e,s){super(),this.createRequest=t,P(this,s),this._opts=s,this._method=s.method||"GET",this._uri=e,this._data=s.data!==void 0?s.data:null,this._create()}_create(){var t;const e=ot(this._opts,"agent","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","autoUnref");e.xdomain=!!this._opts.xd;const s=this._xhr=this.createRequest(e);try{s.open(this._method,this._uri,!0);try{if(this._opts.extraHeaders){s.setDisableHeaderCheck&&s.setDisableHeaderCheck(!0);for(let i in this._opts.extraHeaders)this._opts.extraHeaders.hasOwnProperty(i)&&s.setRequestHeader(i,this._opts.extraHeaders[i])}}catch{}if(this._method==="POST")try{s.setRequestHeader("Content-type","text/plain;charset=UTF-8")}catch{}try{s.setRequestHeader("Accept","*/*")}catch{}(t=this._opts.cookieJar)===null||t===void 0||t.addCookies(s),"withCredentials"in s&&(s.withCredentials=this._opts.withCredentials),this._opts.requestTimeout&&(s.timeout=this._opts.requestTimeout),s.onreadystatechange=()=>{var i;s.readyState===3&&((i=this._opts.cookieJar)===null||i===void 0||i.parseCookies(s.getResponseHeader("set-cookie"))),s.readyState===4&&(s.status===200||s.status===1223?this._onLoad():this.setTimeoutFn(()=>{this._onError(typeof s.status=="number"?s.status:0)},0))},s.send(this._data)}catch(i){this.setTimeoutFn(()=>{this._onError(i)},0);return}typeof document<"u"&&(this._index=b.requestsCount++,b.requests[this._index]=this)}_onError(t){this.emitReserved("error",t,this._xhr),this._cleanup(!0)}_cleanup(t){if(!(typeof this._xhr>"u"||this._xhr===null)){if(this._xhr.onreadystatechange=Pt,t)try{this._xhr.abort()}catch{}typeof document<"u"&&delete b.requests[this._index],this._xhr=null}}_onLoad(){const t=this._xhr.responseText;t!==null&&(this.emitReserved("data",t),this.emitReserved("success"),this._cleanup())}abort(){this._cleanup()}}b.requestsCount=0;b.requests={};if(typeof document<"u"){if(typeof attachEvent=="function")attachEvent("onunload",Z);else if(typeof addEventListener=="function"){const n="onpagehide"in g?"pagehide":"unload";addEventListener(n,Z,!1)}}function Z(){for(let n in b.requests)b.requests.hasOwnProperty(n)&&b.requests[n].abort()}const Dt=function(){const n=lt({xdomain:!1});return n&&n.responseType!==null}();class qt extends It{constructor(t){super(t);const e=t&&t.forceBase64;this.supportsBinary=Dt&&!e}request(t={}){return Object.assign(t,{xd:this.xd},this.opts),new b(lt,this.uri(),t)}}function lt(n){const t=n.xdomain;try{if(typeof XMLHttpRequest<"u"&&(!t||Ot))return new XMLHttpRequest}catch{}if(!t)try{return new g[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP")}catch{}}const ht=typeof navigator<"u"&&typeof navigator.product=="string"&&navigator.product.toLowerCase()==="reactnative";class Mt extends X{get name(){return"websocket"}doOpen(){const t=this.uri(),e=this.opts.protocols,s=ht?{}:ot(this.opts,"agent","perMessageDeflate","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","localAddress","protocolVersion","origin","maxPayload","family","checkServerIdentity");this.opts.extraHeaders&&(s.headers=this.opts.extraHeaders);try{this.ws=this.createSocket(t,e,s)}catch(i){return this.emitReserved("error",i)}this.ws.binaryType=this.socket.binaryType,this.addEventListeners()}addEventListeners(){this.ws.onopen=()=>{this.opts.autoUnref&&this.ws._socket.unref(),this.onOpen()},this.ws.onclose=t=>this.onClose({description:"websocket connection closed",context:t}),this.ws.onmessage=t=>this.onData(t.data),this.ws.onerror=t=>this.onError("websocket error",t)}write(t){this.writable=!1;for(let e=0;e<t.length;e++){const s=t[e],i=e===t.length-1;$(s,this.supportsBinary,r=>{try{this.doWrite(s,r)}catch{}i&&O(()=>{this.writable=!0,this.emitReserved("drain")},this.setTimeoutFn)})}}doClose(){typeof this.ws<"u"&&(this.ws.onerror=()=>{},this.ws.close(),this.ws=null)}uri(){const t=this.opts.secure?"wss":"ws",e=this.query||{};return this.opts.timestampRequests&&(e[this.opts.timestampParam]=at()),this.supportsBinary||(e.b64=1),this.createUri(t,e)}}const q=g.WebSocket||g.MozWebSocket;class Ut extends Mt{createSocket(t,e,s){return ht?new q(t,e,s):e?new q(t,e):new q(t)}doWrite(t,e){this.ws.send(e)}}class zt extends X{get name(){return"webtransport"}doOpen(){try{this._transport=new WebTransport(this.createUri("https"),this.opts.transportOptions[this.name])}catch(t){return this.emitReserved("error",t)}this._transport.closed.then(()=>{this.onClose()}).catch(t=>{this.onError("webtransport error",t)}),this._transport.ready.then(()=>{this._transport.createBidirectionalStream().then(t=>{const e=kt(Number.MAX_SAFE_INTEGER,this.socket.binaryType),s=t.readable.pipeThrough(e).getReader(),i=wt();i.readable.pipeTo(t.writable),this._writer=i.writable.getWriter();const r=()=>{s.read().then(({done:a,value:c})=>{a||(this.onPacket(c),r())}).catch(a=>{})};r();const o={type:"open"};this.query.sid&&(o.data=`{"sid":"${this.query.sid}"}`),this._writer.write(o).then(()=>this.onOpen())})})}write(t){this.writable=!1;for(let e=0;e<t.length;e++){const s=t[e],i=e===t.length-1;this._writer.write(s).then(()=>{i&&O(()=>{this.writable=!0,this.emitReserved("drain")},this.setTimeoutFn)})}}doClose(){var t;(t=this._transport)===null||t===void 0||t.close()}}const Ht={websocket:Ut,webtransport:zt,polling:qt},Ft=/^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,Yt=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];function U(n){if(n.length>8e3)throw"URI too long";const t=n,e=n.indexOf("["),s=n.indexOf("]");e!=-1&&s!=-1&&(n=n.substring(0,e)+n.substring(e,s).replace(/:/g,";")+n.substring(s,n.length));let i=Ft.exec(n||""),r={},o=14;for(;o--;)r[Yt[o]]=i[o]||"";return e!=-1&&s!=-1&&(r.source=t,r.host=r.host.substring(1,r.host.length-1).replace(/;/g,":"),r.authority=r.authority.replace("[","").replace("]","").replace(/;/g,":"),r.ipv6uri=!0),r.pathNames=$t(r,r.path),r.queryKey=Vt(r,r.query),r}function $t(n,t){const e=/\/{2,9}/g,s=t.replace(e,"/").split("/");return(t.slice(0,1)=="/"||t.length===0)&&s.splice(0,1),t.slice(-1)=="/"&&s.splice(s.length-1,1),s}function Vt(n,t){const e={};return t.replace(/(?:^|&)([^&=]*)=?([^&]*)/g,function(s,i,r){i&&(e[i]=r)}),e}const z=typeof addEventListener=="function"&&typeof removeEventListener=="function",B=[];z&&addEventListener("offline",()=>{B.forEach(n=>n())},!1);class k extends u{constructor(t,e){if(super(),this.binaryType=St,this.writeBuffer=[],this._prevBufferLen=0,this._pingInterval=-1,this._pingTimeout=-1,this._maxPayload=-1,this._pingTimeoutTime=1/0,t&&typeof t=="object"&&(e=t,t=null),t){const s=U(t);e.hostname=s.host,e.secure=s.protocol==="https"||s.protocol==="wss",e.port=s.port,s.query&&(e.query=s.query)}else e.host&&(e.hostname=U(e.host).host);P(this,e),this.secure=e.secure!=null?e.secure:typeof location<"u"&&location.protocol==="https:",e.hostname&&!e.port&&(e.port=this.secure?"443":"80"),this.hostname=e.hostname||(typeof location<"u"?location.hostname:"localhost"),this.port=e.port||(typeof location<"u"&&location.port?location.port:this.secure?"443":"80"),this.transports=[],this._transportsByName={},e.transports.forEach(s=>{const i=s.prototype.name;this.transports.push(i),this._transportsByName[i]=s}),this.opts=Object.assign({path:"/engine.io",agent:!1,withCredentials:!1,upgrade:!0,timestampParam:"t",rememberUpgrade:!1,addTrailingSlash:!0,rejectUnauthorized:!0,perMessageDeflate:{threshold:1024},transportOptions:{},closeOnBeforeunload:!1},e),this.opts.path=this.opts.path.replace(/\/$/,"")+(this.opts.addTrailingSlash?"/":""),typeof this.opts.query=="string"&&(this.opts.query=Bt(this.opts.query)),z&&(this.opts.closeOnBeforeunload&&(this._beforeunloadEventListener=()=>{this.transport&&(this.transport.removeAllListeners(),this.transport.close())},addEventListener("beforeunload",this._beforeunloadEventListener,!1)),this.hostname!=="localhost"&&(this._offlineEventListener=()=>{this._onClose("transport close",{description:"network connection lost"})},B.push(this._offlineEventListener))),this.opts.withCredentials&&(this._cookieJar=void 0),this._open()}createTransport(t){const e=Object.assign({},this.opts.query);e.EIO=rt,e.transport=t,this.id&&(e.sid=this.id);const s=Object.assign({},this.opts,{query:e,socket:this,hostname:this.hostname,secure:this.secure,port:this.port},this.opts.transportOptions[t]);return new this._transportsByName[t](s)}_open(){if(this.transports.length===0){this.setTimeoutFn(()=>{this.emitReserved("error","No transports available")},0);return}const t=this.opts.rememberUpgrade&&k.priorWebsocketSuccess&&this.transports.indexOf("websocket")!==-1?"websocket":this.transports[0];this.readyState="opening";const e=this.createTransport(t);e.open(),this.setTransport(e)}setTransport(t){this.transport&&this.transport.removeAllListeners(),this.transport=t,t.on("drain",this._onDrain.bind(this)).on("packet",this._onPacket.bind(this)).on("error",this._onError.bind(this)).on("close",e=>this._onClose("transport close",e))}onOpen(){this.readyState="open",k.priorWebsocketSuccess=this.transport.name==="websocket",this.emitReserved("open"),this.flush()}_onPacket(t){if(this.readyState==="opening"||this.readyState==="open"||this.readyState==="closing")switch(this.emitReserved("packet",t),this.emitReserved("heartbeat"),t.type){case"open":this.onHandshake(JSON.parse(t.data));break;case"ping":this._sendPacket("pong"),this.emitReserved("ping"),this.emitReserved("pong"),this._resetPingTimeout();break;case"error":const e=new Error("server error");e.code=t.data,this._onError(e);break;case"message":this.emitReserved("data",t.data),this.emitReserved("message",t.data);break}}onHandshake(t){this.emitReserved("handshake",t),this.id=t.sid,this.transport.query.sid=t.sid,this._pingInterval=t.pingInterval,this._pingTimeout=t.pingTimeout,this._maxPayload=t.maxPayload,this.onOpen(),this.readyState!=="closed"&&this._resetPingTimeout()}_resetPingTimeout(){this.clearTimeoutFn(this._pingTimeoutTimer);const t=this._pingInterval+this._pingTimeout;this._pingTimeoutTime=Date.now()+t,this._pingTimeoutTimer=this.setTimeoutFn(()=>{this._onClose("ping timeout")},t),this.opts.autoUnref&&this._pingTimeoutTimer.unref()}_onDrain(){this.writeBuffer.splice(0,this._prevBufferLen),this._prevBufferLen=0,this.writeBuffer.length===0?this.emitReserved("drain"):this.flush()}flush(){if(this.readyState!=="closed"&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length){const t=this._getWritablePackets();this.transport.send(t),this._prevBufferLen=t.length,this.emitReserved("flush")}}_getWritablePackets(){if(!(this._maxPayload&&this.transport.name==="polling"&&this.writeBuffer.length>1))return this.writeBuffer;let e=1;for(let s=0;s<this.writeBuffer.length;s++){const i=this.writeBuffer[s].data;if(i&&(e+=At(i)),s>0&&e>this._maxPayload)return this.writeBuffer.slice(0,s);e+=2}return this.writeBuffer}_hasPingExpired(){if(!this._pingTimeoutTime)return!0;const t=Date.now()>this._pingTimeoutTime;return t&&(this._pingTimeoutTime=0,O(()=>{this._onClose("ping timeout")},this.setTimeoutFn)),t}write(t,e,s){return this._sendPacket("message",t,e,s),this}send(t,e,s){return this._sendPacket("message",t,e,s),this}_sendPacket(t,e,s,i){if(typeof e=="function"&&(i=e,e=void 0),typeof s=="function"&&(i=s,s=null),this.readyState==="closing"||this.readyState==="closed")return;s=s||{},s.compress=s.compress!==!1;const r={type:t,data:e,options:s};this.emitReserved("packetCreate",r),this.writeBuffer.push(r),i&&this.once("flush",i),this.flush()}close(){const t=()=>{this._onClose("forced close"),this.transport.close()},e=()=>{this.off("upgrade",e),this.off("upgradeError",e),t()},s=()=>{this.once("upgrade",e),this.once("upgradeError",e)};return(this.readyState==="opening"||this.readyState==="open")&&(this.readyState="closing",this.writeBuffer.length?this.once("drain",()=>{this.upgrading?s():t()}):this.upgrading?s():t()),this}_onError(t){if(k.priorWebsocketSuccess=!1,this.opts.tryAllTransports&&this.transports.length>1&&this.readyState==="opening")return this.transports.shift(),this._open();this.emitReserved("error",t),this._onClose("transport error",t)}_onClose(t,e){if(this.readyState==="opening"||this.readyState==="open"||this.readyState==="closing"){if(this.clearTimeoutFn(this._pingTimeoutTimer),this.transport.removeAllListeners("close"),this.transport.close(),this.transport.removeAllListeners(),z&&(this._beforeunloadEventListener&&removeEventListener("beforeunload",this._beforeunloadEventListener,!1),this._offlineEventListener)){const s=B.indexOf(this._offlineEventListener);s!==-1&&B.splice(s,1)}this.readyState="closed",this.id=null,this.emitReserved("close",t,e),this.writeBuffer=[],this._prevBufferLen=0}}}k.protocol=rt;class Xt extends k{constructor(){super(...arguments),this._upgrades=[]}onOpen(){if(super.onOpen(),this.readyState==="open"&&this.opts.upgrade)for(let t=0;t<this._upgrades.length;t++)this._probe(this._upgrades[t])}_probe(t){let e=this.createTransport(t),s=!1;k.priorWebsocketSuccess=!1;const i=()=>{s||(e.send([{type:"ping",data:"probe"}]),e.once("packet",f=>{if(!s)if(f.type==="pong"&&f.data==="probe"){if(this.upgrading=!0,this.emitReserved("upgrading",e),!e)return;k.priorWebsocketSuccess=e.name==="websocket",this.transport.pause(()=>{s||this.readyState!=="closed"&&(d(),this.setTransport(e),e.send([{type:"upgrade"}]),this.emitReserved("upgrade",e),e=null,this.upgrading=!1,this.flush())})}else{const y=new Error("probe error");y.transport=e.name,this.emitReserved("upgradeError",y)}}))};function r(){s||(s=!0,d(),e.close(),e=null)}const o=f=>{const y=new Error("probe error: "+f);y.transport=e.name,r(),this.emitReserved("upgradeError",y)};function a(){o("transport closed")}function c(){o("socket closed")}function h(f){e&&f.name!==e.name&&r()}const d=()=>{e.removeListener("open",i),e.removeListener("error",o),e.removeListener("close",a),this.off("close",c),this.off("upgrading",h)};e.once("open",i),e.once("error",o),e.once("close",a),this.once("close",c),this.once("upgrading",h),this._upgrades.indexOf("webtransport")!==-1&&t!=="webtransport"?this.setTimeoutFn(()=>{s||e.open()},200):e.open()}onHandshake(t){this._upgrades=this._filterUpgrades(t.upgrades),super.onHandshake(t)}_filterUpgrades(t){const e=[];for(let s=0;s<t.length;s++)~this.transports.indexOf(t[s])&&e.push(t[s]);return e}}let Qt=class extends Xt{constructor(t,e={}){const s=typeof t=="object"?t:e;(!s.transports||s.transports&&typeof s.transports[0]=="string")&&(s.transports=(s.transports||["polling","websocket","webtransport"]).map(i=>Ht[i]).filter(i=>!!i)),super(t,s)}};function Kt(n,t="",e){let s=n;e=e||typeof location<"u"&&location,n==null&&(n=e.protocol+"//"+e.host),typeof n=="string"&&(n.charAt(0)==="/"&&(n.charAt(1)==="/"?n=e.protocol+n:n=e.host+n),/^(https?|wss?):\/\//.test(n)||(typeof e<"u"?n=e.protocol+"//"+n:n="https://"+n),s=U(n)),s.port||(/^(http|ws)$/.test(s.protocol)?s.port="80":/^(http|ws)s$/.test(s.protocol)&&(s.port="443")),s.path=s.path||"/";const r=s.host.indexOf(":")!==-1?"["+s.host+"]":s.host;return s.id=s.protocol+"://"+r+":"+s.port+t,s.href=s.protocol+"://"+r+(e&&e.port===s.port?"":":"+s.port),s}const Wt=typeof ArrayBuffer=="function",Jt=n=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(n):n.buffer instanceof ArrayBuffer,ut=Object.prototype.toString,jt=typeof Blob=="function"||typeof Blob<"u"&&ut.call(Blob)==="[object BlobConstructor]",Zt=typeof File=="function"||typeof File<"u"&&ut.call(File)==="[object FileConstructor]";function Q(n){return Wt&&(n instanceof ArrayBuffer||Jt(n))||jt&&n instanceof Blob||Zt&&n instanceof File}function R(n,t){if(!n||typeof n!="object")return!1;if(Array.isArray(n)){for(let e=0,s=n.length;e<s;e++)if(R(n[e]))return!0;return!1}if(Q(n))return!0;if(n.toJSON&&typeof n.toJSON=="function"&&arguments.length===1)return R(n.toJSON(),!0);for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e)&&R(n[e]))return!0;return!1}function Gt(n){const t=[],e=n.data,s=n;return s.data=H(e,t),s.attachments=t.length,{packet:s,buffers:t}}function H(n,t){if(!n)return n;if(Q(n)){const e={_placeholder:!0,num:t.length};return t.push(n),e}else if(Array.isArray(n)){const e=new Array(n.length);for(let s=0;s<n.length;s++)e[s]=H(n[s],t);return e}else if(typeof n=="object"&&!(n instanceof Date)){const e={};for(const s in n)Object.prototype.hasOwnProperty.call(n,s)&&(e[s]=H(n[s],t));return e}return n}function te(n,t){return n.data=F(n.data,t),delete n.attachments,n}function F(n,t){if(!n)return n;if(n&&n._placeholder===!0){if(typeof n.num=="number"&&n.num>=0&&n.num<t.length)return t[n.num];throw new Error("illegal attachments")}else if(Array.isArray(n))for(let e=0;e<n.length;e++)n[e]=F(n[e],t);else if(typeof n=="object")for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&(n[e]=F(n[e],t));return n}const ee=["connect","connect_error","disconnect","disconnecting","newListener","removeListener"],se=5;var l;(function(n){n[n.CONNECT=0]="CONNECT",n[n.DISCONNECT=1]="DISCONNECT",n[n.EVENT=2]="EVENT",n[n.ACK=3]="ACK",n[n.CONNECT_ERROR=4]="CONNECT_ERROR",n[n.BINARY_EVENT=5]="BINARY_EVENT",n[n.BINARY_ACK=6]="BINARY_ACK"})(l||(l={}));class ne{constructor(t){this.replacer=t}encode(t){return(t.type===l.EVENT||t.type===l.ACK)&&R(t)?this.encodeAsBinary({type:t.type===l.EVENT?l.BINARY_EVENT:l.BINARY_ACK,nsp:t.nsp,data:t.data,id:t.id}):[this.encodeAsString(t)]}encodeAsString(t){let e=""+t.type;return(t.type===l.BINARY_EVENT||t.type===l.BINARY_ACK)&&(e+=t.attachments+"-"),t.nsp&&t.nsp!=="/"&&(e+=t.nsp+","),t.id!=null&&(e+=t.id),t.data!=null&&(e+=JSON.stringify(t.data,this.replacer)),e}encodeAsBinary(t){const e=Gt(t),s=this.encodeAsString(e.packet),i=e.buffers;return i.unshift(s),i}}function G(n){return Object.prototype.toString.call(n)==="[object Object]"}class K extends u{constructor(t){super(),this.reviver=t}add(t){let e;if(typeof t=="string"){if(this.reconstructor)throw new Error("got plaintext data when reconstructing a packet");e=this.decodeString(t);const s=e.type===l.BINARY_EVENT;s||e.type===l.BINARY_ACK?(e.type=s?l.EVENT:l.ACK,this.reconstructor=new ie(e),e.attachments===0&&super.emitReserved("decoded",e)):super.emitReserved("decoded",e)}else if(Q(t)||t.base64)if(this.reconstructor)e=this.reconstructor.takeBinaryData(t),e&&(this.reconstructor=null,super.emitReserved("decoded",e));else throw new Error("got binary data when not reconstructing a packet");else throw new Error("Unknown type: "+t)}decodeString(t){let e=0;const s={type:Number(t.charAt(0))};if(l[s.type]===void 0)throw new Error("unknown packet type "+s.type);if(s.type===l.BINARY_EVENT||s.type===l.BINARY_ACK){const r=e+1;for(;t.charAt(++e)!=="-"&&e!=t.length;);const o=t.substring(r,e);if(o!=Number(o)||t.charAt(e)!=="-")throw new Error("Illegal attachments");s.attachments=Number(o)}if(t.charAt(e+1)==="/"){const r=e+1;for(;++e&&!(t.charAt(e)===","||e===t.length););s.nsp=t.substring(r,e)}else s.nsp="/";const i=t.charAt(e+1);if(i!==""&&Number(i)==i){const r=e+1;for(;++e;){const o=t.charAt(e);if(o==null||Number(o)!=o){--e;break}if(e===t.length)break}s.id=Number(t.substring(r,e+1))}if(t.charAt(++e)){const r=this.tryParse(t.substr(e));if(K.isPayloadValid(s.type,r))s.data=r;else throw new Error("invalid payload")}return s}tryParse(t){try{return JSON.parse(t,this.reviver)}catch{return!1}}static isPayloadValid(t,e){switch(t){case l.CONNECT:return G(e);case l.DISCONNECT:return e===void 0;case l.CONNECT_ERROR:return typeof e=="string"||G(e);case l.EVENT:case l.BINARY_EVENT:return Array.isArray(e)&&(typeof e[0]=="number"||typeof e[0]=="string"&&ee.indexOf(e[0])===-1);case l.ACK:case l.BINARY_ACK:return Array.isArray(e)}}destroy(){this.reconstructor&&(this.reconstructor.finishedReconstruction(),this.reconstructor=null)}}class ie{constructor(t){this.packet=t,this.buffers=[],this.reconPack=t}takeBinaryData(t){if(this.buffers.push(t),this.buffers.length===this.reconPack.attachments){const e=te(this.reconPack,this.buffers);return this.finishedReconstruction(),e}return null}finishedReconstruction(){this.reconPack=null,this.buffers=[]}}const re=Object.freeze(Object.defineProperty({__proto__:null,Decoder:K,Encoder:ne,get PacketType(){return l},protocol:se},Symbol.toStringTag,{value:"Module"}));function v(n,t,e){return n.on(t,e),function(){n.off(t,e)}}const oe=Object.freeze({connect:1,connect_error:1,disconnect:1,disconnecting:1,newListener:1,removeListener:1});class dt extends u{constructor(t,e,s){super(),this.connected=!1,this.recovered=!1,this.receiveBuffer=[],this.sendBuffer=[],this._queue=[],this._queueSeq=0,this.ids=0,this.acks={},this.flags={},this.io=t,this.nsp=e,s&&s.auth&&(this.auth=s.auth),this._opts=Object.assign({},s),this.io._autoConnect&&this.open()}get disconnected(){return!this.connected}subEvents(){if(this.subs)return;const t=this.io;this.subs=[v(t,"open",this.onopen.bind(this)),v(t,"packet",this.onpacket.bind(this)),v(t,"error",this.onerror.bind(this)),v(t,"close",this.onclose.bind(this))]}get active(){return!!this.subs}connect(){return this.connected?this:(this.subEvents(),this.io._reconnecting||this.io.open(),this.io._readyState==="open"&&this.onopen(),this)}open(){return this.connect()}send(...t){return t.unshift("message"),this.emit.apply(this,t),this}emit(t,...e){var s,i,r;if(oe.hasOwnProperty(t))throw new Error('"'+t.toString()+'" is a reserved event name');if(e.unshift(t),this._opts.retries&&!this.flags.fromQueue&&!this.flags.volatile)return this._addToQueue(e),this;const o={type:l.EVENT,data:e};if(o.options={},o.options.compress=this.flags.compress!==!1,typeof e[e.length-1]=="function"){const d=this.ids++,f=e.pop();this._registerAckCallback(d,f),o.id=d}const a=(i=(s=this.io.engine)===null||s===void 0?void 0:s.transport)===null||i===void 0?void 0:i.writable,c=this.connected&&!(!((r=this.io.engine)===null||r===void 0)&&r._hasPingExpired());return this.flags.volatile&&!a||(c?(this.notifyOutgoingListeners(o),this.packet(o)):this.sendBuffer.push(o)),this.flags={},this}_registerAckCallback(t,e){var s;const i=(s=this.flags.timeout)!==null&&s!==void 0?s:this._opts.ackTimeout;if(i===void 0){this.acks[t]=e;return}const r=this.io.setTimeoutFn(()=>{delete this.acks[t];for(let a=0;a<this.sendBuffer.length;a++)this.sendBuffer[a].id===t&&this.sendBuffer.splice(a,1);e.call(this,new Error("operation has timed out"))},i),o=(...a)=>{this.io.clearTimeoutFn(r),e.apply(this,a)};o.withError=!0,this.acks[t]=o}emitWithAck(t,...e){return new Promise((s,i)=>{const r=(o,a)=>o?i(o):s(a);r.withError=!0,e.push(r),this.emit(t,...e)})}_addToQueue(t){let e;typeof t[t.length-1]=="function"&&(e=t.pop());const s={id:this._queueSeq++,tryCount:0,pending:!1,args:t,flags:Object.assign({fromQueue:!0},this.flags)};t.push((i,...r)=>s!==this._queue[0]?void 0:(i!==null?s.tryCount>this._opts.retries&&(this._queue.shift(),e&&e(i)):(this._queue.shift(),e&&e(null,...r)),s.pending=!1,this._drainQueue())),this._queue.push(s),this._drainQueue()}_drainQueue(t=!1){if(!this.connected||this._queue.length===0)return;const e=this._queue[0];e.pending&&!t||(e.pending=!0,e.tryCount++,this.flags=e.flags,this.emit.apply(this,e.args))}packet(t){t.nsp=this.nsp,this.io._packet(t)}onopen(){typeof this.auth=="function"?this.auth(t=>{this._sendConnectPacket(t)}):this._sendConnectPacket(this.auth)}_sendConnectPacket(t){this.packet({type:l.CONNECT,data:this._pid?Object.assign({pid:this._pid,offset:this._lastOffset},t):t})}onerror(t){this.connected||this.emitReserved("connect_error",t)}onclose(t,e){this.connected=!1,delete this.id,this.emitReserved("disconnect",t,e),this._clearAcks()}_clearAcks(){Object.keys(this.acks).forEach(t=>{if(!this.sendBuffer.some(s=>String(s.id)===t)){const s=this.acks[t];delete this.acks[t],s.withError&&s.call(this,new Error("socket has been disconnected"))}})}onpacket(t){if(t.nsp===this.nsp)switch(t.type){case l.CONNECT:t.data&&t.data.sid?this.onconnect(t.data.sid,t.data.pid):this.emitReserved("connect_error",new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));break;case l.EVENT:case l.BINARY_EVENT:this.onevent(t);break;case l.ACK:case l.BINARY_ACK:this.onack(t);break;case l.DISCONNECT:this.ondisconnect();break;case l.CONNECT_ERROR:this.destroy();const s=new Error(t.data.message);s.data=t.data.data,this.emitReserved("connect_error",s);break}}onevent(t){const e=t.data||[];t.id!=null&&e.push(this.ack(t.id)),this.connected?this.emitEvent(e):this.receiveBuffer.push(Object.freeze(e))}emitEvent(t){if(this._anyListeners&&this._anyListeners.length){const e=this._anyListeners.slice();for(const s of e)s.apply(this,t)}super.emit.apply(this,t),this._pid&&t.length&&typeof t[t.length-1]=="string"&&(this._lastOffset=t[t.length-1])}ack(t){const e=this;let s=!1;return function(...i){s||(s=!0,e.packet({type:l.ACK,id:t,data:i}))}}onack(t){const e=this.acks[t.id];typeof e=="function"&&(delete this.acks[t.id],e.withError&&t.data.unshift(null),e.apply(this,t.data))}onconnect(t,e){this.id=t,this.recovered=e&&this._pid===e,this._pid=e,this.connected=!0,this.emitBuffered(),this.emitReserved("connect"),this._drainQueue(!0)}emitBuffered(){this.receiveBuffer.forEach(t=>this.emitEvent(t)),this.receiveBuffer=[],this.sendBuffer.forEach(t=>{this.notifyOutgoingListeners(t),this.packet(t)}),this.sendBuffer=[]}ondisconnect(){this.destroy(),this.onclose("io server disconnect")}destroy(){this.subs&&(this.subs.forEach(t=>t()),this.subs=void 0),this.io._destroy(this)}disconnect(){return this.connected&&this.packet({type:l.DISCONNECT}),this.destroy(),this.connected&&this.onclose("io client disconnect"),this}close(){return this.disconnect()}compress(t){return this.flags.compress=t,this}get volatile(){return this.flags.volatile=!0,this}timeout(t){return this.flags.timeout=t,this}onAny(t){return this._anyListeners=this._anyListeners||[],this._anyListeners.push(t),this}prependAny(t){return this._anyListeners=this._anyListeners||[],this._anyListeners.unshift(t),this}offAny(t){if(!this._anyListeners)return this;if(t){const e=this._anyListeners;for(let s=0;s<e.length;s++)if(t===e[s])return e.splice(s,1),this}else this._anyListeners=[];return this}listenersAny(){return this._anyListeners||[]}onAnyOutgoing(t){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.push(t),this}prependAnyOutgoing(t){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.unshift(t),this}offAnyOutgoing(t){if(!this._anyOutgoingListeners)return this;if(t){const e=this._anyOutgoingListeners;for(let s=0;s<e.length;s++)if(t===e[s])return e.splice(s,1),this}else this._anyOutgoingListeners=[];return this}listenersAnyOutgoing(){return this._anyOutgoingListeners||[]}notifyOutgoingListeners(t){if(this._anyOutgoingListeners&&this._anyOutgoingListeners.length){const e=this._anyOutgoingListeners.slice();for(const s of e)s.apply(this,t.data)}}}function _(n){n=n||{},this.ms=n.min||100,this.max=n.max||1e4,this.factor=n.factor||2,this.jitter=n.jitter>0&&n.jitter<=1?n.jitter:0,this.attempts=0}_.prototype.duration=function(){var n=this.ms*Math.pow(this.factor,this.attempts++);if(this.jitter){var t=Math.random(),e=Math.floor(t*this.jitter*n);n=Math.floor(t*10)&1?n+e:n-e}return Math.min(n,this.max)|0};_.prototype.reset=function(){this.attempts=0};_.prototype.setMin=function(n){this.ms=n};_.prototype.setMax=function(n){this.max=n};_.prototype.setJitter=function(n){this.jitter=n};class Y extends u{constructor(t,e){var s;super(),this.nsps={},this.subs=[],t&&typeof t=="object"&&(e=t,t=void 0),e=e||{},e.path=e.path||"/socket.io",this.opts=e,P(this,e),this.reconnection(e.reconnection!==!1),this.reconnectionAttempts(e.reconnectionAttempts||1/0),this.reconnectionDelay(e.reconnectionDelay||1e3),this.reconnectionDelayMax(e.reconnectionDelayMax||5e3),this.randomizationFactor((s=e.randomizationFactor)!==null&&s!==void 0?s:.5),this.backoff=new _({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()}),this.timeout(e.timeout==null?2e4:e.timeout),this._readyState="closed",this.uri=t;const i=e.parser||re;this.encoder=new i.Encoder,this.decoder=new i.Decoder,this._autoConnect=e.autoConnect!==!1,this._autoConnect&&this.open()}reconnection(t){return arguments.length?(this._reconnection=!!t,t||(this.skipReconnect=!0),this):this._reconnection}reconnectionAttempts(t){return t===void 0?this._reconnectionAttempts:(this._reconnectionAttempts=t,this)}reconnectionDelay(t){var e;return t===void 0?this._reconnectionDelay:(this._reconnectionDelay=t,(e=this.backoff)===null||e===void 0||e.setMin(t),this)}randomizationFactor(t){var e;return t===void 0?this._randomizationFactor:(this._randomizationFactor=t,(e=this.backoff)===null||e===void 0||e.setJitter(t),this)}reconnectionDelayMax(t){var e;return t===void 0?this._reconnectionDelayMax:(this._reconnectionDelayMax=t,(e=this.backoff)===null||e===void 0||e.setMax(t),this)}timeout(t){return arguments.length?(this._timeout=t,this):this._timeout}maybeReconnectOnOpen(){!this._reconnecting&&this._reconnection&&this.backoff.attempts===0&&this.reconnect()}open(t){if(~this._readyState.indexOf("open"))return this;this.engine=new Qt(this.uri,this.opts);const e=this.engine,s=this;this._readyState="opening",this.skipReconnect=!1;const i=v(e,"open",function(){s.onopen(),t&&t()}),r=a=>{this.cleanup(),this._readyState="closed",this.emitReserved("error",a),t?t(a):this.maybeReconnectOnOpen()},o=v(e,"error",r);if(this._timeout!==!1){const a=this._timeout,c=this.setTimeoutFn(()=>{i(),r(new Error("timeout")),e.close()},a);this.opts.autoUnref&&c.unref(),this.subs.push(()=>{this.clearTimeoutFn(c)})}return this.subs.push(i),this.subs.push(o),this}connect(t){return this.open(t)}onopen(){this.cleanup(),this._readyState="open",this.emitReserved("open");const t=this.engine;this.subs.push(v(t,"ping",this.onping.bind(this)),v(t,"data",this.ondata.bind(this)),v(t,"error",this.onerror.bind(this)),v(t,"close",this.onclose.bind(this)),v(this.decoder,"decoded",this.ondecoded.bind(this)))}onping(){this.emitReserved("ping")}ondata(t){try{this.decoder.add(t)}catch(e){this.onclose("parse error",e)}}ondecoded(t){O(()=>{this.emitReserved("packet",t)},this.setTimeoutFn)}onerror(t){this.emitReserved("error",t)}socket(t,e){let s=this.nsps[t];return s?this._autoConnect&&!s.active&&s.connect():(s=new dt(this,t,e),this.nsps[t]=s),s}_destroy(t){const e=Object.keys(this.nsps);for(const s of e)if(this.nsps[s].active)return;this._close()}_packet(t){const e=this.encoder.encode(t);for(let s=0;s<e.length;s++)this.engine.write(e[s],t.options)}cleanup(){this.subs.forEach(t=>t()),this.subs.length=0,this.decoder.destroy()}_close(){this.skipReconnect=!0,this._reconnecting=!1,this.onclose("forced close")}disconnect(){return this._close()}onclose(t,e){var s;this.cleanup(),(s=this.engine)===null||s===void 0||s.close(),this.backoff.reset(),this._readyState="closed",this.emitReserved("close",t,e),this._reconnection&&!this.skipReconnect&&this.reconnect()}reconnect(){if(this._reconnecting||this.skipReconnect)return this;const t=this;if(this.backoff.attempts>=this._reconnectionAttempts)this.backoff.reset(),this.emitReserved("reconnect_failed"),this._reconnecting=!1;else{const e=this.backoff.duration();this._reconnecting=!0;const s=this.setTimeoutFn(()=>{t.skipReconnect||(this.emitReserved("reconnect_attempt",t.backoff.attempts),!t.skipReconnect&&t.open(i=>{i?(t._reconnecting=!1,t.reconnect(),this.emitReserved("reconnect_error",i)):t.onreconnect()}))},e);this.opts.autoUnref&&s.unref(),this.subs.push(()=>{this.clearTimeoutFn(s)})}}onreconnect(){const t=this.backoff.attempts;this._reconnecting=!1,this.backoff.reset(),this.emitReserved("reconnect",t)}}const x={};function N(n,t){typeof n=="object"&&(t=n,n=void 0),t=t||{};const e=Kt(n,t.path||"/socket.io"),s=e.source,i=e.id,r=e.path,o=x[i]&&r in x[i].nsps,a=t.forceNew||t["force new connection"]||t.multiplex===!1||o;let c;return a?c=new Y(s,t):(x[i]||(x[i]=new Y(s,t)),c=x[i]),e.query&&!t.query&&(t.query=e.queryKey),c.socket(e.path,t)}Object.assign(N,{Manager:Y,Socket:dt,io:N,connect:N});class ae{constructor(){this.localState={x:0,y:0,chunkX:0,chunkY:0,timestamp:0},this.inputQueue=[],this.stateHistory=[],this.INPUT_BUFFER_SIZE=60,this.STATE_HISTORY_SIZE=120,this.INTERPOLATION_DELAY=100,this.serverState=null,this.lastServerUpdate=0,this.sequenceNumber=0,this.interpolationState={currentX:0,currentY:0,targetX:0,targetY:0,startTime:0,duration:0},this.stats={predictions:0,corrections:0,reconciliations:0}}initialize(t){this.localState={...t,timestamp:Date.now()},this.serverState={...t},this.interpolationState.currentX=t.x,this.interpolationState.currentY=t.y,this.interpolationState.targetX=t.x,this.interpolationState.targetY=t.y}processInput(t){const e=Date.now(),s=++this.sequenceNumber,i={input:{...t},timestamp:e,sequence:s};return this.inputQueue.push(i),this.inputQueue.length>this.INPUT_BUFFER_SIZE&&this.inputQueue.shift(),this.applyPrediction(t),this.stats.predictions++,{...t,sequence:s,timestamp:e}}applyPrediction(t){t.thrust&&(this.localState.x+=4.8,this.localState.y+=4.8),this.localState.chunkX=Math.floor(this.localState.x/1e3),this.localState.chunkY=Math.floor(this.localState.y/1e3),this.localState.timestamp=Date.now(),this.addToStateHistory({x:this.localState.x,y:this.localState.y,timestamp:this.localState.timestamp,sequence:this.sequenceNumber})}addToStateHistory(t){this.stateHistory.push(t),this.stateHistory.length>this.STATE_HISTORY_SIZE&&this.stateHistory.shift()}processServerConfirmation(t){const{x:e,y:s,chunkX:i,chunkY:r,sequence:o,timestamp:a}=t;this.serverState={x:e,y:s,chunkX:i,chunkY:r,timestamp:a},this.lastServerUpdate=Date.now();const c=this.inputQueue.filter(h=>h.sequence<=o);this.inputQueue=this.inputQueue.filter(h=>h.sequence>o),c.length>0&&this.reconcile(e,s,o),this.startInterpolation(e,s)}reconcile(t,e,s){const i=this.stateHistory.find(h=>h.sequence===s);if(!i){console.warn("⚠️ Estado local não encontrado para reconciliação");return}const r=t-i.x,o=e-i.y,a=5;if(Math.abs(r)<a&&Math.abs(o)<a)return;this.localState.x+=r,this.localState.y+=o,this.inputQueue.filter(h=>h.sequence>s).forEach(h=>{this.applyPrediction(h.input)}),this.stats.reconciliations++,this.stats.corrections++,console.debug(`🔧 Reconciliação: correção de (${r.toFixed(1)}, ${o.toFixed(1)})`)}startInterpolation(t,e){this.interpolationState.targetX=t,this.interpolationState.targetY=e,this.interpolationState.startTime=Date.now(),this.interpolationState.duration=100}getInterpolatedPosition(){const e=Date.now()-this.interpolationState.startTime;if(e>=this.interpolationState.duration)return{x:this.interpolationState.targetX,y:this.interpolationState.targetY};const s=this.easeInOutQuad(e/this.interpolationState.duration),i=this.lerp(this.interpolationState.currentX,this.interpolationState.targetX,s),r=this.lerp(this.interpolationState.currentY,this.interpolationState.targetY,s);return{x:i,y:r}}lerp(t,e,s){return t+(e-t)*s}easeInOutQuad(t){return t<.5?2*t*t:-1+(4-2*t)*t}processPositionCorrection(t){const{x:e,y:s,chunkX:i,chunkY:r,reason:o}=t;console.warn(`⚠️ Correção de posição recebida: ${o}`),this.localState.x=e,this.localState.y=s,this.localState.chunkX=i,this.localState.chunkY=r,this.inputQueue=[],this.startInterpolation(e,s),this.stats.corrections++}getCurrentState(){const t=this.getInterpolatedPosition();return{...this.localState,x:t.x,y:t.y}}update(){const t=this.getInterpolatedPosition();this.interpolationState.currentX=t.x,this.interpolationState.currentY=t.y;const e=Date.now()-2e3;this.stateHistory=this.stateHistory.filter(i=>i.timestamp>e);const s=Date.now()-1e3;this.inputQueue=this.inputQueue.filter(i=>i.timestamp>s)}hasPendingReconciliation(){return this.inputQueue.length>0}getEstimatedLatency(){if(this.lastServerUpdate===0)return 0;const e=Date.now()-this.lastServerUpdate;return Math.min(e,500)}getStats(){const t=this.inputQueue.length,e=this.stateHistory.size,s=this.getEstimatedLatency();return{...this.stats,pendingInputs:t,historySize:e,latency:s,localState:this.localState,serverState:this.serverState}}reset(){this.inputQueue=[],this.stateHistory=[],this.sequenceNumber=0,this.stats={predictions:0,corrections:0,reconciliations:0}}configure(t){t.interpolationDelay!==void 0&&(this.INTERPOLATION_DELAY=t.interpolationDelay),t.inputBufferSize!==void 0&&(this.INPUT_BUFFER_SIZE=t.inputBufferSize),t.stateHistorySize!==void 0&&(this.STATE_HISTORY_SIZE=t.stateHistorySize)}}class ce{constructor(){this.entities=new Map,this.INTERPOLATION_DELAY=100,this.MAX_BUFFER_SIZE=30,this.EXTRAPOLATION_TIME=200,this.stats={entities:0,updatesPerSecond:0,smoothTransitions:0}}updateEntity(t,e,s=null,i=null){const r=Date.now();this.entities.has(t)||this.entities.set(t,{id:t,buffer:[],currentPosition:{x:e.x,y:e.y},targetPosition:{x:e.x,y:e.y},currentRotation:s||0,targetRotation:s||0,currentHealth:i,targetHealth:i,lastUpdate:r,isMoving:!1,isVisible:!0});const o=this.entities.get(t);o.buffer.push({x:e.x,y:e.y,rotation:s,health:i,timestamp:r}),o.buffer.length>this.MAX_BUFFER_SIZE&&o.buffer.shift(),o.targetPosition={x:e.x,y:e.y},o.targetRotation=s||0,o.targetHealth=i,o.lastUpdate=r,(o.currentPosition.x!==e.x||o.currentPosition.y!==e.y)&&(o.isMoving=!0)}removeEntity(t){this.entities.delete(t)}getInterpolatedPosition(t){const e=this.entities.get(t);if(!e)return null;const i=Date.now()-this.INTERPOLATION_DELAY,r=this.findPositionsForTime(e,i);if(!r)return this.extrapolateOrUseLastPosition(e,i);const o=this.interpolate(r.start,r.end,(i-r.start.timestamp)/(r.end.timestamp-r.start.timestamp));return this.applyEasing(o,e.currentPosition)}findPositionsForTime(t,e){const s=t.buffer;if(s.length<2)return null;let i=null,r=null;for(let o=0;o<s.length-1;o++)if(s[o].timestamp<=e&&s[o+1].timestamp>=e){i=s[o],r=s[o+1];break}return!i||!r?null:{start:i,end:r}}extrapolateOrUseLastPosition(t,e){const s=Date.now(),i=t.buffer[t.buffer.length-1];if(!i)return t.currentPosition;if(s-i.timestamp>this.EXTRAPOLATION_TIME)return t.isVisible=!1,t.currentPosition;if(t.isVisible=!0,t.buffer.length>=2){const o=t.buffer[t.buffer.length-2],a=t.buffer[t.buffer.length-1],c=a.timestamp-o.timestamp;if(c>0){const h=(a.x-o.x)/c,d=(a.y-o.y)/c,f=e-a.timestamp,y=a.x+h*f,S=a.y+d*f;return{x:y,y:S}}}return{x:i.x,y:i.y}}interpolate(t,e,s){return s=Math.max(0,Math.min(1,s)),{x:t.x+(e.x-t.x)*s,y:t.y+(e.y-t.y)*s,rotation:t.rotation!==void 0&&e.rotation!==void 0?t.rotation+(e.rotation-t.rotation)*s:e.rotation||0,health:e.health}}applyEasing(t,e){const i=e.x+(t.x-e.x)*.15,r=e.y+(t.y-e.y)*.15;return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))>1&&this.stats.smoothTransitions++,{x:i,y:r,rotation:t.rotation,health:t.health}}getInterpolatedRotation(t){const e=this.entities.get(t);if(!e)return 0;const s=e.currentRotation;let r=e.targetRotation-s;for(;r>Math.PI;)r-=2*Math.PI;for(;r<-Math.PI;)r+=2*Math.PI;return s+r*.1}getInterpolatedHealth(t){const e=this.entities.get(t);if(!e)return null;const s=e.currentHealth,i=e.targetHealth;if(s==null)return i;if(i==null)return s;const r=i-s;return Math.abs(r)<1?i:s+r*.2}isEntityVisible(t){const e=this.entities.get(t);return e?e.isVisible:!1}isEntityMoving(t){const e=this.entities.get(t);return e?e.isMoving:!1}update(){const t=Date.now();this.entities.forEach(e=>{const s=this.getInterpolatedPosition(e.id);s&&(e.currentPosition={x:s.x,y:s.y},e.currentRotation=s.rotation,e.currentHealth=s.health);const i=t-1e3;e.buffer=e.buffer.filter(r=>r.timestamp>i),t-e.lastUpdate>5e3&&this.entities.delete(e.id)}),this.stats.entities=this.entities.size,this.stats.updatesPerSecond=this.calculateUpdatesPerSecond()}calculateUpdatesPerSecond(){let t=0;return this.entities.forEach(e=>{t+=e.buffer.length}),t}getStats(){return{...this.stats,memoryUsage:Math.round(JSON.stringify([...this.entities]).length/1024)+" KB"}}clear(){this.entities.clear(),this.stats={entities:0,updatesPerSecond:0,smoothTransitions:0}}configure(t){t.interpolationDelay!==void 0&&(this.INTERPOLATION_DELAY=t.interpolationDelay),t.maxBufferSize!==void 0&&(this.MAX_BUFFER_SIZE=t.maxBufferSize),t.extrapolationTime!==void 0&&(this.EXTRAPOLATION_TIME=t.extrapolationTime)}forceTeleport(t,e){const s=this.entities.get(t);s&&(s.currentPosition={x:e.x,y:e.y},s.targetPosition={x:e.x,y:e.y},s.buffer=[])}}const le=()=>typeof window<"u"&&window.supabaseClient?window.supabaseClient:(console.warn("⚠️ Supabase client not initialized yet"),null);class he{constructor(){this.socket=null,this.connected=!1,this.authenticated=!1,this.playerId=null,this.playerState=null,this.reconnectAttempts=0,this.maxReconnectAttempts=5,this.predictionManager=new ae,this.interpolationManager=new ce,this.configureNetworkSystems()}configureNetworkSystems(){const t=navigator.connection||navigator.mozConnection||navigator.webkitConnection;if(t)switch(t.effectiveType){case"slow-2g":case"2g":this.predictionManager.configure({interpolationDelay:200,inputBufferSize:30}),this.interpolationManager.configure({interpolationDelay:200,maxBufferSize:20});break;case"3g":this.predictionManager.configure({interpolationDelay:150,inputBufferSize:45}),this.interpolationManager.configure({interpolationDelay:150,maxBufferSize:25});break;case"4g":default:this.predictionManager.configure({interpolationDelay:100,inputBufferSize:60}),this.interpolationManager.configure({interpolationDelay:100,maxBufferSize:30});break}}connect(){var e;if((e=this.socket)!=null&&e.connected){console.log("✅ Já conectado ao servidor");return}const t="https://spaceshiponsol-production.up.railway.app";console.log("🔌 Conectando ao servidor:",t),this.socket=N(t,{transports:["websocket","polling"],reconnection:!0,reconnectionDelay:1e3,reconnectionDelayMax:5e3,reconnectionAttempts:this.maxReconnectAttempts,timeout:1e4}),this.setupListeners()}setupListeners(){this.socket.on("connect",()=>{console.log("✅ Conectado ao servidor:",this.socket.id),this.connected=!0,this.reconnectAttempts=0,window.dispatchEvent(new CustomEvent("socket:connected",{detail:{socketId:this.socket.id}})),setTimeout(()=>{this.authenticateIfNeeded()},500)}),this.socket.on("disconnect",t=>{console.log("❌ Desconectado:",t),this.connected=!1,this.authenticated=!1,window.dispatchEvent(new CustomEvent("socket:disconnected",{detail:{reason:t}}))}),this.socket.on("connect_error",t=>{console.error("❌ Erro de conexão:",t.message),this.reconnectAttempts++,window.dispatchEvent(new CustomEvent("socket:connect_error",{detail:{error:t.message,attempts:this.reconnectAttempts}}))}),this.socket.on("auth:success",t=>{console.log("✅ Autenticado:",t.playerId),this.authenticated=!0,this.playerId=t.playerId,this.playerState=t.playerState,console.log("📡 Disparando evento socket:authenticated"),window.dispatchEvent(new CustomEvent("socket:authenticated",{detail:t})),console.log("✅ Estado do socketService:",{connected:this.connected,authenticated:this.authenticated,playerId:this.playerId})}),this.socket.on("auth:error",t=>{console.error("❌ Erro de autenticação:",t.message),this.authenticated=!1,window.dispatchEvent(new CustomEvent("socket:auth:error",{detail:t}))}),this.socket.on("chunk:data",t=>{var e,s;console.log("📦 Dados do chunk:",t.chunk.zone_type,`(${t.chunk.chunk_x}, ${t.chunk.chunk_y})`),console.log("  - Asteroides:",((e=t.asteroids)==null?void 0:e.length)||0),console.log("  - Players:",((s=t.players)==null?void 0:s.length)||0),t.players&&t.players.length>0&&(console.log("👥 Players recebidos:"),t.players.forEach((i,r)=>{console.log(`  ${r+1}. ${i.username} (ID: ${i.id})`),console.log(`     - Posição: (${i.x}, ${i.y})`),console.log(`     - Chunk: ${i.current_chunk}`),console.log(`     - Health: ${i.health}/${i.max_health}`)})),window.dispatchEvent(new CustomEvent("socket:chunk:data",{detail:t}))}),this.socket.on("player:joined",t=>{console.log("👤 Player entrou:",t.username),console.log("   - ID:",t.id),console.log("   - Posição:",`(${t.x}, ${t.y})`),console.log("   - Chunk:",t.current_chunk),console.log("   - Health:",`${t.health}/${t.max_health}`),window.dispatchEvent(new CustomEvent("socket:player:joined",{detail:t}))}),this.socket.on("player:left",t=>{console.log("👋 Player saiu:",t.playerId),window.dispatchEvent(new CustomEvent("socket:player:left",{detail:t}))}),this.socket.on("player:moved",t=>{window.dispatchEvent(new CustomEvent("socket:player:moved",{detail:t}))}),this.socket.on("battle:hit",t=>{console.log("💥 Você foi atingido!",{attacker:t.attackerName,damage:t.damage,critical:t.isCritical,health:`${t.health}/${t.maxHealth}`}),window.dispatchEvent(new CustomEvent("socket:battle:hit",{detail:t}))}),this.socket.on("battle:attack",t=>{console.log("⚔️ Combate:",`${t.attackerName} → ${t.defenderName} (-${t.damage})`),window.dispatchEvent(new CustomEvent("socket:battle:attack",{detail:t}))}),this.socket.on("battle:attack:success",t=>{console.log("✅ Ataque bem-sucedido:",t),window.dispatchEvent(new CustomEvent("socket:battle:attack:success",{detail:t}))}),this.socket.on("battle:attack:failed",t=>{console.log("❌ Ataque falhou:",t.reason),window.dispatchEvent(new CustomEvent("socket:battle:attack:failed",{detail:t}))}),this.socket.on("player:died",t=>{console.log("💀 Player morreu:",`${t.victimName} (morto por ${t.killerName})`),window.dispatchEvent(new CustomEvent("socket:player:died",{detail:t}))}),this.socket.on("player:death",t=>{console.log("💀 Você morreu!",{killer:t.killerName,respawnIn:`${t.respawnDelay/1e3}s`}),window.dispatchEvent(new CustomEvent("socket:player:death",{detail:t}))}),this.socket.on("player:respawned",t=>{console.log("🔄 Respawn:",t),window.dispatchEvent(new CustomEvent("socket:player:respawned",{detail:t}))}),this.socket.on("error",t=>{console.error("❌ Erro:",t.message),window.dispatchEvent(new CustomEvent("socket:error",{detail:t}))}),this.socket.on("battle:error",t=>{console.error("❌ Erro de combate:",t.message),window.dispatchEvent(new CustomEvent("socket:battle:error",{detail:t}))}),this.socket.on("position:corrected",t=>{console.warn("⚠️ Posição corrigida pelo servidor:",t.reason),this.predictionManager.processPositionCorrection(t),window.dispatchEvent(new CustomEvent("socket:position:corrected",{detail:t}))}),this.socket.on("move:confirmed",t=>{this.predictionManager.processServerConfirmation(t),window.dispatchEvent(new CustomEvent("socket:move:confirmed",{detail:t}))})}async authenticate(){var i,r,o,a,c;if(!this.connected)return console.error("❌ Não conectado ao servidor"),!1;const t=le();if(!t)return console.error("❌ Supabase client não disponível"),!1;const{data:{session:e}}=await t.auth.getSession();if(!e)return console.error("❌ Sem sessão ativa no Supabase"),!1;console.log("🔐 Autenticando com servidor...");const{data:s}=await t.auth.getUser();return this.socket.emit("auth",{token:e.access_token,userId:((i=s==null?void 0:s.user)==null?void 0:i.id)||`demo_${Date.now()}`,username:((o=(r=s==null?void 0:s.user)==null?void 0:r.user_metadata)==null?void 0:o.username)||((c=(a=s==null?void 0:s.user)==null?void 0:a.email)==null?void 0:c.split("@")[0])||`Player_${Date.now().toString(36)}`}),!0}async authenticateIfNeeded(){!this.authenticated&&this.connected&&await this.authenticate()}enterChunk(t,e){return this.authenticated?(console.log(`📍 Entrando no chunk (${t}, ${e})`),this.socket.emit("chunk:enter",{chunkX:t,chunkY:e}),!0):(console.error("❌ Não autenticado"),!1)}updatePosition(t,e,s,i){if(!this.authenticated)return!1;const r={thrust:!0,targetX:t,targetY:e,chunkX:s||Math.floor(t/1e3),chunkY:i||Math.floor(e/1e3)},o=this.predictionManager.processInput(r);return this.socket.emit("player:move",{x:t,y:e,chunkX:s||Math.floor(t/1e3),chunkY:i||Math.floor(e/1e3),sequence:o.sequence,timestamp:o.timestamp}),!0}getPredictedPosition(){return this.predictionManager.getCurrentState()}getInterpolatedPosition(t){return this.interpolationManager.getInterpolatedPosition(t)}updateEntityPosition(t,e,s,i){this.interpolationManager.updateEntity(t,e,s,i)}removeEntity(t){this.interpolationManager.removeEntity(t)}attack(t){return this.authenticated?(console.log(`⚔️ Atacando ${t}`),this.socket.emit("battle:attack",{targetId:t}),!0):(console.error("❌ Não autenticado"),!1)}respawn(){return this.authenticated?(console.log("🔄 Solicitando respawn..."),this.socket.emit("battle:respawn",{}),!0):(console.error("❌ Não autenticado"),!1)}disconnect(){this.socket&&(console.log("👋 Desconectando..."),this.socket.disconnect(),this.socket=null,this.connected=!1,this.authenticated=!1,this.playerId=null,this.playerState=null)}isConnected(){var t;return this.connected&&((t=this.socket)==null?void 0:t.connected)}isAuthenticated(){return this.authenticated}getPlayerId(){return this.playerId}getPlayerState(){return this.playerState}getSocketId(){var t;return(t=this.socket)==null?void 0:t.id}update(){this.predictionManager.update(),this.interpolationManager.update()}getNetworkStats(){return{prediction:this.predictionManager.getStats(),interpolation:this.interpolationManager.getStats(),connection:{connected:this.connected,authenticated:this.authenticated,latency:this.predictionManager.getEstimatedLatency()}}}resetNetworkSystems(){this.predictionManager.reset(),this.interpolationManager.clear()}initializeNetworkSystems(t){this.predictionManager.initialize(t)}}const p=new he;class ue{constructor(){this.container=null,this.statusDot=null,this.statusText=null,this.playerInfo=null}render(){return this.container=document.createElement("div"),this.container.className="server-status-widget",this.container.innerHTML=`
      <div class="server-status-header">
        <h3>🌐 Status do Servidor</h3>
      </div>
      <div class="server-status-content">
        <div class="status-row">
          <span class="status-label">Conexão:</span>
          <div class="status-indicator">
            <span class="status-dot offline" data-status-dot></span>
            <span class="status-text" data-status-text>Desconectado</span>
          </div>
        </div>
        <div class="status-row">
          <span class="status-label">Autenticação:</span>
          <div class="status-indicator">
            <span class="status-dot offline" data-auth-dot></span>
            <span class="status-text" data-auth-text>Não autenticado</span>
          </div>
        </div>
        <div class="player-info" data-player-info style="display: none;">
          <div class="status-row">
            <span class="status-label">Player ID:</span>
            <span class="status-value" data-player-id>-</span>
          </div>
          <div class="status-row">
            <span class="status-label">Socket ID:</span>
            <span class="status-value" data-socket-id>-</span>
          </div>
        </div>
        <button class="btn btn-sm btn-primary" data-connect-btn style="margin-top: 1rem;">
          Conectar
        </button>
      </div>
    `,this.statusDot=this.container.querySelector("[data-status-dot]"),this.statusText=this.container.querySelector("[data-status-text]"),this.authDot=this.container.querySelector("[data-auth-dot]"),this.authText=this.container.querySelector("[data-auth-text]"),this.playerInfo=this.container.querySelector("[data-player-info]"),this.playerIdEl=this.container.querySelector("[data-player-id]"),this.socketIdEl=this.container.querySelector("[data-socket-id]"),this.connectBtn=this.container.querySelector("[data-connect-btn]"),this.setupEventListeners(),this.updateStatus(),p.isConnected()||p.connect(),this.container}setupEventListeners(){this.connectBtn.addEventListener("click",()=>{p.isConnected()?(p.disconnect(),this.connectBtn.textContent="Conectar"):(p.connect(),this.connectBtn.textContent="Conectando...",this.connectBtn.disabled=!0)}),window.addEventListener("socket:connected",()=>{this.updateStatus(),this.connectBtn.textContent="Desconectar",this.connectBtn.disabled=!1}),window.addEventListener("socket:disconnected",()=>{this.updateStatus(),this.connectBtn.textContent="Conectar",this.connectBtn.disabled=!1}),window.addEventListener("socket:authenticated",()=>{this.updateStatus()}),window.addEventListener("socket:auth:error",()=>{this.updateStatus()}),window.addEventListener("socket:connect_error",t=>{this.connectBtn.textContent=`Reconectar (${t.detail.attempts}/${p.maxReconnectAttempts})`,this.connectBtn.disabled=!1})}updateStatus(){const t=p.isConnected(),e=p.isAuthenticated();if(t?(this.statusDot.className="status-dot online",this.statusText.textContent="Conectado"):(this.statusDot.className="status-dot offline",this.statusText.textContent="Desconectado"),e){this.authDot.className="status-dot online",this.authText.textContent="Autenticado",this.playerInfo.style.display="block";const s=p.getPlayerId(),i=p.getSocketId();this.playerIdEl.textContent=s?s.substring(0,8)+"...":"-",this.socketIdEl.textContent=i||"-"}else this.authDot.className="status-dot offline",this.authText.textContent="Não autenticado",this.playerInfo.style.display="none"}destroy(){window.removeEventListener("socket:connected",this.updateStatus),window.removeEventListener("socket:disconnected",this.updateStatus),window.removeEventListener("socket:authenticated",this.updateStatus),window.removeEventListener("socket:auth:error",this.updateStatus)}}class me{constructor(){this.currentPage="",this.serverStatusComponent=null,this.dropdownOpen=!1}render(){const t=document.createElement("header");t.className="global-header",console.log("🔍 HeaderNavigation: Renderizando header com botão multiplayer..."),t.innerHTML=`
      <!-- Logo/Brand -->
      <div class="header-brand">
        <a href="/" class="brand-link" title="Voltar para home">
          <span class="brand-icon">🚀</span>
          <span class="brand-text">Space Crypto Miner</span>
        </a>
      </div>

      <!-- Navigation Menu -->
      <nav class="header-nav">
        <ul class="nav-list">
          <li class="nav-item">
            <a href="/multiplayer" class="nav-link nav-link-multiplayer" data-page="multiplayer" title="Jogo Multiplayer">
              <span class="nav-icon">🌐</span>
              <span class="nav-text">MULTIPLAYER</span>
              <span class="multiplayer-indicator">🔴 LIVE</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/game.html" class="nav-link nav-link-play disabled" data-page="game" title="Servidor não disponível" target="_blank">
              <span class="nav-icon">🎮</span>
              <span class="nav-text">Play</span>
              <span class="play-status-indicator">⚠️</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/dashboard" class="nav-link" data-page="dashboard" title="Dashboard">
              <span class="nav-icon">📊</span>
              <span class="nav-text">Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/profile" class="nav-link" data-page="profile" title="Meu Perfil">
              <span class="nav-icon">👤</span>
              <span class="nav-text">Perfil</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/missions" class="nav-link" data-page="missions" title="Missões">
              <span class="nav-icon">🎯</span>
              <span class="nav-text">Missões</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/marketplace" class="nav-link" data-page="marketplace" title="Mercado">
              <span class="nav-icon">🛒</span>
              <span class="nav-text">Mercado</span>
            </a>
          </li>
          <li class="nav-item">
            <a href="/config" class="nav-link" data-page="config" title="Configurações">
              <span class="nav-icon">⚙️</span>
              <span class="nav-text">Config</span>
            </a>
          </li>
          <li class="nav-item">
            <button class="nav-link nav-link-server" id="serverStatusBtn" data-page="server" title="Status do Servidor">
              <span class="nav-icon">🌐</span>
              <span class="nav-text">Servidor</span>
              <span class="status-dot" id="headerStatusDot"></span>
            </button>
          </li>
        </ul>
      </nav>

      <!-- Server Status Dropdown -->
      <div id="serverStatusDropdown" class="server-status-dropdown" style="display: none;">
        <div id="serverStatusContent"></div>
      </div>

      <!-- User Actions -->
      <div class="header-actions">
        <button id="logoutBtn" class="action-btn logout-btn" title="Fazer logout">
          <span class="btn-icon">🚪</span>
          <span class="btn-text">Logout</span>
        </button>
      </div>

      <!-- Mobile Menu Toggle -->
      <button id="mobileMenuToggle" class="mobile-menu-toggle" aria-label="Toggle navigation menu">
        <span class="hamburger-icon">☰</span>
      </button>
    `,this.addStyles(),this.setupEventListeners(t),this.updateActivePage();const e=t.querySelector(".nav-link-multiplayer"),s=t.querySelector(".nav-list"),i=t.querySelectorAll(".nav-link");if(console.log("🔍 Debug HeaderNavigation:"),console.log("- Container:",t),console.log("- Nav List:",s),console.log("- Todos os nav-links:",i.length,i),console.log("- Botão multiplayer:",e),e)console.log("✅ Botão multiplayer encontrado no header:",e),console.log("🔍 HTML do botão multiplayer:",e.outerHTML),console.log("🔍 Estilos computados:",window.getComputedStyle(e)),e.style.display="flex",e.style.visibility="visible",e.style.opacity="1",e.style.background="linear-gradient(135deg, #ff6b35, #f72585)",e.style.color="white",e.style.padding="8px 16px",e.style.border="2px solid #ff6b35",e.style.borderRadius="8px",e.style.fontWeight="bold",e.style.position="relative",e.style.zIndex="9999",console.log("🔧 Estilos inline aplicados para debug");else{console.error("❌ Botão multiplayer NÃO encontrado no header!"),console.log("🔍 HTML completo do header:",t.innerHTML);const r=t.querySelectorAll(".nav-item");console.log("🔍 Nav items encontrados:",r.length),r.forEach((o,a)=>{console.log(`🔍 Nav item ${a}:`,o.innerHTML)})}return t}setupEventListeners(t){const e=t.querySelector("#logoutBtn");e&&e.addEventListener("click",()=>{this.handleLogout()});const s=t.querySelector("#mobileMenuToggle");s&&s.addEventListener("click",()=>{this.toggleMobileMenu(t)});const i=t.querySelector("#serverStatusBtn");i&&i.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation(),this.toggleServerStatusDropdown(t)}),document.addEventListener("click",a=>{const c=t.querySelector("#serverStatusDropdown"),h=t.querySelector("#serverStatusBtn");c&&h&&this.dropdownOpen&&!c.contains(a.target)&&!h.contains(a.target)&&this.closeServerStatusDropdown(t)}),this.initializeServerStatus(t),this.updateHeaderStatusDot(t),this.updatePlayButtonState(t),t.querySelectorAll(".nav-link").forEach(a=>{if(!a.classList.contains("nav-link-play")){if(a.classList.contains("nav-link-multiplayer")){a.addEventListener("click",c=>{c.preventDefault(),console.log("🌐 Abrindo jogo multiplayer em nova aba..."),window.open("/multiplayer.html","_blank")});return}a.addEventListener("click",c=>{c.preventDefault();const h=a.getAttribute("href");h&&T(h)})}});const o=t.querySelector(".brand-link");o&&o.addEventListener("click",a=>{a.preventDefault(),T("/")})}async handleLogout(){try{await pt(),T("/login")}catch(t){console.error("Erro ao fazer logout:",t),T("/login")}}toggleMobileMenu(t){const e=t.querySelector(".header-nav"),s=t.querySelector("#mobileMenuToggle");e&&s&&(e.classList.contains("mobile-open")?(e.classList.remove("mobile-open"),s.setAttribute("aria-expanded","false"),s.querySelector(".hamburger-icon").textContent="☰"):(e.classList.add("mobile-open"),s.setAttribute("aria-expanded","true"),s.querySelector(".hamburger-icon").textContent="✕"))}initializeServerStatus(t){const e=t.querySelector("#serverStatusContent");if(e&&!this.serverStatusComponent){this.serverStatusComponent=new ue;const s=this.serverStatusComponent.render();e.appendChild(s),p.isConnected()||p.connect()}}toggleServerStatusDropdown(t){this.dropdownOpen?this.closeServerStatusDropdown(t):this.openServerStatusDropdown(t)}openServerStatusDropdown(t){const e=t.querySelector("#serverStatusDropdown");e&&(e.style.display="block",this.dropdownOpen=!0,setTimeout(()=>{e.classList.add("open")},10))}closeServerStatusDropdown(t){const e=t.querySelector("#serverStatusDropdown");e&&(e.classList.remove("open"),setTimeout(()=>{e.style.display="none",this.dropdownOpen=!1},300))}updateHeaderStatusDot(t){const e=t.querySelector("#headerStatusDot");if(!e)return;const s=()=>{const i=p.isConnected();p.isAuthenticated()?e.className="status-dot online":i?e.className="status-dot connecting":e.className="status-dot offline",this.updatePlayButtonState(t)};s(),window.addEventListener("socket:connected",s),window.addEventListener("socket:disconnected",s),window.addEventListener("socket:authenticated",s),window.addEventListener("socket:auth:error",s),setInterval(s,5e3)}updateActivePage(){const t=window.location.pathname;let e="dashboard";t==="/"||t==="/index.html"?e="home":t.includes("/dashboard")?e="dashboard":t.includes("/profile")?e="profile":t.includes("/missions")?e="missions":t.includes("/marketplace")?e="marketplace":t.includes("/config")&&(e="config"),document.querySelectorAll(".nav-link").forEach(i=>{i.getAttribute("data-page")===e?i.classList.add("active"):i.classList.remove("active")})}addStyles(){if(!document.querySelector('style[data-component="header-navigation"]')){const t=document.createElement("style");t.setAttribute("data-component","header-navigation"),t.textContent=`
        .global-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: var(--z-header, 100);
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 255, 204, 0.2);
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          display: flex;
          align-items: center;
          justify-content: space-between;
          min-height: 60px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        /* Brand */
        .header-brand {
          display: flex;
          align-items: center;
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm, 0.5rem);
          color: var(--primary-cyan, #00ffcc);
          text-decoration: none;
          font-weight: 700;
          font-size: clamp(1.1rem, 3vw, 1.4rem);
          transition: var(--transition-normal, 0.3s);
        }

        .brand-link:hover {
          color: var(--secondary-blue, #0099ff);
          transform: translateY(-1px);
        }

        .brand-icon {
          font-size: 1.5rem;
          animation: float 3s ease-in-out infinite;
        }

        .brand-text {
          font-family: var(--font-primary, Arial);
          letter-spacing: 0.5px;
        }

        /* Navigation */
        .header-nav {
          display: flex;
          align-items: center;
        }

        .nav-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: var(--spacing-md, 1rem);
        }

        .nav-item {
          display: flex;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs, 0.25rem);
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          color: var(--text-secondary, #b0b0b0);
          text-decoration: none;
          font-family: var(--font-secondary, Arial);
          font-weight: 500;
          font-size: var(--text-sm, 0.875rem);
          border-radius: var(--border-radius-md, 0.5rem);
          transition: var(--transition-normal, 0.3s);
          border: 1px solid transparent;
        }

        .nav-link:hover {
          color: var(--primary-cyan, #00ffcc);
          background: rgba(0, 255, 204, 0.1);
          border-color: rgba(0, 255, 204, 0.3);
          transform: translateY(-2px);
        }

        .nav-link.active {
          color: var(--primary-cyan, #00ffcc);
          background: rgba(0, 255, 204, 0.15);
          border-color: rgba(0, 255, 204, 0.4);
          box-shadow: 0 0 10px rgba(0, 255, 204, 0.2);
        }

        /* Play Button - Special styling */
        .nav-link-play {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-color: rgba(16, 185, 129, 0.5);
          color: white !important;
          font-weight: 600;
          position: relative;
        }

        .nav-link-play:hover:not(.disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border-color: rgba(16, 185, 129, 0.8);
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 5px 20px rgba(16, 185, 129, 0.4);
        }
        
        /* Play Button - Disabled state */
        .nav-link-play.disabled {
          background: linear-gradient(135deg, #666, #444);
          border-color: rgba(102, 102, 102, 0.5);
          color: #999 !important;
          cursor: not-allowed;
          opacity: 0.6;
          box-shadow: none;
        }
        
        .nav-link-play.disabled:hover {
          transform: none;
          box-shadow: none;
        }
        
        .play-status-indicator {
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 0.8em;
          background: rgba(255, 0, 0, 0.8);
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .nav-link-play:not(.disabled) .play-status-indicator {
          background: rgba(0, 255, 136, 0.8);
        }

        .nav-link-play .nav-icon {
          animation: pulse 2s ease-in-out infinite;
        }

        /* Multiplayer Button - Destaque especial */
        .nav-link-multiplayer {
          background: linear-gradient(135deg, #ff6b35, #f72585) !important;
          border-color: rgba(255, 107, 53, 0.5) !important;
          color: white !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
          position: relative !important;
          overflow: hidden !important;
          box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3) !important;
          animation: multiplayerGlow 2s ease-in-out infinite !important;
          display: flex !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        .nav-link-multiplayer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          animation: multiplayerShimmer 3s ease-in-out infinite;
        }

        .nav-link-multiplayer:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 6px 25px rgba(255, 107, 53, 0.5);
          background: linear-gradient(135deg, #ff8c42, #ff4c7d);
        }

        .nav-link-multiplayer .nav-icon {
          font-size: 1.3rem;
          animation: pulse 2s ease-in-out infinite;
        }

        .multiplayer-indicator {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff0000;
          color: white;
          font-size: 0.6rem;
          font-weight: 900;
          padding: 2px 4px;
          border-radius: 4px;
          text-transform: uppercase;
          animation: liveBlink 1.5s ease-in-out infinite;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.8);
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @keyframes multiplayerGlow {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);
          }
          50% {
            box-shadow: 0 4px 30px rgba(255, 107, 53, 0.6);
          }
        }

        @keyframes multiplayerShimmer {
          0% { left: -100%; }
          50%, 100% { left: 100%; }
        }

        @keyframes liveBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .nav-icon {
          font-size: 1.1rem;
        }

        /* Server Status Button */
        .nav-link-server {
          position: relative;
          background: none;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .nav-link-server .status-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--text-muted);
        }

        .nav-link-server .status-dot.online {
          background-color: var(--success);
          box-shadow: 0 0 8px var(--success);
          animation: pulse-dot 2s ease-in-out infinite;
        }

        .nav-link-server .status-dot.connecting {
          background-color: #ffa500;
          box-shadow: 0 0 8px #ffa500;
          animation: pulse-dot 1s ease-in-out infinite;
        }

        .nav-link-server .status-dot.offline {
          background-color: var(--text-muted);
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        /* Server Status Dropdown */
        .server-status-dropdown {
          position: fixed;
          top: 70px;
          right: 20px;
          background: rgba(0, 0, 0, 0.95);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: var(--border-radius-lg, 0.75rem);
          padding: 0;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          z-index: 999;
          min-width: 320px;
          max-width: 400px;
          opacity: 0;
          transform: translateY(-10px);
          transition: all 0.3s ease;
        }

        .server-status-dropdown.open {
          opacity: 1;
          transform: translateY(0);
        }

        .server-status-dropdown .server-status-widget {
          margin: 0;
          border: none;
          border-radius: 0;
        }

        /* Actions */
        .header-actions {
          display: flex;
          align-items: center;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs, 0.25rem);
          padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
          background: rgba(255, 107, 107, 0.2);
          border: 1px solid rgba(255, 107, 107, 0.4);
          border-radius: var(--border-radius-md, 0.5rem);
          color: #ff6b6b;
          cursor: pointer;
          font-family: var(--font-secondary, Arial);
          font-weight: 600;
          font-size: var(--text-sm, 0.875rem);
          transition: var(--transition-normal, 0.3s);
        }

        .action-btn:hover {
          background: rgba(255, 107, 107, 0.3);
          border-color: rgba(255, 107, 107, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 0 10px rgba(255, 107, 107, 0.3);
        }

        /* Mobile Menu Toggle */
        .mobile-menu-toggle {
          display: none;
          background: none;
          border: 1px solid rgba(0, 255, 204, 0.3);
          border-radius: var(--border-radius-md, 0.5rem);
          color: var(--primary-cyan, #00ffcc);
          cursor: pointer;
          padding: var(--spacing-sm, 0.5rem);
          font-size: var(--text-lg, 1.25rem);
          transition: var(--transition-normal, 0.3s);
        }

        .mobile-menu-toggle:hover {
          background: rgba(0, 255, 204, 0.1);
          border-color: rgba(0, 255, 204, 0.5);
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .global-header {
            padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
            min-height: 50px;
          }

          .brand-text {
            display: none;
          }

          .nav-list {
            position: fixed;
            top: 100%;
            left: 0;
            right: 0;
            flex-direction: column;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(15px);
            border-top: 1px solid rgba(0, 255, 204, 0.2);
            padding: var(--spacing-md, 1rem);
            gap: var(--spacing-sm, 0.5rem);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
          }

          .nav-list.mobile-open {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .nav-link {
            padding: var(--spacing-md, 1rem);
            font-size: var(--text-base, 1rem);
            justify-content: flex-start;
            border: 1px solid rgba(0, 255, 204, 0.1);
          }

          .nav-link:hover,
          .nav-link.active {
            border-color: rgba(0, 255, 204, 0.4);
          }

          .action-btn .btn-text {
            display: none;
          }

          .mobile-menu-toggle {
            display: block;
          }

          .header-actions {
            margin-right: var(--spacing-sm, 0.5rem);
          }
        }

        @media (max-width: 480px) {
          .global-header {
            padding: var(--spacing-xs, 0.25rem);
          }

          .nav-link {
            padding: var(--spacing-lg, 1.5rem) var(--spacing-md, 1rem);
          }

          .brand-link {
            font-size: 1.1rem;
          }
        }
      `,document.head.appendChild(t)}}updatePlayButtonState(t){const e=t.querySelector(".nav-link-play"),s=t.querySelector(".play-status-indicator");if(!e||!s)return;const i=this.getServerStatus();i.isConnected&&i.isAuthenticated?(e.classList.remove("disabled"),e.title="Jogar",s.textContent="✅",e.onclick=null):(e.classList.add("disabled"),e.title="Servidor não disponível",s.textContent="⚠️",e.onclick=r=>(r.preventDefault(),r.stopPropagation(),alert("Servidor não disponível. Verifique a conexão."),!1))}getServerStatus(){const t=document.querySelector(".server-status-widget");if(t){const e=t.querySelector("[data-status-dot]"),s=t.querySelector("[data-auth-dot]"),i=e&&e.classList.contains("online"),r=s&&s.classList.contains("online");return{isConnected:i,isAuthenticated:r}}return{isConnected:!1,isAuthenticated:!1}}}export{me as H,pe as e};
