


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
	function oneStep () {

		let widthBefor = elem.offsetWidth
		let heightBefor = elem.offsetHeight
		elem.style.width = widthBefor+ dw+"px"
		elem.style.height  = heightBefor+ dh+"px"

		let wideEnought = false;
		let highEnought = false;

		if(Math.abs(elem.offsetWidth - width)< Math.abs(dw)) {
			wideEnought = true;
			elem.offsetWidth = width;
		}
		if(Math.abs(elem.offsetHeight - height)< Math.abs(dh)) {
			highEnought = true;
			elem.offsetHeight = height;
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

		for(let course of data){
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
						coursA.innerHTML = course.name+"\n"+timeslot.room;
					}else{
						coursA.innerHTML = course.name;
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
		if(this.isDisplayBig){
			console.log("plop")
			timtable.createTimetable(ISA_data,false)
			rescale(table,DaViSettings.tableDimSmall[0],DaViSettings.tableDimSmall[1],200);
			this.isDisplayBig = false;
		}else{
			rescale(table,DaViSettings.tableDimBig[0],DaViSettings.tableDimBig[1],200,()=>timtable.createTimetable(ISA_data,true));
			this.isDisplayBig = true;

		}
		
	}
	
}

var timtable = new TimeTable()
timtable.createTimetable(ISA_data,false)
testThing =document.getElementById(DaViSettings.rescaleTableButtonId) 
testThing.onclick = timtable.swithDisplayMode;

