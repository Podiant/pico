!function(e){"function"==typeof define&&define.amd?define(e):e()}((function(){"use strict";function e(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function n(e,n){for(var t=0;t<n.length;t++){var a=n[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}function t(e,t,a){return t&&n(e.prototype,t),a&&n(e,a),e}function a(e,n){if("function"!=typeof n&&null!==n)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(n&&n.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),n&&r(e,n)}function i(e){return(i=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function r(e,n){return(r=Object.setPrototypeOf||function(e,n){return e.__proto__=n,e})(e,n)}function o(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function c(e,n){return!n||"object"!=typeof n&&"function"!=typeof n?o(e):n}var s=function(){function n(){e(this,n),this.__callbacks={}}return t(n,[{key:"on",value:function(e,n){return void 0===this.__callbacks[e]&&(this.__callbacks[e]=[]),this.__callbacks[e].push(n),this}},{key:"off",value:function(e,n){var t=this.__callbacks[e];if(void 0===t)return this;var a=[];if(void 0!==n)for(var i=0;i<t.length;i++)t[i]!==n&&a.push(t[i]);return this.__callbacks[e]=a,this}},{key:"emit",value:function(e){var n=this.__callbacks[e],t=Array.from(arguments).slice(1);if(void 0!==n)for(var a=0;a<n.length;a++)n[a].apply(this,t);return this}}]),n}(),d=function(n){function r(n){var t,a=n.plugins,s=n.views;return e(this,r),(t=c(this,i(r).call(this))).__plugins=[],t.__views=[],Array.isArray(a)&&a.forEach((function(e){var n=new e(o(t));t.__plugins.push(n)})),Array.isArray(s)&&s.forEach((function(e){var n=new e(o(t));t.__views.push(n)})),t.$=window.$,t.$(document).ready((function(){t.ready()})),t}return a(r,n),t(r,[{key:"ready",value:function(){var e=this.$("body");this.__views.forEach((function(n){var t=n.classNames(),a=!1;t.forEach((function(n){a||e.hasClass(n)||(a=!0)})),a||n.ready()})),this.emit("ready")}}]),r}(s),u=function(n){function r(n){var t;return e(this,r),(t=c(this,i(r).call(this))).app=n,n.on("ready",t.ready),t}return a(r,n),t(r,[{key:"ready",value:function(){}}]),r}(s),l=function(n){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,n),t(r,[{key:"check",value:function(e){var n=this;return new Promise((function(t,a){n.emit("validating"),n.validate(e).then((function(e){n.emit("valid"),t(e)})).catch((function(e){n.emit("invalid",e),a(e)}))}))}},{key:"validate",value:function(){throw new Error("Method not implemented")}}]),r}(s),f=/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,h=function(n){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,n),t(r,[{key:"validate",value:function(e){return new Promise((function(n,t){var a=String(e).toLowerCase();f.test(a)?n(a):t(new Error("This doesn't look like an email address."))}))}}]),r}(l),v=function(n){function r(n){var t;return e(this,r),(t=c(this,i(r).call(this))).basis=n,t}return a(r,n),t(r,[{key:"validate",value:function(e){var n=this;return new Promise((function(t,a){var i=new WebSocket("ws://".concat(window.location.host,"/ws/unique/").concat(n.basis,"/")),r=!1,o=!1;i.onclose=function(){o||r||a(new Error("An error occurred while communicating with the server."))},i.onmessage=function(n){var c=JSON.parse(n.data);c.valid?o||r||(r=!0,i.close(),t(e)):o||r||(o=!0,i.close(),a(new Error(c.error)))},i.onopen=function(){i.send(e)}}))}}]),r}(l),p=function(n){function r(n){var t;return e(this,r),(t=c(this,i(r).call(this))).checkAgainst=n,t}return a(r,n),t(r,[{key:"validate",value:function(e){var n=this;return new Promise((function(t,a){e!==n.checkAgainst?a(new Error("This value doesn't match the previous one.")):t(e)}))}}]),r}(l),w=function(n){function r(n){var t;return e(this,r),(t=c(this,i(r).call(this))).basis=n,t}return a(r,n),t(r,[{key:"validate",value:function(e){var n=this;return new Promise((function(t,a){var i=new WebSocket("ws://".concat(window.location.host,"/ws/validate/").concat(n.basis,"/")),r=!1,o=!1;i.onclose=function(){o||r||a(new Error("An error occurred while communicating with the server."))},i.onmessage=function(n){var c=JSON.parse(n.data);c.valid?o||r||(r=!0,i.close(),t(e)):o||r||(o=!0,i.close(),a(new Error(c.error)))},i.onopen=function(){i.send(e)}}))}}]),r}(l),m=function(n){function t(n,a){var r;e(this,t),r=c(this,i(t).call(this));r.show=function(e){return new Promise((function(n){a.hasClass("active")&&(r.emit("shown"),n()),r.emit("showing"),e?a.addClass("showing-"+e):a.addClass("showing"),setTimeout((function(){e?a.removeClass("showing-"+e):a.removeClass("showing"),r.emit("shown"),n()}),333)}))},r.hide=function(e){return new Promise((function(n){r.emit("hiding"),e?a.addClass("hiding-"+e):a.addClass("hiding"),setTimeout((function(){e?a.removeClass("hiding-"+e):a.removeClass("hiding"),r.emit("hidden"),n()}),333)}))},r.on("showing",(function(){a.addClass("active"),a.trigger("wizard.showing")})),r.on("hidden",(function(){a.removeClass("active"),a.trigger("wizard.hidden")})),r.on("shown",(function(){a.find(":input").first().focus(),a.trigger("wizard.shown")})),r.on("validation",(function(e){if(void 0===e)return a.find(":input.is-invalid").removeClass("is-invalid"),void a.find(".invalid-feedback").remove();var n=window.$(e.field),t=n.closest(".form-group"),i=t.find(".invalid-feedback");n.addClass("is-invalid"),i.length||(i=window.$("<div>").addClass("invalid-feedback")).appendTo(t),i.text(e.message),n.focus()})),r.prev=function(){r.hide("rw").then((function(){r.emit("moving.prev"),r.emit("prev")}))},r.next=function(){var e,n,t;e=a.find('button, input[type="button"]').attr("disabled","disabled"),n=a.find(":input").not(e).not("[disabled]"),t=function(){e.removeAttr("disabled"),n.removeAttr("disabled")},n.attr("disabled","disabled"),r.on("moving.next",t),r.on("validation",(function(e){e&&t()})),r.emit("validation"),r.validate().then((function(){r.emit("moving.next"),r.hide("ff").then((function(){r.emit("next")}))})).catch((function(e){r.emit("validation",e)}))},r.validate=function(){return new Promise((function(e,n){var t=!1,i=[],r=a.closest("form");a.find(":input").each((function(){if(t)return!1;var e=window.$(this),a=e.val(),o=e.attr("required"),c=e.attr("type")||"text",s=e.attr("data-unique"),d=e.attr("data-validator"),u=e.attr("data-pair");if(o&&!a.trim())return t=!0,n({field:e,message:"This field is required."}),!1;switch(c){case"email":i.push([new h,e])}s&&i.push([new v(s),e]),d&&i.push([new w(d),e]),u&&i.push([new p(r.find(':input[name="'.concat(u,'"]')).val()),e])}));i.length?function a(){var r=i.shift(),o=r[0],c=r[1],s=c.val().trim();o.check(s).then((function(){i.length?a():t||e()})).catch((function(e){t||(t=!0,n({field:c,message:e.message}))}))}():t||e()}))};var s=o(r);return a.on("click",'[data-action="prev"]',(function(){s.prev()})),a.on("click","[data-skip]",(function(){var e=parseInt(window.$(this).data("skip"));s.hide("ff"),s.emit("skip",e)})),a.on("click",'[data-action="next"]',(function(){s.next()})),a.on("keydown",":input",(function(e){13===e.keyCode&&(e.preventDefault(),s.next())})),r}return a(t,n),t}(s),b=function(n){function t(n){var a;e(this,t);var r=o(a=c(this,i(t).call(this))),s=[];return n.find(".step").each((function(){var e=window.$(this),n=new m(r,e);e.data("wizard-step",n),s.push(n)})),s.forEach((function(e,n){n>0&&e.on("moving.prev",(function(){s[n-1].show("rw")})),n<s.length-1?e.on("moving.next",(function(){s[n+1].show("ff")})):e.on("next",(function(){a.submit()})),e.on("skip",(function(e){s[e].show("ff")}))})),a.show=function(e){void 0===e&&(e=0),n.find(".step").each((function(n){if(window.$(this).find(".form-group.is-invalid").length)return e=n,!1})),s[e].show()},a.submit=function(){n.closest("form").submit()},a}return a(t,n),t}(s),g=function(n){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,n),t(r,[{key:"ready",value:function(){var e=this.$;e(".wizard").each((function(){new b(e(this)).show()}))}}]),r}(u),y=function(n){function t(n){var a;e(this,t),a=c(this,i(t).call(this));var r=n.find('input[type="file"]'),s=r.attr("accept"),d=o(a),u=function(e){if(s){var n=new RegExp("^"+s.replace("/","\\/").replace("*",".*"));if(!e.type.match(n))return!1}return!0};return n.on("dragenter",(function(e){e.preventDefault(),n.addClass("active"),a.emit("drag.enter")})).on("dragleave",(function(e){e.preventDefault(),n.removeClass("active"),a.emit("drag.exit")})).on("dragover",(function(e){e.preventDefault(),n.addClass("active"),a.emit("drag.over")})).on("drop",(function(e){if(e.preventDefault(),1===e.originalEvent.dataTransfer.files.length){var n=0;for(n=0;n<e.originalEvent.dataTransfer.files.length;n++)if(!u(e.originalEvent.dataTransfer.files[n]))return void a.emit("error",new Error("The dragged file was not of the correct type."));e.originalEvent.dataTransfer.files&&(r.get(0).files=e.originalEvent.dataTransfer.files,r.trigger("change"))}})).on("click",(function(e){e.target!==r.get(0)&&(e.preventDefault(),r.get(0).click())})),r.on("change",(function(){var e=0;for(e=0;e<this.files.length;e++)d.emit("file",this.files[e])})),a}return a(t,n),t}(s),k=function(n){function t(n){var a;return e(this,t),(a=c(this,i(t).call(this,n))).on("error",(function(){alert("Only images are supported here.")})),a.on("file",(function(e){var t=new FileReader;t.onload=function(e){n.css("background-image","url(".concat(e.target.result,")"))},t.readAsDataURL(e)})),a}return a(t,n),t}(y),C=function(n){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,n),t(r,[{key:"ready",value:function(){var e=this.$;e(".dropzone").each((function(){var n=e(this);n.hasClass("dropzone-image")?new k(n):new y(n)}))}}]),r}(u),E=function(e,n){void 0===n&&(n=333);var t=null,a=[],i=function(){e.apply(e,a),t=null};return function(){for(var e=arguments.length,r=new Array(e),o=0;o<e;o++)r[o]=arguments[o];a=r,null===t&&(t=setTimeout(i,n))}},x=function(n){function t(n){var a;return e(this,t),(a=c(this,i(t).call(this))).data=n,a.attach=function(e){var t=window.$("<a>").addClass("typeahead-item").addClass("list-group-item").attr("href","javascript:;");if(n.thumbnail){var i=window.$("<div>").addClass("d-flex w-100"),r=window.$("<img>").attr("src",n.thumbnail).attr("height","30").addClass("mr-3"),o=window.$("<span>").text(n.label);r.appendTo(i),o.appendTo(i),i.appendTo(t)}else t.text(n.label);t.on("click",(function(){a.select()})),t.appendTo(e),a.focus=function(){t.addClass("active").addClass("list-item-active"),a.emit("focused")},a.blur=function(){t.removeClass("active").removeClass("list-item-active"),a.emit("blurred")},a.select=function(){t.addClass("active").addClass("list-item-active"),a.emit("selected")}},a.focus=function(){throw new Error("List item not attached to container DOM element.")},a.blur=function(){throw new Error("List item not attached to container DOM element.")},a}return a(t,n),t}(s),$=function(n){function t(n){var a;return e(this,t),(a=c(this,i(t).call(this))).attach=function(e){var t=window.$("<div>").addClass("typeahead-container").addClass("list-group"),i=e.offset(),r=null,o=[];n.forEach((function(e,n){var i=new x(e);i.index=n,i.on("focused",(function(){r!==i&&(null!==r&&r.blur(),r=i)})),i.on("selected",(function(){a.emit("selected",i)})),o.push(i),i.attach(t)})),t.css({position:"absolute",top:i.top+e.outerHeight(!0),left:i.left,width:e.outerWidth(!0)}),window.$("body").append(t),a.detatch=function(){t.remove()},a.moveUp=function(){var e=null;null!==r&&(e=r.index),e=null===e?n.length-1:Math.max(0,e-1),a.focus(e)},a.moveDown=function(){var e=null;null!==r&&(e=r.index),e=null===e?0:Math.min(n.length-1,e+1),a.focus(e)},a.focus=function(e){if(void 0===e)throw new Error("Expected index of item to select.");void 0!==o[e]?o[e].focus():(null!==r&&r.blur(),r=null)},a.select=function(){null!==r&&r.select()}},a.detatch=function(){throw new Error("List has not been attached to a DOM element.")},a}return a(t,n),t}(s),_=function(n){function t(n,a,r){var o;e(this,t),o=c(this,i(t).call(this));var s=n.attr("name"),d=window.$("<input>").attr("name",s).attr("type","hidden");n.removeAttr("name"),n.after(d);var u=new E((function(e){var t=a.replace("%s",encodeURIComponent(e));window.$.getJSON(t,(function(e){var t=r(e),a=new $(t);n.data("typeahed-list")&&n.data("typeahed-list").detatch(),o.on("move.up",(function(){a.moveUp()})),o.on("move.down",(function(){a.moveDown()})),o.on("select",(function(){a.select()})),a.on("selected",(function(e){d.val(e.data.id),n.val(e.data.label),a.detatch(),n.focus()})),a.attach(n),n.data("typeahed-list",a)}))}),900);return n.on("input",(function(){return u(n.val())})),n.on("keydown",(function(e){switch(e.keyCode){case 40:e.preventDefault(),o.emit("move.down");break;case 38:e.preventDefault(),o.emit("move.up");break;case 13:d.val()||(e.preventDefault(),e.stopPropagation(),o.emit("select"))}})),o}return a(t,n),t}(s),z=function(e){var n=e.indexOf(".$."),t=e.substr(0,n),a=e.substr(n+3);return function(e,n){var i=n[t][e];if(void 0===i)throw new Error("Index out of range.");return i[a]}},D=function(e){var n=e.indexOf(".$."),t=e.substr(0,n);return function(e){var n=e[t];if(Array.isArray(n))return n.length;throw new Error("Value is not an array.")}},O=function n(t){e(this,n),this.transform=function(e){var n=t.id,a=t.label,i=t.thumbnail,r=n?new z(n):null,o=a?new z(a):null,c=i?new z(i):null,s=new D(n),d=0;if(!r)throw new Error("No template provided for returning an object ID.");if(!o)throw new Error("No template provided for returning an object label.");try{d=s(e)}catch(e){throw new Error("Invalid data returned.")}var u,l,f=0,h=[];for(f=0;f<d;f++)h.push((u=f,l=void 0,(l={}).id=r(u,e),l.label=o(u,e),c&&(l.thumbnail=c(u,e)),l));return h}},j=function(n){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,n),t(r,[{key:"ready",value:function(){var e=this.$;e("input[data-typeahead-url]").each((function(){var n=e(this),t=n.data("typeahead-url"),a=new O(n.data("typeahead-transform")),i=new _(n,t,a.transform);n.removeAttr("data-typeahead-url"),n.removeAttr("data-typeahead-transform"),n.data("typeahead",i)}))}}]),r}(u),A=function(n){function r(n){var t;return e(this,r),(t=c(this,i(r).call(this))).app=n,t}return a(r,n),t(r,[{key:"classNames",value:function(){return[]}}]),t(r,[{key:"ready",value:function(){}}]),r}(s),T=function(n){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,n),t(r,[{key:"classNames",value:function(){return["projects","create-project"]}},{key:"ready",value:function(){var e=this.app.$,n=e('input[name="name"]'),t=e("#id_apple_podcasts_id");t.closest(".step").on("wizard.shown",(function(){t.val()&&t.trigger("input")})),n.on("change",(function(){t.val(n.val())}))}}]),r}(A),P=function(n){function t(n,a){var r;e(this,t);var o=null,s=null,d=!1;(r=c(this,i(t).call(this))).connect=function(){o=new WebSocket(n);var e=function(e,n,t){var a={meta:window.$.extend({method:e},t),data:n},i=JSON.stringify(a);o.send(i)};r.create=function(n){return e("create",n)},r.update=function(n){return e("update",n)},r.update_list=function(n,t){return e("update_list",t,{type:n})},r.delete=function(n){return e("delete",n)},r.list=function(n){return e("list",n)},o.onclose=function(){o=null,u(),d&&(d=!1,r.emit("disconnected")),s=setTimeout((function(){a*=2,r.connect()}),a),console.warn("Waiting ".concat(a/1e3," second(s) for connection to be restored."))},o.onmessage=function(e){var n=JSON.parse(e.data);if(n.error)console.warn(n.error);else if(n.meta){switch(n.meta.method){case"list":return void r.emit("listed",n.meta.type,n.data);case"create":return void r.emit("created",n.meta.type,n.data);case"update":return void r.emit("updated",n.meta.type,n.data);case"update_list":return void r.emit("listed",n.meta.type,n.data);case"delete":return void r.emit("deleted",n.meta.type,n.data)}console.warn("Unrecognised response.",n.meta)}else console.warn("Missing response metadata.")},o.onopen=function(){null!==s&&(clearTimeout(s),s=null),d||(d=!0,r.emit("connected"))}};var u=function(){void 0===a&&(a=1e3),r.create=function(){throw new Error("Database not connected.")},r.update=function(){throw new Error("Database not connected.")},r.update_list=function(){throw new Error("Database not connected.")},r.delete=function(){throw new Error("Database not connected.")},r.list=function(){throw new Error("Database not connected.")},r.send=function(){throw new Error("Database not connected.")}};return u(),r}return a(t,n),t}(s),q=window.$,R=function n(t){e(this,n),this.attach=function(e){var n={info:"#17a2b8",warning:"#ffc107",danger:"#dc3545",success:"#28a745"},a=n[t];void 0===a&&(a=n.info);var i='<svg class="rounded mr-2" width="20" height="20" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" focusable="false" role="img"><rect width="100%" height="100%" fill="'+a+'"></rect></svg>';e.append(i)}},M=function(n){function t(n){var a,r=n.type,o=n.sender,s=n.text;return e(this,t),void 0===r&&(r="info"),void 0===o&&(o="Pico"),(a=c(this,i(t).call(this))).type=r,a.sender=o,a.text=s,a.show=function(){var e=q("<div>").addClass("toast").attr("role","alert").attr("ria-live","assertive").attr("aria-atomic","true").css({position:"fixed",bottom:"15px",left:"15px","min-width":"300px"}),n=q("<div>").addClass("toast-header"),t=new R(a.type),i=q("<strong>").addClass("mr-auto").text(a.sender),r=q("<small>").text("Just now"),o=q("<butotn>").addClass("ml-2 mb-1 close").attr("data-dismiss","toast").attr("aria-label","Close").html('<span aria-hidden="true">&times;</span>').attr("href","javascript:;");t.attach(n),n.append(i),n.append(r),n.append(o),e.append(n);var c=q("<div>").addClass("toast-body");c.text(s),e.append(c),q("body").append(e),e.toast({delay:6e3}).toast("show")},a}return a(t,n),t}(s),S=function(n){function r(n){var t;e(this,r),(t=c(this,i(r).call(this))).accepted=!1,t.rejected=!1,t.cancelled=!1,console.debug("Requesting to add a card in",n.name);var a=setTimeout((function(){t.cancel()}),1e4);return t.on("accepted",(function(){clearTimeout(a)})),t.on("rejected",(function(){clearTimeout(a)})),t}return a(r,n),t(r,[{key:"accept",value:function(e){if(this.accepted||this.rejected||this.cancelled)throw new Error("Request is in an invalid state.");this.accepted=!0,this.emit("accepted",e)}},{key:"reject",value:function(){if(this.accepted||this.rejected||this.cancelled)throw new Error("Request is in an invalid state.");this.rejected=!0,this.emit("rejected")}},{key:"cancel",value:function(){if(this.accepted||this.rejected||this.cancelled)throw new Error("Request is in an invalid state.");this.cancelled=!0,this.emit("cancelled")}}]),r}(s),N=function(n){function t(){var n;return e(this,t),(n=c(this,i(t).call(this))).actions={},n.attach=function(e){var t=window.$("<div>").addClass("kanban-card card mb-3"),a=window.$("<div>").addClass("card-body");if(t.append(a),e.append(t),n.populate(a),Object.keys(n.actions).length){var i=window.$("<div>").addClass("card-footer text-right");Object.keys(n.actions).forEach((function(e){var t=n.actions[e],a=window.$("<a>").attr("href","javascript:;"),r=window.$("<i>").addClass("fa fa-".concat(t.icon||e));a.on("click",(function(n){n.preventDefault(),t.perform().then((function(n){console.debug("Performed",e,n)})).catch((function(n){console.warn("Error performing",e,n)}))})),a.addClass("text-muted"),a.append(r),i.append(a)})),t.append(i)}return n.detatch=function(){t.remove(),n.detatch=function(){throw new Error("Card has not been attached to a DOM element.")},n.freeze=function(){throw new Error("Card has not been attached to a DOM element.")},n.unfreeze=function(){throw new Error("Card has not been attached to a DOM element.")},n.emit("detatched")},n.freeze=function(){t.addClass("kanban-frozen")},n.unfreeze=function(){t.removeClass("kanban-frozen")},t},n.populate=function(){},n.cancel=function(){n.emit("cancelled")},n.submit=function(e){n.emit("submitted",e)},n.detatch=function(){throw new Error("Card has not been attached to a DOM element.")},n.freeze=function(){throw new Error("Card has not been attached to a DOM element.")},n.unfreeze=function(){throw new Error("Card has not been attached to a DOM element.")},n}return a(t,n),t}(s),U=function(n){function t(n){var a;return e(this,t),(a=c(this,i(t).call(this,n))).populate=function(e){var t=window.$("<input>").attr("type","text").addClass("form-control");n.placeholder&&t.attr("placeholder",n.placeholder),t.on("keyup",(function(e){switch(e.keyCode){case 27:a.cancel();break;case 13:e.preventDefault(),a.submit(t.val())}})),e.append(t),t.focus()},a}return a(t,n),t}(N),L=function(n){function t(n){var a;return e(this,t),(a=c(this,i(t).call(this,n))).id=n.id,a.ordering=n.ordering,a.actions={delete:{icon:"trash",title:"Delete card",perform:function(){return new Promise((function(e,n){confirm("Are you sure?")?a.destroy().then((function(){e(!0)})).catch((function(e){n(e)})):e(!1)}))}}},a.populate=function(e){var t=window.$("<a>").attr("href",n.url).text(n.name);e.append(t)},a.destroy=function(){return new Promise((function(e){a.emit("destroy",e)}))},a.move=function(e,n){a.freeze(),a.emit("send",e,n)},a.update=function(e){n=e,a.ordering=e.ordering,a.name=e.name},a}return a(t,n),t}(N),I=function(n){function t(n,a){var r;e(this,t),(r=c(this,i(t).call(this))).id=a.id,r.name=a.name,r.on("attached",(function(){n.trigger("kanban.attached")})),r.on("cards.create.request",(function(){n.trigger("kanban.cards.create.request")}));var s=window.$("<h6>").text(a.name),d=window.$("<div>").addClass("kanban-list-container"),u=window.$("<div>").addClass("kanban-list-footer");if(a.can_create_cards){var l=window.$("<button>").addClass("btn btn-outline-primary btn-block mb-3").text("Add card");l.on("click",(function(e){if(e.preventDefault(),!l.attr("disabled")&&a.can_create_cards){var n=new S(o(r));n.on("accepted",(function(e){var n=new U(e);n.on("submitted",(function(e){n.detatch(),r.emit("cards.create.submit",{name:e})})).on("cancelled",(function(){n.detatch()})).on("detatched",(function(){l.removeAttr("disabled")})),n.attach(d)})).on("rejected",(function(e){console.warn("Request rejected.",e),l.removeAttr("disabled")})).on("cancelled",(function(){console.warn("Request was not fulfilled in time."),l.removeAttr("disabled")})),l.attr("disabled","disabled"),r.emit("cards.create.request",n)}})),u.append(l)}return n.append(s),n.append(d),n.append(u),r.canSend=function(){return a.can_move_out},r.canReceive=function(){return a.can_move_in},r.addCard=function(e){e.attach(d).data("kanban-card",e)},r.reorder=function(e){r.emit("cards.reorder",e)},r.redraw=function(){var e={},n={};d.find(".kanban-card").each((function(){var t=window.$(this),a=t.data("kanban-card");e[a.ordering]=t,n[a.ordering]=a,t.remove()}));var t=Object.keys(e);t.sort(),t.forEach((function(t){var a=e[t],i=n[t];a.data("kanban-card",i),d.append(a),i.unfreeze()}))},r}return a(t,n),t}(s),J=function(n){function t(n,a){var r;e(this,t),r=c(this,i(t).call(this));var o=window.$("<div>").addClass("kanban-column-row"),s={},d={};r.on("freeze",(function(){console.debug("Board frozen."),n.find("a[href], button").each((function(){var e=window.$(this);e.data("frozen")||e.attr("disabled")||(e.attr("disabled","disabled"),e.data("frozen",!0))})),n.addClass("kanban-frozen")})).on("unfreeze",(function(){console.debug("Board unfrozen."),n.find("a[href], button").each((function(){var e=window.$(this);e.data("frozen")&&(e.removeAttr("disabled"),e.data("frozen",!1))})),n.removeClass("kanban-frozen")})),n.append(o),r.emit("freeze");var u=function(e){var n=e.attributes.column,t=s[n];if(t){var a=window.$.extend({id:e.id,url:e.links.detail},e.attributes),i=new L(a);i.on("send",(function(e,n){i.freeze(),l.update({type:"cards",id:i.id,attributes:{column:n.id}})})).on("destroy",(function(n){console.debug("Destroying card.",e.id),l.delete({type:"cards",id:e.id}),n()})),t.addCard(i),d[e.id]=i}else console.warn("Could not add card to column",n)},l=new P("ws://".concat(window.location.host,"/ws/kanban/").concat(a,"/")),f=function(e){return new M({type:"info",text:e}).show()};f.info=function(e){return new M({type:"info",text:e}).show()},f.warning=function(e){return new M({type:"warning",text:e}).show()},f.error=function(e){return new M({type:"danger",text:e}).show()},f.success=function(e){return new M({type:"success",text:e}).show()};var h=!1;return l.on("connected",(function(){console.debug("Opened a socket to the Kanban board."),l.list({type:"columns"}),h&&(h=!1,f.success("Re-established connection with the server."))})).on("disconnected",(function(){console.warn("Kanban board socket closed unexpectedly."),r.emit("error"),r.emit("freeze"),h=!0,f.error("Lost connection to the server.")})).on("listed",(function(e,n){switch(e){case"columns":return void function(e){console.debug(e),o.html("").css({width:0}),e.forEach((function(e){var n=window.$("<div>").addClass("kanban-column"),t=new I(n,window.$.extend({id:e.id},e.attributes));t.on("cards.create.request",(function(e){r.emit("cards.create.request",e,t)})).on("cards.create.submit",(function(n){l.create({type:"cards",attributes:window.$.extend({column:e.id},n)})})).on("cards.reorder",(function(e){var n=[];e.forEach((function(e,t){n.push({type:"cards",id:e,attributes:{ordering:t}})})),l.update_list("cards",n)})),s[e.id]=t,e.cards.forEach(u),n.data("kanban-column",t),o.append(n),t.emit("attached");var a=n.outerWidth(!0);o.width(o.width()+a+15)})),o.find(".kanban-column").on("drop",(function(e,n){var t=n.draggable.data("kanban-card"),a=n.draggable.closest(".kanban-column").data("kanban-column"),i=window.$(this),r=i.data("kanban-column");return null==t?(console.warning("Lost the card object."),!1):a.canSend(t)?r.canReceive(t)?(i.removeClass("kanban-can-receive").removeClass("kanban-cannot-receive"),void t.move(a,r)):(f.warning("Cards can't be moved to this column."),i.removeClass("kanban-can-receive").removeClass("kanban-cannot-receive"),!1):(i.removeClass("kanban-can-receive").removeClass("kanban-cannot-receive"),f.warning("Cards can't be moved from this column."),!1)})).on("dropover",(function(e,n){var t=n.draggable,a=t.data("kanban-card"),i=t.closest(".kanban-column"),r=i.data("kanban-column"),o=window.$(this),c=o.data("kanban-column");return!i.is(o)&&(r.canSend(a)&&c.canReceive(a)?void o.addClass("kanban-can-receive").removeClass("kanban-cannot-receive"):(o.removeClass("kanban-can-receive").addClass("kanban-cannot-receive"),!1))})).on("dropout",(function(){window.$(this).removeClass("kanban-can-receive").removeClass("kanban-cannot-receive")})).droppable(),o.find(".kanban-list-container").on("sortstart",(function(e,n){n.placeholder.height(n.item.height())})).on("sortupdate",(function(){var e=window.$(this).closest(".kanban-column").data("kanban-column"),n=[];window.$(this).find(".kanban-card").each((function(){var e=window.$(this).data("kanban-card");e.freeze(),n.push(e.id)})),e.reorder(n)})).sortable({placeholder:"ui-sortable-placeholder mb-3"}),r.emit("unfreeze")}(n);case"cards":return void function(e){var n={};e.forEach((function(e){var t=d[e.id];if(t.update(e.attributes),void 0!==t){var a=e.attributes.column,i=s[a];void 0!==i?n[a]=i:console.warn("Can't find column ".concat(a))}})),Object.values(n).forEach((function(e){e.redraw()}))}(n)}console.warn("Unrecognised content type.",e)})).on("created",(function(e,n){switch(e){case"cards":return void u(n)}console.warn("Unrecognised content type.",e)})).on("updated",(function(e,n){switch(e){case"cards":return void function(e){var n=d[e.id];if(void 0!==n){var t=s[e.attributes.column];n.update(e.attributes),n.detatch(),void 0!==t&&t.addCard(n)}}(n)}console.warn("Unrecognised content type.",e)})).on("deleted",(function(e,n){switch(e){case"cards":return void function(e){var n=d[e];n?n.detatch():console.warn("Could not find card with ID ".concat(e,"."))}(n.id)}console.warn("Unrecognised content type.",e)})),l.connect(),r}return a(t,n),t}(s),W=function(n){function r(){return e(this,r),c(this,i(r).apply(this,arguments))}return a(r,n),t(r,[{key:"classNames",value:function(){return["projects","board-detail"]}},{key:"ready",value:function(){var e=this.app.$;e(".kanban-board[data-id]").each((function(){var n=e(this),t=new J(n,n.data("id"));t.on("cards.create.request",(function(e){e.accept({placeholder:"Episode title"})})),n.removeAttr("data-id"),n.data("kanban-board",t)}))}}]),r}(A);window.Pico=new d({plugins:[g,C,j],views:[T,W]})}));
//# sourceMappingURL=pico.js.map