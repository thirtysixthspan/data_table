describe("DataTable", function() {

  var table;
  var tableElement;

  var initialValues = [ 
                        [ 1, 2, 3, 4],
                        [ 5, 6, 7, 8],
                        [ 9,10,11,12],
                        [13,14,15,16],
                        [17,18,19,20],
                        [21,22,23,24],
                        [25,26,27,28],
                        [29,30,31,32],
                        [33,34,35,36]
                      ];
  var testValues;

  var originalTable = document.getElementById('datatable').cloneNode(true);

  var restoreTable = function() {
    var dirtyTable = document.getElementById('datatable');
    var tableParent = dirtyTable.parentNode;
    tableParent.insertBefore(originalTable.cloneNode(true),dirtyTable);
    tableParent.removeChild(dirtyTable);
    testValues = initialValues.slice(0);    
  }

  beforeEach(function() {
    restoreTable();
  });

  describe("constructor", function() {

    it("should throw an exception if the table does not exist", function() {
      expect(function() {
        var table = new DataTable('non_existant_table');
      }).toThrow("unknown table");

    });

  });

  describe("edit mode", function () {

    beforeEach(function() {
      table = new DataTable('datatable',testValues);
      tableElement = document.getElementById('datatable');
    });

    it("should activate when a row is clicked", function() {
      tableElement.rows[2].click();
      expect(tableElement.rows[1].className).toEqual('display');
      expect(tableElement.rows[2].className).toEqual('edit');
      expect(tableElement.rows[3].className).toEqual('display');
      expect(tableElement.rows[4].className).toEqual('display');
      expect(tableElement.rows[5].className).toEqual('display');
    });

    it("should not activate on header row", function() {
      tableElement.rows[0].click();
      expect(tableElement.rows[0].className).toEqual('');
    });

    it("should not activate when a link in a row is clicked", function() {
      tableElement.rows[2].click();
      tableElement.rows[5].getElementsByTagName('a')[0].click();
      expect(tableElement.rows[1].className).toEqual('display');
      expect(tableElement.rows[2].className).toEqual('edit');
      expect(tableElement.rows[3].className).toEqual('display');
      expect(tableElement.rows[4].className).toEqual('display');
      expect(tableElement.rows[5].className).toEqual('display');
    });

    it("leaving a cell should update the cell's value", function() {
      var input = tableElement.rows[2].cells[2].getElementsByTagName('input')[0];
      var label = tableElement.rows[2].cells[2].getElementsByTagName('label')[0];
      tableElement.rows[2].click();
      input.focus();
      input.value='69';      
      input.blur();
      expect(label.textContent).toEqual('69');
    });

  });

  describe("paging", function () {

    beforeEach(function() {
      table = new DataTable('datatable',testValues);
      tableElement = document.getElementById('datatable');
    });

    it("nextPage and previousPage should update the cell's value", function() {
      var before = tableElement.rows[2].cells[2].getElementsByTagName('label')[0].textContent;
      document.getElementById('nextPage').click();
      var after = tableElement.rows[2].cells[2].getElementsByTagName('label')[0].textContent;
      expect(before).not.toEqual(after);
      document.getElementById('previousPage').click();
      var back = tableElement.rows[2].cells[2].getElementsByTagName('label')[0].textContent;
      expect(back).not.toEqual(after);
      expect(back).toEqual(before);
    });

  });

  describe("table resizing", function () {

    beforeEach(function() {
      table = new DataTable('datatable',testValues);
      tableElement = document.getElementById('datatable');
    });

    it("addRow should add a row", function() {
      var before = tableElement.rows.length;
      document.getElementById('addRow').click();
      var after = tableElement.rows.length;
      expect(after).toEqual(before+1);
    });

    it("removeRow should remove a row", function() {
      var before = tableElement.rows.length;
      document.getElementById('removeRow').click();
      var after = tableElement.rows.length;
      expect(after).toEqual(before-1);
    });

  });

  describe("row data", function () {

    beforeEach(function() {
      table = new DataTable('datatable',testValues);
      tableElement = document.getElementById('datatable');
    });

    it("Insert should delete a row of data", function() {
      var before = table.dataRows();
      tableElement.rows[2].getElementsByClassName('insert')[0].click();
      var after = table.dataRows();
      expect(after).toEqual(before+1);
    });

    it("Delete should insert a row of data", function() {
      var before = table.dataRows();
      tableElement.rows[2].getElementsByClassName('delete')[0].click();
      var after = table.dataRows();
      expect(after).toEqual(before-1);
    });

  });

  describe("loading data", function () {

    var dataExpectation = function(table) {
      expect(table.getValue(0,3)).toEqual(4);
      expect(table.getValue(1,3)).toEqual(8);
      expect(table.getValue(2,3)).toEqual(12);
      expect(table.getValue(3,3)).toEqual(16);
      expect(table.getValue(4,3)).toEqual(20);
      expect(table.getValue(5,3)).toEqual(24);
    }

    it("via constructor", function() {
      table = new DataTable('datatable',testValues);
      dataExpectation(table);
    });

    it("via ajax", function() {

      table = new DataTable('datatable');
      spyOn(table, "fetchTableValues").andCallFake(function(e) {
        var xhr = {};
        xhr.onreadystatechange = this.fetchCallback;
        xhr.readyState = 4;
        xhr.status = 200;
        xhr.response = JSON.stringify(testValues);
        xhr.onreadystatechange();
      });

      table.fetchTableValues('http://some.url/data.json');
      dataExpectation(table);
    });

  });


  describe("pushing data", function () {

    it("via ajax after updating a cell", function() {

      var xhr = jasmine.createSpyObj('XMLHttpRequest', ['open','send','setRequestHeader']);
      xhr.send.andCallFake(function(data) {
        console.log('sent data');
        console.log(data);
      });
      spyOn(window, 'XMLHttpRequest').andReturn(xhr); 

      table = new DataTable('datatable',testValues);
      table.setDataUrl('http://some_url/data.json');

      tableElement = document.getElementById('datatable');
      tableElement.rows[2].click();
      var input = tableElement.rows[2].cells[2].getElementsByTagName('input')[0];
      input.focus();
      input.value='57';      
      input.blur();

    });

  });

});

