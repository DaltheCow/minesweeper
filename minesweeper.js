(function() {
    function createCanvas(width, height) {
      var canvas = document.createElement('canvas');
      canvas.setAttribute('width', width || 200);
      canvas.setAttribute('height', height || 200);
      canvas.setAttribute('style', 'background-color: white;');
      document.body.appendChild(canvas);
      return [canvas,canvas.getContext('2d')];
    }
    function createP() {
        var p = document.createElement("p");
        document.body.appendChild(p);
        return p;
    }
    function createButton(p,func) {
        var btn = document.createElement("BUTTON");
        var t = document.createTextNode("Settings");
        btn.onclick = settingsController;
        btn.appendChild(t);
        p.appendChild(btn);
    }
    function createSpan(p) {
        var s = document.createElement("span");
        s.setAttribute('style', 'border: black solid 1px');
        p.appendChild(s);
        s.innerHTML = " 0&nbsp";
        return s;
    }

    function findPos(obj) {
        var curleft = 0, curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            return { x: curleft, y: curtop };
        }
        return undefined;
    }

    function drawBlock(x,y,size,color) {
        ctx.fillStyle = color;
        ctx.fillRect(x,y,size,size);
    }
    function drawGrid(sZ,x,y,s,t) {
        //sZ is the size
        if (s === undefined || t === undefined) {
            s=x,t=y;
            drawLine(0,0,x,0);
            drawLine(0,0,0,y);
        }
        drawLine(sZ * s, 0, sZ * s, sZ * y);
        drawLine(0, sZ * t, sZ * x, sZ * t);
        if (s > 0 || t > 0)
            drawGrid(sZ, x, y, s - 1, t - 1);
    }

    function drawLine(x1,y1,x2,y2) {
        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();
    }

    function obj() {
        return {displayed:false,hasMine:false,flag:false};
    }

    function fillMines(minesLeft,array,size,lt) {
        var mine = Math.floor(Math.random()*size+1);
        if (array.some(function(AE) {
            return AE === mine;
        })) {
            fillMines(minesLeft,array,size,lt);
        }
        else {
            array.push(mine);
            if (minesLeft > 1)
                fillMines(minesLeft-1,array,size,lt);
            else
                array = array.splice(0,lt);
        }
        return array;
    }

    function fillNum(posX,posY,num) {
        drawBlock(posX*blockSize+1, posY*blockSize+1,blockSize-2,'white');
        ctx.font = 11/16 * blockSize + 'px Verdana'
        ctx.fillStyle = 'black';
        ctx.fillText(num,posX*blockSize+4/14*blockSize,posY*blockSize+blockSize-3/13*blockSize);
    }

    function action(x,y) {
        if (gridArray[y][x].hasMine)
            return 1;
        else if (!gridArray[y][x].displayed){
            var sum = 0;

            doubleLoop(x,y,function(i,j) {
                if (gridArray[j][i].hasMine)
                    sum++;
            });
            gridArray[y][x].displayed = true;
            if (sum){
                fillNum(x,y,sum);
            }
            else {
                drawBlock(x*blockSize+1, y*blockSize+1,blockSize-2,'white');
                doubleLoop(x,y,action);

            }
        }
        return 0;
    }

    function doubleLoop(x,y,func) {
        for (var i = -1; i < 2; i++) {
            if (y+i >= 0 && y+i < gridSizeY) {
                for (var j = -1; j < 2; j++){
                    if (x+j >= 0 && x+j < gridSize){
                        func(x+j,y+i);
                    }
                }
            }
        }
    }

    function revealMines(color1,color2,posx,posy) {
        gridArray.forEach(function(A,y) {
            A.forEach(function(AE,x) {
                if(AE.hasMine) {
                    drawBlock(x*blockSize+blockSize/15,y*blockSize+blockSize/15,blockSize-blockSize/10,color1);
                    drawBlock(x*blockSize+blockSize/4,y*blockSize+ blockSize/4,blockSize-blockSize/2,color2);
                }
            });
        });
        if (posx != undefined){
            drawBlock(posx*blockSize+blockSize/15,posy*blockSize+blockSize/15,blockSize-blockSize/10,color2);
            drawBlock(posx*blockSize+blockSize/4,posy*blockSize+blockSize/4,blockSize-blockSize/2,color1);
        }
    }

    function timer() {
        count1++;
        SPAN.innerHTML = " " + count1 + "&nbsp";
        
    }

    function restart() {
        init();
        SPAN.innerHTML = " 0&nbsp";
        removeEventListener("keypress",restart,false);
    }

    function endGame(color1,color2,x,y) {
        canvas.removeEventListener("click",clickEvent,false);
        canvas.removeEventListener("contextmenu",rightClick,false);
        clearInterval(interval);
        revealMines(color1,color2,x,y);
        ctx.fillStyle = 'white';
        ctx.font = "15.2px Verdana";
        ctx.fillText("Hit any key to restart",gridSize*blockSize/2.2-4*blockSize-1,gridSizeY*blockSize/2+2);
        ctx.fillStyle = 'red';
        ctx.font = "15px Verdana";
        ctx.fillText("Hit any key to restart",gridSize*blockSize/2.2-4*blockSize,gridSizeY*blockSize/2+2);
        ctx.fillStyle = 'black';
        ctx.font = "14.8px Verdana";
        ctx.fillText("Hit any key to restart",gridSize*blockSize/2.2-4*blockSize+1,gridSizeY*blockSize/2+2);
        addEventListener("keypress",restart,false);
    }

    function clickManage(posX,posY) {
            if (gridArray[posY][posX].hasMine){
                endGame('red','black',posX,posY);
            }
            else if (!gridArray[posY][posX].displayed) {
                drawBlock(posX*blockSize+1, posY*blockSize+1,blockSize-2,'white');
                action(posX,posY);
                gridArray[posY][posX].displayed = true;
            }
            var c = 0;
            gridArray.forEach(function(A){
                A.forEach(function(AE) {
                    if (!AE.displayed)
                        c++;
                });
            });
            if (c === mines) {
                endGame('black','green');
            }

    }

    function initDraw() {
        for(var i = 0; i<gridSizeY; i++) {
            gridArray[i] = [gridSize];
            for (var j = 0; j<gridSize; j++) {
                gridArray[i][j] = obj();
                if (mineArray.some(function(AE) {
                    return AE - 1 === (i*gridSize + j);
                })) {
                    gridArray[i][j].hasMine = true;
                }
                drawBlock(j*blockSize,i*blockSize,blockSize,'grey');
            }
        }
        drawGrid(blockSize,gridSize,gridSizeY);
    }


    function initMines(posX,posY) {
                var tempArray = [];
                doubleLoop(posX,posY,function(i,j){
                    tempArray.push(j*gridSize+i+1);
                });
                mineArray = fillMines(mines,tempArray,gridSize*gridSizeY,tempArray.length);
                initDraw();
    }

    var settingsController = function() {
        PROMPT = prompt("Enter: 'easy','intermediate', or 'expert'");
        settings(PROMPT);
    }

    function settings(answer) {
        if (answer === 'easy')
            setSettings(18,9,9,10);
        else if (answer === 'intermediate')
            setSettings(18,16,16,40);
        else if (answer === 'expert')
            setSettings(18,30,16,99);
    }

    function setSettings(bs,gsx,gsy,m) {
            blockSize = bs;
            gridSize = gsx, gridSizeY = gsy;
            mines = m;
            init();
    }

    function init() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        gridArray = [gridSizeY];
        mineArray = [];
        count1 = 0;
        if (blockSize * gridSize > canvas.width || blockSize * gridSizeY > canvas.height)
            throw "Invalid Size: shrink cell size or grid specs";
        initDraw();
        startClick();
        clearInterval(interval);
    }

    function flagManage(j,i) {
        if (!gridArray[i][j].displayed) {
            gridArray[i][j].flag = !gridArray[i][j].flag;
            if (gridArray[i][j].flag)
                drawBlock(j*blockSize+blockSize/4,i*blockSize+blockSize/4,blockSize/2,'green');
            else
                drawBlock(j*blockSize+blockSize/4,i*blockSize+blockSize/4,blockSize/2,'grey');
        }
    }

    function rightClick(e) {
        e.preventDefault();
        var pos = findPos(this);
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        var posX = Math.floor(x/blockSize);
        var posY = Math.floor(y/blockSize);
        if (x < gridSize*blockSize && y < gridSizeY*blockSize)
            flagManage(posX,posY);

    }

    function startClick() {
        var count = 0;
        
        clickEvent = function(e) {
            var pos = findPos(this);
            var x = e.pageX - pos.x;
            var y = e.pageY - pos.y;
            var posX = Math.floor(x/blockSize);
            var posY = Math.floor(y/blockSize);

            if (count < 1) {
                interval = setInterval(timer,1000);
                count++;
                initMines(posX,posY);
            }
            if (x < gridSize*blockSize && y < gridSizeY*blockSize && !gridArray[posY][posX].flag)
                clickManage(posX,posY);
        }

        canvas.addEventListener("click",clickEvent,false);
        canvas.addEventListener('contextmenu',rightClick, false);
    }

    var CANCTX = createCanvas(30*18,16*18);
    var canvas = CANCTX[0];
    var ctx = CANCTX[1];
    var paragraph = createP();
    createButton(paragraph,'settingsController()');
    var SPAN = createSpan(paragraph);
    canvas.addEventListener('contextmenu', function(ev) {
        ev.preventDefault();

    }, false);

    var blockSize = 18;
    var gridSize = 16, gridSizeY = 16;
    var mines = 40;
    var gridArray, mineArray, clickEvent, interval, count1;

    init();

})();

