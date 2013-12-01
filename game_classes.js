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
        processing.fill(Colors.DimGray);
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

var explosion_snd = new Audio("resources/explosion.wav");
var land_snd = new Audio("resources/land.wav");
var new_snd = new Audio("resources/new.wav");

var Problem = function(bucket, config){
    this.state = this.FALLING;
    this.width = 110;
    this.height = 30;
    this.y = 0;
    this.x = bucket.x + 1 + Math.random() * (bucket.width - this.width -1); // some fudging
    this.bucket = bucket;
    this.zombie = 0; // counter when dead
    this.text = config.text;
    this.answer = config.answer;
    this.speed = config.speed;
    this.color = config.color;
    };

Problem.prototype.FALLING = 0;
Problem.prototype.STOPPED = 1;
Problem.prototype.KABOOM = 2;

Problem.prototype.boom = function(){
    explosion_snd.play();
    this.state = this.KABOOM;
};

Problem.prototype.draw = function(processing){
    processing.stroke(0);
    if(this.state === this.FALLING && this.bucket.contained(this)){
        this.state = this.STOPPED;
        this.bucket.floor -= (this.height +3); // raise the level of the bucket
        this.bucket.count += 1; // and tell the bucket its got a problem in it
        land_snd.play();
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
        processing.fill(this.color);
    }
    processing.rect(this.x, this.y, this.width, this.height, 4);
    processing.fill(Colors.Black);
    processing.text(this.text, this.x + 10, this.y + 20);
};
