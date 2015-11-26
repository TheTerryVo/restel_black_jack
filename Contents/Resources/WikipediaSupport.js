
// ========================================================================================
// modifyWikipediaContents
// ========================================================================================
function modifyWikipediaContents( innerDocument, langCode, signature, supportLangs, footerHTMLText )
{
	var bodyElement = innerDocument.getElementsByTagName("body");
	if ( bodyElement == null || bodyElement.length == 0 ) return false;	// No <body> found. Thye page not ready yet.
	bodyElement = bodyElement[0];
	
	// Check a special mark if this page has been processed or not
	footerElem = innerDocument.getElementById("footer");
	if ( footerElem && footerElem.lastChild.id == "apple_process_done" ) return true;
	
	linkElements = [innerDocument.getElementsByTagName("a"), innerDocument.getElementsByTagName("area")];
	var elemsToRemove = new Array();
	for ( linkKind = 0; linkKind < 2; ++linkKind )
	{
		count = ( linkElements[linkKind] ? linkElements[linkKind].length : 0 );
		for ( i = 0 ; i < count ; ++i )
		{
			// Remove links to the "article not written yet"
			//
			if ( linkElements[linkKind][i].getAttribute("class") == "new" )
			{
				elemsToRemove.push(linkElements[linkKind][i]);
				continue;
			}
			
			// Remove links using "file://" schema
			//
			var href = linkElements[linkKind][i].getAttribute("href");
			if ( !href ) continue;
			
			if ( href.indexOf("file://") == 0 )
			{
				elemsToRemove.push(linkElements[linkKind][i]);
				continue;
			}

			// Change internal links scheme
			//
			// Full-form internal links like: <http(s):/(/proxy)/en.wikipedia.org/wiki/xxx>
			if ( href.search(/https*:\/\S*\/(\S+)\.wikipedia\.org.*/) == 0 || href.search(/\/\S*\/(\S+)\.wikipedia\.org.*/) == 0 )
			{
				// prefer langCode (or variant, if any) in the full-form URL
				var siteLang = RegExp.$1;
				var urlLang = siteLang;
				if ( href.search(/\.wikipedia\.org\/(zh-..)\/.*/) > 0 )
					urlLang = RegExp.$1;
				
				// Check if the specified lang is supported
				var validLang = false;
				for ( langIndex = 0, langCount = supportLangs.length; langIndex < langCount ; ++langIndex )
				{
					if ( urlLang == supportLangs[langIndex] )
					{
						validLang = true;
						break;
					}
				}
				
				if ( validLang && href.search(/\/wiki\/([^\s:#]+)(#?[^\s:]*)$/) > 0 )
				{
					linkElements[linkKind][i].setAttribute( "href", "x-dictionary:r:'" + RegExp.$1 + "?lang=" + urlLang + 
															"&signature=" + signature + "'" + RegExp.$2);
					
					// remove leading "<lang>:" from title
					var title = linkElements[linkKind][i].title;
					var leadingLang = new RegExp(siteLang + ":(.*)");
					if ( title && title.search(leadingLang) == 0 ) 
						linkElements[linkKind][i].setAttribute("title", RegExp.$1);
				}
			}
			// Ensure "title" attribute in external links is actual destination URI
			else if ( href.indexOf("http:") == 0 || href.indexOf("https:") == 0 || href.indexOf("//") == 0 )
			{
				linkElements[linkKind][i].setAttribute("title", href);
			}
			else
			{
				// Normal internal links e.g., "/wiki/apple"
				if ( href.search(/\/wiki\/([^\s:#]+)(#?[^\s:]*)$/) == 0 )
				{
					linkElements[linkKind][i].setAttribute( "href", "x-dictionary:r:'" + RegExp.$1 + "?lang=" + langCode + 
															"&signature=" + signature + "'" + RegExp.$2);
				}
				// Internal links for Chinese. e.g., "/zh-cn/apple"
				else if ( href.search(/\/(zh-..)\/([^\s:#]+)(#?[^\s:]*)$/) == 0 )
				{
					linkElements[linkKind][i].setAttribute( "href", "x-dictionary:r:'" + RegExp.$2 + "?lang=" + langCode +
															"&variant=" + RegExp.$1 + "&signature=" + signature + "'" + RegExp.$3);
				}
			}
		}
	}

	count = elemsToRemove.length;
	for ( i = 0 ; i < count ; ++i )
	{
		var elem = elemsToRemove[i];
		elem.parentNode.replaceChild(elem.firstChild, elem);
	}
	
	delete elemsToRemove;
	
	// Replace footer text with ours
	footerElem = innerDocument.getElementById("footer");
	if ( !footerElem )
	{
		footerElem = innerDocument.createElement("div");
		footerElem.setAttribute("id", "footer");
		innerDocument.body.appendChild( footerElem);
	}
	footerElem.innerHTML = footerHTMLText;
	
	// Embed an unique mark indicating post-process has been already applied
	var markElement = innerDocument.createElement("span");
	markElement.setAttribute("id", "apple_process_done");
	footerElem.appendChild( markElement);

	return true;
}

// ========================================================================================
// appendLanguageLinks
// ========================================================================================
function appendLanguageLinks( innerDocument, languageInfoList )
{
	var bodyElement = innerDocument.getElementsByTagName("body");
	if ( !bodyElement ) return false;
	var direction = innerDocument.defaultView.getComputedStyle( bodyElement[0], null).getPropertyValue('direction');
	var isRTLDir = ( direction && direction.search(/rtl/) == 0 );
	
	var contentElem = innerDocument.getElementById("content");
	if ( !contentElem ) return false;
	
	var langListElem = innerDocument.createElement("ul");
	var elemName = ( isRTLDir ? "apple_language_links_rtl" : "apple_language_links" );
	langListElem.setAttribute("id", elemName);
	
	for ( var i = 0, langCount = languageInfoList.length;  i < langCount; i++ )
	{
		var linkInfoList = languageInfoList[i];
		var linkInfoCount = linkInfoList.length;
		var langCode = linkInfoList[0];
		var langName = linkInfoList[1];
		var langItemElem = innerDocument.createElement("li");
		
		langItemElem.setAttribute("id", "apple_language_link_title_" + langCode);
		elemName = ( isRTLDir ? "apple_language_link-title_rtl" : "apple_language_link-title" );
		langItemElem.setAttribute("class", elemName);
		langItemElem.setAttribute("langcode", langCode);
		
		if ( linkInfoCount == 4 )	// single entry
		{
			var linkElem = innerDocument.createElement("a");
			linkElem.appendChild( innerDocument.createTextNode( langName));
			linkElem.setAttribute( "title", linkInfoList[2]);
			linkElem.setAttribute( "href", linkInfoList[3]);
			langItemElem.appendChild( linkElem);
		}
		else						// multiple link candidates
		{
			langItemElem.setAttribute("onmouseover", "mouseEnterLangMenu(this)");
			langItemElem.setAttribute("onmouseout", "mouseLeaveLangMenu(this)");
			
			var langTitleElem = innerDocument.createElement("span");
			langTitleElem.setAttribute("apple_mouseover_disable", "1");
			langTitleElem.appendChild(innerDocument.createTextNode( langName + " ▾"));
			langItemElem.appendChild( langTitleElem);
			
			var linkListElem = innerDocument.createElement("div");
			linkListElem.setAttribute("id", "apple_language_link_item_" + langCode);
			elemName = ( isRTLDir ? "apple_language_link-item_rtl" : "apple_language_link-item" );
			linkListElem.setAttribute("class", elemName);
			linkListElem.setAttribute("langcode", langCode);
			linkListElem.setAttribute("onmouseover", "mouseEnterLangMenu(this)");
			linkListElem.setAttribute("onmouseout", "mouseLeaveLangMenu(this)");
			
			for ( var j = 2; j < linkInfoCount; j += 2 )
			{
				var linkElem = innerDocument.createElement("a");
				linkElem.appendChild( innerDocument.createTextNode(linkInfoList[j]));
				linkElem.setAttribute( "title", linkInfoList[j]);
				linkElem.setAttribute( "href", linkInfoList[j+1]);
				linkListElem.appendChild( linkElem);
			}
			contentElem.insertBefore( linkListElem, contentElem.firstChild);
		}
		
		langListElem.appendChild( langItemElem);
	}
	
	contentElem.insertBefore( langListElem, contentElem.firstChild);
	
	return true;
}

var gDelayedMenuHideTimer;
var gDelayedHiddenMenu;

// ----------------------------------------------------------------------------------------
// scrollToElement
// ----------------------------------------------------------------------------------------
function scrollToElement(frame, element, inPageJump)
{
	var offset = 0.0;
	
	// Calc anchor offset in the frame document
	while ( element )
	{
		offset = offset + element.offsetTop;
		element = element.offsetParent;
	}
	
	// Add iframe offset in the main page
	if ( frame )
	{
		element = frame;
		while ( element )
		{
			offset = offset + element.offsetTop;
			element = element.offsetParent;
		}
	}
	
	DictionaryController.scriptDocument_scrollToPos_inPageJump_(document, offset, inPageJump);
}

// ========================================================================================
// absoluteElementPos
// ========================================================================================
function absoluteElementPos( element )
{
	var xPos = 0, yPos = 0;
	
	while ( element )
	{
		xPos += element.offsetLeft;
		yPos += element.offsetTop;
		element = element.offsetParent;
	}
	return { x:xPos, y:yPos };
}

// ========================================================================================
// hideLangLinkMenu
// ========================================================================================
function hideLangLinkMenu()
{
	gDelayedHiddenMenu.style.visibility = "hidden";
	gDelayedHiddenMenu.style.top = 0;
	gDelayedHiddenMenu.style.left = 0;
	
	langcode = gDelayedHiddenMenu.getAttribute("langcode");
	titleElement = gDelayedHiddenMenu.ownerDocument.getElementById( "apple_language_link_title_" + langcode);
	titleElement.setAttribute( "openingMenu", "false");
}

// ========================================================================================
// mouseEnterLangMenu
// ========================================================================================
function mouseEnterLangMenu( element )
{
	clearTimeout( gDelayedMenuHideTimer);
	
	if ( element.className == "apple_language_link-title" ||
		 element.className == "apple_language_link-title_rtl" )
	{
		langcode = element.getAttribute("langcode");
		itemElement = element.ownerDocument.getElementById( "apple_language_link_item_" + langcode);
		if ( gDelayedHiddenMenu != itemElement ) hideLangLinkMenu();
		
		itemElement.style.minWidth = element.offsetWidth + 5 + "px";
		
		elementPos = absoluteElementPos( element);
		
		if ( element.className == "apple_language_link-title" )
			leftPos = elementPos.x + element.offsetWidth - itemElement.offsetWidth;
		else
			leftPos = elementPos.x;
		itemElement.style.left = leftPos + "px";
		
		topPos = elementPos.y + element.offsetHeight;
		itemElement.style.top = topPos + "px";

		itemElement.style.visibility = "visible";
		element.setAttribute( "openingMenu", "true");
	}
}

// ========================================================================================
// mouseLeaveLangMenu
// ========================================================================================
function mouseLeaveLangMenu( element )
{
	if ( element.className == "apple_language_link-title" ||
		 element.className == "apple_language_link-title_rtl" )
	{
		langcode = element.getAttribute("langcode");
		element = element.ownerDocument.getElementById( "apple_language_link_item_" + langcode);
	}
	
	gDelayedHiddenMenu = element;
	gDelayedMenuHideTimer = setTimeout( 'hideLangLinkMenu()', 100);
}

// ========================================================================================
// mainFrameContentsLoaded
// ========================================================================================
function mainFrameContentsLoaded(frameName, frameTitle, anchorAndFlags )
{
	var jumpTargetElement = null;
	
	if ( anchorAndFlags && window.scrollY == 0 )
	{
		for ( var i = 0, anchorCount = anchorAndFlags.length / 2; i < anchorCount; i += 2 )
		{
			var anchorName = anchorAndFlags[i];
			var anchoredElement = document.anchors[anchorName];
			if ( !anchoredElement ) anchoredElement = document.getElementById(anchorName);
			var flag = anchorAndFlags[i+1];
			
			if ( anchoredElement && flag == "1" ) // Jump to the first element
			{
				jumpTargetElement = anchoredElement;
				break;
			}
		}
	}
	
	if ( jumpTargetElement )
		scrollToElement( null, anchoredElement, false);
}

// ========================================================================================
// clearFrameContents
// ========================================================================================
function clearFrameContents( frameName )
{
	document.getElementsByTagName("body")[0].innerHTML = "";
}

// ========================================================================================
// scrollToAnchor
// ========================================================================================
function scrollToAnchor(frameName, anchorName)
{
	var anchoredElement = document.anchors[anchorName];
	
	if ( !anchoredElement ) anchoredElement = document.getElementById(anchorName);

	if ( anchoredElement )
		scrollToElement( null, anchoredElement, true);
}

