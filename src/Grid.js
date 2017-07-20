

function tryTiles(tiles, grid, restrictTo, prevResult) {
    // for each space that the first tile fits...
    // we try to fit remaing tiles onto same row/column

    if (tiles.length === 0) {
        return [prevResult];
    }
    var places = grid.getValidPlaces(tiles[0], restrictTo);

    var prevRow = tiles[0].row;
    var prevColumn = tiles[0].column;
    // console.log('tryTiles...', tiles, 'places', places, restrictTo);

    console.log('----> tryTiles() with prevResult', prevResult)

    if (!restrictTo) {
        console.log("First round found ", places.length, places);
    } else if (restrictTo.length == 4) {
        console.log("Second round found ", places.length, places)
    } else {
        console.log("Third round found ", places.length, places)
    }

    if (places.length == 0){
        return [prevResult];
    }

    var results = [];

    places.forEach(function(place){
        var row = place.row;
        var column = place.column;
        var id = place.id;
        // clone prev result and add tile
        var result = prevResult.map(function(r){return r});
        result.push(place);

        // clone the grid...
        var g = grid.clone();
        var coords = g.addTile(id, row, column);
        // coords are for new grid
        row = coords[0];
        column = coords[1];
        console.log('Process result: row, col:', row, column, 'grid:', g);
        var adjacentCoords;
        var spaceAbove = g.findEmptyPlace(row, column, -1, 0);
        var spaceBelow = g.findEmptyPlace(row, column, 1, 0);
        var spaceLeft = g.findEmptyPlace(row, column, 0, -1);
        var spaceRight = g.findEmptyPlace(row, column, 0, 1);
        if (!restrictTo) {
            // If unrestricted (first round) next tiles could be first empty spot
            // in any 4 directions around each tile
            adjacentCoords = [spaceAbove, spaceBelow, spaceLeft, spaceRight];
        } else if (restrictTo.length === 4) {
            // On next round, we need to restrict to same axis as last tile
            if (column == restrictTo[0][1]) {
                // latest place is in same column as before...
                adjacentCoords = [spaceAbove, spaceBelow];
            } else {
                adjacentCoords = [spaceLeft, spaceRight];
            }
        } else {
            // restrictTo is just 2 places...
            // if we are already searching columns
            if (restrictTo[0][1] == restrictTo[1][1]) {
                adjacentCoords = [spaceAbove, spaceBelow];
            } else {
                adjacentCoords = [spaceLeft, spaceRight];
            }
        }
        console.log('try again with....', place.id, ' at ', row, column, adjacentCoords);
        var res = tryTiles(tiles.slice(1), g, adjacentCoords, result);
        console.log('....got res', res);
        for (var r=0; r<res.length; r++) {
            results.push(res[r]);
        }
    });
    console.log(' <--- Returning with results', results);
    return results;
}


function Grid() {
    // start with single cell of 2D grid
    var cell = this.getEmptyCell();
    this.grid = [[cell]];
}

Grid.prototype.clone = function() {
    var g = new Grid();
    g.grid = this.grid.map(function(row){
        return row.map(function(cell){return cell});
    })
    return g;
}

Grid.prototype.getEmptyCell = function() {
    return "";
}

Grid.prototype.createTile = function(id) {
    // Tile is simply a string
    return id
}

Grid.prototype.prependColumn = function() {
    var newGrid = this.grid.map(function(row){
        var cell = this.getEmptyCell();
        row.splice(0, 0, cell);
        return row;
    }.bind(this));
    this.grid = newGrid;
};

Grid.prototype.appendColumn = function() {
    var newGrid = this.grid.map(function(row){
        var cell = this.getEmptyCell();
        row.push(cell);
        return row;
    }.bind(this));
    this.grid = newGrid;
};

Grid.prototype.prependRow = function() {
    // assume all rows are same length - add another row same length
    var newRow = [];
    for (var c=0; c<this.grid[0].length; c++) {
        newRow.push(this.getEmptyCell());
    }
    this.grid.splice(0, 0, newRow);
};

Grid.prototype.appendRow = function() {
    // assume all rows are same length - add another row same length
    var newRow = [];
    for (var c=0; c<this.grid[0].length; c++) {
        newRow.push(this.getEmptyCell());
    }
    this.grid.push(newRow);
};

Grid.prototype.addTile = function(id, row, column) {
    if (row < 0) {
        this.prependRow();
        row = 0;
    } else if (row >= this.grid.length) {
        this.appendRow();
    }
    if (column < 0) {
        this.prependColumn();
        column = 0;
    } else if (column >= this.grid[0].length) {
        this.appendColumn();
    }
    this.grid[row][column] = this.createTile(id);
    return [row, column];
};

Grid.prototype.addTiles = function(tiles) {
    // iterate through tiles and find how much we need to expand grid
    var currentRowCount = this.grid.length;
    var currentColumnCount = this.grid[0].length;
    var minCol = tiles.reduce(function(prev, t){
        return Math.min(t.column, prev);
    }, 0);
    var maxCol = tiles.reduce(function(prev, t){
        return Math.max(t.column + 1, prev);
    }, currentColumnCount);
    var minRow = tiles.reduce(function(prev, t){
        return Math.min(t.row, prev);
    }, 0);
    var maxRow = tiles.reduce(function(prev, t){
        return Math.max(t.row + 1, prev);
    }, currentRowCount);
    var colsToPrepend = 0 - minCol;
    var colsToAppend = maxCol - currentColumnCount;
    var rowsToPrepend = 0 - minRow;
    var rowsToAppend = maxRow - currentRowCount;


    for (var i=0; i< colsToPrepend; i++) {
        this.prependColumn();
    }
    for (var i=0; i< colsToAppend; i++) {
        this.appendColumn();
    }
    for (var i=0; i< rowsToPrepend; i++) {
        this.prependRow();
    }
    for (var i=0; i< rowsToAppend; i++) {
        this.appendRow();
    }
    // now, as we add tiles, we take account of newly added cols/rows
    tiles.forEach(function(tile){
        var column = tile.column + colsToPrepend;
        var row = tile.row + rowsToPrepend;
        this.addTile(tile.id, row, column);
    }.bind(this))
};

Grid.prototype.sameLetter = function(id1, id2) {
    // 'a1' === 'a2'
    if (!id1 || !id2) return false;
    return id1[0] === id2[0];
}

Grid.prototype.sameNumber = function(id1, id2) {
    // 'a1' === 'b1'
    if (!id1 || !id2) return false;
    return id1[1] === id2[1];
}

Grid.prototype.validNeighbour = function(cellId, neighbourId) {
    // empty neighbour is OK
    if (neighbourId == '') return true;
    // identical (duplicate) is not allowed
    if (cellId == neighbourId) return false;
    // But must match letter OR number
    return (cellId[0] === neighbourId[0] || cellId[1] == neighbourId[1])
}

Grid.prototype.getTileAt = function(row, column) {
    if (row < 0 || column < 0 || (row + 1) > this.grid.length || (column + 1) > this.grid[0].length) {
        return "";
    }
    return this.grid[row][column];
}

Grid.prototype.getRowAndColumnTilesFrom = function(row, column) {

    var r = this.getRowAndColumnTilesAndCoordsFrom(row, column);
    var rowTiles = r[0];
    var columnTiles = r[1];
    rowTiles = rowTiles.map(function(t){return t.id});
    columnTiles = columnTiles.map(function(t){return t.id});
    return [rowTiles, columnTiles];
}

Grid.prototype.getRowAndColumnTilesAndCoordsFrom = function(row, column) {
    var tile;
    // get row tiles
    var rowTiles = [];
    var columnTiles = [];
    // check to left...
    var r = row, c = column;
    while(tile != '') {
        c = c - 1;
        tile = this.getTileAt(r, c);
        if (tile != '') {
            rowTiles.push({id:tile, row:r, column:c});
        }
    }
    // check to right...
    r = row;
    c = column;
    tile = 'start again'
    while(tile != '') {
        c = c + 1;
        tile = this.getTileAt(r, c);
        if (tile != '') {
            rowTiles.push({id:tile, row:r, column:c});
        }
    }
    // check up...
    r = row;
    c = column;
    tile = 'start again'
    while(tile != '') {
        r = r - 1;
        tile = this.getTileAt(r, c);
        if (tile != '') {
            columnTiles.push({id:tile, row:r, column:c});
        }
    }
    // check down...
    r = row;
    c = column;
    tile = 'start again'
    while(tile != '') {
        r = r + 1;
        tile = this.getTileAt(r, c);
        if (tile != '') {
            columnTiles.push({id:tile, row:r, column:c});
        }
    }
    return [rowTiles, columnTiles];
}

Grid.prototype.isValidSequence = function(tiles) {
    // tiles in a row or column must all be different,
    // but must all share same letter OR number
    var valid = tiles.reduce(function(prev, tile, index, sequence){
        // if first index of tile is current index, we've not seen it before
        var notDuplicate = sequence.indexOf(tile) == index;
        return (prev && notDuplicate);
    }, true);

    if (!valid) {
        return false;
    }

    var letterCount = tiles.reduce(function(prev, tile){
        if (prev == tile[0]) return prev;
        return prev + tile[0];
    }, tiles[0][0]);
    var numberCount = tiles.reduce(function(prev, tile){
        if (prev == tile[1]) return prev;
        return prev + tile[1];
    }, tiles[0][1])

    return ((letterCount.length == 1) || (numberCount.length == 1));
}

Grid.prototype.findEmptyPlace = function(startRow, startColumn, rowIncrement, columnIncrement) {
    // Find first space with no tile
    var r = startRow + rowIncrement;
    var c = startColumn + columnIncrement;
    var tile = this.getTileAt(r, c);
    while (tile != "") {
        r = r + rowIncrement;
        c = c + columnIncrement;
        tile = this.getTileAt(r, c);
    }
    return [r, c]
}

Grid.prototype.getTileGroups = function(sequence) {
    // Given a bunch of tiles, e.g. "a1", "a2", "b2", "c3"
    // will return ["a1", "a2"], ["a2", "b2"], ["c3"]

    var results = [];
    // single letters or numbers that we've used to group-by already
    var groupBy = [];
    // for each item in sequence, look for following items that match
    for (var i=0; i<sequence.length; i++) {
        var item = sequence[i];
        // try to make a list of matching letters from remaining items
        sameLetters = sequence.slice(i + 1).filter(function(tile){
            return (groupBy.indexOf(tile[0]) === -1 && tile[0] === item[0]);
        });
        sameNumbers = sequence.slice(i + 1).filter(function(tile){
            return (groupBy.indexOf(tile[1]) === -1 && tile[1] === item[1]);
        });
        // No matches - add item on it's own.
        if (sameNumbers.length == 0 && sameLetters.length == 0) {
            if (groupBy.indexOf(item[0]) === -1 && groupBy.indexOf(item[1]) === -1) {
                results.push([item]);
            }
        }
        // Otherwise, add extended sequences...
        if (sameLetters.length > 0) {
            results.push([item].concat(sameLetters));
            groupBy.push(sameLetters[0][0])
        }
        if (sameNumbers.length > 0) {
            results.push([item].concat(sameNumbers));
            groupBy.push(sameNumbers[0][1])
        }
    }
    return results;
}

Grid.prototype.getAllOrderings = function(sequence) {
    var l = sequence.length;
    // there will be length factorial number of sequences
    
    var results = [[]];
    for (var x=0; x<l; x++){
        var newResults = [];
        for (var s=0; s<l; s++) {
            // for each existing result, clone and add each item (that haven't seen before)
            var item = sequence[s];
            for (var r=0; r< results.length; r++) {
                if (results[r].indexOf(item) < 0) {
                    // clone result for each item we want to add
                    var result = results[r].map(function(i){return i});
                    result.push(item);
                    newResults.push(result);
                }
            }
        }
        results = newResults;    }
    return results;
}

Grid.prototype.isValid = function(tile) {
    // Main method for checking if a tile can go in a position
    var row = tile.row;
    var column = tile.column;
    var id = tile.id;
    // is invalid if cell is filled
    if (this.getTileAt(row, column) != '') {
        return false;
    }

    // if grid is a single empty cell, we can add first tile
    if (this.grid.length == 1 && this.grid[0].length == 1 && row == 0 && column == 0) {
        return true;
    }
    
    var adjacentCoords = [[row-1, column], [row+1, column], [row, column+1], [row, column-1]];
    var adjacentTiles = adjacentCoords.map(function(coords){
        return this.getTileAt(coords[0], coords[1]);
    }.bind(this));
    // ignore empty tiles
    adjacentTiles = adjacentTiles.filter(function(tile){
        return tile !== "";
    });

    // Need at least one adjacent tile
    if (adjacentTiles.length == 0) {
        return false;
    }

    // Need at for any new columns or rows created to be valid
    var rc = this.getRowAndColumnTilesFrom(row, column);
    var rowTiles = rc[0];
    var columnTiles = rc[1];
    rowTiles.push(id);
    columnTiles.push(id);
    return (this.isValidSequence(rowTiles) && this.isValidSequence(columnTiles));
}

Grid.prototype.getValidPlaces = function(tile, restrictTo) {
    var places = [];
    var row, column;
    if (!restrictTo) {
        restrictTo = [];
        for (row=-1; row<=this.grid.length; row++) {
            for (column=-1; column<=this.grid[0].length; column++) {
                restrictTo.push([row, column]);
            }
        }
    }
    for (var c=0; c<restrictTo.length; c++) {
        var coords = restrictTo[c];
        row = coords[0];
        column = coords[1];
        if (this.isValid({'id': tile, 'row': row, 'column': column})) {
            places.push({'id': tile, 'row': row, 'column': column});
        }
    }
    return places;
}

Grid.prototype.isColumn = function(tiles) {
    // true if all tiles are in same Column
    var allColumnsSame = tiles.reduce(function(prev, t, idx, arr){
        if (idx + 1 >= arr.length) {
            // No more tiles to compare
            return prev;
        }
        // True if next column is same as current one
        return prev && t.column === arr[idx + 1].column;
    }, true);
    return allColumnsSame;
}

Grid.prototype.isRow = function(tiles) {
    // true if all tiles are in same Row
    var allRowsSame = tiles.reduce(function(prev, t, idx, arr){
        if (idx + 1 >= arr.length) {
            // No more tiles to compare
            return prev;
        }
        // True if next row is same as current one
        return prev && t.row === arr[idx + 1].row;
    }, true);
    return allRowsSame;
}

Grid.prototype.getScore = function(tiles) {
    // Get the score from the list of tiles when placed in the grid
    // tiles is a list of {id, row, column} objects

    console.log('getScore...', tiles);

    var score;

    // Add tiles to a clone of this Grid before we get score
    // NB: each time row or column is -1 the grid is expanded by prepending rows/columns

    var newTiles = [];

    function incRows() {
        newTiles.forEach(function(t){
            t.row++;
        })
    }
    function incColumns() {
        newTiles.forEach(function(t){
            t.column++;
        })
    }

    var resultGrid = this.clone();
    tiles.forEach(function(t){
      resultGrid.addTile(t.id, t.row, t.column);
      newTiles.push({'id': t.id, 'row': t.row, 'column': t.column});
      // We update newTiles coordinates to match expanded grid
      if (t.row === -1) {
        incRows()
      }
      if (t.column === -1) {
        incColumns();
      }
    });

    console.log('newTiles', newTiles);

    if (this.isColumn(newTiles)) {
        // Get score for Column...
        var t = newTiles[0];
        var columnTiles = resultGrid.getRowAndColumnTilesFrom(t.row, t.column)[1];
        score = 0;
        if (columnTiles.length > 0) {
            // Adding a single tile to a row, isColumn() is true but columnTiles.length is 0
            score = columnTiles.length + 1;     // include the tile itself
        }

        // Get score for all Rows...
        newTiles.forEach(function(t){
            var rowTiles = resultGrid.getRowAndColumnTilesFrom(t.row, t.column)[0];
            if (rowTiles.length > 0) {
                score += (rowTiles.length + 1);
            }
        }.bind(resultGrid));

    } else if (this.isRow(newTiles)) {
        // Get score for Row...
        var t = newTiles[0];
        var rowTiles = resultGrid.getRowAndColumnTilesFrom(t.row, t.column)[0];
        score = rowTiles.length + 1;     // include the tile itself

        // Get score for all Columns...
        newTiles.forEach(function(t){
            var columnTiles = resultGrid.getRowAndColumnTilesFrom(t.row, t.column)[1];
            if (columnTiles.length > 0) {
                score += (columnTiles.length + 1);
            }
        }.bind(resultGrid));
    }
    return score;
}

