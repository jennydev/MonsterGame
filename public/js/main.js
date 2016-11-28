var monsters = [];
var gifts = [];
var player = {};

var randomMonsters = [];
var monstersOnMap = [];

var gameLoop;
var score = 0;
var sounds = {
    clickGift: "assets/sounds/clickGift.mp3",
    clickMonster: "assets/sounds/clickMonster.mp3"
};


function start() {
    console.log('Start: 3, 2, 1...');
    loadData();
    startInterval();

}


function bindMonsterEvents() {
    console.log('bind click events');

    $('.monster').on('click', function() {

        var index = $(this).attr('data-index');

        var currentMonster = monstersOnMap[index];

        //malko zabravih tova v [index] dali e promenlivata ili prisvoqvane na stoinostta i

        var playerAlive = isAlive();

        if (player.energy > currentMonster.energy && playerAlive == true) {

            killMonster(currentMonster);

            giveGift();

            if($('.dead-monster').length == 3){
                resetMonsters();
            }

        } else {
            console.log('player is dead or not enough energy')
        }

        playSound(sounds.clickMonster)

    });
}


function bindGiftEvents() {

    $('.gift-container').find(".gift").last().on("click", function () {

            playSound(sounds.clickGift)

        var amount = $(this).find(".number").html();
        var type = $(this).attr("data-type");

        if (type == "blood") {

            player.currentHealth += parseInt(amount);
            //parseInt prevrashta v chislo?

            if (player.currentHealth > player.maxHealth) {
                player.currentHealth = player.maxHealth;
            }

            console.log(player.currentHealth, parseInt(amount))

            updateHealthBar();
        } else {
            player.energy += parseInt(amount);

            if (player.energy > player.maxEnergy) {
                player.energy = player.maxEnergy;
            }

            updateEnergyBar();
        }

        $(this).remove();


    })
}


function playSound(sound){
    var sound = new Audio(sound)
    sound.play()
}


function loadData() {

    console.log('load data from json')

    $.ajax({
        method: "GET",
        url: "services/data.json",
        dataType: "json"
    }).done(function (response) {

        console.log(response);

        //var monsters = [];
        //var gifts = [];
        //var player = {};
        //
        //var randomMonsters = [];
        //var monstersOnMap = [];
        //
        //var gameLoop;
        score = 0;

        player = response.player;
        monsters = response.monsters;
        gifts = response.gifts;

        renderPlayerData(player);

        randomMonsters = [];
        getThreeNumbers();

        monstersOnMap = getRandomMonsters(monsters);

        renderMonsterData(monstersOnMap);

        console.log(randomMonsters);

    });

}


function getThreeNumbers (){

    var number = getRandomizer(0, monsters.length -1);

    if(randomMonsters.indexOf(number) == -1){
        randomMonsters.push(number)
    }

    if(randomMonsters.length == 3){
        return;
    }else{
        getThreeNumbers();
    }

}


function renderPlayerData(playerData) {
    console.log('render player data')
    $('.avatar').attr('src', playerData.avatar);
    $('#name').html(playerData.name);
    $('#gold').html(playerData.gold);
    updateHealthBar()
    updateEnergyBar()

}

function renderMonsterData(monstersData) {

    console.log('render monsters')

    $('.monsters-container').empty();

    for (i = 0; i < monstersData.length; i++) {

        var currentMonster = monstersData[i];

        var $monsterTemplate = $('.monster').last().clone();

        $monsterTemplate.attr('data-index', i);
        $monsterTemplate.find('.name').html(currentMonster.name);
        $monsterTemplate.find('.damage').html(currentMonster.damage);
        $monsterTemplate.find('.energy-consumes').html(currentMonster.energy);
        $monsterTemplate.find('.gold').html(currentMonster.gold);
        $monsterTemplate.find('.monster-image').attr('src', currentMonster.avatar);
        $monsterTemplate.show();

        $('.monsters-container').append($monsterTemplate)

    }

    bindMonsterEvents();

}

function getRandomMonsters(monstersData) {

    var newMonsters = [];

    for (i = 0; i < randomMonsters.length; i++) {

        var randomMonster = monstersData[randomMonsters[i]];
        newMonsters.push(randomMonster);
    }

    return newMonsters;

}


function killMonster(currentMonster) {

    player.currentHealth = player.currentHealth - currentMonster.damage;
    if (player.currentHealth <= 0) {
        player.currentHealth = 0;
        getFinalScore();
    }else{
        player.gold = player.gold + currentMonster.gold;
        updateGold();
    }
    updateHealthBar();

    player.energy = player.energy - currentMonster.energy;
    updateEnergyBar();



    //currentMonster.dead = true;
    var currentIndex = monstersOnMap.indexOf(currentMonster);
    $(".monster[data-index='" + currentIndex + "']").addClass('dead-monster');

    score++;

}

function giveGift() {

    var giftIndex = getRandomizer(0, gifts.length - 1);

    var gift = gifts[giftIndex]

    var amount = gift.amount + getRandomizer(-5, 5);

    var $giftTemplate = $('.gift').last().clone();

    $giftTemplate.find('.number').html(amount);
    $giftTemplate.find('.gift-img').attr('src', gift.path);
    $giftTemplate.attr("data-type", gift.name);
    $giftTemplate.show();

    console.log(gift, amount);

    $('.gift-container').append($giftTemplate);

    bindGiftEvents()
    bindGameRestart();

}

function updateHealthBar() {

    var percent = (player.currentHealth / player.maxHealth) * 100;
    $('.health').animate({
        width: percent + '%'
    }, 200);
    $(".health-amount").html(player.currentHealth + "/" + player.maxHealth);

}

function updateEnergyBar() {
    var percent = (player.energy / player.maxEnergy) * 100;
    $('.energy').animate({
        width: percent + '%'
    }, 200);
    $(".energy-amount").html(player.energy + "/" + player.maxEnergy);
}

function updateGold() {
    $('#gold').html(player.gold);
}

function isAlive() {

    var isAlive = true;

    if (player.currentHealth <= 0) {

        // to-do:
        // 1. да изкарам статистика на текущото злато.
        // 2. да изкарам статистика на броя убити същества.
        // 3. Възможност за нова игра.
        // 4. Добавяне на звуци.

        //TODO
        // 1. Да направя звуците на локални ресурси
        // 2. Да преправя крайния екран

        isAlive = false;
    }
    console.log(isAlive)
    return isAlive;

}

function getFinalScore(){
    $("#game-over").show();

    $(".final-score span.gold").text(player.gold);
    $(".count").text(score);
    $(".container").first().addClass("blurred");

}

function bindGameRestart() {

    $(".reload").on('click', function() {

        $("#game-over").hide();
        $('.gift-container').empty();
        $(".container").first().removeClass("blurred");

        loadData();

    });

}

function startInterval() {
    gameLoop = setInterval(giveEnergy, 1500);
}

function giveEnergy() {

    if(player.currentHealth == 0){
        return;
    }

    player.energy = player.energy + 2;
    if (player.energy > player.maxEnergy) {
        player.energy = player.maxEnergy;
    }
    updateEnergyBar();
}

function getRandomizer(bottom, top) {
    return Math.floor(Math.random() * ( 1 + top - bottom )) + bottom;
}

function resetMonsters(){

    $('.monsters-container').empty();
    randomMonsters = [];
    getThreeNumbers();
    monstersOnMap = getRandomMonsters(monsters);

    renderMonsterData(monstersOnMap);

    console.log(randomMonsters);

}