var level_snd = new Audio("resources/levelup.wav");
var error_snd = new Audio("resources/error.wav");
var calculate_level = function(difficulty, level){
    // ignore difficulty for now.
    levels = [{'speed': 1, operators: ["+"], left: _.range(1, 5), right: _.range(1, 4), positive: true},
              {'speed': 2, operators: ["+"], left: _.range(1, 5), right: _.range(1, 4), positive: true},
              
              {'speed': 1, operators: ["+"], left: _.range(1, 10), right: _.range(1, 10), positive: true},
              {'speed': 2, operators: ["+"], left: _.range(1, 10), right: _.range(1, 10), positive: true},
              
              {'speed': 1, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: true},
              {'speed': 2, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: true},
              {'speed': 3, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: true},
              {'speed': 4, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: true},
              
              {'speed': 1, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: false},
              {'speed': 2, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: false},
              {'speed': 3, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: false},
              {'speed': 4, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: false}];

    operator_colors = {"+": Colors.DarkTurquoise, "-": Colors.Orange, "*": Colors.LightGreen};
    var level = this.levels[level] || _.last(levels);
    var operator = _.sample(level.operators);
    var left = _.sample(level.left);
    var right = _.sample(level.right);
    if(level.positive && operator == "-"){
        right = _.min([left + 1, right])
        }

    var text = left + " " + operator + " " + right;
    var answer = String(eval(text));
    return {'text': text, 'answer': answer, 'speed': level.speed, 'color': operator_colors[operator]};
};



function sketchProc(p) {
    var height = 600;
    var width = 1024;
    var num_buckets = 5;
    var buckets = [];
    var problems = [];
    var font_size = 20;
    var answer = '';
    var frame_counter = 0;
    var speed = 1;
    var difficulty = 0;
    var level = 0;
    var number_problems = 0;

    // default font
    var fontA = p.loadFont("Courier New");
    var score = 0;
    p.setup = function() {
        p.size(width, height);
        p.background(0);
        var bucket_width = (width - 120) / num_buckets;
        for(var i=0;i<num_buckets;i++){
            buckets.push(new Bucket(bucket_width, 75, i, height - 80));
        }
        p.smooth();
        p.frameRate(30);
    }
    // main draw loop and helpers

    var add_problem = function(difficulty, level){
        // Add a problem if needed
        var prob = _.findWhere(problems, {state: Problem.prototype.FALLING});
        if(_.isUndefined(prob)){
            var bucket_with_room = _.sample(_.where(buckets, {'full': false})); // randomly pick a bucket that's not stacked up
            if(!_.isUndefined(bucket_with_room)){
                var lev = calculate_level(difficulty, level);
                problems.push(new Problem(bucket_with_room, lev));
                new_snd.play();
                }
            }
    };

    var check_game_over = function(){
        // check to see if the game is over.
        if(_.where(buckets, {'full': true}).length === buckets.length){
            p.fill(Colors.Lime);
            p.textFont(fontA, 150);
            p.text("GAME OVER!", 60, height / 2 + 100);
            p.noLoop();
        }
    };
    
    var game_menu = function(){
        p.fill(Colors.Lime);
        p.textFont(fontA, 20);
        p.text("Score:" + score, width - 120 , height - 65);
        p.text("Level:" + level, width - 120 , height - 40);
        if(answer.length > 0){
            p.fill(Colors.Red);
            p.textFont(fontA, 50);
            p.text(answer, width - 110, 60);
            }
    };
    p.draw = function() {
        // increment the frame counter. Every X num frames we can add a problem/check for game done...
        frame_counter =  (frame_counter + 1) % 90;
        // draw the background
        p.background(Colors.Black);
        // draw buckets
        for(var i=0;i<buckets.length;i++){
            buckets[i].draw(p);
        }
        if(frame_counter === 0){
            var new_level = parseInt(p.frameCount / (30 * 20)); // level based on time
            if(new_level > level){
                level_snd.play();
            }
            level = new_level;
            add_problem(difficulty, level); 
            }
        // Remove zombied problems and draw the rest
        problems = _.filter(problems, function (prob){return prob.zombie < 10;});
        p.textFont(fontA, font_size);
        for(var i=0;i<problems.length;i++){
            var prob = problems[i];
            prob.draw(p);
        }
        game_menu();
        check_game_over();
    };
    
    // handle typing
    p.keyPressed = function(){
        console.log(p.key.code);
        if(p.key.code == 10){
            // Check and see if answer is correct
            var prob = _.findWhere(problems, {'state': Problem.prototype.FALLING});
            if(answer == prob.answer){
                prob.boom();
                score += 1;
                }
            else{
                error_snd.play();
            }
            answer = '';
        }
        else{
            answer += String(p.key);
        }
    };
}
