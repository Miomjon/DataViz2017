function buildMap(obj) {
    let map = new Map();
    Object.keys(obj).forEach(key => {
        map.set(key, obj[key]);
    });
    return map;
}

class CourseList {

	constructor() {
		this.enableCourseList = [];
	}

	createCourseList(data) {

		let table = document.getElementById(DaViSettings.courseListId);

		let tbody = document.createElement("tbody");
		let titlerow =  document.createElement("tr");
		let cell = document.createElement("th");
		cell.innerHTML = "Courses";

		titlerow.appendChild(cell)
		tbody.appendChild(titlerow)

		for(let [course, metadata] of data) {

			let row = document.createElement("tr");
			row.className = DaViSettings.courseListRowClass;

			let courseName = document.createElement("td");
			courseName.innerHTML = course;

			let button = document.createElement("button");
			button.innerHTML = "click";
			button.id = course+"_button";

			row.appendChild(button);
			row.appendChild(courseName)
			tbody.appendChild(row);
		}

		table.appendChild(tbody);
	}

	enableCourse(metadata) {
		if(this.enableCourseList.includes(metadata)) {
			var index = this.enableCourseList.indexOf(metadata);
			if (index > -1) {
    		this.enableCourseList.splice(index, 1);
			}
		} else {
				this.enableCourseList.push(metadata)
		}
		timtable.createTimetable(this.enableCourseList)
	}

}


let courselist = new CourseList()
let data_map = buildMap(ISA_data);
courselist.createCourseList(data_map)
for(let [course, metadata] of data_map) {
	document.getElementById(course+"_button").onclick = () => courselist.enableCourse([course, metadata]);
}
//var courseList = new courseList();
//courseList.createTimetable(ISA_data);
