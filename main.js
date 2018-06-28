let player = {
    lastUpdate: 0,
    totalTime: 0,
    runTime: 0,
    heat: 30,
    temp: 10,
    hp: 100,
    dead: false,
    curAction: false,
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
        count: 0,
        dist: 1,
        time: { total: 7000, left: 7000 },
        active: false,
        show: false,
    }, chopTrees: {
        rewards: { foilage: { max: 10, chance: 40, name: 'foilage', }, scrapWood: { max: 10, chance: 30, name: 'scrapWood', }, logs: { max: 5, chance: 30, name: 'logs', } },
        chance: 30,
        items: 20,
        count: 0,
        dist: 5,
        time: 25000,
        show: false,
    } },
    events: {nofuel:false,coldsnap:0},
}

let start = JSON.parse(JSON.stringify(player));

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
    requestAnimationFrame(updateVisuals);
}

function ObjById(obj, id){
    return obj[Object.keys(obj)[id]];
}

function SumOf(arr) {
    if (arr.length > 0) return arr.reduce(function (acc, num) { return acc += num });
    else return 0;
}

function classFade(className, type, time) {
    if (time == undefined) time = 5000;
    let amnt = type;
    let fade = setInterval((type == 1 ? fadeOut : fadeIn), time / 100);
    for (let i = 0; i < document.getElementsByClassName(className).length; i++) document.getElementsByClassName(className)[i].style.visibility = 'visible';
    function fadeIn() {
        amnt += 0.01;
        for (let i = 0; i < document.getElementsByClassName(className).length; i++) document.getElementsByClassName(className)[i].style.opacity = amnt;
        if (amnt >= 1) clearInterval(fade);
    }
    function fadeOut() {
        amnt -= 0.01;
        for (let i = 0; i < document.getElementsByClassName(className).length; i++) document.getElementsByClassName(className)[i].style.opacity = amnt;
        if (amnt <= 0) {
            for (let i = 0; i < document.getElementsByClassName(className).length; i++) document.getElementsByClassName(className)[i].style.visibility = 'hidden';
            clearInterval(fade);
        }
    }
}

function startFade(object, type, time) {
    if (time == undefined) time = 5000;
    let amnt = type;
    let fade = setInterval((type == 1 ? fadeOut : fadeIn), time / 100);
    if (object == "body") document.body.style.visibility = 'visible';
    else document.getElementById(object).style.visibility = 'visible';
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
        if (amnt <= 0) {
            clearInterval(fade);
            if (object == "body") document.body.style.visibility = 'hidden';
            else document.getElementById(object).style.visibility = 'hidden';
        }
    }
}

function loop() {
    let dif = Date.now() - player.lastUpdate;
    player.lastUpdate = Date.now();
    if (player.dead) return;
    heatTick(dif);
    actionTick(dif);
    if (Date.now() % 250 < dif){
        //Happens every 1/4 of a second
        eventTrigger();
    }
    player.runTime += dif;
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
    requestAnimationFrame(updateVisuals);
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
    //new content
    if (player.items.foliage.amnt === 0 && !player.events.nofuel) {
        player.events.nofuel = true;
        startFade("infoDiv", 1, 1000);
        setTimeout(function () {
            player.actions.forage.show = true;
            startFade('actionDiv', 0, 1000);
            document.getElementById("infoDiv").innerHTML = "You can forage near the machine to find some more foliage...";
            startFade("infoDiv", 0, 1000);
        },1100)
        return;
    }

    if(player.actions.forage.count >= 10 && player.events.rareItems && !player.actions.chopTrees.show){
        startFade("infoDiv", 1, 1000);
        player.actions.chopTrees.show = true;
        setTimeout(function () {
            document.getElementById("infoDiv").innerHTML = "You found an axe laying around back, it was hidden in the snow... <br> Now you can put this to good use and get some actual firewood, the trees are far out; hope you don't freeze on the way there...";
            startFade("infoDiv", 0, 1000);
        }, 1100)
        return;
    }

    //more cold
    if (player.runTime >= 100000 * Math.pow(player.events.coldsnap + 1, 2)) {
        player.events.coldsnap++;
        player.temp -= 5 * player.events.coldsnap;
        startFade("infoDiv", 1, 1000);
        setTimeout(function () {
            document.getElementById("infoDiv").innerHTML = "You feel the air around you getting colder as another blizzard sweeps in...<br>The temperature just dropped by " + 5 * player.events.coldsnap + "&deg;C";
            startFade("infoDiv", 0, 1000);
        }, 1100)
        return;
    }

    //death trigger
    if (player.hp <= 0) {
        startFade("infoDiv", 1, 1000);
        player.dead = true;
        setTimeout(function () {
            document.getElementById("infoDiv").innerHTML = "You have died... <br> You survived for " +player.runTime/1000 +" seconds...";
            startFade("infoDiv", 0, 1000);
            setTimeout(function () {
                startFade("infoDiv", 1, 1000);
                setTimeout(function () {
                    document.getElementById("infoDiv").innerHTML = "Now it is time to rebuild... <br> The machine will not be forgotten..";
                    startFade("infoDiv", 0, 1000);
                    startFade("gameAlive", 1, 6000);
                    startDeath();
                }, 2100)
            },1100)
        }, 1100)
        return;
    }
}

function startDeath() {
    startFade("gameDead",0,8000)
    let time = player.runTime;
    let unlocks = [
        { name: "prepWork", desc: "Being ready for the cold is important, having more emergency fuel in the machine will prove useful...", title: "Preparation", reqs: function () { if (time >= 300000 && player.events.nofuel) return true; }, mods: function () { player.items.foliage.amnt += 5; } },
        { name: "foragingSkill", desc: "Expert level foraging skills and equipment might lead to chances to find rare lost items, that may prove useful in survival...", title: "Foraging Expertise", reqs: function () { if (time >= 450000 && player.actions.forage.count >= 20) return true; }, mods: function () { player.events.rareItems = true; } },
        { name: "workSkills", desc: "After doing task over and over again you get the sense that you can do them faster than ever before...", title: "Work Ethic", reqs: function () { if (time >= 700000 && player.actions.forage.count + player.actions.chopTrees.count >= 40) return true; }, mods: function () { player.actions.forage.time.total -= 1; player.actions.chopTrees.time.total -= 1; player.actions.forage.time.left -= 1; player.actions.chopTrees.time.left -= 1 } }
    ]
    let earned = [];
    for (let i = 0; i < unlocks.length; i++)if (unlocks[i].reqs()) earned.push(unlocks[i]);
    let elem = document.getElementById('unlockDisp');
    let timer = 0;
    let count = 0;  
    let interval = setInterval(function () {
        timer += 100;
        if (timer >= (earned.length+1) * 10000) {
            clearInterval(interval);
            startFade('learnTitle',1,1000)
            startFade('resetTitle', 0, 1000)
            startFade('resetBtn', 0, 1000)
            time += player.totalTime;
            player = JSON.parse(JSON.stringify(start));
            player.totalTime = time;
            player.dead = true;
            for (let i = 0; i < earned.length; i++) earned[i].mods();
            return;
        }
        if (timer >= (count + 1) * 10000) {
            count++;
            elem.getElementsByClassName('title')[0].innerHTML = earned[count-1].title;
            elem.getElementsByClassName('desc')[0].innerHTML = earned[count-1].desc;
            startFade('unlockDisp', 0, 1000)
            setTimeout(function () {
                startFade('unlockDisp', 1, 1000)
                if (count === 1) startFade('unlockList', 0, 1000);
                let elem2 = document.getElementById('unlockTable').insertRow(0);
                elem2.insertCell(0).innerHTML = earned[count-1].title;
            }, 9000)
        }
    },100)
}

function awaken() {
    classFade("guiBox", 1,10);
    setTimeout(startFade,11,'infoDiv',0,10)
    document.getElementById("infoDiv").innerHTML = "<b>You awake in the cold hard snow, the machine hums dormant...<br> Its heat the only thing that keeps you from death...</b>";
    startFade("gameDead", 1, 3000);
    setTimeout(function () {
        player.dead = false;
        startFade("gameAlive", 0, 3000);
        setTimeout(startFade, 1000, "tempDiv", 0);
        setTimeout(function () {
            startFade("infoDiv", 1, 1000);
            setTimeout(function () {
                document.getElementById("infoDiv").innerHTML = "The machine will soon run out of fuel you must stop this...";
                startFade("infoDiv", 0)
                startFade("fuelDiv", 0)
                startFade("itemDiv", 0)
            }, 1000)
        }, 10000)
    },3100)
}

function heatTick(dif) {
    let newheat = player.temp + SumOf(player.fuel.heat);
    if (player.curAction) newheat -= player.actions[player.curAction].dist;
    let change = newheat - player.heat;
    change /= 10 * dif;
    player.heat += change;
    if (player.heat < 10 ) player.hp -= Math.pow(10 - player.heat, 2) / 50000 * dif;
    if (player.heat > 20 && player.hp < 100) player.hp += Math.pow(-10 + player.heat, 2) / 50000 * dif;
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
            action.count++;
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