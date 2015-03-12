/**
 * global slider object
 * @type {Object}
 */
var slider = null;

/**
 * global srcTree object
 * @type {Object}
 */
var srcTree = null;

/**
 * visibility of scrInfo on script table
 * @type {boolean}
 */
var srcInfoShown = true;

/**
 * @param {number} slideIndex
 * @returns {string}
 */
function getSlideTtId(slideIndex) {
  return $(".bxslider div.scrollContainer").eq(slideIndex).attr("data-tt-id");
};

/**
 * @param {Object} trObject jQuery object for table tr element
 * @returns {string}
 */
function getTrTtId(trObject) {
  return trObject.attr("data-tt-id");
};

/**
 * @param {string} ttId
 * @returns {number} -1 means not found
 */
function getTtIdSlideIndex(ttId) {
  var slideObj = $(".bxslider div.scrollContainer[data-tt-id='" + ttId + "']");
  if (slideObj.length == 0) {
    return -1;
  }
  return $(".bxslider div.scrollContainer").index(slideObj);
};

/**
 * @param {string} ttId
 * @returns {Object} jQuery object for tr
 */
function getTtIdTr(ttId) {
  return $("#script_table tbody tr[data-tt-id='" + ttId + "']");
};

/**
 * @returns {Object} empty object if no tr is selected
 */
function getSelectedTr() {
  return $("#script_table tbody tr.selected");
};

/**
 * @param {Object} trObject
 * @returns {Object} empty object if no next tr exists
 */
function getNextTr(trObject) {
  if (!trObject || trObject.length == 0) {
    throw new Error("null argument");
  }
  var nextInvisibleNodes = trObject.nextUntil("tr:visible");
  if (nextInvisibleNodes.length == 0) {
    return trObject.next("tr:visible");
  } else {
    return nextInvisibleNodes.last().next("tr:visible")
  }
};

/**
 * @param {Object} trObject
 * @returns {Object} empty object if no previous tr exists
 */
function getPrevTr(trObject) {
  if (!trObject || trObject.length == 0) {
    throw new Error("null argument");
  }
  var prevInvisibleNodes = trObject.prevUntil("tr:visible");
  if (prevInvisibleNodes.length == 0) {
    return trObject.prev("tr:visible");
  } else {
    return prevInvisibleNodes.last().prev("tr:visible")
  }
};

/**
 * do nothing if selected tr does not exist or next tr does not exist
 * @returns {boolean} return true if selection is actually changed
 */
function changeTrSelectionToNext() {
  var selected = getSelectedTr();
  if (selected.length == 0) {
    return false;
  }
  var next = getNextTr(selected);
  if (next.length == 0) {
    return false;
  }
  selectTr(next);
  return true;
};

/**
 * do nothing if selected tr does not exist or previous tr does not exist
 * @returns {boolean} return true if selection is actually changed
 */
function changeTrSelectionToPrev() {
  var selected = getSelectedTr();
  if (selected.length == 0) {
    return false;
  }
  var prev = getPrevTr(selected);
  if (prev.length == 0) {
    return false;
  }
  selectTr(prev);
  return true;
};

/**
 * @param {Object} trObject jQuery object for table tr element
 */
function selectTr(trObject) {
  // clear all current selections
  $("tr.selected").removeClass("selected");
  trObject.addClass("selected");
};

/**
 * change current slide index to the index for the selected tr
 */
function syncSlideIndexToSelectedTr() {
  var selected = getSelectedTr();
  if (selected.length == 0) {
    return;
  }
  var ttId = getTrTtId(selected);
  var slideIndex = getTtIdSlideIndex(ttId);
  if (slideIndex == -1) {
    slideIndex = getTtIdSlideIndex('noImage');
    if (slideIndex == -1) {
      throw new Error("noImage slide not found");
    }
  }
  slider.goToSlide(slideIndex);
};

/**
 * @param {number} captureWidth
 * @param {number} captureHeight
 * @param {number} maxWidth
 * @param {number} maxHeight
 * @return {Object} object with width and height field
 */
function calcCaptureAreaSize(captureWidth, captureHeight, maxWidth, maxHeight) {
  if (captureWidth <= 0 || captureHeight <= 0) {
    // maybe fails to get valid value
    return { width: maxWidth, height: maxHeight }  
  }
  var heightRatio = captureHeight / maxHeight;
  var heightFactor = maxHeight / captureHeight;
  var widthRatio = captureWidth / maxWidth;
  var widthFactor = maxWidth / captureWidth;
  if (heightRatio > widthRatio) {
    if (heightFactor < 0.15) {
      // Avoid shrinking too match.
      // - Always area width is shrunk to maxWidth, and height is shrunk by the same ratio.
      // - Cut off some bottom blank area if exists.
      // - Bottom area out of the area will be under scroll area
      var actualHeight = Math.min(maxHeight, captureHeight * widthFactor);
      return { width: maxWidth, height: actualHeight }      
    } else {
      // shrink width of capture area and show image without scroll bar
      return { width: parseInt(captureWidth * heightFactor, 10), height: maxHeight }
    }
  } else if (heightRatio < widthRatio) {
    if (widthFactor < 0.15) {
      // avoid shrinking too match.
      var actualHeight = Math.min(maxHeight, captureHeight * widthFactor);
      return { width: maxWidth, height: actualHeight }      
    } else {
      // shrink height of capture area and show image without scroll bar
      return { width: maxWidth, height: parseInt(captureHeight * widthFactor, 10) }
    }
  } else {
    // maybe image is shown without scroll bar
    return { width: maxWidth, height: maxHeight }
  }
};

/**
 * 
 */
function adjustImageAreaSize() {
  var selected = getSelectedTr();
  var imageContainer;
  if (selected.length == 0) {
    imageContainer = $(".bxslider div.scrollContainer[data-tt-id='noImage']");
  } else {
    var ttId = getTrTtId(selected);
    imageContainer = $(".bxslider div.scrollContainer[data-tt-id='" + ttId + "']");
    if (imageContainer.length == 0) {
      imageContainer = $(".bxslider div.scrollContainer[data-tt-id='noImage']");      
    }
  }
  var width = imageContainer.attr("data-image-width");
  var height = imageContainer.attr("data-image-height");
  var maxWidth = $("#right_container").width();
  var maxHeight;
  if (srcInfoShown) {
    maxHeight = $("#right_container").height() - $("#outer_script_table_container").height() - 20;
  } else {
    maxHeight = $("#right_container").height() - 20;
  } 
  if (maxHeight <= 0) {
    maxHeight = 20;
  }
  var areaSize = calcCaptureAreaSize(width, height, maxWidth, maxHeight);
  // need to change also li elements width to reflect width change immediately
  $(".bxslider li").css('width', areaSize.width + 'px');
  $(".bxslider div.scrollContainer").css('height', areaSize.height + 'px');
  $("#bxslider_container").css('width', areaSize.width + 'px');
  $("#bxslider_container").css('height', areaSize.height + 'px');
  $("div.bx-viewport").css('height', areaSize.height + 'px');
}

/**
 * @param {Object} trObject
 * @returns {number} positive value means down direction scroll
 */
function requiredScrollOffsetToShowTr(trObject) {
  var trTop = trObject.position().top;
  var trBottom = trTop + trObject.height();
  if (trTop < 0) {
    return trTop;
  } else if (trBottom > $("#script_table_container").height()) {
    return trBottom - $("#script_table_container").height();
  } else {
    return 0;
  }
};

/**
 * 
 */
function scrollToShowSelectedTr() {
  var selectedTr = getSelectedTr();
  if (selectedTr.length == 0) {
    return;
  }
  var scrollOffset =requiredScrollOffsetToShowTr(selectedTr);
  if (scrollOffset != 0) {
    $("#script_table_container").scrollTop(
      $("#script_table_container").scrollTop() + scrollOffset);
    $("#script_table_container").perfectScrollbar("update");
  }
};

/**
 * 
 */
function expandSelectedTr() {
  var selectedTr = getSelectedTr();
  if (selectedTr.length == 0) {
    return;
  }
  $("#script_table").treetable("expandNode", getTrTtId(selectedTr));
}

/**
 * 
 */
function collapseSelectedTr() {
  var selectedTr = getSelectedTr();
  if (selectedTr.length == 0) {
    return;
  }
  $("#script_table").treetable("collapseNode", getTrTtId(selectedTr));
}

/**
 * @param {string} lineTtId
 * @param {string} errLineTtId
 * @returns {number} 0 if lineTtId == errLineTtId (means error line),
 * positive if lineTtId > errLineTtId (means not executed),
 * negative if lineTtd < errLineTtId (means already executed)
 */
function compareToErrTtId(lineTtId, errLineTtId) {
  if (errLineTtId == null || errLineTtId == "") {
    return -1; // already executed
  }
  var lineArray = lineTtId.split("_");
  var errLineArray = errLineTtId.split("_");
  if (lineArray.length == 0) {
    throw new Error(lineTtId);
  }
  
  for (var i = 0; i < lineArray.length; i++) {
    if (i >= errLineArray.length) { 
      throw new Error("lineTtId: " + lineTtId + "; errLineTtId: " + errLineTtId);
    }
    var line = parseInt(lineArray[i], 10);
    var errLine = parseInt(errLineArray[i], 10);
    if (line < errLine) {
      return -1; // already executed
    } else if (line > errLine) {
      return 1; // not executed
    }
  }
  return 0;
}

/**
 * @returns {Object} get global srcTree object
 */
function getSrcTree() {
  if (srcTree == null) {
    var yamlObj = jsyaml.safeLoad(sahagin.srcTreeYamlStr);
    var tree = new sahagin.SrcTree();
    tree.fromYamlObject(yamlObj);
    tree.resolveKeyReference();
    // TODO should call SrcTreeChecker
    srcTree = tree;
  }
  return srcTree;
}

/**
 * Reloading slider should be avoided as much as possible
 * since it causes screen flicker.
 * In many case it seems that reloading is not necessary..
 * @param {boolean} sliderReload
 */
function selectTrSlideAndRefresh(sliderReload) {
  adjustImageAreaSize();
  if (sliderReload) {
    // reflect size adjust to the slider
    slider.reloadSlider();
  }
  // always need to select again 
  // since current selection has been lost by reloadSlider
  syncSlideIndexToSelectedTr();
  // refresh scroll bar
  $(".scrollContainer").perfectScrollbar('update');
}

function showSrcInfo() {
  $(".srcInfo").show();
  $("#showSrcButton").hide();
  $("#hideSrcButton").show();
  $("#script_table_container").removeClass("noCode");
  $("#script_table_container").addClass("withCode");
  $("#button_container").removeClass("noCode");
  $("#button_container").addClass("withCode");
  $("#bxslider_container").removeClass("noCode");
  $("#bxslider_container").addClass("withCode");
  srcInfoShown = true;
  selectTrSlideAndRefresh(true);
};

function hideSrcInfo() {
  $(".srcInfo").hide();  
  $("#showSrcButton").show();
  $("#hideSrcButton").hide();
  $("#script_table_container").removeClass("withCode");
  $("#script_table_container").addClass("noCode");
  $("#button_container").removeClass("withCode");
  $("#button_container").addClass("noCode");
  $("#bxslider_container").removeClass("withCode");
  $("#bxslider_container").addClass("noCode");
  srcInfoShown = false;
  selectTrSlideAndRefresh(true);
};

// reflect visibility to newly added srcInfo
function refreshSrcInfoVisible() {
  if (srcInfoShown) {
    showSrcInfo();
  } else {
    hideSrcInfo();
  }  
};

/**
 * @param {sahagin.Code} code
 * @returns {string}
 */
function getMethodKey(code) {
  if (!(code instanceof sahagin.SubMethodInvoke)) {
    return '';
  }
  var invoke = code;
  if (invoke.isChildInvoke()) {
    return '';
  }
  return invoke.getSubMethodKey();
}

/**
 * add tr's codeBody node
 * @param {Object} tr
 */
function loadCodeBodyHiddenNode(tr) {
  var trMethodKey = tr.attr("data-method-key")
  if (trMethodKey == '') {
    return; // no need to load child nodes
  }  
  var srcTree = getSrcTree();
  var trTtId = getTrTtId(tr);
  var testMethod = srcTree.getTestMethodByKey(trMethodKey);
  if (testMethod.getCodeBody().length == 0) {
    return; // no need to load child nodes
  }  
  var parentMethodArgTestDocs = new Array();
  var methodArgTestDocDivs = $("#methodArgTestDocs .hiddenMethodArgTestDoc[data-tt-id='" + trTtId + "']");
  for (var i = 0; i < methodArgTestDocDivs.length; i++) {
    parentMethodArgTestDocs.push(methodArgTestDocDivs.eq(i).text());
  }

  var childNodeHtml = '';
  var methodArgTestDocHtml = "";
  for (var i = 0; i < testMethod.getCodeBody().length; i++) {
    var codeLine = testMethod.getCodeBody()[i];
    var parentTtId = trTtId;
    var ttId = parentTtId + '_' + i.toString(10);
    var methodKey = getMethodKey(codeLine.getCode());
    var errCompare = compareToErrTtId(ttId, sahagin.errLineTtId);
    var lineClass;
    if (errCompare == 0) {
      lineClass = "errorLine";
    } else if (errCompare > 0) {
      lineClass = "notRunLine";
    } else {
      lineClass = "successLine";
    }
    var pageTestDoc = sahagin.TestDocResolver.pageTestDoc(codeLine.getCode());
    if (pageTestDoc == null) {
      pageTestDoc = '-';
    }
    var testDoc = sahagin.TestDocResolver.placeholderResolvedMethodTestDoc(
        codeLine.getCode(), parentMethodArgTestDocs);
    if (testDoc == null) {
      testDoc = '';
    }
    var original = codeLine.getCode().getOriginal();
    
    childNodeHtml = childNodeHtml + sahagin.CommonUtils.strFormat(
      '<tr data-tt-id="{0}" data-tt-parent-id="{1}" data-method-key="{2}" class="{3}">'
          + '<td>{4}</td><td>{5}</td><td class="srcInfo">{6}</td></tr>',
      ttId, parentTtId, methodKey, lineClass, pageTestDoc, testDoc, original);
    
    var methodArgTestDocs = sahagin.TestDocResolver.placeholderResolvedMethodArgTestDocs(
        codeLine.getCode(), parentMethodArgTestDocs);
    for (var j = 0; j < methodArgTestDocs.length; j++) {
      methodArgTestDocHtml = methodArgTestDocHtml + sahagin.CommonUtils.strFormat( 
          '<div class= "hiddenMethodArgTestDoc" data-tt-id="{0}">{1}</div>',
          ttId, methodArgTestDocs[j]);
    }
  }
  
  // add methodArgTestDocs
  $("#methodArgTestDocs").append(methodArgTestDocHtml);
  
  var trNode = $("#script_table").treetable("node", trTtId);
  $("#script_table").treetable("loadBranch", trNode, childNodeHtml);
  // loadBranch automatically expand the trNode,
  // but this behavior is not desirable, so force collapse the trNode again
  $("#script_table").treetable("collapseNode", trTtId);
  
  refreshSrcInfoVisible();
}

$(document).ready(function() {
  $("#script_table").treetable({
    expandable: true,
    onNodeExpand: function() {
      var selectedTr = getSelectedTr();
      if (selectedTr.length == 0) {
        return;
      }
      if (!selectedTr.hasClass("loaded")) {
        selectedTr.addClass("loaded");
        var ttId = getTrTtId(selectedTr);
        var children = $("tr[data-tt-parent-id='" + ttId + "']");
        // TODO value of children.length may change after loadCodeBodyNode is called ??
        var childrenLength = children.length;
        for (var i = 0; i < childrenLength; i++) {
          loadCodeBodyHiddenNode(children.eq(i));
        }
      }
      // tree table size may change
      $("#script_table_container").perfectScrollbar("update");
    },
    onNodeCollapse: function() {
      // tree table size may change
      $("#script_table_container").perfectScrollbar("update");
    }
  });

  slider = $(".bxslider").bxSlider({
    speed: 1,
    infiniteLoop: false,
    hideControlOnEnd: true,
    pager: false,
    controls: false
  });

  $(".scrollContainer").perfectScrollbar({
    useKeyboard: false,
    suppressScrollX: true
  });

  $(document).on("mousedown", "#script_table tbody tr", function() {
    selectTr($(this));
    selectTrSlideAndRefresh(false);
  });

  // "#script_table body tr"
  $(document).keydown(function(e) {
    if (e.keyCode == "38") {
      // up key changes table line selection to next
      if (changeTrSelectionToPrev()) {
        scrollToShowSelectedTr();
        selectTrSlideAndRefresh(false);
      };
    } else if (e.keyCode == "40") {
      // down key changes table row selection to prev
      if (changeTrSelectionToNext()) {
        scrollToShowSelectedTr();
        selectTrSlideAndRefresh(false);
      };
    } else if (e.keyCode == "39") {
      // right key expands the selected node
      expandSelectedTr();
    } else if (e.keyCode == "37") {
      // right key collapse the selected node
      collapseSelectedTr();
    } else {
      return true;
    }
    return false;
  });

  hideSrcInfo();

  // select table line for first capture
  var firstTrObj = $("#script_table tbody tr:first-child");
  selectTr(firstTrObj);
  selectTrSlideAndRefresh(true);
});