var calculate_level = function(difficulty, level){
    // ignore difficulty for now.
    levels = [{'speed': 1, operators: ["+"], left: _.range(1, 5), right: _.range(1, 4), positive: true},
              {'speed': 2, operators: ["+"], left: _.range(1, 5), right: _.range(1, 4), positive: true},
              
              {'speed': 1, operators: ["+"], left: _.range(1, 10), right: _.range(1, 10), positive: true},
              {'speed': 2, operators: ["+"], left: _.range(1, 10), right: _.range(1, 10), positive: true},
              
              {'speed': 1, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: true},
              {'speed': 2, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: true},
              {'speed': 3, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: true},

              {'speed': 1, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: false},
              {'speed': 2, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: false},
              {'speed': 3, operators: ["+", "-"], left: _.range(1, 10), right: _.range(1, 10), positive: false}];

    var level = this.levels[level] || _.last(levels);
    var operator = _.sample(level.operators);
    var left = _.sample(level.left);
    var right = _.sample(level.right);
    if(level.positive && operator == "-"){
        right = _.min([left + 1, right])
        }

    var text = left + " " + operator + " " + right;
    var answer = String(eval(text));
    return {'text': text, 'answer': answer, 'speed': level.speed};
};

var Bucket = function(width, height, bucket_number, top){
    this.width = width - 10;
    this.height = height;
    this.num = bucket_number;
    this.y = top;
    this.x = this.num * width + 5;
    this.floor = top + height;
    this.full = false; 
    this.count = 0; // how many problems
    this.max = 2; // max number of problems
    };

Bucket.prototype.draw = function(processing){
    if(this.count > this.max){
        this.full = true;
        processing.fill(Colors.OliveDrab);
        processing.stroke(Colors.Black);
        }
    else{
        processing.fill(Colors.Yellow);
        processing.stroke(Colors.Black);
        }
    processing.rect(this.x, this.y, this.width, this.height );
    };

Bucket.prototype.contained = function(obj){
    return this.floor <= (obj.y + obj.height);
};


var Problem = function(bucket, speed, text, answer){
    this.state = this.FALLING;
    this.width = 110;
    this.height = 30;
    this.y = 0;
    this.x = bucket.x + 1 + Math.random() * (bucket.width - this.width -1); // some fudging
    this.bucket = bucket;
    this.zombie = 0; // counter when dead
    this.speed = speed;
    this.text = text;
    this.answer = answer;
    this.speed = speed;
    };

Problem.prototype.FALLING = 0;
Problem.prototype.STOPPED = 1;
Problem.prototype.KABOOM = 2;

Problem.prototype.boom = function(){
    this.state = this.KABOOM;
};

Problem.prototype.draw = function(processing){
    processing.stroke(0);
    if(this.state === this.FALLING && this.bucket.contained(this)){
        this.state = this.STOPPED;
        this.bucket.floor -= (this.height +3); // raise the level of the bucket
        this.bucket.count += 1; // and tell the bucket its got a problem in it
        }
    else if(this.state === this.FALLING){
        this.y += this.speed;
    }
    else if(this.state === this.KABOOM){
        this.zombie += 1;
        }

    if(this.zombie > 0){
        processing.fill(Colors.Red);
        }
    else{
        processing.fill(Colors.White);
    }
    processing.rect(this.x, this.y, this.width, this.height, 4);
    processing.fill(Colors.Black);
    processing.text(this.text, this.x + 10, this.y + 20);
}

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
        var bucket_width = width / num_buckets;
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
                console.log(lev);
                problems.push(new Problem(bucket_with_room, lev.speed, lev.text, lev.answer));
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
    
    var score_and_answer = function(){
        p.fill(Colors.Lime);
        p.textFont(fontA, 50);
        p.text(score, 10, 60);
        if(answer.length > 0){
            p.fill(Colors.Red);
            p.textFont(fontA, 50);
            p.text(answer, width - 120, 60);
            }
    };
    p.draw = function() {
        // increment the frame counter. Every 30 frames we can add a problem/check for game done...
        frame_counter =  (frame_counter + 1) % 30;
        // draw the background
        p.background(Colors.Black);
        // draw buckets
        for(var i=0;i<buckets.length;i++){
            buckets[i].draw(p);
        }
        if(frame_counter === 0){
            level = parseInt(p.frameCount / (30 * 20)); // level based on time
            add_problem(difficulty, level); 
            }
        // Remove zombied problems and draw the rest
        problems = _.filter(problems, function (prob){return prob.zombie < 10;});
        p.textFont(fontA, font_size);
        for(var i=0;i<problems.length;i++){
            var prob = problems[i];
            prob.draw(p);
        }
        score_and_answer();
        check_game_over();
    };
    
    // handle typing
    p.keyPressed = function(){
        if(p.key.code == 10){
            // Check and see if answer is correct
            var prob = _.findWhere(problems, {'state': Problem.prototype.FALLING});
            if(answer == prob.answer){
                prob.boom();
                score += 1;
                }
            answer = '';
        }
        else{
            answer += String(p.key);
        }
    };
}
