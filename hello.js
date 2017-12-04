


function transition(oneStep, onEnd){
	let keepGoing = oneStep()
	if(keepGoing)
		setTimeout(()=>transition(oneStep,onEnd), 16)
	else if(typeof onEnd !== 'undefined') {
		onEnd();
	}
}

function rescale(elem,width,height,time, onEnd){

	let eWidth = elem.offsetWidth;
	let eHeight = elem.offsetHeight;

	let dw = (width-eWidth)/time * 16;
	let dh = (height-eHeight)/time * 16;
	let timeStart = new Date().getTime();
	function oneStep () {

		let widthBefor = elem.offsetWidth
		let heightBefor = elem.offsetHeight

		let wideEnought = false;
		let highEnought = false;

		let dt = new Date().getTime() - timeStart;
		if(dt >= time){
			elem.offsetWidth = width;
			elem.offsetHeight = height;
			return false;
		}

		if((width-elem.offsetWidth - dw)* dw <= 0 ) {
			wideEnought = true;
			elem.offsetWidth = width;
		}else{

			elem.style.width = widthBefor+ dw+"px";
		}
		if((height-elem.offsetHeight - dh)* dh <= 0 ) {
			highEnought = true;
			elem.offsetHeight = height;
		}else{

			elem.style.height  = heightBefor+ dh+"px"
		}
		return !wideEnought || !highEnought;
	}
	transition(oneStep,onEnd);
}

class TimeTable{

	constructor() {
	    this.isDisplayBig = false;
  	}
	createCell(cellKey) {

		let id =  DaViSettings.cellId+cellKey;
		let cell = document.createElement("td");
		let cellDiv = document.createElement("div");
		cell.id = id;
		cell.className = DaViSettings.cellDefaultClass;

		cellDiv.id = DaViSettings.cellDivId+cellKey;
		cell.appendChild(cellDiv)

		let cellA = document.createElement("a");
		cellA.id = DaViSettings.cellAId+cellKey;
		cellDiv.appendChild(cellA)
		return cell;
	}

	createTimetable(data,showAll) {

		let tableH = DaViSettings.dayEnd - DaViSettings.dayStart;

		let table = document.getElementById (DaViSettings.timeTableId);
		table.innerHTML = ''
		let tbody = document.createElement("tbody");
		let titlerow =  document.createElement("tr");
		let topLeft = document.createElement("th");
		titlerow.appendChild(topLeft)
		for (let day of DaViSettings.days) {
			let cell = document.createElement("th");
			cell.innerHTML = day;
			titlerow.appendChild(cell)
		}
		tbody.appendChild(titlerow)
		for(var i =0;i< tableH; i++ ) {
			let row = document.createElement("tr");
			row.className = DaViSettings.timetableRowClass;
			let hourCell = document.createElement("td");
			hourCell.innerHTML = i+DaViSettings.dayStart;

			row.appendChild(hourCell)
			for(var j =0;j< DaViSettings.days.length; j++ ){
				let cell = this.createCell(i+"_"+j);
				cell.className = DaViSettings.cellDefaultClass;
				row.appendChild(cell)
			}
			tbody.appendChild(row);
		}

		table.appendChild(tbody);

		for(let [name,course] of data){

			let sortedSlots = course.timeslots.sort(ts => ts.day*100 + ts.time);
			sortedSlots.reverse()
			let lastActivity = -1;
			let lastTime = 0;
			let lastCell = null;
			for(let timeslot of sortedSlots){

				let activity = timeslot.activity;
				let time = timeslot.time;

				let key = timeslot.time+"_"+timeslot.day
				let id = DaViSettings.cellId+ key;
				let cell = document.getElementById(id);

				if(lastCell !==null && activity === lastActivity && lastTime +1=== time) {
					lastTime = time;
					lastCell.rowSpan  = (lastCell.rowSpan  + 1) | 2;
					cell.parentNode.removeChild(cell);

				}
				else{
					lastTime = time;
					lastActivity = activity;
					lastCell = cell;
					let coursA = cell.querySelector("#"+DaViSettings.cellAId+key);
					if(showAll) {
						coursA.innerHTML = name+"\n"+timeslot.room;
					}else{
						coursA.innerHTML = name;
					}

					switch(timeslot.activity) {
				    case 0:
				        lastCell.className = DaViSettings.cellCourseClass;
				        break;
				    case 1:
				        lastCell.className = DaViSettings.cellExerciseClass;
				        break;
				    default:
				        lastCell.className = DaViSettings.cellDefaultClass;
					}
				}
			}

		}

	}

	swithDisplayMode(){
		let table = document.getElementById(DaViSettings.timeTableDivId);
		let button = document.getElementById(DaViSettings.rescaleTableButtonId);
		if(this.isDisplayBig){
			button.innerHTML = '';
			rescale(button,20,0,100, ()=>{
				timtable.createTimetable(data_map,false)
				rescale(
					table,
					DaViSettings.tableDimSmall[0],
					DaViSettings.tableDimSmall[1],
					200,
					()=>{

						rescale(button,20,25,100,()=>button.innerHTML = '<b>   ➕   </b> ');
					}
				);
			});
			this.isDisplayBig = false;
		}else{
			button.innerHTML = '';
			rescale(button,20,0,100,()=>{
				rescale(
					table,
					DaViSettings.tableDimBig[0],
					DaViSettings.tableDimBig[1],
					200,
					()=>{
						timtable.createTimetable(data_map,true);
						rescale(button,20,25,100,()=>button.innerHTML = '<b>   ➖   </b>');
					}
				);
			});
			this.isDisplayBig = true;
		}
	}

}


let timtable = new TimeTable()
timtable.createTimetable([],false)
testThing =document.getElementById(DaViSettings.rescaleTableButtonId)
testThing.onclick = timtable.swithDisplayMode;

//var courseList = new courseList();
//courseList.createTimetable(ISA_data);
