
function createTimetable() {

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
	
	for(course of ISA_data){
		for(timeslot of course.timeslots){
			id = "courseCell"+timeslot.time+"_"+timeslot.day;
			cell = document.getElementById(id);
			cell.innerHTML = course.name;
		}
		
	}
	

}
createTimetable()