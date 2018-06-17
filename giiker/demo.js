var moves = [];
var scrMoves = [];
var timeStampedMoves = [];
var lastMoveTimestamp = 0;

var SPLIT_LINES_MS = 500;
var firstMoveReceived = false;

// From alg.cubing.net. Not future-proof.
function escape_alg(alg) {
  if (!alg) {return alg;}
  var escaped = alg;
  escaped = escaped.replace(/_/g, "&#95;").replace(/ /g, "_");
  escaped = escaped.replace(/\+/g, "&#2b;");
  escaped = escaped.replace(/-/g, "&#45;").replace(/'/g, "-");
  return escaped;
}

function displayMoves() {
  document.getElementById("moves").textContent = alg.cube.toString(moves);
}

function reset() {
  moves = [];
  displayMoves();
}

function cuber() {
  return document.getElementById("cuber").value;
}

function save() {
  console.log("Saving...");
  document.getElementById("save").textContent = "Saving...";
  localStorage[(new Date()).toISOString()] = JSON.stringify({
    moves: moves,
    timeStampedMoves: timeStampedMoves,
    cuber: cuber()
  });
  document.getElementById("save").textContent = "Saved!";
  setTimeout(function() {
    document.getElementById("save").textContent = "Save";
  }, 1000);
}

function splitScramble(moves) {
  for (var i = 0; i < moves.length; i++) {
    console.log(moves[i].comment);
    if (moves[i].comment === "// scramble" && moves[i+1] && moves[i+1].type == "newline") {
      return {
        scramble: alg.cube.simplify(moves.slice(0, i)),
        solve: moves.slice(i+2)
      }
    }
  }
  return {
    scramble: [],
    solve: moves
  }
}

var cube = new GiikerCube();
window.addEventListener("load", function() {
  // document.querySelector("#connect").addEventListener("click", function() {
  //   cube.connect();
  // });

  document.getElementById("connect").addEventListener("click", function f() {
    console.log("Connecting...");
    document.getElementById("connect").textContent = "Connecting...";
    document.getElementById("twistyContainer").classList.add("loading");
    cube.connect().then(function() {
      document.getElementById("connect").textContent = "Connected!";
      document.getElementById("twistyContainer").classList.remove("loading");
    });
  });

  document.getElementById("view").addEventListener("click", function f() {
    console.log("Connecting...");
    var recon = splitScramble(moves);

    url = "https://alg.cubing.net?" +
      "setup=" + encodeURIComponent(escape_alg(alg.cube.toString(recon.scramble))) +
      "&alg=" + encodeURIComponent(escape_alg(alg.cube.toString(recon.solve))) +
      "&title=Giiker%20Cube%20Reconstruction" + (cuber() ? "%0A" + encodeURIComponent(cuber()) : "") + "%0A" + encodeURIComponent(new Date().toISOString().substring(0, 10));
    window.open(url, '_blank');
    save();
  });

  document.getElementById("reset").addEventListener("click", function f() {
    console.log("Resetting moves...");
    save();
    reset();
  });

  document.getElementById("mark-scramble").addEventListener("click", function f() {
    moves.push({
      type: "comment_short",
      comment: "// scramble"
    });
    displayMoves();
  });

  document.getElementById("save").addEventListener("click", function() {
    save();
  });
});


cube.addEventListener(function(d) {
  if (!firstMoveReceived) {
    firstMoveReceived = true;
    return true;
  }

  console.log(d);
  twistyScene.queueMoves([d.latestMove]);
  twistyScene.play.start();

  timeStampedMoves.push({
    move: d.latestMove,
    timeStamp: d.timeStamp,
    stateStr: d.stateStr
  });

  var now = Date.now();
  if (now - lastMoveTimestamp > SPLIT_LINES_MS && moves.length > 0 && moves[moves.length - 1].type != "newline") {
    moves.push({type: "newline"});
  }
  lastMoveTimestamp = now;
  moves.push(d.latestMove)
  moves = alg.cube.simplify(moves);
  // console.log(alg.cube.toString(moves));
  displayMoves();
});
