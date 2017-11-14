
function createTimetable(data) {

	let tableH = DaViSettings.dayEnd - DaViSettings.dayStart;

	let table = document.getElementById (DaViSettings.timeTableId);
	tbody = document.createElement("tbody");
	let titlerow =  document.createElement("tr");
	let topLeft = document.createElement("th");
	titlerow.appendChild(topLeft)
	for (day of DaViSettings.days) {
		let cell = document.createElement("th");
		cell.innerHTML = day;
		titlerow.appendChild(cell)
	}
	tbody.appendChild(titlerow)
	for(var i =0;i< tableH; i++ ) {
		let row = document.createElement("tr");
		let hourCell = document.createElement("td");
		hourCell.innerHTML = i+DaViSettings.dayStart;

		row.appendChild(hourCell)
		for(var j =0;j< DaViSettings.days.length; j++ ){
			let id = "courseCell"+i+"_"+j;
			let cell = document.createElement("td");
			cell.id = id;
			cell.className = DaViSettings.cellDefaultClass;
			row.appendChild(cell)
		}
		tbody.appendChild(row);
	}

	table.appendChild(tbody);

	for(course of data){
		let sortedSlots = course.timeslots.sort(ts => ts.day*100 + ts.time);
		sortedSlots.reverse()
		console.log(sortedSlots)
		let lastActivity = -1;
		let lastTime = 0;
		let lastCell = null;
		for(timeslot of sortedSlots){

			activity = timeslot.activity;
			time = timeslot.time;
			id = "courseCell"+timeslot.time+"_"+timeslot.day;

			if(lastCell !==null && activity === lastActivity && lastTime +1=== time) {
				lastTime = time;
				lastCell.rowSpan  = (lastCell.rowSpan  + 1) | 2;
				elem = document.getElementById(id);
				elem.parentNode.removeChild(elem);

			}
			else{
				lastTime = time;
				lastActivity = activity;
				lastCell = document.getElementById(id);
				lastCell.innerHTML = course.name;
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
createTimetable(ISA_data)
