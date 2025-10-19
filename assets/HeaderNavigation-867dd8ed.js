import{n as S,a as pe}from"./main-877ad917.js";async function dt(n,e,t=null){var s,i,r,o;try{console.log("🔍 Verificando inicialização do usuário:",e);const{data:a,error:c}=await n.from("user_profiles").select("id").eq("google_email",e).maybeSingle();if(c)throw console.error("❌ Erro ao verificar perfil:",c),new Error("Failed to check user profile: "+c.message);if(a)return console.log("✅ Usuário já inicializado. Profile ID:",a.id),{success:!0,message:"User already initialized",profile_id:a.id};console.log("⚠️ Perfil não encontrado. Inicializando dados do usuário...");const d=((s=t==null?void 0:t.user_metadata)==null?void 0:s.name)||((i=t==null?void 0:t.user_metadata)==null?void 0:i.full_name)||e.split("@")[0],u=((r=t==null?void 0:t.user_metadata)==null?void 0:r.picture)||((o=t==null?void 0:t.user_metadata)==null?void 0:o.avatar_url)||null,y=(t==null?void 0:t.id)||null,{data:w,error:D}=await n.rpc("initialize_user_data",{p_google_email:e,p_display_name:d,p_avatar_url:u,p_auth_user_id:y});if(D)throw console.error("❌ Erro ao inicializar dados do usuário:",D),new Error("Failed to initialize user data: "+D.message);if(!w||w.length===0)throw console.error("❌ Nenhum resultado retornado da inicialização"),new Error("No result returned from initialization");const f=w[0];if(!f.success)throw console.error("❌ Falha na inicialização:",f.message),new Error("Initialization failed: "+f.message);return console.log("✅ Dados do usuário inicializados com sucesso!"),console.log("📊 IDs criados:",{profile_id:f.profile_id,settings_id:f.settings_id,stats_id:f.stats_id,wallet_id:f.wallet_id}),{success:!0,message:f.message,profile_id:f.profile_id,settings_id:f.settings_id,stats_id:f.stats_id,wallet_id:f.wallet_id}}catch(a){throw console.error("❌ Erro em ensureUserInitialized:",a),a}}const b=Object.create(null);b.open="0";b.close="1";b.ping="2";b.pong="3";b.message="4";b.upgrade="5";b.noop="6";const T=Object.create(null);Object.keys(b).forEach(n=>{T[b[n]]=n});const M={type:"error",data:"parser error"},ee=typeof Blob=="function"||typeof Blob<"u"&&Object.prototype.toString.call(Blob)==="[object BlobConstructor]",te=typeof ArrayBuffer=="function",se=n=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(n):n&&n.buffer instanceof ArrayBuffer,H=({type:n,data:e},t,s)=>ee&&e instanceof Blob?t?s(e):X(e,s):te&&(e instanceof ArrayBuffer||se(e))?t?s(e):X(new Blob([e]),s):s(b[n]+(e||"")),X=(n,e)=>{const t=new FileReader;return t.onload=function(){const s=t.result.split(",")[1];e("b"+(s||""))},t.readAsDataURL(n)};function Q(n){return n instanceof Uint8Array?n:n instanceof ArrayBuffer?new Uint8Array(n):new Uint8Array(n.buffer,n.byteOffset,n.byteLength)}let q;function fe(n,e){if(ee&&n.data instanceof Blob)return n.data.arrayBuffer().then(Q).then(e);if(te&&(n.data instanceof ArrayBuffer||se(n.data)))return e(Q(n.data));H(n,!1,t=>{q||(q=new TextEncoder),e(q.encode(t))})}const j="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",x=typeof Uint8Array>"u"?[]:new Uint8Array(256);for(let n=0;n<j.length;n++)x[j.charCodeAt(n)]=n;const ge=n=>{let e=n.length*.75,t=n.length,s,i=0,r,o,a,c;n[n.length-1]==="="&&(e--,n[n.length-2]==="="&&e--);const d=new ArrayBuffer(e),u=new Uint8Array(d);for(s=0;s<t;s+=4)r=x[n.charCodeAt(s)],o=x[n.charCodeAt(s+1)],a=x[n.charCodeAt(s+2)],c=x[n.charCodeAt(s+3)],u[i++]=r<<2|o>>4,u[i++]=(o&15)<<4|a>>2,u[i++]=(a&3)<<6|c&63;return d},me=typeof ArrayBuffer=="function",Y=(n,e)=>{if(typeof n!="string")return{type:"message",data:ne(n,e)};const t=n.charAt(0);return t==="b"?{type:"message",data:ye(n.substring(1),e)}:T[t]?n.length>1?{type:T[t],data:n.substring(1)}:{type:T[t]}:M},ye=(n,e)=>{if(me){const t=ge(n);return ne(t,e)}else return{base64:!0,data:n}},ne=(n,e)=>{switch(e){case"blob":return n instanceof Blob?n:new Blob([n]);case"arraybuffer":default:return n instanceof ArrayBuffer?n:n.buffer}},ie=String.fromCharCode(30),ve=(n,e)=>{const t=n.length,s=new Array(t);let i=0;n.forEach((r,o)=>{H(r,!1,a=>{s[o]=a,++i===t&&e(s.join(ie))})})},be=(n,e)=>{const t=n.split(ie),s=[];for(let i=0;i<t.length;i++){const r=Y(t[i],e);if(s.push(r),r.type==="error")break}return s};function we(){return new TransformStream({transform(n,e){fe(n,t=>{const s=t.length;let i;if(s<126)i=new Uint8Array(1),new DataView(i.buffer).setUint8(0,s);else if(s<65536){i=new Uint8Array(3);const r=new DataView(i.buffer);r.setUint8(0,126),r.setUint16(1,s)}else{i=new Uint8Array(9);const r=new DataView(i.buffer);r.setUint8(0,127),r.setBigUint64(1,BigInt(s))}n.data&&typeof n.data!="string"&&(i[0]|=128),e.enqueue(i),e.enqueue(t)})}})}let P;function C(n){return n.reduce((e,t)=>e+t.length,0)}function A(n,e){if(n[0].length===e)return n.shift();const t=new Uint8Array(e);let s=0;for(let i=0;i<e;i++)t[i]=n[0][s++],s===n[0].length&&(n.shift(),s=0);return n.length&&s<n[0].length&&(n[0]=n[0].slice(s)),t}function _e(n,e){P||(P=new TextDecoder);const t=[];let s=0,i=-1,r=!1;return new TransformStream({transform(o,a){for(t.push(o);;){if(s===0){if(C(t)<1)break;const c=A(t,1);r=(c[0]&128)===128,i=c[0]&127,i<126?s=3:i===126?s=1:s=2}else if(s===1){if(C(t)<2)break;const c=A(t,2);i=new DataView(c.buffer,c.byteOffset,c.length).getUint16(0),s=3}else if(s===2){if(C(t)<8)break;const c=A(t,8),d=new DataView(c.buffer,c.byteOffset,c.length),u=d.getUint32(0);if(u>Math.pow(2,53-32)-1){a.enqueue(M);break}i=u*Math.pow(2,32)+d.getUint32(4),s=3}else{if(C(t)<i)break;const c=A(t,i);a.enqueue(Y(r?c:P.decode(c),e)),s=0}if(i===0||i>n){a.enqueue(M);break}}}})}const re=4;function h(n){if(n)return ke(n)}function ke(n){for(var e in h.prototype)n[e]=h.prototype[e];return n}h.prototype.on=h.prototype.addEventListener=function(n,e){return this._callbacks=this._callbacks||{},(this._callbacks["$"+n]=this._callbacks["$"+n]||[]).push(e),this};h.prototype.once=function(n,e){function t(){this.off(n,t),e.apply(this,arguments)}return t.fn=e,this.on(n,t),this};h.prototype.off=h.prototype.removeListener=h.prototype.removeAllListeners=h.prototype.removeEventListener=function(n,e){if(this._callbacks=this._callbacks||{},arguments.length==0)return this._callbacks={},this;var t=this._callbacks["$"+n];if(!t)return this;if(arguments.length==1)return delete this._callbacks["$"+n],this;for(var s,i=0;i<t.length;i++)if(s=t[i],s===e||s.fn===e){t.splice(i,1);break}return t.length===0&&delete this._callbacks["$"+n],this};h.prototype.emit=function(n){this._callbacks=this._callbacks||{};for(var e=new Array(arguments.length-1),t=this._callbacks["$"+n],s=1;s<arguments.length;s++)e[s-1]=arguments[s];if(t){t=t.slice(0);for(var s=0,i=t.length;s<i;++s)t[s].apply(this,e)}return this};h.prototype.emitReserved=h.prototype.emit;h.prototype.listeners=function(n){return this._callbacks=this._callbacks||{},this._callbacks["$"+n]||[]};h.prototype.hasListeners=function(n){return!!this.listeners(n).length};const O=(()=>typeof Promise=="function"&&typeof Promise.resolve=="function"?e=>Promise.resolve().then(e):(e,t)=>t(e,0))(),g=(()=>typeof self<"u"?self:typeof window<"u"?window:Function("return this")())(),Ee="arraybuffer";function oe(n,...e){return e.reduce((t,s)=>(n.hasOwnProperty(s)&&(t[s]=n[s]),t),{})}const xe=g.setTimeout,Se=g.clearTimeout;function N(n,e){e.useNativeTimers?(n.setTimeoutFn=xe.bind(g),n.clearTimeoutFn=Se.bind(g)):(n.setTimeoutFn=g.setTimeout.bind(g),n.clearTimeoutFn=g.clearTimeout.bind(g))}const Ce=1.33;function Ae(n){return typeof n=="string"?Te(n):Math.ceil((n.byteLength||n.size)*Ce)}function Te(n){let e=0,t=0;for(let s=0,i=n.length;s<i;s++)e=n.charCodeAt(s),e<128?t+=1:e<2048?t+=2:e<55296||e>=57344?t+=3:(s++,t+=4);return t}function ae(){return Date.now().toString(36).substring(3)+Math.random().toString(36).substring(2,5)}function Be(n){let e="";for(let t in n)n.hasOwnProperty(t)&&(e.length&&(e+="&"),e+=encodeURIComponent(t)+"="+encodeURIComponent(n[t]));return e}function Re(n){let e={},t=n.split("&");for(let s=0,i=t.length;s<i;s++){let r=t[s].split("=");e[decodeURIComponent(r[0])]=decodeURIComponent(r[1])}return e}class Le extends Error{constructor(e,t,s){super(e),this.description=t,this.context=s,this.type="TransportError"}}class K extends h{constructor(e){super(),this.writable=!1,N(this,e),this.opts=e,this.query=e.query,this.socket=e.socket,this.supportsBinary=!e.forceBase64}onError(e,t,s){return super.emitReserved("error",new Le(e,t,s)),this}open(){return this.readyState="opening",this.doOpen(),this}close(){return(this.readyState==="opening"||this.readyState==="open")&&(this.doClose(),this.onClose()),this}send(e){this.readyState==="open"&&this.write(e)}onOpen(){this.readyState="open",this.writable=!0,super.emitReserved("open")}onData(e){const t=Y(e,this.socket.binaryType);this.onPacket(t)}onPacket(e){super.emitReserved("packet",e)}onClose(e){this.readyState="closed",super.emitReserved("close",e)}pause(e){}createUri(e,t={}){return e+"://"+this._hostname()+this._port()+this.opts.path+this._query(t)}_hostname(){const e=this.opts.hostname;return e.indexOf(":")===-1?e:"["+e+"]"}_port(){return this.opts.port&&(this.opts.secure&&+(this.opts.port!==443)||!this.opts.secure&&Number(this.opts.port)!==80)?":"+this.opts.port:""}_query(e){const t=Be(e);return t.length?"?"+t:""}}class Oe extends K{constructor(){super(...arguments),this._polling=!1}get name(){return"polling"}doOpen(){this._poll()}pause(e){this.readyState="pausing";const t=()=>{this.readyState="paused",e()};if(this._polling||!this.writable){let s=0;this._polling&&(s++,this.once("pollComplete",function(){--s||t()})),this.writable||(s++,this.once("drain",function(){--s||t()}))}else t()}_poll(){this._polling=!0,this.doPoll(),this.emitReserved("poll")}onData(e){const t=s=>{if(this.readyState==="opening"&&s.type==="open"&&this.onOpen(),s.type==="close")return this.onClose({description:"transport closed by the server"}),!1;this.onPacket(s)};be(e,this.socket.binaryType).forEach(t),this.readyState!=="closed"&&(this._polling=!1,this.emitReserved("pollComplete"),this.readyState==="open"&&this._poll())}doClose(){const e=()=>{this.write([{type:"close"}])};this.readyState==="open"?e():this.once("open",e)}write(e){this.writable=!1,ve(e,t=>{this.doWrite(t,()=>{this.writable=!0,this.emitReserved("drain")})})}uri(){const e=this.opts.secure?"https":"http",t=this.query||{};return this.opts.timestampRequests!==!1&&(t[this.opts.timestampParam]=ae()),!this.supportsBinary&&!t.sid&&(t.b64=1),this.createUri(e,t)}}let ce=!1;try{ce=typeof XMLHttpRequest<"u"&&"withCredentials"in new XMLHttpRequest}catch{}const Ne=ce;function De(){}class qe extends Oe{constructor(e){if(super(e),typeof location<"u"){const t=location.protocol==="https:";let s=location.port;s||(s=t?"443":"80"),this.xd=typeof location<"u"&&e.hostname!==location.hostname||s!==e.port}}doWrite(e,t){const s=this.request({method:"POST",data:e});s.on("success",t),s.on("error",(i,r)=>{this.onError("xhr post error",i,r)})}doPoll(){const e=this.request();e.on("data",this.onData.bind(this)),e.on("error",(t,s)=>{this.onError("xhr poll error",t,s)}),this.pollXhr=e}}class v extends h{constructor(e,t,s){super(),this.createRequest=e,N(this,s),this._opts=s,this._method=s.method||"GET",this._uri=t,this._data=s.data!==void 0?s.data:null,this._create()}_create(){var e;const t=oe(this._opts,"agent","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","autoUnref");t.xdomain=!!this._opts.xd;const s=this._xhr=this.createRequest(t);try{s.open(this._method,this._uri,!0);try{if(this._opts.extraHeaders){s.setDisableHeaderCheck&&s.setDisableHeaderCheck(!0);for(let i in this._opts.extraHeaders)this._opts.extraHeaders.hasOwnProperty(i)&&s.setRequestHeader(i,this._opts.extraHeaders[i])}}catch{}if(this._method==="POST")try{s.setRequestHeader("Content-type","text/plain;charset=UTF-8")}catch{}try{s.setRequestHeader("Accept","*/*")}catch{}(e=this._opts.cookieJar)===null||e===void 0||e.addCookies(s),"withCredentials"in s&&(s.withCredentials=this._opts.withCredentials),this._opts.requestTimeout&&(s.timeout=this._opts.requestTimeout),s.onreadystatechange=()=>{var i;s.readyState===3&&((i=this._opts.cookieJar)===null||i===void 0||i.parseCookies(s.getResponseHeader("set-cookie"))),s.readyState===4&&(s.status===200||s.status===1223?this._onLoad():this.setTimeoutFn(()=>{this._onError(typeof s.status=="number"?s.status:0)},0))},s.send(this._data)}catch(i){this.setTimeoutFn(()=>{this._onError(i)},0);return}typeof document<"u"&&(this._index=v.requestsCount++,v.requests[this._index]=this)}_onError(e){this.emitReserved("error",e,this._xhr),this._cleanup(!0)}_cleanup(e){if(!(typeof this._xhr>"u"||this._xhr===null)){if(this._xhr.onreadystatechange=De,e)try{this._xhr.abort()}catch{}typeof document<"u"&&delete v.requests[this._index],this._xhr=null}}_onLoad(){const e=this._xhr.responseText;e!==null&&(this.emitReserved("data",e),this.emitReserved("success"),this._cleanup())}abort(){this._cleanup()}}v.requestsCount=0;v.requests={};if(typeof document<"u"){if(typeof attachEvent=="function")attachEvent("onunload",G);else if(typeof addEventListener=="function"){const n="onpagehide"in g?"pagehide":"unload";addEventListener(n,G,!1)}}function G(){for(let n in v.requests)v.requests.hasOwnProperty(n)&&v.requests[n].abort()}const Pe=function(){const n=le({xdomain:!1});return n&&n.responseType!==null}();class Ie extends qe{constructor(e){super(e);const t=e&&e.forceBase64;this.supportsBinary=Pe&&!t}request(e={}){return Object.assign(e,{xd:this.xd},this.opts),new v(le,this.uri(),e)}}function le(n){const e=n.xdomain;try{if(typeof XMLHttpRequest<"u"&&(!e||Ne))return new XMLHttpRequest}catch{}if(!e)try{return new g[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP")}catch{}}const he=typeof navigator<"u"&&typeof navigator.product=="string"&&navigator.product.toLowerCase()==="reactnative";class Me extends K{get name(){return"websocket"}doOpen(){const e=this.uri(),t=this.opts.protocols,s=he?{}:oe(this.opts,"agent","perMessageDeflate","pfx","key","passphrase","cert","ca","ciphers","rejectUnauthorized","localAddress","protocolVersion","origin","maxPayload","family","checkServerIdentity");this.opts.extraHeaders&&(s.headers=this.opts.extraHeaders);try{this.ws=this.createSocket(e,t,s)}catch(i){return this.emitReserved("error",i)}this.ws.binaryType=this.socket.binaryType,this.addEventListeners()}addEventListeners(){this.ws.onopen=()=>{this.opts.autoUnref&&this.ws._socket.unref(),this.onOpen()},this.ws.onclose=e=>this.onClose({description:"websocket connection closed",context:e}),this.ws.onmessage=e=>this.onData(e.data),this.ws.onerror=e=>this.onError("websocket error",e)}write(e){this.writable=!1;for(let t=0;t<e.length;t++){const s=e[t],i=t===e.length-1;H(s,this.supportsBinary,r=>{try{this.doWrite(s,r)}catch{}i&&O(()=>{this.writable=!0,this.emitReserved("drain")},this.setTimeoutFn)})}}doClose(){typeof this.ws<"u"&&(this.ws.onerror=()=>{},this.ws.close(),this.ws=null)}uri(){const e=this.opts.secure?"wss":"ws",t=this.query||{};return this.opts.timestampRequests&&(t[this.opts.timestampParam]=ae()),this.supportsBinary||(t.b64=1),this.createUri(e,t)}}const I=g.WebSocket||g.MozWebSocket;class Ue extends Me{createSocket(e,t,s){return he?new I(e,t,s):t?new I(e,t):new I(e)}doWrite(e,t){this.ws.send(t)}}class ze extends K{get name(){return"webtransport"}doOpen(){try{this._transport=new WebTransport(this.createUri("https"),this.opts.transportOptions[this.name])}catch(e){return this.emitReserved("error",e)}this._transport.closed.then(()=>{this.onClose()}).catch(e=>{this.onError("webtransport error",e)}),this._transport.ready.then(()=>{this._transport.createBidirectionalStream().then(e=>{const t=_e(Number.MAX_SAFE_INTEGER,this.socket.binaryType),s=e.readable.pipeThrough(t).getReader(),i=we();i.readable.pipeTo(e.writable),this._writer=i.writable.getWriter();const r=()=>{s.read().then(({done:a,value:c})=>{a||(this.onPacket(c),r())}).catch(a=>{})};r();const o={type:"open"};this.query.sid&&(o.data=`{"sid":"${this.query.sid}"}`),this._writer.write(o).then(()=>this.onOpen())})})}write(e){this.writable=!1;for(let t=0;t<e.length;t++){const s=e[t],i=t===e.length-1;this._writer.write(s).then(()=>{i&&O(()=>{this.writable=!0,this.emitReserved("drain")},this.setTimeoutFn)})}}doClose(){var e;(e=this._transport)===null||e===void 0||e.close()}}const $e={websocket:Ue,webtransport:ze,polling:Ie},Ve=/^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,Fe=["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"];function U(n){if(n.length>8e3)throw"URI too long";const e=n,t=n.indexOf("["),s=n.indexOf("]");t!=-1&&s!=-1&&(n=n.substring(0,t)+n.substring(t,s).replace(/:/g,";")+n.substring(s,n.length));let i=Ve.exec(n||""),r={},o=14;for(;o--;)r[Fe[o]]=i[o]||"";return t!=-1&&s!=-1&&(r.source=e,r.host=r.host.substring(1,r.host.length-1).replace(/;/g,":"),r.authority=r.authority.replace("[","").replace("]","").replace(/;/g,":"),r.ipv6uri=!0),r.pathNames=He(r,r.path),r.queryKey=Ye(r,r.query),r}function He(n,e){const t=/\/{2,9}/g,s=e.replace(t,"/").split("/");return(e.slice(0,1)=="/"||e.length===0)&&s.splice(0,1),e.slice(-1)=="/"&&s.splice(s.length-1,1),s}function Ye(n,e){const t={};return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g,function(s,i,r){i&&(t[i]=r)}),t}const z=typeof addEventListener=="function"&&typeof removeEventListener=="function",B=[];z&&addEventListener("offline",()=>{B.forEach(n=>n())},!1);class _ extends h{constructor(e,t){if(super(),this.binaryType=Ee,this.writeBuffer=[],this._prevBufferLen=0,this._pingInterval=-1,this._pingTimeout=-1,this._maxPayload=-1,this._pingTimeoutTime=1/0,e&&typeof e=="object"&&(t=e,e=null),e){const s=U(e);t.hostname=s.host,t.secure=s.protocol==="https"||s.protocol==="wss",t.port=s.port,s.query&&(t.query=s.query)}else t.host&&(t.hostname=U(t.host).host);N(this,t),this.secure=t.secure!=null?t.secure:typeof location<"u"&&location.protocol==="https:",t.hostname&&!t.port&&(t.port=this.secure?"443":"80"),this.hostname=t.hostname||(typeof location<"u"?location.hostname:"localhost"),this.port=t.port||(typeof location<"u"&&location.port?location.port:this.secure?"443":"80"),this.transports=[],this._transportsByName={},t.transports.forEach(s=>{const i=s.prototype.name;this.transports.push(i),this._transportsByName[i]=s}),this.opts=Object.assign({path:"/engine.io",agent:!1,withCredentials:!1,upgrade:!0,timestampParam:"t",rememberUpgrade:!1,addTrailingSlash:!0,rejectUnauthorized:!0,perMessageDeflate:{threshold:1024},transportOptions:{},closeOnBeforeunload:!1},t),this.opts.path=this.opts.path.replace(/\/$/,"")+(this.opts.addTrailingSlash?"/":""),typeof this.opts.query=="string"&&(this.opts.query=Re(this.opts.query)),z&&(this.opts.closeOnBeforeunload&&(this._beforeunloadEventListener=()=>{this.transport&&(this.transport.removeAllListeners(),this.transport.close())},addEventListener("beforeunload",this._beforeunloadEventListener,!1)),this.hostname!=="localhost"&&(this._offlineEventListener=()=>{this._onClose("transport close",{description:"network connection lost"})},B.push(this._offlineEventListener))),this.opts.withCredentials&&(this._cookieJar=void 0),this._open()}createTransport(e){const t=Object.assign({},this.opts.query);t.EIO=re,t.transport=e,this.id&&(t.sid=this.id);const s=Object.assign({},this.opts,{query:t,socket:this,hostname:this.hostname,secure:this.secure,port:this.port},this.opts.transportOptions[e]);return new this._transportsByName[e](s)}_open(){if(this.transports.length===0){this.setTimeoutFn(()=>{this.emitReserved("error","No transports available")},0);return}const e=this.opts.rememberUpgrade&&_.priorWebsocketSuccess&&this.transports.indexOf("websocket")!==-1?"websocket":this.transports[0];this.readyState="opening";const t=this.createTransport(e);t.open(),this.setTransport(t)}setTransport(e){this.transport&&this.transport.removeAllListeners(),this.transport=e,e.on("drain",this._onDrain.bind(this)).on("packet",this._onPacket.bind(this)).on("error",this._onError.bind(this)).on("close",t=>this._onClose("transport close",t))}onOpen(){this.readyState="open",_.priorWebsocketSuccess=this.transport.name==="websocket",this.emitReserved("open"),this.flush()}_onPacket(e){if(this.readyState==="opening"||this.readyState==="open"||this.readyState==="closing")switch(this.emitReserved("packet",e),this.emitReserved("heartbeat"),e.type){case"open":this.onHandshake(JSON.parse(e.data));break;case"ping":this._sendPacket("pong"),this.emitReserved("ping"),this.emitReserved("pong"),this._resetPingTimeout();break;case"error":const t=new Error("server error");t.code=e.data,this._onError(t);break;case"message":this.emitReserved("data",e.data),this.emitReserved("message",e.data);break}}onHandshake(e){this.emitReserved("handshake",e),this.id=e.sid,this.transport.query.sid=e.sid,this._pingInterval=e.pingInterval,this._pingTimeout=e.pingTimeout,this._maxPayload=e.maxPayload,this.onOpen(),this.readyState!=="closed"&&this._resetPingTimeout()}_resetPingTimeout(){this.clearTimeoutFn(this._pingTimeoutTimer);const e=this._pingInterval+this._pingTimeout;this._pingTimeoutTime=Date.now()+e,this._pingTimeoutTimer=this.setTimeoutFn(()=>{this._onClose("ping timeout")},e),this.opts.autoUnref&&this._pingTimeoutTimer.unref()}_onDrain(){this.writeBuffer.splice(0,this._prevBufferLen),this._prevBufferLen=0,this.writeBuffer.length===0?this.emitReserved("drain"):this.flush()}flush(){if(this.readyState!=="closed"&&this.transport.writable&&!this.upgrading&&this.writeBuffer.length){const e=this._getWritablePackets();this.transport.send(e),this._prevBufferLen=e.length,this.emitReserved("flush")}}_getWritablePackets(){if(!(this._maxPayload&&this.transport.name==="polling"&&this.writeBuffer.length>1))return this.writeBuffer;let t=1;for(let s=0;s<this.writeBuffer.length;s++){const i=this.writeBuffer[s].data;if(i&&(t+=Ae(i)),s>0&&t>this._maxPayload)return this.writeBuffer.slice(0,s);t+=2}return this.writeBuffer}_hasPingExpired(){if(!this._pingTimeoutTime)return!0;const e=Date.now()>this._pingTimeoutTime;return e&&(this._pingTimeoutTime=0,O(()=>{this._onClose("ping timeout")},this.setTimeoutFn)),e}write(e,t,s){return this._sendPacket("message",e,t,s),this}send(e,t,s){return this._sendPacket("message",e,t,s),this}_sendPacket(e,t,s,i){if(typeof t=="function"&&(i=t,t=void 0),typeof s=="function"&&(i=s,s=null),this.readyState==="closing"||this.readyState==="closed")return;s=s||{},s.compress=s.compress!==!1;const r={type:e,data:t,options:s};this.emitReserved("packetCreate",r),this.writeBuffer.push(r),i&&this.once("flush",i),this.flush()}close(){const e=()=>{this._onClose("forced close"),this.transport.close()},t=()=>{this.off("upgrade",t),this.off("upgradeError",t),e()},s=()=>{this.once("upgrade",t),this.once("upgradeError",t)};return(this.readyState==="opening"||this.readyState==="open")&&(this.readyState="closing",this.writeBuffer.length?this.once("drain",()=>{this.upgrading?s():e()}):this.upgrading?s():e()),this}_onError(e){if(_.priorWebsocketSuccess=!1,this.opts.tryAllTransports&&this.transports.length>1&&this.readyState==="opening")return this.transports.shift(),this._open();this.emitReserved("error",e),this._onClose("transport error",e)}_onClose(e,t){if(this.readyState==="opening"||this.readyState==="open"||this.readyState==="closing"){if(this.clearTimeoutFn(this._pingTimeoutTimer),this.transport.removeAllListeners("close"),this.transport.close(),this.transport.removeAllListeners(),z&&(this._beforeunloadEventListener&&removeEventListener("beforeunload",this._beforeunloadEventListener,!1),this._offlineEventListener)){const s=B.indexOf(this._offlineEventListener);s!==-1&&B.splice(s,1)}this.readyState="closed",this.id=null,this.emitReserved("close",e,t),this.writeBuffer=[],this._prevBufferLen=0}}}_.protocol=re;class Ke extends _{constructor(){super(...arguments),this._upgrades=[]}onOpen(){if(super.onOpen(),this.readyState==="open"&&this.opts.upgrade)for(let e=0;e<this._upgrades.length;e++)this._probe(this._upgrades[e])}_probe(e){let t=this.createTransport(e),s=!1;_.priorWebsocketSuccess=!1;const i=()=>{s||(t.send([{type:"ping",data:"probe"}]),t.once("packet",y=>{if(!s)if(y.type==="pong"&&y.data==="probe"){if(this.upgrading=!0,this.emitReserved("upgrading",t),!t)return;_.priorWebsocketSuccess=t.name==="websocket",this.transport.pause(()=>{s||this.readyState!=="closed"&&(u(),this.setTransport(t),t.send([{type:"upgrade"}]),this.emitReserved("upgrade",t),t=null,this.upgrading=!1,this.flush())})}else{const w=new Error("probe error");w.transport=t.name,this.emitReserved("upgradeError",w)}}))};function r(){s||(s=!0,u(),t.close(),t=null)}const o=y=>{const w=new Error("probe error: "+y);w.transport=t.name,r(),this.emitReserved("upgradeError",w)};function a(){o("transport closed")}function c(){o("socket closed")}function d(y){t&&y.name!==t.name&&r()}const u=()=>{t.removeListener("open",i),t.removeListener("error",o),t.removeListener("close",a),this.off("close",c),this.off("upgrading",d)};t.once("open",i),t.once("error",o),t.once("close",a),this.once("close",c),this.once("upgrading",d),this._upgrades.indexOf("webtransport")!==-1&&e!=="webtransport"?this.setTimeoutFn(()=>{s||t.open()},200):t.open()}onHandshake(e){this._upgrades=this._filterUpgrades(e.upgrades),super.onHandshake(e)}_filterUpgrades(e){const t=[];for(let s=0;s<e.length;s++)~this.transports.indexOf(e[s])&&t.push(e[s]);return t}}let We=class extends Ke{constructor(e,t={}){const s=typeof e=="object"?e:t;(!s.transports||s.transports&&typeof s.transports[0]=="string")&&(s.transports=(s.transports||["polling","websocket","webtransport"]).map(i=>$e[i]).filter(i=>!!i)),super(e,s)}};function Je(n,e="",t){let s=n;t=t||typeof location<"u"&&location,n==null&&(n=t.protocol+"//"+t.host),typeof n=="string"&&(n.charAt(0)==="/"&&(n.charAt(1)==="/"?n=t.protocol+n:n=t.host+n),/^(https?|wss?):\/\//.test(n)||(typeof t<"u"?n=t.protocol+"//"+n:n="https://"+n),s=U(n)),s.port||(/^(http|ws)$/.test(s.protocol)?s.port="80":/^(http|ws)s$/.test(s.protocol)&&(s.port="443")),s.path=s.path||"/";const r=s.host.indexOf(":")!==-1?"["+s.host+"]":s.host;return s.id=s.protocol+"://"+r+":"+s.port+e,s.href=s.protocol+"://"+r+(t&&t.port===s.port?"":":"+s.port),s}const Xe=typeof ArrayBuffer=="function",Qe=n=>typeof ArrayBuffer.isView=="function"?ArrayBuffer.isView(n):n.buffer instanceof ArrayBuffer,de=Object.prototype.toString,je=typeof Blob=="function"||typeof Blob<"u"&&de.call(Blob)==="[object BlobConstructor]",Ge=typeof File=="function"||typeof File<"u"&&de.call(File)==="[object FileConstructor]";function W(n){return Xe&&(n instanceof ArrayBuffer||Qe(n))||je&&n instanceof Blob||Ge&&n instanceof File}function R(n,e){if(!n||typeof n!="object")return!1;if(Array.isArray(n)){for(let t=0,s=n.length;t<s;t++)if(R(n[t]))return!0;return!1}if(W(n))return!0;if(n.toJSON&&typeof n.toJSON=="function"&&arguments.length===1)return R(n.toJSON(),!0);for(const t in n)if(Object.prototype.hasOwnProperty.call(n,t)&&R(n[t]))return!0;return!1}function Ze(n){const e=[],t=n.data,s=n;return s.data=$(t,e),s.attachments=e.length,{packet:s,buffers:e}}function $(n,e){if(!n)return n;if(W(n)){const t={_placeholder:!0,num:e.length};return e.push(n),t}else if(Array.isArray(n)){const t=new Array(n.length);for(let s=0;s<n.length;s++)t[s]=$(n[s],e);return t}else if(typeof n=="object"&&!(n instanceof Date)){const t={};for(const s in n)Object.prototype.hasOwnProperty.call(n,s)&&(t[s]=$(n[s],e));return t}return n}function et(n,e){return n.data=V(n.data,e),delete n.attachments,n}function V(n,e){if(!n)return n;if(n&&n._placeholder===!0){if(typeof n.num=="number"&&n.num>=0&&n.num<e.length)return e[n.num];throw new Error("illegal attachments")}else if(Array.isArray(n))for(let t=0;t<n.length;t++)n[t]=V(n[t],e);else if(typeof n=="object")for(const t in n)Object.prototype.hasOwnProperty.call(n,t)&&(n[t]=V(n[t],e));return n}const tt=["connect","connect_error","disconnect","disconnecting","newListener","removeListener"],st=5;var l;(function(n){n[n.CONNECT=0]="CONNECT",n[n.DISCONNECT=1]="DISCONNECT",n[n.EVENT=2]="EVENT",n[n.ACK=3]="ACK",n[n.CONNECT_ERROR=4]="CONNECT_ERROR",n[n.BINARY_EVENT=5]="BINARY_EVENT",n[n.BINARY_ACK=6]="BINARY_ACK"})(l||(l={}));class nt{constructor(e){this.replacer=e}encode(e){return(e.type===l.EVENT||e.type===l.ACK)&&R(e)?this.encodeAsBinary({type:e.type===l.EVENT?l.BINARY_EVENT:l.BINARY_ACK,nsp:e.nsp,data:e.data,id:e.id}):[this.encodeAsString(e)]}encodeAsString(e){let t=""+e.type;return(e.type===l.BINARY_EVENT||e.type===l.BINARY_ACK)&&(t+=e.attachments+"-"),e.nsp&&e.nsp!=="/"&&(t+=e.nsp+","),e.id!=null&&(t+=e.id),e.data!=null&&(t+=JSON.stringify(e.data,this.replacer)),t}encodeAsBinary(e){const t=Ze(e),s=this.encodeAsString(t.packet),i=t.buffers;return i.unshift(s),i}}function Z(n){return Object.prototype.toString.call(n)==="[object Object]"}class J extends h{constructor(e){super(),this.reviver=e}add(e){let t;if(typeof e=="string"){if(this.reconstructor)throw new Error("got plaintext data when reconstructing a packet");t=this.decodeString(e);const s=t.type===l.BINARY_EVENT;s||t.type===l.BINARY_ACK?(t.type=s?l.EVENT:l.ACK,this.reconstructor=new it(t),t.attachments===0&&super.emitReserved("decoded",t)):super.emitReserved("decoded",t)}else if(W(e)||e.base64)if(this.reconstructor)t=this.reconstructor.takeBinaryData(e),t&&(this.reconstructor=null,super.emitReserved("decoded",t));else throw new Error("got binary data when not reconstructing a packet");else throw new Error("Unknown type: "+e)}decodeString(e){let t=0;const s={type:Number(e.charAt(0))};if(l[s.type]===void 0)throw new Error("unknown packet type "+s.type);if(s.type===l.BINARY_EVENT||s.type===l.BINARY_ACK){const r=t+1;for(;e.charAt(++t)!=="-"&&t!=e.length;);const o=e.substring(r,t);if(o!=Number(o)||e.charAt(t)!=="-")throw new Error("Illegal attachments");s.attachments=Number(o)}if(e.charAt(t+1)==="/"){const r=t+1;for(;++t&&!(e.charAt(t)===","||t===e.length););s.nsp=e.substring(r,t)}else s.nsp="/";const i=e.charAt(t+1);if(i!==""&&Number(i)==i){const r=t+1;for(;++t;){const o=e.charAt(t);if(o==null||Number(o)!=o){--t;break}if(t===e.length)break}s.id=Number(e.substring(r,t+1))}if(e.charAt(++t)){const r=this.tryParse(e.substr(t));if(J.isPayloadValid(s.type,r))s.data=r;else throw new Error("invalid payload")}return s}tryParse(e){try{return JSON.parse(e,this.reviver)}catch{return!1}}static isPayloadValid(e,t){switch(e){case l.CONNECT:return Z(t);case l.DISCONNECT:return t===void 0;case l.CONNECT_ERROR:return typeof t=="string"||Z(t);case l.EVENT:case l.BINARY_EVENT:return Array.isArray(t)&&(typeof t[0]=="number"||typeof t[0]=="string"&&tt.indexOf(t[0])===-1);case l.ACK:case l.BINARY_ACK:return Array.isArray(t)}}destroy(){this.reconstructor&&(this.reconstructor.finishedReconstruction(),this.reconstructor=null)}}class it{constructor(e){this.packet=e,this.buffers=[],this.reconPack=e}takeBinaryData(e){if(this.buffers.push(e),this.buffers.length===this.reconPack.attachments){const t=et(this.reconPack,this.buffers);return this.finishedReconstruction(),t}return null}finishedReconstruction(){this.reconPack=null,this.buffers=[]}}const rt=Object.freeze(Object.defineProperty({__proto__:null,Decoder:J,Encoder:nt,get PacketType(){return l},protocol:st},Symbol.toStringTag,{value:"Module"}));function m(n,e,t){return n.on(e,t),function(){n.off(e,t)}}const ot=Object.freeze({connect:1,connect_error:1,disconnect:1,disconnecting:1,newListener:1,removeListener:1});class ue extends h{constructor(e,t,s){super(),this.connected=!1,this.recovered=!1,this.receiveBuffer=[],this.sendBuffer=[],this._queue=[],this._queueSeq=0,this.ids=0,this.acks={},this.flags={},this.io=e,this.nsp=t,s&&s.auth&&(this.auth=s.auth),this._opts=Object.assign({},s),this.io._autoConnect&&this.open()}get disconnected(){return!this.connected}subEvents(){if(this.subs)return;const e=this.io;this.subs=[m(e,"open",this.onopen.bind(this)),m(e,"packet",this.onpacket.bind(this)),m(e,"error",this.onerror.bind(this)),m(e,"close",this.onclose.bind(this))]}get active(){return!!this.subs}connect(){return this.connected?this:(this.subEvents(),this.io._reconnecting||this.io.open(),this.io._readyState==="open"&&this.onopen(),this)}open(){return this.connect()}send(...e){return e.unshift("message"),this.emit.apply(this,e),this}emit(e,...t){var s,i,r;if(ot.hasOwnProperty(e))throw new Error('"'+e.toString()+'" is a reserved event name');if(t.unshift(e),this._opts.retries&&!this.flags.fromQueue&&!this.flags.volatile)return this._addToQueue(t),this;const o={type:l.EVENT,data:t};if(o.options={},o.options.compress=this.flags.compress!==!1,typeof t[t.length-1]=="function"){const u=this.ids++,y=t.pop();this._registerAckCallback(u,y),o.id=u}const a=(i=(s=this.io.engine)===null||s===void 0?void 0:s.transport)===null||i===void 0?void 0:i.writable,c=this.connected&&!(!((r=this.io.engine)===null||r===void 0)&&r._hasPingExpired());return this.flags.volatile&&!a||(c?(this.notifyOutgoingListeners(o),this.packet(o)):this.sendBuffer.push(o)),this.flags={},this}_registerAckCallback(e,t){var s;const i=(s=this.flags.timeout)!==null&&s!==void 0?s:this._opts.ackTimeout;if(i===void 0){this.acks[e]=t;return}const r=this.io.setTimeoutFn(()=>{delete this.acks[e];for(let a=0;a<this.sendBuffer.length;a++)this.sendBuffer[a].id===e&&this.sendBuffer.splice(a,1);t.call(this,new Error("operation has timed out"))},i),o=(...a)=>{this.io.clearTimeoutFn(r),t.apply(this,a)};o.withError=!0,this.acks[e]=o}emitWithAck(e,...t){return new Promise((s,i)=>{const r=(o,a)=>o?i(o):s(a);r.withError=!0,t.push(r),this.emit(e,...t)})}_addToQueue(e){let t;typeof e[e.length-1]=="function"&&(t=e.pop());const s={id:this._queueSeq++,tryCount:0,pending:!1,args:e,flags:Object.assign({fromQueue:!0},this.flags)};e.push((i,...r)=>s!==this._queue[0]?void 0:(i!==null?s.tryCount>this._opts.retries&&(this._queue.shift(),t&&t(i)):(this._queue.shift(),t&&t(null,...r)),s.pending=!1,this._drainQueue())),this._queue.push(s),this._drainQueue()}_drainQueue(e=!1){if(!this.connected||this._queue.length===0)return;const t=this._queue[0];t.pending&&!e||(t.pending=!0,t.tryCount++,this.flags=t.flags,this.emit.apply(this,t.args))}packet(e){e.nsp=this.nsp,this.io._packet(e)}onopen(){typeof this.auth=="function"?this.auth(e=>{this._sendConnectPacket(e)}):this._sendConnectPacket(this.auth)}_sendConnectPacket(e){this.packet({type:l.CONNECT,data:this._pid?Object.assign({pid:this._pid,offset:this._lastOffset},e):e})}onerror(e){this.connected||this.emitReserved("connect_error",e)}onclose(e,t){this.connected=!1,delete this.id,this.emitReserved("disconnect",e,t),this._clearAcks()}_clearAcks(){Object.keys(this.acks).forEach(e=>{if(!this.sendBuffer.some(s=>String(s.id)===e)){const s=this.acks[e];delete this.acks[e],s.withError&&s.call(this,new Error("socket has been disconnected"))}})}onpacket(e){if(e.nsp===this.nsp)switch(e.type){case l.CONNECT:e.data&&e.data.sid?this.onconnect(e.data.sid,e.data.pid):this.emitReserved("connect_error",new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));break;case l.EVENT:case l.BINARY_EVENT:this.onevent(e);break;case l.ACK:case l.BINARY_ACK:this.onack(e);break;case l.DISCONNECT:this.ondisconnect();break;case l.CONNECT_ERROR:this.destroy();const s=new Error(e.data.message);s.data=e.data.data,this.emitReserved("connect_error",s);break}}onevent(e){const t=e.data||[];e.id!=null&&t.push(this.ack(e.id)),this.connected?this.emitEvent(t):this.receiveBuffer.push(Object.freeze(t))}emitEvent(e){if(this._anyListeners&&this._anyListeners.length){const t=this._anyListeners.slice();for(const s of t)s.apply(this,e)}super.emit.apply(this,e),this._pid&&e.length&&typeof e[e.length-1]=="string"&&(this._lastOffset=e[e.length-1])}ack(e){const t=this;let s=!1;return function(...i){s||(s=!0,t.packet({type:l.ACK,id:e,data:i}))}}onack(e){const t=this.acks[e.id];typeof t=="function"&&(delete this.acks[e.id],t.withError&&e.data.unshift(null),t.apply(this,e.data))}onconnect(e,t){this.id=e,this.recovered=t&&this._pid===t,this._pid=t,this.connected=!0,this.emitBuffered(),this.emitReserved("connect"),this._drainQueue(!0)}emitBuffered(){this.receiveBuffer.forEach(e=>this.emitEvent(e)),this.receiveBuffer=[],this.sendBuffer.forEach(e=>{this.notifyOutgoingListeners(e),this.packet(e)}),this.sendBuffer=[]}ondisconnect(){this.destroy(),this.onclose("io server disconnect")}destroy(){this.subs&&(this.subs.forEach(e=>e()),this.subs=void 0),this.io._destroy(this)}disconnect(){return this.connected&&this.packet({type:l.DISCONNECT}),this.destroy(),this.connected&&this.onclose("io client disconnect"),this}close(){return this.disconnect()}compress(e){return this.flags.compress=e,this}get volatile(){return this.flags.volatile=!0,this}timeout(e){return this.flags.timeout=e,this}onAny(e){return this._anyListeners=this._anyListeners||[],this._anyListeners.push(e),this}prependAny(e){return this._anyListeners=this._anyListeners||[],this._anyListeners.unshift(e),this}offAny(e){if(!this._anyListeners)return this;if(e){const t=this._anyListeners;for(let s=0;s<t.length;s++)if(e===t[s])return t.splice(s,1),this}else this._anyListeners=[];return this}listenersAny(){return this._anyListeners||[]}onAnyOutgoing(e){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.push(e),this}prependAnyOutgoing(e){return this._anyOutgoingListeners=this._anyOutgoingListeners||[],this._anyOutgoingListeners.unshift(e),this}offAnyOutgoing(e){if(!this._anyOutgoingListeners)return this;if(e){const t=this._anyOutgoingListeners;for(let s=0;s<t.length;s++)if(e===t[s])return t.splice(s,1),this}else this._anyOutgoingListeners=[];return this}listenersAnyOutgoing(){return this._anyOutgoingListeners||[]}notifyOutgoingListeners(e){if(this._anyOutgoingListeners&&this._anyOutgoingListeners.length){const t=this._anyOutgoingListeners.slice();for(const s of t)s.apply(this,e.data)}}}function k(n){n=n||{},this.ms=n.min||100,this.max=n.max||1e4,this.factor=n.factor||2,this.jitter=n.jitter>0&&n.jitter<=1?n.jitter:0,this.attempts=0}k.prototype.duration=function(){var n=this.ms*Math.pow(this.factor,this.attempts++);if(this.jitter){var e=Math.random(),t=Math.floor(e*this.jitter*n);n=Math.floor(e*10)&1?n+t:n-t}return Math.min(n,this.max)|0};k.prototype.reset=function(){this.attempts=0};k.prototype.setMin=function(n){this.ms=n};k.prototype.setMax=function(n){this.max=n};k.prototype.setJitter=function(n){this.jitter=n};class F extends h{constructor(e,t){var s;super(),this.nsps={},this.subs=[],e&&typeof e=="object"&&(t=e,e=void 0),t=t||{},t.path=t.path||"/socket.io",this.opts=t,N(this,t),this.reconnection(t.reconnection!==!1),this.reconnectionAttempts(t.reconnectionAttempts||1/0),this.reconnectionDelay(t.reconnectionDelay||1e3),this.reconnectionDelayMax(t.reconnectionDelayMax||5e3),this.randomizationFactor((s=t.randomizationFactor)!==null&&s!==void 0?s:.5),this.backoff=new k({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()}),this.timeout(t.timeout==null?2e4:t.timeout),this._readyState="closed",this.uri=e;const i=t.parser||rt;this.encoder=new i.Encoder,this.decoder=new i.Decoder,this._autoConnect=t.autoConnect!==!1,this._autoConnect&&this.open()}reconnection(e){return arguments.length?(this._reconnection=!!e,e||(this.skipReconnect=!0),this):this._reconnection}reconnectionAttempts(e){return e===void 0?this._reconnectionAttempts:(this._reconnectionAttempts=e,this)}reconnectionDelay(e){var t;return e===void 0?this._reconnectionDelay:(this._reconnectionDelay=e,(t=this.backoff)===null||t===void 0||t.setMin(e),this)}randomizationFactor(e){var t;return e===void 0?this._randomizationFactor:(this._randomizationFactor=e,(t=this.backoff)===null||t===void 0||t.setJitter(e),this)}reconnectionDelayMax(e){var t;return e===void 0?this._reconnectionDelayMax:(this._reconnectionDelayMax=e,(t=this.backoff)===null||t===void 0||t.setMax(e),this)}timeout(e){return arguments.length?(this._timeout=e,this):this._timeout}maybeReconnectOnOpen(){!this._reconnecting&&this._reconnection&&this.backoff.attempts===0&&this.reconnect()}open(e){if(~this._readyState.indexOf("open"))return this;this.engine=new We(this.uri,this.opts);const t=this.engine,s=this;this._readyState="opening",this.skipReconnect=!1;const i=m(t,"open",function(){s.onopen(),e&&e()}),r=a=>{this.cleanup(),this._readyState="closed",this.emitReserved("error",a),e?e(a):this.maybeReconnectOnOpen()},o=m(t,"error",r);if(this._timeout!==!1){const a=this._timeout,c=this.setTimeoutFn(()=>{i(),r(new Error("timeout")),t.close()},a);this.opts.autoUnref&&c.unref(),this.subs.push(()=>{this.clearTimeoutFn(c)})}return this.subs.push(i),this.subs.push(o),this}connect(e){return this.open(e)}onopen(){this.cleanup(),this._readyState="open",this.emitReserved("open");const e=this.engine;this.subs.push(m(e,"ping",this.onping.bind(this)),m(e,"data",this.ondata.bind(this)),m(e,"error",this.onerror.bind(this)),m(e,"close",this.onclose.bind(this)),m(this.decoder,"decoded",this.ondecoded.bind(this)))}onping(){this.emitReserved("ping")}ondata(e){try{this.decoder.add(e)}catch(t){this.onclose("parse error",t)}}ondecoded(e){O(()=>{this.emitReserved("packet",e)},this.setTimeoutFn)}onerror(e){this.emitReserved("error",e)}socket(e,t){let s=this.nsps[e];return s?this._autoConnect&&!s.active&&s.connect():(s=new ue(this,e,t),this.nsps[e]=s),s}_destroy(e){const t=Object.keys(this.nsps);for(const s of t)if(this.nsps[s].active)return;this._close()}_packet(e){const t=this.encoder.encode(e);for(let s=0;s<t.length;s++)this.engine.write(t[s],e.options)}cleanup(){this.subs.forEach(e=>e()),this.subs.length=0,this.decoder.destroy()}_close(){this.skipReconnect=!0,this._reconnecting=!1,this.onclose("forced close")}disconnect(){return this._close()}onclose(e,t){var s;this.cleanup(),(s=this.engine)===null||s===void 0||s.close(),this.backoff.reset(),this._readyState="closed",this.emitReserved("close",e,t),this._reconnection&&!this.skipReconnect&&this.reconnect()}reconnect(){if(this._reconnecting||this.skipReconnect)return this;const e=this;if(this.backoff.attempts>=this._reconnectionAttempts)this.backoff.reset(),this.emitReserved("reconnect_failed"),this._reconnecting=!1;else{const t=this.backoff.duration();this._reconnecting=!0;const s=this.setTimeoutFn(()=>{e.skipReconnect||(this.emitReserved("reconnect_attempt",e.backoff.attempts),!e.skipReconnect&&e.open(i=>{i?(e._reconnecting=!1,e.reconnect(),this.emitReserved("reconnect_error",i)):e.onreconnect()}))},t);this.opts.autoUnref&&s.unref(),this.subs.push(()=>{this.clearTimeoutFn(s)})}}onreconnect(){const e=this.backoff.attempts;this._reconnecting=!1,this.backoff.reset(),this.emitReserved("reconnect",e)}}const E={};function L(n,e){typeof n=="object"&&(e=n,n=void 0),e=e||{};const t=Je(n,e.path||"/socket.io"),s=t.source,i=t.id,r=t.path,o=E[i]&&r in E[i].nsps,a=e.forceNew||e["force new connection"]||e.multiplex===!1||o;let c;return a?c=new F(s,e):(E[i]||(E[i]=new F(s,e)),c=E[i]),t.query&&!e.query&&(e.query=t.queryKey),c.socket(t.path,e)}Object.assign(L,{Manager:F,Socket:ue,io:L,connect:L});const at=()=>typeof window<"u"&&window.supabaseClient?window.supabaseClient:(console.warn("⚠️ Supabase client not initialized yet"),null);class ct{constructor(){this.socket=null,this.connected=!1,this.authenticated=!1,this.playerId=null,this.playerState=null,this.reconnectAttempts=0,this.maxReconnectAttempts=5}connect(){var t;if((t=this.socket)!=null&&t.connected){console.log("✅ Já conectado ao servidor");return}const e="https://spaceshiponsol-production.up.railway.app";console.log("🔌 Conectando ao servidor:",e),this.socket=L(e,{transports:["websocket","polling"],reconnection:!0,reconnectionDelay:1e3,reconnectionDelayMax:5e3,reconnectionAttempts:this.maxReconnectAttempts,timeout:1e4}),this.setupListeners()}setupListeners(){this.socket.on("connect",()=>{console.log("✅ Conectado ao servidor:",this.socket.id),this.connected=!0,this.reconnectAttempts=0,window.dispatchEvent(new CustomEvent("socket:connected",{detail:{socketId:this.socket.id}})),setTimeout(()=>{this.authenticateIfNeeded()},500)}),this.socket.on("disconnect",e=>{console.log("❌ Desconectado:",e),this.connected=!1,this.authenticated=!1,window.dispatchEvent(new CustomEvent("socket:disconnected",{detail:{reason:e}}))}),this.socket.on("connect_error",e=>{console.error("❌ Erro de conexão:",e.message),this.reconnectAttempts++,window.dispatchEvent(new CustomEvent("socket:connect_error",{detail:{error:e.message,attempts:this.reconnectAttempts}}))}),this.socket.on("auth:success",e=>{console.log("✅ Autenticado:",e.playerId),this.authenticated=!0,this.playerId=e.playerId,this.playerState=e.playerState,console.log("📡 Disparando evento socket:authenticated"),window.dispatchEvent(new CustomEvent("socket:authenticated",{detail:e})),console.log("✅ Estado do socketService:",{connected:this.connected,authenticated:this.authenticated,playerId:this.playerId})}),this.socket.on("auth:error",e=>{console.error("❌ Erro de autenticação:",e.message),this.authenticated=!1,window.dispatchEvent(new CustomEvent("socket:auth:error",{detail:e}))}),this.socket.on("chunk:data",e=>{var t,s;console.log("📦 Dados do chunk:",e.chunk.zone_type,`(${e.chunk.chunk_x}, ${e.chunk.chunk_y})`),console.log("  - Asteroides:",((t=e.asteroids)==null?void 0:t.length)||0),console.log("  - Players:",((s=e.players)==null?void 0:s.length)||0),e.players&&e.players.length>0&&(console.log("👥 Players recebidos:"),e.players.forEach((i,r)=>{console.log(`  ${r+1}. ${i.username} (ID: ${i.id})`),console.log(`     - Posição: (${i.x}, ${i.y})`),console.log(`     - Chunk: ${i.current_chunk}`),console.log(`     - Health: ${i.health}/${i.max_health}`)})),window.dispatchEvent(new CustomEvent("socket:chunk:data",{detail:e}))}),this.socket.on("player:joined",e=>{console.log("👤 Player entrou:",e.username),console.log("   - ID:",e.id),console.log("   - Posição:",`(${e.x}, ${e.y})`),console.log("   - Chunk:",e.current_chunk),console.log("   - Health:",`${e.health}/${e.max_health}`),window.dispatchEvent(new CustomEvent("socket:player:joined",{detail:e}))}),this.socket.on("player:left",e=>{console.log("👋 Player saiu:",e.playerId),window.dispatchEvent(new CustomEvent("socket:player:left",{detail:e}))}),this.socket.on("player:moved",e=>{window.dispatchEvent(new CustomEvent("socket:player:moved",{detail:e}))}),this.socket.on("battle:hit",e=>{console.log("💥 Você foi atingido!",{attacker:e.attackerName,damage:e.damage,critical:e.isCritical,health:`${e.health}/${e.maxHealth}`}),window.dispatchEvent(new CustomEvent("socket:battle:hit",{detail:e}))}),this.socket.on("battle:attack",e=>{console.log("⚔️ Combate:",`${e.attackerName} → ${e.defenderName} (-${e.damage})`),window.dispatchEvent(new CustomEvent("socket:battle:attack",{detail:e}))}),this.socket.on("battle:attack:success",e=>{console.log("✅ Ataque bem-sucedido:",e),window.dispatchEvent(new CustomEvent("socket:battle:attack:success",{detail:e}))}),this.socket.on("battle:attack:failed",e=>{console.log("❌ Ataque falhou:",e.reason),window.dispatchEvent(new CustomEvent("socket:battle:attack:failed",{detail:e}))}),this.socket.on("player:died",e=>{console.log("💀 Player morreu:",`${e.victimName} (morto por ${e.killerName})`),window.dispatchEvent(new CustomEvent("socket:player:died",{detail:e}))}),this.socket.on("player:death",e=>{console.log("💀 Você morreu!",{killer:e.killerName,respawnIn:`${e.respawnDelay/1e3}s`}),window.dispatchEvent(new CustomEvent("socket:player:death",{detail:e}))}),this.socket.on("player:respawned",e=>{console.log("🔄 Respawn:",e),window.dispatchEvent(new CustomEvent("socket:player:respawned",{detail:e}))}),this.socket.on("error",e=>{console.error("❌ Erro:",e.message),window.dispatchEvent(new CustomEvent("socket:error",{detail:e}))}),this.socket.on("battle:error",e=>{console.error("❌ Erro de combate:",e.message),window.dispatchEvent(new CustomEvent("socket:battle:error",{detail:e}))})}async authenticate(){if(!this.connected)return console.error("❌ Não conectado ao servidor"),!1;const e=at();if(!e)return console.error("❌ Supabase client não disponível"),!1;const{data:{session:t}}=await e.auth.getSession();return t?(console.log("🔐 Autenticando com servidor..."),this.socket.emit("auth",{token:t.access_token}),!0):(console.error("❌ Sem sessão ativa no Supabase"),!1)}async authenticateIfNeeded(){!this.authenticated&&this.connected&&await this.authenticate()}enterChunk(e,t){return this.authenticated?(console.log(`📍 Entrando no chunk (${e}, ${t})`),this.socket.emit("chunk:enter",{chunkX:e,chunkY:t}),!0):(console.error("❌ Não autenticado"),!1)}updatePosition(e,t,s,i){return this.authenticated?(this.socket.emit("player:move",{x:e,y:t,chunkX:s,chunkY:i}),!0):!1}attack(e){return this.authenticated?(console.log(`⚔️ Atacando ${e}`),this.socket.emit("battle:attack",{targetId:e}),!0):(console.error("❌ Não autenticado"),!1)}respawn(){return this.authenticated?(console.log("🔄 Solicitando respawn..."),this.socket.emit("battle:respawn",{}),!0):(console.error("❌ Não autenticado"),!1)}disconnect(){this.socket&&(console.log("👋 Desconectando..."),this.socket.disconnect(),this.socket=null,this.connected=!1,this.authenticated=!1,this.playerId=null,this.playerState=null)}isConnected(){var e;return this.connected&&((e=this.socket)==null?void 0:e.connected)}isAuthenticated(){return this.authenticated}getPlayerId(){return this.playerId}getPlayerState(){return this.playerState}getSocketId(){var e;return(e=this.socket)==null?void 0:e.id}}const p=new ct;class lt{constructor(){this.container=null,this.statusDot=null,this.statusText=null,this.playerInfo=null}render(){return this.container=document.createElement("div"),this.container.className="server-status-widget",this.container.innerHTML=`
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
    `,this.statusDot=this.container.querySelector("[data-status-dot]"),this.statusText=this.container.querySelector("[data-status-text]"),this.authDot=this.container.querySelector("[data-auth-dot]"),this.authText=this.container.querySelector("[data-auth-text]"),this.playerInfo=this.container.querySelector("[data-player-info]"),this.playerIdEl=this.container.querySelector("[data-player-id]"),this.socketIdEl=this.container.querySelector("[data-socket-id]"),this.connectBtn=this.container.querySelector("[data-connect-btn]"),this.setupEventListeners(),this.updateStatus(),p.isConnected()||p.connect(),this.container}setupEventListeners(){this.connectBtn.addEventListener("click",()=>{p.isConnected()?(p.disconnect(),this.connectBtn.textContent="Conectar"):(p.connect(),this.connectBtn.textContent="Conectando...",this.connectBtn.disabled=!0)}),window.addEventListener("socket:connected",()=>{this.updateStatus(),this.connectBtn.textContent="Desconectar",this.connectBtn.disabled=!1}),window.addEventListener("socket:disconnected",()=>{this.updateStatus(),this.connectBtn.textContent="Conectar",this.connectBtn.disabled=!1}),window.addEventListener("socket:authenticated",()=>{this.updateStatus()}),window.addEventListener("socket:auth:error",()=>{this.updateStatus()}),window.addEventListener("socket:connect_error",e=>{this.connectBtn.textContent=`Reconectar (${e.detail.attempts}/${p.maxReconnectAttempts})`,this.connectBtn.disabled=!1})}updateStatus(){const e=p.isConnected(),t=p.isAuthenticated();if(e?(this.statusDot.className="status-dot online",this.statusText.textContent="Conectado"):(this.statusDot.className="status-dot offline",this.statusText.textContent="Desconectado"),t){this.authDot.className="status-dot online",this.authText.textContent="Autenticado",this.playerInfo.style.display="block";const s=p.getPlayerId(),i=p.getSocketId();this.playerIdEl.textContent=s?s.substring(0,8)+"...":"-",this.socketIdEl.textContent=i||"-"}else this.authDot.className="status-dot offline",this.authText.textContent="Não autenticado",this.playerInfo.style.display="none"}destroy(){window.removeEventListener("socket:connected",this.updateStatus),window.removeEventListener("socket:disconnected",this.updateStatus),window.removeEventListener("socket:authenticated",this.updateStatus),window.removeEventListener("socket:auth:error",this.updateStatus)}}class pt{constructor(){this.currentPage="",this.serverStatusComponent=null,this.dropdownOpen=!1}render(){const e=document.createElement("header");return e.className="global-header",e.innerHTML=`
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
    `,this.addStyles(),this.setupEventListeners(e),this.updateActivePage(),e}setupEventListeners(e){const t=e.querySelector("#logoutBtn");t&&t.addEventListener("click",()=>{this.handleLogout()});const s=e.querySelector("#mobileMenuToggle");s&&s.addEventListener("click",()=>{this.toggleMobileMenu(e)});const i=e.querySelector("#serverStatusBtn");i&&i.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation(),this.toggleServerStatusDropdown(e)}),document.addEventListener("click",a=>{const c=e.querySelector("#serverStatusDropdown"),d=e.querySelector("#serverStatusBtn");c&&d&&this.dropdownOpen&&!c.contains(a.target)&&!d.contains(a.target)&&this.closeServerStatusDropdown(e)}),this.initializeServerStatus(e),this.updateHeaderStatusDot(e),this.updatePlayButtonState(e),e.querySelectorAll(".nav-link").forEach(a=>{a.classList.contains("nav-link-play")||a.addEventListener("click",c=>{c.preventDefault();const d=a.getAttribute("href");d&&S(d)})});const o=e.querySelector(".brand-link");o&&o.addEventListener("click",a=>{a.preventDefault(),S("/")})}async handleLogout(){try{await pe(),S("/login")}catch(e){console.error("Erro ao fazer logout:",e),S("/login")}}toggleMobileMenu(e){const t=e.querySelector(".header-nav"),s=e.querySelector("#mobileMenuToggle");t&&s&&(t.classList.contains("mobile-open")?(t.classList.remove("mobile-open"),s.setAttribute("aria-expanded","false"),s.querySelector(".hamburger-icon").textContent="☰"):(t.classList.add("mobile-open"),s.setAttribute("aria-expanded","true"),s.querySelector(".hamburger-icon").textContent="✕"))}initializeServerStatus(e){const t=e.querySelector("#serverStatusContent");if(t&&!this.serverStatusComponent){this.serverStatusComponent=new lt;const s=this.serverStatusComponent.render();t.appendChild(s),p.isConnected()||p.connect()}}toggleServerStatusDropdown(e){this.dropdownOpen?this.closeServerStatusDropdown(e):this.openServerStatusDropdown(e)}openServerStatusDropdown(e){const t=e.querySelector("#serverStatusDropdown");t&&(t.style.display="block",this.dropdownOpen=!0,setTimeout(()=>{t.classList.add("open")},10))}closeServerStatusDropdown(e){const t=e.querySelector("#serverStatusDropdown");t&&(t.classList.remove("open"),setTimeout(()=>{t.style.display="none",this.dropdownOpen=!1},300))}updateHeaderStatusDot(e){const t=e.querySelector("#headerStatusDot");if(!t)return;const s=()=>{const i=p.isConnected();p.isAuthenticated()?t.className="status-dot online":i?t.className="status-dot connecting":t.className="status-dot offline",this.updatePlayButtonState(e)};s(),window.addEventListener("socket:connected",s),window.addEventListener("socket:disconnected",s),window.addEventListener("socket:authenticated",s),window.addEventListener("socket:auth:error",s),setInterval(s,5e3)}updateActivePage(){const e=window.location.pathname;let t="dashboard";e==="/"||e==="/index.html"?t="home":e.includes("/dashboard")?t="dashboard":e.includes("/profile")?t="profile":e.includes("/missions")?t="missions":e.includes("/marketplace")?t="marketplace":e.includes("/config")&&(t="config"),document.querySelectorAll(".nav-link").forEach(i=>{i.getAttribute("data-page")===t?i.classList.add("active"):i.classList.remove("active")})}addStyles(){if(!document.querySelector('style[data-component="header-navigation"]')){const e=document.createElement("style");e.setAttribute("data-component","header-navigation"),e.textContent=`
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

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
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
      `,document.head.appendChild(e)}}updatePlayButtonState(e){const t=e.querySelector(".nav-link-play"),s=e.querySelector(".play-status-indicator");if(!t||!s)return;const i=this.getServerStatus();i.isConnected&&i.isAuthenticated?(t.classList.remove("disabled"),t.title="Jogar",s.textContent="✅",t.onclick=null):(t.classList.add("disabled"),t.title="Servidor não disponível",s.textContent="⚠️",t.onclick=r=>(r.preventDefault(),r.stopPropagation(),alert("Servidor não disponível. Verifique a conexão."),!1))}getServerStatus(){const e=document.querySelector(".server-status-widget");if(e){const t=e.querySelector("[data-status-dot]"),s=e.querySelector("[data-auth-dot]"),i=t&&t.classList.contains("online"),r=s&&s.classList.contains("online");return{isConnected:i,isAuthenticated:r}}return{isConnected:!1,isAuthenticated:!1}}}export{pt as H,dt as e};
