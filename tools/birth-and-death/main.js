function getURLParam(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  return r ? unescape(r[2]) : null;
}

if (!(getURLParam('birthday') && getURLParam('deathYear'))) {
  while (1) {
    var birthday = prompt('请输入您的生日 例:20000101', '')
    if (!(/^[1,2][0,9]\d\d((0[1-9])|(1[0-2]))(([0-2]\d)|(3[0,1]))$/.test(birthday))) {
      alert('请重新输入');
    } else {
      break;
    }
  }

  var y = (birthday.toString().substring(0, 4));
  var m = (birthday.toString().substring(4, 6)) - 1;
  var d = (birthday.toString().substring(6, 8));
  var birth = new Date(y, m, d);
  var now = new Date();
  var number = Date.parse(now) - Date.parse(birth);
  var year = (number / 31556926000);

  while (1) {
    var deathYear = prompt('请预测您死亡的年龄 例:80', '')
    if (!((/^[0,1]?\d\d$/).test(deathYear))) {
      alert('请重新输入');
    } else if (year > deathYear) {
      alert('你咋还活着，咋不去和太阳肩并肩呢(ノ=Д=)ノ┻━┻ ')
    } else {
      break;
    }
  }
  location.href = location.href + "?&birthday=" + birthday + "?&deathYear=" + deathYear;
}

var birthday = getURLParam('birthday');
var y = parseInt(birthday.slice(0, 4));
var m = parseInt(birthday.slice(4, 6)) - 1;
var d = parseInt(birthday.slice(6, 8));
var birth = new Date(y, m, d);
var deathYear = getURLParam('deathYear');
deathYear = parseInt(deathYear);

/*canvas clock*/
function clock() {
  var now = new Date();
  var ctx = document.getElementById('canvas').getContext('2d');
  ctx.save();
  ctx.clearRect(0, 0, 300, 300);
  ctx.translate(150, 150);
  ctx.rotate(-Math.PI / 2);
  ctx.lineCap = "round";

  var sec = now.getSeconds();
  var min = now.getMinutes();
  var hr = now.getHours();
  hr = hr >= 12 ? hr - 12 : hr;

  // write Hours
  ctx.save();
  ctx.rotate((hr * (Math.PI / 6) + (Math.PI / 360) * min + (Math.PI / 21600) * sec))
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(80, 0);
  ctx.stroke();
  ctx.restore();

  // write Minutes
  ctx.save();
  ctx.rotate(((Math.PI / 30) * min + (Math.PI / 1800) * sec))
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-28, 0);
  ctx.lineTo(112, 0);
  ctx.stroke();
  ctx.restore();

  // Write seconds
  ctx.save();
  ctx.rotate((sec * Math.PI / 30));
  ctx.strokeStyle = "#D40000";
  ctx.fillStyle = "#D40000";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(118, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

setInterval('clock()', 500);

/*years old*/
function age() {
  var p = document.getElementById('old');
  var now = new Date();
  //var birth = new Date(1998,10,12,0,0,0,0); //暂时，后期看看怎么改
  //var num = (now.getTime() - birth.getTime())/31556926000;
  var number = (Date.parse(now) - Date.parse(birth)) / 31556926000; //保证旋转与变化一致
  p.innerHTML = number.toFixed(8);
}

setInterval('age()', 500);

/*timeline*/
function timeline() {
  var now = new Date();
  //var birth = new Date(1998,10,12,0,0,0,0);
  var number = Date.parse(now) - Date.parse(birth);
  var year = Math.floor(number / 31556926000);
  var mon = Math.floor(number / 2629800000);
  var week = Math.floor(number / 604800000);
  var day = Math.floor(number / 86400000);
  var hour = Math.floor(number / 3600000);
  var min = Math.floor(number / 60000);
  document.getElementById('year').innerHTML = year;
  document.getElementById('mon').innerHTML = mon;
  document.getElementById('week').innerHTML = week;
  document.getElementById('day').innerHTML = day;
  document.getElementById('hour').innerHTML = hour;
  document.getElementById('min').innerHTML = min;
}

setInterval('timeline()', 1000);

console.log('\n %c  小时候我以为自己是不会老去的 %c 彼得·潘 \n\n', 'color:rgb(255, 255, 255);background:rgb(0, 0, 0);padding:5px 0;border-radius:3px 0 0 3px;', 'color:rgb(0, 0, 0);background:#f1f1f1;padding:5px 0;border-radius:0 3px 3px 0;');

$('#death').on('click', function() {
  $('.flipper').css('transform', 'rotateY(-180deg)')
});
$('#life').on('click', function() {
  $('.flipper').css('transform', '')
});
var width = document.getElementById('cover').clientWidth;
$('#cover').css('height',width);

/*death_clock*/
function d_clock() {
  var now = new Date();
  var number = Date.parse(now) - Date.parse(birth);
  var day = Math.floor(number / 86400000);
  var used_life = (day) / (deathYear * 365.25);
  var hr = Number((24 * used_life).toString().split('.')[0]);
  var min = (used_life * 24 - hr) * 60;
  min = min.toString().substring(0, 2);
  hr = hr >= 12 ? hr - 12 : hr;

  var ctx = document.getElementById('d_canvas').getContext('2d');
  ctx.save();
  ctx.clearRect(0, 0, 300, 300);
  ctx.translate(150, 150);
  ctx.rotate(-Math.PI / 2);
  ctx.lineCap = "round";

  ctx.save();
  ctx.rotate((hr * (Math.PI / 6) + (Math.PI / 360) * min))
  ctx.lineWidth = 9;
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(-20, 0);
  ctx.lineTo(80, 0);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.rotate(((Math.PI / 30) * min))
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(-28, 0);
  ctx.lineTo(112, 0);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = "#D40000";
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2, true);
  ctx.fill();
  ctx.restore();

  ctx.restore();

  $('#vertical').text(deathYear);
}
d_clock();

function d_old() {
  var now = new Date();
  var number = Date.parse(now) - Date.parse(birth);
  var day = Math.floor(number / 86400000);
  var used_life = (day) / (deathYear * 365.25);
  var hr = Number((24 * used_life).toString().split('.')[0]);
  var min = (used_life * 24 - hr) * 60;
  min = min.toString().substring(0, 2);
  if (min.toString().indexOf('.') != -1) {
    min = "0" + min.toString().substring(0, 1);
  }
  $('#d_old').text(hr + '点' + min + '分');
}
d_old();

function restLife() {
  var now = new Date();
  var number = Date.parse(now) - Date.parse(birth);
  var day = Math.floor(number / 86400000);
  var year = (number / 31556926000);
  var restDay = deathYear * 365.25 - day;
  var rice = Math.floor(restDay * 3);
  var weekend = Math.floor(restDay / 7);
  var holidays = Math.floor(restDay / (365.25 / 2));

  if (year <= 25) {
    if (deathYear <= 25) {
      var love = 0;
    } else if (deathYear <= 40) {
      var love = ((deathYear - 25) * 365.25) / 2;
    } else if (deathYear <= 50) {
      var love = 15 * 365.25 / 2 + (deathYear - 40) * 365.25 / 7 * 2.5;
    } else if (deathYear <= 55) {
      var love = 15 * 365.25 / 2 + 10 * 365.25 / 7 * 2.5 + (deathYear - 50) * 365.25 / 10;
    } else {
      var love = 15 * 365.25 / 2 + 10 * 365.25 / 7 * 2.5 + 5 * 365.25 / 10;
    }
  } else if (year <= 40) {
    if (deathYear <= 40) {
      var love = (deathYear - year) * 365.25 / 2;
    } else if (deathYear <= 50) {
      var love = (40 - year) * 365.25 / 2 + (deathYear - 40) / 7 * 2.5;
    } else if (deathYear <= 55) {
      var love = (40 - year) * 365.25 / 2 + (10 * 365.25 / 7 * 2.5) + (deathYear - 50) * 365.25 / 10;
    } else {
      var love = (40 - year) * 365.25 / 2 + (10 * 365.25 / 7 * 2.5) + 5 * 365.25 / 10;
    }
  } else if (year <= 50) {
    if (deathYear <= 50) {
      var love = (deathYear - year) * 365.25 / 7 * 2.5;
    } else if (deathYear <= 55) {
      var love = (50 - year) * 365.25 / 7 * 2.5 + (deathYear - 50) * 365.25 / 10;
    } else {
      var love = (50 - year) * 365.25 / 7 * 2.5 + 5 * 365.25 / 10;
    }
  } else if (year <= 55) {
    if (deathYear <= 55) {
      var love = (deathYear - year) * 365.25 / 10;
    } else {
      var love = (55 - year) * 365.25 / 10;
    }
  } else {
    var love = 0;
  }

  love = Math.floor(love);

  $('#food').text(rice);
  $('#weekend').text(weekend);
  $('#holiday').text(holidays);
  $('#mLove').text(love);
}

restLife();