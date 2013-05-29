(function(window,document,undefined){(function(factory){"use strict";if(typeof define==='function'&&define.amd){define(['jquery'],factory);}
else if(jQuery&&!jQuery.fn.qtip){factory(jQuery);}}
(function($){var TRUE=true,FALSE=false,NULL=null,X='x',Y='y',WIDTH='width',HEIGHT='height',TOP='top',LEFT='left',BOTTOM='bottom',RIGHT='right',CENTER='center',FLIP='flip',FLIPINVERT='flipinvert',SHIFT='shift',BLANKIMG='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',QTIP,PLUGINS,NAMESPACE='qtip',HASATTR='data-hasqtip',MOUSE={},usedIDs={},widget=['ui-widget','ui-tooltip'],selector='div.qtip.'+NAMESPACE,defaultClass=NAMESPACE+'-default',focusClass=NAMESPACE+'-focus',hoverClass=NAMESPACE+'-hover',replaceSuffix='_replacedByqTip',oldtitle='oldtitle',trackingBound;function storeMouse(id,event)
{MOUSE[id]={pageX:event.pageX,pageY:event.pageY,type:'mousemove',scrollX:window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft,scrollY:window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop};}
function sanitizeOptions(opts)
{var invalid=function(a){return a===NULL||'object'!==typeof a;},invalidContent=function(c){return!$.isFunction(c)&&((!c&&!c.attr)||c.length<1||('object'===typeof c&&!c.jquery&&!c.then));};if(!opts||'object'!==typeof opts){return FALSE;}
if(invalid(opts.metadata)){opts.metadata={type:opts.metadata};}
if('content'in opts){if(invalid(opts.content)||opts.content.jquery){opts.content={text:opts.content};}
if(invalidContent(opts.content.text||FALSE)){opts.content.text=FALSE;}
if('title'in opts.content){if(!invalid(opts.content.title)){opts.content.button=opts.content.title.button;opts.content.title=opts.content.title.text;}
if(invalidContent(opts.content.title||FALSE)){opts.content.title=FALSE;}}}
if('position'in opts&&invalid(opts.position)){opts.position={my:opts.position,at:opts.position};}
if('show'in opts&&invalid(opts.show)){opts.show=opts.show.jquery?{target:opts.show}:opts.show===TRUE?{ready:TRUE}:{event:opts.show};}
if('hide'in opts&&invalid(opts.hide)){opts.hide=opts.hide.jquery?{target:opts.hide}:{event:opts.hide};}
if('style'in opts&&invalid(opts.style)){opts.style={classes:opts.style};}
$.each(PLUGINS,function(){if(this.sanitize){this.sanitize(opts);}});return opts;}
function QTip(target,options,id,attr)
{var self=this,docBody=document.body,tooltipID=NAMESPACE+'-'+id,isPositioning=0,isDrawing=0,tooltip=$(),namespace='.qtip-'+id,disabledClass='qtip-disabled',elements,cache;self.id=id;self.rendered=FALSE;self.destroyed=FALSE;self.elements=elements={target:target};self.timers={img:{}};self.options=options;self.checks={};self.plugins={};self.cache=cache={event:{},target:$(),disabled:FALSE,attr:attr,onTarget:FALSE,lastClass:''};function convertNotation(notation)
{var i=0,obj,option=options,levels=notation.split('.');while(option=option[levels[i++]]){if(i<levels.length){obj=option;}}
return[obj||options,levels.pop()];}
function createWidgetClass(cls)
{return widget.concat('').join(cls?'-'+cls+' ':' ');}
function setWidget()
{var on=options.style.widget,disabled=tooltip.hasClass(disabledClass);tooltip.removeClass(disabledClass);disabledClass=on?'ui-state-disabled':'qtip-disabled';tooltip.toggleClass(disabledClass,disabled);tooltip.toggleClass('ui-helper-reset '+createWidgetClass(),on).toggleClass(defaultClass,options.style.def&&!on);if(elements.content){elements.content.toggleClass(createWidgetClass('content'),on);}
if(elements.titlebar){elements.titlebar.toggleClass(createWidgetClass('header'),on);}
if(elements.button){elements.button.toggleClass(NAMESPACE+'-icon',!on);}}
function removeTitle(reposition)
{if(elements.title){elements.titlebar.remove();elements.titlebar=elements.title=elements.button=NULL;if(reposition!==FALSE){self.reposition();}}}
function createButton()
{var button=options.content.button,isString=typeof button==='string',close=isString?button:'Close tooltip';if(elements.button){elements.button.remove();}
if(button.jquery){elements.button=button;}
else{elements.button=$('<a />',{'class':'qtip-close '+(options.style.widget?'':NAMESPACE+'-icon'),'title':close,'aria-label':close}).prepend($('<span />',{'class':'ui-icon ui-icon-close','html':'&times;'}));}
elements.button.appendTo(elements.titlebar||tooltip).attr('role','button').click(function(event){if(!tooltip.hasClass(disabledClass)){self.hide(event);}
return FALSE;});}
function createTitle()
{var id=tooltipID+'-title';if(elements.titlebar){removeTitle();}
elements.titlebar=$('<div />',{'class':NAMESPACE+'-titlebar '+(options.style.widget?createWidgetClass('header'):'')}).append(elements.title=$('<div />',{'id':id,'class':NAMESPACE+'-title','aria-atomic':TRUE})).insertBefore(elements.content).delegate('.qtip-close','mousedown keydown mouseup keyup mouseout',function(event){$(this).toggleClass('ui-state-active ui-state-focus',event.type.substr(-4)==='down');}).delegate('.qtip-close','mouseover mouseout',function(event){$(this).toggleClass('ui-state-hover',event.type==='mouseover');});if(options.content.button){createButton();}}
function updateButton(button)
{var elem=elements.button;if(!self.rendered){return FALSE;}
if(!button){elem.remove();}
else{createButton();}}
function updateTitle(content,reposition)
{var elem=elements.title;if(!self.rendered||!content){return FALSE;}
if($.isFunction(content)){content=content.call(target,cache.event,self);}
if(content===FALSE||(!content&&content!=='')){return removeTitle(FALSE);}
else if(content.jquery&&content.length>0){elem.empty().append(content.css({display:'block'}));}
else{elem.html(content);}
if(reposition!==FALSE&&self.rendered&&tooltip[0].offsetWidth>0){self.reposition(cache.event);}}
function deferredContent(deferred)
{if(deferred&&$.isFunction(deferred.done)){deferred.done(function(c){updateContent(c,null,FALSE);});}}
function updateContent(content,reposition,checkDeferred)
{var elem=elements.content;if(!self.rendered||!content){return FALSE;}
if($.isFunction(content)){content=content.call(target,cache.event,self)||'';}
if(checkDeferred!==FALSE){deferredContent(options.content.deferred);}
if(content.jquery&&content.length>0){elem.empty().append(content.css({display:'block'}));}
else{elem.html(content);}
function imagesLoaded(next){var elem=$(this),images=elem.find('img').add(elem.filter('img')),loaded=[];function imgLoaded(img){if(img.src===BLANKIMG||$.inArray(img,loaded)!==-1){return;}
loaded.push(img);$.data(img,'imagesLoaded',{src:img.src});if(images.length===loaded.length){setTimeout(next);images.unbind('.imagesLoaded');}}
if(!images.length){return next();}
images.bind('load.imagesLoaded error.imagesLoaded',function(event){imgLoaded(event.target);}).each(function(i,el){var src=el.src,cached=$.data(el,'imagesLoaded');if((cached&&cached.src===src)||(el.complete&&el.naturalWidth)){imgLoaded(el);}
else if(el.readyState||el.complete){el.src=BLANKIMG;el.src=src;}});}
if(self.rendered<0){tooltip.queue('fx',imagesLoaded);}
else{isDrawing=0;imagesLoaded.call(tooltip[0],$.noop);}
return self;}
function assignEvents()
{var posOptions=options.position,targets={show:options.show.target,hide:options.hide.target,viewport:$(posOptions.viewport),document:$(document),body:$(document.body),window:$(window)},events={show:$.trim(''+options.show.event).split(' '),hide:$.trim(''+options.hide.event).split(' ')},IE6=PLUGINS.ie===6;function showMethod(event)
{if(tooltip.hasClass(disabledClass)){return FALSE;}
clearTimeout(self.timers.show);clearTimeout(self.timers.hide);var callback=function(){self.toggle(TRUE,event);};if(options.show.delay>0){self.timers.show=setTimeout(callback,options.show.delay);}
else{callback();}}
function hideMethod(event)
{if(tooltip.hasClass(disabledClass)||isPositioning||isDrawing){return FALSE;}
var relatedTarget=$(event.relatedTarget),ontoTooltip=relatedTarget.closest(selector)[0]===tooltip[0],ontoTarget=relatedTarget[0]===targets.show[0];clearTimeout(self.timers.show);clearTimeout(self.timers.hide);if(this!==relatedTarget[0]&&(posOptions.target==='mouse'&&ontoTooltip)||(options.hide.fixed&&((/mouse(out|leave|move)/).test(event.type)&&(ontoTooltip||ontoTarget)))){try{event.preventDefault();event.stopImmediatePropagation();}catch(e){}return;}
if(options.hide.delay>0){self.timers.hide=setTimeout(function(){self.hide(event);},options.hide.delay);}
else{self.hide(event);}}
function inactiveMethod(event)
{if(tooltip.hasClass(disabledClass)){return FALSE;}
clearTimeout(self.timers.inactive);self.timers.inactive=setTimeout(function(){self.hide(event);},options.hide.inactive);}
function repositionMethod(event){if(self.rendered&&tooltip[0].offsetWidth>0){self.reposition(event);}}
tooltip.bind('mouseenter'+namespace+' mouseleave'+namespace,function(event){var state=event.type==='mouseenter';if(state){self.focus(event);}
tooltip.toggleClass(hoverClass,state);});if(/mouse(out|leave)/i.test(options.hide.event)){if(options.hide.leave==='window'){targets.document.bind('mouseout'+namespace+' blur'+namespace,function(event){if(!/select|option/.test(event.target.nodeName)&&!event.relatedTarget){self.hide(event);}});}}
if(options.hide.fixed){targets.hide=targets.hide.add(tooltip);tooltip.bind('mouseover'+namespace,function(){if(!tooltip.hasClass(disabledClass)){clearTimeout(self.timers.hide);}});}
else if(/mouse(over|enter)/i.test(options.show.event)){targets.hide.bind('mouseleave'+namespace,function(event){clearTimeout(self.timers.show);});}
if((''+options.hide.event).indexOf('unfocus')>-1){posOptions.container.closest('html').bind('mousedown'+namespace+' touchstart'+namespace,function(event){var elem=$(event.target),enabled=self.rendered&&!tooltip.hasClass(disabledClass)&&tooltip[0].offsetWidth>0,isAncestor=elem.parents(selector).filter(tooltip[0]).length>0;if(elem[0]!==target[0]&&elem[0]!==tooltip[0]&&!isAncestor&&!target.has(elem[0]).length&&enabled){self.hide(event);}});}
if('number'===typeof options.hide.inactive){targets.show.bind('qtip-'+id+'-inactive',inactiveMethod);$.each(QTIP.inactiveEvents,function(index,type){targets.hide.add(elements.tooltip).bind(type+namespace+'-inactive',inactiveMethod);});}
$.each(events.hide,function(index,type){var showIndex=$.inArray(type,events.show),targetHide=$(targets.hide);if((showIndex>-1&&targetHide.add(targets.show).length===targetHide.length)||type==='unfocus')
{targets.show.bind(type+namespace,function(event){if(tooltip[0].offsetWidth>0){hideMethod(event);}
else{showMethod(event);}});delete events.show[showIndex];}
else{targets.hide.bind(type+namespace,hideMethod);}});$.each(events.show,function(index,type){targets.show.bind(type+namespace,showMethod);});if('number'===typeof options.hide.distance){targets.show.add(tooltip).bind('mousemove'+namespace,function(event){var origin=cache.origin||{},limit=options.hide.distance,abs=Math.abs;if(abs(event.pageX-origin.pageX)>=limit||abs(event.pageY-origin.pageY)>=limit){self.hide(event);}});}
if(posOptions.target==='mouse'){targets.show.bind('mousemove'+namespace,function(event){storeMouse(self.id,event);});if(posOptions.adjust.mouse){if(options.hide.event){tooltip.bind('mouseleave'+namespace,function(event){if((event.relatedTarget||event.target)!==targets.show[0]){self.hide(event);}});elements.target.bind('mouseenter'+namespace+' mouseleave'+namespace,function(event){cache.onTarget=event.type==='mouseenter';});}
targets.document.bind('mousemove'+namespace,function(event){if(self.rendered&&cache.onTarget&&!tooltip.hasClass(disabledClass)&&tooltip[0].offsetWidth>0){self.reposition(event||MOUSE[self.id]);}});}}
if(posOptions.adjust.resize||targets.viewport.length){($.event.special.resize?targets.viewport:targets.window).bind('resize'+namespace,repositionMethod);}
if(posOptions.adjust.scroll){targets.window.add(posOptions.container).bind('scroll'+namespace,repositionMethod);}}
function unassignEvents()
{var targets=[options.show.target[0],options.hide.target[0],self.rendered&&elements.tooltip[0],options.position.container[0],options.position.viewport[0],options.position.container.closest('html')[0],window,document];if(self.rendered){$([]).pushStack($.grep(targets,function(i){return typeof i==='object';})).unbind(namespace);}
else{options.show.target.unbind(namespace+'-create');}}
self.checks.builtin={'^id$':function(obj,o,v){var id=v===TRUE?QTIP.nextid:v,tooltipID=NAMESPACE+'-'+id;if(id!==FALSE&&id.length>0&&!$('#'+tooltipID).length){tooltip[0].id=tooltipID;elements.content[0].id=tooltipID+'-content';elements.title[0].id=tooltipID+'-title';}},'^content.text$':function(obj,o,v){updateContent(options.content.text);},'^content.deferred$':function(obj,o,v){deferredContent(options.content.deferred);},'^content.title$':function(obj,o,v){if(!v){return removeTitle();}
if(!elements.title&&v){createTitle();}
updateTitle(v);},'^content.button$':function(obj,o,v){updateButton(v);},'^content.title.(text|button)$':function(obj,o,v){self.set('content.'+(o==='button'?o:'title'),v);},'^position.(my|at)$':function(obj,o,v){if('string'===typeof v){obj[o]=new PLUGINS.Corner(v);}},'^position.container$':function(obj,o,v){if(self.rendered){tooltip.appendTo(v);}},'^show.ready$':function(){if(!self.rendered){self.render(1);}
else{self.toggle(TRUE);}},'^style.classes$':function(obj,o,v){tooltip.attr('class',NAMESPACE+' qtip '+v);},'^style.width|height':function(obj,o,v){tooltip.css(o,v);},'^style.widget|content.title':setWidget,'^events.(render|show|move|hide|focus|blur)$':function(obj,o,v){tooltip[($.isFunction(v)?'':'un')+'bind']('tooltip'+o,v);},'^(show|hide|position).(event|target|fixed|inactive|leave|distance|viewport|adjust)':function(){var posOptions=options.position;tooltip.attr('tracking',posOptions.target==='mouse'&&posOptions.adjust.mouse);unassignEvents();assignEvents();}};$.extend(self,{_triggerEvent:function(type,args,event)
{var callback=$.Event('tooltip'+type);callback.originalEvent=(event?$.extend({},event):NULL)||cache.event||NULL;tooltip.trigger(callback,[self].concat(args||[]));return!callback.isDefaultPrevented();},render:function(show)
{if(self.rendered||self.destroyed){return self;}
var text=options.content.text,title=options.content.title,button=options.content.button,posOptions=options.position;$.attr(target[0],'aria-describedby',tooltipID);tooltip=elements.tooltip=$('<div/>',{'id':tooltipID,'class':[NAMESPACE,defaultClass,options.style.classes,NAMESPACE+'-pos-'+options.position.my.abbrev()].join(' '),'width':options.style.width||'','height':options.style.height||'','tracking':posOptions.target==='mouse'&&posOptions.adjust.mouse,'role':'alert','aria-live':'polite','aria-atomic':FALSE,'aria-describedby':tooltipID+'-content','aria-hidden':TRUE}).toggleClass(disabledClass,cache.disabled).data('qtip',self).appendTo(options.position.container).append(elements.content=$('<div />',{'class':NAMESPACE+'-content','id':tooltipID+'-content','aria-atomic':TRUE}));self.rendered=-1;isPositioning=1;if(title){createTitle();if(!$.isFunction(title)){updateTitle(title,FALSE);}}
if(button){createButton();}
if(!$.isFunction(text)||text.then){updateContent(text,FALSE);}
self.rendered=TRUE;setWidget();$.each(options.events,function(name,callback){if($.isFunction(callback)){tooltip.bind(name==='toggle'?'tooltipshow tooltiphide':'tooltip'+name,callback);}});$.each(PLUGINS,function(){if(this.initialize==='render'){this(self);}});assignEvents();tooltip.queue('fx',function(next){self._triggerEvent('render');isPositioning=0;if(options.show.ready||show){self.toggle(TRUE,cache.event,FALSE);}
next();});return self;},get:function(notation)
{if(self.destroyed){return self;}
var result,o;switch(notation.toLowerCase())
{case'dimensions':result={height:tooltip.outerHeight(FALSE),width:tooltip.outerWidth(FALSE)};break;case'offset':result=PLUGINS.offset(tooltip,options.position.container);break;default:o=convertNotation(notation.toLowerCase());result=o[0][o[1]];result=result.precedance?result.string():result;break;}
return result;},set:function(option,value)
{if(self.destroyed){return self;}
var rmove=/^position\.(my|at|adjust|target|container)|style|content|show\.ready/i,rdraw=/^content\.(title|attr)|style/i,reposition=FALSE,checks=self.checks,name;function callback(notation,args){var category,rule,match;for(category in checks){for(rule in checks[category]){if(match=(new RegExp(rule,'i')).exec(notation)){args.push(match);checks[category][rule].apply(self,args);}}}}
if('string'===typeof option){name=option;option={};option[name]=value;}
else{option=$.extend(TRUE,{},option);}
$.each(option,function(notation,value){var obj=convertNotation(notation.toLowerCase()),previous;previous=obj[0][obj[1]];obj[0][obj[1]]='object'===typeof value&&value.nodeType?$(value):value;option[notation]=[obj[0],obj[1],value,previous];reposition=rmove.test(notation)||reposition;});sanitizeOptions(options);isPositioning=1;$.each(option,callback);isPositioning=0;if(self.rendered&&tooltip[0].offsetWidth>0&&reposition){self.reposition(options.position.target==='mouse'?NULL:cache.event);}
return self;},toggle:function(state,event)
{if(event){if((/over|enter/).test(event.type)&&(/out|leave/).test(cache.event.type)&&options.show.target.add(event.target).length===options.show.target.length&&tooltip.has(event.relatedTarget).length){return self;}
cache.event=$.extend({},event);}
if(!self.rendered||self.destroyed){return state?self.render(1):self;}
var type=state?'show':'hide',opts=options[type],otherOpts=options[!state?'show':'hide'],posOptions=options.position,contentOptions=options.content,width=tooltip.css('width'),visible=tooltip[0].offsetWidth>0,animate=state||opts.target.length===1,sameTarget=!event||opts.target.length<2||cache.target[0]===event.target,showEvent,delay;if((typeof state).search('boolean|number')){state=!visible;}
if(!tooltip.is(':animated')&&visible===state&&sameTarget){return self;}
if(!self._triggerEvent(type,[90])&&!self.destroyed){return self;}
$.attr(tooltip[0],'aria-hidden',!!!state);if(state){cache.origin=$.extend({},MOUSE[self.id]);self.focus(event);if($.isFunction(contentOptions.text)){updateContent(contentOptions.text,FALSE);}
if($.isFunction(contentOptions.title)){updateTitle(contentOptions.title,FALSE);}
if(!trackingBound&&posOptions.target==='mouse'&&posOptions.adjust.mouse){$(document).bind('mousemove.'+NAMESPACE,function(event){storeMouse(self.id,event);});trackingBound=TRUE;}
if(!width){tooltip.css('width',tooltip.outerWidth());}
self.reposition(event,arguments[2]);if(!width){tooltip.css('width','');}
if(!!opts.solo){(typeof opts.solo==='string'?$(opts.solo):$(selector,opts.solo)).not(tooltip).not(opts.target).qtip('hide',$.Event('tooltipsolo'));}}
else{clearTimeout(self.timers.show);delete cache.origin;if(trackingBound&&!$(selector+'[tracking="true"]:visible',opts.solo).not(tooltip).length){$(document).unbind('mousemove.'+NAMESPACE);trackingBound=FALSE;}
self.blur(event);}
function after(){if(state){if(PLUGINS.ie){tooltip[0].style.removeAttribute('filter');}
tooltip.css('overflow','');if('string'===typeof opts.autofocus){$(opts.autofocus,tooltip).focus();}
opts.target.trigger('qtip-'+id+'-inactive');}
else{tooltip.css({display:'',visibility:'',opacity:'',left:'',top:''});}
self._triggerEvent(state?'visible':'hidden');}
if(opts.effect===FALSE||animate===FALSE){tooltip[type]();after.call(tooltip);}
else if($.isFunction(opts.effect)){tooltip.stop(1,1);opts.effect.call(tooltip,self);tooltip.queue('fx',function(n){after();n();});}
else{tooltip.fadeTo(90,state?1:0,after);}
if(state){opts.target.trigger('qtip-'+id+'-inactive');}
return self;},show:function(event){return self.toggle(TRUE,event);},hide:function(event){return self.toggle(FALSE,event);},focus:function(event)
{if(!self.rendered||self.destroyed){return self;}
var qtips=$(selector),curIndex=parseInt(tooltip[0].style.zIndex,10),newIndex=QTIP.zindex+qtips.length,cachedEvent=$.extend({},event),focusedElem;if(!tooltip.hasClass(focusClass))
{if(self._triggerEvent('focus',[newIndex],cachedEvent)){if(curIndex!==newIndex){qtips.each(function(){if(this.style.zIndex>curIndex){this.style.zIndex=this.style.zIndex-1;}});qtips.filter('.'+focusClass).qtip('blur',cachedEvent);}
tooltip.addClass(focusClass)[0].style.zIndex=newIndex;}}
return self;},blur:function(event){if(self.destroyed){return self;}
tooltip.removeClass(focusClass);self._triggerEvent('blur',[tooltip.css('zIndex')],event);return self;},reposition:function(event,effect)
{if(!self.rendered||isPositioning||self.destroyed){return self;}
isPositioning=1;var target=options.position.target,posOptions=options.position,my=posOptions.my,at=posOptions.at,adjust=posOptions.adjust,method=adjust.method.split(' '),elemWidth=tooltip.outerWidth(FALSE),elemHeight=tooltip.outerHeight(FALSE),targetWidth=0,targetHeight=0,type=tooltip.css('position'),viewport=posOptions.viewport,position={left:0,top:0},container=posOptions.container,visible=tooltip[0].offsetWidth>0,isScroll=event&&event.type==='scroll',win=$(window),adjusted,offset,mouse;if($.isArray(target)&&target.length===2){at={x:LEFT,y:TOP};position={left:target[0],top:target[1]};}
else if(target==='mouse'&&((event&&event.pageX)||cache.event.pageX)){at={x:LEFT,y:TOP};mouse=MOUSE[self.id];event=mouse&&mouse.pageX&&(adjust.mouse||!event||!event.pageX)?{pageX:mouse.pageX,pageY:mouse.pageY}:(event&&(event.type==='resize'||event.type==='scroll')?cache.event:event&&event.pageX&&event.type==='mousemove'?event:(!adjust.mouse||options.show.distance)&&cache.origin&&cache.origin.pageX?cache.origin:event)||event||cache.event||mouse||{};if(type!=='static'){position=container.offset();}
position={left:event.pageX-position.left,top:event.pageY-position.top};if(adjust.mouse&&isScroll){position.left-=mouse.scrollX-win.scrollLeft();position.top-=mouse.scrollY-win.scrollTop();}}
else{if(target==='event'&&event&&event.target&&event.type!=='scroll'&&event.type!=='resize'){cache.target=$(event.target);}
else if(target!=='event'){cache.target=$(target.jquery?target:elements.target);}
target=cache.target;target=$(target).eq(0);if(target.length===0){return self;}
else if(target[0]===document||target[0]===window){targetWidth=PLUGINS.iOS?window.innerWidth:target.width();targetHeight=PLUGINS.iOS?window.innerHeight:target.height();if(target[0]===window){position={top:(viewport||target).scrollTop(),left:(viewport||target).scrollLeft()};}}
else if(PLUGINS.imagemap&&target.is('area')){adjusted=PLUGINS.imagemap(self,target,at,PLUGINS.viewport?method:FALSE);}
else if(PLUGINS.svg&&target[0].ownerSVGElement){adjusted=PLUGINS.svg(self,target,at,PLUGINS.viewport?method:FALSE);}
else{targetWidth=target.outerWidth(FALSE);targetHeight=target.outerHeight(FALSE);position=target.offset();}
if(adjusted){targetWidth=adjusted.width;targetHeight=adjusted.height;offset=adjusted.offset;position=adjusted.position;}
position=PLUGINS.offset(target,position,container);if((PLUGINS.iOS>3.1&&PLUGINS.iOS<4.1)||(PLUGINS.iOS>=4.3&&PLUGINS.iOS<4.33)||(!PLUGINS.iOS&&type==='fixed')){position.left-=win.scrollLeft();position.top-=win.scrollTop();}
position.left+=at.x===RIGHT?targetWidth:at.x===CENTER?targetWidth/2:0;position.top+=at.y===BOTTOM?targetHeight:at.y===CENTER?targetHeight/2:0;}
position.left+=adjust.x+(my.x===RIGHT?-elemWidth:my.x===CENTER?-elemWidth/2:0);position.top+=adjust.y+(my.y===BOTTOM?-elemHeight:my.y===CENTER?-elemHeight/2:0);if(PLUGINS.viewport){position.adjusted=PLUGINS.viewport(self,position,posOptions,targetWidth,targetHeight,elemWidth,elemHeight);if(offset&&position.adjusted.left){position.left+=offset.left;}
if(offset&&position.adjusted.top){position.top+=offset.top;}}
else{position.adjusted={left:0,top:0};}
if(!self._triggerEvent('move',[position,viewport.elem||viewport],event)){return self;}
delete position.adjusted;if(effect===FALSE||!visible||isNaN(position.left)||isNaN(position.top)||target==='mouse'||!$.isFunction(posOptions.effect)){tooltip.css(position);}
else if($.isFunction(posOptions.effect)){posOptions.effect.call(tooltip,self,$.extend({},position));tooltip.queue(function(next){$(this).css({opacity:'',height:''});if(PLUGINS.ie){this.style.removeAttribute('filter');}
next();});}
isPositioning=0;return self;},disable:function(state)
{if(self.destroyed){return self;}
if('boolean'!==typeof state){state=!(tooltip.hasClass(disabledClass)||cache.disabled);}
if(self.rendered){tooltip.toggleClass(disabledClass,state);$.attr(tooltip[0],'aria-disabled',state);}
else{cache.disabled=!!state;}
return self;},enable:function(){return self.disable(FALSE);},destroy:function(immediate)
{if(self.destroyed){return target;}
self.destroyed=TRUE;function process(){var t=target[0],title=$.attr(t,oldtitle),elemAPI=target.data('qtip');if(self.rendered){$.each(self.plugins,function(name){if(this.destroy){this.destroy();}
delete self.plugins[name];});tooltip.stop(1,0).find('*').remove().end().remove();self.rendered=FALSE;}
clearTimeout(self.timers.show);clearTimeout(self.timers.hide);unassignEvents();if(!elemAPI||self===elemAPI){target.removeData('qtip').removeAttr(HASATTR);if(options.suppress&&title){target.attr('title',title);target.removeAttr(oldtitle);}
target.removeAttr('aria-describedby');}
target.unbind('.qtip-'+id);delete usedIDs[self.id];delete self.options;delete self.elements;delete self.cache;delete self.timers;delete self.checks;delete MOUSE[self.id];}
var isHiding=FALSE;if(immediate!==TRUE){tooltip.one('tooltiphide',function(){isHiding=TRUE;tooltip.one('tooltiphidden',process);});self.hide();}
if(!isHiding){process();}
return target;}});}
function init(elem,id,opts)
{var obj,posOptions,attr,config,title,docBody=$(document.body),newTarget=elem[0]===document?docBody:elem,metadata=(elem.metadata)?elem.metadata(opts.metadata):NULL,metadata5=opts.metadata.type==='html5'&&metadata?metadata[opts.metadata.name]:NULL,html5=elem.data(opts.metadata.name||'qtipopts');try{html5=typeof html5==='string'?$.parseJSON(html5):html5;}catch(e){}
config=$.extend(TRUE,{},QTIP.defaults,opts,typeof html5==='object'?sanitizeOptions(html5):NULL,sanitizeOptions(metadata5||metadata));posOptions=config.position;config.id=id;if('boolean'===typeof config.content.text){attr=elem.attr(config.content.attr);if(config.content.attr!==FALSE&&attr){config.content.text=attr;}
else{return FALSE;}}
if(!posOptions.container.length){posOptions.container=docBody;}
if(posOptions.target===FALSE){posOptions.target=newTarget;}
if(config.show.target===FALSE){config.show.target=newTarget;}
if(config.show.solo===TRUE){config.show.solo=posOptions.container.closest('body');}
if(config.hide.target===FALSE){config.hide.target=newTarget;}
if(config.position.viewport===TRUE){config.position.viewport=posOptions.container;}
posOptions.container=posOptions.container.eq(0);posOptions.at=new PLUGINS.Corner(posOptions.at);posOptions.my=new PLUGINS.Corner(posOptions.my);if(elem.data('qtip')){if(config.overwrite){elem.qtip('destroy');}
else if(config.overwrite===FALSE){return FALSE;}}
elem.attr(HASATTR,true);if(config.suppress&&(title=elem.attr('title'))){elem.removeAttr('title').attr(oldtitle,title).attr('title','');}
obj=new QTip(elem,config,id,!!attr);elem.data('qtip',obj);elem.one('remove.qtip-'+id+' removeqtip.qtip-'+id,function(){var api;if((api=$(this).data('qtip'))){api.destroy();}});return obj;}
QTIP=$.fn.qtip=function(options,notation,newValue)
{var command=(''+options).toLowerCase(),returned=NULL,args=$.makeArray(arguments).slice(1),event=args[args.length-1],opts=this[0]?$.data(this[0],'qtip'):NULL;if((!arguments.length&&opts)||command==='api'){return opts;}
else if('string'===typeof options)
{this.each(function()
{var api=$.data(this,'qtip');if(!api){return TRUE;}
if(event&&event.timeStamp){api.cache.event=event;}
if((command==='option'||command==='options')&&notation){if($.isPlainObject(notation)||newValue!==undefined){api.set(notation,newValue);}
else{returned=api.get(notation);return FALSE;}}
else if(api[command]){api[command].apply(api[command],args);}});return returned!==NULL?returned:this;}
else if('object'===typeof options||!arguments.length)
{opts=sanitizeOptions($.extend(TRUE,{},options));return QTIP.bind.call(this,opts,event);}};QTIP.bind=function(opts,event)
{return this.each(function(i){var options,targets,events,namespace,api,id;id=$.isArray(opts.id)?opts.id[i]:opts.id;id=!id||id===FALSE||id.length<1||usedIDs[id]?QTIP.nextid++:(usedIDs[id]=id);namespace='.qtip-'+id+'-create';api=init($(this),id,opts);if(api===FALSE){return TRUE;}
options=api.options;$.each(PLUGINS,function(){if(this.initialize==='initialize'){this(api);}});targets={show:options.show.target,hide:options.hide.target};events={show:$.trim(''+options.show.event).replace(/ /g,namespace+' ')+namespace,hide:$.trim(''+options.hide.event).replace(/ /g,namespace+' ')+namespace};if(/mouse(over|enter)/i.test(events.show)&&!/mouse(out|leave)/i.test(events.hide)){events.hide+=' mouseleave'+namespace;}
targets.show.bind('mousemove'+namespace,function(event){storeMouse(self.id,event);api.cache.onTarget=TRUE;});function hoverIntent(event){function render(){api.render(typeof event==='object'||options.show.ready);targets.show.add(targets.hide).unbind(namespace);}
if(api.cache.disabled){return FALSE;}
api.cache.event=$.extend({},event);api.cache.target=event?$(event.target):[undefined];if(options.show.delay>0){clearTimeout(api.timers.show);api.timers.show=setTimeout(render,options.show.delay);if(events.show!==events.hide){targets.hide.bind(events.hide,function(){clearTimeout(api.timers.show);});}}
else{render();}}
targets.show.bind(events.show,hoverIntent);if(options.show.ready||options.prerender){hoverIntent(event);}});};PLUGINS=QTIP.plugins={Corner:function(corner){corner=(''+corner).replace(/([A-Z])/,' $1').replace(/middle/gi,CENTER).toLowerCase();this.x=(corner.match(/left|right/i)||corner.match(/center/)||['inherit'])[0].toLowerCase();this.y=(corner.match(/top|bottom|center/i)||['inherit'])[0].toLowerCase();var f=corner.charAt(0);this.precedance=(f==='t'||f==='b'?Y:X);this.string=function(){return this.precedance===Y?this.y+this.x:this.x+this.y;};this.abbrev=function(){var x=this.x.substr(0,1),y=this.y.substr(0,1);return x===y?x:this.precedance===Y?y+x:x+y;};this.invertx=function(center){this.x=this.x===LEFT?RIGHT:this.x===RIGHT?LEFT:center||this.x;};this.inverty=function(center){this.y=this.y===TOP?BOTTOM:this.y===BOTTOM?TOP:center||this.y;};this.clone=function(){return{x:this.x,y:this.y,precedance:this.precedance,string:this.string,abbrev:this.abbrev,clone:this.clone,invertx:this.invertx,inverty:this.inverty};};},offset:function(elem,pos,container){var docBody=elem.closest('body'),quirks=PLUGINS.ie&&document.compatMode!=='CSS1Compat',parent=container,scrolled,coffset,overflow;function scroll(e,i){pos.left+=i*e.scrollLeft();pos.top+=i*e.scrollTop();}
if(parent){do{if(parent.css('position')!=='static'){coffset=parent.position();pos.left-=coffset.left+(parseInt(parent.css('borderLeftWidth'),10)||0)+(parseInt(parent.css('marginLeft'),10)||0);pos.top-=coffset.top+(parseInt(parent.css('borderTopWidth'),10)||0)+(parseInt(parent.css('marginTop'),10)||0);if(!scrolled&&(overflow=parent.css('overflow'))!=='hidden'&&overflow!=='visible'){scrolled=parent;}}}
while((parent=$(parent[0].offsetParent)).length);if(scrolled&&scrolled[0]!==docBody[0]||quirks){scroll(scrolled||docBody,1);}}
return pos;},ie:(function(){var v=3,div=document.createElement('div');while((div.innerHTML='<!--[if gt IE '+(++v)+']><i></i><![endif]-->')){if(!div.getElementsByTagName('i')[0]){break;}}
return v>4?v:NaN;}()),iOS:parseFloat((''+(/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent)||[0,''])[1]).replace('undefined','3_2').replace('_','.').replace('_',''))||FALSE,fn:{attr:function(attr,val){if(this.length){var self=this[0],title='title',api=$.data(self,'qtip');if(attr===title&&api&&'object'===typeof api&&api.options.suppress){if(arguments.length<2){return $.attr(self,oldtitle);}
if(api&&api.options.content.attr===title&&api.cache.attr){api.set('content.text',val);}
return this.attr(oldtitle,val);}}
return $.fn['attr'+replaceSuffix].apply(this,arguments);},clone:function(keepData){var titles=$([]),title='title',elems=$.fn['clone'+replaceSuffix].apply(this,arguments);if(!keepData){elems.filter('['+oldtitle+']').attr('title',function(){return $.attr(this,oldtitle);}).removeAttr(oldtitle);}
return elems;}}};$.each(PLUGINS.fn,function(name,func){if(!func||$.fn[name+replaceSuffix]){return TRUE;}
var old=$.fn[name+replaceSuffix]=$.fn[name];$.fn[name]=function(){return func.apply(this,arguments)||old.apply(this,arguments);};});if(!$.ui){$['cleanData'+replaceSuffix]=$.cleanData;$.cleanData=function(elems){for(var i=0,elem;(elem=$(elems[i])).length&&elem.attr(HASATTR);i++){try{elem.triggerHandler('removeqtip');}
catch(e){}}
$['cleanData'+replaceSuffix](elems);};}
QTIP.version='2.0.1-45-';QTIP.nextid=0;QTIP.inactiveEvents='click dblclick mousedown mouseup mousemove mouseleave mouseenter'.split(' ');QTIP.zindex=15000;QTIP.defaults={prerender:FALSE,id:FALSE,overwrite:TRUE,suppress:TRUE,content:{text:TRUE,attr:'title',deferred:FALSE,title:FALSE,button:FALSE},position:{my:'top left',at:'bottom right',target:FALSE,container:FALSE,viewport:FALSE,adjust:{x:0,y:0,mouse:TRUE,scroll:TRUE,resize:TRUE,method:'flipinvert flipinvert'},effect:function(api,pos,viewport){$(this).animate(pos,{duration:200,queue:FALSE});}},show:{target:FALSE,event:'mouseenter',effect:TRUE,delay:90,solo:FALSE,ready:FALSE,autofocus:FALSE},hide:{target:FALSE,event:'mouseleave',effect:TRUE,delay:0,fixed:FALSE,inactive:FALSE,leave:'window',distance:FALSE},style:{classes:'',widget:FALSE,width:FALSE,height:FALSE,def:TRUE},events:{render:NULL,move:NULL,show:NULL,hide:NULL,toggle:NULL,visible:NULL,hidden:NULL,focus:NULL,blur:NULL}};PLUGINS.svg=function(api,svg,corner,adjustMethod)
{var doc=$(document),elem=svg[0],result={width:0,height:0,position:{top:1e10,left:1e10}},box,mtx,root,point,tPoint;while(!elem.getBBox){elem=elem.parentNode;}
if(elem.getBBox&&elem.parentNode){box=elem.getBBox();mtx=elem.getScreenCTM();root=elem.farthestViewportElement||elem;if(!root.createSVGPoint){return result;}
point=root.createSVGPoint();point.x=box.x;point.y=box.y;tPoint=point.matrixTransform(mtx);result.position.left=tPoint.x;result.position.top=tPoint.y;point.x+=box.width;point.y+=box.height;tPoint=point.matrixTransform(mtx);result.width=tPoint.x-result.position.left;result.height=tPoint.y-result.position.top;result.position.left+=doc.scrollLeft();result.position.top+=doc.scrollTop();}
return result;};var AJAX,AJAXNS='.qtip-ajax',RSCRIPT=/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;function Ajax(api)
{var self=this,tooltip=api.elements.tooltip,opts=api.options.content.ajax,defaults=QTIP.defaults.content.ajax,first=TRUE,stop=FALSE,xhr;api.checks.ajax={'^content.ajax':function(obj,name,v){if(name==='ajax'){opts=v;}
if(name==='once'){self.init();}
else if(opts&&opts.url){self.load();}
else{tooltip.unbind(AJAXNS);}}};$.extend(self,{init:function(){if(opts&&opts.url){tooltip.unbind(AJAXNS)[opts.once?'one':'bind']('tooltipshow'+AJAXNS,self.load);}
return self;},load:function(event){if(stop){stop=FALSE;return;}
var hasSelector=opts.url.lastIndexOf(' '),url=opts.url,selector,hideFirst=!opts.loading&&first;if(hideFirst){try{event.preventDefault();}catch(e){}}
else if(event&&event.isDefaultPrevented()){return self;}
if(xhr&&xhr.abort){xhr.abort();}
if(hasSelector>-1){selector=url.substr(hasSelector);url=url.substr(0,hasSelector);}
function after(){var complete;if(api.destroyed){return;}
first=FALSE;if(hideFirst){stop=TRUE;api.show(event.originalEvent);}
if((complete=defaults.complete||opts.complete)&&$.isFunction(complete)){complete.apply(opts.context||api,arguments);}}
function successHandler(content,status,jqXHR){var success;if(api.destroyed){return;}
if(selector&&'string'===typeof content){content=$('<div/>').append(content.replace(RSCRIPT,"")).find(selector);}
if((success=defaults.success||opts.success)&&$.isFunction(success)){success.call(opts.context||api,content,status,jqXHR);}
else{api.set('content.text',content);}}
function errorHandler(xhr,status,error){if(api.destroyed||xhr.status===0){return;}
api.set('content.text',status+': '+error);}
xhr=$.ajax($.extend({error:defaults.error||errorHandler,context:api},opts,{url:url,success:successHandler,complete:after}));},destroy:function(){if(xhr&&xhr.abort){xhr.abort();}
api.destroyed=TRUE;}});self.init();}
AJAX=PLUGINS.ajax=function(api)
{var self=api.plugins.ajax;return'object'===typeof self?self:(api.plugins.ajax=new Ajax(api));};AJAX.initialize='render';AJAX.sanitize=function(options)
{var content=options.content,opts;if(content&&'ajax'in content){opts=content.ajax;if(typeof opts!=='object'){opts=options.content.ajax={url:opts};}
if('boolean'!==typeof opts.once&&opts.once){opts.once=!!opts.once;}}};$.extend(TRUE,QTIP.defaults,{content:{ajax:{loading:TRUE,once:TRUE}}});var TIP,vendorCss,TIPNS='.qtip-tip',MARGIN='margin',BORDER='border',COLOR='color',BG_COLOR='background-color',TRANSPARENT='transparent',IMPORTANT=' !important',HASCANVAS=!!document.createElement('canvas').getContext,INVALID=/rgba?\(0, 0, 0(, 0)?\)|transparent|#123456/i;function camel(s){return s.charAt(0).toUpperCase()+s.slice(1);}
if(!$.curCSS){vendorCss=function(elem,prop){return elem.css(prop);};}
else{var cssProps={},cssPrefixes=["Webkit","O","Moz","ms"];vendorCss=function(elem,prop){var ucProp=prop.charAt(0).toUpperCase()+prop.slice(1),props=(prop+' '+cssPrefixes.join(ucProp+' ')+ucProp).split(' '),cur,val,i;if(cssProps[prop]){return elem.css(cssProps[prop]);}
for(i in props){cur=props[i];if((val=elem.css(cur))!==undefined){return cssProps[prop]=cur,val;}}};}
function intCss(elem,prop){return parseInt(vendorCss(elem,prop),10);}
function calculateSize(size,corner,border){var y=corner.precedance===Y,width=size[y?0:1],height=size[y?1:0],isCenter=corner.string().indexOf(CENTER)>-1,base=width*(isCenter?0.5:1),pow=Math.pow,round=Math.round,bigHyp,ratio,result,smallHyp=Math.sqrt(pow(base,2)+pow(height,2)),hyp=[(border/base)*smallHyp,(border/height)*smallHyp];hyp[2]=Math.sqrt(pow(hyp[0],2)-pow(border,2));hyp[3]=Math.sqrt(pow(hyp[1],2)-pow(border,2));bigHyp=smallHyp+hyp[2]+hyp[3]+(isCenter?0:hyp[0]);ratio=bigHyp/smallHyp;result=[round(ratio*height),round(ratio*width)];return y?result:result.reverse();}
function calculateTip(corner,width,height)
{var width2=Math.ceil(width/2),height2=Math.ceil(height/2),tips={bottomright:[[0,0],[width,height],[width,0]],bottomleft:[[0,0],[width,0],[0,height]],topright:[[0,height],[width,0],[width,height]],topleft:[[0,0],[0,height],[width,height]],topcenter:[[0,height],[width2,0],[width,height]],bottomcenter:[[0,0],[width,0],[width2,height]],rightcenter:[[0,0],[width,height2],[0,height]],leftcenter:[[width,0],[width,height],[0,height2]]};tips.lefttop=tips.bottomright;tips.righttop=tips.bottomleft;tips.leftbottom=tips.topright;tips.rightbottom=tips.topleft;return tips[corner.string()];}
if(!HASCANVAS){createVML=function(tag,props,style){return'<qvml:'+tag+' xmlns="urn:schemas-microsoft.com:vml" class="qtip-vml" '+(props||'')+' style="behavior: url(#default#VML); '+(style||'')+'" />';};}
function Tip(qTip,command)
{var self=this,opts=qTip.options.style.tip,elems=qTip.elements,tooltip=elems.tooltip,cache={top:0,left:0},size=[opts.width,opts.height],color={},border=opts.border||0,tiphtml;self.corner=NULL;self.mimic=NULL;self.border=border;self.offset=opts.offset;self.size=size;qTip.checks.tip={'^position.my|style.tip.(corner|mimic|border)$':function(){!self.init()&&self.destroy();qTip.reposition();},'^style.tip.(height|width)$':function(){self.size=size=[opts.width,opts.height];self.create();self.update();qTip.reposition();},'^content.title|style.(classes|widget)$':function(){elems.tip&&elems.tip.length&&self.update();}};function swapDimensions(){size[0]=opts.height;size[1]=opts.width;}
function resetDimensions(){size[0]=opts.width;size[1]=opts.height;}
function parseCorner(){var corner=opts.corner,posOptions=qTip.options.position,at=posOptions.at,my=posOptions.my.string?posOptions.my.string():posOptions.my;if(corner===FALSE||(my===FALSE&&at===FALSE)){return FALSE;}
else{if(corner===TRUE){self.corner=new PLUGINS.Corner(my);}
else if(!corner.string){self.corner=new PLUGINS.Corner(corner);self.corner.fixed=TRUE;}}
cache.corner=new PLUGINS.Corner(self.corner.string());return self.corner.string()!=='centercenter';}
function parseWidth(corner,side,use){var prop=BORDER+camel(!side?corner[corner.precedance]:side)+'Width';return(use?intCss(use,prop):(intCss(elems.content,prop)||intCss(corner.y===TOP&&elems.titlebar||elems.content,prop)||intCss(tooltip,prop)))||0;}
function parseRadius(corner){var prop=BORDER+camel(corner.y)+camel(corner.x)+'Radius';return PLUGINS.ie<9?0:intCss(corner.y===TOP&&elems.titlebar||elems.content,prop)||intCss(elems.tooltip,prop)||0;}
function parseColours(elems,corner){var tip=elems.tip.css('cssText',''),borderSide=BORDER+camel(corner[corner.precedance])+camel(COLOR),titlebar=elems.titlebar,useTitle=titlebar&&(corner.y===TOP||(corner.y===CENTER&&tip.position().top+(size[1]/2)+opts.offset<titlebar.outerHeight(TRUE))),colorElem=useTitle?titlebar:elems.content;function css(elem,prop,compare){var val=elem.css(prop);return!val||(compare&&val===elem.css(compare))||INVALID.test(val)?FALSE:val;}
color.fill=css(tip,BG_COLOR)||css(colorElem,BG_COLOR)||css(elems.content,BG_COLOR)||css(tooltip,BG_COLOR)||tip.css(BG_COLOR);color.border=css(tip,borderSide,COLOR)||css(colorElem,borderSide,COLOR)||css(elems.content,borderSide,COLOR)||css(tooltip,borderSide,COLOR)||tooltip.css(borderSide);$('*',tip).add(tip).css('cssText',BG_COLOR+':'+TRANSPARENT+IMPORTANT+';'+BORDER+':0'+IMPORTANT+';');}
function reposition(event,api,pos,viewport){if(!elems.tip){return;}
var newCorner=self.corner.clone(),adjust=pos.adjusted,method=qTip.options.position.adjust.method.split(' '),horizontal=method[0],vertical=method[1]||method[0],shift={left:FALSE,top:FALSE,x:0,y:0},offset,css={},props;if(self.corner.fixed!==TRUE){if(horizontal===SHIFT&&newCorner.precedance===X&&adjust.left&&newCorner.y!==CENTER){newCorner.precedance=newCorner.precedance===X?Y:X;}
else if(horizontal!==SHIFT&&adjust.left){newCorner.x=newCorner.x===CENTER?(adjust.left>0?LEFT:RIGHT):(newCorner.x===LEFT?RIGHT:LEFT);}
if(vertical===SHIFT&&newCorner.precedance===Y&&adjust.top&&newCorner.x!==CENTER){newCorner.precedance=newCorner.precedance===Y?X:Y;}
else if(vertical!==SHIFT&&adjust.top){newCorner.y=newCorner.y===CENTER?(adjust.top>0?TOP:BOTTOM):(newCorner.y===TOP?BOTTOM:TOP);}
if(newCorner.string()!==cache.corner.string()&&(cache.top!==adjust.top||cache.left!==adjust.left)){self.update(newCorner,FALSE);}}
offset=self.position(newCorner,adjust);offset[newCorner.x]+=parseWidth(newCorner,newCorner.x);offset[newCorner.y]+=parseWidth(newCorner,newCorner.y);if(offset.right!==undefined){offset.left=-offset.right;}
if(offset.bottom!==undefined){offset.top=-offset.bottom;}
offset.user=Math.max(0,opts.offset);if(shift.left=(horizontal===SHIFT&&!!adjust.left)){if(newCorner.x===CENTER){css[MARGIN+'-left']=shift.x=offset[MARGIN+'-left']-adjust.left;}
else{props=offset.right!==undefined?[adjust.left,-offset.left]:[-adjust.left,offset.left];if((shift.x=Math.max(props[0],props[1]))>props[0]){pos.left-=adjust.left;shift.left=FALSE;}
css[offset.right!==undefined?RIGHT:LEFT]=shift.x;}}
if(shift.top=(vertical===SHIFT&&!!adjust.top)){if(newCorner.y===CENTER){css[MARGIN+'-top']=shift.y=offset[MARGIN+'-top']-adjust.top;}
else{props=offset.bottom!==undefined?[adjust.top,-offset.top]:[-adjust.top,offset.top];if((shift.y=Math.max(props[0],props[1]))>props[0]){pos.top-=adjust.top;shift.top=FALSE;}
css[offset.bottom!==undefined?BOTTOM:TOP]=shift.y;}}
elems.tip.css(css).toggle(!((shift.x&&shift.y)||(newCorner.x===CENTER&&shift.y)||(newCorner.y===CENTER&&shift.x)));pos.left-=offset.left.charAt?offset.user:horizontal!==SHIFT||shift.top||!shift.left&&!shift.top?offset.left:0;pos.top-=offset.top.charAt?offset.user:vertical!==SHIFT||shift.left||!shift.left&&!shift.top?offset.top:0;cache.left=adjust.left;cache.top=adjust.top;cache.corner=newCorner.clone();}
$.extend(self,{init:function()
{var enabled=parseCorner()&&(HASCANVAS||PLUGINS.ie);if(enabled){self.create();self.update();tooltip.unbind(TIPNS).bind('tooltipmove'+TIPNS,reposition);}
return enabled;},create:function()
{var width=size[0],height=size[1],vml;if(elems.tip){elems.tip.remove();}
elems.tip=$('<div />',{'class':'qtip-tip'}).css({width:width,height:height}).prependTo(tooltip);if(HASCANVAS){$('<canvas />').appendTo(elems.tip)[0].getContext('2d').save();}
else{vml=createVML('shape','coordorigin="0,0"','position:absolute;');elems.tip.html(vml+vml);$('*',elems.tip).bind('click'+TIPNS+' mousedown'+TIPNS,function(event){event.stopPropagation();});}},update:function(corner,position)
{var tip=elems.tip,inner=tip.children(),width=size[0],height=size[1],mimic=opts.mimic,round=Math.round,precedance,context,coords,translate,newSize;if(!corner){corner=cache.corner||self.corner;}
if(mimic===FALSE){mimic=corner;}
else{mimic=new PLUGINS.Corner(mimic);mimic.precedance=corner.precedance;if(mimic.x==='inherit'){mimic.x=corner.x;}
else if(mimic.y==='inherit'){mimic.y=corner.y;}
else if(mimic.x===mimic.y){mimic[corner.precedance]=corner[corner.precedance];}}
precedance=mimic.precedance;if(corner.precedance===X){swapDimensions();}
else{resetDimensions();}
elems.tip.css({width:(width=size[0]),height:(height=size[1])});parseColours(elems,corner);if(color.border!==TRANSPARENT){border=parseWidth(corner);if(opts.border===0&&border>0){color.fill=color.border;}
self.border=border=opts.border!==TRUE?opts.border:border;}
else{self.border=border=0;}
coords=calculateTip(mimic,width,height);self.size=newSize=calculateSize(size,corner,border);tip.css({width:newSize[0],height:newSize[1],lineHeight:newSize[1]+'px'});if(corner.precedance===Y){translate=[round(mimic.x===LEFT?border:mimic.x===RIGHT?newSize[0]-width-border:(newSize[0]-width)/2),round(mimic.y===TOP?newSize[1]-height:0)];}
else{translate=[round(mimic.x===LEFT?newSize[0]-width:0),round(mimic.y===TOP?border:mimic.y===BOTTOM?newSize[1]-height-border:(newSize[1]-height)/2)];}
if(HASCANVAS){inner.attr({width:newSize[0],height:newSize[1]});context=inner[0].getContext('2d');context.restore();context.save();context.clearRect(0,0,3000,3000);context.fillStyle=color.fill;context.strokeStyle=color.border;context.lineWidth=border*2;context.lineJoin='miter';context.miterLimit=100;context.translate(translate[0],translate[1]);context.beginPath();context.moveTo(coords[0][0],coords[0][1]);context.lineTo(coords[1][0],coords[1][1]);context.lineTo(coords[2][0],coords[2][1]);context.closePath();if(border){if(tooltip.css('background-clip')==='border-box'){context.strokeStyle=color.fill;context.stroke();}
context.strokeStyle=color.border;context.stroke();}
context.fill();}
else{coords='m'+coords[0][0]+','+coords[0][1]+' l'+coords[1][0]+','+coords[1][1]+' '+coords[2][0]+','+coords[2][1]+' xe';translate[2]=border&&/^(r|b)/i.test(corner.string())?PLUGINS.ie===8?2:1:0;inner.css({coordsize:(width+border)+' '+(height+border),antialias:''+(mimic.string().indexOf(CENTER)>-1),left:translate[0],top:translate[1],width:width+border,height:height+border}).each(function(i){var $this=$(this);$this[$this.prop?'prop':'attr']({coordsize:(width+border)+' '+(height+border),path:coords,fillcolor:color.fill,filled:!!i,stroked:!i}).toggle(!!(border||i));!i&&$this.html(createVML('stroke','weight="'+(border*2)+'px" color="'+color.border+'" miterlimit="1000" joinstyle="miter"'));});}
setTimeout(function(){elems.tip.css({display:'inline-block',visibility:'visible'});},1);if(position!==FALSE){self.position(corner);}},position:function(corner)
{var tip=elems.tip,position={},userOffset=Math.max(0,opts.offset),isWidget=tooltip.hasClass('ui-widget'),precedance,dimensions,corners;if(opts.corner===FALSE||!tip){return FALSE;}
corner=corner||self.corner;precedance=corner.precedance;dimensions=calculateSize(size,corner,border);corners=[corner.x,corner.y];if(precedance===X){corners.reverse();}
$.each(corners,function(i,side){var b,bc,br;if(side===CENTER){b=precedance===Y?LEFT:TOP;position[b]='50%';position[MARGIN+'-'+b]=-Math.round(dimensions[precedance===Y?0:1]/2)+userOffset;}
else{b=parseWidth(corner,side,isWidget?tooltip:NULL);bc=parseWidth(corner,side,isWidget?NULL:elems.content);br=parseRadius(corner);position[side]=Math.max(-border,i?bc:(userOffset+(br>b?br:-b)));}});position[corner[precedance]]-=dimensions[precedance===X?0:1];tip.css({top:'',bottom:'',left:'',right:'',margin:''}).css(position);return position;},destroy:function()
{tooltip.unbind(TIPNS);if(elems.tip){elems.tip.find('*').remove().end().remove();}
delete self.corner;delete self.mimic;delete self.size;}});self.init();}
TIP=PLUGINS.tip=function(api)
{var self=api.plugins.tip;return'object'===typeof self?self:(api.plugins.tip=new Tip(api));};TIP.initialize='render';TIP.sanitize=function(options)
{var style=options.style,opts;if(style&&'tip'in style){opts=options.style.tip;if(typeof opts!=='object'){options.style.tip={corner:opts};}
if(!(/string|boolean/i).test(typeof opts.corner)){opts.corner=TRUE;}
if(typeof opts.width!=='number'){delete opts.width;}
if(typeof opts.height!=='number'){delete opts.height;}
if(typeof opts.border!=='number'&&opts.border!==TRUE){delete opts.border;}
if(typeof opts.offset!=='number'){delete opts.offset;}}};$.extend(TRUE,QTIP.defaults,{style:{tip:{corner:TRUE,mimic:FALSE,width:6,height:6,border:TRUE,offset:0}}});var MODAL,OVERLAY,MODALCLASS='qtip-modal',MODALSELECTOR='.'+MODALCLASS;OVERLAY=function()
{var self=this,focusableElems={},current,onLast,prevState,elem;function focusable(element){if($.expr[':'].focusable){return $.expr[':'].focusable;}
var isTabIndexNotNaN=!isNaN($.attr(element,'tabindex')),nodeName=element.nodeName&&element.nodeName.toLowerCase(),map,mapName,img;if('area'===nodeName){map=element.parentNode;mapName=map.name;if(!element.href||!mapName||map.nodeName.toLowerCase()!=='map'){return false;}
img=$('img[usemap=#'+mapName+']')[0];return!!img&&img.is(':visible');}
return(/input|select|textarea|button|object/.test(nodeName)?!element.disabled:'a'===nodeName?element.href||isTabIndexNotNaN:isTabIndexNotNaN);}
function focusInputs(blurElems){if(focusableElems.length<1&&blurElems.length){blurElems.not('body').blur();}
else{focusableElems.first().focus();}}
function stealFocus(event){if(!elem.is(':visible')){return;}
var target=$(event.target),tooltip=current.elements.tooltip,container=target.closest(selector),targetOnTop;targetOnTop=container.length<1?FALSE:(parseInt(container[0].style.zIndex,10)>parseInt(tooltip[0].style.zIndex,10));if(!targetOnTop&&target.closest(selector)[0]!==tooltip[0]){focusInputs(target);}
onLast=event.target===focusableElems[focusableElems.length-1];}
$.extend(self,{init:function()
{elem=self.elem=$('<div />',{id:'qtip-overlay',html:'<div></div>',mousedown:function(){return FALSE;}}).hide();function resize(){var win=$(this);elem.css({height:win.height(),width:win.width()});}
$(window).bind('resize'+MODALSELECTOR,resize);resize();$(document.body).bind('focusin'+MODALSELECTOR,stealFocus);$(document).bind('keydown'+MODALSELECTOR,function(event){if(current&&current.options.show.modal.escape&&event.keyCode===27){current.hide(event);}});elem.bind('click'+MODALSELECTOR,function(event){if(current&&current.options.show.modal.blur){current.hide(event);}});return self;},update:function(api){current=api;if(api.options.show.modal.stealfocus!==FALSE){focusableElems=api.elements.tooltip.find('*').filter(function(){return focusable(this);});}
else{focusableElems=[];}},toggle:function(api,state,duration)
{var docBody=$(document.body),tooltip=api.elements.tooltip,options=api.options.show.modal,effect=options.effect,type=state?'show':'hide',visible=elem.is(':visible'),visibleModals=$(MODALSELECTOR).filter(':visible:not(:animated)').not(tooltip),zindex;self.update(api);if(state&&options.stealfocus!==FALSE){focusInputs($(':focus'));}
elem.toggleClass('blurs',options.blur);if(state){elem.css({left:0,top:0}).appendTo(document.body);}
if((elem.is(':animated')&&visible===state&&prevState!==FALSE)||(!state&&visibleModals.length)){return self;}
elem.stop(TRUE,FALSE);if($.isFunction(effect)){effect.call(elem,state);}
else if(effect===FALSE){elem[type]();}
else{elem.fadeTo(parseInt(duration,10)||90,state?1:0,function(){if(!state){elem.hide();}});}
if(!state){elem.queue(function(next){elem.css({left:'',top:''});if(!$(MODALSELECTOR).length){elem.detach();}
next();});}
prevState=state;if(current.destroyed){current=NULL;}
return self;}});self.init();};OVERLAY=new OVERLAY();function Modal(api)
{var self=this,options=api.options.show.modal,elems=api.elements,tooltip=elems.tooltip,namespace=MODALSELECTOR+api.id,overlay;api.checks.modal={'^show.modal.(on|blur)$':function(){self.destroy();self.init();overlay.toggle(tooltip.is(':visible'));}};$.extend(self,{init:function()
{if(!options.on){return self;}
overlay=elems.overlay=OVERLAY.elem;tooltip.addClass(MODALCLASS).css('z-index',PLUGINS.modal.zindex+$(MODALSELECTOR).length).bind('tooltipshow'+namespace+' tooltiphide'+namespace,function(event,api,duration){var oEvent=event.originalEvent;if(event.target===tooltip[0]){if(oEvent&&event.type==='tooltiphide'&&/mouse(leave|enter)/.test(oEvent.type)&&$(oEvent.relatedTarget).closest(overlay[0]).length){try{event.preventDefault();}catch(e){}}
else if(!oEvent||(oEvent&&!oEvent.solo)){self.toggle(event,event.type==='tooltipshow',duration);}}}).bind('tooltipfocus'+namespace,function(event,api){if(event.isDefaultPrevented()||event.target!==tooltip[0]){return;}
var qtips=$(MODALSELECTOR),newIndex=PLUGINS.modal.zindex+qtips.length,curIndex=parseInt(tooltip[0].style.zIndex,10);overlay[0].style.zIndex=newIndex-1;qtips.each(function(){if(this.style.zIndex>curIndex){this.style.zIndex-=1;}});qtips.filter('.'+focusClass).qtip('blur',event.originalEvent);tooltip.addClass(focusClass)[0].style.zIndex=newIndex;OVERLAY.update(api);try{event.preventDefault();}catch(e){}}).bind('tooltiphide'+namespace,function(event){if(event.target===tooltip[0]){$(MODALSELECTOR).filter(':visible').not(tooltip).last().qtip('focus',event);}});return self;},toggle:function(event,state,duration)
{if(event&&event.isDefaultPrevented()){return self;}
OVERLAY.toggle(api,!!state,duration);return self;},destroy:function(){tooltip.removeClass(MODALCLASS);tooltip.add(document).unbind(namespace);OVERLAY.toggle(api,FALSE);delete elems.overlay;}});self.init();}
MODAL=PLUGINS.modal=function(api){var self=api.plugins.modal;return'object'===typeof self?self:(api.plugins.modal=new Modal(api));};MODAL.sanitize=function(opts){if(opts.show){if(typeof opts.show.modal!=='object'){opts.show.modal={on:!!opts.show.modal};}
else if(typeof opts.show.modal.on==='undefined'){opts.show.modal.on=TRUE;}}};MODAL.zindex=QTIP.zindex-200;MODAL.initialize='render';$.extend(TRUE,QTIP.defaults,{show:{modal:{on:FALSE,effect:TRUE,blur:TRUE,stealfocus:TRUE,escape:TRUE}}});PLUGINS.viewport=function(api,position,posOptions,targetWidth,targetHeight,elemWidth,elemHeight)
{var target=posOptions.target,tooltip=api.elements.tooltip,my=posOptions.my,at=posOptions.at,adjust=posOptions.adjust,method=adjust.method.split(' '),methodX=method[0],methodY=method[1]||method[0],viewport=posOptions.viewport,container=posOptions.container,cache=api.cache,tip=api.plugins.tip,adjusted={left:0,top:0},fixed,newMy,newClass;if(!viewport.jquery||target[0]===window||target[0]===document.body||adjust.method==='none'){return adjusted;}
fixed=tooltip.css('position')==='fixed';viewport={elem:viewport,height:viewport[(viewport[0]===window?'h':'outerH')+'eight'](),width:viewport[(viewport[0]===window?'w':'outerW')+'idth'](),scrollleft:fixed?0:viewport.scrollLeft(),scrolltop:fixed?0:viewport.scrollTop(),offset:viewport.offset()||{left:0,top:0}};container={elem:container,scrollLeft:container.scrollLeft(),scrollTop:container.scrollTop(),offset:container.offset()||{left:0,top:0}};function calculate(side,otherSide,type,adjust,side1,side2,lengthName,targetLength,elemLength){var initialPos=position[side1],mySide=my[side],atSide=at[side],isShift=type===SHIFT,viewportScroll=-container.offset[side1]+viewport.offset[side1]+viewport['scroll'+side1],myLength=mySide===side1?elemLength:mySide===side2?-elemLength:-elemLength/2,atLength=atSide===side1?targetLength:atSide===side2?-targetLength:-targetLength/2,tipLength=tip&&tip.size?tip.size[lengthName]||0:0,tipAdjust=tip&&tip.corner&&tip.corner.precedance===side&&!isShift?tipLength:0,overflow1=viewportScroll-initialPos+tipAdjust,overflow2=initialPos+elemLength-viewport[lengthName]-viewportScroll+tipAdjust,offset=myLength-(my.precedance===side||mySide===my[otherSide]?atLength:0)-(atSide===CENTER?targetLength/2:0);if(isShift){tipAdjust=tip&&tip.corner&&tip.corner.precedance===otherSide?tipLength:0;offset=(mySide===side1?1:-1)*myLength-tipAdjust;position[side1]+=overflow1>0?overflow1:overflow2>0?-overflow2:0;position[side1]=Math.max(-container.offset[side1]+viewport.offset[side1]+(tipAdjust&&tip.corner[side]===CENTER?tip.offset:0),initialPos-offset,Math.min(Math.max(-container.offset[side1]+viewport.offset[side1]+viewport[lengthName],initialPos+offset),position[side1]));}
else{adjust*=(type===FLIPINVERT?2:0);if(overflow1>0&&(mySide!==side1||overflow2>0)){position[side1]-=offset+adjust;newMy['invert'+side](side1);}
else if(overflow2>0&&(mySide!==side2||overflow1>0)){position[side1]-=(mySide===CENTER?-offset:offset)+adjust;newMy['invert'+side](side2);}
if(position[side1]<viewportScroll&&-position[side1]>overflow2){position[side1]=initialPos;newMy=my.clone();}}
return position[side1]-initialPos;}
if(methodX!=='shift'||methodY!=='shift'){newMy=my.clone();}
adjusted={left:methodX!=='none'?calculate(X,Y,methodX,adjust.x,LEFT,RIGHT,WIDTH,targetWidth,elemWidth):0,top:methodY!=='none'?calculate(Y,X,methodY,adjust.y,TOP,BOTTOM,HEIGHT,targetHeight,elemHeight):0};if(newMy&&cache.lastClass!==(newClass=NAMESPACE+'-pos-'+newMy.abbrev())){tooltip.removeClass(api.cache.lastClass).addClass((api.cache.lastClass=newClass));}
return adjusted;};PLUGINS.imagemap=function(api,area,corner,adjustMethod)
{if(!area.jquery){area=$(area);}
var cache=(api.cache.areas={}),shape=(area[0].shape||area.attr('shape')).toLowerCase(),coordsString=area[0].coords||area.attr('coords'),baseCoords=coordsString.split(','),coords=[],image=$('img[usemap="#'+area.parent('map').attr('name')+'"]'),imageOffset=image.offset(),result={width:0,height:0,position:{top:1e10,right:0,bottom:0,left:1e10}},i=0,next=0,dimensions;function polyCoordinates(result,coords,corner)
{var i=0,compareX=1,compareY=1,realX=0,realY=0,newWidth=result.width,newHeight=result.height;while(newWidth>0&&newHeight>0&&compareX>0&&compareY>0)
{newWidth=Math.floor(newWidth/2);newHeight=Math.floor(newHeight/2);if(corner.x===LEFT){compareX=newWidth;}
else if(corner.x===RIGHT){compareX=result.width-newWidth;}
else{compareX+=Math.floor(newWidth/2);}
if(corner.y===TOP){compareY=newHeight;}
else if(corner.y===BOTTOM){compareY=result.height-newHeight;}
else{compareY+=Math.floor(newHeight/2);}
i=coords.length;while(i--)
{if(coords.length<2){break;}
realX=coords[i][0]-result.position.left;realY=coords[i][1]-result.position.top;if((corner.x===LEFT&&realX>=compareX)||(corner.x===RIGHT&&realX<=compareX)||(corner.x===CENTER&&(realX<compareX||realX>(result.width-compareX)))||(corner.y===TOP&&realY>=compareY)||(corner.y===BOTTOM&&realY<=compareY)||(corner.y===CENTER&&(realY<compareY||realY>(result.height-compareY)))){coords.splice(i,1);}}}
return{left:coords[0][0],top:coords[0][1]};}
imageOffset.left+=Math.ceil((image.outerWidth()-image.width())/2);imageOffset.top+=Math.ceil((image.outerHeight()-image.height())/2);if(shape==='poly'){i=baseCoords.length;while(i--)
{next=[parseInt(baseCoords[--i],10),parseInt(baseCoords[i+1],10)];if(next[0]>result.position.right){result.position.right=next[0];}
if(next[0]<result.position.left){result.position.left=next[0];}
if(next[1]>result.position.bottom){result.position.bottom=next[1];}
if(next[1]<result.position.top){result.position.top=next[1];}
coords.push(next);}}
else{i=-1;while(i++<baseCoords.length){coords.push(parseInt(baseCoords[i],10));}}
switch(shape)
{case'rect':result={width:Math.abs(coords[2]-coords[0]),height:Math.abs(coords[3]-coords[1]),position:{left:Math.min(coords[0],coords[2]),top:Math.min(coords[1],coords[3])}};break;case'circle':result={width:coords[2]+2,height:coords[2]+2,position:{left:coords[0],top:coords[1]}};break;case'poly':result.width=Math.abs(result.position.right-result.position.left);result.height=Math.abs(result.position.bottom-result.position.top);if(corner.abbrev()==='c'){result.position={left:result.position.left+(result.width/2),top:result.position.top+(result.height/2)};}
else{if(!cache[corner+coordsString]){result.position=polyCoordinates(result,coords.slice(),corner);if(adjustMethod&&(adjustMethod[0]==='flip'||adjustMethod[1]==='flip')){result.offset=polyCoordinates(result,coords.slice(),{x:corner.x===LEFT?RIGHT:corner.x===RIGHT?LEFT:CENTER,y:corner.y===TOP?BOTTOM:corner.y===BOTTOM?TOP:CENTER});result.offset.left-=result.position.left;result.offset.top-=result.position.top;}
cache[corner+coordsString]=result;}
result=cache[corner+coordsString];}
result.width=result.height=0;break;}
result.position.left+=imageOffset.left;result.position.top+=imageOffset.top;return result;};var IE6;function Ie6(api)
{var self=this,elems=api.elements,options=api.options,tooltip=elems.tooltip,namespace='.ie6-'+api.id,bgiframe=$('select, object').length<1,isDrawing=0,modalProcessed=FALSE,redrawContainer;api.checks.ie6={'^content|style$':function(obj,o,v){redraw();}};$.extend(self,{init:function()
{var win=$(window),scroll;if(bgiframe){elems.bgiframe=$('<iframe class="qtip-bgiframe" frameborder="0" tabindex="-1" src="javascript:\'\';" '+' style="display:block; position:absolute; z-index:-1; filter:alpha(opacity=0); '+'-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)";"></iframe>');elems.bgiframe.appendTo(tooltip);tooltip.bind('tooltipmove'+namespace,self.adjustBGIFrame);}
redrawContainer=$('<div/>',{id:'qtip-rcontainer'}).appendTo(document.body);self.redraw();if(elems.overlay&&!modalProcessed){scroll=function(){elems.overlay[0].style.top=win.scrollTop()+'px';};win.bind('scroll.qtip-ie6, resize.qtip-ie6',scroll);scroll();elems.overlay.addClass('qtipmodal-ie6fix');modalProcessed=TRUE;}},adjustBGIFrame:function()
{var dimensions=api.get('dimensions'),plugin=api.plugins.tip,tip=elems.tip,tipAdjust,offset;offset=parseInt(tooltip.css('border-left-width'),10)||0;offset={left:-offset,top:-offset};if(plugin&&tip){tipAdjust=(plugin.corner.precedance==='x')?['width','left']:['height','top'];offset[tipAdjust[1]]-=tip[tipAdjust[0]]();}
elems.bgiframe.css(offset).css(dimensions);},redraw:function()
{if(api.rendered<1||isDrawing){return self;}
var style=options.style,container=options.position.container,perc,width,max,min;isDrawing=1;if(style.height){tooltip.css(HEIGHT,style.height);}
if(style.width){tooltip.css(WIDTH,style.width);}
else{tooltip.css(WIDTH,'').appendTo(redrawContainer);width=tooltip.width();if(width%2<1){width+=1;}
max=tooltip.css('max-width')||'';min=tooltip.css('min-width')||'';perc=(max+min).indexOf('%')>-1?container.width()/100:0;max=((max.indexOf('%')>-1?perc:1)*parseInt(max,10))||width;min=((min.indexOf('%')>-1?perc:1)*parseInt(min,10))||0;width=max+min?Math.min(Math.max(width,min),max):width;tooltip.css(WIDTH,Math.round(width)).appendTo(container);}
isDrawing=0;return self;},destroy:function()
{if(bgiframe){elems.bgiframe.remove();}
tooltip.unbind(namespace);}});self.init();}
IE6=PLUGINS.ie6=function(api)
{var self=api.plugins.ie6;if(PLUGINS.ie!==6){return FALSE;}
return'object'===typeof self?self:(api.plugins.ie6=new Ie6(api));};IE6.initialize='render';}));}(window,document));(function($,undefined){;;var defaults={defaultView:'month',aspectRatio:1.35,header:{left:'title',center:'',right:'today prev,next'},weekends:true,weekNumbers:false,weekNumberCalculation:'iso',weekNumberTitle:'W',allDayDefault:true,ignoreTimezone:true,lazyFetching:true,startParam:'start',endParam:'end',titleFormat:{month:'MMMM yyyy',week:"MMM d[ yyyy]{ '&#8212;'[ MMM] d yyyy}",day:'dddd, MMM d, yyyy'},columnFormat:{month:'ddd',week:'ddd M/d',day:'dddd M/d'},timeFormat:{'':'h(:mm)t'},isRTL:false,firstDay:0,monthNames:['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],monthNamesShort:['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'],dayNames:['Domenica','Lunedi','Martedi','Mercoledi','Giovedi','Venerdi','Sabato'],dayNamesShort:['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],buttonText:{prev:"<span class='fc-text-arrow'>&lsaquo;</span>",next:"<span class='fc-text-arrow'>&rsaquo;</span>",prevYear:"<span class='fc-text-arrow'>&laquo;</span>",nextYear:"<span class='fc-text-arrow'>&raquo;</span>",today:'Oggi',month:'Mese',week:'Settimana',day:'Giorno'},theme:false,buttonIcons:{prev:'circle-triangle-w',next:'circle-triangle-e'},unselectAuto:true,dropAccept:'*'};var rtlDefaults={header:{left:'next,prev today',center:'',right:'title'},buttonText:{prev:"<span class='fc-text-arrow'>&rsaquo;</span>",next:"<span class='fc-text-arrow'>&lsaquo;</span>",prevYear:"<span class='fc-text-arrow'>&raquo;</span>",nextYear:"<span class='fc-text-arrow'>&laquo;</span>"},buttonIcons:{prev:'circle-triangle-e',next:'circle-triangle-w'}};;;var fc=$.fullCalendar={version:"1.6.1"};var fcViews=fc.views={};$.fn.fullCalendar=function(options){if(typeof options=='string'){var args=Array.prototype.slice.call(arguments,1);var res;this.each(function(){var calendar=$.data(this,'fullCalendar');if(calendar&&$.isFunction(calendar[options])){var r=calendar[options].apply(calendar,args);if(res===undefined){res=r;}
if(options=='destroy'){$.removeData(this,'fullCalendar');}}});if(res!==undefined){return res;}
return this;}
var eventSources=options.eventSources||[];delete options.eventSources;if(options.events){eventSources.push(options.events);delete options.events;}
options=$.extend(true,{},defaults,(options.isRTL||options.isRTL===undefined&&defaults.isRTL)?rtlDefaults:{},options);this.each(function(i,_element){var element=$(_element);var calendar=new Calendar(element,options,eventSources);element.data('fullCalendar',calendar);calendar.render();});return this;};function setDefaults(d){$.extend(true,defaults,d);};;function Calendar(element,options,eventSources){var t=this;t.options=options;t.render=render;t.destroy=destroy;t.refetchEvents=refetchEvents;t.reportEvents=reportEvents;t.reportEventChange=reportEventChange;t.rerenderEvents=rerenderEvents;t.changeView=changeView;t.select=select;t.unselect=unselect;t.prev=prev;t.next=next;t.prevYear=prevYear;t.nextYear=nextYear;t.today=today;t.gotoDate=gotoDate;t.incrementDate=incrementDate;t.formatDate=function(format,date){return formatDate(format,date,options)};t.formatDates=function(format,date1,date2){return formatDates(format,date1,date2,options)};t.getDate=getDate;t.getView=getView;t.option=option;t.trigger=trigger;EventManager.call(t,options,eventSources);var isFetchNeeded=t.isFetchNeeded;var fetchEvents=t.fetchEvents;var _element=element[0];var header;var headerElement;var content;var tm;var currentView;var viewInstances={};var elementOuterWidth;var suggestedViewHeight;var absoluteViewElement;var resizeUID=0;var ignoreWindowResize=0;var date=new Date();var events=[];var _dragElement;setYMD(date,options.year,options.month,options.date);function render(inc){if(!content){initialRender();}else{calcSize();markSizesDirty();markEventsDirty();renderView(inc);}}
function initialRender(){tm=options.theme?'ui':'fc';element.addClass('fc');if(options.isRTL){element.addClass('fc-rtl');}
else{element.addClass('fc-ltr');}
if(options.theme){element.addClass('ui-widget');}
content=$("<div class='fc-content' style='position:relative'/>").prependTo(element);header=new Header(t,options);headerElement=header.render();if(headerElement){element.prepend(headerElement);}
changeView(options.defaultView);$(window).resize(windowResize);if(!bodyVisible()){lateRender();}}
function lateRender(){setTimeout(function(){if(!currentView.start&&bodyVisible()){renderView();}},0);}
function destroy(){$(window).unbind('resize',windowResize);header.destroy();content.remove();element.removeClass('fc fc-rtl ui-widget');}
function elementVisible(){return _element.offsetWidth!==0;}
function bodyVisible(){return $('body')[0].offsetWidth!==0;}
function changeView(newViewName){if(!currentView||newViewName!=currentView.name){ignoreWindowResize++;unselect();var oldView=currentView;var newViewElement;if(oldView){(oldView.beforeHide||noop)();setMinHeight(content,content.height());oldView.element.hide();}else{setMinHeight(content,1);}
content.css('overflow','hidden');currentView=viewInstances[newViewName];if(currentView){currentView.element.show();}else{currentView=viewInstances[newViewName]=new fcViews[newViewName](newViewElement=absoluteViewElement=$("<div class='fc-view fc-view-"+newViewName+"' style='position:absolute'/>").appendTo(content),t);}
if(oldView){header.deactivateButton(oldView.name);}
header.activateButton(newViewName);renderView();content.css('overflow','');if(oldView){setMinHeight(content,1);}
if(!newViewElement){(currentView.afterShow||noop)();}
ignoreWindowResize--;}}
function renderView(inc){if(elementVisible()){ignoreWindowResize++;unselect();if(suggestedViewHeight===undefined){calcSize();}
var forceEventRender=false;if(!currentView.start||inc||date<currentView.start||date>=currentView.end){currentView.render(date,inc||0);setSize(true);forceEventRender=true;}
else if(currentView.sizeDirty){currentView.clearEvents();setSize();forceEventRender=true;}
else if(currentView.eventsDirty){currentView.clearEvents();forceEventRender=true;}
currentView.sizeDirty=false;currentView.eventsDirty=false;updateEvents(forceEventRender);elementOuterWidth=element.outerWidth();header.updateTitle(currentView.title);var today=new Date();if(today>=currentView.start&&today<currentView.end){header.disableButton('today');}else{header.enableButton('today');}
ignoreWindowResize--;currentView.trigger('viewDisplay',_element);}}
function updateSize(){markSizesDirty();if(elementVisible()){calcSize();setSize();unselect();currentView.clearEvents();currentView.renderEvents(events);currentView.sizeDirty=false;}}
function markSizesDirty(){$.each(viewInstances,function(i,inst){inst.sizeDirty=true;});}
function calcSize(){if(options.contentHeight){suggestedViewHeight=options.contentHeight;}
else if(options.height){suggestedViewHeight=options.height-(headerElement?headerElement.height():0)-vsides(content);}
else{suggestedViewHeight=Math.round(content.width()/Math.max(options.aspectRatio,.5));}}
function setSize(dateChanged){ignoreWindowResize++;currentView.setHeight(suggestedViewHeight,dateChanged);if(absoluteViewElement){absoluteViewElement.css('position','relative');absoluteViewElement=null;}
currentView.setWidth(content.width(),dateChanged);ignoreWindowResize--;}
function windowResize(){if(!ignoreWindowResize){if(currentView.start){var uid=++resizeUID;setTimeout(function(){if(uid==resizeUID&&!ignoreWindowResize&&elementVisible()){if(elementOuterWidth!=(elementOuterWidth=element.outerWidth())){ignoreWindowResize++;updateSize();currentView.trigger('windowResize',_element);ignoreWindowResize--;}}},200);}else{lateRender();}}}
function updateEvents(forceRender){if(!options.lazyFetching||isFetchNeeded(currentView.visStart,currentView.visEnd)){refetchEvents();}
else if(forceRender){rerenderEvents();}}
function refetchEvents(){fetchEvents(currentView.visStart,currentView.visEnd);}
function reportEvents(_events){events=_events;rerenderEvents();}
function reportEventChange(eventID){rerenderEvents(eventID);}
function rerenderEvents(modifiedEventID){markEventsDirty();if(elementVisible()){currentView.clearEvents();currentView.renderEvents(events,modifiedEventID);currentView.eventsDirty=false;}}
function markEventsDirty(){$.each(viewInstances,function(i,inst){inst.eventsDirty=true;});}
function select(start,end,allDay){currentView.select(start,end,allDay===undefined?true:allDay);}
function unselect(){if(currentView){currentView.unselect();}}
function prev(){renderView(-1);}
function next(){renderView(1);}
function prevYear(){addYears(date,-1);renderView();}
function nextYear(){addYears(date,1);renderView();}
function today(){date=new Date();renderView();}
function gotoDate(year,month,dateOfMonth){if(year instanceof Date){date=cloneDate(year);}else{setYMD(date,year,month,dateOfMonth);}
renderView();}
function incrementDate(years,months,days){if(years!==undefined){addYears(date,years);}
if(months!==undefined){addMonths(date,months);}
if(days!==undefined){addDays(date,days);}
renderView();}
function getDate(){return cloneDate(date);}
function getView(){return currentView;}
function option(name,value){if(value===undefined){return options[name];}
if(name=='height'||name=='contentHeight'||name=='aspectRatio'){options[name]=value;updateSize();}}
function trigger(name,thisObj){if(options[name]){return options[name].apply(thisObj||_element,Array.prototype.slice.call(arguments,2));}}
if(options.droppable){$(document).bind('dragstart',function(ev,ui){var _e=ev.target;var e=$(_e);if(!e.parents('.fc').length){var accept=options.dropAccept;if($.isFunction(accept)?accept.call(_e,e):e.is(accept)){_dragElement=_e;currentView.dragStart(_dragElement,ev,ui);}}}).bind('dragstop',function(ev,ui){if(_dragElement){currentView.dragStop(_dragElement,ev,ui);_dragElement=null;}});}};;function Header(calendar,options){var t=this;t.render=render;t.destroy=destroy;t.updateTitle=updateTitle;t.activateButton=activateButton;t.deactivateButton=deactivateButton;t.disableButton=disableButton;t.enableButton=enableButton;var element=$([]);var tm;function render(){tm=options.theme?'ui':'fc';var sections=options.header;if(sections){element=$("<table class='fc-header' style='width:100%'/>").append($("<tr/>").append(renderSection('left')).append(renderSection('center')).append(renderSection('right')));return element;}}
function destroy(){element.remove();}
function renderSection(position){var e=$("<td class='fc-header-"+position+"'/>");var buttonStr=options.header[position];if(buttonStr){$.each(buttonStr.split(' '),function(i){if(i>0){e.append("<span class='fc-header-space'/>");}
var prevButton;$.each(this.split(','),function(j,buttonName){if(buttonName=='title'){e.append("<span class='fc-header-title'><h2>&nbsp;</h2></span>");if(prevButton){prevButton.addClass(tm+'-corner-right');}
prevButton=null;}else{var buttonClick;if(calendar[buttonName]){buttonClick=calendar[buttonName];}
else if(fcViews[buttonName]){buttonClick=function(){button.removeClass(tm+'-state-hover');calendar.changeView(buttonName);};}
if(buttonClick){var icon=options.theme?smartProperty(options.buttonIcons,buttonName):null;var text=smartProperty(options.buttonText,buttonName);var button=$("<span class='fc-button fc-button-"+buttonName+" "+tm+"-state-default'>"+
(icon?"<span class='fc-icon-wrap'>"+"<span class='ui-icon ui-icon-"+icon+"'/>"+"</span>":text)+"</span>").click(function(){if(!button.hasClass(tm+'-state-disabled')){buttonClick();}}).mousedown(function(){button.not('.'+tm+'-state-active').not('.'+tm+'-state-disabled').addClass(tm+'-state-down');}).mouseup(function(){button.removeClass(tm+'-state-down');}).hover(function(){button.not('.'+tm+'-state-active').not('.'+tm+'-state-disabled').addClass(tm+'-state-hover');},function(){button.removeClass(tm+'-state-hover').removeClass(tm+'-state-down');}).appendTo(e);disableTextSelection(button);if(!prevButton){button.addClass(tm+'-corner-left');}
prevButton=button;}}});if(prevButton){prevButton.addClass(tm+'-corner-right');}});}
return e;}
function updateTitle(html){element.find('h2').html(html);}
function activateButton(buttonName){element.find('span.fc-button-'+buttonName).addClass(tm+'-state-active');}
function deactivateButton(buttonName){element.find('span.fc-button-'+buttonName).removeClass(tm+'-state-active');}
function disableButton(buttonName){element.find('span.fc-button-'+buttonName).addClass(tm+'-state-disabled');}
function enableButton(buttonName){element.find('span.fc-button-'+buttonName).removeClass(tm+'-state-disabled');}};;fc.sourceNormalizers=[];fc.sourceFetchers=[];var ajaxDefaults={dataType:'json',cache:false};var eventGUID=1;function EventManager(options,_sources){var t=this;t.isFetchNeeded=isFetchNeeded;t.fetchEvents=fetchEvents;t.addEventSource=addEventSource;t.removeEventSource=removeEventSource;t.updateEvent=updateEvent;t.renderEvent=renderEvent;t.removeEvents=removeEvents;t.clientEvents=clientEvents;t.normalizeEvent=normalizeEvent;var trigger=t.trigger;var getView=t.getView;var reportEvents=t.reportEvents;var stickySource={events:[]};var sources=[stickySource];var rangeStart,rangeEnd;var currentFetchID=0;var pendingSourceCnt=0;var loadingLevel=0;var cache=[];for(var i=0;i<_sources.length;i++){_addEventSource(_sources[i]);}
function isFetchNeeded(start,end){return!rangeStart||start<rangeStart||end>rangeEnd;}
function fetchEvents(start,end){rangeStart=start;rangeEnd=end;cache=[];var fetchID=++currentFetchID;var len=sources.length;pendingSourceCnt=len;for(var i=0;i<len;i++){fetchEventSource(sources[i],fetchID);}}
function fetchEventSource(source,fetchID){_fetchEventSource(source,function(events){if(fetchID==currentFetchID){if(events){if(options.eventDataTransform){events=$.map(events,options.eventDataTransform);}
if(source.eventDataTransform){events=$.map(events,source.eventDataTransform);}
for(var i=0;i<events.length;i++){events[i].source=source;normalizeEvent(events[i]);}
cache=cache.concat(events);}
pendingSourceCnt--;if(!pendingSourceCnt){reportEvents(cache);}}});}
function _fetchEventSource(source,callback){var i;var fetchers=fc.sourceFetchers;var res;for(i=0;i<fetchers.length;i++){res=fetchers[i](source,rangeStart,rangeEnd,callback);if(res===true){return;}
else if(typeof res=='object'){_fetchEventSource(res,callback);return;}}
var events=source.events;if(events){if($.isFunction(events)){pushLoading();events(cloneDate(rangeStart),cloneDate(rangeEnd),function(events){callback(events);popLoading();});}
else if($.isArray(events)){callback(events);}
else{callback();}}else{var url=source.url;if(url){var success=source.success;var error=source.error;var complete=source.complete;var data=$.extend({},source.data||{});var startParam=firstDefined(source.startParam,options.startParam);var endParam=firstDefined(source.endParam,options.endParam);if(startParam){data[startParam]=Math.round(+rangeStart/1000);}
if(endParam){data[endParam]=Math.round(+rangeEnd/1000);}
pushLoading();$.ajax($.extend({},ajaxDefaults,source,{data:data,success:function(events){events=events||[];var res=applyAll(success,this,arguments);if($.isArray(res)){events=res;}
callback(events);},error:function(){applyAll(error,this,arguments);callback();},complete:function(){applyAll(complete,this,arguments);popLoading();}}));}else{callback();}}}
function addEventSource(source){source=_addEventSource(source);if(source){pendingSourceCnt++;fetchEventSource(source,currentFetchID);}}
function _addEventSource(source){if($.isFunction(source)||$.isArray(source)){source={events:source};}
else if(typeof source=='string'){source={url:source};}
if(typeof source=='object'){normalizeSource(source);sources.push(source);return source;}}
function removeEventSource(source){sources=$.grep(sources,function(src){return!isSourcesEqual(src,source);});cache=$.grep(cache,function(e){return!isSourcesEqual(e.source,source);});reportEvents(cache);}
function updateEvent(event){var i,len=cache.length,e,defaultEventEnd=getView().defaultEventEnd,startDelta=event.start-event._start,endDelta=event.end?(event.end-(event._end||defaultEventEnd(event))):0;for(i=0;i<len;i++){e=cache[i];if(e._id==event._id&&e!=event){e.start=new Date(+e.start+startDelta);if(event.end){if(e.end){e.end=new Date(+e.end+endDelta);}else{e.end=new Date(+defaultEventEnd(e)+endDelta);}}else{e.end=null;}
e.title=event.title;e.url=event.url;e.allDay=event.allDay;e.className=event.className;e.editable=event.editable;e.color=event.color;e.backgroudColor=event.backgroudColor;e.borderColor=event.borderColor;e.textColor=event.textColor;normalizeEvent(e);}}
normalizeEvent(event);reportEvents(cache);}
function renderEvent(event,stick){normalizeEvent(event);if(!event.source){if(stick){stickySource.events.push(event);event.source=stickySource;}
cache.push(event);}
reportEvents(cache);}
function removeEvents(filter){if(!filter){cache=[];for(var i=0;i<sources.length;i++){if($.isArray(sources[i].events)){sources[i].events=[];}}}else{if(!$.isFunction(filter)){var id=filter+'';filter=function(e){return e._id==id;};}
cache=$.grep(cache,filter,true);for(var i=0;i<sources.length;i++){if($.isArray(sources[i].events)){sources[i].events=$.grep(sources[i].events,filter,true);}}}
reportEvents(cache);}
function clientEvents(filter){if($.isFunction(filter)){return $.grep(cache,filter);}
else if(filter){filter+='';return $.grep(cache,function(e){return e._id==filter;});}
return cache;}
function pushLoading(){if(!loadingLevel++){trigger('loading',null,true);}}
function popLoading(){if(!--loadingLevel){trigger('loading',null,false);}}
function normalizeEvent(event){var source=event.source||{};var ignoreTimezone=firstDefined(source.ignoreTimezone,options.ignoreTimezone);event._id=event._id||(event.id===undefined?'_fc'+eventGUID++:event.id+'');if(event.date){if(!event.start){event.start=event.date;}
delete event.date;}
event._start=cloneDate(event.start=parseDate(event.start,ignoreTimezone));event.end=parseDate(event.end,ignoreTimezone);if(event.end&&event.end<=event.start){event.end=null;}
event._end=event.end?cloneDate(event.end):null;if(event.allDay===undefined){event.allDay=firstDefined(source.allDayDefault,options.allDayDefault);}
if(event.className){if(typeof event.className=='string'){event.className=event.className.split(/\s+/);}}else{event.className=[];}}
function normalizeSource(source){if(source.className){if(typeof source.className=='string'){source.className=source.className.split(/\s+/);}}else{source.className=[];}
var normalizers=fc.sourceNormalizers;for(var i=0;i<normalizers.length;i++){normalizers[i](source);}}
function isSourcesEqual(source1,source2){return source1&&source2&&getSourcePrimitive(source1)==getSourcePrimitive(source2);}
function getSourcePrimitive(source){return((typeof source=='object')?(source.events||source.url):'')||source;}};;fc.addDays=addDays;fc.cloneDate=cloneDate;fc.parseDate=parseDate;fc.parseISO8601=parseISO8601;fc.parseTime=parseTime;fc.formatDate=formatDate;fc.formatDates=formatDates;var dayIDs=['sun','mon','tue','wed','thu','fri','sat'],DAY_MS=86400000,HOUR_MS=3600000,MINUTE_MS=60000;function addYears(d,n,keepTime){d.setFullYear(d.getFullYear()+n);if(!keepTime){clearTime(d);}
return d;}
function addMonths(d,n,keepTime){if(+d){var m=d.getMonth()+n,check=cloneDate(d);check.setDate(1);check.setMonth(m);d.setMonth(m);if(!keepTime){clearTime(d);}
while(d.getMonth()!=check.getMonth()){d.setDate(d.getDate()+(d<check?1:-1));}}
return d;}
function addDays(d,n,keepTime){if(+d){var dd=d.getDate()+n,check=cloneDate(d);check.setHours(9);check.setDate(dd);d.setDate(dd);if(!keepTime){clearTime(d);}
fixDate(d,check);}
return d;}
function fixDate(d,check){if(+d){while(d.getDate()!=check.getDate()){d.setTime(+d+(d<check?1:-1)*HOUR_MS);}}}
function addMinutes(d,n){d.setMinutes(d.getMinutes()+n);return d;}
function clearTime(d){d.setHours(0);d.setMinutes(0);d.setSeconds(0);d.setMilliseconds(0);return d;}
function cloneDate(d,dontKeepTime){if(dontKeepTime){return clearTime(new Date(+d));}
return new Date(+d);}
function zeroDate(){var i=0,d;do{d=new Date(1970,i++,1);}while(d.getHours());return d;}
function skipWeekend(date,inc,excl){inc=inc||1;while(!date.getDay()||(excl&&date.getDay()==1||!excl&&date.getDay()==6)){addDays(date,inc);}
return date;}
function dayDiff(d1,d2){return Math.round((cloneDate(d1,true)-cloneDate(d2,true))/DAY_MS);}
function setYMD(date,y,m,d){if(y!==undefined&&y!=date.getFullYear()){date.setDate(1);date.setMonth(0);date.setFullYear(y);}
if(m!==undefined&&m!=date.getMonth()){date.setDate(1);date.setMonth(m);}
if(d!==undefined){date.setDate(d);}}
function parseDate(s,ignoreTimezone){if(typeof s=='object'){return s;}
if(typeof s=='number'){return new Date(s*1000);}
if(typeof s=='string'){if(s.match(/^\d+(\.\d+)?$/)){return new Date(parseFloat(s)*1000);}
if(ignoreTimezone===undefined){ignoreTimezone=true;}
return parseISO8601(s,ignoreTimezone)||(s?new Date(s):null);}
return null;}
function parseISO8601(s,ignoreTimezone){var m=s.match(/^([0-9]{4})(-([0-9]{2})(-([0-9]{2})([T ]([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2})(:?([0-9]{2}))?))?)?)?)?$/);if(!m){return null;}
var date=new Date(m[1],0,1);if(ignoreTimezone||!m[13]){var check=new Date(m[1],0,1,9,0);if(m[3]){date.setMonth(m[3]-1);check.setMonth(m[3]-1);}
if(m[5]){date.setDate(m[5]);check.setDate(m[5]);}
fixDate(date,check);if(m[7]){date.setHours(m[7]);}
if(m[8]){date.setMinutes(m[8]);}
if(m[10]){date.setSeconds(m[10]);}
if(m[12]){date.setMilliseconds(Number("0."+m[12])*1000);}
fixDate(date,check);}else{date.setUTCFullYear(m[1],m[3]?m[3]-1:0,m[5]||1);date.setUTCHours(m[7]||0,m[8]||0,m[10]||0,m[12]?Number("0."+m[12])*1000:0);if(m[14]){var offset=Number(m[16])*60+(m[18]?Number(m[18]):0);offset*=m[15]=='-'?1:-1;date=new Date(+date+(offset*60*1000));}}
return date;}
function parseTime(s){if(typeof s=='number'){return s*60;}
if(typeof s=='object'){return s.getHours()*60+s.getMinutes();}
var m=s.match(/(\d+)(?::(\d+))?\s*(\w+)?/);if(m){var h=parseInt(m[1],10);if(m[3]){h%=12;if(m[3].toLowerCase().charAt(0)=='p'){h+=12;}}
return h*60+(m[2]?parseInt(m[2],10):0);}}
function formatDate(date,format,options){return formatDates(date,null,format,options);}
function formatDates(date1,date2,format,options){options=options||defaults;var date=date1,otherDate=date2,i,len=format.length,c,i2,formatter,res='';for(i=0;i<len;i++){c=format.charAt(i);if(c=="'"){for(i2=i+1;i2<len;i2++){if(format.charAt(i2)=="'"){if(date){if(i2==i+1){res+="'";}else{res+=format.substring(i+1,i2);}
i=i2;}
break;}}}
else if(c=='('){for(i2=i+1;i2<len;i2++){if(format.charAt(i2)==')'){var subres=formatDate(date,format.substring(i+1,i2),options);if(parseInt(subres.replace(/\D/,''),10)){res+=subres;}
i=i2;break;}}}
else if(c=='['){for(i2=i+1;i2<len;i2++){if(format.charAt(i2)==']'){var subformat=format.substring(i+1,i2);var subres=formatDate(date,subformat,options);if(subres!=formatDate(otherDate,subformat,options)){res+=subres;}
i=i2;break;}}}
else if(c=='{'){date=date2;otherDate=date1;}
else if(c=='}'){date=date1;otherDate=date2;}
else{for(i2=len;i2>i;i2--){if(formatter=dateFormatters[format.substring(i,i2)]){if(date){res+=formatter(date,options);}
i=i2-1;break;}}
if(i2==i){if(date){res+=c;}}}}
return res;};var dateFormatters={s:function(d){return d.getSeconds()},ss:function(d){return zeroPad(d.getSeconds())},m:function(d){return d.getMinutes()},mm:function(d){return zeroPad(d.getMinutes())},h:function(d){return d.getHours()%12||12},hh:function(d){return zeroPad(d.getHours()%12||12)},H:function(d){return d.getHours()},HH:function(d){return zeroPad(d.getHours())},d:function(d){return d.getDate()},dd:function(d){return zeroPad(d.getDate())},ddd:function(d,o){return o.dayNamesShort[d.getDay()]},dddd:function(d,o){return o.dayNames[d.getDay()]},M:function(d){return d.getMonth()+1},MM:function(d){return zeroPad(d.getMonth()+1)},MMM:function(d,o){return o.monthNamesShort[d.getMonth()]},MMMM:function(d,o){return o.monthNames[d.getMonth()]},yy:function(d){return(d.getFullYear()+'').substring(2)},yyyy:function(d){return d.getFullYear()},t:function(d){return d.getHours()<12?'a':'p'},tt:function(d){return d.getHours()<12?'am':'pm'},T:function(d){return d.getHours()<12?'A':'P'},TT:function(d){return d.getHours()<12?'AM':'PM'},u:function(d){return formatDate(d,"yyyy-MM-dd'T'HH:mm:ss'Z'")},S:function(d){var date=d.getDate();if(date>10&&date<20){return'th';}
return['st','nd','rd'][date%10-1]||'th';},w:function(d,o){return o.weekNumberCalculation(d);},W:function(d){return iso8601Week(d);}};fc.dateFormatters=dateFormatters;function iso8601Week(date){var time;var checkDate=new Date(date.getTime());checkDate.setDate(checkDate.getDate()+4-(checkDate.getDay()||7));time=checkDate.getTime();checkDate.setMonth(0);checkDate.setDate(1);return Math.floor(Math.round((time-checkDate)/86400000)/7)+1;};;fc.applyAll=applyAll;function exclEndDay(event){if(event.end){return _exclEndDay(event.end,event.allDay);}else{return addDays(cloneDate(event.start),1);}}
function _exclEndDay(end,allDay){end=cloneDate(end);return allDay||end.getHours()||end.getMinutes()?addDays(end,1):clearTime(end);}
function segCmp(a,b){return(b.msLength-a.msLength)*100+(a.event.start-b.event.start);}
function segsCollide(seg1,seg2){return seg1.end>seg2.start&&seg1.start<seg2.end;}
function sliceSegs(events,visEventEnds,start,end){var segs=[],i,len=events.length,event,eventStart,eventEnd,segStart,segEnd,isStart,isEnd;for(i=0;i<len;i++){event=events[i];eventStart=event.start;eventEnd=visEventEnds[i];if(eventEnd>start&&eventStart<end){if(eventStart<start){segStart=cloneDate(start);isStart=false;}else{segStart=eventStart;isStart=true;}
if(eventEnd>end){segEnd=cloneDate(end);isEnd=false;}else{segEnd=eventEnd;isEnd=true;}
segs.push({event:event,start:segStart,end:segEnd,isStart:isStart,isEnd:isEnd,msLength:segEnd-segStart});}}
return segs.sort(segCmp);}
function stackSegs(segs){var levels=[],i,len=segs.length,seg,j,collide,k;for(i=0;i<len;i++){seg=segs[i];j=0;while(true){collide=false;if(levels[j]){for(k=0;k<levels[j].length;k++){if(segsCollide(levels[j][k],seg)){collide=true;break;}}}
if(collide){j++;}else{break;}}
if(levels[j]){levels[j].push(seg);}else{levels[j]=[seg];}}
return levels;}
function lazySegBind(container,segs,bindHandlers){container.unbind('mouseover').mouseover(function(ev){var parent=ev.target,e,i,seg;while(parent!=this){e=parent;parent=parent.parentNode;}
if((i=e._fci)!==undefined){e._fci=undefined;seg=segs[i];bindHandlers(seg.event,seg.element,seg);$(ev.target).trigger(ev);}
ev.stopPropagation();});}
function setOuterWidth(element,width,includeMargins){for(var i=0,e;i<element.length;i++){e=$(element[i]);e.width(Math.max(0,width-hsides(e,includeMargins)));}}
function setOuterHeight(element,height,includeMargins){for(var i=0,e;i<element.length;i++){e=$(element[i]);e.height(Math.max(0,height-vsides(e,includeMargins)));}}
function hsides(element,includeMargins){return hpadding(element)+hborders(element)+(includeMargins?hmargins(element):0);}
function hpadding(element){return(parseFloat($.css(element[0],'paddingLeft',true))||0)+
(parseFloat($.css(element[0],'paddingRight',true))||0);}
function hmargins(element){return(parseFloat($.css(element[0],'marginLeft',true))||0)+
(parseFloat($.css(element[0],'marginRight',true))||0);}
function hborders(element){return(parseFloat($.css(element[0],'borderLeftWidth',true))||0)+
(parseFloat($.css(element[0],'borderRightWidth',true))||0);}
function vsides(element,includeMargins){return vpadding(element)+vborders(element)+(includeMargins?vmargins(element):0);}
function vpadding(element){return(parseFloat($.css(element[0],'paddingTop',true))||0)+
(parseFloat($.css(element[0],'paddingBottom',true))||0);}
function vmargins(element){return(parseFloat($.css(element[0],'marginTop',true))||0)+
(parseFloat($.css(element[0],'marginBottom',true))||0);}
function vborders(element){return(parseFloat($.css(element[0],'borderTopWidth',true))||0)+
(parseFloat($.css(element[0],'borderBottomWidth',true))||0);}
function setMinHeight(element,height){height=(typeof height=='number'?height+'px':height);element.each(function(i,_element){_element.style.cssText+=';min-height:'+height+';_height:'+height;});}
function noop(){}
function cmp(a,b){return a-b;}
function arrayMax(a){return Math.max.apply(Math,a);}
function zeroPad(n){return(n<10?'0':'')+n;}
function smartProperty(obj,name){if(obj[name]!==undefined){return obj[name];}
var parts=name.split(/(?=[A-Z])/),i=parts.length-1,res;for(;i>=0;i--){res=obj[parts[i].toLowerCase()];if(res!==undefined){return res;}}
return obj[''];}
function htmlEscape(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#039;').replace(/"/g,'&quot;').replace(/\n/g,'<br />');}
function cssKey(_element){return _element.id+'/'+_element.className+'/'+_element.style.cssText.replace(/(^|;)\s*(top|left|width|height)\s*:[^;]*/ig,'');}
function disableTextSelection(element){element.attr('unselectable','on').css('MozUserSelect','none').bind('selectstart.ui',function(){return false;});}
function markFirstLast(e){e.children().removeClass('fc-first fc-last').filter(':first-child').addClass('fc-first').end().filter(':last-child').addClass('fc-last');}
function setDayID(cell,date){cell.each(function(i,_cell){_cell.className=_cell.className.replace(/^fc-\w*/,'fc-'+dayIDs[date.getDay()]);});}
function getSkinCss(event,opt){var source=event.source||{};var eventColor=event.color;var sourceColor=source.color;var optionColor=opt('eventColor');var backgroundColor=event.backgroundColor||eventColor||source.backgroundColor||sourceColor||opt('eventBackgroundColor')||optionColor;var borderColor=event.borderColor||eventColor||source.borderColor||sourceColor||opt('eventBorderColor')||optionColor;var textColor=event.textColor||source.textColor||opt('eventTextColor');var statements=[];if(backgroundColor){statements.push('background-color:'+backgroundColor);}
if(borderColor){statements.push('border-color:'+borderColor);}
if(textColor){statements.push('color:'+textColor);}
return statements.join(';');}
function applyAll(functions,thisObj,args){if($.isFunction(functions)){functions=[functions];}
if(functions){var i;var ret;for(i=0;i<functions.length;i++){ret=functions[i].apply(thisObj,args)||ret;}
return ret;}}
function firstDefined(){for(var i=0;i<arguments.length;i++){if(arguments[i]!==undefined){return arguments[i];}}};;fcViews.month=MonthView;function MonthView(element,calendar){var t=this;t.render=render;BasicView.call(t,element,calendar,'month');var opt=t.opt;var renderBasic=t.renderBasic;var formatDate=calendar.formatDate;function render(date,delta){if(delta){addMonths(date,delta);date.setDate(1);}
var start=cloneDate(date,true);start.setDate(1);var end=addMonths(cloneDate(start),1);var visStart=cloneDate(start);var visEnd=cloneDate(end);var firstDay=opt('firstDay');var nwe=opt('weekends')?0:1;if(nwe){skipWeekend(visStart);skipWeekend(visEnd,-1,true);}
addDays(visStart,-((visStart.getDay()-Math.max(firstDay,nwe)+7)%7));addDays(visEnd,(7-visEnd.getDay()+Math.max(firstDay,nwe))%7);var rowCnt=Math.round((visEnd-visStart)/(DAY_MS*7));if(opt('weekMode')=='fixed'){addDays(visEnd,(6-rowCnt)*7);rowCnt=6;}
t.title=formatDate(start,opt('titleFormat'));t.start=start;t.end=end;t.visStart=visStart;t.visEnd=visEnd;renderBasic(rowCnt,nwe?5:7,true);}};;fcViews.basicWeek=BasicWeekView;function BasicWeekView(element,calendar){var t=this;t.render=render;BasicView.call(t,element,calendar,'basicWeek');var opt=t.opt;var renderBasic=t.renderBasic;var formatDates=calendar.formatDates;function render(date,delta){if(delta){addDays(date,delta*7);}
var start=addDays(cloneDate(date),-((date.getDay()-opt('firstDay')+7)%7));var end=addDays(cloneDate(start),7);var visStart=cloneDate(start);var visEnd=cloneDate(end);var weekends=opt('weekends');if(!weekends){skipWeekend(visStart);skipWeekend(visEnd,-1,true);}
t.title=formatDates(visStart,addDays(cloneDate(visEnd),-1),opt('titleFormat'));t.start=start;t.end=end;t.visStart=visStart;t.visEnd=visEnd;renderBasic(1,weekends?7:5,false);}};;fcViews.basicDay=BasicDayView;function BasicDayView(element,calendar){var t=this;t.render=render;BasicView.call(t,element,calendar,'basicDay');var opt=t.opt;var renderBasic=t.renderBasic;var formatDate=calendar.formatDate;function render(date,delta){if(delta){addDays(date,delta);if(!opt('weekends')){skipWeekend(date,delta<0?-1:1);}}
t.title=formatDate(date,opt('titleFormat'));t.start=t.visStart=cloneDate(date,true);t.end=t.visEnd=addDays(cloneDate(t.start),1);renderBasic(1,1,false);}};;setDefaults({weekMode:'fixed'});function BasicView(element,calendar,viewName){var t=this;t.renderBasic=renderBasic;t.setHeight=setHeight;t.setWidth=setWidth;t.renderDayOverlay=renderDayOverlay;t.defaultSelectionEnd=defaultSelectionEnd;t.renderSelection=renderSelection;t.clearSelection=clearSelection;t.reportDayClick=reportDayClick;t.dragStart=dragStart;t.dragStop=dragStop;t.defaultEventEnd=defaultEventEnd;t.getHoverListener=function(){return hoverListener};t.colContentLeft=colContentLeft;t.colContentRight=colContentRight;t.dayOfWeekCol=dayOfWeekCol;t.dateCell=dateCell;t.cellDate=cellDate;t.cellIsAllDay=function(){return true};t.allDayRow=allDayRow;t.allDayBounds=allDayBounds;t.getRowCnt=function(){return rowCnt};t.getColCnt=function(){return colCnt};t.getColWidth=function(){return colWidth};t.getDaySegmentContainer=function(){return daySegmentContainer};View.call(t,element,calendar,viewName);OverlayManager.call(t);SelectionManager.call(t);BasicEventRenderer.call(t);var opt=t.opt;var trigger=t.trigger;var clearEvents=t.clearEvents;var renderOverlay=t.renderOverlay;var clearOverlays=t.clearOverlays;var daySelectionMousedown=t.daySelectionMousedown;var formatDate=calendar.formatDate;var table;var head;var headCells;var body;var bodyRows;var bodyCells;var bodyFirstCells;var bodyCellTopInners;var daySegmentContainer;var viewWidth;var viewHeight;var colWidth;var weekNumberWidth;var rowCnt,colCnt;var coordinateGrid;var hoverListener;var colContentPositions;var rtl,dis,dit;var firstDay;var nwe;var tm;var colFormat;var showWeekNumbers;var weekNumberTitle;var weekNumberFormat;disableTextSelection(element.addClass('fc-grid'));function renderBasic(r,c,showNumbers){rowCnt=r;colCnt=c;updateOptions();var firstTime=!body;if(firstTime){buildEventContainer();}else{clearEvents();}
buildTable(showNumbers);}
function updateOptions(){rtl=opt('isRTL');if(rtl){dis=-1;dit=colCnt-1;}else{dis=1;dit=0;}
firstDay=opt('firstDay');nwe=opt('weekends')?0:1;tm=opt('theme')?'ui':'fc';colFormat=opt('columnFormat');showWeekNumbers=opt('weekNumbers');weekNumberTitle=opt('weekNumberTitle');if(opt('weekNumberCalculation')!='iso'){weekNumberFormat="w";}
else{weekNumberFormat="W";}}
function buildEventContainer(){daySegmentContainer=$("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(element);}
function buildTable(showNumbers){var html='';var i,j;var headerClass=tm+"-widget-header";var contentClass=tm+"-widget-content";var month=t.start.getMonth();var today=clearTime(new Date());var cellDate;var cellClasses;var cell;html+="<table class='fc-border-separate' style='width:100%' cellspacing='0'>"+"<thead>"+"<tr>";if(showWeekNumbers){html+="<th class='fc-week-number "+headerClass+"'/>";}
for(i=0;i<colCnt;i++){cellDate=_cellDate(0,i);html+="<th class='fc-day-header fc-"+dayIDs[cellDate.getDay()]+" "+headerClass+"'/>";}
html+="</tr>"+"</thead>"+"<tbody>";for(i=0;i<rowCnt;i++){html+="<tr class='fc-week'>";if(showWeekNumbers){html+="<td class='fc-week-number "+contentClass+"'>"+"<div/>"+"</td>";}
for(j=0;j<colCnt;j++){cellDate=_cellDate(i,j);cellClasses=['fc-day','fc-'+dayIDs[cellDate.getDay()],contentClass];if(cellDate.getMonth()!=month){cellClasses.push('fc-other-month');}
if(+cellDate==+today){cellClasses.push('fc-today');cellClasses.push(tm+'-state-highlight');}
html+="<td"+" class='"+cellClasses.join(' ')+"'"+" data-date='"+formatDate(cellDate,'yyyy-MM-dd')+"'"+">"+"<div>";if(showNumbers){html+="<div class='fc-day-number'>"+cellDate.getDate()+"</div>";}
html+="<div class='fc-day-content'>"+"<div style='position:relative'>&nbsp;</div>"+"</div>"+"</div>"+"</td>";}
html+="</tr>";}
html+="</tbody>"+"</table>";lockHeight();if(table){table.remove();}
table=$(html).appendTo(element);head=table.find('thead');headCells=head.find('.fc-day-header');body=table.find('tbody');bodyRows=body.find('tr');bodyCells=body.find('.fc-day');bodyFirstCells=bodyRows.find('td:first-child');bodyCellTopInners=bodyRows.eq(0).find('.fc-day-content > div');markFirstLast(head.add(head.find('tr')));markFirstLast(bodyRows);bodyRows.eq(0).addClass('fc-first');bodyRows.filter(':last').addClass('fc-last');if(showWeekNumbers){head.find('.fc-week-number').text(weekNumberTitle);}
headCells.each(function(i,_cell){var date=indexDate(i);$(_cell).text(formatDate(date,colFormat));});if(showWeekNumbers){body.find('.fc-week-number > div').each(function(i,_cell){var weekStart=_cellDate(i,0);$(_cell).text(formatDate(weekStart,weekNumberFormat));});}
bodyCells.each(function(i,_cell){var date=indexDate(i);trigger('dayRender',t,date,$(_cell));});dayBind(bodyCells);}
function setHeight(height){viewHeight=height;var bodyHeight=viewHeight-head.height();var rowHeight;var rowHeightLast;var cell;if(opt('weekMode')=='variable'){rowHeight=rowHeightLast=Math.floor(bodyHeight/(rowCnt==1?2:6));}else{rowHeight=Math.floor(bodyHeight/rowCnt);rowHeightLast=bodyHeight-rowHeight*(rowCnt-1);}
bodyFirstCells.each(function(i,_cell){if(i<rowCnt){cell=$(_cell);setMinHeight(cell.find('> div'),(i==rowCnt-1?rowHeightLast:rowHeight)-vsides(cell));}});unlockHeight();}
function setWidth(width){viewWidth=width;colContentPositions.clear();weekNumberWidth=0;if(showWeekNumbers){weekNumberWidth=head.find('th.fc-week-number').outerWidth();}
colWidth=Math.floor((viewWidth-weekNumberWidth)/colCnt);setOuterWidth(headCells.slice(0,-1),colWidth);}
function dayBind(days){days.click(dayClick).mousedown(daySelectionMousedown);}
function dayClick(ev){if(!opt('selectable')){var date=parseISO8601($(this).data('date'));trigger('dayClick',this,date,true,ev);}}
function renderDayOverlay(overlayStart,overlayEnd,refreshCoordinateGrid){if(refreshCoordinateGrid){coordinateGrid.build();}
var rowStart=cloneDate(t.visStart);var rowEnd=addDays(cloneDate(rowStart),colCnt);for(var i=0;i<rowCnt;i++){var stretchStart=new Date(Math.max(rowStart,overlayStart));var stretchEnd=new Date(Math.min(rowEnd,overlayEnd));if(stretchStart<stretchEnd){var colStart,colEnd;if(rtl){colStart=dayDiff(stretchEnd,rowStart)*dis+dit+1;colEnd=dayDiff(stretchStart,rowStart)*dis+dit+1;}else{colStart=dayDiff(stretchStart,rowStart);colEnd=dayDiff(stretchEnd,rowStart);}
dayBind(renderCellOverlay(i,colStart,i,colEnd-1));}
addDays(rowStart,7);addDays(rowEnd,7);}}
function renderCellOverlay(row0,col0,row1,col1){var rect=coordinateGrid.rect(row0,col0,row1,col1,element);return renderOverlay(rect,element);}
function defaultSelectionEnd(startDate,allDay){return cloneDate(startDate);}
function renderSelection(startDate,endDate,allDay){renderDayOverlay(startDate,addDays(cloneDate(endDate),1),true);}
function clearSelection(){clearOverlays();}
function reportDayClick(date,allDay,ev){var cell=dateCell(date);var _element=bodyCells[cell.row*colCnt+cell.col];trigger('dayClick',_element,date,allDay,ev);}
function dragStart(_dragElement,ev,ui){hoverListener.start(function(cell){clearOverlays();if(cell){renderCellOverlay(cell.row,cell.col,cell.row,cell.col);}},ev);}
function dragStop(_dragElement,ev,ui){var cell=hoverListener.stop();clearOverlays();if(cell){var d=cellDate(cell);trigger('drop',_dragElement,d,true,ev,ui);}}
function defaultEventEnd(event){return cloneDate(event.start);}
coordinateGrid=new CoordinateGrid(function(rows,cols){var e,n,p;headCells.each(function(i,_e){e=$(_e);n=e.offset().left;if(i){p[1]=n;}
p=[n];cols[i]=p;});p[1]=n+e.outerWidth();bodyRows.each(function(i,_e){if(i<rowCnt){e=$(_e);n=e.offset().top;if(i){p[1]=n;}
p=[n];rows[i]=p;}});p[1]=n+e.outerHeight();});hoverListener=new HoverListener(coordinateGrid);colContentPositions=new HorizontalPositionCache(function(col){return bodyCellTopInners.eq(col);});function colContentLeft(col){return colContentPositions.left(col);}
function colContentRight(col){return colContentPositions.right(col);}
function dateCell(date){return{row:Math.floor(dayDiff(date,t.visStart)/7),col:dayOfWeekCol(date.getDay())};}
function cellDate(cell){return _cellDate(cell.row,cell.col);}
function _cellDate(row,col){return addDays(cloneDate(t.visStart),row*7+col*dis+dit);}
function indexDate(index){return _cellDate(Math.floor(index/colCnt),index%colCnt);}
function dayOfWeekCol(dayOfWeek){return((dayOfWeek-Math.max(firstDay,nwe)+colCnt)%colCnt)*dis+dit;}
function allDayRow(i){return bodyRows.eq(i);}
function allDayBounds(i){var left=0;if(showWeekNumbers){left+=weekNumberWidth;}
return{left:left,right:viewWidth};}
function lockHeight(){setMinHeight(element,element.height());}
function unlockHeight(){setMinHeight(element,1);}};;function BasicEventRenderer(){var t=this;t.renderEvents=renderEvents;t.compileDaySegs=compileSegs;t.clearEvents=clearEvents;t.bindDaySeg=bindDaySeg;DayEventRenderer.call(t);var opt=t.opt;var trigger=t.trigger;var isEventDraggable=t.isEventDraggable;var isEventResizable=t.isEventResizable;var reportEvents=t.reportEvents;var reportEventClear=t.reportEventClear;var eventElementHandlers=t.eventElementHandlers;var showEvents=t.showEvents;var hideEvents=t.hideEvents;var eventDrop=t.eventDrop;var getDaySegmentContainer=t.getDaySegmentContainer;var getHoverListener=t.getHoverListener;var renderDayOverlay=t.renderDayOverlay;var clearOverlays=t.clearOverlays;var getRowCnt=t.getRowCnt;var getColCnt=t.getColCnt;var renderDaySegs=t.renderDaySegs;var resizableDayEvent=t.resizableDayEvent;function renderEvents(events,modifiedEventId){reportEvents(events);renderDaySegs(compileSegs(events),modifiedEventId);trigger('eventAfterAllRender');}
function clearEvents(){reportEventClear();getDaySegmentContainer().empty();}
function compileSegs(events){var rowCnt=getRowCnt(),colCnt=getColCnt(),d1=cloneDate(t.visStart),d2=addDays(cloneDate(d1),colCnt),visEventsEnds=$.map(events,exclEndDay),i,row,j,level,k,seg,segs=[];for(i=0;i<rowCnt;i++){row=stackSegs(sliceSegs(events,visEventsEnds,d1,d2));for(j=0;j<row.length;j++){level=row[j];for(k=0;k<level.length;k++){seg=level[k];seg.row=i;seg.level=j;segs.push(seg);}}
addDays(d1,7);addDays(d2,7);}
return segs;}
function bindDaySeg(event,eventElement,seg){if(isEventDraggable(event)){draggableDayEvent(event,eventElement);}
if(seg.isEnd&&isEventResizable(event)){resizableDayEvent(event,eventElement,seg);}
eventElementHandlers(event,eventElement);}
function draggableDayEvent(event,eventElement){var hoverListener=getHoverListener();var dayDelta;eventElement.draggable({zIndex:9,delay:50,opacity:opt('dragOpacity'),revertDuration:opt('dragRevertDuration'),start:function(ev,ui){trigger('eventDragStart',eventElement,event,ev,ui);hideEvents(event,eventElement);hoverListener.start(function(cell,origCell,rowDelta,colDelta){eventElement.draggable('option','revert',!cell||!rowDelta&&!colDelta);clearOverlays();if(cell){dayDelta=rowDelta*7+colDelta*(opt('isRTL')?-1:1);renderDayOverlay(addDays(cloneDate(event.start),dayDelta),addDays(exclEndDay(event),dayDelta));}else{dayDelta=0;}},ev,'drag');},stop:function(ev,ui){hoverListener.stop();clearOverlays();trigger('eventDragStop',eventElement,event,ev,ui);if(dayDelta){eventDrop(this,event,dayDelta,0,event.allDay,ev,ui);}else{eventElement.css('filter','');showEvents(event,eventElement);}}});}};;fcViews.agendaWeek=AgendaWeekView;function AgendaWeekView(element,calendar){var t=this;t.render=render;AgendaView.call(t,element,calendar,'agendaWeek');var opt=t.opt;var renderAgenda=t.renderAgenda;var formatDates=calendar.formatDates;function render(date,delta){if(delta){addDays(date,delta*7);}
var start=addDays(cloneDate(date),-((date.getDay()-opt('firstDay')+7)%7));var end=addDays(cloneDate(start),7);var visStart=cloneDate(start);var visEnd=cloneDate(end);var weekends=opt('weekends');if(!weekends){skipWeekend(visStart);skipWeekend(visEnd,-1,true);}
t.title=formatDates(visStart,addDays(cloneDate(visEnd),-1),opt('titleFormat'));t.start=start;t.end=end;t.visStart=visStart;t.visEnd=visEnd;renderAgenda(weekends?7:5);}};;fcViews.agendaDay=AgendaDayView;function AgendaDayView(element,calendar){var t=this;t.render=render;AgendaView.call(t,element,calendar,'agendaDay');var opt=t.opt;var renderAgenda=t.renderAgenda;var formatDate=calendar.formatDate;function render(date,delta){if(delta){addDays(date,delta);if(!opt('weekends')){skipWeekend(date,delta<0?-1:1);}}
var start=cloneDate(date,true);var end=addDays(cloneDate(start),1);t.title=formatDate(date,opt('titleFormat'));t.start=t.visStart=start;t.end=t.visEnd=end;renderAgenda(1);}};;setDefaults({allDaySlot:true,allDayText:'all-day',firstHour:6,slotMinutes:30,defaultEventMinutes:120,axisFormat:'h(:mm)tt',timeFormat:{agenda:'h:mm{ - h:mm}'},dragOpacity:{agenda:.5},minTime:0,maxTime:24});function AgendaView(element,calendar,viewName){var t=this;t.renderAgenda=renderAgenda;t.setWidth=setWidth;t.setHeight=setHeight;t.beforeHide=beforeHide;t.afterShow=afterShow;t.defaultEventEnd=defaultEventEnd;t.timePosition=timePosition;t.dayOfWeekCol=dayOfWeekCol;t.dateCell=dateCell;t.cellDate=cellDate;t.cellIsAllDay=cellIsAllDay;t.allDayRow=getAllDayRow;t.allDayBounds=allDayBounds;t.getHoverListener=function(){return hoverListener};t.colContentLeft=colContentLeft;t.colContentRight=colContentRight;t.getDaySegmentContainer=function(){return daySegmentContainer};t.getSlotSegmentContainer=function(){return slotSegmentContainer};t.getMinMinute=function(){return minMinute};t.getMaxMinute=function(){return maxMinute};t.getBodyContent=function(){return slotContent};t.getRowCnt=function(){return 1};t.getColCnt=function(){return colCnt};t.getColWidth=function(){return colWidth};t.getSnapHeight=function(){return snapHeight};t.getSnapMinutes=function(){return snapMinutes};t.defaultSelectionEnd=defaultSelectionEnd;t.renderDayOverlay=renderDayOverlay;t.renderSelection=renderSelection;t.clearSelection=clearSelection;t.reportDayClick=reportDayClick;t.dragStart=dragStart;t.dragStop=dragStop;View.call(t,element,calendar,viewName);OverlayManager.call(t);SelectionManager.call(t);AgendaEventRenderer.call(t);var opt=t.opt;var trigger=t.trigger;var clearEvents=t.clearEvents;var renderOverlay=t.renderOverlay;var clearOverlays=t.clearOverlays;var reportSelection=t.reportSelection;var unselect=t.unselect;var daySelectionMousedown=t.daySelectionMousedown;var slotSegHtml=t.slotSegHtml;var formatDate=calendar.formatDate;var dayTable;var dayHead;var dayHeadCells;var dayBody;var dayBodyCells;var dayBodyCellInners;var dayBodyFirstCell;var dayBodyFirstCellStretcher;var slotLayer;var daySegmentContainer;var allDayTable;var allDayRow;var slotScroller;var slotContent;var slotSegmentContainer;var slotTable;var slotTableFirstInner;var axisFirstCells;var gutterCells;var selectionHelper;var viewWidth;var viewHeight;var axisWidth;var colWidth;var gutterWidth;var slotHeight;var snapMinutes;var snapRatio;var snapHeight;var colCnt;var slotCnt;var coordinateGrid;var hoverListener;var colContentPositions;var slotTopCache={};var savedScrollTop;var tm;var firstDay;var nwe;var rtl,dis,dit;var minMinute,maxMinute;var colFormat;var showWeekNumbers;var weekNumberTitle;var weekNumberFormat;disableTextSelection(element.addClass('fc-agenda'));function renderAgenda(c){colCnt=c;updateOptions();if(!dayTable){buildSkeleton();}else{clearEvents();}
updateCells();}
function updateOptions(){tm=opt('theme')?'ui':'fc';nwe=opt('weekends')?0:1;firstDay=opt('firstDay');if(rtl=opt('isRTL')){dis=-1;dit=colCnt-1;}else{dis=1;dit=0;}
minMinute=parseTime(opt('minTime'));maxMinute=parseTime(opt('maxTime'));colFormat=opt('columnFormat');showWeekNumbers=opt('weekNumbers');weekNumberTitle=opt('weekNumberTitle');if(opt('weekNumberCalculation')!='iso'){weekNumberFormat="w";}
else{weekNumberFormat="W";}
snapMinutes=opt('snapMinutes')||opt('slotMinutes');}
function buildSkeleton(){var headerClass=tm+"-widget-header";var contentClass=tm+"-widget-content";var s;var i;var d;var maxd;var minutes;var slotNormal=opt('slotMinutes')%15==0;s="<table style='width:100%' class='fc-agenda-days fc-border-separate' cellspacing='0'>"+"<thead>"+"<tr>";if(showWeekNumbers){s+="<th class='fc-agenda-axis fc-week-number "+headerClass+"'/>";}
else{s+="<th class='fc-agenda-axis "+headerClass+"'>&nbsp;</th>";}
for(i=0;i<colCnt;i++){s+="<th class='fc- fc-col"+i+' '+headerClass+"'/>";}
s+="<th class='fc-agenda-gutter "+headerClass+"'>&nbsp;</th>"+"</tr>"+"</thead>"+"<tbody>"+"<tr>"+"<th class='fc-agenda-axis "+headerClass+"'>&nbsp;</th>";for(i=0;i<colCnt;i++){s+="<td class='fc- fc-col"+i+' '+contentClass+"'>"+"<div>"+"<div class='fc-day-content'>"+"<div style='position:relative'>&nbsp;</div>"+"</div>"+"</div>"+"</td>";}
s+="<td class='fc-agenda-gutter "+contentClass+"'>&nbsp;</td>"+"</tr>"+"</tbody>"+"</table>";dayTable=$(s).appendTo(element);dayHead=dayTable.find('thead');dayHeadCells=dayHead.find('th').slice(1,-1);dayBody=dayTable.find('tbody');dayBodyCells=dayBody.find('td').slice(0,-1);dayBodyCellInners=dayBodyCells.find('div.fc-day-content div');dayBodyFirstCell=dayBodyCells.eq(0);dayBodyFirstCellStretcher=dayBodyFirstCell.find('> div');markFirstLast(dayHead.add(dayHead.find('tr')));markFirstLast(dayBody.add(dayBody.find('tr')));axisFirstCells=dayHead.find('th:first');gutterCells=dayTable.find('.fc-agenda-gutter');slotLayer=$("<div style='position:absolute;z-index:2;left:0;width:100%'/>").appendTo(element);if(opt('allDaySlot')){daySegmentContainer=$("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(slotLayer);s="<table style='width:100%' class='fc-agenda-allday' cellspacing='0'>"+"<tr>"+"<th class='"+headerClass+" fc-agenda-axis'>"+opt('allDayText')+"</th>"+"<td>"+"<div class='fc-day-content'><div style='position:relative'/></div>"+"</td>"+"<th class='"+headerClass+" fc-agenda-gutter'>&nbsp;</th>"+"</tr>"+"</table>";allDayTable=$(s).appendTo(slotLayer);allDayRow=allDayTable.find('tr');dayBind(allDayRow.find('td'));axisFirstCells=axisFirstCells.add(allDayTable.find('th:first'));gutterCells=gutterCells.add(allDayTable.find('th.fc-agenda-gutter'));slotLayer.append("<div class='fc-agenda-divider "+headerClass+"'>"+"<div class='fc-agenda-divider-inner'/>"+"</div>");}else{daySegmentContainer=$([]);}
slotScroller=$("<div style='position:absolute;width:100%;overflow-x:hidden;overflow-y:auto'/>").appendTo(slotLayer);slotContent=$("<div style='position:relative;width:100%;overflow:hidden'/>").appendTo(slotScroller);slotSegmentContainer=$("<div style='position:absolute;z-index:8;top:0;left:0'/>").appendTo(slotContent);s="<table class='fc-agenda-slots' style='width:100%' cellspacing='0'>"+"<tbody>";d=zeroDate();maxd=addMinutes(cloneDate(d),maxMinute);addMinutes(d,minMinute);slotCnt=0;for(i=0;d<maxd;i++){minutes=d.getMinutes();s+="<tr class='fc-slot"+i+' '+(!minutes?'':'fc-minor')+"'>"+"<th class='fc-agenda-axis "+headerClass+"'>"+
((!slotNormal||!minutes)?formatDate(d,opt('axisFormat')):'&nbsp;')+"</th>"+"<td class='"+contentClass+"'>"+"<div style='position:relative'>&nbsp;</div>"+"</td>"+"</tr>";addMinutes(d,opt('slotMinutes'));slotCnt++;}
s+="</tbody>"+"</table>";slotTable=$(s).appendTo(slotContent);slotTableFirstInner=slotTable.find('div:first');slotBind(slotTable.find('td'));axisFirstCells=axisFirstCells.add(slotTable.find('th:first'));}
function updateCells(){var i;var headCell;var bodyCell;var date;var today=clearTime(new Date());if(showWeekNumbers){var weekText=formatDate(colDate(0),weekNumberFormat);if(rtl){weekText=weekText+weekNumberTitle;}
else{weekText=weekNumberTitle+weekText;}
dayHead.find('.fc-week-number').text(weekText);}
for(i=0;i<colCnt;i++){date=colDate(i);headCell=dayHeadCells.eq(i);headCell.html(formatDate(date,colFormat));bodyCell=dayBodyCells.eq(i);if(+date==+today){bodyCell.addClass(tm+'-state-highlight fc-today');}else{bodyCell.removeClass(tm+'-state-highlight fc-today');}
setDayID(headCell.add(bodyCell),date);}}
function setHeight(height,dateChanged){if(height===undefined){height=viewHeight;}
viewHeight=height;slotTopCache={};var headHeight=dayBody.position().top;var allDayHeight=slotScroller.position().top;var bodyHeight=Math.min(height-headHeight,slotTable.height()+allDayHeight+1);dayBodyFirstCellStretcher.height(bodyHeight-vsides(dayBodyFirstCell));slotLayer.css('top',headHeight);slotScroller.height(bodyHeight-allDayHeight-1);slotHeight=slotTableFirstInner.height()+1;snapRatio=opt('slotMinutes')/snapMinutes;snapHeight=slotHeight/snapRatio;if(dateChanged){resetScroll();}}
function setWidth(width){viewWidth=width;colContentPositions.clear();axisWidth=0;setOuterWidth(axisFirstCells.width('').each(function(i,_cell){axisWidth=Math.max(axisWidth,$(_cell).outerWidth());}),axisWidth);var slotTableWidth=slotScroller[0].clientWidth;gutterWidth=slotScroller.width()-slotTableWidth;if(gutterWidth){setOuterWidth(gutterCells,gutterWidth);gutterCells.show().prev().removeClass('fc-last');}else{gutterCells.hide().prev().addClass('fc-last');}
colWidth=Math.floor((slotTableWidth-axisWidth)/colCnt);setOuterWidth(dayHeadCells.slice(0,-1),colWidth);}
function resetScroll(){var d0=zeroDate();var scrollDate=cloneDate(d0);scrollDate.setHours(opt('firstHour'));var top=timePosition(d0,scrollDate)+1;function scroll(){slotScroller.scrollTop(top);}
scroll();setTimeout(scroll,0);}
function beforeHide(){savedScrollTop=slotScroller.scrollTop();}
function afterShow(){slotScroller.scrollTop(savedScrollTop);}
function dayBind(cells){cells.click(slotClick).mousedown(daySelectionMousedown);}
function slotBind(cells){cells.click(slotClick).mousedown(slotSelectionMousedown);}
function slotClick(ev){if(!opt('selectable')){var col=Math.min(colCnt-1,Math.floor((ev.pageX-dayTable.offset().left-axisWidth)/colWidth));var date=colDate(col);var rowMatch=this.parentNode.className.match(/fc-slot(\d+)/);if(rowMatch){var mins=parseInt(rowMatch[1])*opt('slotMinutes');var hours=Math.floor(mins/60);date.setHours(hours);date.setMinutes(mins%60+minMinute);trigger('dayClick',dayBodyCells[col],date,false,ev);}else{trigger('dayClick',dayBodyCells[col],date,true,ev);}}}
function renderDayOverlay(startDate,endDate,refreshCoordinateGrid){if(refreshCoordinateGrid){coordinateGrid.build();}
var visStart=cloneDate(t.visStart);var startCol,endCol;if(rtl){startCol=dayDiff(endDate,visStart)*dis+dit+1;endCol=dayDiff(startDate,visStart)*dis+dit+1;}else{startCol=dayDiff(startDate,visStart);endCol=dayDiff(endDate,visStart);}
startCol=Math.max(0,startCol);endCol=Math.min(colCnt,endCol);if(startCol<endCol){dayBind(renderCellOverlay(0,startCol,0,endCol-1));}}
function renderCellOverlay(row0,col0,row1,col1){var rect=coordinateGrid.rect(row0,col0,row1,col1,slotLayer);return renderOverlay(rect,slotLayer);}
function renderSlotOverlay(overlayStart,overlayEnd){var dayStart=cloneDate(t.visStart);var dayEnd=addDays(cloneDate(dayStart),1);for(var i=0;i<colCnt;i++){var stretchStart=new Date(Math.max(dayStart,overlayStart));var stretchEnd=new Date(Math.min(dayEnd,overlayEnd));if(stretchStart<stretchEnd){var col=i*dis+dit;var rect=coordinateGrid.rect(0,col,0,col,slotContent);var top=timePosition(dayStart,stretchStart);var bottom=timePosition(dayStart,stretchEnd);rect.top=top;rect.height=bottom-top;slotBind(renderOverlay(rect,slotContent));}
addDays(dayStart,1);addDays(dayEnd,1);}}
coordinateGrid=new CoordinateGrid(function(rows,cols){var e,n,p;dayHeadCells.each(function(i,_e){e=$(_e);n=e.offset().left;if(i){p[1]=n;}
p=[n];cols[i]=p;});p[1]=n+e.outerWidth();if(opt('allDaySlot')){e=allDayRow;n=e.offset().top;rows[0]=[n,n+e.outerHeight()];}
var slotTableTop=slotContent.offset().top;var slotScrollerTop=slotScroller.offset().top;var slotScrollerBottom=slotScrollerTop+slotScroller.outerHeight();function constrain(n){return Math.max(slotScrollerTop,Math.min(slotScrollerBottom,n));}
for(var i=0;i<slotCnt*snapRatio;i++){rows.push([constrain(slotTableTop+snapHeight*i),constrain(slotTableTop+snapHeight*(i+1))]);}});hoverListener=new HoverListener(coordinateGrid);colContentPositions=new HorizontalPositionCache(function(col){return dayBodyCellInners.eq(col);});function colContentLeft(col){return colContentPositions.left(col);}
function colContentRight(col){return colContentPositions.right(col);}
function dateCell(date){return{row:Math.floor(dayDiff(date,t.visStart)/7),col:dayOfWeekCol(date.getDay())};}
function cellDate(cell){var d=colDate(cell.col);var slotIndex=cell.row;if(opt('allDaySlot')){slotIndex--;}
if(slotIndex>=0){addMinutes(d,minMinute+slotIndex*snapMinutes);}
return d;}
function colDate(col){return addDays(cloneDate(t.visStart),col*dis+dit);}
function cellIsAllDay(cell){return opt('allDaySlot')&&!cell.row;}
function dayOfWeekCol(dayOfWeek){return((dayOfWeek-Math.max(firstDay,nwe)+colCnt)%colCnt)*dis+dit;}
function timePosition(day,time){day=cloneDate(day,true);if(time<addMinutes(cloneDate(day),minMinute)){return 0;}
if(time>=addMinutes(cloneDate(day),maxMinute)){return slotTable.height();}
var slotMinutes=opt('slotMinutes'),minutes=time.getHours()*60+time.getMinutes()-minMinute,slotI=Math.floor(minutes/slotMinutes),slotTop=slotTopCache[slotI];if(slotTop===undefined){slotTop=slotTopCache[slotI]=slotTable.find('tr:eq('+slotI+') td div')[0].offsetTop;}
return Math.max(0,Math.round(slotTop-1+slotHeight*((minutes%slotMinutes)/slotMinutes)));}
function allDayBounds(){return{left:axisWidth,right:viewWidth-gutterWidth}}
function getAllDayRow(index){return allDayRow;}
function defaultEventEnd(event){var start=cloneDate(event.start);if(event.allDay){return start;}
return addMinutes(start,opt('defaultEventMinutes'));}
function defaultSelectionEnd(startDate,allDay){if(allDay){return cloneDate(startDate);}
return addMinutes(cloneDate(startDate),opt('slotMinutes'));}
function renderSelection(startDate,endDate,allDay){if(allDay){if(opt('allDaySlot')){renderDayOverlay(startDate,addDays(cloneDate(endDate),1),true);}}else{renderSlotSelection(startDate,endDate);}}
function renderSlotSelection(startDate,endDate){var helperOption=opt('selectHelper');coordinateGrid.build();if(helperOption){var col=dayDiff(startDate,t.visStart)*dis+dit;if(col>=0&&col<colCnt){var rect=coordinateGrid.rect(0,col,0,col,slotContent);var top=timePosition(startDate,startDate);var bottom=timePosition(startDate,endDate);if(bottom>top){rect.top=top;rect.height=bottom-top;rect.left+=2;rect.width-=5;if($.isFunction(helperOption)){var helperRes=helperOption(startDate,endDate);if(helperRes){rect.position='absolute';rect.zIndex=8;selectionHelper=$(helperRes).css(rect).appendTo(slotContent);}}else{rect.isStart=true;rect.isEnd=true;selectionHelper=$(slotSegHtml({title:'',start:startDate,end:endDate,className:['fc-select-helper'],editable:false},rect));selectionHelper.css('opacity',opt('dragOpacity'));}
if(selectionHelper){slotBind(selectionHelper);slotContent.append(selectionHelper);setOuterWidth(selectionHelper,rect.width,true);setOuterHeight(selectionHelper,rect.height,true);}}}}else{renderSlotOverlay(startDate,endDate);}}
function clearSelection(){clearOverlays();if(selectionHelper){selectionHelper.remove();selectionHelper=null;}}
function slotSelectionMousedown(ev){if(ev.which==1&&opt('selectable')){unselect(ev);var dates;hoverListener.start(function(cell,origCell){clearSelection();if(cell&&cell.col==origCell.col&&!cellIsAllDay(cell)){var d1=cellDate(origCell);var d2=cellDate(cell);dates=[d1,addMinutes(cloneDate(d1),snapMinutes),d2,addMinutes(cloneDate(d2),snapMinutes)].sort(cmp);renderSlotSelection(dates[0],dates[3]);}else{dates=null;}},ev);$(document).one('mouseup',function(ev){hoverListener.stop();if(dates){if(+dates[0]==+dates[1]){reportDayClick(dates[0],false,ev);}
reportSelection(dates[0],dates[3],false,ev);}});}}
function reportDayClick(date,allDay,ev){trigger('dayClick',dayBodyCells[dayOfWeekCol(date.getDay())],date,allDay,ev);}
function dragStart(_dragElement,ev,ui){hoverListener.start(function(cell){clearOverlays();if(cell){if(cellIsAllDay(cell)){renderCellOverlay(cell.row,cell.col,cell.row,cell.col);}else{var d1=cellDate(cell);var d2=addMinutes(cloneDate(d1),opt('defaultEventMinutes'));renderSlotOverlay(d1,d2);}}},ev);}
function dragStop(_dragElement,ev,ui){var cell=hoverListener.stop();clearOverlays();if(cell){trigger('drop',_dragElement,cellDate(cell),cellIsAllDay(cell),ev,ui);}}};;function AgendaEventRenderer(){var t=this;t.renderEvents=renderEvents;t.compileDaySegs=compileDaySegs;t.clearEvents=clearEvents;t.slotSegHtml=slotSegHtml;t.bindDaySeg=bindDaySeg;DayEventRenderer.call(t);var opt=t.opt;var trigger=t.trigger;var isEventDraggable=t.isEventDraggable;var isEventResizable=t.isEventResizable;var eventEnd=t.eventEnd;var reportEvents=t.reportEvents;var reportEventClear=t.reportEventClear;var eventElementHandlers=t.eventElementHandlers;var setHeight=t.setHeight;var getDaySegmentContainer=t.getDaySegmentContainer;var getSlotSegmentContainer=t.getSlotSegmentContainer;var getHoverListener=t.getHoverListener;var getMaxMinute=t.getMaxMinute;var getMinMinute=t.getMinMinute;var timePosition=t.timePosition;var colContentLeft=t.colContentLeft;var colContentRight=t.colContentRight;var renderDaySegs=t.renderDaySegs;var resizableDayEvent=t.resizableDayEvent;var getColCnt=t.getColCnt;var getColWidth=t.getColWidth;var getSnapHeight=t.getSnapHeight;var getSnapMinutes=t.getSnapMinutes;var getBodyContent=t.getBodyContent;var reportEventElement=t.reportEventElement;var showEvents=t.showEvents;var hideEvents=t.hideEvents;var eventDrop=t.eventDrop;var eventResize=t.eventResize;var renderDayOverlay=t.renderDayOverlay;var clearOverlays=t.clearOverlays;var calendar=t.calendar;var formatDate=calendar.formatDate;var formatDates=calendar.formatDates;function renderEvents(events,modifiedEventId){reportEvents(events);var i,len=events.length,dayEvents=[],slotEvents=[];for(i=0;i<len;i++){if(events[i].allDay){dayEvents.push(events[i]);}else{slotEvents.push(events[i]);}}
if(opt('allDaySlot')){renderDaySegs(compileDaySegs(dayEvents),modifiedEventId);setHeight();}
renderSlotSegs(compileSlotSegs(slotEvents),modifiedEventId);trigger('eventAfterAllRender');}
function clearEvents(){reportEventClear();getDaySegmentContainer().empty();getSlotSegmentContainer().empty();}
function compileDaySegs(events){var levels=stackSegs(sliceSegs(events,$.map(events,exclEndDay),t.visStart,t.visEnd)),i,levelCnt=levels.length,level,j,seg,segs=[];for(i=0;i<levelCnt;i++){level=levels[i];for(j=0;j<level.length;j++){seg=level[j];seg.row=0;seg.level=i;segs.push(seg);}}
return segs;}
function compileSlotSegs(events){var colCnt=getColCnt(),minMinute=getMinMinute(),maxMinute=getMaxMinute(),d=addMinutes(cloneDate(t.visStart),minMinute),visEventEnds=$.map(events,slotEventEnd),i,col,j,level,k,seg,segs=[];for(i=0;i<colCnt;i++){col=stackSegs(sliceSegs(events,visEventEnds,d,addMinutes(cloneDate(d),maxMinute-minMinute)));countForwardSegs(col);for(j=0;j<col.length;j++){level=col[j];for(k=0;k<level.length;k++){seg=level[k];seg.col=i;seg.level=j;segs.push(seg);}}
addDays(d,1,true);}
return segs;}
function slotEventEnd(event){if(event.end){return cloneDate(event.end);}else{return addMinutes(cloneDate(event.start),opt('defaultEventMinutes'));}}
function renderSlotSegs(segs,modifiedEventId){var i,segCnt=segs.length,seg,event,classes,top,bottom,colI,levelI,forward,leftmost,availWidth,outerWidth,left,html='',eventElements,eventElement,triggerRes,vsideCache={},hsideCache={},key,val,titleElement,height,slotSegmentContainer=getSlotSegmentContainer(),rtl,dis,dit,colCnt=getColCnt();if(rtl=opt('isRTL')){dis=-1;dit=colCnt-1;}else{dis=1;dit=0;}
for(i=0;i<segCnt;i++){seg=segs[i];event=seg.event;top=timePosition(seg.start,seg.start);bottom=timePosition(seg.start,seg.end);colI=seg.col;levelI=seg.level;forward=seg.forward||0;leftmost=colContentLeft(colI*dis+dit);availWidth=colContentRight(colI*dis+dit)-leftmost;availWidth=Math.min(availWidth-6,availWidth*.95);if(levelI){outerWidth=availWidth/(levelI+forward+1);}else{if(forward){outerWidth=((availWidth/(forward+1))-(12/2))*2;}else{outerWidth=availWidth;}}
left=leftmost+
(availWidth/(levelI+forward+1)*levelI)*dis+(rtl?availWidth-outerWidth:0);seg.top=top;seg.left=left;seg.outerWidth=outerWidth;seg.outerHeight=bottom-top;html+=slotSegHtml(event,seg);}
slotSegmentContainer[0].innerHTML=html;eventElements=slotSegmentContainer.children();for(i=0;i<segCnt;i++){seg=segs[i];event=seg.event;eventElement=$(eventElements[i]);triggerRes=trigger('eventRender',event,event,eventElement);if(triggerRes===false){eventElement.remove();}else{if(triggerRes&&triggerRes!==true){eventElement.remove();eventElement=$(triggerRes).css({position:'absolute',top:seg.top,left:seg.left}).appendTo(slotSegmentContainer);}
seg.element=eventElement;if(event._id===modifiedEventId){bindSlotSeg(event,eventElement,seg);}else{eventElement[0]._fci=i;}
reportEventElement(event,eventElement);}}
lazySegBind(slotSegmentContainer,segs,bindSlotSeg);for(i=0;i<segCnt;i++){seg=segs[i];if(eventElement=seg.element){val=vsideCache[key=seg.key=cssKey(eventElement[0])];seg.vsides=val===undefined?(vsideCache[key]=vsides(eventElement,true)):val;val=hsideCache[key];seg.hsides=val===undefined?(hsideCache[key]=hsides(eventElement,true)):val;titleElement=eventElement.find('.fc-event-title');if(titleElement.length){seg.contentTop=titleElement[0].offsetTop;}}}
for(i=0;i<segCnt;i++){seg=segs[i];if(eventElement=seg.element){eventElement[0].style.width=Math.max(0,seg.outerWidth-seg.hsides)+'px';height=Math.max(0,seg.outerHeight-seg.vsides);eventElement[0].style.height=height+'px';event=seg.event;if(seg.contentTop!==undefined&&height-seg.contentTop<10){eventElement.find('div.fc-event-time').text(formatDate(event.start,opt('timeFormat'))+' - '+event.title);eventElement.find('div.fc-event-title').remove();}
trigger('eventAfterRender',event,event,eventElement);}}}
function slotSegHtml(event,seg){var html="<";var url=event.url;var skinCss=getSkinCss(event,opt);var classes=['fc-event','fc-event-vert'];if(isEventDraggable(event)){classes.push('fc-event-draggable');}
if(seg.isStart){classes.push('fc-event-start');}
if(seg.isEnd){classes.push('fc-event-end');}
classes=classes.concat(event.className);if(event.source){classes=classes.concat(event.source.className||[]);}
if(url){html+="a href='"+htmlEscape(event.url)+"'";}else{html+="div";}
html+=" class='"+classes.join(' ')+"'"+" style='position:absolute;z-index:8;top:"+seg.top+"px;left:"+seg.left+"px;"+skinCss+"'"+">"+"<div class='fc-event-inner'>"+"<div class='fc-event-time'>"+
htmlEscape(formatDates(event.start,event.end,opt('timeFormat')))+"</div>"+"<div class='fc-event-title'>"+
htmlEscape(event.title)+"</div>"+"</div>"+"<div class='fc-event-bg'></div>";if(seg.isEnd&&isEventResizable(event)){html+="<div class='ui-resizable-handle ui-resizable-s'>=</div>";}
html+="</"+(url?"a":"div")+">";return html;}
function bindDaySeg(event,eventElement,seg){if(isEventDraggable(event)){draggableDayEvent(event,eventElement,seg.isStart);}
if(seg.isEnd&&isEventResizable(event)){resizableDayEvent(event,eventElement,seg);}
eventElementHandlers(event,eventElement);}
function bindSlotSeg(event,eventElement,seg){var timeElement=eventElement.find('div.fc-event-time');if(isEventDraggable(event)){draggableSlotEvent(event,eventElement,timeElement);}
if(seg.isEnd&&isEventResizable(event)){resizableSlotEvent(event,eventElement,timeElement);}
eventElementHandlers(event,eventElement);}
function draggableDayEvent(event,eventElement,isStart){var origWidth;var revert;var allDay=true;var dayDelta;var dis=opt('isRTL')?-1:1;var hoverListener=getHoverListener();var colWidth=getColWidth();var snapHeight=getSnapHeight();var snapMinutes=getSnapMinutes();var minMinute=getMinMinute();eventElement.draggable({zIndex:9,opacity:opt('dragOpacity','month'),revertDuration:opt('dragRevertDuration'),start:function(ev,ui){trigger('eventDragStart',eventElement,event,ev,ui);hideEvents(event,eventElement);origWidth=eventElement.width();hoverListener.start(function(cell,origCell,rowDelta,colDelta){clearOverlays();if(cell){revert=false;dayDelta=colDelta*dis;if(!cell.row){renderDayOverlay(addDays(cloneDate(event.start),dayDelta),addDays(exclEndDay(event),dayDelta));resetElement();}else{if(isStart){if(allDay){eventElement.width(colWidth-10);setOuterHeight(eventElement,snapHeight*Math.round((event.end?((event.end-event.start)/MINUTE_MS):opt('defaultEventMinutes'))/snapMinutes));eventElement.draggable('option','grid',[colWidth,1]);allDay=false;}}else{revert=true;}}
revert=revert||(allDay&&!dayDelta);}else{resetElement();revert=true;}
eventElement.draggable('option','revert',revert);},ev,'drag');},stop:function(ev,ui){hoverListener.stop();clearOverlays();trigger('eventDragStop',eventElement,event,ev,ui);if(revert){resetElement();eventElement.css('filter','');showEvents(event,eventElement);}else{var minuteDelta=0;if(!allDay){minuteDelta=Math.round((eventElement.offset().top-getBodyContent().offset().top)/snapHeight)*snapMinutes
+minMinute
-(event.start.getHours()*60+event.start.getMinutes());}
eventDrop(this,event,dayDelta,minuteDelta,allDay,ev,ui);}}});function resetElement(){if(!allDay){eventElement.width(origWidth).height('').draggable('option','grid',null);allDay=true;}}}
function draggableSlotEvent(event,eventElement,timeElement){var origPosition;var allDay=false;var dayDelta;var minuteDelta;var prevMinuteDelta;var dis=opt('isRTL')?-1:1;var hoverListener=getHoverListener();var colCnt=getColCnt();var colWidth=getColWidth();var snapHeight=getSnapHeight();var snapMinutes=getSnapMinutes();eventElement.draggable({zIndex:9,scroll:false,grid:[colWidth,snapHeight],axis:colCnt==1?'y':false,opacity:opt('dragOpacity'),revertDuration:opt('dragRevertDuration'),start:function(ev,ui){trigger('eventDragStart',eventElement,event,ev,ui);hideEvents(event,eventElement);origPosition=eventElement.position();minuteDelta=prevMinuteDelta=0;hoverListener.start(function(cell,origCell,rowDelta,colDelta){eventElement.draggable('option','revert',!cell);clearOverlays();if(cell){dayDelta=colDelta*dis;if(opt('allDaySlot')&&!cell.row){if(!allDay){allDay=true;timeElement.hide();eventElement.draggable('option','grid',null);}
renderDayOverlay(addDays(cloneDate(event.start),dayDelta),addDays(exclEndDay(event),dayDelta));}else{resetElement();}}},ev,'drag');},drag:function(ev,ui){minuteDelta=Math.round((ui.position.top-origPosition.top)/snapHeight)*snapMinutes;if(minuteDelta!=prevMinuteDelta){if(!allDay){updateTimeText(minuteDelta);}
prevMinuteDelta=minuteDelta;}},stop:function(ev,ui){var cell=hoverListener.stop();clearOverlays();trigger('eventDragStop',eventElement,event,ev,ui);if(cell&&(dayDelta||minuteDelta||allDay)){eventDrop(this,event,dayDelta,allDay?0:minuteDelta,allDay,ev,ui);}else{resetElement();eventElement.css('filter','');eventElement.css(origPosition);updateTimeText(0);showEvents(event,eventElement);}}});function updateTimeText(minuteDelta){var newStart=addMinutes(cloneDate(event.start),minuteDelta);var newEnd;if(event.end){newEnd=addMinutes(cloneDate(event.end),minuteDelta);}
timeElement.text(formatDates(newStart,newEnd,opt('timeFormat')));}
function resetElement(){if(allDay){timeElement.css('display','');eventElement.draggable('option','grid',[colWidth,snapHeight]);allDay=false;}}}
function resizableSlotEvent(event,eventElement,timeElement){var snapDelta,prevSnapDelta;var snapHeight=getSnapHeight();var snapMinutes=getSnapMinutes();eventElement.resizable({handles:{s:'.ui-resizable-handle'},grid:snapHeight,start:function(ev,ui){snapDelta=prevSnapDelta=0;hideEvents(event,eventElement);eventElement.css('z-index',9);trigger('eventResizeStart',this,event,ev,ui);},resize:function(ev,ui){snapDelta=Math.round((Math.max(snapHeight,eventElement.height())-ui.originalSize.height)/snapHeight);if(snapDelta!=prevSnapDelta){timeElement.text(formatDates(event.start,(!snapDelta&&!event.end)?null:addMinutes(eventEnd(event),snapMinutes*snapDelta),opt('timeFormat')));prevSnapDelta=snapDelta;}},stop:function(ev,ui){trigger('eventResizeStop',this,event,ev,ui);if(snapDelta){eventResize(this,event,0,snapMinutes*snapDelta,ev,ui);}else{eventElement.css('z-index',8);showEvents(event,eventElement);}}});}}
function countForwardSegs(levels){var i,j,k,level,segForward,segBack;for(i=levels.length-1;i>0;i--){level=levels[i];for(j=0;j<level.length;j++){segForward=level[j];for(k=0;k<levels[i-1].length;k++){segBack=levels[i-1][k];if(segsCollide(segForward,segBack)){segBack.forward=Math.max(segBack.forward||0,(segForward.forward||0)+1);}}}}};;function View(element,calendar,viewName){var t=this;t.element=element;t.calendar=calendar;t.name=viewName;t.opt=opt;t.trigger=trigger;t.isEventDraggable=isEventDraggable;t.isEventResizable=isEventResizable;t.reportEvents=reportEvents;t.eventEnd=eventEnd;t.reportEventElement=reportEventElement;t.reportEventClear=reportEventClear;t.eventElementHandlers=eventElementHandlers;t.showEvents=showEvents;t.hideEvents=hideEvents;t.eventDrop=eventDrop;t.eventResize=eventResize;var defaultEventEnd=t.defaultEventEnd;var normalizeEvent=calendar.normalizeEvent;var reportEventChange=calendar.reportEventChange;var eventsByID={};var eventElements=[];var eventElementsByID={};var options=calendar.options;function opt(name,viewNameOverride){var v=options[name];if(typeof v=='object'){return smartProperty(v,viewNameOverride||viewName);}
return v;}
function trigger(name,thisObj){return calendar.trigger.apply(calendar,[name,thisObj||t].concat(Array.prototype.slice.call(arguments,2),[t]));}
function isEventDraggable(event){return isEventEditable(event)&&!opt('disableDragging');}
function isEventResizable(event){return isEventEditable(event)&&!opt('disableResizing');}
function isEventEditable(event){return firstDefined(event.editable,(event.source||{}).editable,opt('editable'));}
function reportEvents(events){eventsByID={};var i,len=events.length,event;for(i=0;i<len;i++){event=events[i];if(eventsByID[event._id]){eventsByID[event._id].push(event);}else{eventsByID[event._id]=[event];}}}
function eventEnd(event){return event.end?cloneDate(event.end):defaultEventEnd(event);}
function reportEventElement(event,element){eventElements.push(element);if(eventElementsByID[event._id]){eventElementsByID[event._id].push(element);}else{eventElementsByID[event._id]=[element];}}
function reportEventClear(){eventElements=[];eventElementsByID={};}
function eventElementHandlers(event,eventElement){eventElement.click(function(ev){if(!eventElement.hasClass('ui-draggable-dragging')&&!eventElement.hasClass('ui-resizable-resizing')){return trigger('eventClick',this,event,ev);}}).hover(function(ev){trigger('eventMouseover',this,event,ev);},function(ev){trigger('eventMouseout',this,event,ev);});}
function showEvents(event,exceptElement){eachEventElement(event,exceptElement,'show');}
function hideEvents(event,exceptElement){eachEventElement(event,exceptElement,'hide');}
function eachEventElement(event,exceptElement,funcName){var elements=eventElementsByID[event._id],i,len=elements.length;for(i=0;i<len;i++){if(!exceptElement||elements[i][0]!=exceptElement[0]){elements[i][funcName]();}}}
function eventDrop(e,event,dayDelta,minuteDelta,allDay,ev,ui){var oldAllDay=event.allDay;var eventId=event._id;moveEvents(eventsByID[eventId],dayDelta,minuteDelta,allDay);trigger('eventDrop',e,event,dayDelta,minuteDelta,allDay,function(){moveEvents(eventsByID[eventId],-dayDelta,-minuteDelta,oldAllDay);reportEventChange(eventId);},ev,ui);reportEventChange(eventId);}
function eventResize(e,event,dayDelta,minuteDelta,ev,ui){var eventId=event._id;elongateEvents(eventsByID[eventId],dayDelta,minuteDelta);trigger('eventResize',e,event,dayDelta,minuteDelta,function(){elongateEvents(eventsByID[eventId],-dayDelta,-minuteDelta);reportEventChange(eventId);},ev,ui);reportEventChange(eventId);}
function moveEvents(events,dayDelta,minuteDelta,allDay){minuteDelta=minuteDelta||0;for(var e,len=events.length,i=0;i<len;i++){e=events[i];if(allDay!==undefined){e.allDay=allDay;}
addMinutes(addDays(e.start,dayDelta,true),minuteDelta);if(e.end){e.end=addMinutes(addDays(e.end,dayDelta,true),minuteDelta);}
normalizeEvent(e,options);}}
function elongateEvents(events,dayDelta,minuteDelta){minuteDelta=minuteDelta||0;for(var e,len=events.length,i=0;i<len;i++){e=events[i];e.end=addMinutes(addDays(eventEnd(e),dayDelta,true),minuteDelta);normalizeEvent(e,options);}}};;function DayEventRenderer(){var t=this;t.renderDaySegs=renderDaySegs;t.resizableDayEvent=resizableDayEvent;var opt=t.opt;var trigger=t.trigger;var isEventDraggable=t.isEventDraggable;var isEventResizable=t.isEventResizable;var eventEnd=t.eventEnd;var reportEventElement=t.reportEventElement;var showEvents=t.showEvents;var hideEvents=t.hideEvents;var eventResize=t.eventResize;var getRowCnt=t.getRowCnt;var getColCnt=t.getColCnt;var getColWidth=t.getColWidth;var allDayRow=t.allDayRow;var allDayBounds=t.allDayBounds;var colContentLeft=t.colContentLeft;var colContentRight=t.colContentRight;var dayOfWeekCol=t.dayOfWeekCol;var dateCell=t.dateCell;var compileDaySegs=t.compileDaySegs;var getDaySegmentContainer=t.getDaySegmentContainer;var bindDaySeg=t.bindDaySeg;var formatDates=t.calendar.formatDates;var renderDayOverlay=t.renderDayOverlay;var clearOverlays=t.clearOverlays;var clearSelection=t.clearSelection;function renderDaySegs(segs,modifiedEventId){var segmentContainer=getDaySegmentContainer();var rowDivs;var rowCnt=getRowCnt();var colCnt=getColCnt();var i=0;var rowI;var levelI;var colHeights;var j;var segCnt=segs.length;var seg;var top;var k;segmentContainer[0].innerHTML=daySegHTML(segs);daySegElementResolve(segs,segmentContainer.children());daySegElementReport(segs);daySegHandlers(segs,segmentContainer,modifiedEventId);daySegCalcHSides(segs);daySegSetWidths(segs);daySegCalcHeights(segs);rowDivs=getRowDivs();for(rowI=0;rowI<rowCnt;rowI++){levelI=0;colHeights=[];for(j=0;j<colCnt;j++){colHeights[j]=0;}
while(i<segCnt&&(seg=segs[i]).row==rowI){top=arrayMax(colHeights.slice(seg.startCol,seg.endCol));seg.top=top;top+=seg.outerHeight;for(k=seg.startCol;k<seg.endCol;k++){colHeights[k]=top;}
i++;}
rowDivs[rowI].height(arrayMax(colHeights));}
daySegSetTops(segs,getRowTops(rowDivs));}
function renderTempDaySegs(segs,adjustRow,adjustTop){var tempContainer=$("<div/>");var elements;var segmentContainer=getDaySegmentContainer();var i;var segCnt=segs.length;var element;tempContainer[0].innerHTML=daySegHTML(segs);elements=tempContainer.children();segmentContainer.append(elements);daySegElementResolve(segs,elements);daySegCalcHSides(segs);daySegSetWidths(segs);daySegCalcHeights(segs);daySegSetTops(segs,getRowTops(getRowDivs()));elements=[];for(i=0;i<segCnt;i++){element=segs[i].element;if(element){if(segs[i].row===adjustRow){element.css('top',adjustTop);}
elements.push(element[0]);}}
return $(elements);}
function daySegHTML(segs){var rtl=opt('isRTL');var i;var segCnt=segs.length;var seg;var event;var url;var classes;var bounds=allDayBounds();var minLeft=bounds.left;var maxLeft=bounds.right;var leftCol;var rightCol;var left;var right;var skinCss;var html='';for(i=0;i<segCnt;i++){seg=segs[i];event=seg.event;classes=['fc-event','fc-event-hori'];if(isEventDraggable(event)){classes.push('fc-event-draggable');}
if(seg.isStart){classes.push('fc-event-start');}
if(seg.isEnd){classes.push('fc-event-end');}
if(rtl){leftCol=dayOfWeekCol(seg.end.getDay()-1);rightCol=dayOfWeekCol(seg.start.getDay());left=seg.isEnd?colContentLeft(leftCol):minLeft;right=seg.isStart?colContentRight(rightCol):maxLeft;}else{leftCol=dayOfWeekCol(seg.start.getDay());rightCol=dayOfWeekCol(seg.end.getDay()-1);left=seg.isStart?colContentLeft(leftCol):minLeft;right=seg.isEnd?colContentRight(rightCol):maxLeft;}
classes=classes.concat(event.className);if(event.source){classes=classes.concat(event.source.className||[]);}
url=event.url;skinCss=getSkinCss(event,opt);if(url){html+="<a href='"+htmlEscape(url)+"'";}else{html+="<div";}
html+=" class='"+classes.join(' ')+"'"+" style='position:absolute;z-index:8;left:"+left+"px;"+skinCss+"'"+">"+"<div class='fc-event-inner'>";if(!event.allDay&&seg.isStart){html+="<span class='fc-event-time'>"+
htmlEscape(formatDates(event.start,event.end,opt('timeFormat')))+"</span>";}
html+="<span class='fc-event-title'>"+htmlEscape(event.title)+"</span>"+"</div>";if(seg.isEnd&&isEventResizable(event)){html+="<div class='ui-resizable-handle ui-resizable-"+(rtl?'w':'e')+"'>"+"&nbsp;&nbsp;&nbsp;"+"</div>";}
html+="</"+(url?"a":"div")+">";seg.left=left;seg.outerWidth=right-left;seg.startCol=leftCol;seg.endCol=rightCol+1;}
return html;}
function daySegElementResolve(segs,elements){var i;var segCnt=segs.length;var seg;var event;var element;var triggerRes;for(i=0;i<segCnt;i++){seg=segs[i];event=seg.event;element=$(elements[i]);triggerRes=trigger('eventRender',event,event,element);if(triggerRes===false){element.remove();}else{if(triggerRes&&triggerRes!==true){triggerRes=$(triggerRes).css({position:'absolute',left:seg.left});element.replaceWith(triggerRes);element=triggerRes;}
seg.element=element;}}}
function daySegElementReport(segs){var i;var segCnt=segs.length;var seg;var element;for(i=0;i<segCnt;i++){seg=segs[i];element=seg.element;if(element){reportEventElement(seg.event,element);}}}
function daySegHandlers(segs,segmentContainer,modifiedEventId){var i;var segCnt=segs.length;var seg;var element;var event;for(i=0;i<segCnt;i++){seg=segs[i];element=seg.element;if(element){event=seg.event;if(event._id===modifiedEventId){bindDaySeg(event,element,seg);}else{element[0]._fci=i;}}}
lazySegBind(segmentContainer,segs,bindDaySeg);}
function daySegCalcHSides(segs){var i;var segCnt=segs.length;var seg;var element;var key,val;var hsideCache={};for(i=0;i<segCnt;i++){seg=segs[i];element=seg.element;if(element){key=seg.key=cssKey(element[0]);val=hsideCache[key];if(val===undefined){val=hsideCache[key]=hsides(element,true);}
seg.hsides=val;}}}
function daySegSetWidths(segs){var i;var segCnt=segs.length;var seg;var element;for(i=0;i<segCnt;i++){seg=segs[i];element=seg.element;if(element){element[0].style.width=Math.max(0,seg.outerWidth-seg.hsides)+'px';}}}
function daySegCalcHeights(segs){var i;var segCnt=segs.length;var seg;var element;var key,val;var vmarginCache={};for(i=0;i<segCnt;i++){seg=segs[i];element=seg.element;if(element){key=seg.key;val=vmarginCache[key];if(val===undefined){val=vmarginCache[key]=vmargins(element);}
seg.outerHeight=element[0].offsetHeight+val;}}}
function getRowDivs(){var i;var rowCnt=getRowCnt();var rowDivs=[];for(i=0;i<rowCnt;i++){rowDivs[i]=allDayRow(i).find('div.fc-day-content > div');}
return rowDivs;}
function getRowTops(rowDivs){var i;var rowCnt=rowDivs.length;var tops=[];for(i=0;i<rowCnt;i++){tops[i]=rowDivs[i][0].offsetTop;}
return tops;}
function daySegSetTops(segs,rowTops){var i;var segCnt=segs.length;var seg;var element;var event;for(i=0;i<segCnt;i++){seg=segs[i];element=seg.element;if(element){element[0].style.top=rowTops[seg.row]+(seg.top||0)+'px';event=seg.event;trigger('eventAfterRender',event,event,element);}}}
function resizableDayEvent(event,element,seg){var rtl=opt('isRTL');var direction=rtl?'w':'e';var handle=element.find('.ui-resizable-'+direction);var isResizing=false;disableTextSelection(element);element.mousedown(function(ev){ev.preventDefault();}).click(function(ev){if(isResizing){ev.preventDefault();ev.stopImmediatePropagation();}});handle.mousedown(function(ev){if(ev.which!=1){return;}
isResizing=true;var hoverListener=t.getHoverListener();var rowCnt=getRowCnt();var colCnt=getColCnt();var dis=rtl?-1:1;var dit=rtl?colCnt-1:0;var elementTop=element.css('top');var dayDelta;var helpers;var eventCopy=$.extend({},event);var minCell=dateCell(event.start);clearSelection();$('body').css('cursor',direction+'-resize').one('mouseup',mouseup);trigger('eventResizeStart',this,event,ev);hoverListener.start(function(cell,origCell){if(cell){var r=Math.max(minCell.row,cell.row);var c=cell.col;if(rowCnt==1){r=0;}
if(r==minCell.row){if(rtl){c=Math.min(minCell.col,c);}else{c=Math.max(minCell.col,c);}}
dayDelta=(r*7+c*dis+dit)-(origCell.row*7+origCell.col*dis+dit);var newEnd=addDays(eventEnd(event),dayDelta,true);if(dayDelta){eventCopy.end=newEnd;var oldHelpers=helpers;helpers=renderTempDaySegs(compileDaySegs([eventCopy]),seg.row,elementTop);helpers.find('*').css('cursor',direction+'-resize');if(oldHelpers){oldHelpers.remove();}
hideEvents(event);}else{if(helpers){showEvents(event);helpers.remove();helpers=null;}}
clearOverlays();renderDayOverlay(event.start,addDays(cloneDate(newEnd),1));}},ev);function mouseup(ev){trigger('eventResizeStop',this,event,ev);$('body').css('cursor','');hoverListener.stop();clearOverlays();if(dayDelta){eventResize(this,event,dayDelta,0,ev);}
setTimeout(function(){isResizing=false;},0);}});}};;function SelectionManager(){var t=this;t.select=select;t.unselect=unselect;t.reportSelection=reportSelection;t.daySelectionMousedown=daySelectionMousedown;var opt=t.opt;var trigger=t.trigger;var defaultSelectionEnd=t.defaultSelectionEnd;var renderSelection=t.renderSelection;var clearSelection=t.clearSelection;var selected=false;if(opt('selectable')&&opt('unselectAuto')){$(document).mousedown(function(ev){var ignore=opt('unselectCancel');if(ignore){if($(ev.target).parents(ignore).length){return;}}
unselect(ev);});}
function select(startDate,endDate,allDay){unselect();if(!endDate){endDate=defaultSelectionEnd(startDate,allDay);}
renderSelection(startDate,endDate,allDay);reportSelection(startDate,endDate,allDay);}
function unselect(ev){if(selected){selected=false;clearSelection();trigger('unselect',null,ev);}}
function reportSelection(startDate,endDate,allDay,ev){selected=true;trigger('select',null,startDate,endDate,allDay,ev);}
function daySelectionMousedown(ev){var cellDate=t.cellDate;var cellIsAllDay=t.cellIsAllDay;var hoverListener=t.getHoverListener();var reportDayClick=t.reportDayClick;if(ev.which==1&&opt('selectable')){unselect(ev);var _mousedownElement=this;var dates;hoverListener.start(function(cell,origCell){clearSelection();if(cell&&cellIsAllDay(cell)){dates=[cellDate(origCell),cellDate(cell)].sort(cmp);renderSelection(dates[0],dates[1],true);}else{dates=null;}},ev);$(document).one('mouseup',function(ev){hoverListener.stop();if(dates){if(+dates[0]==+dates[1]){reportDayClick(dates[0],true,ev);}
reportSelection(dates[0],dates[1],true,ev);}});}}};;function OverlayManager(){var t=this;t.renderOverlay=renderOverlay;t.clearOverlays=clearOverlays;var usedOverlays=[];var unusedOverlays=[];function renderOverlay(rect,parent){var e=unusedOverlays.shift();if(!e){e=$("<div class='fc-cell-overlay' style='position:absolute;z-index:3'/>");}
if(e[0].parentNode!=parent[0]){e.appendTo(parent);}
usedOverlays.push(e.css(rect).show());return e;}
function clearOverlays(){var e;while(e=usedOverlays.shift()){unusedOverlays.push(e.hide().unbind());}}};;function CoordinateGrid(buildFunc){var t=this;var rows;var cols;t.build=function(){rows=[];cols=[];buildFunc(rows,cols);};t.cell=function(x,y){var rowCnt=rows.length;var colCnt=cols.length;var i,r=-1,c=-1;for(i=0;i<rowCnt;i++){if(y>=rows[i][0]&&y<rows[i][1]){r=i;break;}}
for(i=0;i<colCnt;i++){if(x>=cols[i][0]&&x<cols[i][1]){c=i;break;}}
return(r>=0&&c>=0)?{row:r,col:c}:null;};t.rect=function(row0,col0,row1,col1,originElement){var origin=originElement.offset();return{top:rows[row0][0]-origin.top,left:cols[col0][0]-origin.left,width:cols[col1][1]-cols[col0][0],height:rows[row1][1]-rows[row0][0]};};};;function HoverListener(coordinateGrid){var t=this;var bindType;var change;var firstCell;var cell;t.start=function(_change,ev,_bindType){change=_change;firstCell=cell=null;coordinateGrid.build();mouse(ev);bindType=_bindType||'mousemove';$(document).bind(bindType,mouse);};function mouse(ev){_fixUIEvent(ev);var newCell=coordinateGrid.cell(ev.pageX,ev.pageY);if(!newCell!=!cell||newCell&&(newCell.row!=cell.row||newCell.col!=cell.col)){if(newCell){if(!firstCell){firstCell=newCell;}
change(newCell,firstCell,newCell.row-firstCell.row,newCell.col-firstCell.col);}else{change(newCell,firstCell);}
cell=newCell;}}
t.stop=function(){$(document).unbind(bindType,mouse);return cell;};}
function _fixUIEvent(event){if(event.pageX===undefined){event.pageX=event.originalEvent.pageX;event.pageY=event.originalEvent.pageY;}};;function HorizontalPositionCache(getElement){var t=this,elements={},lefts={},rights={};function e(i){return elements[i]=elements[i]||getElement(i);}
t.left=function(i){return lefts[i]=lefts[i]===undefined?e(i).position().left:lefts[i];};t.right=function(i){return rights[i]=rights[i]===undefined?t.left(i)+e(i).width():rights[i];};t.clear=function(){elements={};lefts={};rights={};};};;})(jQuery);(function($){var fc=$.fullCalendar;var formatDate=fc.formatDate;var parseISO8601=fc.parseISO8601;var addDays=fc.addDays;var applyAll=fc.applyAll;fc.sourceNormalizers.push(function(sourceOptions){if(sourceOptions.dataType=='gcal'||sourceOptions.dataType===undefined&&(sourceOptions.url||'').match(/^(http|https):\/\/www.google.com\/calendar\/feeds\//)){sourceOptions.dataType='gcal';if(sourceOptions.editable===undefined){sourceOptions.editable=false;}}});fc.sourceFetchers.push(function(sourceOptions,start,end){if(sourceOptions.dataType=='gcal'){return transformOptions(sourceOptions,start,end);}});function transformOptions(sourceOptions,start,end){var success=sourceOptions.success;var data=$.extend({},sourceOptions.data||{},{'start-min':formatDate(start,'u'),'start-max':formatDate(end,'u'),'singleevents':true,'max-results':9999});var ctz=sourceOptions.currentTimezone;if(ctz){data.ctz=ctz=ctz.replace(' ','_');}
return $.extend({},sourceOptions,{url:sourceOptions.url.replace(/\/basic$/,'/full')+'?alt=json-in-script&callback=?',dataType:'jsonp',data:data,startParam:false,endParam:false,success:function(data){var events=[];if(data.feed.entry){$.each(data.feed.entry,function(i,entry){var startStr=entry['gd$when'][0]['startTime'];var start=parseISO8601(startStr,true);var end=parseISO8601(entry['gd$when'][0]['endTime'],true);var allDay=startStr.indexOf('T')==-1;var url;$.each(entry.link,function(i,link){if(link.type=='text/html'){url=link.href;if(ctz){url+=(url.indexOf('?')==-1?'?':'&')+'ctz='+ctz;}}});if(allDay){addDays(end,-1);}
events.push({id:entry['gCal$uid']['value'],title:entry['title']['$t'],url:url,start:start,end:end,allDay:allDay,location:entry['gd$where'][0]['valueString'],description:entry['content']['$t']});});}
var args=[events].concat(Array.prototype.slice.call(arguments,1));var res=applyAll(success,this,args);if($.isArray(res)){return res;}
return events;}});}
fc.gcalFeed=function(url,sourceOptions){return $.extend({},sourceOptions,{url:url,dataType:'gcal'});};})(jQuery);