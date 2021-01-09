const checkResult = (squares, step, boardSize, playerMove) => {
    if (step[0] === null && step[1] === null) return null

    let matrix = new Array(boardSize).fill(null)
    for (let i = 0; i < matrix.length; i++) {
        matrix[i] = new Array(boardSize).fill(null)
    }

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            matrix[i][j] = squares[i * boardSize + j]
        }
    }

    let row = step[0]
    let column = step[1]

    let winState = (boardSize < 5) ? 3 : 5

    // check row
    let line=[step[0] * boardSize + step[1]]
    let countLeft = 0;
    let countRight = 0;
    for (let i = column - 1; i >= 0; i--) {
        if (matrix[row][i] === playerMove) {
            countLeft++;
            line.push(row*boardSize+i)
        } else break;
    }
    for (let i = column + 1; i < boardSize; i++) {
        if (matrix[row][i] === playerMove) {
            countRight++;
            line.push(row*boardSize+i)
        } else break;
    }
    if (countLeft + countRight >= winState - 1)
        return {
            line: line,
            status: playerMove
        };

    //check column
    line=[step[0] * boardSize + step[1]]
    countLeft = 0;
    countRight = 0;
    for (let i = row - 1; i >= 0; i--) {
        if (matrix[i][column] === playerMove) {
            countLeft++;
            line.push(i*boardSize+column)
        } else break;
    }
    for (let i = row + 1; i < boardSize; i++) {
        if (matrix[i][column] === playerMove) {
            countRight++;
            line.push(i*boardSize+column)
        } else break;
    }
    if (countLeft + countRight >= winState - 1)
        return {
            line: line,
            status: playerMove
        };

    //check diag
    line=[step[0] * boardSize + step[1]]
    countLeft = 0;
    countRight = 0;
    let i = row - 1;
    let j = column - 1;
    while (i >= 0 && j >= 0) {
        if (matrix[i][j] === playerMove) {
            countLeft++;
            line.push(i*boardSize+j)
        } else break;
        i--;
        j--;
    }
    i = row + 1;
    j = column + 1;
    while (i < boardSize && j < boardSize) {
        if (matrix[i][j] === playerMove) {
            countRight++;
            line.push(i*boardSize+j)
        } else break;
        i++;
        j++;
    }
    if (countLeft + countRight >= winState - 1)
        return {
            line: line,
            status: playerMove
        };

    //check anti diag
    line=[step[0] * boardSize + step[1]]
    countLeft = 0;
    countRight = 0;
    i = row + 1;
    j = column - 1;
    while (i < boardSize && j >= 0) {
        if (matrix[i][j] === playerMove) {
            countLeft++;
            line.push(i*boardSize+j)
        } else break;
        i++;
        j--;
    }
    i = row - 1;
    j = column + 1;
    while (i >= 0 && j < boardSize) {
        if (matrix[i][j] === playerMove) {
            countRight++;
            line.push(i*boardSize+j)
        } else break;
        i--;
        j++;
    }
    if (countLeft + countRight >= winState - 1)
        return {
            line: line,
            status: playerMove
        };
    for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null)
            return null
    }
    return {
        line: [],
        status: 'draw'
    }
}

module.exports = checkResult
