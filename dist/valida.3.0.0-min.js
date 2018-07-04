/*!
 * Valida
 *
 * @copyright © 2011-2018, Rogerio Taques
 * @author Rogerio Taques (rogerio.taques@gmail.com)
 * @version 3.0.0
 * @license http://www.opensource.org/licenses/mit-license.php
 * @see https://github.com/rogeriotaques/valida
 * @cat Plugins/Form Validation
 */
!function(){const t={debug:!1,novalidate:!0,autocomplete:"off",tag:"span",highlightMarker:"( Optional )",highlightPosition:"post",highlightOptional:!0,triggerOnBlur:!0,triggerOnTyping:!0,i18n:{submit:"Wait ...",required:"Required",invalid:"Seems to be invalid",maxlength:'<span class="at-counter">{0}</span> out of {1}.'},beforeValidation:null,afterValidation:null},a={email:/^[\w!#$%&'*+\/=?^`{|}~-]+(\.[\w!#$%&'*+\/=?^`{|}~-]+)*@(([\w-]+\.)+[A-Za-z]{2,}|\[\d{1,3}(\.\d{1,3}){3}\])$/,url:/^(http[s]?:\/\/|ftp:\/\/)?(www\.)?(([\w-]+\.)+[A-Za-z]{2,}|\[\d{1,3}(\.\d{1,3}){3}\])$/,number:/^([0-9])+$/,decimal:/^([0-9]{0,3}(,|.){0,1}){0,2}[0-9]{1,3}(,[0-9]{2}|.[0-9]{2}){0,1}$/,date_br:/^([0-9]|[0,1,2][0-9]|3[0,1])\/(0[1-9]|1[0,1,2])\/\d{4}$/,date:/^\d{4}-(0[0-9]|1[0,1,2])-([0,1,2][0-9]|3[0,1])$/,time:/^([0-1][0-9]|[2][0-3])(:([0-5][0-9])){1,2}$/,phone_br:/^\(?\d{2}\)?[\s-]?([9]){0,1}\d{4}-?\d{4}$/,phone_jp:/^(((\(0\d{1}\)[\s-]?|0\d{1}-?)[2-9]\d{3}|(\(0\d{2}\)[\s-]?|0\d{2}-?)[2-9]\d{2,3}|(\(0\d{3}\)[\s-]?|0\d{3}-?)[2-9]\d{1}|(\(0\d{4}\)[\s-]?|0\d{4}-?)[2-9])-?\d{4}|(\(0\d{3}\)[\s-]?|0\d{3}-?)[2-9]\d{2}-?\d{3})$/,zipcode_us:/^([A-Z][0-9]){3}$/,zipcode_br:/^[0-9]{2}.{0,1}[0-9]{3}-[0-9]{3}$/,zipcode_jp:/^[0-9]{3}-?[0-9]{4}$/,valid_ip:/^\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b$/,min_length:(t,a)=>t.length>=parseInt(a,10),max_length:(t,a)=>t.length<=parseInt(a,10),matches:(t,a)=>{return t===($(`#${a}`).val()||a)},greater_than:(t,e)=>!(!a.decimal.test(t)||!a.decimal.test(e))&&parseFloat(t)>parseFloat(e),less_than:(t,e)=>!(!a.decimal.test(t)||!a.decimal.test(e))&&parseFloat(t)<parseFloat(e),cpf:t=>{if(!/^\d{3}.?\d{3}.?\d{3}-?\d{2}$/.test(t))return!1;let a,e,i=t.replace(/[^0-9]/g,""),r=!0;for(a=0;a<i.length-1;a+=1)if(i.charAt(a)!==i.charAt(a+1)){r=!1;break}if(r)return!1;const n=i.substr(9,2);for(i=i.substr(0,9),e=0,a=0;a<9;a+=1)e+=i.charAt(a)*(10-a);if(0===e)return!1;if((e=11-e%11)>9&&(e=0),parseInt(n.charAt(0),10)!==parseInt(e,10))return!1;for(e*=2,a=0;a<9;a+=1)e+=i.charAt(a)*(11-a);return(e=11-e%11)>9&&(e=0),parseInt(n.charAt(1),10)===parseInt(e,10)},cnpj:t=>{if(!/^\d{1,2}.?\d{3}.?\d{3}\/?\d{4}-?\d{2}$/.test(t))return!1;let a,e,i,r,n,l,o,d,s;for(e=t.replace(/[^0-9]/g,""),s=!0,a=0;a<e.length-1;a+=1)if(e.charAt(a)!==e.charAt(a+1)){s=!1;break}if(s)return!1;for(d=e,o=e.length-2,i=e.substr(o,2),e=e.substr(0,o),r=0,l=o-7,a=o;a>=1;a-=1)r+=e.charAt(o-a)*l--,l<2&&(l=9);if((n=r%11<2?0:11-r%11).toString()!==i.charAt(0))return!1;for(o+=1,e=d.substr(0,o),r=0,l=o-7,a=o;a>=1;a-=1)r+=e.charAt(o-a)*l--,l<2&&(l=9);return(n=r%11<2?0:11-r%11).toString()===i.charAt(1)}},e={date:"XXXX-XX-XX",postalcode:"XXX-XXXX",cpf:"XXX.XXX.XXX-XX",cnpj:"XX.XXX.XXX/XXXX-XX"},i={init:function(i={}){let r;const n=$.extend({},t,i),l=[".at-required",".at-invalid",".at-valid",".has-warning",".has-feedback"],o=[".at-error",".at-warning",".at-info"],d=t=>{const a=$(t.currentTarget),i=e[a.attr("data-mask")||a.attr("mask")]||a.attr("data-mask")||a.attr("mask")||"",r=a.val().replace(/[^a-zA-Z0-9]/g,"");let n="";for(let t=0,a=0;t<i.length&&a<r.length;t+=1)n+="X"===i.charAt(t)?r.charAt(a++):i.charAt(t);return a.val(n),n},s=function(t){t.find(o.join(",")).remove(),t.find(l.join(",")).removeClass(l.map(t=>t.replace(/^./,"")).join(" ")),n.debug&&console.log("[Valida] All errors cleared.")},c=function(t){t.removeClass(l.map(t=>t.replace(/^./,"")).join(" ")),t.prev(o.join(",")).remove(),t.next(o.join(",")).remove(),"checkbox"===t.attr("type")&&t.next("label").next(o.join(",")).remove()},f=function(t){const a=t.attr("data-invalid")||(n.i18n.invalid?n.i18n.invalid:"Invalid format"),e=t.attr("data-placement")||"after",i=n.tag&&"string"!=typeof n.tag?n.tag:$(`<${n.tag?n.tag:"span"} />`,{class:"at-error",html:a});c(t),t.addClass("at-invalid").closest(".form-group").addClass("has-warning has-feedback"),"checkbox"!==t.attr("type")?"before"===e?t.before(i):t.after(i):t.parent("label").after(i),n.debug&&console.log("[Valida] ",`#${r.attr("id")}#${t.attr("id")}`,"is invalid")},u=function(t){const a=t.attr("data-required")||(n.i18n.required?n.i18n.required:"Required"),e=t.attr("data-placement")||"after",i=n.tag&&"string"!=typeof n.tag?n.tag:$(`<${n.tag?n.tag:"span"} />`,{class:"at-error",html:a});c(t),t.addClass("at-required").closest(".form-group").addClass("has-error has-feedback"),"checkbox"!==t.attr("type")?"before"===e?t.before(i):t.after(i):t.next("label").after(i),n.debug&&console.log("[Valida] ",`#${r.attr("id")}#${t.attr("id")}`,"is mandatory")},p=function(t,e){const i=-1!==e.indexOf("|")?e.split("|"):[e];let n=!1;return i.forEach(function(e){let i=e;if(void 0!==i&&-1!==i.indexOf(":")){if(i=i.split(":"),""!==t.val()&&void 0!==a[i[0]]&&!n){const e=a[i[0]],l=r.find(`#${i[1]}`).length?r.find(`#${i[1]}`).val():i[1];n=!e(t.val(),l)}}else i=a[i]||/^(\w|\d)+/,""!==t.val()&&(n=$.isFunction(i)?!i(t.val()):""!==t.val()&&!i.test(t.val()))}),!n},h=function(t){return!(t.is("input")||t.is("textarea")||t.is("select"))||-1!==$.inArray(t.prop("type"),["submit","reset","button","image"])},g=function(){$(this).off("click.valida").on("click.valida",function(){s(r),r.find("input, select, textarea").filter(":first").focus()})},v=function(t){return 0===t.find("option").length||""===t.val()},m=function(t){const a=$(t.currentTarget);(a.is("select")&&v(a)||a.is("textarea")&&""===a.val()||a.is('[type="checkbox"]')&&(!a.is(":checked")||""===a.val())||a.is("input")&&""===a.val())&&u(a)},b=function(t){const a=$(t.currentTarget);"checkbox"!==a.attr("type")&&""!==a.val()&&p(a,a.attr("data-filter")||a.attr("filter")||"")&&c(a)},k=function(t){const a=$(t.currentTarget),e=a.attr("data-filter")||a.attr("filter")||"",i=p(a,e);e&&i?(!function(t){c(t),t.addClass("at-valid"),n.debug&&console.log("[Valida] ",`#${r.attr("id")}#${t.attr("id")}`,"is valid")}(a),n.debug&&console.log("[Valida]",`#${r.attr("id")}#${a.attr("id")}`,"filter is valid")):e&&!i&&""!==a.val()?(f(a),n.debug&&console.log("[Valida]",`#${r.attr("id")}#${a.attr("id")}`,"filter is invalid")):c(a)};return this.each(function(){r=$(this),n.debug&&console.log("[Valida] Instance #",this.id),r.data("old-autocomplete",r.attr("autocomplete")),r.data("old-novalidate",r.attr("novalidate")),r.attr("autocomplete",n.autocomplete||"off"),r.attr("novalidate",n.novalidate||"novalidate"),r.find("[type=reset]").each(g),r.find("input, select, textarea").each(function(t,a){const i=$(a),l=function(t){const a=`<span class="at-optional-highlight" > ${n.highlightMarker}</span>`;return"pre"===n.highlightPosition?`${a} <span >${t}</span>`:`<span >${t}</span> ${a}`};let o;switch(!0){case i.is("select"):o="select";break;case i.is("textarea"):o="textarea";break;default:o=i.attr("type")}h(i)||(n.debug&&console.log("[Valida] :: Found: ",`#${i.attr("id")}`,`( ${o} )`,`${i.is("[required]")?"required":"optional"}`),-1!==$.inArray(i.attr("type"),["email","url","number"])&&i.attr("data-filter",i.attr("type")),n.highlightOptional&&!i.is("[required]")?r.find(`[for="${i.attr("id")}"]`).html(l(r.find(`[for="${i.attr("id")}"]`).html())):!n.highlightOptional&&i.is("[required]")&&r.find(`[for="${i.attr("id")}"]`).html(l(r.find(`[for="${i.attr("id")}"]`).html())),n.triggerOnBlur&&i.is("[required]")&&("checkbox"===i.attr("type")?i.off("click.valida").on("click.valida",function(){c(i),i.is(":checked")||u(i)}):i.off("blur.valida").on("blur.valida",m)),n.triggerOnTyping&&!i.is("textarea")&&i.off("keyup.valida keydown.valida").on("keyup.valida keydown.valida",k),i.is("textarea")&&i.attr("maxlength")&&(i.after($("<div />",{class:"at-description",html:(i.attr("data-help")||(n.i18n.maxlength?n.i18n.maxlength:'<span class="at-counter">{0}</span> out of {1}')).replace("{1}",i.attr("maxlength")).replace("{0}",i.val().length)})),i.off("keyup.valida keydown.valida").on("keyup.valida keydown.valida",function(t){i.val().length>i.attr("maxlength")?t.preventDefault():i.parent().find(".at-description > .at-counter").html(i.val().length)})),(i.attr("data-mask")||i.attr("mask"))&&(i.on("keyup.valida keydown.valida",d),i.attr("maxlength",(e[i.attr("data-mask")||i.attr("mask")]||i.attr("data-mask")||i.attr("mask")).length)),i.off("change.valida").on("change.valida",b))}),r.off("submit.valida").on("submit.valida",function(t){let a=!1;s(r),n.beforeValidation&&$.isFunction(n.beforeValidation)&&(a=!n.beforeValidation.apply(this,t)),r.find('[type="submit"]').each(function(t,a){const e=$(a);e.prop("disabled",!0),e.is("input")?e.attr("data-old-value",e.val()).val(e.attr("data-submit")||(n.i18n&&n.i18n.submit?n.i18n.submit:"Wait ...")):e.attr("data-old-value",e.text()).text(e.attr("data-submit")||(n.i18n&&n.i18n.submit?n.i18n.submit:"Wait ..."))}),r.find("input, select, textarea").each(function(t,e){const i=$(e);a=!function(t,a=!0,e=!0,i=!1){const r="object"==typeof t?t:$(t);let n=void 0!==i&&i;return e&&c(r),!r.length||h(r)?!n:(r.is("[required]")&&(r.is("select")&&v(r)||"checkbox"===r.attr("type")&&!r.is(":checked")||""===r.val())&&(n=!0,a&&u(r)),r.is("[required]")||!r.attr("data-filter")&&!r.attr("filter")||p(r,r.attr("data-filter")||r.attr("filter"))||(n=!0,a&&f(r)),!n)}(i,!0,!1,a)}),n.afterValidation&&$.isFunction(n.afterValidation)&&(a=!n.afterValidation.apply(this,t,a)),a&&(t.preventDefault(),r.find('[type="submit"]').each(function(t,a){const e=$(a);e.prop("disabled",!1),e.is("input")?e.val(e.attr("data-old-value")):e.text(e.attr("data-old-value"))}))})})}};$.fn.valida=function(t){return i[t]?i[t].apply(this,Array.prototype.slice.call(arguments,1)):"object"!=typeof t&&t?($.error(`Method "${t}" does not exist on $.valida().`),!1):i.init.apply(this,arguments)}}();