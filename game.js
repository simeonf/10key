var DEBUG = false;

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
        processing.fill(100);
        processing.stroke(255, 0, 0);
        }
    else{
        processing.fill(200);
        processing.stroke(255);
        }
    processing.rect(this.x, this.y, this.width, this.height );
    processing.fill(255, 0, 0);
    };

Bucket.prototype.contained = function(obj){
    return this.floor <= (obj.y + obj.height);
};


var Problem = function(width, height, bucket){
    var operator = _.sample(["+", "-"]);
    var left = _.sample(_.range(0, 9));
    var right = _.sample(_.range(0, 9));
    this.text = left + " " + operator + " " + right;
    this.answer = String(eval(this.text));
    this.state = this.FALLING;
    this.speed = 3;
    this.y = 0;
    this.x = bucket.x + 1 + Math.random() * (bucket.width - width -1); // some fudging
    this.width = width;
    this.height = height;
    this.bucket = bucket;
    this.zombie = 0; // counter when dead
    };

Problem.prototype.FALLING = 0;
Problem.prototype.STOPPED = 1;
Problem.prototype.KABOOM = 2;

Problem.prototype.boom = function(){
    this.state = this.KABOOM;
};

Problem.prototype.draw = function(processing){
    processing.fill(0, 176, 86);
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
        processing.fill(255, 0, 0);
        }
    else{
        processing.fill(255);
    }
    processing.rect(this.x, this.y, this.width, this.height, 4);
    processing.fill(0);
    processing.text(this.text, this.x + 10, this.y + 20);
}

function sketchProc(p) {
    var height = 600;
    var width = 1024;
    var num_buckets = 5;
    var buckets = [];
    var problems = [];
    var font_size = 20;
    // default font
    var fontA = p.loadFont("Courier New");
    var score = 0;
    p.textFont(fontA, font_size);

    p.setup = function() {
       p.size(width, height);
       p.background(0);
       var bucket_width = width / num_buckets;
       for(var i=0;i<num_buckets;i++){
           buckets.push(new Bucket(bucket_width, 75, i, height - 80));
       }
       p.smooth();
    }
    var add_problem = function(){
        // Add a problem if needed
        var prob = _.findWhere(problems, {state: Problem.prototype.FALLING});
        if(_.isUndefined(prob)){
            var bucket_with_room = _.sample(_.where(buckets, {'full': false})); // randomly pick a bucket that's not stacked up
            if(!_.isUndefined(bucket_with_room)){
                problems.push(new Problem(150, 30, bucket_with_room));
                }
            }
    };

    var check_game_over = function(){
        // check to see if the game is over.
        if(_.where(buckets, {'full': true}).length === buckets.length){
            p.fill(0, 255, 0);
            p.textFont(fontA, 150);
            p.text("GAME OVER!", 60, height / 2 + 100);
            p.noLoop();
        }
    };
    
    // main draw loop
    var answer = '';
    var frame_counter = 0;
    p.draw = function() {
        // draw the background
        p.background(0);
        // draw buckets
        for(var i=0;i<buckets.length;i++){
            buckets[i].draw(p);
        }
        
        // Add a problem if needed
        add_problem();
        
        // Remove zombied problems and draw the rest
        problems = _.filter(problems, function (prob){return prob.zombie < 10;});
        for(var i=0;i<problems.length;i++){
            var prob = problems[i];
            prob.draw(p);
        }
        // Draw current answer and score
        // Draw score
        p.fill(0, 255, 0);
        p.textFont(fontA, 50);
        p.text(score, 10, 60);
        if(answer.length > 0){
            p.fill(255, 0, 0);
            p.textFont(fontA, 50);
            p.text(answer, width - 120, 60);
            }
        p.textFont(fontA, font_size);
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
