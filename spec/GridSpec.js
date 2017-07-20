describe("Grid", function() {
  var grid;

  beforeEach(function() {
    grid = new Grid();
  });

  it("should be able to prepend a column to empty grid", function() {
    grid.appendColumn();
    expect(grid.grid).toEqual([['', '']]);

    //demonstrates use of custom matcher
    // expect(player).toBePlaying(song);
  });

  it("should be able to prepend a row to empty grid", function() {
    grid.appendRow();
    expect(grid.grid).toEqual([[''], ['']]);
  });

  it("should be able to add rows then columns", function() {
    grid.appendRow();
    grid.appendRow();
    grid.appendColumn();
    expect(grid.grid).toEqual([['', ''], ['', ''], ['', '']]);
  });

  it("should be able to add columns then rows", function() {
    grid.appendColumn();
    grid.appendColumn();
    grid.appendRow();
    expect(grid.grid).toEqual([['', '', ''], ['', '', '']]);
  });

  it("should be able to add tiles to existing cells", function() {
    // we have a single cell grid already
    grid.addTile('a1', 0, 0)
    expect(grid.grid).toEqual([['a1']]);
  });

  it("should be able to add single tile to expand grid", function() {
    // add a single tile outside grid
    var coords = grid.addTile('a1', -1, -1)
    // returns coords added at
    expect(coords).toEqual([0, 0])
    expect(grid.grid).toEqual([['a1', ''], ['', '']]);
  });

  it("should be able to expand grid when adding tiles", function() {
    // we have a single cell grid already
    // Add a row to columns *off grid* to left
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': -2}, {'id': 'b2', 'row': 0, 'column': -1}])
    expect(grid.grid).toEqual([['a1', 'b2', '']]);

    // Add a column to expand rows
    grid.addTiles([{'id': 'c1', 'row': -1, 'column': 2},
                   {'id': 'd1', 'row': 0, 'column': 2},
                   {'id': 'e1', 'row': 1, 'column': 2}])
    expect(grid.grid).toEqual([
        ['',   '',   'c1'],
        ['a1', 'b2', 'd1'],
        ['',   '',   'e1']
      ]);

    // Add tiles to expand rows and cols
    grid.addTiles([{'id': 'c2', 'row': -1, 'column': 0},
                   {'id': 'd2', 'row': -1, 'column': -1},
                   {'id': 'e2', 'row': 2, 'column': 1}])
    expect(grid.grid).toEqual([
        ['d2', 'c2', '',   ''],
        ['',   '',   '',   'c1'],
        ['',   'a1', 'b2', 'd1'],
        ['',   '',   'e2', 'e1']
      ]);
  });

  it("should be valid to add first tile to empty grid", function() {
    expect(grid.isValid({'id': 'b2', 'row': 0, 'column': 0})).toEqual(true);
  });

  it("should be able to expand grid with gaps when adding tiles", function() {
    // we have a single cell grid already
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 2}])
    expect(grid.grid).toEqual([['', '', 'a1']]);
  });

  it("should be invalid to add clashing tiles", function() {
    // setup grid with single tile
    grid.addTile('a1', 0, 0)

    // Invalid if tile is already filled
    expect(grid.isValid({'id': 'a1', 'row': 0, 'column': 0})).toEqual(false);

    // adjacent clashing tiles invalid
    expect(grid.isValid({'id': 'b2', 'row': 1, 'column': 0})).toEqual(false);
    expect(grid.isValid({'id': 'b2', 'row': -1, 'column': 0})).toEqual(false);
    expect(grid.isValid({'id': 'b2', 'row': 0, 'column': 1})).toEqual(false);
    expect(grid.isValid({'id': 'b2', 'row': 0, 'column': -1})).toEqual(false);
  });

  it("should be invalid to add tile with no neighbouring tiles", function() {
    // start with empty grid
    // expect(grid.isValid({'id': 'a1', 'row': 0, 'column': 0})).toEqual(false);

    // create empty row with tile at end
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 2}])
    // Valid if beside compatible tile
    expect(grid.isValid({'id': 'a2', 'row': 0, 'column': 1})).toEqual(true);
    // Invalid if tile has no neighbours
    expect(grid.isValid({'id': 'a2', 'row': 0, 'column': 0})).toEqual(false);
  });

  it("should be valid to add beside single matching tile", function() {
    // setup grid with single tile
    grid.addTile('a1', 0, 0)

    // adjacent matching tiles valid
    expect(grid.isValid({'id': 'b1', 'row': 1, 'column': 0})).toEqual(true);
    expect(grid.isValid({'id': 'b1', 'row': -1, 'column': 0})).toEqual(true);
    expect(grid.isValid({'id': 'a2', 'row': 0, 'column': 1})).toEqual(true);
    expect(grid.isValid({'id': 'a2', 'row': 0, 'column': -1})).toEqual(true);
  });

  it("should be possible to get contiguous rows", function() {
    // populate grid
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 0},
                   {'id': 'a2', 'row': 0, 'column': 1},
                   {'id': 'c1', 'row': 1, 'column': 3},
                   {'id': 'd1', 'row': 2, 'column': 1},
                   {'id': 'd2', 'row': 2, 'column': 2},
                   {'id': 'd3', 'row': 2, 'column': 3},
                   {'id': 'e1', 'row': 3, 'column': 2},
                   {'id': 'e2', 'row': 3, 'column': 3}])
    expect(grid.grid).toEqual([
        ['a1', 'a2', '',   ''],
        ['',   '',   '',   'c1'],
        ['',   'd1', 'd2', 'd3'],
        ['',   '',   'e1', 'e2']
      ]);

    expect(grid.getRowAndColumnTilesFrom(0, 0)).toEqual([['a2'], []]);
    expect(grid.getRowAndColumnTilesFrom(0, 1)).toEqual([['a1'], []]);
    expect(grid.getRowAndColumnTilesFrom(1, 3)).toEqual([[], ['d3', 'e2']]);
    expect(grid.getRowAndColumnTilesFrom(2, 1)).toEqual([['d2', 'd3'], []]);
    expect(grid.getRowAndColumnTilesFrom(2, 2)).toEqual([['d1', 'd3'], ['e1']]);
    expect(grid.getRowAndColumnTilesFrom(2, 3)).toEqual([['d2', 'd1'], ['c1', 'e2']]);
    expect(grid.getRowAndColumnTilesFrom(3, 2)).toEqual([['e2'], ['d2']]);
  });


  it("should be invalid to add tile if duplicate", function() {
    // populate grid
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 0},
                   {'id': 'a2', 'row': 0, 'column': 1},
                   {'id': 'c1', 'row': 1, 'column': 3},
                   {'id': 'd1', 'row': 2, 'column': 1},
                   {'id': 'd2', 'row': 2, 'column': 2},
                   {'id': 'd3', 'row': 2, 'column': 3},
                   {'id': 'a2', 'row': 3, 'column': 1},
                   {'id': 'e1', 'row': 3, 'column': 2},
                   {'id': 'e2', 'row': 3, 'column': 3}])
    expect(grid.grid).toEqual([
        ['a1', 'a2', '',   ''],
        ['',   '',   '',   'c1'],
        ['',   'd1', 'd2', 'd3'],
        ['',   'a2', 'e1', 'e2']
      ]);

    // duplicates are invalid
    expect(grid.isValid({'id': 'a1', 'row': 0, 'column': 2})).toEqual(false);
    expect(grid.isValid({'id': 'd2', 'row': 2, 'column': 0})).toEqual(false);
    expect(grid.isValid({'id': 'd2', 'row': 1, 'column': 1})).toEqual(false);
  });

  it("should be invalid to add tile if shape or color invalid", function() {
    // populate grid
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 0},
                   {'id': 'a2', 'row': 0, 'column': 1},
                   {'id': 'c1', 'row': 1, 'column': 3},
                   {'id': 'd1', 'row': 2, 'column': 1},
                   {'id': 'd2', 'row': 2, 'column': 2},
                   {'id': 'd3', 'row': 2, 'column': 3},
                   {'id': 'a2', 'row': 3, 'column': 1},
                   {'id': 'e1', 'row': 3, 'column': 2},
                   {'id': 'e2', 'row': 3, 'column': 3}])
    expect(grid.grid).toEqual([
        ['a1', 'a2', '',   ''],
        ['',   '',   '',   'c1'],
        ['',   'd1', 'd2', 'd3'],
        ['',   'a2', 'e1', 'e2']
      ]);

    // Invalid if row has more than 1 letter OR more than 1 number
    expect(grid.isValid({'id': 'a1', 'row': 0, 'column': 2})).toEqual(false);
    expect(grid.isValid({'id': 'd2', 'row': 2, 'column': 0})).toEqual(false);
    expect(grid.isValid({'id': 'd2', 'row': 1, 'column': 1})).toEqual(false);
  });

  it("should be possible to clone a grid", function() {
    // populate grid
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 0},
                   {'id': 'a2', 'row': 0, 'column': 1},
                   {'id': 'c1', 'row': 1, 'column': 3}])
    expect(grid.grid).toEqual([
        ['a1', 'a2', '',   ''],
        ['',   '',   '',   'c1']
      ]);

    var newGrid = grid.clone();
    expect(grid.grid).toEqual(newGrid.grid);
  });

  it("should be possible to get valid places for a tile", function() {
    // populate grid
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 0},
                   {'id': 'a2', 'row': 0, 'column': 1},
                   {'id': 'c3', 'row': 1, 'column': 3}])
    expect(grid.grid).toEqual([
        ['a1', 'a2', '',   ''],
        ['',   '',   '',   'c3']
      ]);

    expect(grid.getValidPlaces('a1')).toEqual([
      {'id': 'a1', 'row': -1, 'column': 1},
      {'id': 'a1', 'row': 1, 'column': 1}
    ]);
  });

  it("should be possible to restrict valid places by row or column", function() {
    // populate grid
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 0},
                   {'id': 'a2', 'row': 0, 'column': 1},
                   {'id': 'c3', 'row': 1, 'column': 3}])
    expect(grid.grid).toEqual([
        ['a1', 'a2', '',   ''],
        ['',   '',   '',   'c3']
      ]);

    expect(grid.getValidPlaces('a1', [[1, 1]])).toEqual([
      {'id': 'a1', 'row': 1, 'column': 1}
    ]);
    expect(grid.getValidPlaces('a1', [[-1, 1], [0, 0]])).toEqual([
      {'id': 'a1', 'row': -1, 'column': 1}
    ]);
    expect(grid.getValidPlaces('a1', [[1, 2]])).toEqual([]);
  });

  it("should be possible to find next empty place", function() {
    // populate grid
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 0},
                   {'id': 'a2', 'row': 0, 'column': 1},
                   {'id': 'c3', 'row': 1, 'column': 3}])
    expect(grid.grid).toEqual([
        ['a1', 'a2', '',   ''],
        ['',   '',   '',   'c3']
      ]);

    expect(grid.findEmptyPlace(0, 0, 0, 1)).toEqual([0, 2]);
    expect(grid.findEmptyPlace(0, 0, 1, 0)).toEqual([1, 0]);
    expect(grid.findEmptyPlace(0, 2, 0, -1)).toEqual([0, -1]);
    expect(grid.findEmptyPlace(0, 2, -1, 0)).toEqual([-1, 2]);
  });

  it("should return empty list when no possible results", function() {
    // populate grid
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 0},
                   {'id': 'a2', 'row': 0, 'column': 1},
                   {'id': 'b2', 'row': 1, 'column': 1},
                   {'id': 'c3', 'row': 1, 'column': 3}])
    expect(grid.grid).toEqual([
        ['a1', 'a2', '',   ''],
        ['',   'b2',   '',   'c3']
      ]);

    expect(tryTiles(['a1', 'a3'], grid, undefined, [])).toEqual([[]]);
  });

  it("should be possible to find place for a list of tiles", function() {
    // populate grid
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 0},
                   {'id': 'a2', 'row': 0, 'column': 1},
                   {'id': 'b2', 'row': 1, 'column': 1},
                   {'id': 'b3', 'row': 1, 'column': 2}])
    expect(grid.grid).toEqual([
        ['a1', 'a2', ''],
        ['',   'b2',   'b3']
      ]);

    expect(tryTiles(['b4', 'f6'], grid, undefined, [])).toEqual([
      [{'id': 'b4', 'row': 1, 'column': 3}],
      [{'id': 'b4', 'row': 2, 'column': 2}]
    ]);
  });

  it("should be possible to find places for a list of tiles", function() {
    // populate grid
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 0},
                   {'id': 'a2', 'row': 0, 'column': 1},
                   {'id': 'b2', 'row': 1, 'column': 1},
                   {'id': 'b3', 'row': 1, 'column': 2}])
    expect(grid.grid).toEqual([
        ['a1', 'a2', ''],
        ['',   'b2',   'b3']
      ]);

    expect(tryTiles(['b4', 'b2'], grid, undefined, [])).toEqual([
      [{'id': 'b4', 'row': 1, 'column': 3}, {'id': 'b2', 'row': 0, 'column': 3}],
      [{'id': 'b4', 'row': 1, 'column': 3}, {'id': 'b2', 'row': 2, 'column': 3}],
      [{'id': 'b4', 'row': 2, 'column': 2}, {'id': 'b2', 'row': 3, 'column': 2}],
      [{'id': 'b4', 'row': 2, 'column': 2}, {'id': 'b2', 'row': 2, 'column': 3}]
    ]);
  });

  it("should be possible to find places for a list of tiles, ignore duplicates", function() {
    // populate grid
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 0},
                   {'id': 'a2', 'row': 0, 'column': 1},
                   {'id': 'b2', 'row': 1, 'column': 1},
                   {'id': 'b3', 'row': 1, 'column': 2}])
    expect(grid.grid).toEqual([
        ['a1', 'a2', ''],
        ['',   'b2',   'b3']
      ]);

    expect(tryTiles(['b4', 'b4'], grid, undefined, [])).toEqual([
      [{'id': 'b4', 'row': 1, 'column': 3}],
      [{'id': 'b4', 'row': 2, 'column': 2}]
    ]);
  });


  it("should be possible to get All Orderings of a list", function() {    
    expect(grid.getAllOrderings(['a', 'b', 'c'])).toEqual([
        ['c', 'b', 'a'],
        ['b', 'c', 'a'],
        ['c', 'a', 'b'],
        ['a', 'c', 'b'],
        ['b', 'a', 'c'],
        ['a', 'b', 'c']
      ]);

    var results = grid.getAllOrderings(['a', 'b', 'c', 'd', 'e', 'f']);
    expect(results.length).toEqual(720);
  });


  it("should be possible to get All Groupings of a list of tiles", function() {    
    expect(grid.getTileGroups(['a1', 'a2', 'b2', 'c3'])).toEqual([
      ['a1', 'a2'],
      ['a2', 'b2'],
      ['c3']
    ]);

    expect(grid.getTileGroups(['a1', 'f6', 'a2', 'b2', 'c3', 'a6'])).toEqual([
      [ 'a1', 'a2', 'a6' ],
      [ 'f6', 'a6' ],
      [ 'a2', 'b2' ],
      [ 'c3' ],
    ]);
  });


  it("should be possible to tell if list of tiles is a Row or Column", function() {
    expect(grid.isRow([{'row': 1}, {'row': 1}])).toBeTruthy();
    expect(grid.isRow([{'row': 1}, {'row': 1}, {'row': 2}])).toBeFalsy();
    expect(grid.isRow([{'row': 1}])).toBeTruthy();

    expect(grid.isColumn([{'column': 0}, {'column': 0}])).toBeTruthy();
    expect(grid.isColumn([{'column': 0}, {'column': 1}, {'column': 2}])).toBeFalsy();
    expect(grid.isColumn([{'column': 0}])).toBeTruthy();
  });


  it("should be possible to get a Score for a list of tiles", function() {
    // populate grid
    grid.addTiles([{'id': 'a1', 'row': 0, 'column': 0},
                   {'id': 'a2', 'row': 0, 'column': 1},
                   {'id': 'b2', 'row': 1, 'column': 1},
                   {'id': 'b3', 'row': 1, 'column': 2}])
    expect(grid.grid).toEqual([
        ['a1', 'a2', ''],
        ['',   'b2',   'b3']
      ]);

    // Test above checks that this is one of the valid results for this grid...
    var tests = [
        [],
        [{'id': 'b4', 'row': 1, 'column': 3}, {'id': 'b2', 'row': 0, 'column': 3}],
        [{'id': 'b4', 'row': 1, 'column': 3}, {'id': 'b2', 'row': 2, 'column': 3}],
        [{'id': 'b4', 'row': 2, 'column': 2}, {'id': 'b2', 'row': 3, 'column': 2}],
        [{'id': 'b4', 'row': 2, 'column': 2}, {'id': 'b2', 'row': 2, 'column': 3}],
        [{'id': 'b4', 'row': 2, 'column': 2}],
        // Adding tiles with row/column of -1 expands grid each time...
        [{'id': 'a3', 'row': 0, 'column': -1}],
        [{'id': 'a3', 'row': 0, 'column': -1}, {'id': 'a4', 'row': 0, 'column': -1}],
        [{'id': 'a3', 'row': 0, 'column': -1}, {'id': 'a4', 'row': -1, 'column': 0}],
        [{'id': 'a3', 'row': 0, 'column': -1}, {'id': 'a4', 'row': -1, 'column': 0}, {'id': 'a5', 'row': -1, 'column': 0}],
    ]

    var results = [0, 5, 5, 3, 4, 2, 3, 4, 5, 6];

    tests.forEach(function(tiles, idx){
      console.log('idx', idx);
      expect(grid.getScore(tiles)).toEqual(results[idx]);
    });
  });

  // describe("when song has been paused", function() {
  //   beforeEach(function() {
  //     player.play(song);
  //     player.pause();
  //   });

  //   it("should indicate that the song is currently paused", function() {
  //     expect(player.isPlaying).toBeFalsy();

  //     // demonstrates use of 'not' with a custom matcher
  //     expect(player).not.toBePlaying(song);
  //   });

  //   it("should be possible to resume", function() {
  //     player.resume();
  //     expect(player.isPlaying).toBeTruthy();
  //     expect(player.currentlyPlayingSong).toEqual(song);
  //   });
  // });

  // // demonstrates use of spies to intercept and test method calls
  // it("tells the current song if the user has made it a favorite", function() {
  //   spyOn(song, 'persistFavoriteStatus');

  //   player.play(song);
  //   player.makeFavorite();

  //   expect(song.persistFavoriteStatus).toHaveBeenCalledWith(true);
  // });

  // //demonstrates use of expected exceptions
  // describe("#resume", function() {
  //   it("should throw an exception if song is already playing", function() {
  //     player.play(song);

  //     expect(function() {
  //       player.resume();
  //     }).toThrowError("song is already playing");
  //   });
  // });
});
