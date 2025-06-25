// const gBoard = []

// const gGame = {
//     isOn: false,
//     revealedCount: 0,
//     markedCount: 0,
//     secsPassed: 0,
// }

// const gLevel = {
//     SIZE: 0,
//     MINES: 0,
// }

var cell = {
    minesAroundCount: 0,
    isRevealed: false,
    isMine: false,
    isMarked: false,
}

'use strict'

const FLAG_IMG = '<img src="media/bomb.svg">'
const MINE_IMG = '<img src="media/nuclear-explosion.svg" width="30" height="30">'



// Model:
var gBoard

var gGame

var gLevel = {
    SIZE: 4,
    MINES: 2,
}



function getLevel(btn) {
    gLevel.SIZE = btn.id
    renderBoard(buildBoard())
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = cell
        }
    }
    setMinesNegsCount(board)
    return board
}

function setMines(board) {
    if (i % 2 === 0) {
        board[i][j].isMine = true
    }
}

function setMinesNegsCount(board) {
    board[0][0].isMine = true
    board[0][1].isMine = true
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = board[i][j]
            if (currCell.isMine) {
                strHTML += `<td class="cell mine" onclick="onCellClicked(this)">${MINE_IMG}</td>`
            } else {
                strHTML += `<td class="cell mine" onclick="onCellClicked(this)">◼️</td>`
            }
        }
        strHTML += `</tr>`
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function onInit() {
    hideElement('.victory')
}

function hideElement(className) {
    const element = document.querySelector(className)
    element.style.display = 'none'

}

// function restartCells
hideElement('.victory')


// function createCellsIds() {
//     gCellsIDs = []
//     for (var i = 0; i < gLevel.SIZE**2; i++) {
//         gCellsIDs.push(i)
//     }    
//     console.log(`id's:`, gCellsIDs)
// }


// createCellsIds()

function onCellClicked(cell) {
    const element = document.querySelector(cell)
    console.log(element)
}

renderBoard(buildBoard())