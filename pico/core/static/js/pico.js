!function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var a=t[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}function n(e,n,a){return n&&t(e.prototype,n),a&&t(e,a),e}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&r(e,t)}function i(e){return(i=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function r(e,t){return(r=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function o(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function c(e,t){return!t||"object"!=typeof t&&"function"!=typeof t?o(e):t}var s=function(){function t(){e(this,t),this.__callbacks={}}return n(t,[{key:"on",value:function(e,t){return void 0===this.__callbacks[e]&&(this.__callbacks[e]=[]),this.__callbacks[e].push(t),this}},{key:"off",value:function(e,t){var n=this.__callbacks[e];if(void 0===n)return this;var a=[];if(void 0!==t)for(var i=0;i<n.length;i++)n[i]!==t&&a.push(n[i]);return this.__callbacks[e]=a,this}},{key:"emit",value:function(e){var t=this.__callbacks[e],n=Array.from(arguments).slice(1);if(void 0!==t)for(var a=0;a<t.length;a++)t[a].apply(this,n);return this}}]),t}(),d=function(t){function r(t){var n,a=t.plugins,s=t.views;return e(this,r),(n=c(this,i(r).call(this))).__plugins=[],n.__views=[],Array.isArray(a)&&a.forEach((function(e){var t=new e(o(n));n.__plugins.push(t)})),Array.isArray(s)&&s.forEach((function(e){var t=new e(o(n));n.__views.push(t)})),n.$=window.$,n.$(document).ready((function(){n.ready()})),n}return a(r,t),n(r,[{key:"ready",value:function(){var e=this.$("body");this.__views.forEach((function(t){var n=t.classNames(),a=!1;n.forEach((function(t){a||e.hasClass(t)||(a=!0)})),a||t.ready()})),this.emit("ready")}}]),r}(s),u=function(t){function r(t){var n;return e(this,r),(n=c(this,i(r).call(this))).app=t,t.on("ready",n.ready),n}return a(r,t),n(r,[{key:"ready",value:function(){}}]),r}(s),l=function(t){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,t),n(r,[{key:"check",value:function(e){var t=this;return new Promise((function(n,a){t.emit("validating"),t.validate(e).then((function(e){t.emit("valid"),n(e)})).catch((function(e){t.emit("invalid",e),a(e)}))}))}},{key:"validate",value:function(){throw new Error("Method not implemented")}}]),r}(s),f=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,h=function(t){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,t),n(r,[{key:"validate",value:function(e){return new Promise((function(t,n){var a=String(e).toLowerCase();f.test(a)?t(a):n(new Error("This doesn't look like an email address."))}))}}]),r}(l),v=function(t){function r(t){var n;return e(this,r),(n=c(this,i(r).call(this))).basis=t,n}return a(r,t),n(r,[{key:"validate",value:function(e){var t=this;return new Promise((function(n,a){var i=new WebSocket("ws://".concat(window.location.host,"/ws/unique/").concat(t.basis,"/")),r=!1,o=!1;i.onclose=function(){o||r||a(new Error("An error occurred while communicating with the server."))},i.onmessage=function(t){var c=JSON.parse(t.data);c.valid?o||r||(r=!0,i.close(),n(e)):o||r||(o=!0,i.close(),a(new Error(c.error)))},i.onopen=function(){i.send(e)}}))}}]),r}(l),p=function(t){function r(t){var n;return e(this,r),(n=c(this,i(r).call(this))).checkAgainst=t,n}return a(r,t),n(r,[{key:"validate",value:function(e){var t=this;return new Promise((function(n,a){e!==t.checkAgainst?a(new Error("This value doesn't match the previous one.")):n(e)}))}}]),r}(l),m=function(t){function r(t){var n;return e(this,r),(n=c(this,i(r).call(this))).basis=t,n}return a(r,t),n(r,[{key:"validate",value:function(e){var t=this;return new Promise((function(n,a){var i=new WebSocket("ws://".concat(window.location.host,"/ws/validate/").concat(t.basis,"/")),r=!1,o=!1;i.onclose=function(){o||r||a(new Error("An error occurred while communicating with the server."))},i.onmessage=function(t){var c=JSON.parse(t.data);c.valid?o||r||(r=!0,i.close(),n(e)):o||r||(o=!0,i.close(),a(new Error(c.error)))},i.onopen=function(){i.send(e)}}))}}]),r}(l),w=function(t){function n(t,a){var r;e(this,n),r=c(this,i(n).call(this));r.show=function(e){return new Promise((function(t){a.hasClass("active")&&(r.emit("shown"),t()),r.emit("showing"),e?a.addClass("showing-"+e):a.addClass("showing"),setTimeout((function(){e?a.removeClass("showing-"+e):a.removeClass("showing"),r.emit("shown"),t()}),333)}))},r.hide=function(e){return new Promise((function(t){r.emit("hiding"),e?a.addClass("hiding-"+e):a.addClass("hiding"),setTimeout((function(){e?a.removeClass("hiding-"+e):a.removeClass("hiding"),r.emit("hidden"),t()}),333)}))},r.on("showing",(function(){a.addClass("active"),a.trigger("wizard.showing")})),r.on("hidden",(function(){a.removeClass("active"),a.trigger("wizard.hidden")})),r.on("shown",(function(){a.find(":input").first().focus(),a.trigger("wizard.shown")})),r.on("validation",(function(e){if(void 0===e)return a.find(":input.is-invalid").removeClass("is-invalid"),void a.find(".invalid-feedback").remove();var t=window.$(e.field),n=t.closest(".form-group"),i=n.find(".invalid-feedback");t.addClass("is-invalid"),i.length||(i=window.$("<div>").addClass("invalid-feedback")).appendTo(n),i.text(e.message),t.focus()})),r.prev=function(){r.hide("rw").then((function(){r.emit("moving.prev"),r.emit("prev")}))},r.next=function(){var e,t,n;e=a.find('button, input[type="button"]').attr("disabled","disabled"),t=a.find(":input").not(e).not("[disabled]"),n=function(){e.removeAttr("disabled"),t.removeAttr("disabled")},t.attr("disabled","disabled"),r.on("moving.next",n),r.on("validation",(function(e){e&&n()})),r.emit("validation"),r.validate().then((function(){r.emit("moving.next"),r.hide("ff").then((function(){r.emit("next")}))})).catch((function(e){r.emit("validation",e)}))},r.validate=function(){return new Promise((function(e,t){var n=!1,i=[],r=a.closest("form");a.find(":input").each((function(){if(n)return!1;var e=window.$(this),a=e.val(),o=e.attr("required"),c=e.attr("type")||"text",s=e.attr("data-unique"),d=e.attr("data-validator"),u=e.attr("data-pair");if(o&&!a.trim())return n=!0,t({field:e,message:"This field is required."}),!1;switch(c){case"email":i.push([new h,e])}s&&i.push([new v(s),e]),d&&i.push([new m(d),e]),u&&i.push([new p(r.find(':input[name="'.concat(u,'"]')).val()),e])}));i.length?function a(){var r=i.shift(),o=r[0],c=r[1],s=c.val().trim();o.check(s).then((function(){i.length?a():n||e()})).catch((function(e){n||(n=!0,t({field:c,message:e.message}))}))}():n||e()}))};var s=o(r);return a.on("click",'[data-action="prev"]',(function(){s.prev()})),a.on("click","[data-skip]",(function(){var e=parseInt(window.$(this).data("skip"));s.hide("ff"),s.emit("skip",e)})),a.on("click",'[data-action="next"]',(function(){s.next()})),a.on("keydown",":input",(function(e){13===e.keyCode&&(e.preventDefault(),s.next())})),r}return a(n,t),n}(s),b=function(t){function n(t){var a;e(this,n);var r=o(a=c(this,i(n).call(this))),s=[];return t.find(".step").each((function(){var e=window.$(this),t=new w(r,e);e.data("wizard-step",t),s.push(t)})),s.forEach((function(e,t){t>0&&e.on("moving.prev",(function(){s[t-1].show("rw")})),t<s.length-1?e.on("moving.next",(function(){s[t+1].show("ff")})):e.on("next",(function(){a.submit()})),e.on("skip",(function(e){s[e].show("ff")}))})),a.show=function(e){void 0===e&&(e=0),t.find(".step").each((function(t){if(window.$(this).find(".form-group.is-invalid").length)return e=t,!1})),s[e].show()},a.submit=function(){t.closest("form").submit()},a}return a(n,t),n}(s),g=function(t){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,t),n(r,[{key:"ready",value:function(){var e=this.$;e(".wizard").each((function(){new b(e(this)).show()}))}}]),r}(u),y=function(t){function n(t){var a;e(this,n),a=c(this,i(n).call(this));var r=t.find('input[type="file"]'),s=r.attr("accept"),d=o(a),u=function(e){if(s){var t=new RegExp("^"+s.replace("/","\\/").replace("*",".*"));if(!e.type.match(t))return!1}return!0};return t.on("dragenter",(function(e){e.preventDefault(),t.addClass("active"),a.emit("drag.enter")})).on("dragleave",(function(e){e.preventDefault(),t.removeClass("active"),a.emit("drag.exit")})).on("dragover",(function(e){e.preventDefault(),t.addClass("active"),a.emit("drag.over")})).on("drop",(function(e){if(e.preventDefault(),1===e.originalEvent.dataTransfer.files.length){var t=0;for(t=0;t<e.originalEvent.dataTransfer.files.length;t++)if(!u(e.originalEvent.dataTransfer.files[t]))return void a.emit("error",new Error("The dragged file was not of the correct type."));e.originalEvent.dataTransfer.files&&(r.get(0).files=e.originalEvent.dataTransfer.files,r.trigger("change"))}})).on("click",(function(e){e.target!==r.get(0)&&(e.preventDefault(),r.get(0).click())})),r.on("change",(function(){var e=0;for(e=0;e<this.files.length;e++)d.emit("file",this.files[e])})),a}return a(n,t),n}(s),k=function(t){function n(t){var a;return e(this,n),(a=c(this,i(n).call(this,t))).on("error",(function(){alert("Only images are supported here.")})),a.on("file",(function(e){var n=new FileReader;n.onload=function(e){t.css("background-image","url(".concat(e.target.result,")"))},n.readAsDataURL(e)})),a}return a(n,t),n}(y),C=function(t){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,t),n(r,[{key:"ready",value:function(){var e=this.$;e(".dropzone").each((function(){var t=e(this);t.hasClass("dropzone-image")?new k(t):new y(t)}))}}]),r}(u),x=function(e,t){void 0===t&&(t=333);var n=null,a=[],i=function(){e.apply(e,a),n=null};return function(){for(var e=arguments.length,r=new Array(e),o=0;o<e;o++)r[o]=arguments[o];a=r,null===n&&(n=setTimeout(i,t))}},E=function(t){function n(t){var a;return e(this,n),(a=c(this,i(n).call(this))).data=t,a.attach=function(e){var n=window.$("<a>").addClass("typeahead-item").addClass("list-group-item").attr("href","javascript:;");if(t.thumbnail){var i=window.$("<div>").addClass("d-flex w-100"),r=window.$("<img>").attr("src",t.thumbnail).attr("height","30").addClass("mr-3"),o=window.$("<span>").text(t.label);r.appendTo(i),o.appendTo(i),i.appendTo(n)}else n.text(t.label);n.on("click",(function(){a.select()})),n.appendTo(e),a.focus=function(){n.addClass("active").addClass("list-item-active"),a.emit("focused")},a.blur=function(){n.removeClass("active").removeClass("list-item-active"),a.emit("blurred")},a.select=function(){n.addClass("active").addClass("list-item-active"),a.emit("selected")}},a.focus=function(){throw new Error("List item not attached to container DOM element.")},a.blur=function(){throw new Error("List item not attached to container DOM element.")},a}return a(n,t),n}(s),_=function(t){function n(t){var a;return e(this,n),(a=c(this,i(n).call(this))).attach=function(e){var n=window.$("<div>").addClass("typeahead-container").addClass("list-group"),i=e.offset(),r=null,o=[];t.forEach((function(e,t){var i=new E(e);i.index=t,i.on("focused",(function(){r!==i&&(null!==r&&r.blur(),r=i)})),i.on("selected",(function(){a.emit("selected",i)})),o.push(i),i.attach(n)})),n.css({position:"absolute",top:i.top+e.outerHeight(!0),left:i.left,width:e.outerWidth(!0)}),window.$("body").append(n),a.detatch=function(){n.remove()},a.moveUp=function(){var e=null;null!==r&&(e=r.index),e=null===e?t.length-1:Math.max(0,e-1),a.focus(e)},a.moveDown=function(){var e=null;null!==r&&(e=r.index),e=null===e?0:Math.min(t.length-1,e+1),a.focus(e)},a.focus=function(e){if(void 0===e)throw new Error("Expected index of item to select.");void 0!==o[e]?o[e].focus():(null!==r&&r.blur(),r=null)},a.select=function(){null!==r&&r.select()}},a.detatch=function(){throw new Error("List has not been attached to a DOM element.")},a}return a(n,t),n}(s),z=function(t){function n(t,a,r){var o;e(this,n),o=c(this,i(n).call(this));var s=t.attr("name"),d=window.$("<input>").attr("name",s).attr("type","hidden");t.removeAttr("name"),t.after(d);var u=new x((function(e){var n=a.replace("%s",encodeURIComponent(e));window.$.getJSON(n,(function(e){var n=r(e),a=new _(n);t.data("typeahed-list")&&t.data("typeahed-list").detatch(),o.on("move.up",(function(){a.moveUp()})),o.on("move.down",(function(){a.moveDown()})),o.on("select",(function(){a.select()})),a.on("selected",(function(e){d.val(e.data.id),t.val(e.data.label),a.detatch(),t.focus()})),a.attach(t),t.data("typeahed-list",a)}))}),900);return t.on("input",(function(){return u(t.val())})),t.on("keydown",(function(e){switch(e.keyCode){case 40:e.preventDefault(),o.emit("move.down");break;case 38:e.preventDefault(),o.emit("move.up");break;case 13:d.val()||(e.preventDefault(),e.stopPropagation(),o.emit("select"))}})),o}return a(n,t),n}(s),j=function(e){var t=e.indexOf(".$."),n=e.substr(0,t),a=e.substr(t+3);return function(e,t){var i=t[n][e];if(void 0===i)throw new Error("Index out of range.");return i[a]}},D=function(e){var t=e.indexOf(".$."),n=e.substr(0,t);return function(e){var t=e[n];if(Array.isArray(t))return t.length;throw new Error("Value is not an array.")}},$=function t(n){e(this,t),this.transform=function(e){var t=n.id,a=n.label,i=n.thumbnail,r=t?new j(t):null,o=a?new j(a):null,c=i?new j(i):null,s=new D(t),d=0;if(!r)throw new Error("No template provided for returning an object ID.");if(!o)throw new Error("No template provided for returning an object label.");try{d=s(e)}catch(e){throw new Error("Invalid data returned.")}var u,l,f=0,h=[];for(f=0;f<d;f++)h.push((u=f,l=void 0,(l={}).id=r(u,e),l.label=o(u,e),c&&(l.thumbnail=c(u,e)),l));return h}},O=function(t){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,t),n(r,[{key:"ready",value:function(){var e=this.$;e("input[data-typeahead-url]").each((function(){var t=e(this),n=t.data("typeahead-url"),a=new $(t.data("typeahead-transform")),i=new z(t,n,a.transform);t.removeAttr("data-typeahead-url"),t.removeAttr("data-typeahead-transform"),t.data("typeahead",i)}))}}]),r}(u),A=function(t){function r(t){var n;return e(this,r),(n=c(this,i(r).call(this))).app=t,n}return a(r,t),n(r,[{key:"classNames",value:function(){return[]}}]),n(r,[{key:"ready",value:function(){}}]),r}(s),T=function(t){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,t),n(r,[{key:"classNames",value:function(){return["projects","create-project"]}},{key:"ready",value:function(){var e=this.app.$,t=e('input[name="name"]'),n=e("#id_apple_podcasts_id");n.closest(".step").on("wizard.shown",(function(){n.val()&&n.trigger("input")})),t.on("change",(function(){n.val(t.val())}))}}]),r}(A),P=function(t){function n(t,a){var r;e(this,n);var o=null,s=null,d=!1;(r=c(this,i(n).call(this))).connect=function(){o=new WebSocket(t);var e=function(e,t,n){var a={meta:window.$.extend({method:e},n),data:t},i=JSON.stringify(a);o.send(i)};r.create=function(t){return e("create",t)},r.update=function(t){return e("update",t)},r.update_list=function(t,n){return e("update_list",n,{type:t})},r.delete=function(t){return e("delete",t)},r.list=function(t){return e("list",t)},o.onclose=function(){o=null,u(),d&&(d=!1,r.emit("disconnected")),s=setTimeout((function(){a*=2,r.connect()}),a),console.warn("Waiting ".concat(a/1e3," second(s) for connection to be restored."))},o.onmessage=function(e){var t=JSON.parse(e.data);if(t.error)console.warn(t.error);else if(t.meta){switch(t.meta.method){case"list":return void r.emit("listed",t.meta.type,t.data);case"create":return void r.emit("created",t.meta.type,t.data);case"update":return void r.emit("updated",t.meta.type,t.data);case"update_list":return void r.emit("listed",t.meta.type,t.data);case"delete":return void r.emit("deleted",t.meta.type,t.data)}console.warn("Unrecognised response.",t.meta)}else console.warn("Missing response metadata.")},o.onopen=function(){null!==s&&(clearTimeout(s),s=null),d||(d=!0,r.emit("connected"))}};var u=function(){void 0===a&&(a=1e3),r.create=function(){throw new Error("Database not connected.")},r.update=function(){throw new Error("Database not connected.")},r.update_list=function(){throw new Error("Database not connected.")},r.delete=function(){throw new Error("Database not connected.")},r.list=function(){throw new Error("Database not connected.")},r.send=function(){throw new Error("Database not connected.")}};return u(),r}return a(n,t),n}(s),M=function(t){function r(){var t;e(this,r),(t=c(this,i(r).call(this))).accepted=!1,t.rejected=!1,t.cancelled=!1;var n=setTimeout((function(){t.cancel()}),1e4);return t.on("accepted",(function(){clearTimeout(n)})),t.on("rejected",(function(){clearTimeout(n)})),t}return a(r,t),n(r,[{key:"accept",value:function(e){if(this.accepted||this.rejected||this.cancelled)throw new Error("Request is in an invalid state.");this.accepted=!0,this.emit("accepted",e)}},{key:"reject",value:function(){if(this.accepted||this.rejected||this.cancelled)throw new Error("Request is in an invalid state.");this.rejected=!0,this.emit("rejected")}},{key:"cancel",value:function(){if(this.accepted||this.rejected||this.cancelled)throw new Error("Request is in an invalid state.");this.cancelled=!0,this.emit("cancelled")}}]),r}(s),R=window.$,q=function(t){function n(){var t;return e(this,n),(t=c(this,i(n).call(this))).actions={},t.attach=function(e){var n=R("<div>").addClass("kanban-card card mb-3"),a=R("<div>").addClass("card-body");if(n.append(a),e.append(n),t.populate(a),Object.keys(t.actions).length){var i=R("<div>").addClass("card-footer text-right");Object.keys(t.actions).forEach((function(e){var n=t.actions[e],a=R("<a>").attr("href","javascript:;"),r=R("<i>").addClass("fa fa-".concat(n.icon||e));a.on("click",(function(t){t.preventDefault(),n.perform().catch((function(t){console.warn("Error performing",e,t)}))})),a.addClass("text-muted"),a.append(r),i.append(a)})),n.append(i)}return t.detatch=function(){n.remove(),t.detatch=function(){throw new Error("Card has not been attached to a DOM element.")},t.freeze=function(){throw new Error("Card has not been attached to a DOM element.")},t.unfreeze=function(){throw new Error("Card has not been attached to a DOM element.")},t.emit("detatched")},t.freeze=function(){n.addClass("kanban-frozen")},t.unfreeze=function(){n.removeClass("kanban-frozen")},t.emit("attached"),n},t.populate=function(){},t.cancel=function(){t.emit("cancelled")},t.submit=function(e){t.emit("submitted",e)},t.detatch=function(){throw new Error("Card has not been attached to a DOM element.")},t.freeze=function(){throw new Error("Card has not been attached to a DOM element.")},t.unfreeze=function(){throw new Error("Card has not been attached to a DOM element.")},t}return a(n,t),n}(s),S=function(t){function n(t){var a;return e(this,n),(a=c(this,i(n).call(this,t))).populate=function(e){var n=R("<input>").attr("type","text").addClass("form-control");t.placeholder&&n.attr("placeholder",t.placeholder),n.on("keyup",(function(e){switch(e.keyCode){case 27:a.cancel();break;case 13:e.preventDefault(),a.submit(n.val())}})),e.append(n),n.focus()},a}return a(n,t),n}(q),N=function(t){function n(t){var a;return e(this,n),(a=c(this,i(n).call(this,t))).id=t.id,a.ordering=t.ordering,a.actions={delete:{icon:"trash",title:"Delete card",perform:function(){return new Promise((function(e,t){confirm("Are you sure?")?a.destroy().then((function(){e(!0)})).catch((function(e){t(e)})):e(!1)}))}}},a.populate=function(e){var n=R("<a>").attr("href",t.url).text(t.name);e.append(n)},a.destroy=function(){return new Promise((function(e){a.emit("destroy",e)}))},a.move=function(e,t){a.freeze(),a.emit("send",e,t)},a.update=function(e){t=e,a.ordering=e.ordering,a.name=e.name},a}return a(n,t),n}(q),U=window.$,L=function t(n){e(this,t),this.attach=function(e){var t={info:"#17a2b8",warning:"#ffc107",danger:"#dc3545",success:"#28a745"},a=t[n];void 0===a&&(a=t.info);var i='<svg class="rounded mr-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"><rect width="100%" height="100%" fill="'+a+'"></rect></svg>';e.append(i)}},I=function(t){function n(t){var a,r=t.type,o=t.sender,s=t.text;return e(this,n),void 0===r&&(r="info"),void 0===o&&(o="Pico"),(a=c(this,i(n).call(this))).type=r,a.sender=o,a.text=s,a.show=function(){var e=U("<div>").addClass("toast").attr("role","alert").attr("ria-live","assertive").attr("aria-atomic","true").css({position:"fixed",bottom:"15px",left:"15px","min-width":"300px"}),t=U("<div>").addClass("toast-header"),n=new L(a.type),i=U("<strong>").addClass("mr-auto").text(a.sender),r=U("<small>").text("Just now"),o=U("<butotn>").addClass("ml-2 mb-1 close").attr("data-dismiss","toast").attr("aria-label","Close").html('<span aria-hidden="true">&times;</span>').attr("href","javascript:;");n.attach(t),t.append(i),t.append(r),t.append(o),e.append(t);var c=U("<div>").addClass("toast-body");c.text(s),e.append(c),U("body").append(e),e.toast({delay:6e3}).toast("show")},a}return a(n,t),n}(s),J=function(e){return new I({type:"info",text:e}).show()};J.info=function(e){return new I({type:"info",text:e}).show()},J.warning=function(e){return new I({type:"warning",text:e}).show()},J.error=function(e){return new I({type:"danger",text:e}).show()},J.success=function(e){return new I({type:"success",text:e}).show()};var W=window.$,B=function(t){function n(t,a){var r;e(this,n),(r=c(this,i(n).call(this))).id=a.id,r.name=a.name,r.on("attached",(function(){t.trigger("kanban.attached")})),r.on("cards.create.request",(function(){t.trigger("kanban.cards.create.request")}));var s=W("<h6>").text(a.name),d=W("<div>").addClass("kanban-list-container"),u=W("<div>").addClass("kanban-list-footer");if(a.can_create_cards){var l=W("<button>").addClass("btn btn-outline-primary btn-block mb-3").text("Add card");l.on("click",(function(e){if(e.preventDefault(),!l.attr("disabled")&&a.can_create_cards){var n=new M(o(r));n.on("accepted",(function(e){var n=new S(e);n.on("submitted",(function(e){n.detatch(),r.emit("cards.create.submit",{name:e})})).on("cancelled",(function(){n.detatch()})).on("attached",(function(){t.trigger("readjust")})).on("detatched",(function(){l.removeAttr("disabled"),t.trigger("readjust")})),n.attach(d)})).on("rejected",(function(e){console.warn("Request rejected.",e),l.removeAttr("disabled")})).on("cancelled",(function(){console.warn("Request was not fulfilled in time."),l.removeAttr("disabled")})),l.attr("disabled","disabled"),r.emit("cards.create.request",n)}})),u.append(l)}return t.append(s),t.append(d),t.append(u),r.canSend=function(){return a.can_move_out},r.canReceive=function(){return a.can_move_in},r.addCard=function(e){e.attach(d).data("kanban-card",e)},r.reorder=function(e){r.emit("cards.reorder",e)},r.redraw=function(){var e={},t={};d.find(".kanban-card").each((function(){var n=W(this),a=n.data("kanban-card");e[a.ordering]=n,t[a.ordering]=a,n.remove()}));var n=Object.keys(e);n.sort(),n.forEach((function(n){var a=e[n],i=t[n];a.data("kanban-card",i),d.append(a),i.unfreeze()}))},r}return a(n,t),n}(s),H=function(t){function n(t,a){var r;e(this,n),r=c(this,i(n).call(this));var o=W("<div>").addClass("kanban-column-row"),s={},d={},u=!1;r.on("freeze",(function(){console.debug("Board frozen."),t.find("a[href], button").each((function(){var e=W(this);e.data("frozen")||e.attr("disabled")||(e.attr("disabled","disabled"),e.data("frozen",!0))})),t.addClass("kanban-frozen")})).on("unfreeze",(function(){console.debug("Board unfrozen."),t.find("a[href], button").each((function(){var e=W(this);e.data("frozen")&&(e.removeAttr("disabled"),e.data("frozen",!1))})),t.removeClass("kanban-frozen")})),t.append(o),r.emit("freeze");var l=function(){var e=0;u&&(o.find(".kanban-column").each((function(){var t=W(this).outerHeight(!0);e=Math.max(e,t)})),t.height(e))},f=function(e){var t=e.attributes.column,n=s[t];if(n){var a=W.extend({id:e.id,url:e.links.detail},e.attributes),i=new N(a);i.on("attached",l).on("detatched",l).on("send",(function(e,t){i.freeze(),h.update({type:"cards",id:i.id,attributes:{column:t.id}})})).on("destroy",(function(t){console.debug("Destroying card.",e.id),h.delete({type:"cards",id:e.id}),t()})),n.addCard(i),d[e.id]=i}else console.warn("Could not add card to column",t)},h=new P("ws://".concat(window.location.host,"/ws/kanban/").concat(a,"/")),v=!1;return h.on("connected",(function(){console.debug("Opened a socket to the Kanban board."),h.list({type:"columns"}),v&&(v=!1,J.success("Re-established connection with the server."))})).on("disconnected",(function(){console.warn("Kanban board socket closed unexpectedly."),r.emit("error"),r.emit("freeze"),v=!0,J.error("Lost connection to the server.")})).on("listed",(function(e,t){switch(e){case"columns":return void function(e){u=!1,o.html("").css({width:0}),e.forEach((function(e){var t=W("<div>").addClass("kanban-column"),n=new B(t,W.extend({id:e.id},e.attributes));t.on("readjust",l),n.on("cards.create.request",(function(e){r.emit("cards.create.request",e,n)})).on("cards.create.submit",(function(t){h.create({type:"cards",attributes:W.extend({column:e.id},t)})})).on("cards.reorder",(function(e){var t=[];e.forEach((function(e,n){t.push({type:"cards",id:e,attributes:{ordering:n}})})),h.update_list("cards",t)})),s[e.id]=n,e.cards.forEach(f),t.data("kanban-column",n),o.append(t),n.emit("attached");var a=t.outerWidth(!0);o.width(o.width()+a+15)})),o.find(".kanban-column").on("drop",(function(e,t){var n=t.draggable.data("kanban-card"),a=t.draggable.closest(".kanban-column").data("kanban-column"),i=W(this),r=i.data("kanban-column");return null==n?(console.warning("Lost the card object."),!1):a.canSend(n)?r.canReceive(n)?(i.removeClass("kanban-can-receive").removeClass("kanban-cannot-receive"),void n.move(a,r)):(J.warning("Cards can't be moved to this column."),i.removeClass("kanban-can-receive").removeClass("kanban-cannot-receive"),!1):(i.removeClass("kanban-can-receive").removeClass("kanban-cannot-receive"),J.warning("Cards can't be moved from this column."),!1)})).on("dropover",(function(e,t){var n=t.draggable,a=n.data("kanban-card"),i=n.closest(".kanban-column"),r=i.data("kanban-column"),o=W(this),c=o.data("kanban-column");return!i.is(o)&&(r.canSend(a)&&c.canReceive(a)?void o.addClass("kanban-can-receive").removeClass("kanban-cannot-receive"):(o.removeClass("kanban-can-receive").addClass("kanban-cannot-receive"),!1))})).on("dropout",(function(){W(this).removeClass("kanban-can-receive").removeClass("kanban-cannot-receive")})).droppable(),o.find(".kanban-list-container").on("sortstart",(function(e,t){t.placeholder.height(t.item.height())})).on("sortupdate",(function(){var e=W(this).closest(".kanban-column").data("kanban-column"),t=[];W(this).find(".kanban-card").each((function(){var e=W(this).data("kanban-card");e.freeze(),t.push(e.id)})),e.reorder(t)})).sortable({placeholder:"ui-sortable-placeholder mb-3"}),r.emit("unfreeze"),u=!0,l()}(t);case"cards":return void function(e){var t={};e.forEach((function(e){var n=d[e.id];if(n.update(e.attributes),void 0!==n){var a=e.attributes.column,i=s[a];void 0!==i?t[a]=i:console.warn("Can't find column ".concat(a))}})),Object.values(t).forEach((function(e){e.redraw()}))}(t)}console.warn("Unrecognised content type.",e)})).on("created",(function(e,t){switch(e){case"cards":return void f(t)}console.warn("Unrecognised content type.",e)})).on("updated",(function(e,t){switch(e){case"cards":return void function(e){var t=d[e.id];if(void 0!==t){var n=s[e.attributes.column],a=W.extend({id:e.id,url:e.links.detail},e.attributes);t.update(a),t.detatch(),void 0!==n&&n.addCard(t)}}(t)}console.warn("Unrecognised content type.",e)})).on("deleted",(function(e,t){switch(e){case"cards":return void function(e){var t=d[e];t?t.detatch():console.warn("Could not find card with ID ".concat(e,"."))}(t.id)}console.warn("Unrecognised content type.",e)})),h.connect(),r}return a(n,t),n}(s),K=function(t){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,t),n(r,[{key:"classNames",value:function(){return["projects","board-detail"]}},{key:"ready",value:function(){var e=this.app.$;e(".kanban-board[data-id]").each((function(){var t=e(this),n=new H(t,t.data("id"));n.on("cards.create.request",(function(e){e.accept({placeholder:"Episode title"})})),t.removeAttr("data-id"),t.data("kanban-board",n)}))}}]),r}(A),Z=function(t){function n(t){var a;e(this,n);var r=window.$;return(a=c(this,i(n).call(this))).id=t.id,a.attach=function(e){var n=r("<div>").addClass("checkbox"),i=r("<label>").text(t.name).attr("for","id_".concat(t.id)),c=r("<input>").attr("type","checkbox").attr("id","id_".concat(t.id));c.on("click",(function(e){var t=c.is(":checked");return e.preventDefault(),c.attr("disabled")||a.emit("mark",t),!1})),n.append(c),n.append("&nbsp;"),n.append(i),n.data("task",o(a)),e.append(n),a.on("freeze",(function(){c.attr("disabled","disabled")})).on("unfreeze",(function(){c.removeAttr("disabled")})).on("updated",(function(){t.completed?c.prop("checked","checked").attr("checked","checked"):c.prop("checked",!1).removeAttr("checked")}))},a.update=function(e){t=r.extend({id:t.id},e),a.emit("updated")},a.on("mark",(function(){a.emit("freeze")})),a}return a(n,t),n}(s),F=function(t){function n(t){var a;e(this,n);var r=t.data("id").split("/"),o=r[0],s=r[1],d="ws://".concat(window.location.host,"/ws/projects/").concat(o,"/deliverables/").concat(s,"/tasks/"),u=new P(d),l=window.$,f=t.find(".card-body"),h=!1,v={};return(a=c(this,i(n).call(this))).on("freeze",(function(){f.find(":input").attr("disabled","disabled")})).on("unfreeze",(function(){f.find(":input").each((function(){var e=l(this);e.data("frozen")||e.removeAttr("disabled")}))})),u.on("listed",(function(e,t){"tasks"===e&&(f.html(""),t.forEach((function(e){var t=l.extend({id:e.id},e.attributes),n=new Z(t).on("mark",(function(t){u.update({type:"tasks",id:e.id,attributes:{completed:t}})}));v[e.id]=n,n.attach(f)})))})).on("updated",(function(e,t){if("tasks"===e){var n=v[t.id];if(void 0===n)return void console.warn("Task ".concat(t.id," not found."));n.update(t.attributes),n.emit("unfreeze")}})).on("connected",(function(){u.list({type:"tasks"}),a.emit("unfreeze"),h&&(h=!1,J.success("Re-established connection with the server."))})).on("disconnected",(function(){a.emit("error"),a.emit("freeze"),h=!0,J.error("Lost connection to the server.")})),f.html('<center class="my-5 text-muted">    <i class="fa fa-spin fa-spinner fa-2x fa-fw"></i></center>'),a.emit("freeze"),u.connect(),a}return a(n,t),n}(s),V=function(t){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,t),n(r,[{key:"classNames",value:function(){return["projects","deliverable-detail"]}},{key:"ready",value:function(){var e=window.$;e(".card.tasks[data-id]").each((function(){var t=e(this),n=new F(t);t.data("task-list",n)}))}}]),r}(A);window.Pico=new d({plugins:[g,C,O],views:[T,K,V]})}));
//# sourceMappingURL=pico.js.map