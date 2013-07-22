

function DataTable(id,initialValues) {

  var table = document.getElementById(id);
  if (table === null) { throw 'unknown table'; }

  var tableDataCols = table.rows[0].cells.length-1;
  var tableDataRows = table.rows.length-2;

  var tableBody = table.rows[1].parentNode;

  var page = 1;
  var pages = 1;

  var values = [[]];

  var dataUrl = null;

  //privileged
  this.getValue = function(r,c) {
    return values[r][c];
  };

  this.dataRows = function() {
    return values.length;
  };

  this.fetchCallback = function () {
    if (this.readyState === 4 && this.status === 200) {
      setValues(JSON.parse(this.response));
    }
  };

  this.fetchTableValues = function(url) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = fetchCallback;
    xhr.open("GET", url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
  }; 

  this.setDataUrl = function(url) { 
    dataUrl = url; 
  };

  //private
  var pushTableValues = function() {
    if (dataUrl === null) { return; }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", dataUrl);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(values));
  }; 

  var displayValues = function() {
    for (var i=0; i<tableDataRows; i++) {
      var row = i+(page-1)*tableDataRows;
      if (row < values.length) {
        for (var j=0; j<tableDataCols; j++) {
          table.rows[i+1].cells[j].getElementsByTagName('label')[0].textContent = values[row][j];
          table.rows[i+1].cells[j].getElementsByTagName('input')[0].value = values[row][j];
        }
      } else {
        for (var j=0; j<tableDataCols; j++) {
          table.rows[i+1].cells[j].getElementsByTagName('label')[0].textContent = "";
          table.rows[i+1].cells[j].getElementsByTagName('input')[0].value = "";
        }        
      }        
    }
    document.getElementById('page').textContent = page;
    if (page>1) {
      document.getElementById('previousPage').style.display='inline';
    } else {
      document.getElementById('previousPage').style.display='none';      
    }  
    if (page<pages) {
      document.getElementById('nextPage').style.display='inline';
    } else {
      document.getElementById('nextPage').style.display='none';      
    }  

    if (tableDataRows <= 1) {
      document.getElementById('removeRow').style.display='none';
    } else {
      document.getElementById('removeRow').style.display='inline';      
    }  

    if (tableDataRows >= 500) {
      document.getElementById('addRow').style.display='none';
    } else {
      document.getElementById('addRow').style.display='inline';      
    }  

  };

  var setValues = function(newValues) {
    values = newValues;
    pages = Math.ceil( values.length / tableDataRows );
    displayValues();    
  };

  var setMode = function(row,mode) {
    row.className = mode;

    var fields = row.getElementsByTagName('label');
    for (var i=0; i<fields.length; i++) {
      fields[i].className = mode;      
    }
    var fields = row.getElementsByTagName('input');
    for (var i=0; i<fields.length; i++) {
      fields[i].className = mode;      
    }
  };

  var setDisplayMode = function () {
    setMode(this,'display')
  };

  var setEditMode = function () {
    clearEditMode();
    setMode(this,'edit')
  };

  var clearEditMode = function () {
  	for (var i=1; i<table.rows.length; i++) {
      setMode(table.rows[i],"display");
  	}
  };

  var enableRowToActivatingEditMode = function (row) {
    row.onclick = setEditMode;
  };

  var enableDeleteRow = function(row) {
    var link = row.getElementsByClassName('delete')[0];
    link.onclick = function (event) { 
      event.stopPropagation();
      values.splice([row.rowIndex-1+(page-1)*tableDataRows],1);  
      setValues(values); 
      pushTableValues();
    }
  };

  var enableInsertRow = function(row) {
    var link = row.getElementsByClassName('insert')[0];
    link.onclick = function (event) { 
      event.stopPropagation();
      var emptyRow = new Array(tableDataCols + 1).join('0').split('');
      values.splice(row.rowIndex-1+(page-1)*tableDataRows,0,emptyRow);  
      setValues(values); 
      pushTableValues();
    }
  };

  var enableCellToUpdateValue = function(cell) {
    var input = cell.getElementsByTagName('input');
    if (input.length===0) { return; }
    input[0].onblur = function(event) {
      var row = cell.parentNode.rowIndex-1+(page-1)*tableDataRows;
      var col = cell.cellIndex;
      console.log(values.length);
      if (row >= values.length) {
        for (var i=0; i<(row-values.length+1); i++) { 
          var emptyRow = new Array(tableDataCols + 1).join('0').split('');
          values.splice(values.length,0,emptyRow);
        }
      }
      console.log(values.length);
      values[row][col] = this.value;
      displayValues(); 
      pushTableValues();
    };
  };

  var enableCellsToUpdateValues = function(row) {
    var cells = row.getElementsByTagName('td');
    for (var i=0; i<cells.length-1; i++) { 
      enableCellToUpdateValue(cells[i]);
    }  
  };

  var enableRow = function(row) {
    enableRowToActivatingEditMode(row);
    enableInsertRow(row);
    enableDeleteRow(row);
    enableCellsToUpdateValues(row);
  };

  var previousPage = function () {
    if (page>1) { 
      page -= 1;
      displayValues(); 
      clearEditMode();
    }
    return false;
  };

  var nextPage = function () {
    if (page<pages) { 
      page += 1;
      displayValues(); 
      clearEditMode();
    }
    return false;
  };

  var setupPaging = function () {
    document.getElementById('nextPage').onclick = nextPage;
    document.getElementById('previousPage').onclick = previousPage;
  };

  var removeRow = function () {
    if (tableDataRows>1) { 
      clearEditMode();
      tableDataRows -= 1;
      tableBody.removeChild(table.rows[tableDataRows]);
      setValues(values); 
    }
    return false;
  };

  var addRow = function () {
    if (tableDataRows<500) { 
      clearEditMode();
      tableDataRows += 1;
      var clone = table.rows[1].cloneNode(true);
      tableBody.insertBefore(clone, table.rows[table.rows.length-1]);
      enableRow(clone);
      setValues(values); 
    }
    return false;
  };

  var setupTableResize = function () {
    document.getElementById('addRow').onclick = addRow;
    document.getElementById('removeRow').onclick = removeRow;
  };

  enableRow(table.rows[1]);
  while (tableDataRows<5) { addRow(); }
  setupPaging();
  setupTableResize();
  if (initialValues) { setValues(initialValues); } 
  displayValues();

}






