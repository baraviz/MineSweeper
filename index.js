

'use strict'

const CELL_OVERLAY = '<img src="media/rectangle-arrow.svg" class="cell-overlay">'
const FLAG_IMG = '<img src="media/finish.svg" class="flag-icon">'
const MINE_IMG = '<span class="cell-content">💣</span>'


const gLevels = [
    { SIZE: 4, MINES: 2, },
    { SIZE: 8, MINES: 14, },
    { SIZE: 12, MINES: 32, LIVES: 3 },
]

const gGame = {
    isOn: false,
    revealedCount: 0,
    markedCount: 0,
    secsPassed: 0,
    correctMarks: 0,
    correctReveals: 0,
}


// Model:
var gBoard
var gLevel = { SIZE: 4, MINES: 2, }
var gStartTime
var gTimerInterval
var gRemainFlags

function smiley(btn) {
    btn.innerText = '😃'
    onInit()
}

function getLevel(btn) {
    gLevel = gLevels[btn.id]
    onInit()
    updateFlagsCount()
    showLives()
}

function buildBoard() {
    const board = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        board[i] = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isRevealed: false,
                isMine: false,
                isMarked: false,
                index: { i: i, j: j },
            }
        }
    }
    // setMines(board)
    // setMinesNegsCount(board)
    gBoard = board
    return board
}

function setMines(gBoard) {
    for (var i = 0; i < gLevel.MINES; i++) {
        gBoard[getRandomInt(0, gLevel.SIZE - 1)][getRandomInt(0, gLevel.SIZE - 1)].isMine = true
    }
}

function getClickedCellIndex(elCell) {
    var currCellIndex = {
        i: parseInt(elCell.dataset.i),
        j: parseInt(elCell.dataset.j)
    }
    return currCellIndex
}

function setMinesNegsCount(gBoard) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            if (!gBoard[i][j].isMine) continue
            for (var x = i - 1; x <= i + 1; x++) {
                for (var y = j - 1; y <= j + 1; y++) {
                    if (x < 0 || x >= gLevel.SIZE || y < 0 || y >= gLevel.SIZE) continue
                    if (x === i && y === j) continue
                    gBoard[x][y].minesAroundCount++
                }
            }
        }
    }
}

function renderBoard(gBoard) {
    var strHTML = ''
    for (var i = 0; i < gLevel.SIZE; i++) {
        strHTML += `<tr>`
        for (var j = 0; j < gLevel.SIZE; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine) {
                strHTML += `<td data-i="${i}" data-j="${j}" class="cell mine" onclick="onCellClicked(this)" oncontextmenu="onCellRightClicked(event, this)">${MINE_IMG}${CELL_OVERLAY}</td>`
            } else if (currCell.minesAroundCount > 0) {
                strHTML += `<td data-i="${i}" data-j="${j}" class="cell count" onclick="onCellClicked(this)" oncontextmenu="onCellRightClicked(event, this)">${currCell.minesAroundCount}${CELL_OVERLAY}</td>`
            } else {
                strHTML += `<td data-i="${i}" data-j="${j}" class="cell empty" onclick="onCellClicked(this)" oncontextmenu="onCellRightClicked(event, this)">◻️${CELL_OVERLAY}</td>`

            }
        }
        strHTML += `</tr>`
    }
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
    console.table(gBoard)
}

function onInit() {
    stopTimer()
    gGame.isOn = false
    gGame.revealedCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gGame.correctMarks = 0
    gGame.correctReveals = 0
    document.querySelector('.timer span').innerText = '0'
    hideElement('.victory')
    hideElement('.game-over')
    buildBoard()
    renderBoard(gBoard)
    gRemainFlags = gLevel.MINES - gGame.markedCount
    // console.log('gRemainFlags', gRemainFlags)
}

function hideElement(className) {
    const element = document.querySelector(className)
    element.classList.add('hide')
}

function showElement(className) {
    const element = document.querySelector(className)
    element.classList.remove('hide')
}

function onCellClicked(elCell) {
    if (gGame.isOn) return
    handleFirstClick(elCell)
    revealCell(elCell)
}

function handleFirstClick(elCell) {
    if (gGame.revealedCount === 0) {
        setMines(gBoard)
        setMinesNegsCount(gBoard)
        renderBoard(gBoard)
        srartTimer()
        const currCellIndex = getClickedCellIndex(elCell)
        elCell = document.querySelector(`[data-i="${currCellIndex.i}"][data-j="${currCellIndex.j}"]`)
        revealCell(elCell)
    }
}

function revealCell(elCell) {
    if (elCell.querySelector('.cell-overlay')) {    // so 'revealedCount++' only if its not opened already
        if (!elCell.querySelector('.flag-icon'))    // so 'revealedCount++' only if its isn't flagged
            gGame.revealedCount++
        checkVictory()
    }
    console.log('revealedCount', gGame.revealedCount)
    console.log(elCell)
    const currCellIndex = getClickedCellIndex(elCell)
    const currCell = gBoard[currCellIndex.i][currCellIndex.j]
    const overlay = elCell.querySelector('.cell-overlay')
    console.log('currCell.isMarked? ', currCell.isMarked)
    if (!currCell.isMarked) {       // only if cell isn't flagged
        isMineRevealed(elCell)
        if (overlay) {
            overlay.remove()
            console.log(currCellIndex)
            gBoard[currCellIndex.i][currCellIndex.j].isRevealed = true
            console.log('cell', gBoard[currCellIndex.i][currCellIndex.j])
            isEmptyNegsCells(elCell, currCell, currCellIndex)
        }
    }
}

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min)
    const maxFloored = Math.floor(max)
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
}

function removeFlag(elCell, currCell) {
    // model
    gRemainFlags++
    updateFlagsCount()
    isMineFlagRemoved(elCell)
    // DOM
    const flag = elCell.querySelector("img.flag-icon");
    if (flag) flag.remove()
    console.log("After removal:", elCell.innerHTML);
    elCell.classList.remove('flag')
    currCell.isMarked = !currCell.isMarked
    console.log('isMarked is now', currCell.isMarked)
}

function addFlag(elCell, currCell) {
    // model
    gRemainFlags--
    updateFlagsCount()
    isMineMarked(elCell)
    checkVictory()
    // DOM
    elCell.classList.add('flag')
    elCell.innerHTML += FLAG_IMG
    currCell.isMarked = !currCell.isMarked
    console.log('isMarked is now', currCell.isMarked)
}

function onCellRightClicked(event, elCell) {
    event.preventDefault()
    if (gGame.isOn) return
    console.log(elCell)

    const currCellIndex = getClickedCellIndex(elCell)
    const currCell = gBoard[currCellIndex.i][currCellIndex.j]
    console.log('isRevealed?', currCell.isRevealed)

    if (!currCell.isRevealed) {         // check if cell is'nt clicked
        if (!currCell.isMarked) {       // check if cell is'nt flagged yet
            if (gRemainFlags > 0) {     // check if there is still flags to use
                addFlag(elCell, currCell)
            }

        } else {                       // if cell has been flagged already
            removeFlag(elCell, currCell)
        }
    }
}

function isMineRevealed(elCell) {
    const currCellIndex = getClickedCellIndex(elCell)
    const currCell = gBoard[currCellIndex.i][currCellIndex.j]
    const mineNodeList = document.querySelectorAll(".mine")
    console.log('mineNodeList: ', mineNodeList)
    if (currCell.isMine) {
        if (gLevel.LIVES) {
            isStillLives()
        } else {
            gameOver()
            showAllMines(elCell, mineNodeList)
        }
    }
}

function showLives() {
    const lives = document.querySelector(".lives span")
    const livesComponent = document.querySelector(".lives")
    if (gLevel.LIVES) {
        lives.innerText = `${gLevel.LIVES}`
        livesComponent.classList.remove("hide")
    } else {
        livesComponent.classList.add("hide")
    }
}

function showAllMines(elCell, mineNodeList) {
    for (var i = 0; i < mineNodeList.length; i++) {
        mineNodeList[i].querySelector('.cell-overlay').remove()
        elCell.style.backgroundColor = "red"
    }
}

function isStillLives() {
    gLevel.LIVES--
    showLives()
    console.log('lives left: ', gLevel.LIVES)
    if (gLevel.LIVES < 0) {
        gameOver()
        showAllMines(elCell, mineNodeList)
    }
}

function srartTimer() {
    gStartTime = Date.now()
    gTimerInterval = setInterval(updateTimer, 1000)
}

function updateTimer() {
    const now = Date.now()
    const diff = (now - gStartTime) / 1000
    gGame.secsPassed = Math.floor(diff)
    document.querySelector('.timer span').innerText = gGame.secsPassed

}

function stopTimer() {
    clearInterval(gTimerInterval)
}

function gameOver() {
    const smiley = document.querySelector(".smiley")
    smiley.innerText = '🤯'
    gGame.isOn = true
    stopTimer()
    showElement('.game-over')
    console.log('You loose!')
}

function updateFlagsCount() {
    document.querySelector('.flag-count span').innerText = gRemainFlags
}

function isMineMarked(elCell) {
    if (elCell.classList.contains('mine')) {
        gGame.correctMarks++
        console.log('MinesMarked', gGame.correctMarks)
    }
}

function isMineFlagRemoved(elCell) {
    if (elCell.classList.contains('mine')) {
        gGame.correctMarks--
        console.log('MinesMarked', gGame.correctMarks)
    }
}

function checkVictory() {
    if (gGame.revealedCount === (gLevel.SIZE ** 2) - gLevel.MINES + 1) {
        if (gGame.correctMarks === gLevel.MINES) {
            winGame()
        }
    }

}

function winGame() {
    const smiley = document.querySelector(".smiley")
    smiley.innerText = '😎'

    gGame.isOn = true
    stopTimer()
    showElement('.victory')
    console.log('You Won!')
}

function isEmptyNegsCells(elCell, currCell, currCellIndex) {
    if (elCell.classList.contains(".empty")) {
        for (var q = currCellIndex.i - 1; q < currCellIndex.i + 1; q++) {
            for (var w = currCellIndex.j - 1; w < currCellIndex.j + 1; w++) {
                if (currCell[i][j].classList.contains(".empty")) {
                    revealCell(document.querySelector(`[data-i="${currCellIndex.i}"][data-j="${currCellIndex.j}"]`))
                }
            }
        }
    }
}

// console.log('lives: ', gLevels[2].LIVES)
