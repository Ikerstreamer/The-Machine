let player = {
    lastUpdate: 0,
    playTime: 0,
    heat: 30,
    temp: 10,
    hp: 100,
    curAction:false,
    fuel:{
        max: 10,
        amnt: 3,
        heat:[5,5,5],
        time:[50000,100000,150000],
    },
    items: { foliage:{
        amnt: 5,
        heat: 4,
        time: 3000,
        show: true,
    }, scrapWood:{
        amnt: 0,
        heat: 3,
        time: 30000,
        show: false,
    }, logs:{
        amnt: 0,
        heat: 6,
        time: 120000,
        show: false,
    }, charcoal: {
        amnt: 0,
        heat: 10,
        time: 300000,
        show: false,
    }, coal:{
        amnt: 0,
        heat: 14,
        time: 450000,
        show: false,
    }, coalCoke:{
        amnt: 0,
        heat: 23,
        time: 750000,
        show: false,
    }, oil: {
        amnt: 0,
        heat: 45,
        time: 300000,
        show: false,
    }, fuel: {
        amnt: 0,
        heat: 50,
        time: 900000,
        show: false,
    } },
    actions: { forage:{
        rewards: { foliage: { max: 7, chance: 90, name: 'foliage', }, scrapWood: { max: 1, chance: 10, name: 'scrapWood', } },
        chance: 50,
        items: 5,
        dist: 1,
        time: { total: 7000, left: 7000 },
        active: false,
        show: false,
    }, chopTrees: {
        rewards: { foilage: { max: 10, chance: 40, name: 'foilage', }, scrapWood: { max: 10, chance: 30, name: 'scrapWood', }, logs: { max: 5, chance: 30, name: 'logs', } },
        chance: 30,
        items: 20,
        dist: 5,
        time: 25000,
        show: false,
    } },
    events: {nofuel:false,coldsnap:0},
}

function init() {
    startFade("body", 0);
    setTimeout(startFade, 1000, "tempDiv", 0);
    setTimeout(function () {
        startFade("infoDiv", 1, 1000);
        setTimeout(function(){
        document.getElementById("infoDiv").innerHTML = "The machine will soon run out of fuel you must stop this...";
        startFade("infoDiv", 0)
        startFade("fuelDiv", 0)
        startFade("itemDiv", 0)
    },1000)
    }, 10000)
    player.lastUpdate = Date.now();
    setInterval(loop, 50);
}

function ObjById(obj, id){
    return obj[Object.keys(obj)[id]];
}

function SumOf(arr) {
    if (arr.length > 0) return arr.reduce(function (acc, num) { return acc += num });
    else return 0;
}


function startFade(object, type, time) {
    if (time == undefined) time = 5000;
    let amnt = type;
    let fade = setInterval((type == 1 ? fadeOut : fadeIn), time/100);
    function fadeIn() {
        amnt += 0.01;
        if (object == "body") document.body.style.opacity = amnt;
        else document.getElementById(object).style.opacity = amnt;
        if (amnt >= 1) clearInterval(fade);
    }
    function fadeOut() {
        amnt -= 0.01;
        if (object == "body") document.body.style.opacity = amnt;
        else document.getElementById(object).style.opacity = amnt;
        if (amnt <= 0) clearInterval(fade);
    }
}

function loop() {
    let dif = Date.now() - player.lastUpdate;
    heatTick(dif);
    actionTick(dif);
    player.lastUpdate = Date.now();
    if (Date.now() % 250 < dif){
        //Happens every 1/4 of a second
        updateVisuals();
        eventTrigger();
    }
    player.playTime += dif;
}

function updateVisuals() {
    document.getElementById("tempDiv").childNodes[1].innerHTML = "Temp: " + player.heat.toFixed(1) + "&deg;C";
    document.getElementById("tempDiv").childNodes[3].style.backgroundColor = heatColor((player.heat + 100) / 200);
    document.getElementById("fuelDiv").childNodes[1].innerHTML = "Fuel: " + formatNum((player.fuel.amnt / player.fuel.max) * 100) + "%";
    document.getElementById("fuelDiv").childNodes[3].childNodes[1].style.width = ((player.fuel.amnt / player.fuel.max) * 100) + "%";
    let temp = ["Foliage: ", "Scrap Wood: ", "Logs: ", "Charcoal: ", "Coal: ", "Coal Coke: ", "Oil: ", "Fuel: "];
    for (let i = 0; i < Object.keys(player.items).length; i++) {
        if (ObjById(player.items, i).show) {
            document.getElementById("itemTable").rows[i].cells[0].innerHTML = temp[i] + ObjById(player.items, i).amnt;
            document.getElementById("itemTable").rows[i].classList.remove('hidden');
        }
    }
    temp = ["Forrage: ", "Chop Trees: "];
    for (let i = 0; i < Object.keys(player.actions).length; i++) {
        if (ObjById(player.actions, i).show) {
            document.getElementById("actionTable").rows[i].cells[0].innerHTML = temp[i] + (ObjById(player.actions, i).time.left / 1000).toFixed(1) + 's';
            document.getElementById("actionTable").rows[i].classList.remove('hidden');
        }
    }
}

function burn(num) {
    var temp = ObjById(player.items,num);
    if (temp.amnt > 0 && player.fuel.amnt < player.fuel.max) {
        temp.amnt--;
        player.fuel.heat.push(temp.heat);
        player.fuel.time.push(temp.time);
        player.fuel.amnt++;
    }
}

function act(num){
    let action = ObjById(player.actions, num);
    if (action.active) {
        action.active = false;
        player.curAction = false;
        action.time.left = action.time.total;
        document.getElementById('actionTable').rows[num].cells[1].childNodes[0].innerHTML = 'Start';
    } else if(!player.curAction){
        action.active = true;
        player.curAction = Object.keys(player.actions)[num];
        document.getElementById('actionTable').rows[num].cells[1].childNodes[0].innerHTML = 'Stop';
    }

}

function eventTrigger(){
    if (player.items.foliage.amnt === 0 && !player.events.nofuel) {
        player.events.nofuel = true;
        startFade("infoDiv", 1, 1000);
        setTimeout(function () {
            player.actions.forage.show = true;
            startFade('actionDiv', 0, 1000);
            document.getElementById("infoDiv").innerHTML = "You can forage near the machine to find some more foliage...";
            startFade("infoDiv", 0, 1000);
        },1000)
        return;
    }
    if (player.playTime >= 150000 * Math.pow(player.events.coldsnap + 1, 2)) {
        player.events.coldsnap++;
        player.temp -= 5 * player.events.coldsnap;
        startFade("infoDiv", 1, 1000);
        setTimeout(function () {
            document.getElementById("infoDiv").innerHTML = "You feel the air around you getting colder as another blizzard sweeps in...<br>The temperature just dropped by " + 5 * player.events.coldsnap + "&deg;C";
            startFade("infoDiv", 0, 1000);
        }, 1000)
    }
    if (player.hp <= 0) {
        startFade("infoDiv", 1, 1000);
        setTimeout(function () {
            document.getElementById("infoDiv").innerHTML = "You have died... <br> You survived for " +player.playTime/1000 +"s...";
            startFade("infoDiv", 0, 1000);
        }, 1000)
    }
}

function heatTick(dif) {
    let newheat = player.temp + SumOf(player.fuel.heat);
    if (player.curAction) newheat -= player.actions[player.curAction].dist;
    let change = newheat - player.heat;
    change /= 10 * dif;
    player.heat += change;
    if (player.heat < 10 ) player.hp -= Math.pow(10 - player.heat, 2) / 100000 * dif;
    if (player.heat > 20 && player.hp < 100) player.hp += Math.pow(-10 + player.heat, 2) / 100000 * dif;
    player.fuel.time = player.fuel.time.map(function (value) { value -= dif; if (value < 0) return 0; else return value });
    player.fuel.heat = player.fuel.heat.map(function (value, id) {if (player.fuel.time[id] === 0) return value - dif / 1000;else return value;});
    for (let i = player.fuel.amnt - 1; i >= 0; i--) {
        if (player.fuel.heat[i] < 0) {
            player.fuel.heat.splice(i, 1);
            player.fuel.time.splice(i, 1);
        }
    }
    player.fuel.amnt = player.fuel.heat.length;
}

function actionTick(dif) {
    if (!player.curAction) return;
        let action = player.actions[player.curAction];
        action.time.left -= dif;
        if (action.time.left <= 0) {
            let itemNames = Object.keys(action.rewards);
            let items = action.rewards;
            let itemsFound = [];
            for (let i = 0; i < itemNames.length; i++) itemsFound.push(0);
            for (let i = 0 ; i < action.items; i++) {
                let find = Math.random() * 100;
                if (find <= action.chance) {
                    let randItem = Math.random() * 100;
                    for (let j = 0; j < itemNames.length; j++) {
                        if (randItem < items[itemNames[j]].chance && itemsFound[j] < items[itemNames[j]].max) {
                            itemsFound[j]++;
                            player.items[itemNames[j]].amnt++;
                            if (!player.items[itemNames[j]].show) player.items[itemNames[j]].show = true;
                            break;
                        }
                        randItem -= items[itemNames[j]].chance;
                    }
                }
            }
            document.getElementById('actionTable').rows[Object.keys(player.actions).indexOf(player.curAction)].cells[1].childNodes[0].innerHTML = 'Start';
            player.curAction = false;
            action.active = false;
            action.time.left = action.time.total;
        }
}

function heatColor(x) {
    let color = [0, 0, 0];
    if(x > 0.5){
        color[0] = (1 - 2 * x) + (2 * x); 
        color[1] = 1 - x; 
        color[2] = 1 - x; 
    }else{
        color[0] = 2 * x
        color[1] = 2 * x
        color[2] = (1 - 2 * x)  + 2 * x;
    }
    color = color.map(num => Math.floor(num * 255));
    return "rgb("+color[0]+","+color[1]+","+color[2]+")";
}


function formatNum(num, dp) {
    if (dp == undefined) dp = 2;
    let suffix = ["K", "M", "B", "T", "Qu", "Qi", "Sx", "Sp", "Oc", "No", "Dc"]
     if (num < 10000) return num.toFixed(Math.min(Math.max(2 - Math.floor(Math.log10(num)), 0), dp));
    else if (num < 1e36) return (num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))).toFixed(2 - Math.floor(Math.log10(num / Math.pow(1000, Math.floor(Math.log(num) / Math.log(1000)))))) + suffix[Math.floor(Math.log(num) / Math.log(1000)) - 1];
    else return (num / Math.pow(10, Math.floor(Math.log10(num)))).toFixed(1) + "e" +Math.floor(Math.log10(num));
}