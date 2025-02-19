
var config = {
    draggable: true,
    position: 'start',
    dropOffBoard: 'snapback',
    sparePieces: true,
    pieceTheme: 'chessboard/img/chesspieces/wikipedia/{piece}.png',
    snapSpeed: 100,
  }  

  var board = Chessboard('chessboard', config);

    document.getElementById('flipBoard').addEventListener('click', function () {
        board.flip();
    });

    document.getElementById('resetBoard').addEventListener('click', function () {
        board.start();
    });

    document.getElementById('clearBoard').addEventListener('click', function () {
        board.clear();
    });