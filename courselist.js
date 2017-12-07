function buildMap(obj) {
    let map = new Map();
    Object.keys(obj).forEach(key => {
        map.set(key, obj[key]);
    });
    return map;
}

function isIterable(obj) {
  // checks for null and undefined
  if (obj == null) {
    return false;
  }
  return typeof obj[Symbol.iterator] === 'function';
}

class CourseList {

	constructor() {
		this.enableCourseList = [];
    this.coursesInList = [];
    this.conflictList = new Map();
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
      courseName.id = course + "_button";
      courseName.style.background =  "#f6f6f6"
      courseName.className = DaViSettings.cellCourseRow;

			row.appendChild(courseName)
			tbody.appendChild(row);
		}

		table.appendChild(tbody);
	}

	enableCourse(c) {
		if(this.coursesInList.includes(c)) {
			var index = this.coursesInList.indexOf(c);
			if (index > -1) {
    		this.enableCourseList.splice(index, 1);
        this.coursesInList.splice(index, 1);
        timtable.removeCourse(c);
        var wasOrange = false;
        for(let conflict of this.conflictList.get(c)) {
          if(document.getElementById(conflict+"_button").style.background === "orange"||document.getElementById(conflict+"_button").style.background === "green") {
            document.getElementById(conflict+"_button").style.background = "green";
            wasOrange = true;
          } else {
            document.getElementById(conflict+"_button").style.background = "#f6f6f6"
          }
        }
        if(wasOrange) {
          document.getElementById(c+"_button").style.background = "red";
        } else {
          document.getElementById(c+"_button").style.background = "#f6f6f6"
        }
      }
		} else {
				this.enableCourseList.push(c)
        this.coursesInList.push(c)
        timtable.addCourse(c);
        var wasGreen = false;
        for(let conflict of this.conflictList.get(c)) {
          if(document.getElementById(conflict+"_button").style.background === "green" || document.getElementById(conflict+"_button").style.background === "orange") {
            document.getElementById(conflict+"_button").style.background = "orange";
            wasGreen = true;
          } else {
            document.getElementById(conflict+"_button").style.background = "red"
          }
        }
        if(wasGreen) {
          document.getElementById(c+"_button").style.background = "orange";
        } else {
          document.getElementById(c+"_button").style.background = "green";
        }
		}
    for(let conf of this.enableCourseList) {
      var goesOrange = false;
      if(isIterable(conf)) {
        // console.log(Array.from(this.conflictList.get(conf)))
        for(let list of this.conflictList.get(conf)) {
          console.log(list);
          if(document.getElementById(list+"_button").style.background === "green" || document.getElementById(list+"_button").style.background === "orange") {
            document.getElementById(list+"_button").style.background = "orange";
            goesOrange = true;
          } else {
            document.getElementById(list+"_button").style.background = "red"
          }
        }
        if(goesOrange) {
          document.getElementById(conf+"_button").style.background = "orange"
        } else {
          document.getElementById(conf+"_button").style.background = "green"
        }
      }
    }
	}

// remove and do a function that precomputes the conflicts for each course
  conflicts(data) {
    for(let [course, metadata] of data) {
      var list = [];
      for(let [otherCourse, otherMetadata] of data) {
        if(course !== otherCourse) {
          for(let timeslot of metadata.timeslots) {
            for(let otherTimeslot of otherMetadata.timeslots) {
              if(timeslot.day === otherTimeslot.day && timeslot.time === otherTimeslot.time) {
                list.push(otherCourse);
              }
            }
          }
        }
      }
      var uniqueList = list.filter(function(item, pos, self) {
          return self.indexOf(item) == pos;
      })
      this.conflictList.set(course, uniqueList);
    }
  }

}


let courselist = new CourseList()
let data_map = buildMap(ISA_data);
courselist.createCourseList(data_map)
courselist.conflicts(data_map)
for(let [course, metadata] of data_map) {
	document.getElementById(course+"_button").onclick = () => courselist.enableCourse(course);
}
//var courseList = new courseList();
//courseList.createTimetable(ISA_data);
