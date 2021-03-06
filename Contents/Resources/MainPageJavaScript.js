//
// This file's encoding should be UTF-16
//

// ----------------------------------------------------------------------------------------
// getNamedFrame
// ----------------------------------------------------------------------------------------
function getNamedFrame(frameName)
{
	// Find a frame which has the specified name
	var frame = null;
	frameList = document.getElementsByTagName("iframe");
	
	for ( var i = 0, frameCount = frameList.length; i < frameCount; i++ )
	{
		if ( frameList[i].name == frameName )
		{
			 frame = frameList[i];
			 break;
		}
	}
	
	return frame;
}

// ----------------------------------------------------------------------------------------
// getElementOffset
// ----------------------------------------------------------------------------------------
function getElementOffset(frame, element)
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
	
	return offset;
}

// ----------------------------------------------------------------------------------------
// contentsVisible
// ----------------------------------------------------------------------------------------
function contentsVisible(dictID)
{
	var dictDiv = document.getElementById(dictID);
	
	if ( typeof(dictDiv.shown) == "undefined")
		return true;
	else
		return dictDiv.shown;
}

// ----------------------------------------------------------------------------------------
// setContentsVisiblity
// ----------------------------------------------------------------------------------------
function setContentsVisiblity(dictID, visible)
{
	var dictDiv = document.getElementById(dictID);
	dictDiv.shown = visible;
	
	if ( visible )
	{
		dictDiv.style.KhtmlUserSelect = "";
		getNamedFrame(dictID).tabIndex = 0;
	}
	else
	{
		dictDiv.style.KhtmlUserSelect = "none";
		getNamedFrame(dictID).tabIndex = -1;
	}
}

// ========================================================================================
// get_divider_state
//
// Returns state of the divider for specified dictionary.
// Called from application context.
// ========================================================================================
function get_divider_state(name)
{
	var divider = document.getElementById("dic-divider_"+name);
	if ( divider == null || typeof(divider.shown) == "undefined")
		return true;

	return divider.shown;
}

// ----------------------------------------------------------------------------------------
// isVerticalDocument
// ----------------------------------------------------------------------------------------
function isVerticalDocument( document )
{
	var bodyElement = document.getElementsByTagName("body");
	if ( bodyElement )
	{
		bodyElement = bodyElement[0];
		var writingMode = document.defaultView.getComputedStyle( bodyElement, null).getPropertyValue('-webkit-writing-mode');
		if ( writingMode.search(/vertical-/) == 0 ) return true;
	}
	return false;
}

// ----------------------------------------------------------------------------------------
// getEmUnitSizeInFrame
// ----------------------------------------------------------------------------------------
function getEmUnitSizeInFrame(frame)
{
	var doc = frame.contentDocument;
	var tempDiv = doc.createElement('div');
	tempDiv.style.height = '1em';
	var bodyElement = doc.getElementsByTagName("body");
	if ( !bodyElement ) return 0;
	
	bodyElement = bodyElement[0];
	bodyElement.insertBefore(tempDiv, bodyElement.firstChild);
	var emSize = tempDiv.offsetHeight;
	bodyElement.removeChild(tempDiv);
	
	return emSize;
}

// ----------------------------------------------------------------------------------------
// adjustedFrameHeight
// ----------------------------------------------------------------------------------------
function adjustedFrameHeight(frame)
{
	contentsHeight = frame.contentDocument.lastChild.offsetHeight;
	
	// contentsHeight is always equal to frame.height if the parent frame has "height=100%" style.
	// If so, the frame height needs to be calculated via frame.contentDocument.height but we'd
	// like to possibly use frame.contentDocument.lastChild.offsetHeight since it works better
	// in various situations. (e.g., it follows when reducing contents height)
	if ( contentsHeight != frame.height ) frame.canUseOffsetHeight = "yes";
	
	if ( !frame.canUseOffsetHeight )
	{
		frame.height = 0;
		contentsHeight = frame.contentDocument.height;
	}
	
	if ( isVerticalDocument( frame.contentDocument) )
	{
		var defaultHeight = window.top.innerHeight * 0.8;
		var maxHeight = getEmUnitSizeInFrame(frame) * 40; // max height is 40em
		
		contentsHeight = ( maxHeight && defaultHeight > maxHeight ? maxHeight : defaultHeight );
	}
		
	if ( contentsHeight > 32767 ) contentsHeight = 32767;
	
	return contentsHeight;
}

// ----------------------------------------------------------------------------------------
// resizeAllMarkedFrames
// ----------------------------------------------------------------------------------------
function resizeAllMarkedFrames()
{
	var frameList = document.getElementsByTagName("iframe");
	var changed = false;
	
	for ( var i = 0, frameCount = frameList.length; i < frameCount; i++ )
	{
		if ( frameList[i].needToResize == "yes" ) // use as "ready/need to resize" flag
		{
			frameList[i].needToResize = "no";
			changed = true;
			
			if ( !contentsVisible(frameList[i].name) )
			{
				frameList[i].height = 0;
			}
			else
			{
				frameHeight = adjustedFrameHeight(frameList[i]);
			//	alert( frameList[i].name + " height is changed from " + frameList[i].height + " to " + frameHeight);
				frameList[i].height = frameHeight;
			}
		}
	}
}

// ----------------------------------------------------------------------------------------
// findAnchoredElement
// ----------------------------------------------------------------------------------------
function findAnchoredElement(frame, anchorName)
{
	var anchoredElement = null;
	
	if ( anchorName.length > 0 )
	{
		if ( frame )
			contentsDoc = frame.contentDocument;
		else
			contentsDoc = document;
		
		// Clear previous highlight
		prevXPath = contentsDoc.evaluate( "//*[@apple_anchor_highlight='1']", contentsDoc, null, XPathResult.ANY_TYPE, null);
		prevElem = prevXPath.iterateNext();
		if ( prevElem ) prevElem.removeAttribute( "apple_anchor_highlight");

		if ( anchorName.search(/xpointer\((.+)\)/) == 0 )
		{
			xpathStr = RegExp.$1;
		//	alert( "xpath = " + xpathStr);
			
			// Find element by XPath
			var xpathResult = contentsDoc.evaluate( xpathStr, contentsDoc, null, XPathResult.ANY_TYPE, null);
			anchoredElement = xpathResult.iterateNext();
			if ( anchoredElement ) anchoredElement.setAttribute( "apple_anchor_highlight", "1");
		}
		else
		{
			// Find element by name or id
			anchoredElement = contentsDoc.anchors[anchorName];
			if ( !anchoredElement )
				anchoredElement = contentsDoc.getElementById(anchorName);
		}
	}
	
	return anchoredElement;
}

// ----------------------------------------------------------------------------------------
// scrollToElement
// ----------------------------------------------------------------------------------------
function scrollToElement(frame, element, inPageJump)
{
	var offset = getElementOffset(frame, element);
	DictionaryController.scriptDocument_scrollToPos_inPageJump_(document, offset, inPageJump);
}

// ========================================================================================
// windowResized
//
// Adjusts iframe size according to new window size.
// Called from application context.
// ========================================================================================
function windowResized(async)
{
	// Mark all frames
	frameList = document.getElementsByTagName("iframe");
	for ( var i = 0, frameCount = frameList.length; i < frameCount; i++ )
	{
		frameList[i].needToResize = "yes";	// use as "ready/need to resize" flag
	}
	
	if ( async )
		setTimeout('resizeAllMarkedFrames()', 1);	// prevents excessive updates while resizing
	else
		resizeAllMarkedFrames();
}

// ========================================================================================
// markFrame
//
// Mark specified frame as "resize ready".
// Called from application context.
// ========================================================================================
function markFrame(frameName)
{
	getNamedFrame(frameName).needToResize = "yes"; // use as "ready/need to resize" flag
}

// ========================================================================================
// set_divider_state
//
// Sets state of the divider for specified dictionary.
// Called from application context.
// ========================================================================================
function set_divider_state(dictID, state)
{
	var divider = document.getElementById("dic-divider_" + dictID);
	if ( divider == null ) return;
	var contentelement = document.getElementById(dictID);
	if ( state )
	{
		divider.firstChild.src = 'DisclosureDown.pdf';
		divider.setAttribute( "aria-expanded", "true");
		setContentsVisiblity( dictID, true);
	}
	else
	{
		divider.firstChild.src = 'DisclosureUp.pdf';
		divider.setAttribute( "aria-expanded", "false");
		setContentsVisiblity( dictID, false);
		contentelement.getElementsByTagName("iframe")[0].setAttribute("height", 0);
	}
	
	divider.shown = state;
}

// ========================================================================================
// framePosition
//
// Calcs offset value from page top to named iframe.
// Called from application context.
// ========================================================================================
function framePosition(frameName)
{
	var frame = getNamedFrame(frameName);
	if ( !frame ) return 0;
	
	if ( !contentsVisible(frameName) ) return -1;
	
	var offset = 0.0;
	var element = frame;
	
	while ( element )
	{
		offset = offset + element.offsetTop;
		element = element.offsetParent;
	}
	
	return offset;
}

// ========================================================================================
// mainFrameContentsLoaded
// ========================================================================================
function mainFrameContentsLoaded(frameName, frameTitle, anchorAndFlags, allFinished )
{
	var jumpTargetElement = null;
	
	if ( anchorAndFlags && window.scrollY == 0 )
	{
		for ( var i = 0, anchorCount = anchorAndFlags.length / 3; i < anchorCount; i += 3 )
		{
			var anchoredFrame = anchorAndFlags[i];
			if ( anchoredFrame != frameName ) continue;
			var flag = anchorAndFlags[i+1];
			var anchoredElement = findAnchoredElement( null, anchorAndFlags[i+2]);
			
			if ( anchoredElement && flag == "1" ) // Jump to the first element
			{
				jumpTargetElement = anchoredElement;
				break;
			}
		}
	}
	
	if ( jumpTargetElement )
		scrollToElement( null, jumpTargetElement, false);
}

// ========================================================================================
// frameContentsLoaded
//
// Resize specifed frame if it is marked as "resizable", and call "resized" callback if needed.
// Called from application context.
// ========================================================================================
function frameContentsLoaded(frameName, frameTitle, anchorAndFlags, allFinished )
{
	var jumpTargetElement = null;
	var jumpTargetFrame;
	var frameList = document.getElementsByTagName("iframe");
	var changed = false;
	var firstVisibleFrame = true;
	var needAdjustScrollPos = ( window.scrollY != 0 );
	
	for ( var i = 0, frameCount = frameList.length; i < frameCount; i++ )
	{
		var frameIsVisible = contentsVisible(frameList[i].name);
		
		if ( frameList[i].needToResize == "yes" ) // use as "ready/need to resize" flag
		{
			if ( frameList[i].name == frameName )
			{
				frameList[i].needToResize = "no";
				if ( frameTitle.length > 0 ) frameList[i].title = frameTitle;
				changed = true;
				
				if ( !frameIsVisible )
				{
					frameList[i].height = 0;
				}
				else
				{
					oldFrameHeight = frameList[i].height;
					frameHeight = adjustedFrameHeight(frameList[i]);
				//	alert( frameList[i].name + " height is changed from " + frameList[i].height + " to " + frameHeight);
					
					if ( needAdjustScrollPos && framePosition(frameName) < window.scrollY )
						heightDiff = frameHeight - oldFrameHeight;
					else
						heightDiff = 0;
					
					frameList[i].height = frameHeight;
					
					// Adjust scroll pos to keep the original location
					window.scrollBy( 0, heightDiff);
					
					if ( anchorAndFlags )
					{
						for ( var j = 0, anchorCount = anchorAndFlags.length / 3; j < anchorCount; j += 3 )
						{
							var anchoredFrame = anchorAndFlags[j];
							if ( anchoredFrame != frameName ) continue;
							var flag = anchorAndFlags[j+1];
							if ( flag != "1" ) continue;
							var anchoredElement = findAnchoredElement( frameList[i], anchorAndFlags[j+2]);
							if ( anchoredElement ) break; // just add highlight style without jumping
						}
					}
				}
			}
		}
		
		if ( frameIsVisible && firstVisibleFrame )
		{
			if ( anchorAndFlags && allFinished && !needAdjustScrollPos )
			{
				for ( var j = 0, anchorCount = anchorAndFlags.length / 3; j < anchorCount; j += 3 )
				{
					var anchoredFrame = anchorAndFlags[j];
					if ( anchoredFrame != frameList[i].name ) continue;
					var flag = anchorAndFlags[j+1];
					if ( flag != "1" ) continue;
					var anchoredElement = findAnchoredElement( frameList[i], anchorAndFlags[j+2]);
					if ( anchoredElement ) // Jump to the first element
					{
						jumpTargetElement = anchoredElement;
						jumpTargetFrame = frameList[i];
						break;
					}
				}
			}
			firstVisibleFrame = false;
		}
	}
	
	if ( jumpTargetElement )
		scrollToElement( jumpTargetFrame, jumpTargetElement, false);
}

// ----------------------------------------------------------------------------------------
// divider_onclick
// ----------------------------------------------------------------------------------------
function divider_onclick(divider,dictID)
{
	if ( typeof(divider.shown) == "undefined")
		divider.shown = true;
	
	DictionaryController.scriptDocument_clickedDivider_showIt_(document, dictID, !divider.shown);
}

// ========================================================================================
// scrollToAnchor
//
// Scroll to the anchored element.
// Called from application context.
// ========================================================================================
function scrollToAnchor(frameName, anchorName)
{
	if ( frameName.length == 0 ) return;
	
	// Find target frame
	var frame = getNamedFrame(frameName);
	
	var anchoredElement = findAnchoredElement( frame, anchorName);
	
	if ( anchoredElement )
		scrollToElement( frame, anchoredElement, true);
}

// ========================================================================================
// scrollToFrame
// Called from application context.
// ========================================================================================
function scrollToFrame( frameName )
{
	// If the target frame is the first visible frame, don't scroll
	var frameList = document.getElementsByTagName("iframe");
	for ( var i = 0, frameCount = frameList.length; i < frameCount; i++ )
	{
		if ( frameList[i].name == frameName ) return;
		if ( contentsVisible(frameList[i].name) ) break;
	}

	var divider = document.getElementById("dic-divider_" + frameName);
	var offset = getElementOffset( null, divider);
	DictionaryController.scriptDocument_scrollToPos_animate_(document, offset, true);
}

// ========================================================================================
// setErrorMessage
//
// Called from application context.
// ========================================================================================
function setErrorMessage( message, dictID )
{
	var messageContainer;
	
	if ( dictID == null )
		messageContainer = document.getElementById( "not_found_for_all");
	else
		messageContainer = document.getElementById( "not_found_" + dictID);
		
	if ( messageContainer != null )
		messageContainer.innerText = message;
}

// ========================================================================================
// updateFrameVisibilities
//
// Called from application context.
// ========================================================================================
function updateFrameVisibilities( focusedDictID )
{
	isAllView = ( focusedDictID == null );
	allContentsEmpty = true;
	
	frameList = document.getElementsByTagName("iframe");
	
	for ( var i = 0, frameCount = frameList.length; i < frameCount; i++ )
	{
		frame = frameList[i];
		dictID = frame.name;
		
		divider = document.getElementById( "dic-divider_" + dictID);
		noRecordMsg = document.getElementById( "not_found_" + dictID);
		
		if ( focusedDictID == "dummy_dictionary_name_for_clear" )
			bodyElements = null;
		else
			bodyElements = frame.contentDocument.getElementsByTagName("body");
		
		if ( bodyElements != null && bodyElements.length > 0 && bodyElements[0].childNodes != null )
			emptyContents = ( bodyElements[0].childNodes.length == 0 );
		else
			emptyContents = true;
		
		if ( !emptyContents ) allContentsEmpty = false;
		
		if ( isAllView || focusedDictID == "dummy_dictionary_name_for_clear" )
		{
			if ( emptyContents )
				divider.style.display = "none";
			else
				divider.style.display = "block";
			
			noRecordMsg.style.display = "none";
			setContentsVisiblity( dictID, (!emptyContents && divider.shown));
		}
		else
		{
			if ( dictID == focusedDictID && emptyContents )
				noRecordMsg.style.display = "block";
			else
				noRecordMsg.style.display = "none";
			
			divider.style.display = "none";
			setContentsVisiblity( dictID, (dictID == focusedDictID));
		}
		
		if ( focusedDictID == "dummy_dictionary_name_for_clear" )
			noRecordMsg.innerText = "";
	}
	
	noRecordMsg = document.getElementById( "not_found_for_all");
	
	if ( focusedDictID == "dummy_dictionary_name_for_clear" )
	{
		noRecordMsg.style.display = "none";
		noRecordMsg.innerText = "";
	}
	else if ( isAllView )
	{
		if ( allContentsEmpty )
			noRecordMsg.style.display = "block";
		else
			noRecordMsg.style.display = "none";
	}
	else
	{
		noRecordMsg.style.display = "none";
	}
}

// ========================================================================================
// switchDictionaryFocus
//
// Called from application context.
// ========================================================================================
function switchDictionaryFocus( focusedDictID )
{
	updateFrameVisibilities( focusedDictID);
	windowResized(false); // Resize each frame and update display
}

// ========================================================================================
// hideAllDictionaryElements
//
// Called from application context.
// ========================================================================================
function hideAllDictionaryElements()
{
	updateFrameVisibilities( "dummy_dictionary_name_for_clear");
	windowResized(false); // Resize each frame and update display
}

// ========================================================================================
// clearFrameContents
//
// Called from application context.
// ========================================================================================
function clearFrameContents( frameName )
{
	var theContent;
	
	if ( frameName == "" )
	{
		theContent = document;
		
	}
	else
	{
		var frame = getNamedFrame(frameName);
		if ( !frame ) return;
		theContent = frame.contentDocument;
	}
	
	theContent.getElementsByTagName("body")[0].innerHTML = "";
}

// ========================================================================================
// expandFrameToDefaultSize
//
// Called from application context.
// ========================================================================================
function expandFrameToDefaultSize( frameName )
{
	if ( !contentsVisible(frameName) ) return;
	
	// Find target frame
	var frame = getNamedFrame(frameName);
	if ( !frame ) return;
	
	topPos = framePosition( frameName);
	pageTopPos = window.scrollY;
	
	heightDiff = window.innerHeight - topPos - frame.height;
	bottom = window.innerHeight - 10;
	
	if ( bottom > topPos )
	{
		// Cancel to adjust scroll pos if that is not necessary
		if ( pageTopPos == 0 || topPos > window.scrollY )
			heightDiff = 0;
			
		frame.height = bottom - topPos;
		window.scrollBy( 0, heightDiff);
	}
}

// ========================================================================================
// mainPageLoaded
// ========================================================================================
function mainPageLoaded()
{
	DictionaryController.scriptDocumentLoaded_(document);
}


