(function() {

  function newChime(ball) {
    var a = document.createElement('audio');
    a.id = 'chime-' + ball.id;
    a.innerHTML = '<source src="c1.mp3" type="audio/mp3"><source src="c1.wav" type="audio/wav">';
    document.body.appendChild(a);
    return a;
  }

  function playChime(ball) {
    var a = ball.chime;
    a.pause();
    a.currentTime = 0;
    a.play();
  }

  function random(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  var raf = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;

  document.addEventListener('mousedown', function(e) {
    var x = e.x - canvas.offsetLeft;
    var y = e.y - canvas.offsetTop;
    console.log(x, y);
    drawCircle(x, y);
  }, false);

  var canvas = document.querySelector('canvas.game');
  var ctx = canvas.getContext('2d');

  var balls = [];
  var colors = [
    'cyan',
    'magenta',
    '#6fff00',
    '#ff00ff',
    '#ffff00',
    '#4d4dff',
    '#fe0001',
    '#ff4105',
    '#993cf3'
  ];
  var minRadius = 4;
  var id = 0;

  // circle collision test to see if two balls are touching
  function hitTestCircle(ball1, ball2) {
    var dx = ball1.x - ball2.x;
    var dy = ball1.y - ball2.y;
    var distance = dx * dx + dy * dy;
    return distance <= (ball1.nextRadius + ball2.nextRadius) * (ball1.nextRadius + ball2.nextRadius);
  }

  function animate(canvas, balls) {
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // render
    for (var i = 0; i < balls.length - 1; i++) {
      var ball = balls[i];
      ball.chimed = false;

      // draw the circle
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
      ctx.closePath();

      // add a coloured border around circle
      ctx.lineWidth = 2;
      ctx.strokeStyle = ball.color;
      ctx.stroke();

      // todo: do better collision detection to make sure that we
      // only increase a circle's radius as long as it doesn't hit
      // other circles or the canvas walls.

      var anotherBall;
      var makeBallSmaller = false;

      // Only test against balls that come after the current ball. If we've
      // gotten to this point, we've already done calculations for all previous ball
      // collisions.
      for (var j = i + 1; j < balls.length; j++) {
        anotherBall = balls[j];
        // You should never be able to collide with a ball that's shrinking.
        if (anotherBall.rateOfChange < 0) {
          continue;
        }
        if (hitTestCircle(ball, anotherBall)) {
          console.log('collision', ball.id, anotherBall.id);
          // when this ball collides with another, shrink both.
          ball.rateOfChange = -.3;
          anotherBall.rateOfChange = -.3;

          if (!ball.chimed) {
            playChime(ball);
            anotherBall.chimed = ball.chimed = true;
          }

          break;
        }
      }

      if (ball.nextRadius <= minRadius) {
        console.log('too small', ball.id);
        ball.rateOfChange = .3;
      }

      ball.radius += ball.rateOfChange;
      ball.nextRadius = ball.radius + ball.rateOfChange;
    }

    requestAnimationFrame(function() {
      animate(canvas, balls);
    });
  }

  function Ball(x, y, color) {
    this.id = id++;
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = minRadius;
    this.rateOfChange = .3;
    this.nextRadius = this.radius + this.rateOfChange;
    this.chimed = false;
    this.chime = newChime(this.id);
  }

  function drawCircle(x, y) {
    return balls.push(new Ball(x, y, random(colors)));
  }

  // resize canvas to fill window
  window.addEventListener('resize', resizeCanvas, false);

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    animate(canvas, balls);
  }

  resizeCanvas();

})();
