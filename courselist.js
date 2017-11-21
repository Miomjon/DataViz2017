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

		for(let course of data) {

			let row = document.createElement("tr");
			row.className = DaViSettings.courseListRowClass;

			let courseName = document.createElement("td");
			courseName.innerHTML = course.name;

			let button = document.createElement("button");
			button.innerHTML = "click";
			button.id = course.name+"_button";

			row.appendChild(button);
			row.appendChild(courseName)
			tbody.appendChild(row);
		}

		table.appendChild(tbody);
	}

	enableCourse(course) {
		if(this.enableCourseList.includes(course)) {
			var index = this.enableCourseList.indexOf(course);
			if (index > -1) {
    		this.enableCourseList.splice(index, 1);
			}
		} else {
				this.enableCourseList.push(course)
		}
		timtable.createTimetable(this.enableCourseList)
	}

}


let courselist = new CourseList()
courselist.createCourseList(ISA_data)
for(let course of ISA_data) {
	document.getElementById(course.name+"_button").onclick = () => courselist.enableCourse(course);
}
//var courseList = new courseList();
//courseList.createTimetable(ISA_data);
