/**
 * @author Diego Migliavacca (https://github.com/diegomigliavacca)
 * @copyright SP7 Ritmare (http://www.ritmare.it)
 */

function storageType() {
	if (localStorage.getItem("sessionOwner") == "notlogged") {
		return sessionStorage;
	} else {
		return localStorage;
	}
};

var widgetOptions = {
	color : function(string) {
		for (var key in sessionStorage) {
			if (key.startsWith(string)) {
				return JSON.parse(sessionStorage.getItem(key)).color;
			}
		}
	},
	address : function(string) {
		for (var key in sessionStorage) {
			if (key.startsWith(string)) {
				return JSON.parse(sessionStorage.getItem(key)).address;
			}
		}
	},
	icon : function(string) {
		for (var key in sessionStorage) {
			if (key.startsWith(string)) {
				return JSON.parse(sessionStorage.getItem(key)).icon;
			}
		}
	},
	menu : function(string) {
		var labels;
		for (var key in sessionStorage) {
			if (key.startsWith(string)) {
				labels = JSON.parse(sessionStorage.getItem(key)).itemLabel;
			}
		}
		return labels;
	},
	tooltip : function(string) {
		for (var key in sessionStorage) {
			if (key.startsWith(string)) {
				return JSON.parse(sessionStorage.getItem(key)).itemTooltip;
			}
		}
	},
	varlabel : function(widget) {
		var varlabels;
		for (var key in sessionStorage) {
			if (key.startsWith(widget)) {
				varLabels = (JSON.parse(sessionStorage.getItem(key)).varLabel).slice(0, -2);
			}
		}
		return varLabels;
	}
};

var storage = {
	check : function() {
		if ( typeof (Storage) == "undefined") {
			$("#browser_not_supported").dialog({
				buttons : {
					OK : function() {
						$(this).dialog("close");
					}
				},
				modal : true,
				show : "blind",
				hide : "explode"
			});
		}
	},
	storeWidget : function(position, name) {
		if (localStorage.getItem("sessionName") != null) {
			var session = localStorage.getItem("sessionName");
		} else {
			var session = "null";
		};
		var widget = {
			position : position,
			name : name,
			session : session
		};
		var record = JSON.stringify(widget);
		storageType().setItem(position, record);
	},
	clearStoredWidgets : function() {
		var i = 0;
		while (i < 6) {
			i++;
			if (localStorage.getItem(i) != null) {
				localStorage.removeItem(i);
			};
		};
	},
	countWidgets : function() {
		var length = 0;
		for (var i in storageType()) {
			if ($.isNumeric(i)) {
				length = length + 1;
			};
		};
		return length;
	},
	countWidgetsByName : function(name) {
		var count = 0;
		for (var i in storageType()) {
			val = storageType().getItem(i);
			if (val != null && $.isNumeric(i)) {
				if (JSON.parse(val).name == name) {
					count = count + 1;
				};
			};
		};
		return count;
	},
	getWidgetByPosition : function(pos) {
		return JSON.parse(storageType().getItem(pos));
	},
	getWidgetNames : function() {
		var namesArr = [];
		var i = 0;
		while (i < this.countWidgets()) {
			i++;
			var widget = this.getWidgetByPosition(i);
			if (widget != null) {
				namesArr.push(widget.name);
			};
		};
		return namesArr;
	}
};

var utils = {
	doAppend : function(pos, str) {
		$('.widget-attivi a:first-child').after('<a href="#" onclick="clickSwitchWidgets(' + pos + ')"><!--<span class="badge" data-badge="0">--></span><span class="awidg ' + widgetOptions.icon(str) + '" style="color:' + widgetOptions.color(str) + '"></span><br /><span class="icon-title" style="color:' + widgetOptions.color(str) + '">' + str + '</span></a>');
	},
	removeFromWidgetAttivi : function(str) {
		$('.widget-attivi a:eq(1)').remove();
	},
	reloadWidgetAttivi : function() {
		$('.widget-attivi a:gt(0)').remove();
		var i = storage.countWidgets() + 1;
		while (--i) {
			if (i < 6) {
				var w = storage.getWidgetByPosition(i);
				if (w !== null) {
					if (localStorage.getItem("sessionOwner") == "notlogged") {
						this.doAppend(i, w.name);
					} else {
						if (w.session == localStorage.getItem("sessionName")) {
							this.doAppend(i, w.name);
						}
					}
				}
			};
		}
	},
	addBadgeValue : function() {
		$('.wrap-icons').find('.badge2').each(function() {
			if (storage.countWidgetsByName($(this).parent().find(".cwidg").attr("id")) > 0) {
				$(this).attr("data-badge2", storage.countWidgetsByName($(this).parent().find(".cwidg").attr("id")) + "x");
			} else {
				$(this).removeAttr("data-badge2");
			}
		});
	},
	loadMenu : function(str) {
		$('#dropdown-menu').empty();
		var arr = widgetOptions.menu(str);
		if ( typeof arr !== 'undefined' && arr.length > 0) {
			var i = 0;
			while (i < arr.length) {
				$('#dropdown-menu').append("<li><a href='#'>" + arr[i] + "</a></li>");
				i++;
			};
		};
		$('#dropdown-menu').append("<li><a href='#' onclick='toggleWidget(this)'>Toggle fullscreen</a></li>");
		$('#dropdown-menu').append("<li><a href='#' onclick='closeWidget()'>Close widget</a></li>");
	},
	getWidgetData : function() {
		bloccoPos = [];
		bloccoWidth = [];
		bloccoHeight = [];
		ifbWidth = [];
		ifbHeight = [];
		data = [];
		var i = 0;
		while (i < 5) {
			i++;
			var wId = $('#draggable' + i);
			bloccoPos.push(wId.position());
			bloccoWidth.push(wId.width());
			bloccoHeight.push(wId.height());
			ifbWidth.push(wId.find('.ifb').width());
			ifbHeight.push(wId.find('.ifb').height());
		};
		data = [bloccoPos, bloccoWidth, bloccoHeight, ifbWidth, ifbHeight];
		return data;
	},
	//site_url : "http://localhost/sp7-geogate-client",
	site_url : "http://geogate.sp7.irea.cnr.it/client",
	endpoint_query : "http://geogate.sp7.irea.cnr.it/fuseki/portal/query",
	endpoint_update : "http://geogate.sp7.irea.cnr.it/fuseki/portal/update"
};

function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
		vars[key] = value;
	});
	return vars;
};