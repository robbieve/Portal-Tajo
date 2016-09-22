// TODO: huge room for optimizations here - locating samaples for time, etc..
//
import createFramePlayer from './chronicleFramePlayer';

const CHRONICLE_LOCAL_INCTANCE_STATE_NONE = 'chronLocStateNone';
const CHRONICLE_LOCAL_INCTANCE_STATE_LOADING = 'chronLocStateLoading';
const CHRONICLE_LOCAL_INCTANCE_STATE_OK_EMPTY = 'chronLocStateOk';
const CHRONICLE_LOCAL_INCTANCE_STATE_OK_DATA = 'chronLocStateEmpty';


function ChronicleVehicleFrame(dateFrom, dateTo, events, inState) {
  if (dateFrom === undefined) {
    this.state = CHRONICLE_LOCAL_INCTANCE_STATE_NONE;
    return;
  }
  this.dateFrom = dateFrom;
  this.dateFrom00 = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate());
  this.dateTo = dateTo;
  this.timeRangeMs = dateTo.getTime() - dateFrom.getTime(); // 24*60*60*1000
  this.posData = [];

  this.temperatureData = [];
  this.minTemp = 300;
  this.maxTemp = -300;

  this.speedData = [];
  this.maxSpeed = 0;

  this.stopEvents = [];

  //
  this.lastFoundIdx = 0;
//    this.indexHint = -1;
  this.state = inState;

  if (events === null) {
    return;
  }
  this.parceData(events);
  this.player = createFramePlayer(this);

  // TODO: ? need more checks here - type of event, etc?
  this.state = this.posData.length > 0 ?
      CHRONICLE_LOCAL_INCTANCE_STATE_OK_DATA
      : CHRONICLE_LOCAL_INCTANCE_STATE_OK_EMPTY;
}

//
//-----------------------------------------------------------------------
//
// STATUS checkers here
//
ChronicleVehicleFrame.prototype.isValid = function( ){
  return this.state === CHRONICLE_LOCAL_INCTANCE_STATE_OK_DATA
      || this.state === CHRONICLE_LOCAL_INCTANCE_STATE_OK_EMPTY;
};

//
//
//-----------------------------------------------------------------------
ChronicleVehicleFrame.prototype.isLoading = function( ){
  return this.state === CHRONICLE_LOCAL_INCTANCE_STATE_LOADING;
};

//
//
//-----------------------------------------------------------------------
ChronicleVehicleFrame.prototype.isEmpty = function( ){
  return this.state === CHRONICLE_LOCAL_INCTANCE_STATE_OK_EMPTY;
};

//
//
//-----------------------------------------------------------------------
ChronicleVehicleFrame.prototype.isStatic = function( ){
// TODO: need more checks here - type of event, etc
  return this.isValid() && this.posData.length === 1;
};

//
//
//-----------------------------------------------------------------------
ChronicleVehicleFrame.prototype.parceData = function(events) {
  if (events.length<10) {
    console.log('history frame for '+this.dateFrom+' - '+this.dateTo);
    console.log('  EMPTY '+events.length);
    return;
  }

  let _dbgTime = 0;
  const dataSize = events.length;
  for (var i=0; i<dataSize; ++i) {
    const theEvent = events[i];
    const eventDate = new Date(theEvent.ev.ts);
    const eventTimeMs = eventDate.getTime() - this.dateFrom.getTime();
    _dbgTime = eventTimeMs;
    switch(theEvent.type){
      case 'vehicle-position':
        this.posData.push({ timeMs: eventTimeMs,
          pos: window.L.latLng(theEvent.ev.pos.latlon.lat, theEvent.ev.pos.latlon.lng) });
        this.speedData.push({ timeMs: eventTimeMs, v: theEvent.ev.pos.speed });
        this.maxSpeed = Math.max(this.maxSpeed, theEvent.ev.pos.speed);
        break;
      case 'vehicle-1wire-temperature':
        if( theEvent.ev.tempInfo!=null && !isNaN(theEvent.ev.tempInfo) ){
          this.temperatureData.push({timeMs: eventTimeMs, t: theEvent.ev.tempInfo});
          this.maxTemp = Math.max( this.maxTemp, theEvent.ev.tempInfo );
          this.minTemp = Math.min( this.minTemp, theEvent.ev.tempInfo );
        }
        break;
      case 'vehicle-stop-stats': {
        // skip too short stops on the history
        const stopMinutes = theEvent.ev.stopPeriod / (1000 * 60);
        if (stopMinutes < 2) {
          continue;
        }
        this.stopEvents.push({ timeMs: eventTimeMs,
            date: eventDate,
            pos: window.L.latLng(theEvent.ev.pos.latlon.lat, theEvent.ev.pos.latlon.lng),
            period: theEvent.ev.stopPeriod,
            dateStr: theEvent.ev.pos.posTime });
        break;
      }
    }
  }

  var firstSample = this.posData[0];
  this.posData.splice(0, 0, { timeMs: 0,
                              pos: firstSample.pos});
  this.speedData.splice(0, 0, {timeMs: 0, v: 0});

  var lastSample = this.posData[this.posData.length-1];
  this.posData.push({timeMs: lastSample.timeMs+1,
    pos: lastSample.pos});
  this.speedData.push({timeMs: lastSample.timeMs+1, v: 0});

  console.log('history frame for '+this.dateFrom+' - '+this.dateTo);
  console.log(' dataTimeRangeMs '+_dbgTime+' of '+  this.timeRangeMs );
  console.log('  history frame total: '+dataSize+' pos: '+this.posData.length+' temp: '+this.temperatureData.length);
  console.log('  -- stops: '+this.stopEvents.length);
  console.log(' temp range '+this.minTemp+' .. '+this.maxTemp);
  console.log(' maxSpeed '+this.maxSpeed);
}

//
//
//-----------------------------------------------------------------------
ChronicleVehicleFrame.prototype.kill = function( ){
  // if(this.player!=null)
  //   this.player.kill();
  // this.player = null;
}

//
//
//-----------------------------------------------------------------------
ChronicleVehicleFrame.prototype.getDateAtMs = function( timeMs ){
  var aDate = new Date(timeMs + this.dateFrom00.getTime());
  return aDate;
}


//
//
//-----------------------------------------------------------------------
ChronicleVehicleFrame.prototype.getSpeedAtMs = function( timeMs ){
  var speedSample =this.findSample( Math.floor(timeMs), this.speedData);
  return speedSample.v;
}
//
//
//-----------------------------------------------------------------------
ChronicleVehicleFrame.prototype.getSpeedAtIdx = function( idx ){
  return this.speedData[idx===undefined ? this.lastFoundIdx : idx].v;
}

//
//
//-----------------------------------------------------------------------
ChronicleVehicleFrame.prototype.getPosAtMs = function( timeMs ){
  var posSample =this.findSample( Math.floor(timeMs), this.posData);
  return posSample.pos;
}
//
//
//-----------------------------------------------------------------------
ChronicleVehicleFrame.prototype.getTemperatureAtMs = function( timeMs ){
  var tempSample =this.findSample( Math.floor(timeMs), this.temperatureData);
  return tempSample.t;
}
//
//
//-----------------------------------------------------------------------
ChronicleVehicleFrame.prototype.hasTemperature = function( ){
  return this.temperatureData.length>5;
}

//
//
//-----------------------------------------------------------------------
ChronicleVehicleFrame.prototype.findSample = function( requestMs, data ){

  if( requestMs<=0 )
    return data[0];
  var dataSz = data.length;
  var dataIdx = Math.min( dataSz-1,  Math.floor(dataSz * requestMs/this.timeRangeMs));
  var stepDir = requestMs<data[dataIdx].timeMs ? -1 : 1;

  for(; dataIdx>=0 && dataIdx<dataSz-1; dataIdx+=stepDir)
  if( data[dataIdx].timeMs<=requestMs && data[dataIdx+1].timeMs>requestMs ){
      this.lastFoundIdx = dataIdx;
    //interpolate here?
      return data[dataIdx];
  }
  return (dataIdx<0) ? data[0] : data[dataSz-1];
}
//
//
//-----------------------------------------------------------------------

export default function createHistoryFrame(dateFrom, dateTo,
  events = null, isLoading = false) {
  return new ChronicleVehicleFrame(dateFrom, dateTo, events,
      isLoading ? CHRONICLE_LOCAL_INCTANCE_STATE_LOADING : CHRONICLE_LOCAL_INCTANCE_STATE_NONE);
}