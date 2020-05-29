class MotionList{
    
    /**
    
     Lo/Hi Signal (The first layer)
    
         |
         v
         
    Motion (The second layer)
      
**/
    constructor(){
        this.signalCounter = 0;
        this.mainDecider = 'L';
        this.doesServerGetMotion = false;
    }
    
    // method that allows programmers to add signals obtained from the sensor to the motion list
    add(signalType){
        // Start Time;
        // LO -> HI;
        if(this.mainDecider == 'L' && signalType == 'H'){
            this.incrementSignalCounter();
            this.startTime = Date.now(); // LO -> HI
            this.mainDecider = 'H';
        }

        // End Time;
        // HI -> LO;
        else if(this.mainDecider == 'H' && signalType == 'L'){
            this.concludeSignal();
            this.endTime = Date.now(); // HI -> LO
            this.doesServerGetMotion = true;
            this.mainDecider = 'L';
        }

        // if HI->HI
        // Continuation of length of motion calculation
        else if(this.mainDecider == 'H' && signalType == 'H'){
            this.incrementSignalCounter();
        }
    }
    
    // method that increments the signal counter
    incrementSignalCounter(){
        this.signalCounter ++;
    }
        
    // method that resets the signal counter
    resetSignalCounter(){
        this.signalCounter = 0;
    }
    
    // method that conclude signals into a motion and reset the signal counter
    concludeSignal(){
        this.timeStamp = new Date().toLocaleString("en-US") ; // Current Date Time
        this.resetSignalCounter();
    }
    
    // method that checks whether server gets the motion released
    serverGetsMotion(){
        if(this.doesServerGetMotion==true){
            this.doesServerGetMotion=false;
            return true;
        }return false;
    }
    
    // the getter method of motion start time
    getStartTime(){
        return this.startTime;
    }

    // the getter method of motion end time
    getEndTime(){
        return this.endTime;
    }
    
    // the getter method of time stamp
    getTimeStamp(){
        return this.timeStamp;
    }

    // method that resets class properties
    reset(){
        this.signalCounter = 0;
        this.mainDecider = 'L';
        this.doesServerGetMotion = false;
    }
}

// action that exports this class to let the server use it as a library
module.exports = MotionList;
