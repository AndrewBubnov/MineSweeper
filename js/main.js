function mineSweeper(s) {
    let size = s || 10;
    let announcement = document.querySelector('.announcement');
    let container = document.createElement('div');
    announcement.parentNode.insertBefore(container, announcement.nextSibling);
    container.classList.add('container');
    container.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    container.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    for (let i = 0; i < size * size; i++) {
        let cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = i + "";
        container.appendChild(cell);
    }

    let inputContainer = document.createElement('div');
    inputContainer.id = "inputContainer";
    let inputSize = document.createElement('input');
    inputSize.id = "inputSize";
    let label = document.createElement('p');
    label.innerHTML = "You can change the field side size from 6 to 20 cells";
    container.parentNode.insertBefore(inputContainer, container.nextSibling);
    inputContainer.appendChild(label);
    inputContainer.appendChild(inputSize);

    inputSize.addEventListener('change', function (e) {
        let s = +e.target.value.match(/\d/g).join("");
        if (s < 6) s = 6;
        if (s > 20) s = 20;
        restartGame(s);
    });

    inputSize.addEventListener('keyup', function (e) {
        let number = +e.target.value.match(/\d/g).join("");
        let flag = false;
        if (number > 20) {
            number = 20;
            flag = true;
        }
        label.innerHTML = "The size of field you have selected is <br><span id = 'black'>"
            + number + "&#215;" + number + "</span>";
        if (flag){
            document.querySelector("#black").classList.add('black');
        }
    });


    let commonMinesNumber = Math.floor(size * size / 6);
    let set = new Set;
    let cell = container.getElementsByClassName('cell');

    let counter = 0;
    let restart;
    let score;
    let clock;
    let found = [];

    container.addEventListener('click', mainClick);

    function mainClick(e) {
        let neighbours;
        let currentCell = e.target;
        if (announcement.children.length === 0) {
            minesPlacing(+currentCell.id);
            restart = document.createElement('div');
            restart.addEventListener('click', function () {
                // location.reload();
                restartGame(size);
            });
            announcement.appendChild(restart);
            restart.className = "restart";
            restart.innerHTML = "Restart";
            clock = document.createElement('div');
            announcement.appendChild(clock);
            clock.className = "clock";
            timer();
            score = document.createElement('div');
            container.addEventListener('contextmenu', addMine);
            announcement.appendChild(score);
            score.className = "score";
            score.innerHTML = "Mines found: " + counter + " / " + commonMinesNumber;
        }

        if (currentCell.className === 'cell' && !currentCell.classList.contains('active')) {
            currentCell.classList.add('active');
            let current = +e.target.id;
            neighbours = getNeighbours(current);
            if (set.has(current)) {
                for (let k of set.values()) {
                    cell[k].innerHTML = "<i class=\"fa fa-bomb\" aria-hidden=\"true\"></i>";
                    cell[k].style.color = "#ff0000";
                    cell[k].firstChild.classList.add('mine-placed');
                }
                container.removeEventListener('click', mainClick);
                container.removeEventListener('contextmenu', addMine);
                restart.classList.add('green-button');
            } else {
                cellFilling(current, neighbours);
            }
        }
    }

    function getNeighbours(current) {
        let neighbours = [];
        neighbours.push(current);
        if (current % size !== 0) {
            neighbours.push(current - 1);
        }
        if (current % size !== 0 && current > size + 1) {
            neighbours.push(current - (size + 1));
        }
        if ((current + 1) % size !== 0 && current > size - 1) {
            neighbours.push(current - (size - 1));
        }
        if ((current + 1) % size !== 0) {
            neighbours.push(current + 1);
        }
        if ((current + 1) % size !== 0 && current < size * (size - 1)) {
            neighbours.push(current + size + 1);
        }
        if (current % 8 !== 0 && current < size * (size - 1)) {
            neighbours.push(current + size - 1);
        }
        if (current > size - 1) {
            neighbours.push(current - size);
        }
        if (current < size * (size - 1)) {
            neighbours.push(current + size);
        }
        return neighbours;
    }

    function minesAround(neighbours) {
        let minesAround = 0;
        for (let i = 0; i < neighbours.length; i++) {
            if (set.has(neighbours[i])) minesAround++;
        }
        return minesAround;
    }


    function cellFilling(current, neighbours) {
        let number = minesAround(neighbours);
        let zeroNeighbour = [];
        if (number === 0) {
            for (let i = 0; i < neighbours.length; i++) {
                cell[neighbours[i]].classList.add('active');
                if (minesAround(getNeighbours(neighbours[i])) !== 0) {
                    cell[neighbours[i]].innerHTML = minesAround(getNeighbours(neighbours[i]));
                } else {
                    if (neighbours[i] !== current) zeroNeighbour.push(neighbours[i]);
                }
            }
            for (let zero of zeroNeighbour) {
                let zeroNeighbourArray = getNeighbours(zero).filter(function (item) {
                    return !cell[item].classList.contains('active');
                });
                if (zeroNeighbourArray.length > 0) cellFilling(zero, zeroNeighbourArray);
            }
        } else {
            cell[current].innerHTML = number + "";
        }
    }

    function addMine(e) {
        let mineCell = e.target;
        e.preventDefault();
        if (set.has(+mineCell.id)) {
            if (!found.includes(+mineCell.id)){
                counter++;
                found.push(+mineCell.id);
            }
        }
        if (mineCell.className === "cell" && mineCell.innerHTML === "") {
            mineCell.innerHTML = "<i class=\"fa fa-bomb\" aria-hidden=\"true\"></i>";
            mineCell.style.color = "#707070";
            mineCell.firstChild.classList.add('mine-placed');
            score.textContent = "Mines found: " + counter + " / " + commonMinesNumber;
        } else {
            mineCell.innerHTML = "";
            found.splice(found.indexOf(+mineCell.id), 1);
            if (counter > 0) counter--;
            score.textContent = "Mines found: " + counter + " / " + commonMinesNumber;
        }
        if (mineCell.className === "fa fa-bomb mine-placed") {
            mineCell.parentNode.innerHTML = "";
        }
        if (found.length === commonMinesNumber){
            clearTimeout(gameTimer);
            clock.style.color = "orange";
            score.remove();
            restart.classList.add('orange-button');
            setTimeout(function () {
                restart.textContent = "You won! Play again?";
            }, 150);

        }
    }

    function minesPlacing(currentCell) {
        while (true) {
            let cell = Math.floor(Math.random() * size * size);
            if (cell !== currentCell) set.add(cell);
            if (set.size === commonMinesNumber) break;
        }
        return set;
    }

    function restartGame(s) {
        inputContainer.remove();
        container.remove();
        if (restart !== undefined) restart.remove();
        if (clock !== undefined) clock.remove();
        if (score !== undefined) score.remove();
        mineSweeper(s);
    }
let second = 0;
let minute = 0;
let gameTimer;
    function timer() {
        if (second < 3600) {
            second++;
            if (s > 60){
                minute++;
                second = 0;
            }
            clock.innerHTML = beautify(minute) + ":" + beautify(second);
            gameTimer = setTimeout(timer, 1000);
        }
    }

    function beautify(time){
        if (time < 10) time = "0" + time;
        return time;
    }
}

mineSweeper();